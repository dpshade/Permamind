import { describe, expect, it } from "vitest";

// Filter types replaced with manual interface
interface Filter {
  authors?: string[];
  ids?: string[];
  kinds?: string[];
  limit?: number;
  search?: string;
  since?: number;
  tags?: Record<string, string[]>;
  until?: number;
}
import {
  applyClientSideFiltering,
  extractTimestamp,
  extractTimestamps,
  generateFilterStats,
  isProperlysorted,
  processVIP01Results,
  sortByTimestamp,
} from "../../../src/utils/vip01Processing.js";

describe("VIP01Processing", () => {
  // Sample test events with timestamps
  const testEvents = [
    { Content: "first event", Id: "1", Timestamp: "1000000000" },
    { Content: "second event", Id: "2", Timestamp: "2000000000" },
    { Content: "third event", Id: "3", Timestamp: "1500000000" },
    { Content: "fourth event", Id: "4", Timestamp: 3000000000 }, // Number timestamp
  ];

  const testEventsUnsorted = [
    { Content: "old event", Id: "1", Timestamp: "1000000000" },
    { Content: "newest event", Id: "2", Timestamp: "3000000000" },
    { Content: "middle event", Id: "3", Timestamp: "2000000000" },
  ];

  describe("extractTimestamp", () => {
    it("should extract timestamp from string", () => {
      const event = { Timestamp: "1234567890" };
      expect(extractTimestamp(event)).toBe(1234567890);
    });

    it("should extract timestamp from number", () => {
      const event = { Timestamp: 1234567890 };
      expect(extractTimestamp(event)).toBe(1234567890);
    });

    it("should return 0 for invalid timestamp", () => {
      expect(extractTimestamp({ Timestamp: "invalid" })).toBe(0);
      expect(extractTimestamp({ Timestamp: null })).toBe(0);
      expect(extractTimestamp({})).toBe(0);
      expect(extractTimestamp(null)).toBe(0);
    });

    it("should return 0 for missing timestamp", () => {
      const event = { Content: "no timestamp", Id: "test" };
      expect(extractTimestamp(event)).toBe(0);
    });
  });

  describe("extractTimestamps", () => {
    it("should extract all valid timestamps", () => {
      const timestamps = extractTimestamps(testEvents);
      expect(timestamps).toEqual([
        1000000000, 2000000000, 1500000000, 3000000000,
      ]);
    });

    it("should filter out invalid timestamps", () => {
      const eventsWithInvalid = [
        { Timestamp: "1000000000" },
        { Timestamp: "invalid" },
        { NoTimestamp: "value" },
        { Timestamp: 2000000000 },
      ];

      const timestamps = extractTimestamps(eventsWithInvalid);
      expect(timestamps).toEqual([1000000000, 2000000000]);
    });

    it("should return empty array for events without timestamps", () => {
      const eventsWithoutTimestamps = [
        { Content: "no timestamp", Id: "1" },
        { Content: "also no timestamp", Id: "2" },
      ];

      expect(extractTimestamps(eventsWithoutTimestamps)).toEqual([]);
    });
  });

  describe("sortByTimestamp", () => {
    it("should sort events by timestamp (newest first)", () => {
      const sorted = sortByTimestamp([...testEventsUnsorted]);

      expect(sorted.map((e: Record<string, unknown>) => e.Id)).toEqual([
        "2",
        "3",
        "1",
      ]);
      expect(
        sorted.map((e: Record<string, unknown>) => extractTimestamp(e)),
      ).toEqual([3000000000, 2000000000, 1000000000]);
    });

    it("should handle events without timestamps", () => {
      const eventsWithoutTimestamps = [
        { Content: "no timestamp", Id: "1" },
        { Content: "also no timestamp", Id: "2" },
      ];

      const sorted = sortByTimestamp(eventsWithoutTimestamps);
      expect(sorted).toHaveLength(2);
      // Order should remain stable for events with timestamp 0
    });

    it("should handle mixed valid and invalid timestamps", () => {
      const mixedEvents = [
        { Id: "1", Timestamp: "1000000000" },
        { Content: "no timestamp", Id: "2" },
        { Id: "3", Timestamp: "2000000000" },
      ];

      const sorted = sortByTimestamp(mixedEvents);
      expect(sorted[0]).toEqual({ Id: "3", Timestamp: "2000000000" });
      expect(sorted[1]).toEqual({ Id: "1", Timestamp: "1000000000" });
    });
  });

  describe("isProperlySorted", () => {
    it("should return true for properly sorted events", () => {
      const sortedEvents = [
        { Timestamp: "3000000000" },
        { Timestamp: "2000000000" },
        { Timestamp: "1000000000" },
      ];

      expect(isProperlysorted(sortedEvents)).toBe(true);
    });

    it("should return false for improperly sorted events", () => {
      const unsortedEvents = [
        { Timestamp: "1000000000" },
        { Timestamp: "3000000000" },
        { Timestamp: "2000000000" },
      ];

      expect(isProperlysorted(unsortedEvents)).toBe(false);
    });

    it("should return true for single event", () => {
      const singleEvent = [{ Timestamp: "1000000000" }];
      expect(isProperlysorted(singleEvent)).toBe(true);
    });

    it("should return true for empty array", () => {
      expect(isProperlysorted([])).toBe(true);
    });

    it("should handle events without timestamps", () => {
      const eventsWithoutTimestamps = [
        { Content: "no timestamp", Id: "1" },
        { Content: "also no timestamp", Id: "2" },
      ];

      expect(isProperlysorted(eventsWithoutTimestamps)).toBe(true);
    });
  });

  describe("processVIP01Results", () => {
    const testFilter: Filter = {
      kinds: ["10"],
      limit: 2,
    };

    it("should process results with sorting and limiting", () => {
      const result = processVIP01Results(testEventsUnsorted, testFilter, {
        enableClientLimiting: true,
        enableSorting: true,
        includeMetadata: true,
      });

      expect(result.events).toHaveLength(2);
      expect((result.events[0] as Record<string, unknown>).Id).toBe("2"); // Newest first
      expect(result.totalCount).toBe(3);
      expect(result.hasMore).toBe(true);
      expect(result.newestTimestamp).toBe(3000000000);
      expect(result.oldestTimestamp).toBe(2000000000); // Oldest in limited result set
    });

    it("should process results without sorting", () => {
      const result = processVIP01Results(testEventsUnsorted, testFilter, {
        enableClientLimiting: true,
        enableSorting: false,
      });

      expect(result.events).toHaveLength(2);
      expect((result.events[0] as Record<string, unknown>).Id).toBe("1"); // Original order
    });

    it("should process results without limiting", () => {
      const result = processVIP01Results(testEventsUnsorted, testFilter, {
        enableClientLimiting: false,
        enableSorting: true,
      });

      expect(result.events).toHaveLength(3); // All events
    });

    it("should handle empty events array", () => {
      const result = processVIP01Results([], testFilter);

      expect(result.events).toEqual([]);
      expect(result.totalCount).toBeUndefined(); // No metadata by default
    });

    it("should handle events count less than limit", () => {
      const smallFilter: Filter = { kinds: ["10"], limit: 10 };
      const result = processVIP01Results(testEventsUnsorted, smallFilter, {
        includeMetadata: true,
      });

      expect(result.events).toHaveLength(3);
      expect(result.hasMore).toBe(false);
    });
  });

  describe("applyClientSideFiltering", () => {
    const testEventsForFiltering = [
      { Content: "test content", Id: "1", Timestamp: "1000000000" },
      { Content: "other content", Id: "2", Timestamp: "2000000000" },
      { Content: "test again", Id: "3", Timestamp: "3000000000" },
    ];

    it("should filter by since timestamp", () => {
      const filter: Filter = {
        kinds: ["10"],
        since: 1500000000,
      };

      const filtered = applyClientSideFiltering(testEventsForFiltering, filter);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((e: Record<string, unknown>) => e.Id)).toEqual([
        "2",
        "3",
      ]);
    });

    it("should filter by until timestamp", () => {
      const filter: Filter = {
        kinds: ["10"],
        until: 2500000000,
      };

      const filtered = applyClientSideFiltering(testEventsForFiltering, filter);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((e: Record<string, unknown>) => e.Id)).toEqual([
        "1",
        "2",
      ]);
    });

    it("should filter by search text", () => {
      const filter: Filter = {
        kinds: ["10"],
        search: "test",
      };

      const filtered = applyClientSideFiltering(testEventsForFiltering, filter);

      expect(filtered).toHaveLength(2);
      expect(filtered.map((e: Record<string, unknown>) => e.Id)).toEqual([
        "1",
        "3",
      ]);
    });

    it("should apply multiple filters", () => {
      const filter: Filter = {
        kinds: ["10"],
        search: "test",
        since: 1500000000,
      };

      const filtered = applyClientSideFiltering(testEventsForFiltering, filter);

      expect(filtered).toHaveLength(1);
      expect((filtered[0] as Record<string, unknown>).Id).toBe("3");
    });

    it("should handle events without content for search", () => {
      const eventsWithoutContent = [
        { Id: "1", Timestamp: "1000000000" },
        { Id: "2", SomeOtherField: "test" },
      ];

      const filter: Filter = {
        kinds: ["10"],
        search: "test",
      };

      const filtered = applyClientSideFiltering(eventsWithoutContent, filter);
      expect(filtered).toHaveLength(0);
    });
  });

  describe("generateFilterStats", () => {
    it("should identify direct lookup filter", () => {
      const filter: Filter = {
        ids: ["id1", "id2"],
        kinds: ["10"],
      };

      const stats = generateFilterStats(filter, 1000, 2);

      expect(stats.filterType).toBe("direct_lookup");
      expect(stats.optimizationHint).toBe("index_by_id");
      expect(stats.parameters).toContain("ids");
      expect(stats.efficiency).toBe(1); // (1000-2)/1000 but rounded
    });

    it("should identify single author optimization", () => {
      const filter: Filter = {
        authors: ["author1"],
        kinds: ["10"],
      };

      const stats = generateFilterStats(filter, 500, 50);

      expect(stats.filterType).toBe("author_lookup");
      expect(stats.optimizationHint).toBe("index_by_author");
      expect(stats.parameters).toContain("single_author");
      expect(stats.efficiency).toBe(0.9); // (500-50)/500 = 0.9
    });

    it("should identify text search filter", () => {
      const filter: Filter = {
        kinds: ["10"],
        search: "query",
      };

      const stats = generateFilterStats(filter, 200, 20);

      expect(stats.filterType).toBe("text_search");
      expect(stats.parameters).toContain("search");
      expect(stats.efficiency).toBe(0.9);
    });

    it("should identify complex filter", () => {
      const filter: Filter = {
        authors: ["author1", "author2"],
        kinds: ["10", "11"],
        since: 1000000000,
        tags: { ai_type: ["knowledge"] },
      };

      const stats = generateFilterStats(filter, 1000, 100);

      expect(stats.filterType).toBe("complex");
      expect(stats.optimizationHint).toBe("full_scan");
      expect(stats.parameters).toContain("multi_author");
      expect(stats.parameters).toContain("multi_kind");
      expect(stats.parameters).toContain("tags");
      expect(stats.parameters).toContain("time_range");
    });

    it("should handle zero original count", () => {
      const filter: Filter = { kinds: ["10"] };
      const stats = generateFilterStats(filter, 0, 0);

      expect(stats.efficiency).toBe(0);
    });
  });
});
