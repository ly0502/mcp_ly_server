namespace ToolsType {
  export interface ApiTestToolInput {
    url: string;
    params?: string; // JSON string format
    httpMethod?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: string; // JSON string format
  }
  export interface SendEmailToolInput {
    toEmail: string;
    content: string;
    subject?: string;
    fromName?: string;
  }
  export interface GithubReadToolInput {
    githubToken: string;
    owner: string;
    repo: string;
    path?: string;
    ref?: string;
  }
  export interface GithubWriteToolInput {
    owner: string;
    repo: string;
    path?: string;
    ref?: string;
  }
  export interface GetFigmaDataToolInput {
    fileKey: string;
    FIGMA_API_TOKEN: string;
    nodeId?: string;
    depth?: number;
  }
}
export default ToolsType;
