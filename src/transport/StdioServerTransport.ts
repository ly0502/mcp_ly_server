import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class StdioTransportServer {
  private transport: StdioServerTransport;

  constructor(private server: McpServer) {
    this.transport = new StdioServerTransport();
  }

  async start() {
    await this.server.connect(this.transport);
    console.error("MCP 服务器已连接");
  }
}
