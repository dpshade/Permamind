import { JWKInterface } from "arweave/node/lib/wallet.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Tag } from "../../../src/models/Tag.js";
import { hubService } from "../../../src/services/HubService.js";

// Mock external dependencies
vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

import { event, fetchEvents } from "../../../src/relay.js";

describe("HubService", () => {
  let mockSigner: JWKInterface;
  let mockHubId: string;
  let mockTags: Tag[];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSigner = {} as JWKInterface;
    mockHubId = "test-hub-id";
    mockTags = [
      { name: "Action", value: "Test" },
      { name: "Data-Protocol", value: "TestProtocol" },
    ];
  });

  describe("createEvent", () => {
    it("should create event successfully", async () => {
      vi.mocked(event).mockResolvedValue(undefined);

      const result = await hubService.createEvent(
        mockSigner,
        mockHubId,
        mockTags,
        "test data",
      );

      expect(event).toHaveBeenCalledWith(
        mockSigner,
        mockHubId,
        mockTags,
        "test data",
      );
      expect(result).toEqual(mockTags);
    });

    it("should handle event creation failure gracefully", async () => {
      vi.mocked(event).mockRejectedValue(new Error("Event creation failed"));

      const result = await hubService.createEvent(
        mockSigner,
        mockHubId,
        mockTags,
        "test data",
      );

      expect(result).toEqual(mockTags);
    });

    it("should create event without data", async () => {
      vi.mocked(event).mockResolvedValue(undefined);

      const result = await hubService.createEvent(
        mockSigner,
        mockHubId,
        mockTags,
      );

      expect(event).toHaveBeenCalledWith(
        mockSigner,
        mockHubId,
        mockTags,
        undefined,
      );
      expect(result).toEqual(mockTags);
    });
  });

  describe("fetch", () => {
    it("should fetch events for hub", async () => {
      const mockEvents = [
        { data: "test1", id: "event1" },
        { data: "test2", id: "event2" },
      ];
      vi.mocked(fetchEvents).mockResolvedValue(mockEvents);

      const result = await hubService.fetch(mockHubId);

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"kinds":["10"],"limit":100}]',
      );
      expect(result).toEqual(mockEvents);
    });

    it("should handle fetch failure", async () => {
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Fetch failed"));

      const result = await hubService.fetch(mockHubId);

      expect(result).toEqual([{ kinds: ["10"], limit: 100 }]);
    });
  });

  describe("fetchByUser", () => {
    it("should fetch events for specific user", async () => {
      const mockUser = "test-user";
      const mockEvents = [{ id: "event1", user: mockUser }];
      vi.mocked(fetchEvents).mockResolvedValue(mockEvents);

      const result = await hubService.fetchByUser(mockHubId, mockUser);

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"kinds":["10"],"limit":100},{"tags":{"p":["test-user"]}}]',
      );
      expect(result).toEqual(mockEvents);
    });

    it("should handle fetchByUser failure", async () => {
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Fetch failed"));

      const result = await hubService.fetchByUser(mockHubId, "test-user");

      expect(result).toEqual([
        { kinds: ["10"], limit: 100 },
        { tags: { p: ["test-user"] } },
      ]);
    });
  });

  describe("get", () => {
    it("should get specific event by ID", async () => {
      const mockEvent = { data: "test data", id: "event1" };
      vi.mocked(fetchEvents).mockResolvedValue([mockEvent]);

      const result = await hubService.get(mockHubId, "event1");

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"ids":["event1"],"kinds":["10"],"limit":1}]',
      );
      expect(result).toEqual(mockEvent);
    });

    it("should throw when event not found", async () => {
      vi.mocked(fetchEvents).mockResolvedValue([]);

      await expect(hubService.get(mockHubId, "nonexistent")).rejects.toThrow(
        "Not Found",
      );
    });

    it("should handle get failure", async () => {
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Get failed"));

      await expect(hubService.get(mockHubId, "event1")).rejects.toThrow(
        "Get failed",
      );
    });
  });

  describe("loadProcessIntegrations", () => {
    it("should load process integrations with default parameters", async () => {
      const mockIntegrations = [
        { id: "integration1", type: "process" },
        { id: "integration2", type: "process" },
      ];
      vi.mocked(fetchEvents).mockResolvedValue(mockIntegrations);

      const result = await hubService.loadProcessIntegrations(mockHubId);

      expect(fetchEvents).toHaveBeenCalledWith(mockHubId, "[]");
      expect(result).toEqual(mockIntegrations);
    });

    it("should load process integrations with search query", async () => {
      const mockIntegrations = [{ id: "integration1", type: "process" }];
      vi.mocked(fetchEvents).mockResolvedValue(mockIntegrations);

      const result = await hubService.loadProcessIntegrations(
        mockHubId,
        "test query",
        50,
      );

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"kinds":["11"],"limit":50,"search":"test query"}]',
      );
      expect(result).toEqual(mockIntegrations);
    });

    it("should handle loadProcessIntegrations failure", async () => {
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Load failed"));

      const result = await hubService.loadProcessIntegrations(mockHubId);

      expect(result).toEqual([]);
    });
  });

  describe("publishProcessIntegration", () => {
    it("should publish process integration", async () => {
      vi.mocked(event).mockResolvedValue(undefined);
      const processMarkdown = "# Test Process\nThis is a test process";

      await hubService.publishProcessIntegration(
        mockSigner,
        mockHubId,
        mockTags,
        processMarkdown,
      );

      expect(event).toHaveBeenCalledWith(
        mockSigner,
        mockHubId,
        mockTags,
        processMarkdown,
      );
    });

    it("should handle publishProcessIntegration failure silently", async () => {
      vi.mocked(event).mockRejectedValue(new Error("Publish failed"));
      const processMarkdown = "# Test Process";

      // Should not throw - errors are handled silently
      await hubService.publishProcessIntegration(
        mockSigner,
        mockHubId,
        mockTags,
        processMarkdown,
      );

      expect(event).toHaveBeenCalledWith(
        mockSigner,
        mockHubId,
        mockTags,
        processMarkdown,
      );
    });
  });

  describe("search", () => {
    it("should search events by value and kind", async () => {
      const mockResults = [
        { id: "result1", kind: "memory", value: "test" },
        { id: "result2", kind: "memory", value: "test data" },
      ];
      vi.mocked(fetchEvents).mockResolvedValue(mockResults);

      const result = await hubService.search(mockHubId, "test", "memory");

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"kinds":["memory"],"limit":100,"search":"test"}]',
      );
      expect(result).toEqual(mockResults);
    });

    it("should handle search failure", async () => {
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Search failed"));

      const result = await hubService.search(mockHubId, "test", "memory");

      expect(result).toEqual([
        { kinds: ["memory"], limit: 100, search: "test" },
      ]);
    });

    it("should search with different kinds", async () => {
      const mockResults = [{ id: "result1", kind: "workflow" }];
      vi.mocked(fetchEvents).mockResolvedValue(mockResults);

      const result = await hubService.search(mockHubId, "workflow", "workflow");

      expect(fetchEvents).toHaveBeenCalledWith(
        mockHubId,
        '[{"kinds":["workflow"],"limit":100,"search":"workflow"}]',
      );
      expect(result).toEqual(mockResults);
    });
  });

  describe("service integration", () => {
    it("should maintain consistent service interface", () => {
      expect(hubService).toBeDefined();
      expect(typeof hubService.createEvent).toBe("function");
      expect(typeof hubService.fetch).toBe("function");
      expect(typeof hubService.fetchByUser).toBe("function");
      expect(typeof hubService.get).toBe("function");
      expect(typeof hubService.loadProcessIntegrations).toBe("function");
      expect(typeof hubService.publishProcessIntegration).toBe("function");
      expect(typeof hubService.search).toBe("function");
    });
  });
});
