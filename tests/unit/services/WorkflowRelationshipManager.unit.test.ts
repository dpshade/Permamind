import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowRelationshipManager } from "../../../src/services/WorkflowRelationshipManager.js";
import type {
  RelationshipType,
  Enhancement,
} from "../../../src/models/WorkflowMemory.js";

describe("WorkflowRelationshipManager", () => {
  let manager: WorkflowRelationshipManager;
  const testWorkflowId1 = "workflow-1";
  const testWorkflowId2 = "workflow-2";
  const testWorkflowId3 = "workflow-3";

  beforeEach(() => {
    manager = new WorkflowRelationshipManager();
  });

  describe("initialization", () => {
    it("should create WorkflowRelationshipManager instance", () => {
      expect(manager).toBeInstanceOf(WorkflowRelationshipManager);
    });
  });

  describe("createRelationship", () => {
    it("should create relationship between workflows", () => {
      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          testWorkflowId2,
          "inherits",
          0.8,
        );
      }).not.toThrow();
    });

    it("should handle all relationship types", () => {
      const relationshipTypes: RelationshipType[] = [
        "inherits",
        "composes",
        "enhances",
        "triggers",
        "depends_on",
        "replaces",
        "causes",
        "supports",
        "contradicts",
        "extends",
        "references",
      ];

      relationshipTypes.forEach((type) => {
        expect(() => {
          manager.createRelationship(
            testWorkflowId1,
            testWorkflowId2,
            type,
            0.5,
          );
        }).not.toThrow();
      });
    });

    it("should handle relationship strength validation", () => {
      // Valid strengths
      [0, 0.5, 1.0].forEach((strength) => {
        expect(() => {
          manager.createRelationship(
            testWorkflowId1,
            testWorkflowId2,
            "inherits",
            strength,
          );
        }).not.toThrow();
      });
    });

    it("should handle duplicate relationship creation", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.8,
      );

      // Creating same relationship again should not throw
      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          testWorkflowId2,
          "inherits",
          0.9,
        );
      }).not.toThrow();
    });
  });

  describe("getRelatedWorkflows", () => {
    it("should return related workflows by type", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.8,
      );
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId3,
        "composes",
        0.6,
      );

      const inheritedWorkflows = manager.getRelatedWorkflows(
        testWorkflowId1,
        "inherits",
      );
      const composedWorkflows = manager.getRelatedWorkflows(
        testWorkflowId1,
        "composes",
      );

      expect(inheritedWorkflows).toContain(testWorkflowId2);
      expect(composedWorkflows).toContain(testWorkflowId3);
      expect(inheritedWorkflows).not.toContain(testWorkflowId3);
      expect(composedWorkflows).not.toContain(testWorkflowId2);
    });

    it("should return empty array for workflows with no relationships", () => {
      const related = manager.getRelatedWorkflows(
        "nonexistent-workflow",
        "inherits",
      );
      expect(related).toHaveLength(0);
    });

    it("should return empty array for unknown relationship types", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.8,
      );
      const related = manager.getRelatedWorkflows(
        testWorkflowId1,
        "unknown" as RelationshipType,
      );
      expect(related).toHaveLength(0);
    });
  });

  describe("findCollaborationOpportunities", () => {
    it("should find collaboration opportunities between workflows", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "supports",
        0.7,
      );
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId3,
        "enhances",
        0.8,
      );

      const opportunities =
        manager.findCollaborationOpportunities(testWorkflowId1);

      expect(opportunities).toHaveProperty("potentialPartners");
      expect(opportunities).toHaveProperty("compositionOpportunities");
      expect(Array.isArray(opportunities.potentialPartners)).toBe(true);
      expect(Array.isArray(opportunities.compositionOpportunities)).toBe(true);
    });

    it("should return empty opportunities for isolated workflows", () => {
      const opportunities =
        manager.findCollaborationOpportunities("isolated-workflow");

      expect(opportunities.potentialPartners).toHaveLength(0);
      expect(opportunities.compositionOpportunities).toHaveLength(0);
    });

    it("should handle workflows with complex relationship networks", () => {
      // Create a complex network
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.8,
      );
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId3,
        "composes",
        0.7,
      );
      manager.createRelationship(
        testWorkflowId3,
        testWorkflowId1,
        "enhances",
        0.6,
      );

      const opportunities =
        manager.findCollaborationOpportunities(testWorkflowId1);

      expect(
        opportunities.potentialPartners.length +
          opportunities.compositionOpportunities.length,
      ).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getDependentWorkflows", () => {
    it("should find workflows that depend on target workflow", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "depends_on",
        0.9,
      );
      manager.createRelationship(
        testWorkflowId3,
        testWorkflowId2,
        "composes",
        0.7,
      );

      const dependents = manager.getDependentWorkflows(testWorkflowId2);

      expect(dependents).toContain(testWorkflowId1);
      expect(dependents).toContain(testWorkflowId3);
    });

    it("should return empty array for workflows with no dependents", () => {
      const dependents = manager.getDependentWorkflows("independent-workflow");
      expect(dependents).toHaveLength(0);
    });
  });

  describe("getNetworkStatistics", () => {
    it("should calculate network statistics", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.8,
      );
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId3,
        "composes",
        0.7,
      );

      const stats = manager.getNetworkStatistics();

      expect(stats).toHaveProperty("totalWorkflows");
      expect(stats).toHaveProperty("totalRelationships");
      expect(stats).toHaveProperty("averageConnectivity");
      expect(stats).toHaveProperty("compositionCount");
      expect(stats).toHaveProperty("circularDependencies");
      expect(stats).toHaveProperty("isolatedWorkflows");
      expect(stats).toHaveProperty("hubWorkflows");

      expect(typeof stats.totalWorkflows).toBe("number");
      expect(typeof stats.totalRelationships).toBe("number");
      expect(typeof stats.averageConnectivity).toBe("number");
      expect(Array.isArray(stats.circularDependencies)).toBe(true);
      expect(Array.isArray(stats.isolatedWorkflows)).toBe(true);
      expect(Array.isArray(stats.hubWorkflows)).toBe(true);
    });

    it("should handle empty network", () => {
      const stats = manager.getNetworkStatistics();

      expect(stats.totalWorkflows).toBe(0);
      expect(stats.totalRelationships).toBe(0);
      expect(stats.averageConnectivity).toBe(0);
      expect(stats.isolatedWorkflows).toHaveLength(0);
    });
  });

  describe("optimizeRelationships", () => {
    it("should optimize relationships based on performance data", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.3,
      ); // Weak relationship
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId3,
        "composes",
        0.9,
      ); // Strong relationship

      const performanceData = new Map([
        [testWorkflowId1, 0.8],
        [testWorkflowId2, 0.4], // Poor performance
        [testWorkflowId3, 0.9], // Good performance
      ]);

      expect(() => {
        manager.optimizeRelationships(testWorkflowId1, performanceData);
      }).not.toThrow();
    });

    it("should handle optimization with empty performance data", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "inherits",
        0.5,
      );

      expect(() => {
        manager.optimizeRelationships(testWorkflowId1, new Map());
      }).not.toThrow();
    });
  });

  describe("propagateEnhancement", () => {
    it("should propagate enhancement to related workflows", () => {
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId1,
        "inherits",
        0.8,
      ); // workflow2 inherits from workflow1

      const testEnhancement: Enhancement = {
        id: "test-enhancement-1",
        type: "optimization",
        description: "Performance optimization",
        impact: 0.7,
        validation: {
          isValid: true,
          confidence: 0.9,
          riskAssessment: "low",
          testResults: [],
          validatedAt: new Date().toISOString(),
        },
      };

      const affectedWorkflows = manager.propagateEnhancement(
        testWorkflowId1,
        testEnhancement,
        "immediate",
      );

      expect(Array.isArray(affectedWorkflows)).toBe(true);
      expect(affectedWorkflows).toContain(testWorkflowId2);
    });

    it("should handle enhancement propagation with no inheritors", () => {
      const testEnhancement: Enhancement = {
        id: "test-enhancement-2",
        type: "bug_fix",
        description: "Fix error handling",
        impact: 0.5,
        validation: {
          isValid: true,
          confidence: 0.8,
          riskAssessment: "medium",
          testResults: [],
          validatedAt: new Date().toISOString(),
        },
      };

      const affectedWorkflows = manager.propagateEnhancement(
        "isolated-workflow",
        testEnhancement,
        "immediate",
      );

      expect(affectedWorkflows).toHaveLength(0);
    });

    it("should handle deferred propagation strategy", () => {
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId1,
        "inherits",
        0.8,
      );

      const testEnhancement: Enhancement = {
        id: "test-enhancement-3",
        type: "feature_add",
        description: "Add new capability",
        impact: 0.6,
        validation: {
          isValid: true,
          confidence: 0.7,
          riskAssessment: "low",
          testResults: [],
          validatedAt: new Date().toISOString(),
        },
      };

      const affectedWorkflows = manager.propagateEnhancement(
        testWorkflowId1,
        testEnhancement,
        "deferred",
      );

      expect(Array.isArray(affectedWorkflows)).toBe(true);
    });
  });

  describe("circular dependency detection", () => {
    it("should detect circular dependencies", () => {
      // Create circular dependency: A -> B -> C -> A
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "depends_on",
        0.5,
      );
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId3,
        "depends_on",
        0.5,
      );
      manager.createRelationship(
        testWorkflowId3,
        testWorkflowId1,
        "depends_on",
        0.5,
      );

      const stats = manager.getNetworkStatistics();

      // Should detect at least one circular dependency
      expect(stats.circularDependencies.length).toBeGreaterThan(0);
    });

    it("should handle networks without circular dependencies", () => {
      manager.createRelationship(
        testWorkflowId1,
        testWorkflowId2,
        "depends_on",
        0.5,
      );
      manager.createRelationship(
        testWorkflowId2,
        testWorkflowId3,
        "depends_on",
        0.5,
      );
      // No cycle back to testWorkflowId1

      const stats = manager.getNetworkStatistics();

      expect(Array.isArray(stats.circularDependencies)).toBe(true);
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle null workflow IDs", () => {
      expect(() => {
        manager.createRelationship(
          null as any,
          testWorkflowId2,
          "inherits",
          0.5,
        );
      }).not.toThrow();

      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          null as any,
          "inherits",
          0.5,
        );
      }).not.toThrow();
    });

    it("should handle undefined workflow IDs", () => {
      expect(() => {
        manager.createRelationship(
          undefined as any,
          testWorkflowId2,
          "inherits",
          0.5,
        );
      }).not.toThrow();
    });

    it("should handle empty workflow IDs", () => {
      expect(() => {
        manager.createRelationship("", testWorkflowId2, "inherits", 0.5);
      }).not.toThrow();
    });

    it("should handle invalid relationship strengths", () => {
      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          testWorkflowId2,
          "inherits",
          -0.5,
        );
      }).not.toThrow();

      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          testWorkflowId2,
          "inherits",
          1.5,
        );
      }).not.toThrow();
    });

    it("should handle self-referential relationships", () => {
      expect(() => {
        manager.createRelationship(
          testWorkflowId1,
          testWorkflowId1,
          "inherits",
          0.5,
        );
      }).not.toThrow();

      const related = manager.getRelatedWorkflows(testWorkflowId1, "inherits");
      expect(related).toContain(testWorkflowId1);
    });
  });
});
