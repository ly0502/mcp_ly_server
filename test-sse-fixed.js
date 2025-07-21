import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function testSSEConnection() {
  console.log("开始测试SSE连接...");
  
  try {
    // 创建MCP客户端
    const client = new Client({
      name: "test-client",
      version: "1.0.0",
    });

    // 创建SSE传输对象
    const transport = new SSEClientTransport(new URL("http://localhost:8083/sse"));

    console.log("正在连接到MCP服务器...");
    
    // 连接到MCP服务器
    await client.connect(transport);
    console.log("✓ MCP服务器连接成功");

    // 测试列出工具
    const { tools } = await client.listTools();
    console.log("✓ 获取工具列表成功:", tools.length, "个工具");
    
    tools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name}: ${tool.description}`);
    });

    // 测试调用一个工具
    if (tools.length > 0) {
      const firstTool = tools[0];
      console.log(`\n正在测试工具: ${firstTool.name}`);
      
      try {
        const result = await client.callTool(firstTool.name, {});
        console.log("✓ 工具调用成功:", result);
      } catch (error) {
        console.log("工具调用失败:", error.message);
      }
    }

    console.log("\n测试完成!");
    
  } catch (error) {
    console.error("❌ 测试失败:", error);
    console.error("错误详情:", error.message);
  }
}

// 运行测试
testSSEConnection().catch(console.error);
