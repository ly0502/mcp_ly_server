import { z } from "zod";
import { ApiService } from "../services/apiService.js";
import ToolsType from "../types/toolsType.js";
import yaml from "js-yaml";
export class GetFigmaDataTool {
  private apiService: ApiService;

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  // 简化原始 Figma 对象的方法（一比一还原原版逻辑）
  private simplifyRawFigmaObject(
    apiResponse: any,
    extractors: Array<(node: any, result: any, context: any) => void>,
    options: { maxDepth?: number } = {}
  ): any {
    // 解析 API 响应以提取元数据、节点和组件
    const { metadata, rawNodes, components, componentSets } =
      this.parseAPIResponse(apiResponse);

    // 使用灵活的提取器系统处理节点
    const globalVars: any = { styles: {} };
    const { nodes: extractedNodes, globalVars: finalGlobalVars } =
      this.extractFromDesign(rawNodes, extractors, options, globalVars);

    // 返回完整设计
    return {
      ...metadata,
      nodes: extractedNodes,
      components: this.simplifyComponents(components),
      componentSets: this.simplifyComponentSets(componentSets),
      globalVars: finalGlobalVars,
    };
  }

  // 解析原始 Figma API 响应以提取元数据、节点和组件
  private parseAPIResponse(data: any) {
    const aggregatedComponents: Record<string, any> = {};
    const aggregatedComponentSets: Record<string, any> = {};
    let nodesToParse: Array<any>;

    if ("nodes" in data) {
      // GetFileNodesResponse
      const nodeResponses = Object.values(data.nodes);
      nodeResponses.forEach((nodeResponse: any) => {
        if (nodeResponse.components) {
          Object.assign(aggregatedComponents, nodeResponse.components);
        }
        if (nodeResponse.componentSets) {
          Object.assign(aggregatedComponentSets, nodeResponse.componentSets);
        }
      });
      nodesToParse = nodeResponses
        .map((n: any) => n.document)
        .filter(this.isVisible);
    } else {
      // GetFileResponse
      Object.assign(aggregatedComponents, data.components || {});
      Object.assign(aggregatedComponentSets, data.componentSets || {});
      nodesToParse = (data.document?.children || []).filter(this.isVisible);
    }

    const { name, lastModified, thumbnailUrl } = data;

    return {
      metadata: {
        name,
        lastModified,
        thumbnailUrl: thumbnailUrl || "",
      },
      rawNodes: nodesToParse,
      components: aggregatedComponents,
      componentSets: aggregatedComponentSets,
    };
  }

  // 从设计中提取数据（还原 node-walker 逻辑）
  private extractFromDesign(
    nodes: any[],
    extractors: Array<(node: any, result: any, context: any) => void>,
    options: { maxDepth?: number } = {},
    globalVars: any
  ): { nodes: any[]; globalVars: any } {
    const extractedNodes: any[] = [];

    const processNode = (node: any, currentDepth = 0, parent?: any): any => {
      if (options.maxDepth && currentDepth >= options.maxDepth) {
        return null;
      }

      if (!this.isVisible(node)) {
        return null;
      }

      const result: any = {
        id: node.id,
        name: node.name,
        type: node.type === "VECTOR" ? "IMAGE-SVG" : node.type,
      };

      const context = {
        globalVars,
        parent,
        currentDepth,
        options,
      };

      // 应用所有提取器
      extractors.forEach((extractor) => {
        extractor(node, result, context);
      });

      // 递归处理子节点
      if (node.children && node.children.length > 0) {
        const children = node.children
          .map((child: any) => processNode(child, currentDepth + 1, node))
          .filter((child: any) => child !== null);

        if (children.length > 0) {
          result.children = children;
        }
      }

      return result;
    };

    nodes.forEach((node) => {
      const extracted = processNode(node);
      if (extracted) {
        extractedNodes.push(extracted);
      }
    });

    return { nodes: extractedNodes, globalVars };
  }

  // 内置提取器（还原原版逻辑）
  private get allExtractors() {
    return [
      this.layoutExtractor.bind(this),
      this.textExtractor.bind(this),
      this.visualsExtractor.bind(this),
      this.componentExtractor.bind(this),
    ];
  }

  // 布局提取器
  private layoutExtractor(node: any, result: any, context: any) {
    const layout = this.buildSimplifiedLayout(node, context.parent);
    if (Object.keys(layout).length > 1) {
      result.layout = this.findOrCreateVar(
        context.globalVars,
        layout,
        "layout"
      );
    }
  }

  // 文本提取器
  private textExtractor(node: any, result: any, context: any) {
    if (this.isTextNode(node)) {
      result.text = this.extractNodeText(node);
    }

    if (this.hasTextStyle(node)) {
      const textStyle = this.extractTextStyle(node);
      if (textStyle && Object.keys(textStyle).length > 0) {
        result.textStyle = this.findOrCreateVar(
          context.globalVars,
          textStyle,
          "style"
        );
      }
    }
  }

  // 视觉效果提取器
  private visualsExtractor(node: any, result: any, context: any) {
    // 检查节点是否有子元素
    const hasChildren =
      node.children && Array.isArray(node.children) && node.children.length > 0;

    // 填充
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
      const fills = node.fills.map((fill: any) =>
        this.parsePaint(fill, hasChildren)
      );
      result.fills = this.findOrCreateVar(context.globalVars, fills, "fill");
    }

    // 描边
    if (node.strokes && node.strokes.length > 0) {
      const strokes = this.buildSimplifiedStrokes(node, hasChildren);
      if (strokes.colors && strokes.colors.length > 0) {
        result.strokes = this.findOrCreateVar(
          context.globalVars,
          strokes,
          "stroke"
        );
      }
    }

    // 效果
    if (node.effects && node.effects.length > 0) {
      const effects = this.buildSimplifiedEffects(node.effects);
      if (effects && Object.keys(effects).length > 0) {
        result.effects = this.findOrCreateVar(
          context.globalVars,
          effects,
          "effect"
        );
      }
    }

    // 透明度
    if (
      node.opacity !== undefined &&
      typeof node.opacity === "number" &&
      node.opacity !== 1
    ) {
      result.opacity = node.opacity;
    }

    // 圆角
    if (
      node.cornerRadius !== undefined &&
      typeof node.cornerRadius === "number"
    ) {
      result.borderRadius = `${node.cornerRadius}px`;
    }
    if (node.rectangleCornerRadii && Array.isArray(node.rectangleCornerRadii)) {
      result.borderRadius = `${node.rectangleCornerRadii[0]}px ${node.rectangleCornerRadii[1]}px ${node.rectangleCornerRadii[2]}px ${node.rectangleCornerRadii[3]}px`;
    }
  }

  // 组件提取器
  private componentExtractor(node: any, result: any, context: any) {
    if (node.type === "INSTANCE") {
      if (node.componentId) {
        result.componentId = node.componentId;
      }

      // 添加组件实例的特定属性
      if (node.componentProperties) {
        result.componentProperties = Object.entries(
          node.componentProperties
        ).map(([name, { value, type }]: [string, any]) => ({
          name,
          value: value.toString(),
          type,
        }));
      }
    }
  }

  // 辅助方法
  private isVisible(node: any): boolean {
    return node.visible !== false;
  }

  private isTextNode(node: any): boolean {
    return node.type === "TEXT";
  }

  private hasTextStyle(node: any): boolean {
    return !!(node.style || node.styleOverrideTable);
  }

  private extractNodeText(node: any): string {
    return node.characters || "";
  }

  private extractTextStyle(node: any): any {
    if (!node.style) return {};

    const style: any = {};
    if (node.style.fontFamily) style.fontFamily = node.style.fontFamily;
    if (node.style.fontSize) style.fontSize = node.style.fontSize;
    if (node.style.fontWeight) style.fontWeight = node.style.fontWeight;
    if (node.style.lineHeightPx) style.lineHeight = node.style.lineHeightPx;
    if (node.style.letterSpacing)
      style.letterSpacing = node.style.letterSpacing;

    return style;
  }

  private buildSimplifiedLayout(node: any, parent?: any): any {
    const layout: any = {};

    if (node.absoluteBoundingBox) {
      layout.x = node.absoluteBoundingBox.x;
      layout.y = node.absoluteBoundingBox.y;
      layout.width = node.absoluteBoundingBox.width;
      layout.height = node.absoluteBoundingBox.height;
    }

    if (node.constraints) {
      layout.constraints = node.constraints;
    }

    if (node.layoutAlign) {
      layout.layoutAlign = node.layoutAlign;
    }

    if (node.layoutGrow) {
      layout.layoutGrow = node.layoutGrow;
    }

    return layout;
  }

  private parsePaint(paint: any, hasChildren: boolean = false): any {
    const result: any = {
      type: paint.type,
    };

    if (paint.color) {
      result.color = paint.color;
    }

    if (paint.opacity !== undefined) {
      result.opacity = paint.opacity;
    }

    if (paint.gradientStops) {
      result.gradientStops = paint.gradientStops;
    }

    return result;
  }

  private buildSimplifiedStrokes(node: any, hasChildren: boolean = false): any {
    const result: any = { colors: [] };

    if (node.strokes && node.strokes.length > 0) {
      result.colors = node.strokes.map((stroke: any) =>
        this.parsePaint(stroke, hasChildren)
      );
    }

    if (
      node.strokeWeight &&
      typeof node.strokeWeight === "number" &&
      node.strokeWeight > 0
    ) {
      result.strokeWeight = `${node.strokeWeight}px`;
    }

    if (
      node.strokeDashes &&
      Array.isArray(node.strokeDashes) &&
      node.strokeDashes.length > 0
    ) {
      result.strokeDashes = node.strokeDashes;
    }

    return result;
  }

  private buildSimplifiedEffects(effects: any[]): any {
    return {
      effects: effects.map((effect: any) => ({
        type: effect.type,
        visible: effect.visible,
        radius: effect.radius,
        color: effect.color,
        offset: effect.offset,
        spread: effect.spread,
        blendMode: effect.blendMode,
      })),
    };
  }

  private simplifyComponents(components: Record<string, any>): any[] {
    return Object.values(components).map((component: any) => ({
      id: component.id,
      name: component.name,
      description: component.description,
      componentSetId: component.componentSetId,
    }));
  }

  private simplifyComponentSets(componentSets: Record<string, any>): any[] {
    return Object.values(componentSets).map((componentSet: any) => ({
      id: componentSet.id,
      name: componentSet.name,
      description: componentSet.description,
    }));
  }

  // 查找或创建全局变量的辅助函数
  private findOrCreateVar(globalVars: any, value: any, prefix: string): string {
    // 检查是否已存在相同的值
    const [existingVarId] =
      Object.entries(globalVars.styles).find(
        ([_, existingValue]) =>
          JSON.stringify(existingValue) === JSON.stringify(value)
      ) ?? [];

    if (existingVarId) {
      return existingVarId;
    }

    // 如果不存在则创建新变量
    const varId = this.generateVarId(prefix);
    globalVars.styles[varId] = value;
    return varId;
  }

  private generateVarId(prefix: string = "var"): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }

    return `${prefix}_${result}`;
  }

  // 格式化输出数据
  private formatOutput(data: any, format: "json" | "yaml"): string {
    if (format === "yaml") {
      try {
        return yaml.dump(data, {
          indent: 2,
          lineWidth: 120,
          noRefs: true,
        });
      } catch (error) {
        console.warn("YAML格式化失败，使用JSON格式:", error);
        return JSON.stringify(data, null, 2);
      }
    }
    return JSON.stringify(data, null, 2);
  }
  get name() {
    return "GetFigmaData";
  }
  get description() {
    return "获取Figma设计稿数据，包括文件信息、节点树结构、样式等设计元素，必须传入fileKey&nodeId&&FIGMA_API_TOKEN,否则无法进行获取";
  }

  get inputSchema() {
    return {
      fileKey: z
        .string()
        .describe(
          "Figma文件的唯一标识符。从URL中提取，格式：figma.com/file/<fileKey>/... 或 figma.com/design/<fileKey>/..."
        ),
      nodeId: z
        .string()
        .describe(
          "特定节点的标识符。从URL参数node-id中获取，用于获取文件中的特定元素，必传，如果URL中没有请提示用户必须选中一个节点，不然数据量太大无法处理，"
        ),
      depth: z
        .number()
        .optional()
        .describe(
          "节点树遍历深度（可选）。控制返回数据的层级深度，较小值可减少数据量"
        ),
      outputFormat: z
        .enum(["json", "yaml"])
        .optional()
        .default("json")
        .describe("输出格式：json 或 yaml，默认为 json"),
      FIGMA_API_TOKEN: z.string().describe("FIGMA API TOKEN"),
    };
  }

  async execute(data: ToolsType.GetFigmaDataToolInput) {
    try {
      const {
        fileKey,
        nodeId,
        depth,
        outputFormat = "json",
        FIGMA_API_TOKEN,
      } = data;

      console.log(
        `开始获取Figma数据 - 文件: ${fileKey}, 节点: ${
          nodeId || "全部"
        }, 深度: ${depth || "默认"}, 格式: ${outputFormat}`
      );

      const baseUrl = "https://api.figma.com/v1";
      let url: string;

      if (nodeId) {
        // 获取特定节点的数据 - 使用nodes端点
        url = `${baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`;
        if (depth) url += `&depth=${depth}`;
      } else {
        // 获取整个文件的数据 - 使用files端点
        url = `${baseUrl}/files/${fileKey}`;
        if (depth) url += `?depth=${depth}`;
      }

      const headers = {
        "X-Figma-Token": FIGMA_API_TOKEN,
      };

      console.log(`正在请求: ${url}`);
      const rawApiResult = await this.apiService.callApi({
        url,
        httpMethod: "GET",
        headers: JSON.stringify(headers),
      });

      console.log("API响应成功，开始数据简化处理...");

      // 简化原始数据
      const simplifiedData = this.simplifyRawFigmaObject(
        rawApiResult,
        this.allExtractors,
        { maxDepth: depth }
      );

      console.log(
        `数据简化完成，节点数量: ${
          simplifiedData.nodes ? simplifiedData.nodes.length : 0
        }`
      );

      // 重构输出数据结构以匹配官方实现
      const { nodes, globalVars, ...metadata } = simplifiedData;
      const result = {
        metadata,
        nodes,
        globalVars,
      };

      // 格式化输出
      const formattedResult = this.formatOutput(
        result,
        outputFormat as "json" | "yaml"
      );

      console.log(`数据格式化完成，输出格式: ${outputFormat.toUpperCase()}`);

      return {
        content: [
          {
            type: "text" as const,
            text: formattedResult,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      console.error("获取Figma数据失败:", errorMessage);

      let detailedError = `获取Figma数据失败: ${errorMessage}`;

      // 提供更详细的错误信息
      if (errorMessage.includes("401")) {
        detailedError += "\n可能的原因：API Token无效或已过期";
      } else if (errorMessage.includes("403")) {
        detailedError += "\n可能的原因：无权限访问该文件";
      } else if (errorMessage.includes("404")) {
        detailedError += "\n可能的原因：文件不存在或fileKey错误";
      }

      return {
        isError: true,
        content: [
          {
            type: "text" as const,
            text: detailedError,
          },
        ],
      };
    }
  }
}
