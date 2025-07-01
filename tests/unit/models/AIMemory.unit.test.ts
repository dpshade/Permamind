import { describe, expect, it } from "vitest";

import {
  AIMemory,
  MemoryAnalytics,
  MemoryType,
  ReasoningTrace,
  RelationshipType,
  SearchFilters,
} from "../../../src/models/AIMemory.js";

describe("AIMemory Types", () => {
  describe("MemoryType", () => {
    it("should define all memory types", () => {
      const types: MemoryType[] = [
        "conversation",
        "reasoning",
        "knowledge",
        "procedure",
      ];

      expect(types).toHaveLength(4);
      expect(types).toContain("conversation");
      expect(types).toContain("reasoning");
      expect(types).toContain("knowledge");
      expect(types).toContain("procedure");
    });
  });

  describe("RelationshipType", () => {
    it("should define all relationship types", () => {
      const types: RelationshipType[] = [
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ];

      expect(types).toHaveLength(5);
      expect(types).toContain("causes");
      expect(types).toContain("supports");
      expect(types).toContain("contradicts");
      expect(types).toContain("extends");
      expect(types).toContain("references");
    });
  });

  describe("AIMemory interface", () => {
    it("should extend base Memory with AI-specific properties", () => {
      const aiMemory: AIMemory = {
        content: "Test memory content",
        context: {
          domain: "development",
          sessionId: "test_session",
          topic: "testing",
        },
        // Base Memory properties
        id: "test_123",
        // AI-specific properties
        importance: 0.8,
        memoryType: "knowledge",

        metadata: {
          accessCount: 0,
          lastAccessed: "2024-01-01T00:00:00.000Z",
          tags: ["test", "memory"],
        },
        p: "user_key",
        role: "system",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      expect(aiMemory.importance).toBe(0.8);
      expect(aiMemory.memoryType).toBe("knowledge");
      expect(aiMemory.context.sessionId).toBe("test_session");
      expect(aiMemory.metadata.accessCount).toBe(0);
    });

    it("should support optional relationships and reasoning", () => {
      const aiMemory: AIMemory = {
        content: "Test memory",
        context: {},
        id: "test_123",
        importance: 0.7,
        memoryType: "reasoning",
        metadata: {
          accessCount: 0,
          lastAccessed: "2024-01-01T00:00:00.000Z",
        },
        p: "user_key",
        reasoning: {
          chainId: "reasoning_chain_789",
          outcome: "Test outcome",
          steps: [],
        },
        relationships: [
          {
            strength: 0.9,
            targetId: "related_memory_456",
            type: "supports",
          },
        ],
        role: "system",
        timestamp: "2024-01-01T00:00:00.000Z",
      };

      expect(aiMemory.relationships).toHaveLength(1);
      expect(aiMemory.relationships![0].type).toBe("supports");
      expect(aiMemory.reasoning!.chainId).toBe("reasoning_chain_789");
    });
  });

  describe("ReasoningTrace", () => {
    it("should define reasoning step structure correctly", () => {
      const reasoning: ReasoningTrace = {
        chainId: "test_chain",
        outcome: "Successfully completed reasoning",
        steps: [
          {
            confidence: 0.9,
            content: "Observed something",
            stepType: "observation",
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          {
            confidence: 0.8,
            content: "Thought about it",
            stepType: "thought",
            timestamp: "2024-01-01T00:01:00.000Z",
          },
          {
            confidence: 0.85,
            content: "Took action",
            stepType: "action",
            timestamp: "2024-01-01T00:02:00.000Z",
          },
          {
            confidence: 0.95,
            content: "Reached conclusion",
            stepType: "conclusion",
            timestamp: "2024-01-01T00:03:00.000Z",
          },
        ],
      };

      expect(reasoning.steps).toHaveLength(4);
      expect(reasoning.steps[0].stepType).toBe("observation");
      expect(reasoning.steps[1].stepType).toBe("thought");
      expect(reasoning.steps[2].stepType).toBe("action");
      expect(reasoning.steps[3].stepType).toBe("conclusion");
    });
  });

  describe("SearchFilters", () => {
    it("should define comprehensive search filter options", () => {
      const filters: SearchFilters = {
        domain: "development",
        importanceThreshold: 0.5,
        memoryType: "knowledge",
        relatedTo: "memory_123",
        sessionId: "session_456",
        timeRange: {
          end: "2024-01-31T23:59:59.999Z",
          start: "2024-01-01T00:00:00.000Z",
        },
      };

      expect(filters.memoryType).toBe("knowledge");
      expect(filters.importanceThreshold).toBe(0.5);
      expect(filters.timeRange!.start).toBe("2024-01-01T00:00:00.000Z");
      expect(filters.relatedTo).toBe("memory_123");
      expect(filters.sessionId).toBe("session_456");
      expect(filters.domain).toBe("development");
    });

    it("should allow all filter properties to be optional", () => {
      const filters: SearchFilters = {};

      expect(filters.memoryType).toBeUndefined();
      expect(filters.importanceThreshold).toBeUndefined();
      expect(filters.timeRange).toBeUndefined();
    });
  });

  describe("MemoryAnalytics", () => {
    it("should define comprehensive analytics structure", () => {
      const analytics: MemoryAnalytics = {
        accessPatterns: {
          mostAccessed: ["mem_1", "mem_2", "mem_3"],
          recentlyAccessed: ["mem_4", "mem_5", "mem_6"],
          unusedMemories: ["mem_7", "mem_8"],
        },
        importanceDistribution: {
          high: 25,
          low: 25,
          medium: 50,
        },
        memoryTypeDistribution: {
          conversation: 40,
          knowledge: 30,
          procedure: 10,
          reasoning: 20,
        },
        totalMemories: 100,
      };

      expect(analytics.totalMemories).toBe(100);
      expect(analytics.memoryTypeDistribution.conversation).toBe(40);
      expect(analytics.importanceDistribution.high).toBe(25);
      expect(analytics.accessPatterns.mostAccessed).toHaveLength(3);
    });
  });
});
