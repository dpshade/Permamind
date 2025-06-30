import { beforeEach, describe, expect, it, vi } from "vitest";

import { memoryService } from "../../../src/services/memory.js";
import { mockHubId } from "../../mocks/aoConnect.js";

// Mock the relay functions
vi.mock("../../../src/relay.js", () => ({
  fetchEvents: vi.fn(),
}));

// Mock the memory factory
vi.mock("../../../src/messageFactory.js", () => ({
  memoryFactory: vi.fn(),
}));

describe("MemoryService", () => {
  const mockMemoryService = memoryService;

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

      const memories = await mockMemoryService.fetch(mockHubId);

      expect(memories).toHaveLength(2);
      expect(memories[0].content).toBe("Test memory 1");
      expect(memories[1].content).toBe("Test memory 2");
      expect(fetchEvents).toHaveBeenCalledWith(mockHubId, expect.any(String));
    });

    it("should handle empty hub gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockResolvedValue([]);

      const memories = await mockMemoryService.fetch(mockHubId);

      expect(memories).toHaveLength(0);
      expect(fetchEvents).toHaveBeenCalledWith(mockHubId, expect.any(String));
    });

    it("should handle fetch errors gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockRejectedValue(new Error("Network error"));

      const memories = await mockMemoryService.fetch(mockHubId);

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

      const memories = await mockMemoryService.fetchByUser(mockHubId, testUser);

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

      const memories = await mockMemoryService.fetchByUser(
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

      const memories = await mockMemoryService.search(mockHubId, searchTerm);

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

      const memories = await mockMemoryService.search(mockHubId, "nonexistent");

      expect(memories).toHaveLength(0);
    });

    it("should handle search errors gracefully", async () => {
      const { fetchEvents } = await import("../../../src/relay.js");

      vi.mocked(fetchEvents).mockRejectedValue(new Error("Search failed"));

      const memories = await mockMemoryService.search(mockHubId, "test");

      expect(memories).toHaveLength(0);
    });
  });
});
