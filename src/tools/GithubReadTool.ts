import { z } from "zod";
import { GithubService } from "../services/githubService.js";
import ToolsType from "../types/toolsType.js";
export class GithubReadTool {
  private githubService: GithubService;

  constructor(githubService: GithubService) {
    this.githubService = githubService;
  }

  get name() {
    return "GithubRead";
  }

  get description() {
    return "github仓库读取工具";
  }

  get inputSchema() {
    return {
      githubToken: z.string().describe("GitHub API密钥"),
      owner: z.string().describe("仓库所有者"),
      repo: z.string().describe("仓库名称"),
      path: z
        .string()
        .optional()
        .default("")
        .describe("文件路径（可选，默认为根目录）"),
      ref: z
        .string()
        .optional()
        .default("main")
        .describe("分支或标签（可选，默认为main）"),
    };
  }

  async execute(data: ToolsType.GithubReadToolInput) {
    try {
      const result = await this.githubService.readRepository(data);

      if (result.type === "directory" && result.files) {
        return {
          content: [
            {
              type: "text" as const,
              text: `📁 仓库目录: ${result.owner}/${result.repo}${
                result.path ? `/${result.path}` : ""
              }
                    分支: ${result.ref}
                    文件列表:
                    ${result.files
                      .map(
                        (file) =>
                          `${file.type === "dir" ? "📁" : "📄"} ${file.name} (${
                            file.type
                          })`
                      )
                      .join("\n")}
                    详细信息:
                    ${JSON.stringify(result.files, null, 2)}`,
            },
          ],
        };
      } else if (result.type === "file") {
        return {
          content: [
            {
              type: "text" as const,
              text: `📄 文件: ${result.name}
                    路径: ${result.path}
                    大小: ${result.size} bytes
                    编码: ${result.encoding}

                    文件内容:
                    \`\`\`${result.language}
                    ${result.content}
                    \`\`\``,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: "未知的内容类型",
            },
          ],
        };
      }
    } catch (error) {
      console.error("GitHub仓库读取错误:", error);
      let errorMessage = "GitHub仓库读取失败: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += JSON.stringify(error);
      }
      return {
        content: [
          {
            type: "text" as const,
            text: errorMessage,
          },
        ],
      };
    }
  }
}
