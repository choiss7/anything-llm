const { v4: uuidv4 } = require("uuid");
const moment = require("moment");

// Mock EventLogs object for demonstration purposes
const EventLogs = {
  logEvent: (eventName, details) => {
    if (eventName === "StreamEnd") {
      console.log(`[${eventName}]`, details);
    }
  },
};

function clientAbortedHandler(resolve, fullText) {
  EventLogs.logEvent("StreamAborted", { fullText });
  console.log(
    "\x1b[43m\x1b[34m[STREAM ABORTED]\x1b[0m Client requested to abort stream. Exiting LLM stream handler early."
  );
  resolve(fullText);
  return;
}

/**
 * Handles the default stream response for a chat.
 * @param {import("express").Response} response
 * @param {import('./LLMPerformanceMonitor').MonitoredStream} stream
 * @param {Object} responseProps
 * @returns {Promise<string>}
 */
function handleDefaultStreamResponseV2(response, stream, responseProps) {
  const { uuid = uuidv4(), sources = [] } = responseProps;

  EventLogs.logEvent("StreamStart", { uuid, sources });

  let hasUsageMetrics = false;
  let usage = {
    completion_tokens: 0,
  };

  return new Promise(async (resolve) => {
    let fullText = "";

    const handleAbort = () => {
      stream?.endMeasurement(usage);
      clientAbortedHandler(resolve, fullText);
    };
    response.on("close", handleAbort);

    try {
      for await (const chunk of stream) {
        const message = chunk?.choices?.[0];
        const token = message?.delta?.content;

        if (
          chunk.hasOwnProperty("usage") &&
          !!chunk.usage &&
          Object.values(chunk.usage).length > 0
        ) {
          if (chunk.usage.hasOwnProperty("prompt_tokens")) {
            usage.prompt_tokens = Number(chunk.usage.prompt_tokens);
          }

          if (chunk.usage.hasOwnProperty("completion_tokens")) {
            hasUsageMetrics = true;
            usage.completion_tokens = Number(chunk.usage.completion_tokens);
          }
        }

        if (token) {
          fullText += token;
          if (!hasUsageMetrics) usage.completion_tokens++;
          writeResponseChunk(response, {
            uuid,
            sources: [],
            type: "textResponseChunk",
            textResponse: token,
            close: false,
            error: false,
          });
        }

        if (
          message?.hasOwnProperty("finish_reason") &&
          message.finish_reason !== "" &&
          message.finish_reason !== null
        ) {
          writeResponseChunk(response, {
            uuid,
            sources,
            type: "textResponseChunk",
            textResponse: "",
            close: true,
            error: false,
          });
          response.removeListener("close", handleAbort);
          stream?.endMeasurement(usage);
          resolve(fullText);
          break;
        }
      }
    } catch (e) {
      console.log(`\x1b[43m\x1b[34m[STREAMING ERROR]\x1b[0m ${e.message}`);
      writeResponseChunk(response, {
        uuid,
        type: "abort",
        textResponse: null,
        sources: [],
        close: true,
        error: e.message,
      });
      stream?.endMeasurement(usage);
      resolve(fullText);
    }

    EventLogs.logEvent("StreamEnd", { uuid, fullText, usage });
  });
}

function convertToChatHistory(history = []) {
  const formattedHistory = [];
  for (const record of history) {
    const { prompt, response, createdAt, feedbackScore = null, id } = record;
    const data = JSON.parse(response);

    if (typeof prompt !== "string") {
      continue;
    } else if (typeof data.text !== "string") {
      continue;
    }

    formattedHistory.push([
      {
        role: "user",
        content: prompt,
        sentAt: moment(createdAt).unix(),
        attachments: data?.attachments ?? [],
        chatId: id,
      },
      {
        type: data?.type || "chart",
        role: "assistant",
        content: data.text,
        sources: data.sources || [],
        chatId: id,
        sentAt: moment(createdAt).unix(),
        feedbackScore,
        metrics: data?.metrics || {},
      },
    ]);
  }

  EventLogs.logEvent("ChatHistoryConverted", { history, formattedHistory });
  return formattedHistory.flat();
}

function convertToPromptHistory(history = []) {
  const formattedHistory = [];
  for (const record of history) {
    const { prompt, response } = record;
    const data = JSON.parse(response);

    if (typeof prompt !== "string") {
      continue;
    } else if (typeof data.text !== "string") {
      continue;
    }

    formattedHistory.push([
      { role: "user", content: prompt },
      { role: "assistant", content: data.text },
    ]);
  }
  EventLogs.logEvent("PromptHistoryConverted", { history, formattedHistory });
  return formattedHistory.flat();
}

function writeResponseChunk(response, data) {
  response.write(`data: ${JSON.stringify(data)}\n\n`);
  return;
}

module.exports = {
  handleDefaultStreamResponseV2,
  convertToChatHistory,
  convertToPromptHistory,
  writeResponseChunk,
  clientAbortedHandler,
};
