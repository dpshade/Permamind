import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";

import { tokenService } from "../../../src/services/tokenservice.js";
import { mockKeyPair } from "../../mocks/aoConnect.js";

// Mock dependencies
vi.mock("../../../src/process.js", () => ({
  createProcess: vi.fn(),
}));

vi.mock("../../../src/relay.js", () => ({
  evalProcess: vi.fn(),
}));

// Import mocked functions
import { createProcess } from "../../../src/process.js";
import { evalProcess } from "../../../src/relay.js";

describe("TokenService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("create", () => {
    it("should create a new token process successfully", async () => {
      const mockProcessId = "test-process-id-123";
      const mockTokenModule = "mock-token-lua-code";

      // Mock the process creation
      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const result = await tokenService.create(mockKeyPair, mockTokenModule);

      expect(result).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalledWith(
        mockKeyPair,
        mockTokenModule,
        mockProcessId,
      );
    });

    it("should handle process creation failure", async () => {
      const mockTokenModule = "mock-token-lua-code";
      const mockError = new Error("Process creation failed");

      (createProcess as MockedFunction<typeof createProcess>).mockRejectedValue(
        mockError,
      );

      await expect(
        tokenService.create(mockKeyPair, mockTokenModule),
      ).rejects.toThrow("Process creation failed");

      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).not.toHaveBeenCalled();
    });

    it("should handle token evaluation failure", async () => {
      const mockProcessId = "test-process-id-123";
      const mockTokenModule = "mock-token-lua-code";
      const mockError = new Error("Token evaluation failed");

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockRejectedValue(
        mockError,
      );

      await expect(
        tokenService.create(mockKeyPair, mockTokenModule),
      ).rejects.toThrow("Token evaluation failed");

      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalledWith(
        mockKeyPair,
        mockTokenModule,
        mockProcessId,
      );
    });

    it("should handle empty token module", async () => {
      const mockProcessId = "test-process-id-123";
      const emptyTokenModule = "";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const result = await tokenService.create(mockKeyPair, emptyTokenModule);

      expect(result).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalledWith(
        mockKeyPair,
        emptyTokenModule,
        mockProcessId,
      );
    });

    it("should handle large token module", async () => {
      const mockProcessId = "test-process-id-123";
      const largeTokenModule = "a".repeat(10000); // 10KB module

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const result = await tokenService.create(mockKeyPair, largeTokenModule);

      expect(result).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalledWith(
        mockKeyPair,
        largeTokenModule,
        mockProcessId,
      );
    });
  });

  describe("service structure", () => {
    it("should have the correct service interface", () => {
      expect(tokenService).toBeDefined();
      expect(typeof tokenService.create).toBe("function");
    });

    it("should maintain consistent service behavior", () => {
      // Test that the service returns the same instance
      const service1 = tokenService;
      const service2 = tokenService;
      expect(service1).toBe(service2);
    });
  });
});
