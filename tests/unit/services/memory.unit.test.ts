import { beforeEach, describe, expect, it, vi } from "vitest";

import { hubService } from "../../../src/services/hub.js";
import { mockHubId } from "../../mocks/aoConnect.js";

// Mock the relay functions
vi.mock("../../../src/relay.js", () => ({
  fetchEvents: vi.fn(),
}));

// Mock VIP01Filter functions
vi.mock("../../../src/models/VIP01Filter.js", () => ({
  createVIP01Filter: vi.fn(),
}));

// Mock the memory factory
vi.mock("../../../src/messageFactory.js", () => ({
  memoryFactory: vi.fn(),
}));

describe("HubService", () => {
  const mockHubService = hubService;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetch", () => {
    it("should retrieve all memories from hub", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { memoryFactory } = await import("../../../src/messageFactory.js");

      vi.mocked(fetchEvents).mockResolvedValue([
        { Content: "Test memory 1", Id: "1" },
        { Content: "Test memory 2", Id: "2" },
      ]);

      vi.mocked(memoryFactory).mockImplementation((event) => ({
        content: event.Content,
        id: event.Id,
        importance: 0.5,
        metadata: {
          accessCount: 0,
          lastAccessed: new Date().toISOString(),
          tags: [],
        },
        p: "test-user",
        role: "user",
      }));

      const memories = await mockHubService.fetch(mockHubId);

      expect(memories).toHaveLength(2);
      expect(memories[0].content).toBe("Test memory 1");
      expect(memories[1].content).toBe("Test memory 2");
      expect(fetchEvents).toHaveBeenCalledWith(mockHubId, expect.any(String));
    });

    it("should handle empty hub gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockResolvedValue([]);

      const memories = await mockHubService.fetch(mockHubId);

      expect(memories).toHaveLength(0);
      expect(fetchEvents).toHaveBeenCalledWith(mockHubId, expect.any(String));
    });

    it("should handle fetch errors gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockRejectedValue(new Error("Network error"));

      const memories = await mockHubService.fetch(mockHubId);

      expect(memories).toHaveLength(0);
    });
  });

  describe("fetchByUser", () => {
    it("should retrieve memories for specific user", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { memoryFactory } = await import("../../../src/messageFactory.js");

      const testUser = "test-user-123";

      vi.mocked(fetchEvents).mockResolvedValue([
        { Content: "User memory 1", Id: "1", p: testUser },
      ]);

      vi.mocked(memoryFactory).mockImplementation((event) => ({
        content: event.Content,
        id: event.Id,
        importance: 0.5,
        metadata: {
          accessCount: 0,
          lastAccessed: new Date().toISOString(),
          tags: [],
        },
        p: event.p,
        role: "user",
      }));

      const memories = await mockHubService.fetchByUser(mockHubId, testUser);

      expect(memories).toHaveLength(1);
      expect(memories[0].p).toBe(testUser);
      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        expect.stringContaining(testUser),
      );
    });

    it("should return empty array for unknown user", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockResolvedValue([]);

      const memories = await mockHubService.fetchByUser(
        mockHubId,
        "unknown-user",
      );

      expect(memories).toHaveLength(0);
    });
  });

  describe("search", () => {
    it("should search memories by content", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { memoryFactory } = await import("../../../src/messageFactory.js");

      const searchTerm = "workflow";

      vi.mocked(fetchEvents).mockResolvedValue([
        { Content: "This is about workflow automation", Id: "1" },
      ]);

      vi.mocked(memoryFactory).mockImplementation((event) => ({
        content: event.Content,
        id: event.Id,
        importance: 0.5,
        metadata: {
          accessCount: 0,
          lastAccessed: new Date().toISOString(),
          tags: [],
        },
        p: "test-user",
        role: "user",
      }));

      const memories = await mockHubService.search(mockHubId, searchTerm);

      expect(memories).toHaveLength(1);
      expect(memories[0].content).toContain("workflow");
      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        expect.stringContaining(searchTerm),
      );
    });

    it("should handle search with no results", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockResolvedValue([]);

      const memories = await mockHubService.search(mockHubId, "nonexistent");

      expect(memories).toHaveLength(0);
    });

    it("should handle search errors gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockRejectedValue(new Error("Search failed"));

      const memories = await mockHubService.search(mockHubId, "test");

      expect(memories).toHaveLength(0);
    });
  });

  describe("VIP-01 Compliance", () => {
    it("should create VIP-01 compliant filter for fetch operation", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { createVIP01Filter } = await import(
        "../../../src/models/VIP01Filter.js"
      );

      vi.mocked(createVIP01Filter).mockReturnValue({
        kinds: ["10"],
        limit: 100,
      });
      vi.mocked(fetchEvents).mockResolvedValue([]);

      await mockHubService.fetch(mockHubId);

      expect(createVIP01Filter).toHaveBeenCalledWith({
        kinds: ["10"],
        limit: 100,
      });
    });

    it("should create VIP-01 compliant filter for fetchByUser operation", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { createVIP01Filter } = await import(
        "../../../src/models/VIP01Filter.js"
      );

      vi.mocked(createVIP01Filter).mockReturnValue({
        kinds: ["10"],
        limit: 100,
        tags: { p: ["test-user"] },
      });
      vi.mocked(fetchEvents).mockResolvedValue([]);

      await mockHubService.fetchByUser(mockHubId, "test-user");

      expect(createVIP01Filter).toHaveBeenCalledWith({
        kinds: ["10"],
        limit: 100,
        tags: { p: ["test-user"] },
      });
    });

    it("should create VIP-01 compliant filter for get operation", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { createVIP01Filter } = await import(
        "../../../src/models/VIP01Filter.js"
      );

      vi.mocked(createVIP01Filter).mockReturnValue({
        ids: ["test-id"],
        kinds: ["10"],
        limit: 1,
      });
      vi.mocked(fetchEvents).mockResolvedValue([
        { Content: "Test memory", Id: "test-id" },
      ]);

      await mockHubService.get(mockHubId, "test-id");

      expect(createVIP01Filter).toHaveBeenCalledWith({
        ids: ["test-id"],
        kinds: ["10"],
        limit: 1,
      });
    });

    it("should create VIP-01 compliant filter for search operation", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { createVIP01Filter } = await import(
        "../../../src/models/VIP01Filter.js"
      );

      vi.mocked(createVIP01Filter).mockReturnValue({
        kinds: ["10"],
        limit: 100,
        search: "test query",
      });
      vi.mocked(fetchEvents).mockResolvedValue([]);

      await mockHubService.search(mockHubId, "test query");

      expect(createVIP01Filter).toHaveBeenCalledWith({
        kinds: ["10"],
        limit: 100,
        search: "test query",
      });
    });

    it("should pass VIP-01 filter as JSON array to fetchEvents", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");
      const { createVIP01Filter } = await import(
        "../../../src/models/VIP01Filter.js"
      );

      const mockFilter = {
        kinds: ["10"],
        limit: 100,
        search: "test",
      };

      vi.mocked(createVIP01Filter).mockReturnValue(mockFilter);
      vi.mocked(fetchEvents).mockResolvedValue([]);

      await mockHubService.search(mockHubId, "test");

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        JSON.stringify([mockFilter]),
      );
    });
  });
});
