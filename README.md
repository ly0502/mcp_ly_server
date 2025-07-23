# MCP LY Server

一个基于 Model Context Protocol (MCP) 的多功能服务器，支持邮件发送、API测试、GitHub仓库读取和Figma设计稿数据获取等功能。

## 🚀 功能

- 📧 **邮件发送工具** - 支持HTML格式邮件发送
- 🔧 **API测试工具** - 支持多种HTTP方法的API调用测试
- 📂 **GitHub读取工具** - 读取GitHub仓库文件和目录结构
- 🎨 **Figma数据获取工具** - 提取Figma设计稿的节点数据和样式信息
- 🚀 **双模式支持** - 同时支持 SSE (Server-Sent Events) 和 STDIO 传输模式

## 📦 启动方式

### 环境要求

- Node.js 20+
- npm 或 yarn

### 本地启动

```bash
git clone <repository-url>
cd mcp_ly_test
npm install

# sse模式启动(适用于web客户端)
npm run start:sse
# stdio模式启动(适用于本地编辑器)
npm run start:stdio
```

### docker启动 默认sse模式
```bash
   docker compose up
```
## 使用

### 编辑器直接配置 stdio模式
```json
    "mcp-ly-server": {
      "command": "npx",
      "args": [
        "-y",
        "mcp_ly_server",
        "--EMAIL_HOST=smtp.yeah.net",
        "--EMAIL_PORT=465",
        "--EMAIL_USER=mcpserver@yeah.net",
        "--EMAIL_PASS=YVR6E6pqmzUhT3F4"
      ]
    },
```

### web端使用
   配置SSE连接端点 `http://127.0.0.1:8083/sse`:npm run start:sse | docker compose up 启动后的sse地址


## 🔧 工具说明

### 1. 邮件发送工具 (SendEmail)

发送HTML格式的邮件。

**参数:**
- `toEmail`: 收件人邮箱地址 (必需)
- `content`: 邮件内容 (必需)
- `subject`: 邮件主题 (可选)
- `fromName`: 发件人名称 (可选)

### 2. API测试工具 (ApiTest)

测试HTTP API接口调用。

**参数:**
- `url`: 接口URL (必需)
- `httpMethod`: HTTP方法 (GET/POST/PUT/DELETE, 默认: GET)
- `params`: 请求参数 (JSON字符串格式, 可选)
- `headers`: 请求头 (JSON字符串格式, 可选)

### 3. GitHub读取工具 (GithubRead)

读取GitHub仓库的文件和目录结构。

**参数:**
- `githubToken`: GitHub API Token (必需)
- `owner`: 仓库所有者 (必需)
- `repo`: 仓库名称 (必需)
- `path`: 文件路径 (可选, 默认为根目录)
- `ref`: 分支或标签 (可选, 默认为main)

### 4. Figma数据获取工具 (GetFigmaData)

提取Figma设计稿的详细数据，包括节点树结构、样式信息等。

**参数:**
- `fileKey`: Figma文件标识符 (必需)
- `FIGMA_API_TOKEN`: Figma API Token (必需)
- `nodeId`: 特定节点ID (必需, 从URL参数node-id获取)
- `depth`: 遍历深度 (可选, 控制返回数据层级)
- `outputFormat`: 输出格式 (json/yaml, 默认: json)

## 🌐 API 端点 (SSE模式)

当以SSE模式运行时，服务器提供以下端点：

- `GET /` - 服务状态页面
- `GET /health` - 健康检查端点
- `POST /sse` - SSE连接端点
- `GET /sse` - SSE连接端点 (GET方式)
