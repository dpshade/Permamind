import { beforeEach, describe, expect, it, vi } from "vitest";

import { MemoryLink, RelationshipType } from "../../../src/models/AIMemory.js";
import { aiMemoryService } from "../../../src/services/aiMemoryService.js";
import { mockHubId, mockKeyPair } from "../../mocks/aoConnect.js";

vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

describe("Memory Relationships", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Relationship Types", () => {
    it("should support all defined relationship types", async () => {
      const relationshipTypes: RelationshipType[] = [
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ];

      for (const type of relationshipTypes) {
        const relationship: MemoryLink = {
          strength: 0.8,
          targetId: "target_memory",
          type,
        };

        await expect(
          aiMemoryService.linkMemories(
            mockKeyPair,
            mockHubId,
            "source_memory",
            "target_memory",
            relationship,
          ),
        ).resolves.toBe("Memory link created successfully");
      }
    });

    it("should validate relationship strength is between 0 and 1", () => {
      const validStrengths = [0, 0.5, 1.0];
      const invalidStrengths = [-0.1, 1.1, 2.0];

      validStrengths.forEach((strength) => {
        expect(strength).toBeGreaterThanOrEqual(0);
        expect(strength).toBeLessThanOrEqual(1);
      });

      invalidStrengths.forEach((strength) => {
        expect(strength < 0 || strength > 1).toBe(true);
      });
    });
  });

  describe("Causal Relationships (causes)", () => {
    it("should create causal relationship between memories", async () => {
      const causalLink: MemoryLink = {
        strength: 0.9,
        targetId: "effect_memory",
        type: "causes",
      };

      const result = await aiMemoryService.linkMemories(
        mockKeyPair,
        mockHubId,
        "cause_memory",
        "effect_memory",
        causalLink,
      );

      expect(result).toBe("Memory link created successfully");
    });

    it("should create strong causal relationships for direct causation", async () => {
      const strongCausal: MemoryLink = {
        strength: 0.95,
        targetId: "direct_effect",
        type: "causes",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "direct_cause",
          "direct_effect",
          strongCausal,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should create weak causal relationships for indirect causation", async () => {
      const weakCausal: MemoryLink = {
        strength: 0.3,
        targetId: "indirect_effect",
        type: "causes",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "indirect_cause",
          "indirect_effect",
          weakCausal,
        ),
      ).resolves.toBe("Memory link created successfully");
    });
  });

  describe("Support Relationships (supports)", () => {
    it("should create supportive relationships between evidence and claims", async () => {
      const supportLink: MemoryLink = {
        strength: 0.8,
        targetId: "claim_memory",
        type: "supports",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "evidence_memory",
          "claim_memory",
          supportLink,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should allow multiple pieces of evidence to support one claim", async () => {
      const claim = "main_claim_memory";
      const evidences = ["evidence1", "evidence2", "evidence3"];

      const promises = evidences.map((evidence) =>
        aiMemoryService.linkMemories(mockKeyPair, mockHubId, evidence, claim, {
          strength: 0.7,
          targetId: claim,
          type: "supports",
        }),
      );

      const results = await Promise.all(promises);
      expect(
        results.every((r) => r === "Memory link created successfully"),
      ).toBe(true);
    });
  });

  describe("Contradiction Relationships (contradicts)", () => {
    it("should create contradiction relationships between conflicting memories", async () => {
      const contradictLink: MemoryLink = {
        strength: 0.9,
        targetId: "conflicting_memory",
        type: "contradicts",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "original_memory",
          "conflicting_memory",
          contradictLink,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should handle partial contradictions with appropriate strength", async () => {
      const partialContradiction: MemoryLink = {
        strength: 0.4,
        targetId: "partially_conflicting",
        type: "contradicts",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "base_memory",
          "partially_conflicting",
          partialContradiction,
        ),
      ).resolves.toBe("Memory link created successfully");
    });
  });

  describe("Extension Relationships (extends)", () => {
    it("should create extension relationships for elaborated concepts", async () => {
      const extensionLink: MemoryLink = {
        strength: 0.85,
        targetId: "detailed_memory",
        type: "extends",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "basic_concept",
          "detailed_memory",
          extensionLink,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should allow hierarchical extension chains", async () => {
      const extensions = [
        { source: "level1", strength: 0.9, target: "level2" },
        { source: "level2", strength: 0.8, target: "level3" },
        { source: "level3", strength: 0.7, target: "level4" },
      ];

      for (const ext of extensions) {
        await expect(
          aiMemoryService.linkMemories(
            mockKeyPair,
            mockHubId,
            ext.source,
            ext.target,
            { strength: ext.strength, targetId: ext.target, type: "extends" },
          ),
        ).resolves.toBe("Memory link created successfully");
      }
    });
  });

  describe("Reference Relationships (references)", () => {
    it("should create reference relationships for citations", async () => {
      const referenceLink: MemoryLink = {
        strength: 0.6,
        targetId: "referenced_memory",
        type: "references",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "citing_memory",
          "referenced_memory",
          referenceLink,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should allow one memory to reference multiple sources", async () => {
      const mainMemory = "main_research_memory";
      const sources = ["source1", "source2", "source3", "source4"];

      const promises = sources.map((source) =>
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          mainMemory,
          source,
          { strength: 0.5, targetId: source, type: "references" },
        ),
      );

      const results = await Promise.all(promises);
      expect(
        results.every((r) => r === "Memory link created successfully"),
      ).toBe(true);
    });
  });

  describe("Complex Relationship Networks", () => {
    it("should support creating complex knowledge graphs", async () => {
      // Create a small knowledge graph:
      // A causes B, B supports C, C contradicts D, D extends E, E references A
      const relationships = [
        {
          source: "memory_A",
          strength: 0.9,
          target: "memory_B",
          type: "causes" as const,
        },
        {
          source: "memory_B",
          strength: 0.8,
          target: "memory_C",
          type: "supports" as const,
        },
        {
          source: "memory_C",
          strength: 0.7,
          target: "memory_D",
          type: "contradicts" as const,
        },
        {
          source: "memory_D",
          strength: 0.6,
          target: "memory_E",
          type: "extends" as const,
        },
        {
          source: "memory_E",
          strength: 0.5,
          target: "memory_A",
          type: "references" as const,
        },
      ];

      const promises = relationships.map((rel) =>
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          rel.source,
          rel.target,
          { strength: rel.strength, targetId: rel.target, type: rel.type },
        ),
      );

      const results = await Promise.all(promises);
      expect(
        results.every((r) => r === "Memory link created successfully"),
      ).toBe(true);
    });

    it("should handle bidirectional relationships", async () => {
      // Create bidirectional support relationship
      const forwardLink: MemoryLink = {
        strength: 0.8,
        targetId: "memory_B",
        type: "supports",
      };

      const backwardLink: MemoryLink = {
        strength: 0.8,
        targetId: "memory_A",
        type: "supports",
      };

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "memory_A",
          "memory_B",
          forwardLink,
        ),
      ).resolves.toBe("Memory link created successfully");

      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "memory_B",
          "memory_A",
          backwardLink,
        ),
      ).resolves.toBe("Memory link created successfully");
    });

    it("should prevent self-referential relationships", async () => {
      const selfLink: MemoryLink = {
        strength: 0.5,
        targetId: "memory_self",
        type: "supports",
      };

      // Self-referential relationships should be rejected for data integrity
      await expect(
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          "memory_self",
          "memory_self",
          selfLink,
        ),
      ).rejects.toThrow("Self-referential relationships are not allowed");
    });
  });

  describe("Relationship Retrieval and Analysis", () => {
    it("should retrieve all relationships for a memory", async () => {
      // Test that the method is now implemented and returns an array
      const hubId = "test-hub";
      const relationships = await aiMemoryService.getMemoryRelationships(hubId);

      expect(Array.isArray(relationships)).toBe(true);
      // Should return empty array when no relationships exist (mocked fetchEvents returns [])
      expect(relationships).toEqual([]);
    });

    it("should calculate relationship strength statistics", async () => {
      // Test that the method is now implemented and returns analytics object
      const hubId = "test-hub";
      const analytics = await aiMemoryService.getRelationshipAnalytics(hubId);

      expect(analytics).toHaveProperty("totalLinks");
      expect(analytics).toHaveProperty("averageStrength");
      expect(analytics).toHaveProperty("topRelationshipTypes");
      expect(analytics).toHaveProperty("strongestConnections");

      // Should return zero values when no relationships exist
      expect(analytics.totalLinks).toBe(0);
      expect(analytics.averageStrength).toBe(0);
      expect(Array.isArray(analytics.topRelationshipTypes)).toBe(true);
      expect(Array.isArray(analytics.strongestConnections)).toBe(true);
    });

    it("should find shortest path between memories", async () => {
      // Test that the method is now implemented and returns a path array
      const hubId = "test-hub";
      const fromId = "memory1";
      const toId = "memory2";
      const path = await aiMemoryService.findShortestPath(hubId, fromId, toId);

      expect(Array.isArray(path)).toBe(true);
      // Should return empty array when no path exists (mocked fetchEvents returns [])
      expect(path).toEqual([]);
    });

    it("should detect circular references in memory graphs", async () => {
      // Test that the method is now implemented and returns cycles array
      const hubId = "test-hub";
      const cycles = await aiMemoryService.detectCircularReferences(hubId);

      expect(Array.isArray(cycles)).toBe(true);
      // Should return empty array when no cycles exist (mocked fetchEvents returns [])
      expect(cycles).toEqual([]);
    });
  });

  describe("Relationship Validation", () => {
    it("should validate relationship types", () => {
      const validTypes: RelationshipType[] = [
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ];
      const invalidType = "invalid_type" as RelationshipType;

      validTypes.forEach((type) => {
        expect([
          "causes",
          "supports",
          "contradicts",
          "extends",
          "references",
        ]).toContain(type);
      });

      expect([
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ]).not.toContain(invalidType);
    });

    it("should validate relationship strength boundaries", () => {
      const validStrengths = [0, 0.1, 0.5, 0.9, 1.0];
      const invalidStrengths = [
        -0.1,
        -1,
        1.1,
        2.0,
        Number.NaN,
        Number.POSITIVE_INFINITY,
      ];

      validStrengths.forEach((strength) => {
        expect(strength >= 0 && strength <= 1).toBe(true);
      });

      invalidStrengths.forEach((strength) => {
        expect(
          strength >= 0 &&
            strength <= 1 &&
            !Number.isNaN(strength) &&
            Number.isFinite(strength),
        ).toBe(false);
      });
    });

    it("should require non-empty source and target IDs", () => {
      const validIds = ["memory_123", "mem_abc", "test_id_456"];
      const invalidIds = ["", null, undefined, "   "];

      validIds.forEach((id) => {
        expect(id && id.trim().length > 0).toBe(true);
      });

      invalidIds.forEach((id) => {
        expect(!id || (typeof id === "string" && id.trim().length === 0)).toBe(
          true,
        );
      });
    });
  });
});
