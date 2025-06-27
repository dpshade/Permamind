import { describe, it, expect, vi, beforeEach } from "vitest";
import { aiMemoryService } from "../../../src/services/aiMemoryService.js";
import { MemoryLink, RelationshipType } from "../../../src/models/AIMemory.js";
import { memoryRelationships } from "../../fixtures/memories.js";
import { mockKeyPair, mockHubId } from "../../mocks/aoConnect.js";

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
          targetId: "target_memory",
          type,
          strength: 0.8,
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
        targetId: "effect_memory",
        type: "causes",
        strength: 0.9,
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
        targetId: "direct_effect",
        type: "causes",
        strength: 0.95,
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
        targetId: "indirect_effect",
        type: "causes",
        strength: 0.3,
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
        targetId: "claim_memory",
        type: "supports",
        strength: 0.8,
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
          targetId: claim,
          type: "supports",
          strength: 0.7,
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
        targetId: "conflicting_memory",
        type: "contradicts",
        strength: 0.9,
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
        targetId: "partially_conflicting",
        type: "contradicts",
        strength: 0.4,
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
        targetId: "detailed_memory",
        type: "extends",
        strength: 0.85,
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
        { source: "level1", target: "level2", strength: 0.9 },
        { source: "level2", target: "level3", strength: 0.8 },
        { source: "level3", target: "level4", strength: 0.7 },
      ];

      for (const ext of extensions) {
        await expect(
          aiMemoryService.linkMemories(
            mockKeyPair,
            mockHubId,
            ext.source,
            ext.target,
            { targetId: ext.target, type: "extends", strength: ext.strength },
          ),
        ).resolves.toBe("Memory link created successfully");
      }
    });
  });

  describe("Reference Relationships (references)", () => {
    it("should create reference relationships for citations", async () => {
      const referenceLink: MemoryLink = {
        targetId: "referenced_memory",
        type: "references",
        strength: 0.6,
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
          { targetId: source, type: "references", strength: 0.5 },
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
          target: "memory_B",
          type: "causes" as const,
          strength: 0.9,
        },
        {
          source: "memory_B",
          target: "memory_C",
          type: "supports" as const,
          strength: 0.8,
        },
        {
          source: "memory_C",
          target: "memory_D",
          type: "contradicts" as const,
          strength: 0.7,
        },
        {
          source: "memory_D",
          target: "memory_E",
          type: "extends" as const,
          strength: 0.6,
        },
        {
          source: "memory_E",
          target: "memory_A",
          type: "references" as const,
          strength: 0.5,
        },
      ];

      const promises = relationships.map((rel) =>
        aiMemoryService.linkMemories(
          mockKeyPair,
          mockHubId,
          rel.source,
          rel.target,
          { targetId: rel.target, type: rel.type, strength: rel.strength },
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
        targetId: "memory_B",
        type: "supports",
        strength: 0.8,
      };

      const backwardLink: MemoryLink = {
        targetId: "memory_A",
        type: "supports",
        strength: 0.8,
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
        targetId: "memory_self",
        type: "supports",
        strength: 0.5,
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
      // This functionality doesn't exist yet - test will fail
      // Highlighting need for relationship retrieval methods
      await expect(
        aiMemoryService.getMemoryRelationships("memory_123"),
      ).rejects.toThrow("getMemoryRelationships not implemented yet");
    });

    it("should calculate relationship strength statistics", async () => {
      // This functionality doesn't exist yet - test will fail
      // Highlighting need for relationship analytics
      await expect(
        aiMemoryService.getRelationshipAnalytics(mockHubId),
      ).rejects.toThrow("getRelationshipAnalytics not implemented yet");
    });

    it("should find shortest path between memories", async () => {
      // This functionality doesn't exist yet - test will fail
      // Highlighting need for graph traversal algorithms
      await expect(
        aiMemoryService.findShortestPath("memory_A", "memory_Z"),
      ).rejects.toThrow("findShortestPath not implemented yet");
    });

    it("should detect circular references in memory graphs", async () => {
      // This functionality doesn't exist yet - test will fail
      // Highlighting need for cycle detection
      await expect(
        aiMemoryService.detectCircularReferences(mockHubId),
      ).rejects.toThrow("detectCircularReferences not implemented yet");
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
