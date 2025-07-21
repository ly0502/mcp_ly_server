import axios from "axios";
import ToolsType from "../types/toolsType.js";
export class ApiService {
  async callApi({
    url,
    httpMethod,
    params,
    headers,
  }: ToolsType.ApiTestToolInput) {
    console.error(`API调用: ${httpMethod} ${url}`);
    const response = await axios({
      url,
      method: httpMethod,
      data: params ? JSON.parse(params) : undefined,
      headers: headers ? JSON.parse(headers) : undefined,
    });

    return response.data;
  }
}
