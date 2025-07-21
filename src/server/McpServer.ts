import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolRegistry } from "../tools/toolRegistry.js";
import { config } from "../config/index.js";

export class McpServerManager {
  private server: McpServer;
  private toolRegistry: ToolRegistry;

  constructor() {
    this.server = new McpServer({
      name: "mcp_lu_test",
      version: "1.0.0",
    });

    // 初始化工具注册器并注册所有工具
    this.toolRegistry = new ToolRegistry(this.server);
    this.toolRegistry.registerAllTools();
  }

  getServer(): McpServer {
    return this.server;
  }

  getConfig() {
    return config;
  }
}
