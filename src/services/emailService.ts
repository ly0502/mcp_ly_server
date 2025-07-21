import nodemailer from "nodemailer";
import { config } from "../config/index.js";
import ToolsType from "../types/toolsType.js";

export class EmailService {
  async sendEmail({
    toEmail,
    content,
    subject,
    fromName,
  }: ToolsType.SendEmailToolInput) {
    const emailHost = config.EMAIL_HOST;
    const emailPort = config.EMAIL_PORT;
    const emailUser = config.EMAIL_USER;
    const emailPass = config.EMAIL_PASS;

    if (!emailHost || !emailPort || !emailUser || !emailPass) {
      throw new Error(
        "邮件配置不完整，请检查环境变量 EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS"
      );
    }

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort),
      secure: parseInt(emailPort) === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    await transporter.verify();

    const info = await transporter.sendMail({
      from: fromName ? `"${fromName}" <${emailUser}>` : emailUser,
      to: toEmail,
      subject: subject || "来自 MCP 服务器的邮件",
      text: content,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
          ${subject || "来自 MCP 服务器的邮件"}
        </h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${content}</pre>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
          <p>此邮件由 MCP 服务器自动发送</p>
          <p>发送时间: ${new Date().toLocaleString("zh-CN")}</p>
        </div>
      </div>`,
    });

    console.error(`邮件发送成功: ${info.messageId}`);
    return info;
  }
}
