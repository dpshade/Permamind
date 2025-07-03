import { describe, expect, it } from "vitest";

import {
  generateSimpleTokenLua,
  type SimpleTokenConfig,
  validateSimpleTokenConfig,
} from "../../../src/services/simpleToken.js";

describe("SimpleToken Service", () => {
  describe("validateSimpleTokenConfig", () => {
    it("should validate a complete valid configuration", () => {
      const config: SimpleTokenConfig = {
        denomination: 12,
        description: "A test token",
        logo: "https://example.com/logo.png",
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should validate minimal required configuration", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(true);
    });

    it("should reject configuration with missing required fields", () => {
      const config = {
        name: "Test Token",
        ticker: "TEST",
        // Missing totalSupply
      } as SimpleTokenConfig;

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject configuration with invalid ticker format", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST_TOKEN_WITH_VERY_LONG_NAME",
        totalSupply: "1000000",
      };

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject configuration with invalid total supply", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "invalid_number",
      };

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(false);
    });

    it("should reject configuration with negative denomination", () => {
      const config: SimpleTokenConfig = {
        denomination: -1,
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const result = validateSimpleTokenConfig(config);
      expect(result.valid).toBe(false);
    });
  });

  describe("generateSimpleTokenLua", () => {
    it("should generate valid Lua code for minimal configuration", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain(`TotalSupply = TotalSupply or "1000000"`);
      expect(lua).toContain(`Denomination = Denomination or 12`);
      expect(lua).toContain("Balances[Owner] = TotalSupply");
    });

    it("should generate valid Lua code for complete configuration", () => {
      const config: SimpleTokenConfig = {
        denomination: 8,
        description: "A test token for testing",
        logo: "https://example.com/logo.png",
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(config);

      expect(lua).toContain(`Name = Name or "Test Token"`);
      expect(lua).toContain(`Ticker = Ticker or "TEST"`);
      expect(lua).toContain(`TotalSupply = TotalSupply or "1000000"`);
      expect(lua).toContain(`Denomination = Denomination or 8`);
      expect(lua).toContain(
        `Description = Description or "A test token for testing"`,
      );
      expect(lua).toContain(`Logo = Logo or "https://example.com/logo.png"`);
    });

    it("should handle special characters in token name and description", () => {
      const config: SimpleTokenConfig = {
        description: "Description with 'quotes' and \"double quotes\"",
        name: "Test Token with 'quotes' and \"double quotes\"",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(config);

      expect(lua).toContain("Test Token with");
      expect(lua).toContain("Description with");
      // Should not break Lua syntax
      expect(lua).toContain("Name = Name or");
      expect(lua).toContain("Description = Description or");
    });

    it("should generate required handlers", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(config);

      // Should contain standard token handlers
      expect(lua).toContain("balance");
      expect(lua).toContain("transfer");
      expect(lua).toContain("info");
    });

    it("should set owner as initial balance holder", () => {
      const config: SimpleTokenConfig = {
        name: "Test Token",
        ticker: "TEST",
        totalSupply: "1000000",
      };

      const lua = generateSimpleTokenLua(config);

      expect(lua).toContain("Owner = Owner or ao.id");
      expect(lua).toContain("Balances[Owner] = TotalSupply");
    });
  });
});
