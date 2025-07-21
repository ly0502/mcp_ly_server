import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SendEmailTool } from "./SendEmailTool.js";
import { ApiTestTool } from "./ApiTestTool.js";
import { GithubReadTool } from "./GithubReadTool.js";
import { GetFigmaDataTool } from "./GetFigmaDataTool.js";
import { EmailService } from "../services/emailService.js";
import { ApiService } from "../services/apiService.js";
import { GithubService } from "../services/githubService.js";

export class ToolRegistry {
  private server: McpServer;

  constructor(server: McpServer) {
    this.server = server;
  }

  registerAllTools() {
    // 初始化服务
    const emailService = new EmailService();
    const apiService = new ApiService();
    const githubService = new GithubService();

    // 注册邮件工具
    const sendEmailTool = new SendEmailTool(emailService);
    this.server.tool(
      sendEmailTool.name,
      sendEmailTool.description,
      sendEmailTool.inputSchema,
      sendEmailTool.execute.bind(sendEmailTool)
    );

    // 注册API测试工具
    const apiTestTool = new ApiTestTool(apiService);
    this.server.tool(
      apiTestTool.name,
      apiTestTool.description,
      apiTestTool.inputSchema,
      apiTestTool.execute.bind(apiTestTool)
    );

    // 注册Github读取工具
    const githubReadTool = new GithubReadTool(githubService);
    this.server.tool(
      githubReadTool.name,
      githubReadTool.description,
      githubReadTool.inputSchema,
      githubReadTool.execute.bind(githubReadTool)
    );

    // 注册Figma数据获取工具
    const getFigmaDataTool = new GetFigmaDataTool(apiService);
    this.server.tool(
      getFigmaDataTool.name,
      getFigmaDataTool.description,
      getFigmaDataTool.inputSchema,
      getFigmaDataTool.execute.bind(getFigmaDataTool)
    );

    console.error("所有工具已注册完成");
  }
}
