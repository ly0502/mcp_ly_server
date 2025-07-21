import { getArg } from "../utils/argUtils.js";

// 获取配置并导出
export const config = getArg();

// 打印配置信息
console.error("args", config);
