import axios from "axios";
import ToolsType from "../types/toolsType.js";
export class ApiService {
  async callApi({ url, httpMethod, params, headers }: ToolsType.ApiTestToolInput) {
    console.error(`API调用: ${httpMethod} ${url}`);
    const response = await axios({
      url,
      method: httpMethod,
      data: JSON.parse(params || "{}"),
      headers: JSON.parse(headers || "{}"),
    });

    return response.data;
  }
}
