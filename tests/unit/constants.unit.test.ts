import { describe, expect, it } from "vitest";

import { formatNumber } from "../../src/constants.js";

describe("Constants", () => {
  describe("formatNumber", () => {
    it("should format numbers with commas", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1234567)).toBe("1,234,567");
      expect(formatNumber(999)).toBe("999");
    });

    it("should handle small numbers", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(1)).toBe("1");
      expect(formatNumber(99)).toBe("99");
    });

    it("should handle large numbers", () => {
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(1234567890)).toBe("1,234,567,890");
    });

    it("should handle negative numbers", () => {
      expect(formatNumber(-1000)).toBe("-1,000");
      expect(formatNumber(-1234567)).toBe("-1,234,567");
    });

    it("should handle decimal numbers", () => {
      expect(formatNumber(1000.5)).toBe("1,000.5");
      expect(formatNumber(1234567.89)).toBe("1,234,567.89");
    });

    it("should handle edge cases", () => {
      expect(formatNumber(0.1)).toBe("0.1");
      expect(formatNumber(0.01)).toBe("0.01");
      expect(formatNumber(999.99)).toBe("999.99");
    });
  });
});
