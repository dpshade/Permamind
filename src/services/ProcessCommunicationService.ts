import { JWKInterface } from "arweave/node/lib/wallet.js";

import type { Tag } from "../models/Tag.js";

import {
  AOMessage,
  AOMessageResponse,
  aoMessageService,
} from "./AOMessageService.js";

export interface HandlerInfo {
  action: string;
  description: string;
  examples?: string[];
  isWrite: boolean;
  parameters: ParameterInfo[];
}

export interface HandlerMatch {
  confidence: number;
  handler: HandlerInfo;
  parameters: Record<string, unknown>;
}

export interface ParameterInfo {
  description: string;
  name: string;
  required: boolean;
  type: "boolean" | "number" | "object" | "string";
  validation?: string;
}

export interface ProcessCommunicationService {
  buildAOMessage: (
    processId: string,
    handler: HandlerInfo,
    parameters: Record<string, unknown>,
  ) => AOMessage;
  executeProcessRequest: (
    processMarkdown: string,
    processId: string,
    userRequest: string,
    signer: JWKInterface,
  ) => Promise<ProcessResponse>;
  interpretResponse: (
    response: AOMessageResponse,
    handler: HandlerInfo,
  ) => ProcessResponse;
  matchRequestToHandler: (
    request: string,
    handlers: HandlerInfo[],
  ) => HandlerMatch | null;
  parseMarkdown: (markdown: string) => ProcessDefinition;
}

export interface ProcessDefinition {
  handlers: HandlerInfo[];
  name: string;
  processId: string;
}

export interface ProcessResponse {
  data?: unknown;
  error?: string;
  handlerUsed?: string;
  parameters?: Record<string, unknown>;
  success: boolean;
}

const WRITE_KEYWORDS = [
  "send",
  "transfer",
  "create",
  "update",
  "delete",
  "set",
  "add",
  "remove",
  "mint",
  "burn",
  "stake",
  "withdraw",
  "deposit",
  "register",
  "vote",
];

/* const READ_KEYWORDS = [
  "get",
  "fetch", 
  "read",
  "check",
  "balance",
  "info",
  "status",
  "list",
  "query",
  "view",
  "show",
  "find",
]; */

const service = (): ProcessCommunicationService => {
  return {
    buildAOMessage: (
      processId: string,
      handler: HandlerInfo,
      parameters: Record<string, unknown>,
    ): AOMessage => {
      const tags: Tag[] = [
        {
          name: "Action",
          value: handler.action,
        },
      ];

      for (const [key, value] of Object.entries(parameters)) {
        if (value !== undefined && value !== null) {
          tags.push({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: String(value),
          });
        }
      }

      return {
        data: typeof parameters.data === "string" ? parameters.data : undefined,
        processId,
        tags,
      };
    },

    executeProcessRequest: async (
      processMarkdown: string,
      processId: string,
      userRequest: string,
      signer: JWKInterface,
    ): Promise<ProcessResponse> => {
      try {
        const processDefinition = service().parseMarkdown(processMarkdown);
        processDefinition.processId = processId;

        const handlerMatch = service().matchRequestToHandler(
          userRequest,
          processDefinition.handlers,
        );

        if (!handlerMatch) {
          return {
            error: "Could not match request to any available handler",
            success: false,
          };
        }

        const aoMessage = service().buildAOMessage(
          processId,
          handlerMatch.handler,
          handlerMatch.parameters,
        );

        const response = await aoMessageService.executeMessage(
          signer,
          aoMessage,
        );

        return service().interpretResponse(response, handlerMatch.handler);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        };
      }
    },

    interpretResponse: (
      response: AOMessageResponse,
      handler: HandlerInfo,
    ): ProcessResponse => {
      if (!response.success) {
        return {
          error: response.error || "Process execution failed",
          handlerUsed: handler.action,
          success: false,
        };
      }

      let interpretedData = response.data;
      if (
        response.data &&
        typeof response.data === "object" &&
        "Data" in response.data &&
        typeof response.data.Data === "string"
      ) {
        try {
          interpretedData = JSON.parse(response.data.Data);
        } catch {
          interpretedData = response.data.Data;
        }
      }

      return {
        data: interpretedData,
        handlerUsed: handler.action,
        success: true,
      };
    },

    matchRequestToHandler: (
      request: string,
      handlers: HandlerInfo[],
    ): HandlerMatch | null => {
      const requestLower = request.toLowerCase();
      let bestMatch: HandlerMatch | null = null;
      let highestScore = 0;

      for (const handler of handlers) {
        const score = calculateMatchScore(requestLower, handler);
        if (score > highestScore && score > 0.3) {
          const parameters = extractParameters(request, handler);
          bestMatch = {
            confidence: score,
            handler,
            parameters,
          };
          highestScore = score;
        }
      }

      return bestMatch;
    },

    parseMarkdown: (markdown: string): ProcessDefinition => {
      const lines = markdown.split("
");
      const handlers: HandlerInfo[] = [];
      let currentHandler: null | Partial<HandlerInfo> = null;
      let processName = "Unknown Process";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith("# ")) {
          processName = line.substring(2).trim();
        } else if (line.startsWith("## ")) {
          if (currentHandler && currentHandler.action) {
            handlers.push(currentHandler as HandlerInfo);
          }

          const action = line.substring(3).trim();
          currentHandler = {
            action,
            description: "",
            examples: [],
            isWrite: isWriteAction(action),
            parameters: [],
          };
        } else if (currentHandler && line.startsWith("- ")) {
          const paramLine = line.substring(2).trim();
          const parameter = parseParameter(paramLine);
          if (parameter) {
            currentHandler.parameters = currentHandler.parameters || [];
            currentHandler.parameters.push(parameter);
          }
        } else if (currentHandler && line && !line.startsWith("#")) {
          currentHandler.description = currentHandler.description
            ? currentHandler.description + " " + line
            : line;
        }
      }

      if (currentHandler && currentHandler.action) {
        handlers.push(currentHandler as HandlerInfo);
      }

      return {
        handlers,
        name: processName,
        processId: "",
      };
    },
  };
};

const isWriteAction = (action: string): boolean => {
  const actionLower = action.toLowerCase();
  return WRITE_KEYWORDS.some((keyword) => actionLower.includes(keyword));
};

const parseParameter = (paramLine: string): null | ParameterInfo => {
  const colonIndex = paramLine.indexOf(":");
  if (colonIndex === -1) return null;

  const name = paramLine.substring(0, colonIndex).trim();
  const description = paramLine.substring(colonIndex + 1).trim();

  const required = !description.toLowerCase().includes("optional");
  let type: ParameterInfo["type"] = "string";

  if (description.toLowerCase().includes("number")) {
    type = "number";
  } else if (description.toLowerCase().includes("boolean")) {
    type = "boolean";
  } else if (description.toLowerCase().includes("object")) {
    type = "object";
  }

  return {
    description,
    name,
    required,
    type,
  };
};

const calculateMatchScore = (request: string, handler: HandlerInfo): number => {
  let score = 0;

  if (request.includes(handler.action.toLowerCase())) {
    score += 0.5;
  }

  const descriptionWords = handler.description.toLowerCase().split(" ");
  const requestWords = request.split(" ");

  for (const word of requestWords) {
    if (descriptionWords.includes(word)) {
      score += 0.1;
    }
  }

  for (const param of handler.parameters) {
    if (request.includes(param.name.toLowerCase())) {
      score += 0.2;
    }
  }

  return Math.min(score, 1.0);
};

const extractParameters = (
  request: string,
  handler: HandlerInfo,
): Record<string, unknown> => {
  const parameters: Record<string, unknown> = {};
  const requestLower = request.toLowerCase();

  for (const param of handler.parameters) {
    const value = extractParameterValue(
      requestLower,
      param.name.toLowerCase(),
      param.type,
    );
    if (value !== null) {
      parameters[param.name] = value;
    }
  }

  return parameters;
};

const extractParameterValue = (
  request: string,
  paramName: string,
  paramType: ParameterInfo["type"],
): unknown => {
  const patterns = [
    new RegExp(`${paramName}\s*[=:]\s*["']?([^"'\s]+)["']?`, "i"),
    new RegExp(`${paramName}\s+([^\s]+)`, "i"),
    new RegExp(`to\s+([^\s]+)`, "i"),
    new RegExp(`send\s+([0-9.]+)`, "i"),
    new RegExp(`amount\s*[=:]?\s*([0-9.]+)`, "i"),
  ];

  for (const pattern of patterns) {
    const match = request.match(pattern);
    if (match && match[1]) {
      const value = match[1];

      if (paramType === "number") {
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      }

      return value;
    }
  }

  return null;
};

export const processCommunicationService = service();
