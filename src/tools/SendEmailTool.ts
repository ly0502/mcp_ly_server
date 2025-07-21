import { z } from "zod";
import { EmailService } from "../services/emailService.js";
import ToolsType from "../types/toolsType.js";

export class SendEmailTool {
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.emailService = emailService;
  }

  get name() {
    return "SendEmail";
  }

  get description() {
    return "邮件发送工具";
  }

  get inputSchema() {
    return {
      toEmail: z.string().describe("收件人邮箱地址"),
      content: z.string().describe("邮件内容"),
      subject: z.string().optional().describe("邮件主题（可选）"),
      fromName: z.string().optional().describe("发件人名称（可选）"),
    };
  }

  async execute(data: ToolsType.SendEmailToolInput) {
    try {
      const { toEmail, content, subject } = data;
      const info = await this.emailService.sendEmail(data);
      return {
        content: [
          {
            type: "text" as const,
            text: `邮件发送成功！
                  📧 收件人: ${toEmail}
                  📝 主题: ${subject || "来自 MCP 服务器的邮件"}
                  📋 内容: ${
                    content.length > 100
                      ? content.substring(0, 100) + "..."
                      : content
                  }
                  📄 消息ID: ${info.messageId}
                  📅 发送时间: ${new Date().toLocaleString("zh-CN")}`,
          },
        ],
      };
    } catch (error) {
      console.error("邮件发送失败:", error);

      let errorMessage = "邮件发送失败: ";
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
