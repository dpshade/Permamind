import { JWKInterface } from "arweave/node/lib/wallet.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  HandlerInfo,
  processCommunicationService,
  ProcessDefinition,
} from "../../../src/services/ProcessCommunicationService.js";

// Mock AOMessageService
vi.mock("../../../src/services/AOMessageService.js", () => ({
  aoMessageService: {
    executeMessage: vi.fn(),
  },
}));

import { aoMessageService } from "../../../src/services/AOMessageService.js";

const mockExecuteMessage = vi.mocked(aoMessageService.executeMessage);

describe("ProcessCommunicationService", () => {
  const mockSigner: JWKInterface = {
    e: "AQAB",
    kty: "RSA",
    n: "test",
  } as JWKInterface;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parseMarkdown", () => {
    it("should parse basic markdown process documentation", () => {
      const markdown = `# Token Process

A simple token contract.

## transfer
Send tokens to another user
- recipient: wallet address (required)
- amount: number of tokens (required)
- memo: optional message (optional)

## balance
Get current balance
- account: wallet address (optional)`;

      const result = processCommunicationService.parseMarkdown(markdown);

      expect(result.name).toBe("Token Process");
      expect(result.handlers).toHaveLength(2);

      const transferHandler = result.handlers[0];
      expect(transferHandler.action).toBe("transfer");
      expect(transferHandler.description).toBe("Send tokens to another user");
      expect(transferHandler.isWrite).toBe(true);
      expect(transferHandler.parameters).toHaveLength(3);

      const balanceHandler = result.handlers[1];
      expect(balanceHandler.action).toBe("balance");
      expect(balanceHandler.description).toBe("Get current balance");
      expect(balanceHandler.isWrite).toBe(false);
      expect(balanceHandler.parameters).toHaveLength(1);
    });

    it("should parse parameters correctly", () => {
      const markdown = `# Test Process

## action
Test action
- param1: string parameter (required)
- param2: number of items (required)
- param3: boolean flag (optional)
- param4: object data (optional)`;

      const result = processCommunicationService.parseMarkdown(markdown);
      const handler = result.handlers[0];

      expect(handler.parameters).toEqual([
        {
          description: "string parameter (required)",
          name: "param1",
          required: true,
          type: "string",
        },
        {
          description: "number of items (required)",
          name: "param2",
          required: true,
          type: "number",
        },
        {
          description: "boolean flag (optional)",
          name: "param3",
          required: false,
          type: "boolean",
        },
        {
          description: "object data (optional)",
          name: "param4",
          required: false,
          type: "object",
        },
      ]);
    });

    it("should handle empty markdown", () => {
      const result = processCommunicationService.parseMarkdown("");
      expect(result.name).toBe("Unknown Process");
      expect(result.handlers).toHaveLength(0);
    });
  });

  describe("matchRequestToHandler", () => {
    const handlers: HandlerInfo[] = [
      {
        action: "transfer",
        description: "Send tokens to another user",
        isWrite: true,
        parameters: [
          {
            description: "wallet address",
            name: "recipient",
            required: true,
            type: "string",
          },
          {
            description: "number of tokens",
            name: "amount",
            required: true,
            type: "number",
          },
        ],
      },
      {
        action: "balance",
        description: "Get current balance",
        isWrite: false,
        parameters: [
          {
            description: "wallet address",
            name: "account",
            required: false,
            type: "string",
          },
        ],
      },
    ];

    it("should match request to correct handler", () => {
      const request = "transfer 100 tokens to alice";
      const match = processCommunicationService.matchRequestToHandler(
        request,
        handlers,
      );

      expect(match).toBeTruthy();
      expect(match!.handler.action).toBe("transfer");
      expect(match!.confidence).toBeGreaterThan(0.3);
    });

    it("should extract parameters from natural language", () => {
      const request = "send 100 tokens to alice";
      const match = processCommunicationService.matchRequestToHandler(
        request,
        handlers,
      );

      expect(match).toBeTruthy();
      expect(match!.parameters.recipient).toBe("alice");
      expect(match!.parameters.amount).toBe(100);
    });

    it("should return null for poor matches", () => {
      const request = "completely unrelated request";
      const match = processCommunicationService.matchRequestToHandler(
        request,
        handlers,
      );

      expect(match).toBeNull();
    });

    it("should match balance requests", () => {
      const request = "check my balance";
      const match = processCommunicationService.matchRequestToHandler(
        request,
        handlers,
      );

      expect(match).toBeTruthy();
      expect(match!.handler.action).toBe("balance");
    });
  });

  describe("buildAOMessage", () => {
    it("should build correct AO message from handler and parameters", () => {
      const handler: HandlerInfo = {
        action: "transfer",
        description: "Send tokens",
        isWrite: true,
        parameters: [],
      };

      const parameters = {
        amount: 100,
        memo: "payment",
        recipient: "alice",
      };

      const message = processCommunicationService.buildAOMessage(
        "test-process",
        handler,
        parameters,
      );

      expect(message.processId).toBe("test-process");
      expect(message.tags).toEqual([
        { name: "Action", value: "transfer" },
        { name: "Recipient", value: "alice" },
        { name: "Amount", value: "100" },
        { name: "Memo", value: "payment" },
      ]);
    });

    it("should handle undefined and null parameters", () => {
      const handler: HandlerInfo = {
        action: "test",
        description: "Test",
        isWrite: true,
        parameters: [],
      };

      const parameters = {
        param1: "value",
        param2: undefined,
        param3: null,
        param4: "",
      };

      const message = processCommunicationService.buildAOMessage(
        "test-process",
        handler,
        parameters,
      );

      expect(message.tags).toEqual([
        { name: "Action", value: "test" },
        { name: "Param1", value: "value" },
        { name: "Param4", value: "" },
      ]);
    });
  });

  describe("interpretResponse", () => {
    const mockHandler: HandlerInfo = {
      action: "test",
      description: "Test",
      isWrite: true,
      parameters: [],
    };

    it("should interpret successful response", () => {
      const response = {
        data: { result: "success" },
        success: true,
      };

      const result = processCommunicationService.interpretResponse(
        response,
        mockHandler,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: "success" });
      expect(result.handlerUsed).toBe("test");
    });

    it("should interpret error response", () => {
      const response = {
        error: "Operation failed",
        success: false,
      };

      const result = processCommunicationService.interpretResponse(
        response,
        mockHandler,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Operation failed");
      expect(result.handlerUsed).toBe("test");
    });

    it("should parse JSON data from AO response", () => {
      const response = {
        data: {
          Data: JSON.stringify({ balance: 100 }),
        },
        success: true,
      };

      const result = processCommunicationService.interpretResponse(
        response,
        mockHandler,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ balance: 100 });
    });

    it("should handle invalid JSON gracefully", () => {
      const response = {
        data: {
          Data: "invalid json {",
        },
        success: true,
      };

      const result = processCommunicationService.interpretResponse(
        response,
        mockHandler,
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe("invalid json {");
    });
  });

  describe("executeProcessRequest", () => {
    it("should execute complete process request workflow", async () => {
      const markdown = `# Token Process

## transfer
Send tokens
- recipient: wallet address (required)
- amount: number of tokens (required)`;

      const request = "send 100 tokens to alice";

      mockExecuteMessage.mockResolvedValueOnce({
        data: { txId: "123" },
        success: true,
      });

      const result = await processCommunicationService.executeProcessRequest(
        markdown,
        "test-process",
        request,
        mockSigner,
      );

      expect(result.success).toBe(true);
      expect(result.handlerUsed).toBe("transfer");
      expect(mockExecuteMessage).toHaveBeenCalledWith(mockSigner, {
        data: undefined,
        processId: "test-process",
        tags: [
          { name: "Action", value: "transfer" },
          { name: "Recipient", value: "alice" },
          { name: "Amount", value: "100" },
        ],
      });
    });

    it("should handle request matching failure", async () => {
      const markdown = `# Token Process

## transfer
Send tokens
- recipient: wallet address (required)`;

      const request = "completely unrelated request";

      const result = await processCommunicationService.executeProcessRequest(
        markdown,
        "test-process",
        request,
        mockSigner,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Could not match request to any available handler",
      );
    });

    it("should handle execution errors", async () => {
      const markdown = `# Token Process

## transfer
Send tokens
- recipient: wallet address (required)`;

      const request = "transfer tokens";

      mockExecuteMessage.mockRejectedValueOnce(new Error("Execution failed"));

      const result = await processCommunicationService.executeProcessRequest(
        markdown,
        "test-process",
        request,
        mockSigner,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Execution failed");
    });
  });
});
