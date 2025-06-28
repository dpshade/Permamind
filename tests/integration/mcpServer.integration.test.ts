import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { aiMemoryService } from "../../src/services/aiMemoryService.js";
import {
  basicMemory,
  batchMemories,
  testReasoningChain,
} from "../fixtures/memories.js";

// Mock external dependencies
vi.mock("../../src/relay.js");
vi.mock("../../src/process.js");
vi.mock("../../src/services/registry.js");

describe("MCP Server Integration Tests", () => {
  let mockKeyPair: Record<string, unknown>;
  let mockHubId: string;

  beforeAll(async () => {
    // Setup test environment
    mockKeyPair = { e: "AQAB", kty: "RSA", n: "test_n" };
    mockHubId = "test_hub_integration";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    // Cleanup test environment
  });

  describe("Enhanced Memory Operations Integration", () => {
    it("should handle complete enhanced memory workflow", async () => {
      // Test the full workflow: add -> search -> link -> analyze

      // 1. Add enhanced memory
      const addResult = await aiMemoryService.addEnhanced(
        mockKeyPair,
        mockHubId,
        basicMemory,
      );
      expect(addResult).toBe("Enhanced memory added successfully");

      // 2. Search for the memory
      const { fetchEvents } = await import("../../src/relay.js");
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          ai_importance: basicMemory.importance!.toString(),
          ai_type: basicMemory.memoryType,
          Content: basicMemory.content,
          Id: "mem_123",
          Timestamp: "2024-01-01T00:00:00.000Z",
        },
      ]);

      const searchResults = await aiMemoryService.searchAdvanced(
        mockHubId,
        "TypeScript",
        { importanceThreshold: 0.5, memoryType: "knowledge" },
      );
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].content).toBe(basicMemory.content);

      // 3. Create memory relationship
      const linkResult = await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        "mem_123",
        "mem_456",
        { strength: 0.8, targetId: "mem_456", type: "supports" },
      );
      expect(linkResult).toBe("Memory link created successfully");

      // 4. Get analytics
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          ai_importance: basicMemory.importance!.toString(),
          ai_type: basicMemory.memoryType,
          Content: basicMemory.content,
          Id: "mem_123",
        },
      ]);

      const analytics = await aiMemoryService.getMemoryAnalytics(mockHubId);
      expect(analytics.totalMemories).toBe(1);
      expect(analytics.memoryTypeDistribution.knowledge).toBe(1);
    });

    it("should handle batch operations with error recovery", async () => {
      const { event } = await import("../../src/relay.js");

      // Mock partial failure - first two succeed, third fails
      vi.mocked(event)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error("Network timeout"));

      await expect(
        aiMemoryService.addMemoriesBatch(
          mockKeyPair,
          mockHubId,
          batchMemories,
          "test_user",
        ),
      ).rejects.toThrow("Failed to add memories batch");
    });

    it("should handle concurrent memory operations", async () => {
      const { event } = await import("../../src/relay.js");
      vi.mocked(event).mockResolvedValue({ success: true });

      // Simulate concurrent operations
      const operations = [
        aiMemoryService.addEnhanced(mockKeyPair, mockHubId, {
          ...basicMemory,
          content: "Memory 1",
        }),
        aiMemoryService.addEnhanced(mockKeyPair, mockHubId, {
          ...basicMemory,
          content: "Memory 2",
        }),
        aiMemoryService.addEnhanced(mockKeyPair, mockHubId, {
          ...basicMemory,
          content: "Memory 3",
        }),
      ];

      const results = await Promise.all(operations);
      expect(
        results.every((r) => r === "Enhanced memory added successfully"),
      ).toBe(true);
      expect(event).toHaveBeenCalledTimes(3);
    });
  });

  describe("Reasoning Chain Integration", () => {
    it("should handle complete reasoning workflow", async () => {
      // 1. Add reasoning chain
      const addResult = await aiMemoryService.addReasoningChain(
        mockKeyPair,
        mockHubId,
        testReasoningChain,
        "ai_agent_key",
      );
      expect(addResult).toBe("Reasoning chain added successfully");

      // 2. Retrieve reasoning chain
      const { fetchEvents } = await import("../../src/relay.js");
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          chainId: testReasoningChain.chainId,
          outcome: testReasoningChain.outcome,
          steps: JSON.stringify(testReasoningChain.steps),
        },
      ]);

      const retrievedChain = await aiMemoryService.getReasoningChain(
        mockHubId,
        testReasoningChain.chainId,
      );

      expect(retrievedChain).not.toBeNull();
      expect(retrievedChain!.chainId).toBe(testReasoningChain.chainId);
      expect(retrievedChain!.steps).toHaveLength(
        testReasoningChain.steps.length,
      );
    });

    it("should handle reasoning chain with memory relationships", async () => {
      // 1. Add reasoning chain
      await aiMemoryService.addReasoningChain(
        mockKeyPair,
        mockHubId,
        testReasoningChain,
        "ai_agent",
      );

      // 2. Add related memory
      await aiMemoryService.addEnhanced(mockKeyPair, mockHubId, {
        content: "Redis implementation details",
        importance: 0.9,
        memoryType: "knowledge",
        p: "ai_agent",
        role: "system",
      });

      // 3. Link reasoning chain to memory
      const linkResult = await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        "reasoning_chain_memory",
        "redis_details_memory",
        { strength: 0.9, targetId: "redis_details_memory", type: "supports" },
      );

      expect(linkResult).toBe("Memory link created successfully");
    });
  });

  describe("Memory Context Integration", () => {
    it("should handle context-based memory organization", async () => {
      // 1. Create memory context
      const contextResult = await aiMemoryService.createMemoryContext(
        mockKeyPair,
        mockHubId,
        "Authentication Project",
        "Project for implementing user authentication",
        "project_manager",
      );
      expect(contextResult).toBe("Memory context created successfully");

      // 2. Add memories to context
      const contextMemory = {
        ...basicMemory,
        context: {
          ...basicMemory.context,
          contextId: "auth_project_context",
        },
      };

      await aiMemoryService.addEnhanced(mockKeyPair, mockHubId, contextMemory);

      // 3. Retrieve context memories
      const { fetchEvents } = await import("../../src/relay.js");
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          ai_context_id: "auth_project_context",
          Content: contextMemory.content,
          Id: "ctx_mem_1",
        },
      ]);

      const contextMemories = await aiMemoryService.getContextMemories(
        mockHubId,
        "auth_project_context",
      );

      expect(contextMemories).toHaveLength(1);
    });
  });

  describe("Search and Analytics Integration", () => {
    it("should handle complex search scenarios", async () => {
      const { fetchEvents } = await import("../../src/relay.js");

      // Mock diverse memory results
      const mockMemories = [
        {
          ai_domain: "programming",
          ai_importance: "0.9",
          ai_type: "knowledge",
          Content: "TypeScript configuration",
          Id: "mem_1",
          Timestamp: "2024-01-01T00:00:00.000Z",
        },
        {
          ai_domain: "programming",
          ai_importance: "0.7",
          ai_type: "procedure",
          Content: "JavaScript debugging",
          Id: "mem_2",
          Timestamp: "2024-01-02T00:00:00.000Z",
        },
        {
          ai_domain: "design",
          ai_importance: "0.6",
          ai_type: "knowledge",
          Content: "User interface design",
          Id: "mem_3",
          Timestamp: "2024-01-03T00:00:00.000Z",
        },
      ];

      vi.mocked(fetchEvents).mockResolvedValueOnce(mockMemories);

      // Test filtered search
      const searchResults = await aiMemoryService.searchAdvanced(
        mockHubId,
        "programming",
        {
          domain: "programming",
          importanceThreshold: 0.8,
          memoryType: "knowledge",
        },
      );

      // Should return only TypeScript memory (knowledge + programming + importance >= 0.8)
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].content).toBe("TypeScript configuration");
    });

    it("should generate comprehensive analytics", async () => {
      const { fetchEvents } = await import("../../src/relay.js");

      // Mock diverse memory data for analytics
      const analyticsData = [
        { ai_importance: "0.9", ai_type: "knowledge" },
        { ai_importance: "0.8", ai_type: "knowledge" },
        { ai_importance: "0.5", ai_type: "conversation" },
        { ai_importance: "0.7", ai_type: "procedure" },
        { ai_importance: "0.3", ai_type: "reasoning" },
      ].map((mem, index) => ({
        Content: `Memory ${index}`,
        Id: `mem_${index}`,
        ...mem,
        Timestamp: `2024-01-0${index + 1}T00:00:00.000Z`,
      }));

      vi.mocked(fetchEvents).mockResolvedValueOnce(analyticsData);

      const analytics = await aiMemoryService.getMemoryAnalytics(mockHubId);

      expect(analytics.totalMemories).toBe(5);
      expect(analytics.memoryTypeDistribution).toEqual({
        conversation: 1,
        knowledge: 2,
        procedure: 1,
        reasoning: 1,
        workflow: 0,
        enhancement: 0,
        performance: 0,
      });
      expect(analytics.importanceDistribution).toEqual({
        high: 3, // 0.9, 0.8, 0.7
        low: 0, // none
        medium: 2, // 0.5, 0.3
      });
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle network failures gracefully", async () => {
      const { event } = await import("../../src/relay.js");
      vi.mocked(event).mockRejectedValue(new Error("Network unreachable"));

      await expect(
        aiMemoryService.addEnhanced(mockKeyPair, mockHubId, basicMemory),
      ).rejects.toThrow(
        "Failed to add enhanced memory: Error: Network unreachable",
      );
    });

    it("should handle hub unavailability", async () => {
      const { fetchEvents } = await import("../../src/relay.js");
      vi.mocked(fetchEvents).mockRejectedValue(new Error("Hub not responding"));

      await expect(
        aiMemoryService.searchAdvanced(mockHubId, "test query"),
      ).rejects.toThrow("Failed to search memories: Error: Hub not responding");
    });

    it("should handle malformed data gracefully", async () => {
      const { fetchEvents } = await import("../../src/relay.js");

      // Mock malformed event data
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          ai_context: "invalid_json",
          // Missing required fields
          ai_importance: "invalid_number",
          Id: "malformed_mem",
        },
      ]);

      const results = await aiMemoryService.searchAdvanced(mockHubId, "test");

      // Should handle gracefully, possibly with default values
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large batch operations efficiently", async () => {
      const { event } = await import("../../src/relay.js");
      vi.mocked(event).mockResolvedValue({ success: true });

      // Create large batch
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        content: `Batch memory ${i}`,
        importance: Math.random(),
        memoryType: "knowledge" as const,
        p: "batch_user",
        role: "system",
      }));

      const startTime = Date.now();
      const results = await aiMemoryService.addMemoriesBatch(
        mockKeyPair,
        mockHubId,
        largeBatch,
        "batch_user",
      );
      const endTime = Date.now();

      expect(results).toHaveLength(100);
      expect(
        results.every((r) => r === "Enhanced memory added successfully"),
      ).toBe(true);

      // Should complete within reasonable time (adjust based on expectations)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });

    it("should handle concurrent search operations", async () => {
      const { fetchEvents } = await import("../../src/relay.js");
      vi.mocked(fetchEvents).mockResolvedValue([
        {
          ai_type: "knowledge",
          Content: "Concurrent test memory",
          Id: "concurrent_mem",
        },
      ]);

      // Simulate concurrent searches
      const searches = Array.from({ length: 10 }, (_, i) =>
        aiMemoryService.searchAdvanced(mockHubId, `query_${i}`),
      );

      const results = await Promise.all(searches);

      expect(results).toHaveLength(10);
      expect(results.every((r) => Array.isArray(r))).toBe(true);
    });
  });

  describe("Data Consistency and Validation", () => {
    it("should maintain data consistency across operations", async () => {
      // This test would verify that related operations maintain consistency
      // For example, if we add a memory, then search for it, it should be found

      const { event, fetchEvents } = await import("../../src/relay.js");
      vi.mocked(event).mockResolvedValue({ success: true });

      // Add memory
      await aiMemoryService.addEnhanced(mockKeyPair, mockHubId, basicMemory);

      // Mock search returning the added memory
      vi.mocked(fetchEvents).mockResolvedValueOnce([
        {
          ai_importance: basicMemory.importance!.toString(),
          ai_type: basicMemory.memoryType,
          Content: basicMemory.content,
          Id: "consistency_mem",
          p: basicMemory.p,
        },
      ]);

      // Search should find the memory
      const searchResults = await aiMemoryService.searchAdvanced(
        mockHubId,
        basicMemory.content!.split(" ")[0],
      );

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].content).toBe(basicMemory.content);
      expect(searchResults[0].importance).toBe(basicMemory.importance);
    });

    it("should validate memory relationships are bidirectional when appropriate", async () => {
      // Create bidirectional relationship
      await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        "mem_a",
        "mem_b",
        { strength: 0.8, targetId: "mem_b", type: "supports" },
      );

      await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        "mem_b",
        "mem_a",
        { strength: 0.8, targetId: "mem_a", type: "supports" },
      );

      // Both relationships should be created successfully
      const { event } = await import("../../src/relay.js");
      expect(event).toHaveBeenCalledTimes(2);
    });
  });
});
