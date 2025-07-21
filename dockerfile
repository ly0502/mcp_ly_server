# 使用 Node.js 20 官方镜像作为基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 暴露端口（根据您的 SSE 服务端口设置，通常是 3000）
EXPOSE 8083

# 启动 SSE 服务
CMD ["npm", "run", "start:sse"]