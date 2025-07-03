import { beforeEach, describe, expect, it, vi } from "vitest";

import { defaultProcessService } from "../../../src/services/DefaultProcessService.js";

// Mock dependencies
vi.mock("../../../src/templates/defaultTokenProcess.js", () => ({
  DEFAULT_TOKEN_PROCESS: "mock-default-token-process",
  extractTokenOperation: vi.fn(),
  getDefaultTokenProcess: vi.fn(),
  isTokenProcess: vi.fn(),
  TOKEN_DETECTION_PATTERNS: {
    handlers: ["balance", "transfer", "mint"],
    keywords: ["token", "balance", "transfer"],
  },
}));

describe("DefaultProcessService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("canHandleRequest", () => {
    it("should return true for token-related requests", () => {
      const tokenRequests = [
        "create a token",
        "mint tokens",
        "check balance",
        "transfer tokens",
        "deploy new token",
      ];

      tokenRequests.forEach((request) => {
        expect(defaultProcessService.canHandleRequest(request)).toBe(true);
      });
    });

    it("should return false for non-token requests", () => {
      const nonTokenRequests = [
        "create a database",
        "send email",
        "analyze data",
        "generate report",
      ];

      nonTokenRequests.forEach((request) => {
        expect(defaultProcessService.canHandleRequest(request)).toBe(false);
      });
    });

    it("should handle case insensitive matching", () => {
      const requests = [
        "CREATE A TOKEN",
        "Token Creation",
        "MINT TOKENS",
        "Balance Check",
      ];

      requests.forEach((request) => {
        expect(defaultProcessService.canHandleRequest(request)).toBe(true);
      });
    });

    it("should handle empty and null requests", () => {
      expect(defaultProcessService.canHandleRequest("")).toBe(false);
      expect(
        defaultProcessService.canHandleRequest(null as unknown as string),
      ).toBe(false);
      expect(
        defaultProcessService.canHandleRequest(undefined as unknown as string),
      ).toBe(false);
    });
  });

  describe("detectProcessType", () => {
    it("should detect token process from handlers", () => {
      const tokenHandlers = ["balance", "transfer", "mint"];
      const result = defaultProcessService.detectProcessType(tokenHandlers);

      expect(result).toBeTruthy();
      expect(result?.type).toBe("token");
    });

    it("should detect token process from partial handlers", () => {
      const partialHandlers = ["balance", "info"];
      const result = defaultProcessService.detectProcessType(partialHandlers);

      expect(result).toBeTruthy();
    });

    it("should return null for non-token handlers", () => {
      const nonTokenHandlers = ["database", "email", "report"];
      const result = defaultProcessService.detectProcessType(nonTokenHandlers);

      expect(result).toBeNull();
    });

    it("should handle empty handlers array", () => {
      const result = defaultProcessService.detectProcessType([]);
      expect(result).toBeNull();
    });

    it("should consider process responses for detection", () => {
      const handlers = ["unknown"];
      const responses = {
        balance: "1000",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = defaultProcessService.detectProcessType(
        handlers,
        responses,
      );
      expect(result).toBeTruthy();
    });
  });

  describe("getDefaultProcess", () => {
    it("should return token process definition", () => {
      const process = defaultProcessService.getDefaultProcess("token");
      expect(process).toBeTruthy();
      expect(process?.type).toBe("token");
    });

    it("should return null for unknown process type", () => {
      const process = defaultProcessService.getDefaultProcess("unknown");
      expect(process).toBeNull();
    });

    it("should handle process ID parameter", () => {
      const processId = "test-process-123";
      const process = defaultProcessService.getDefaultProcess(
        "token",
        processId,
      );
      expect(process).toBeTruthy();
    });
  });

  describe("getDefaultProcesses", () => {
    it("should return registry of available processes", () => {
      const processes = defaultProcessService.getDefaultProcesses();
      expect(processes).toBeTruthy();
      expect(typeof processes).toBe("object");
      expect(processes.token).toBeTruthy();
    });

    it("should return consistent registry", () => {
      const processes1 = defaultProcessService.getDefaultProcesses();
      const processes2 = defaultProcessService.getDefaultProcesses();
      expect(processes1).toEqual(processes2);
    });
  });

  describe("getSuggestedOperations", () => {
    it("should return token operations for token process", () => {
      const operations = defaultProcessService.getSuggestedOperations("token");
      expect(operations).toBeTruthy();
      expect(Array.isArray(operations)).toBe(true);
      expect(operations.length).toBeGreaterThan(0);
    });

    it("should return empty array for unknown process type", () => {
      const operations =
        defaultProcessService.getSuggestedOperations("unknown");
      expect(operations).toEqual([]);
    });

    it("should include common token operations", () => {
      const operations = defaultProcessService.getSuggestedOperations("token");
      expect(operations).toContain("balance");
      expect(operations).toContain("transfer");
      expect(operations).toContain("info");
    });
  });

  describe("isKnownProcessType", () => {
    it("should identify known token process", () => {
      const processType =
        defaultProcessService.isKnownProcessType("token-process-123");
      expect(processType).toBeTruthy();
    });

    it("should return null for unknown process", () => {
      const processType = defaultProcessService.isKnownProcessType(
        "unknown-process-123",
      );
      expect(processType).toBeNull();
    });

    it("should use handlers for additional context", () => {
      const handlers = ["balance", "transfer"];
      const processType = defaultProcessService.isKnownProcessType(
        "unknown-process-123",
        handlers,
      );
      expect(processType).toBeTruthy();
    });
  });

  describe("processNaturalLanguage", () => {
    it("should process token creation request", () => {
      const request = "create a token called TestToken with symbol TEST";
      const result = defaultProcessService.processNaturalLanguage(request);

      expect(result).toBeTruthy();
      expect(result?.detected).toBe(true);
      expect(result?.processType).toBe("token");
    });

    it("should extract parameters from natural language", () => {
      const request =
        "create a token called MyToken with symbol MTK and supply 1000000";
      const result = defaultProcessService.processNaturalLanguage(request);

      expect(result).toBeTruthy();
      expect(result?.extractedParameters).toBeTruthy();
      expect(result?.extractedParameters?.name).toBe("MyToken");
      expect(result?.extractedParameters?.ticker).toBe("MTK");
      expect(result?.extractedParameters?.totalSupply).toBe("1000000");
    });

    it("should handle unrecognized requests", () => {
      const request = "send an email to my friend";
      const result = defaultProcessService.processNaturalLanguage(request);

      expect(result?.detected).toBe(false);
      expect(result?.processType).toBeNull();
    });

    it("should provide suggestions for recognized requests", () => {
      const request = "create a token";
      const result = defaultProcessService.processNaturalLanguage(request);

      expect(result?.suggestions).toBeTruthy();
      expect(Array.isArray(result?.suggestions)).toBe(true);
      expect(result?.suggestions?.length).toBeGreaterThan(0);
    });
  });

  describe("service integration", () => {
    it("should maintain consistent service interface", () => {
      expect(defaultProcessService.canHandleRequest).toBeTruthy();
      expect(defaultProcessService.detectProcessType).toBeTruthy();
      expect(defaultProcessService.getDefaultProcess).toBeTruthy();
      expect(defaultProcessService.getDefaultProcesses).toBeTruthy();
      expect(defaultProcessService.getSuggestedOperations).toBeTruthy();
      expect(defaultProcessService.isKnownProcessType).toBeTruthy();
      expect(defaultProcessService.processNaturalLanguage).toBeTruthy();
    });
  });
});
