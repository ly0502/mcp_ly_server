import express from "express";
import cors from "cors";
import { SSEServerTransport as MCPSSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class SSETransportServer {
  private app: express.Application;
  private connections: Map<string, MCPSSEServerTransport> = new Map();

  constructor(private server: McpServer, private port: number) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // 添加 CORS 支持
    this.app.use(
      cors({
        origin: "*", // 在生产环境中应该设置为具体的域名
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );

    // 添加请求日志
    this.app.use((req, res, next) => {
      console.error(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });
  }

  private setupRoutes() {
    // 根路径 - 服务状态页面
    this.app.get("/", (req, res) => {
      res.json({
        name: "MCP LY Server",
        version: "2.0.0",
        description: "Model Context Protocol Server with SSE Transport",
        status: "running",
        timestamp: new Date().toISOString(),
        endpoints: {
          health: "/health",
          sse: "/sse",
          messages: "/messages"
        },
        activeConnections: this.connections.size,
        tools: [
          "SendEmail - 邮件发送工具",
          "ApiTest - API测试工具", 
          "GithubRead - GitHub仓库读取工具",
          "GetFigmaData - Figma数据获取工具"
        ]
      });
    });

    this.app.get("/sse", async (req, res) => {
      console.error("SSE 连接建立");
      try {
        // 实例化SSE传输对象
        const transport = new MCPSSEServerTransport("/messages", res);
        // 获取sessionId
        const sessionId = transport.sessionId;
        console.error(`新的SSE连接建立: ${sessionId}`);

        // 注册连接
        this.connections.set(sessionId, transport);

        // 连接中断处理
        req.on("close", () => {
          console.error(`SSE连接关闭: ${sessionId}`);
          this.connections.delete(sessionId);
        });

        // 将传输对象与MCP服务器连接
        await this.server.connect(transport);
        console.error(`MCP服务器连接成功: ${sessionId}`);
      } catch (error) {
        console.error("SSE 连接错误:", error);
        res.status(500).json({ error: "SSE 连接失败" });
      }
    });

    this.app.post("/messages", async (req, res) => {
      console.error("收到消息:", req.query);
      try {
        const sessionId = req.query.sessionId as string;
        // 查找对应的SSE连接并处理消息
        if (this.connections.size > 0) {
          const transport = this.connections.get(sessionId);
          if (transport) {
            await transport.handlePostMessage(req, res);
          } else {
            throw new Error("没有找到对应的SSE连接");
          }
        } else {
          throw new Error("没有活跃的SSE连接");
        }
      } catch (error) {
        console.error("消息处理错误:", error);
        res.status(500).json({
          error: "消息处理失败",
          message: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // 添加健康检查端点
    this.app.get("/health", (req, res) => {
      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        connections: this.connections.size,
      });
    });
  }

  start() {
    this.app.listen(this.port, "0.0.0.0", () => {
      console.error(`SSE 服务器运行在端口 ${this.port}`);
      console.error(`健康检查: http://localhost:${this.port}/health`);
      console.error(`SSE 端点: http://localhost:${this.port}/sse`);
      console.error(`消息 端点: http://localhost:${this.port}/messages`);
    });
  }
}
