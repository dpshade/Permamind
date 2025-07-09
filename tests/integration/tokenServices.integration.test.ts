import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from "vitest";

import { generateSimpleTokenLua } from "../../src/services/SimpleTokenService.js";
import { generateTokenLua } from "../../src/services/TokenLuaService.js";
import { tokenService } from "../../src/services/TokenService.js";
import { mockKeyPair } from "../mocks/aoConnect.js";

// Mock dependencies
vi.mock("../../src/process.js", () => ({
  createProcess: vi.fn(),
}));

vi.mock("../../src/relay.js", () => ({
  evalProcess: vi.fn(),
}));

// Import mocked functions
import { createProcess } from "../../src/process.js";
import { evalProcess } from "../../src/relay.js";

describe("Token Services Integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Simple Token Integration", () => {
    it("should create and deploy a simple token end-to-end", async () => {
      const mockProcessId = "simple-token-process-123";

      // Mock process creation
      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      // Generate token configuration
      const tokenConfig = {
        denomination: 12,
        description: "A token for integration testing",
        logo: "https://example.com/logo.png",
        name: "Integration Test Token",
        ticker: "ITT",
        totalSupply: "1000000",
      };

      // Generate Lua code
      const lua = generateSimpleTokenLua(tokenConfig);
      expect(lua).toContain("Integration Test Token");
      expect(lua).toContain("ITT");

      // Deploy the token
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(createProcess).toHaveBeenCalledWith(mockKeyPair);
      expect(evalProcess).toHaveBeenCalledWith(mockKeyPair, lua, mockProcessId);
    });

    it("should handle token creation with minimal configuration", async () => {
      const mockProcessId = "minimal-token-process-456";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const minimalConfig = {
        name: "Minimal Token",
        ticker: "MIN",
        totalSupply: "100000",
      };

      const lua = generateSimpleTokenLua(minimalConfig);
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(lua).toContain("Minimal Token");
      expect(lua).toContain("MIN");
      expect(lua).toContain("100000");
    });
  });

  describe("Advanced Token Integration", () => {
    it("should create and deploy a token with basic minting", async () => {
      const mockProcessId = "advanced-token-process-789";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const tokenConfig = {
        description: "An advanced token with minting capabilities",
        mintingConfig: {
          buyToken: "wAR_ADDRESS",
          maxMint: "1000000",
          multiplier: 1000,
        },
        mintingStrategy: "basic" as const,
        name: "Advanced Token",
        ticker: "ADV",
      };

      const lua = generateTokenLua(tokenConfig);
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(lua).toContain("Advanced Token");
      expect(lua).toContain("ADV");
      expect(lua).toContain("wAR_ADDRESS");
      expect(lua).toContain("-- Basic Minting Strategy");
    });

    it("should create and deploy a token with cascade minting", async () => {
      const mockProcessId = "cascade-token-process-101";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const tokenConfig = {
        mintingConfig: {
          baseMintLimit: "100000",
          buyToken: "wAR_ADDRESS",
          incrementBlocks: 670,
          maxCascadeLimit: "1000000",
          maxMint: "1000000",
          multiplier: 1000,
        },
        mintingStrategy: "cascade" as const,
        name: "Cascade Token",
        ticker: "CAS",
      };

      const lua = generateTokenLua(tokenConfig);
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(lua).toContain("Cascade Token");
      expect(lua).toContain("CAS");
      expect(lua).toContain("-- Cascade Minting Strategy");
      expect(lua).toContain("670");
    });

    it("should create and deploy a token with double minting", async () => {
      const mockProcessId = "double-token-process-102";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const tokenConfig = {
        mintingConfig: {
          buyTokens: {
            CRED_ADDRESS: { enabled: true, multiplier: 500 },
            wAR_ADDRESS: { enabled: true, multiplier: 1000 },
          },
          maxMint: "1000000",
        },
        mintingStrategy: "double_mint" as const,
        name: "Double Token",
        ticker: "DBL",
      };

      const lua = generateTokenLua(tokenConfig);
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(lua).toContain("Double Token");
      expect(lua).toContain("DBL");
      expect(lua).toContain("-- Double Mint Strategy");
      expect(lua).toContain("wAR_ADDRESS");
      expect(lua).toContain("CRED_ADDRESS");
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle process creation failures gracefully", async () => {
      const mockError = new Error("Process creation failed");
      (createProcess as MockedFunction<typeof createProcess>).mockRejectedValue(
        mockError,
      );

      const tokenConfig = {
        name: "Error Token",
        ticker: "ERR",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(tokenConfig);

      await expect(tokenService.create(mockKeyPair, lua)).rejects.toThrow(
        "Process creation failed",
      );
    });

    it("should handle token evaluation failures gracefully", async () => {
      const mockProcessId = "error-token-process-999";
      const mockError = new Error("Token evaluation failed");

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockRejectedValue(
        mockError,
      );

      const tokenConfig = {
        name: "Error Token",
        ticker: "ERR",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(tokenConfig);

      await expect(tokenService.create(mockKeyPair, lua)).rejects.toThrow(
        "Token evaluation failed",
      );
    });
  });

  describe("Performance Integration", () => {
    it("should handle multiple token creations efficiently", async () => {
      const mockProcessIds = [
        "perf-token-1",
        "perf-token-2",
        "perf-token-3",
        "perf-token-4",
        "perf-token-5",
      ];

      let callCount = 0;
      (
        createProcess as MockedFunction<typeof createProcess>
      ).mockImplementation(() => {
        return Promise.resolve(mockProcessIds[callCount++]);
      });
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      const tokenConfigs = mockProcessIds.map((_, index) => ({
        name: `Performance Token ${index + 1}`,
        ticker: `PT${index + 1}`,
        totalSupply: `${(index + 1) * 100000}`,
      }));

      const startTime = Date.now();

      const promises = tokenConfigs.map(async (config) => {
        const lua = generateSimpleTokenLua(config);
        return await tokenService.create(mockKeyPair, lua);
      });

      const results = await Promise.all(promises);
      const endTime = Date.now();

      expect(results).toHaveLength(5);
      expect(results).toEqual(mockProcessIds);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Configuration Validation Integration", () => {
    it("should validate configuration before deployment", async () => {
      const mockProcessId = "validation-token-process-111";

      (createProcess as MockedFunction<typeof createProcess>).mockResolvedValue(
        mockProcessId,
      );
      (evalProcess as MockedFunction<typeof evalProcess>).mockResolvedValue(
        undefined,
      );

      // Test with valid configuration
      const validConfig = {
        denomination: 12,
        name: "Valid Token",
        ticker: "VAL",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(validConfig);
      const processId = await tokenService.create(mockKeyPair, lua);

      expect(processId).toBe(mockProcessId);
      expect(lua).toContain("Valid Token");
      expect(lua).toContain("VAL");
      expect(lua).toContain("12");
    });

    it("should generate consistent Lua code for same configuration", () => {
      const config = {
        denomination: 8,
        name: "Consistent Token",
        ticker: "CON",
        totalSupply: "500000",
      };

      const lua1 = generateSimpleTokenLua(config);
      const lua2 = generateSimpleTokenLua(config);

      expect(lua1).toBe(lua2);
    });
  });
});
