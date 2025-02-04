const { v4: uuidv4 } = require("uuid");
const { Document } = require("../../../models/documents");
const { Telemetry } = require("../../../models/telemetry");
const { Workspace } = require("../../../models/workspace");
const {
  getLLMProvider,
  getEmbeddingEngineSelection,
} = require("../../../utils/helpers");
const { reqBody } = require("../../../utils/http");
const { validApiKey } = require("../../../utils/middleware/validApiKey");
const { EventLogs } = require("../../../models/eventLogs");
const {
  OpenAICompatibleChat,
} = require("../../../utils/chats/openaiCompatible");
const fs = require('fs');
const path = require('path');

// EventLogs에 파일 로깅 기능 추가
const originalLogEvent = EventLogs.logEvent;
EventLogs.logEvent = async function(eventName, details) {
  // 기존 로깅 실행
  await originalLogEvent.call(this, eventName, details);
  
  // 파일 로깅 추가
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: eventName,
    details: details
  };
  
  try {
    // 절대 경로로 logs 디렉토리 지정
    const logDir = path.resolve(__dirname, '../../../logs');
    console.log('Creating log directory at:', logDir); // 디버깅용 로그
    
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      console.log('Log directory created successfully'); // 디버깅용 로그
    }
    
    const logPath = path.join(logDir, 'chat.log');
    fs.appendFileSync(
      logPath,
      JSON.stringify(logEntry, null, 2) + '\n---\n',
      'utf8'
    );
    console.log('Log written to:', logPath); // 디버깅용 로그
  } catch (error) {
    console.error('Failed to write to log file:', error);
    console.error('Error details:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
  }
};

/**
 * OpenAI 호환 API 엔드포인트를 정의하며,
 * 모델 관리, 채팅 완료, 임베딩, 벡터 저장소 관련 기능을 제공합니다.
 * @param {object} app - Express 애플리케이션 인스턴스.
 */
function apiOpenAICompatibleEndpoints(app) {
  if (!app) return;

  /**
   * GET /v1/openai/models
   * 사용 가능한 모든 모델(워크스페이스)을 가져옵니다.
   * 요청 및 응답 데이터를 로깅합니다.
   */
  app.get("/v1/openai/models", [validApiKey], async (request, response) => {
    try {
      const data = [];
      const workspaces = await Workspace.where();
      for (const workspace of workspaces) {
        const provider = workspace?.chatProvider ?? process.env.LLM_PROVIDER;
        let LLMProvider = getLLMProvider({
          provider,
          model: workspace?.chatModel,
        });
        data.push({
          name: workspace.name,
          model: workspace.slug,
          llm: {
            provider: provider,
            model: LLMProvider.model,
          },
        });
      }

      await EventLogs.logEvent("api_get_models", {
        request: {},
        response: { data },
      });

      return response.status(200).json({ data });
    } catch (e) {
      console.error(e.message, e);
      await EventLogs.logEvent("api_get_models_error", {
        request: {},
        error: e.message,
      });
      response.sendStatus(500).end();
    }
  });

  /**
   * POST /v1/openai/chat/completions
   * 지정된 워크스페이스와 채팅을 수행합니다.
   * 스트리밍 및 비스트리밍 모드를 지원합니다.
   * 요청 및 응답 데이터를 로깅합니다.
   */
  app.post(
    "/v1/openai/chat/completions",
    [validApiKey],
    async (request, response) => {
      try {
        const {
          model,
          messages = [],
          temperature,
          stream = false,
        } = reqBody(request);

        // 1. 프론트엔드로부터 받은 요청 로깅
        await EventLogs.logEvent("frontend_request", {
          timestamp: new Date().toISOString(),
          endpoint: "/v1/openai/chat/completions",
          requestBody: {
            model,
            messages,
            temperature,
            stream
          }
        });

        const workspace = await Workspace.get({ slug: String(model) });
        if (!workspace) {
          await EventLogs.logEvent("workspace_error", {
            error: "Invalid workspace",
            requestedModel: model
          });
          return response.status(401).end();
        }

        // 2. LLM 설정 정보 로깅
        await EventLogs.logEvent("llm_config", {
          provider: workspace.chatProvider,
          model: workspace.chatModel,
          workspace: workspace.name
        });

        const userMessage = messages.pop();
        const systemPrompt = messages.find((chat) => chat.role === "system")?.content ?? null;
        const history = messages.filter((chat) => chat.role !== "system") ?? [];

        // 3. LLM으로 보내는 요청 로깅
        await EventLogs.logEvent("llm_request", {
          timestamp: new Date().toISOString(),
          provider: workspace.chatProvider,
          model: workspace.chatModel,
          request: {
            systemPrompt,
            history,
            userMessage: userMessage.content,
            temperature: Number(temperature)
          }
        });

        if (!stream) {
          // 동기 응답 처리
          const chatResult = await OpenAICompatibleChat.chatSync({
            workspace,
            systemPrompt,
            history,
            prompt: userMessage.content,
            temperature: Number(temperature),
          });

          // 4. LLM으로부터 받은 응답 로깅
          await EventLogs.logEvent("llm_response", {
            timestamp: new Date().toISOString(),
            provider: workspace.chatProvider,
            model: workspace.chatModel,
            response: chatResult,
            tokensUsed: chatResult.usage || 'N/A'
          });

          const aiResponse = chatResult.choices?.[0]?.message?.content || chatResult.text || "No response";

          // 5. 프론트엔드로 보내는 최종 응답 로깅
          await EventLogs.logEvent("frontend_response", {
            timestamp: new Date().toISOString(),
            type: "sync",
            response: {
              workspaceName: workspace.name,
              chatModel: workspace.chatModel,
              input: {
                message: userMessage.content,
                attachments: []
              },
              output: aiResponse,
              systemPrompt,
              history: history.map(chat => ({
                role: chat.role,
                content: chat.content,
                timestamp: chat.timestamp || new Date().toISOString()
              }))
            }
          });

          return response.status(200).json(chatResult);
        }

        // 스트리밍 응답 처리
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Content-Type", "text/event-stream");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Connection", "keep-alive");
        response.flushHeaders();

        let streamedResponse = '';
        let streamStartTime = new Date().toISOString();

        // 6. 스트리밍 시작 로깅
        await EventLogs.logEvent("stream_start", {
          timestamp: streamStartTime,
          provider: workspace.chatProvider,
          model: workspace.chatModel
        });

        await OpenAICompatibleChat.streamChat({
          workspace,
          systemPrompt,
          history,
          prompt: userMessage.content,
          temperature: Number(temperature),
          response,
          onChunk: (chunk) => {
            if (chunk?.choices?.[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              streamedResponse += content;

              // 7. 각 청크 로깅
              EventLogs.logEvent("stream_chunk", {
                timestamp: new Date().toISOString(),
                chunkContent: content,
                provider: workspace.chatProvider,
                model: workspace.chatModel
              });
            }
          }
        });

        // 8. 스트리밍 완료 로깅
        await EventLogs.logEvent("stream_complete", {
          timestamp: new Date().toISOString(),
          streamStartTime,
          provider: workspace.chatProvider,
          model: workspace.chatModel,
          finalResponse: streamedResponse,
          history: history.map(chat => ({
            role: chat.role,
            content: chat.content,
            timestamp: chat.timestamp || new Date().toISOString()
          }))
        });

        response.end();
      } catch (e) {
        // 9. 에러 로깅
        console.error(e.message, e);
        await EventLogs.logEvent("error", {
          timestamp: new Date().toISOString(),
          error: {
            message: e.message,
            stack: e.stack,
            request: reqBody(request)
          }
        });
        response.status(500).end();
      }
    }
  );

  /**
   * POST /v1/openai/embeddings
   * 주어진 텍스트 입력에 대한 임베딩을 생성합니다.
   * 요청 및 응답 데이터를 로깅합니다.
   */
  app.post(
    "/v1/openai/embeddings",
    [validApiKey],
    async (request, response) => {
      try {
        const { inputs = [] } = reqBody(request);
        const validArray = inputs.every((input) => typeof input === "string");
        if (!validArray)
          throw new Error("All inputs to be embedded must be strings.");

        const Embedder = getEmbeddingEngineSelection();
        const embeddings = await Embedder.embedChunks(inputs);
        const data = [];
        embeddings.forEach((embedding, index) => {
          data.push({
            object: "embedding",
            embedding,
            index,
          });
        });

        await EventLogs.logEvent("api_embeddings", {
          request: { inputs },
          response: { data, model: Embedder.model },
        });

        return response.status(200).json({
          object: "list",
          data,
          model: Embedder.model,
        });
      } catch (e) {
        console.error(e.message, e);
        await EventLogs.logEvent("api_embeddings_error", {
          request: reqBody(request),
          error: e.message,
        });
        response.status(500).end();
      }
    }
  );

  /**
   * GET /v1/openai/vector_stores
   * 모든 벡터 데이터베이스 컬렉션(워크스페이스)을 나열합니다.
   * 요청 및 응답 데이터를 로깅합니다.
   */
  app.get(
    "/v1/openai/vector_stores",
    [validApiKey],
    async (request, response) => {
      try {
        if (Object.keys(request?.query ?? {}).length !== 0) {
          const emptyResponse = { data: [], has_more: false };
          await EventLogs.logEvent("api_vector_stores_query", {
            request: request.query,
            response: emptyResponse,
          });
          return response.status(200).json(emptyResponse);
        }

        const data = [];
        const VectorDBProvider = process.env.VECTOR_DB || "lancedb";
        const workspaces = await Workspace.where();

        for (const workspace of workspaces) {
          data.push({
            id: workspace.slug,
            object: "vector_store",
            name: workspace.name,
            file_counts: {
              total: await Document.count({
                workspaceId: Number(workspace.id),
              }),
            },
            provider: VectorDBProvider,
          });
        }

        const responsePayload = {
          first_id: [...data].splice(0)?.[0]?.id,
          last_id: [...data].splice(-1)?.[0]?.id ?? data.splice(1)?.[0]?.id,
          data,
          has_more: false,
        };

        await EventLogs.logEvent("api_vector_stores", {
          request: {},
          response: responsePayload,
        });

        return response.status(200).json(responsePayload);
      } catch (e) {
        console.error(e.message, e);
        await EventLogs.logEvent("api_vector_stores_error", {
          request: {},
          error: e.message,
        });
        response.status(500).end();
      }
    }
  );
}

module.exports = { apiOpenAICompatibleEndpoints };
