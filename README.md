# MCP LY Server

一个基于 Model Context Protocol (MCP) 的多功能服务器，支持邮件发送、API测试、GitHub仓库读取和Figma设计稿数据获取等功能。

## 🚀 功能特性

- 📧 **邮件发送工具** - 支持HTML格式邮件发送
- 🔧 **API测试工具** - 支持多种HTTP方法的API调用测试
- 📂 **GitHub读取工具** - 读取GitHub仓库文件和目录结构
- 🎨 **Figma数据获取工具** - 提取Figma设计稿的节点数据和样式信息
- 🚀 **双模式支持** - 同时支持 SSE (Server-Sent Events) 和 STDIO 传输模式
- 🐳 **Docker支持** - 提供完整的Docker部署方案

## 📦 安装

### 环境要求

- Node.js 20+
- npm 或 yarn

### 本地安装

```bash
# 克隆项目
git clone <repository-url>
cd mcp_ly_test

# 安装依赖
npm install

# 构建项目
npm run build
```

## 🛠️ 配置

### 环境变量

服务器需要以下环境变量配置：

```bash
# 邮件服务配置 (如使用邮件服务必传)
EMAIL_HOST=smtp.163.com          # SMTP服务器地址
EMAIL_PORT=465                   # SMTP端口
EMAIL_USER=your-email@163.com    # 发件人邮箱
EMAIL_PASS=your-app-password     # 邮箱授权码

# 服务模式配置 (可选)
MODE=SSE                         # 传输模式: SSE 或 stdio (默认: stdio)
PORT=8083                        # SSE模式下的服务端口 (默认: 8083)
```

### API Token配置

使用工具时需要提供相应的API Token：

- **GitHub工具**: 需要GitHub Personal Access Token
- **Figma工具**: 需要Figma API Token

## 🏃‍♂️ 运行方式

### 1. 本地运行

#### SSE模式 (推荐用于Web客户端)

```bash
# 使用预定义脚本启动
npm run start:sse

# 或手动启动
npm run build && node build/index.js --EMAIL_HOST='smtp.163.com' --EMAIL_PORT='465' --EMAIL_USER='your-email@163.com' --EMAIL_PASS='your-password' --MODE='SSE' --PORT='8083'
```

#### STDIO模式 (用于命令行客户端)

```bash
# 使用预定义脚本启动
npm run start:stdio

# 或手动启动
npm run build && node build/index.js --EMAIL_HOST='smtp.163.com' --EMAIL_PORT='465' --EMAIL_USER='your-email@163.com' --EMAIL_PASS='your-password'
```

### 2. Docker运行

#### 构建Docker镜像

```bash
# 构建镜像
docker build -t mcp-ly-server .
```

#### 运行容器

```bash
# 基础运行
docker run -d \
  --name mcp-ly-server \
  -p 8083:8083 \
  mcp-ly-server
```

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
