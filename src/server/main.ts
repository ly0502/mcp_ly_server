import { SSETransportServer } from "../transport/SSEServerTransport.js";
import { StdioTransportServer } from "../transport/StdioServerTransport.js";
import { McpServerManager } from "./McpServer.js";

export class ServerMain {
  private mcpServerManager: McpServerManager;

  constructor() {
    this.mcpServerManager = new McpServerManager();
  }

  async start() {
    const config = this.mcpServerManager.getConfig();
    const server = this.mcpServerManager.getServer();

    if (config.MODE === "SSE") {
      const port = parseInt(config.PORT || "8083");
      const sseTransport = new SSETransportServer(server, port);
      sseTransport.start();
    } else {
      const stdioTransport = new StdioTransportServer(server);
      await stdioTransport.start();
    }
  }
}
