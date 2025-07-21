import { z } from "zod";
import { ApiService } from "../services/apiService.js";
import ToolsType from "../types/toolsType.js";
export class ApiTestTool {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  get name() {
    return "ApiTest";
  }

  get description() {
    return "接口调用工具";
  }

  get inputSchema() {
    return {
      url: z.string().describe("接口URL"),
      params: z.string().optional().default("{}").describe("参数,json串格式"),
      httpMethod: z
        .enum(["GET", "POST", "PUT", "DELETE"])
        .default("GET")
        .describe("HTTP方法"),
      headers: z
        .string()
        .optional()
        .default("{}")
        .describe("请求头,json串格式"),
    };
  }

  async execute(data: ToolsType.ApiTestToolInput) {
    try {
      const result = await this.apiService.callApi(data);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      };
    } catch (error) {
      console.error("API调用错误:", error);
      return {
        content: [
          {
            type: "text" as const,
            text: `API调用失败: ${
              error instanceof Error ? error.message : JSON.stringify(error)
            }`,
          },
        ],
      };
    }
  }
}
