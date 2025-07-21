import axios from "axios";
import { config } from "../config/index.js";
import { getFileExtension } from "../utils/fileUtils.js";
import ToolsType from "../types/toolsType.js";
export class GithubService {
  async readRepository({
    githubToken,
    owner,
    repo,
    path = "",
    ref = "main",
  }: ToolsType.GithubReadToolInput) {
    console.error(`读取GitHub仓库: ${owner}/${repo}${path ? `/${path}` : ""}`);

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const response = await axios({
      method: "GET",
      url: apiUrl,
      headers: {
        authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      params: {
        ref: ref,
      },
    });

    const data = response.data;

    if (Array.isArray(data)) {
      const fileList = data.map((item) => ({
        name: item.name,
        type: item.type,
        size: item.size,
        download_url: item.download_url,
        path: item.path,
      }));

      return {
        type: "directory",
        owner,
        repo,
        path,
        ref,
        files: fileList,
      };
    } else if (data.type === "file") {
      let content = "";
      if (data.content) {
        content = Buffer.from(data.content, "base64").toString("utf-8");
      }

      return {
        type: "file",
        name: data.name,
        path: data.path,
        size: data.size,
        encoding: data.encoding,
        content,
        language: getFileExtension(data.name),
      };
    } else {
      throw new Error(`未知的内容类型: ${data.type}`);
    }
  }
}
