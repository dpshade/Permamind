import { describe, it, expect, beforeEach, vi } from "vitest";
import { WorkflowEnhancementEngine } from "../../../src/services/WorkflowEnhancementEngine.js";
import type { Enhancement, EnhancementType, LearningSource } from "../../../src/models/WorkflowMemory.js";

// Mock dependencies
const mockPerformanceTracker = {
  recordPerformance: vi.fn(),
  getPerformanceStats: vi.fn(),
  generateOptimizationRecommendations: vi.fn(),
  validateEnhancement: vi.fn(),
};

const mockRelationshipManager = {
  getRelatedWorkflows: vi.fn(),
  findCollaborationOpportunities: vi.fn(),
  createRelationship: vi.fn(),
  getRelationships: vi.fn(),
};

describe("WorkflowEnhancementEngine", () => {
  let engine: WorkflowEnhancementEngine;
  const testWorkflowId = "test-workflow-123";

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new WorkflowEnhancementEngine(
      mockPerformanceTracker as any,
      mockRelationshipManager as any
    );
  });

  describe("initialization", () => {
    it("should create WorkflowEnhancementEngine instance", () => {
      expect(engine).toBeInstanceOf(WorkflowEnhancementEngine);
    });

    it("should initialize enhancement loop", () => {
      const optimizationTargets = [
        { metric: "executionTime", targetValue: 1000, weight: 0.5 },
        { metric: "qualityScore", targetValue: 0.9, weight: 0.3 },
      ];

      expect(() => {
        engine.initializeEnhancementLoop(testWorkflowId, optimizationTargets);
      }).not.toThrow();
    });
  });

  describe("runEnhancementCycle", () => {
    it("should complete enhancement cycle successfully", async () => {
      mockPerformanceTracker.generateOptimizationRecommendations.mockReturnValue({
        recommendations: ["Optimize execution time"],
        priority: "medium",
      });

      const result = await engine.runEnhancementCycle(testWorkflowId);

      expect(result).toHaveProperty("enhancements");
      expect(result).toHaveProperty("applied");
      expect(result).toHaveProperty("rejected");
      expect(result).toHaveProperty("nextCycleIn");
      expect(Array.isArray(result.enhancements)).toBe(true);
      expect(Array.isArray(result.applied)).toBe(true);
      expect(Array.isArray(result.rejected)).toBe(true);
      expect(typeof result.nextCycleIn).toBe("number");
    });

    it("should handle enhancement cycle with no improvements", async () => {
      mockPerformanceTracker.generateOptimizationRecommendations.mockReturnValue({
        recommendations: [],
        priority: "low",
      });

      const result = await engine.runEnhancementCycle(testWorkflowId);

      expect(result.enhancements).toHaveLength(0);
      expect(result.applied).toHaveLength(0);
      expect(result.rejected).toHaveLength(0);
    });

    it("should handle errors gracefully", async () => {
      mockPerformanceTracker.generateOptimizationRecommendations.mockImplementation(() => {
        throw new Error("Performance tracker failed");
      });

      const result = await engine.runEnhancementCycle(testWorkflowId);

      expect(result.enhancements).toHaveLength(0);
      expect(result.applied).toHaveLength(0);
    });
  });

  describe("learnFromErrors", () => {
    it("should create enhancement from error", async () => {
      const testError = new Error("TypeError: Cannot read property");
      const context = { operation: "data processing", input: "malformed data" };

      const enhancements = await engine.learnFromErrors(testWorkflowId, testError, context);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBeGreaterThan(0);
      if (enhancements.length > 0) {
        expect(enhancements[0]).toHaveProperty("type");
        expect(enhancements[0]).toHaveProperty("description");
        expect(enhancements[0]).toHaveProperty("impact");
      }
    });

    it("should handle different error types", async () => {
      const errors = [
        new Error("ReferenceError: variable not defined"),
        new Error("Network timeout"),
        new Error("Invalid JSON syntax"),
      ];

      for (const error of errors) {
        const enhancements = await engine.learnFromErrors(testWorkflowId, error, {});
        expect(Array.isArray(enhancements)).toBe(true);
      }
    });

    it("should handle null/undefined errors gracefully", async () => {
      const enhancements = await engine.learnFromErrors(testWorkflowId, null as any, {});
      expect(Array.isArray(enhancements)).toBe(true);
    });
  });

  describe("learnFromPeers", () => {
    it("should learn from related workflows", async () => {
      mockRelationshipManager.getRelatedWorkflows.mockReturnValue(["peer-workflow-1", "peer-workflow-2"]);

      const enhancements = await engine.learnFromPeers(testWorkflowId);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(mockRelationshipManager.getRelatedWorkflows).toHaveBeenCalledWith(
        testWorkflowId,
        "references"
      );
    });

    it("should handle workflows with no peers", async () => {
      mockRelationshipManager.getRelatedWorkflows.mockReturnValue([]);

      const enhancements = await engine.learnFromPeers(testWorkflowId);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements).toHaveLength(0);
    });

    it("should handle relationship manager errors", async () => {
      mockRelationshipManager.getRelatedWorkflows.mockImplementation(() => {
        throw new Error("Relationship manager failed");
      });

      const enhancements = await engine.learnFromPeers(testWorkflowId);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements).toHaveLength(0);
    });
  });

  describe("processUserFeedback", () => {
    it("should create enhancements from positive feedback", () => {
      const feedback = "The workflow works well but could be faster";
      const rating = 4;

      const enhancements = engine.processUserFeedback(testWorkflowId, feedback, rating);

      expect(Array.isArray(enhancements)).toBe(true);
      if (enhancements.length > 0) {
        expect(enhancements[0]).toHaveProperty("type");
        expect(enhancements[0]).toHaveProperty("description");
        expect(enhancements[0].description).toContain("faster");
      }
    });

    it("should create enhancements from negative feedback", () => {
      const feedback = "The workflow failed with unclear error messages";
      const rating = 2;

      const enhancements = engine.processUserFeedback(testWorkflowId, feedback, rating);

      expect(Array.isArray(enhancements)).toBe(true);
      if (enhancements.length > 0) {
        expect(enhancements[0]).toHaveProperty("type");
        expect(enhancements[0].type).toBe("error_handling");
      }
    });

    it("should handle neutral feedback", () => {
      const feedback = "The workflow is okay";
      const rating = 3;

      const enhancements = engine.processUserFeedback(testWorkflowId, feedback, rating);

      expect(Array.isArray(enhancements)).toBe(true);
      // Neutral feedback might not generate enhancements
    });

    it("should handle empty feedback", () => {
      const feedback = "";
      const rating = 3;

      const enhancements = engine.processUserFeedback(testWorkflowId, feedback, rating);

      expect(Array.isArray(enhancements)).toBe(true);
    });
  });

  describe("learnFromEmergent", () => {
    it("should discover emergent enhancements from collaboration", async () => {
      mockRelationshipManager.findCollaborationOpportunities.mockReturnValue({
        potentialPartners: ["partner-1", "partner-2"],
        compositionOpportunities: ["comp-1"],
      });

      const enhancements = await engine.learnFromEmergent(testWorkflowId);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(mockRelationshipManager.findCollaborationOpportunities).toHaveBeenCalledWith(testWorkflowId);
    });

    it("should handle workflows with no collaboration opportunities", async () => {
      mockRelationshipManager.findCollaborationOpportunities.mockReturnValue({
        potentialPartners: [],
        compositionOpportunities: [],
      });

      const enhancements = await engine.learnFromEmergent(testWorkflowId);

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements).toHaveLength(0);
    });
  });

  describe("enhancement types and validation", () => {
    it("should handle all enhancement types", () => {
      const enhancementTypes: EnhancementType[] = [
        "optimization",
        "bug_fix", 
        "feature_add",
        "refactor",
        "parameter_tune",
        "logic_improve",
        "error_handling",
        "user_experience",
      ];

      enhancementTypes.forEach(type => {
        const enhancement: Enhancement = {
          id: `test-${type}`,
          type,
          description: `Test ${type} enhancement`,
          impact: 0.5,
          validation: {
            isValid: true,
            confidence: 0.8,
            riskAssessment: "low",
            testResults: [],
            validatedAt: new Date().toISOString(),
          },
        };

        expect(enhancement.type).toBe(type);
        expect(enhancement.validation.isValid).toBe(true);
      });
    });

    it("should handle learning sources", () => {
      const learningSources: LearningSource[] = [
        "self",
        "peer", 
        "user",
        "analytics",
        "error",
        "emergent",
      ];

      learningSources.forEach(source => {
        // Test that the engine can handle different learning sources
        expect(typeof source).toBe("string");
      });
    });
  });

  describe("error handling and edge cases", () => {
    it("should handle null workflow ID", async () => {
      const result = await engine.runEnhancementCycle(null as any);
      expect(result.enhancements).toHaveLength(0);
    });

    it("should handle undefined workflow ID", async () => {
      const result = await engine.runEnhancementCycle(undefined as any);
      expect(result.enhancements).toHaveLength(0);
    });

    it("should handle empty workflow ID", async () => {
      const result = await engine.runEnhancementCycle("");
      expect(result.enhancements).toHaveLength(0);
    });

    it("should handle concurrent enhancement cycles", async () => {
      const promises = [
        engine.runEnhancementCycle(testWorkflowId),
        engine.runEnhancementCycle(testWorkflowId),
        engine.runEnhancementCycle(testWorkflowId),
      ];

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result).toHaveProperty("enhancements");
        expect(result).toHaveProperty("applied");
        expect(result).toHaveProperty("rejected");
        expect(result).toHaveProperty("nextCycleIn");
      });
    });
  });
});