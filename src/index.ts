#!/usr/bin/env node
import { ServerMain } from "./server/main.js";

// 启动服务器
const serverMain = new ServerMain();
serverMain.start().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
