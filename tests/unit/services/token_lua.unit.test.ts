import { describe, expect, it } from "vitest";

import {
  type BasicMintConfig,
  type CascadeMintConfig,
  type DoubleMintConfig,
  exampleConfigs,
  generateTokenLua,
  type TokenConfig,
  validateTokenConfig,
} from "../../../src/services/TokenLuaService.js";

describe("Token Lua Service", () => {
  describe("validateTokenConfig", () => {
    it("should validate basic minting configuration", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyToken: "wAR_ADDRESS",
          maxMint: "1000000",
          multiplier: 1000,
        } as BasicMintConfig,
        mintingStrategy: "basic",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should validate cascade minting configuration", () => {
      const config: TokenConfig = {
        mintingConfig: {
          baseMintLimit: "100000",
          buyToken: "wAR_ADDRESS",
          incrementBlocks: 670,
          maxCascadeLimit: "1000000",
          maxMint: "1000000",
          multiplier: 1000,
        } as CascadeMintConfig,
        mintingStrategy: "cascade",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should validate double mint configuration", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyTokens: {
            CRED_ADDRESS: { enabled: true, multiplier: 500 },
            wAR_ADDRESS: { enabled: true, multiplier: 1000 },
          },
          maxMint: "1000000",
        } as DoubleMintConfig,
        mintingStrategy: "double_mint",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should validate no minting configuration", () => {
      const config: TokenConfig = {
        mintingStrategy: "none",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should reject configuration with missing required fields", () => {
      const config = {
        // Missing name
        mintingStrategy: "basic",
        ticker: "TEST",
      } as TokenConfig;

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject configuration with invalid minting strategy", () => {
      const config: TokenConfig = {
        mintingStrategy: "invalid_strategy" as never,
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject basic minting config with missing fields", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyToken: "wAR_ADDRESS",
          // Missing maxMint and multiplier
        } as BasicMintConfig,
        mintingStrategy: "basic",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject cascade minting config with missing fields", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyToken: "wAR_ADDRESS",
          maxMint: "1000000",
          multiplier: 1000,
          // Missing cascade-specific fields
        } as CascadeMintConfig,
        mintingStrategy: "cascade",
        name: "Test Token",
        ticker: "TEST",
      };

      const result = validateTokenConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe("generateTokenLua", () => {
    it("should generate Lua code for basic minting strategy", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyToken: "wAR_ADDRESS",
          maxMint: "1000000",
          multiplier: 1000,
        } as BasicMintConfig,
        mintingStrategy: "basic",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain("wAR_ADDRESS");
      expect(lua).toContain("1000000");
      expect(lua).toContain("1000");
      expect(lua).toContain("wAR_ADDRESS");
    });

    it("should generate Lua code for cascade minting strategy", () => {
      const config: TokenConfig = {
        mintingConfig: {
          baseMintLimit: "100000",
          buyToken: "wAR_ADDRESS",
          incrementBlocks: 670,
          maxCascadeLimit: "1000000",
          maxMint: "1000000",
          multiplier: 1000,
        } as CascadeMintConfig,
        mintingStrategy: "cascade",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain("100000");
      expect(lua).toContain("100000");
      expect(lua).toContain("670");
    });

    it("should generate Lua code for double mint strategy", () => {
      const config: TokenConfig = {
        mintingConfig: {
          buyTokens: {
            CRED_ADDRESS: { enabled: true, multiplier: 500 },
            wAR_ADDRESS: { enabled: true, multiplier: 1000 },
          },
          maxMint: "1000000",
        } as DoubleMintConfig,
        mintingStrategy: "double_mint",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain("wAR_ADDRESS");
      expect(lua).toContain("wAR_ADDRESS");
      expect(lua).toContain("CRED_ADDRESS");
    });

    it("should generate Lua code for no minting strategy", () => {
      const config: TokenConfig = {
        mintingStrategy: "none",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain(`Name = Name or "Test Token"`);
    });

    it("should handle initial allocations", () => {
      const config: TokenConfig = {
        initialAllocations: {
          ADDRESS_1: "500000",
          ADDRESS_2: "300000",
        },
        mintingStrategy: "none",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain("ADDRESS_1");
      expect(lua).toContain("500000");
      expect(lua).toContain("ADDRESS_2");
      expect(lua).toContain("300000");
    });

    it("should handle optional token properties", () => {
      const config: TokenConfig = {
        adminAddress: "ADMIN_ADDRESS",
        burnable: true,
        denomination: 8,
        description: "A test token",
        logo: "https://example.com/logo.png",
        mintingStrategy: "none",
        name: "Test Token",
        ticker: "TEST",
      };

      const lua = generateTokenLua(config);

      expect(lua).toContain("A test token");
      expect(lua).toContain("https://example.com/logo.png");
      expect(lua).toContain("8");
      expect(lua).toContain("ADMIN_ADDRESS");
    });
  });

  describe("exampleConfigs", () => {
    it("should provide valid example configurations", () => {
      expect(exampleConfigs).toBeDefined();
      expect(typeof exampleConfigs).toBe("object");

      // Check that all example configs are valid
      Object.entries(exampleConfigs).forEach(([, config]) => {
        const result = validateTokenConfig(config);
        expect(result.valid).toBe(true);
      });
    });

    it("should include basic minting example", () => {
      expect(exampleConfigs.basic).toBeDefined();
      expect(exampleConfigs.basic.mintingStrategy).toBe("basic");
    });

    it("should include cascade minting example", () => {
      expect(exampleConfigs.cascade).toBeDefined();
      expect(exampleConfigs.cascade.mintingStrategy).toBe("cascade");
    });

    it("should include double mint example", () => {
      expect(exampleConfigs.doubleMint).toBeDefined();
      expect(exampleConfigs.doubleMint.mintingStrategy).toBe("double_mint");
    });
  });
});
