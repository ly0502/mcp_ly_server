export interface ProcessArgs {
  EMAIL_HOST?: string;
  EMAIL_PORT?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  MODE?: "stdio" | "SSE";
  PORT?: string;
  [key: string]: string | boolean | undefined; // 允许其他任意键
}
