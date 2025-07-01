import { describe, expect, it } from "vitest";

import {
  createVIP01Filter,
  isVIP01Filter,
  LegacyFilter,
  legacyToVIP01Filter,
  VIP01Filter,
} from "../../../src/models/VIP01Filter.js";

describe("VIP01Filter", () => {
  describe("isVIP01Filter", () => {
    it("should return true for valid VIP-01 filter", () => {
      const validFilter: VIP01Filter = {
        authors: ["author1"],
        ids: ["id1", "id2"],
        kinds: ["10"],
        limit: 100,
        search: "test query",
        since: 1234567890,
        tags: { ai_type: ["knowledge"] },
        until: 1234567899,
      };

      expect(isVIP01Filter(validFilter)).toBe(true);
    });

    it("should return true for minimal valid filter", () => {
      const minimalFilter: VIP01Filter = {
        kinds: ["10"],
      };

      expect(isVIP01Filter(minimalFilter)).toBe(true);
    });

    it("should return false for invalid ids array", () => {
      const invalidFilter = {
        ids: [123, "string"], // Mixed types
        kinds: ["10"],
      };

      expect(isVIP01Filter(invalidFilter)).toBe(false);
    });

    it("should return false for invalid authors array", () => {
      const invalidFilter = {
        authors: [null, undefined],
        kinds: ["10"],
      };

      expect(isVIP01Filter(invalidFilter)).toBe(false);
    });

    it("should return false for invalid timestamp", () => {
      const invalidFilter = {
        kinds: ["10"],
        since: "not a number",
      };

      expect(isVIP01Filter(invalidFilter)).toBe(false);
    });

    it("should return false for invalid limit", () => {
      const invalidFilter = {
        kinds: ["10"],
        limit: 1500, // Exceeds max of 1000
      };

      expect(isVIP01Filter(invalidFilter)).toBe(false);
    });

    it("should return false for invalid tags structure", () => {
      const invalidFilter = {
        kinds: ["10"],
        tags: ["not", "an", "object"], // Should be object, not array
      };

      expect(isVIP01Filter(invalidFilter)).toBe(false);
    });

    it("should return false for non-object input", () => {
      expect(isVIP01Filter("string")).toBe(false);
      expect(isVIP01Filter(123)).toBe(false);
      expect(isVIP01Filter(null)).toBe(false);
      expect(isVIP01Filter(undefined)).toBe(false);
    });
  });

  describe("createVIP01Filter", () => {
    it("should create a valid VIP-01 filter from partial input", () => {
      const input = {
        kinds: ["10"],
        limit: 50,
        search: "test",
      };

      const result = createVIP01Filter(input);

      expect(result).toEqual({
        kinds: ["10"],
        limit: 50,
        search: "test",
      });
      expect(isVIP01Filter(result)).toBe(true);
    });

    it("should enforce limit constraints", () => {
      const inputWithHighLimit = {
        kinds: ["10"],
        limit: 2000, // Above max
      };

      const result = createVIP01Filter(inputWithHighLimit);
      expect(result.limit).toBe(1000); // Should be clamped to max

      const inputWithLowLimit = {
        kinds: ["10"],
        limit: -5, // Below min
      };

      const result2 = createVIP01Filter(inputWithLowLimit);
      expect(result2.limit).toBe(1); // Should be clamped to min
    });

    it("should throw error for invalid filter parameters", () => {
      const invalidInput = {
        ids: [123], // Invalid type
        kinds: ["10"],
      };

      expect(() => createVIP01Filter(invalidInput as never)).toThrow(
        "Invalid VIP-01 filter parameters",
      );
    });

    it("should handle complex filter with all parameters", () => {
      const complexInput = {
        authors: ["author1", "author2"],
        ids: ["id1", "id2"],
        kinds: ["10", "11"],
        limit: 250,
        search: "complex query",
        since: 1000000000,
        tags: {
          ai_type: ["knowledge", "reasoning"],
          p: ["user1"],
        },
        until: 2000000000,
      };

      const result = createVIP01Filter(complexInput);

      expect(result).toEqual(complexInput);
      expect(isVIP01Filter(result)).toBe(true);
    });
  });

  describe("legacyToVIP01Filter", () => {
    it("should convert single legacy filter to VIP-01", () => {
      const legacyFilters: LegacyFilter[] = [
        {
          kinds: ["10"],
          search: "test",
          tags: { p: ["user1"] },
        },
      ];

      const result = legacyToVIP01Filter(legacyFilters);

      expect(result).toEqual({
        kinds: ["10"],
        search: "test",
        tags: { p: ["user1"] },
      });
    });

    it("should merge multiple legacy filters", () => {
      const legacyFilters: LegacyFilter[] = [
        {
          kinds: ["10"],
          tags: { p: ["user1"] },
        },
        {
          kinds: ["11"],
          search: "test",
          tags: { ai_type: ["knowledge"] },
        },
      ];

      const result = legacyToVIP01Filter(legacyFilters);

      expect(result).toEqual({
        kinds: ["10", "11"],
        search: "test",
        tags: {
          ai_type: ["knowledge"],
          p: ["user1"],
        },
      });
    });

    it("should handle multiple IDs from different filters", () => {
      const legacyFilters: LegacyFilter[] = [
        {
          ids: ["id1", "id2"],
          kinds: ["10"],
        },
        {
          ids: ["id3"],
          kinds: ["11"],
        },
      ];

      const result = legacyToVIP01Filter(legacyFilters);

      expect(result).toEqual({
        ids: ["id1", "id2", "id3"],
        kinds: ["10", "11"],
      });
    });

    it("should handle empty legacy filters array", () => {
      const result = legacyToVIP01Filter([]);
      expect(result).toEqual({});
    });

    it("should overwrite search when multiple filters have search", () => {
      const legacyFilters: LegacyFilter[] = [
        {
          kinds: ["10"],
          search: "first query",
        },
        {
          kinds: ["11"],
          search: "second query",
        },
      ];

      const result = legacyToVIP01Filter(legacyFilters);

      expect(result.search).toBe("second query"); // Last one wins
      expect(result.kinds).toEqual(["10", "11"]);
    });
  });

  describe("VIP01Filter edge cases", () => {
    it("should handle empty arrays in filter", () => {
      const filterWithEmptyArrays = {
        authors: [],
        ids: [],
        kinds: [],
      };

      expect(isVIP01Filter(filterWithEmptyArrays)).toBe(true);
    });

    it("should handle empty tags object", () => {
      const filterWithEmptyTags = {
        kinds: ["10"],
        tags: {},
      };

      expect(isVIP01Filter(filterWithEmptyTags)).toBe(true);
    });

    it("should handle zero timestamps", () => {
      const filterWithZeroTimestamps = {
        kinds: ["10"],
        since: 0,
        until: 0,
      };

      expect(isVIP01Filter(filterWithZeroTimestamps)).toBe(true);
    });

    it("should handle minimum and maximum limits", () => {
      const filterWithMinLimit = createVIP01Filter({
        kinds: ["10"],
        limit: 1,
      });

      const filterWithMaxLimit = createVIP01Filter({
        kinds: ["10"],
        limit: 1000,
      });

      expect(filterWithMinLimit.limit).toBe(1);
      expect(filterWithMaxLimit.limit).toBe(1000);
    });
  });
});
