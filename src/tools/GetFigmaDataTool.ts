import { z } from "zod";
import { ApiService } from "../services/apiService.js";
import ToolsType from "../types/toolsType.js";

export class GetFigmaDataTool {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }
  get name() {
    return "GetFigmaData";
  }
  get description() {
    return "获取Figma设计稿数据，包括文件信息、节点树结构、样式等设计元素";
  }

  get inputSchema() {
    return {
      fileKey: z
        .string()
        .describe(
          "Figma文件的唯一标识符。从URL中提取，格式：figma.com/file/<fileKey>/... 或 figma.com/design/<fileKey>/..."
        ),
      nodeId: z
        .string()
        .optional()
        .describe(
          "特定节点的标识符（可选）。从URL参数node-id中获取，用于获取文件中的特定元素"
        ),
      depth: z
        .number()
        .optional()
        .describe(
          "节点树遍历深度（可选）。控制返回数据的层级深度，较小值可减少数据量"
        ),
      FIGMA_API_TOKEN: z.string().describe("FIGMA API TOKEN"),
    };
  }

  async execute(data: ToolsType.GetFigmaDataToolInput) {
    try {
      const { fileKey, nodeId, depth, FIGMA_API_TOKEN } = data;

      console.log(
        `开始获取Figma数据 - 文件: ${fileKey}, 节点: ${
          nodeId || "全部"
        }, 深度: ${depth || "默认"}`
      );

      const baseUrl = "https://api.figma.com/v1";
      let url: string;

      if (nodeId) {
        // 获取特定节点的数据 - 使用nodes端点
        url = `${baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`;
        if (depth) url += `&depth=${depth}`;
      } else {
        // 获取整个文件的数据 - 使用files端点
        url = `${baseUrl}/files/${fileKey}`;
        if (depth) url += `?depth=${depth}`;
      }
      const headers = {
        "X-Figma-Token": FIGMA_API_TOKEN,
        "Content-Type": "application/json",
      };
      console.log(`正在请求: ${url}`);
      const apiResult = await this.apiService.callApi({
        url,
        httpMethod: "GET",
        headers: JSON.stringify(headers),
        params: "{}",
      });
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(apiResult, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      console.error("获取Figma数据失败:", errorMessage);
      let detailedError = `获取Figma数据失败: ${JSON.stringify(errorMessage)}`;
      return {
        content: [
          {
            type: "text" as const,
            text: detailedError,
          },
        ],
      };
    }
  }
}
