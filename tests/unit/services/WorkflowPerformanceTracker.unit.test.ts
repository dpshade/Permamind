import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowPerformanceTracker } from "../../../src/services/WorkflowPerformanceTracker.js";

describe("WorkflowPerformanceTracker", () => {
  let performanceTracker: WorkflowPerformanceTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    performanceTracker = new WorkflowPerformanceTracker();
  });

  describe("constructor", () => {
    it("should initialize without errors", () => {
      expect(performanceTracker).toBeDefined();
      expect(performanceTracker).toBeInstanceOf(WorkflowPerformanceTracker);
    });
  });

  describe("recordPerformance", () => {
    it("should record performance data for a workflow", () => {
      const performanceData = {
        completionRate: 0.95,
        errorRate: 0.02,
        executionTime: 1500,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.85,
        resourceUsage: {
          cpuTime: 800,
          memoryUsage: 120,
          networkRequests: 5,
          storageOperations: 3,
          toolCalls: 7,
        },
        retryCount: 1,
        success: true,
        userSatisfaction: 0.8,
      };

      expect(() => {
        performanceTracker.recordPerformance("workflow1", performanceData);
      }).not.toThrow();
    });

    it("should handle minimal performance data", () => {
      const minimalData = {
        completionRate: 1.0,
        errorRate: 0,
        executionTime: 1000,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.7,
        resourceUsage: {
          cpuTime: 500,
          memoryUsage: 80,
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3,
        },
        retryCount: 0,
        success: true,
      };

      expect(() => {
        performanceTracker.recordPerformance("workflow2", minimalData);
      }).not.toThrow();
    });

    it("should handle multiple performance records for same workflow", () => {
      const baseData = {
        completionRate: 1.0,
        errorRate: 0.01,
        executionTime: 1000,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.8,
        resourceUsage: {
          cpuTime: 600,
          memoryUsage: 100,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5,
        },
        retryCount: 0,
        success: true,
      };

      // Record multiple performances
      for (let i = 0; i < 5; i++) {
        expect(() => {
          performanceTracker.recordPerformance("workflow1", {
            ...baseData,
            executionTime: 1000 + i * 100,
          });
        }).not.toThrow();
      }
    });
  });

  describe("getPerformanceStats", () => {
    beforeEach(() => {
      // Add some test performance data
      const testData = [
        {
          completionRate: 1.0,
          errorRate: 0.01,
          executionTime: 1000,
          lastExecuted: new Date().toISOString(),
          qualityScore: 0.8,
          resourceUsage: {
            cpuTime: 600,
            memoryUsage: 100,
            networkRequests: 3,
            storageOperations: 2,
            toolCalls: 5,
          },
          retryCount: 0,
          success: true,
        },
        {
          completionRate: 0.95,
          errorRate: 0.02,
          executionTime: 1200,
          lastExecuted: new Date().toISOString(),
          qualityScore: 0.85,
          resourceUsage: {
            cpuTime: 700,
            memoryUsage: 120,
            networkRequests: 4,
            storageOperations: 3,
            toolCalls: 6,
          },
          retryCount: 1,
          success: true,
        },
      ];

      testData.forEach((data, index) => {
        performanceTracker.recordPerformance(`testWorkflow`, data);
      });
    });

    it("should return performance statistics for existing workflow", () => {
      const stats = performanceTracker.getPerformanceStats("testWorkflow");

      expect(stats).toBeDefined();
      expect(stats.current).toBeDefined();
      expect(stats.average).toBeDefined();
      expect(stats.trend).toBeDefined();
      expect(Array.isArray(stats.trend)).toBe(true);
    });

    it("should return current performance metrics", () => {
      const stats = performanceTracker.getPerformanceStats("testWorkflow");

      expect(stats.current).toBeDefined();
      expect(typeof stats.current.qualityScore).toBe("number");
      expect(typeof stats.current.executionTime).toBe("number");
      expect(typeof stats.current.success).toBe("boolean");
    });

    it("should return average performance metrics", () => {
      const stats = performanceTracker.getPerformanceStats("testWorkflow");

      expect(stats.average).toBeDefined();
      expect(typeof stats.average.qualityScore).toBe("number");
      expect(typeof stats.average.executionTime).toBe("number");
      expect(stats.average.qualityScore).toBeGreaterThan(0);
      expect(stats.average.qualityScore).toBeLessThanOrEqual(1);
    });

    it("should return performance trends", () => {
      const stats = performanceTracker.getPerformanceStats("testWorkflow");

      expect(Array.isArray(stats.trend)).toBe(true);
      stats.trend.forEach((trend) => {
        expect(trend.metric).toBeDefined();
        expect(trend.timeWindow).toBeDefined();
        expect(["improving", "declining", "stable"]).toContain(trend.trend);
        expect(typeof trend.confidence).toBe("number");
        expect(trend.confidence).toBeGreaterThanOrEqual(0);
        expect(trend.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should handle non-existent workflow", () => {
      const stats = performanceTracker.getPerformanceStats(
        "nonExistentWorkflow",
      );

      expect(stats).toBeDefined();
      expect(stats.current).toBeNull();
      expect(stats.average).toBeNull();
      expect(Array.isArray(stats.trend)).toBe(true);
      expect(stats.trend.length).toBe(0);
    });
  });

  describe("identifyEnhancements", () => {
    beforeEach(() => {
      // Add declining performance data to trigger enhancements
      for (let i = 0; i < 5; i++) {
        performanceTracker.recordPerformance("decliningWorkflow", {
          completionRate: 1.0 - i * 0.05, // Decreasing completion rate
          errorRate: 0.01 + i * 0.05, // Increasing error rate
          executionTime: 1000 + i * 300, // Increasing execution time
          lastExecuted: new Date().toISOString(),
          qualityScore: 0.9 - i * 0.1, // Decreasing quality
          resourceUsage: {
            cpuTime: 600 + i * 200,
            memoryUsage: 100 + i * 50, // Increasing memory usage
            networkRequests: 3,
            storageOperations: 2,
            toolCalls: 5,
          },
          retryCount: i > 2 ? 2 : 0,
          success: i < 3, // Some failures
        });
      }
    });

    it("should identify potential enhancements for declining performance", () => {
      const enhancements =
        performanceTracker.identifyEnhancements("decliningWorkflow");

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBeGreaterThan(0);
    });

    it("should return enhancement objects with required properties", () => {
      const enhancements =
        performanceTracker.identifyEnhancements("decliningWorkflow");

      enhancements.forEach((enhancement) => {
        expect(enhancement.id).toBeDefined();
        expect(enhancement.type).toBeDefined();
        expect(enhancement.description).toBeDefined();
        expect(typeof enhancement.impact).toBe("number");
        expect(enhancement.impact).toBeGreaterThan(0);
        expect(enhancement.impact).toBeLessThanOrEqual(1);
      });
    });

    it("should identify different types of enhancements", () => {
      const enhancements =
        performanceTracker.identifyEnhancements("decliningWorkflow");

      const enhancementTypes = enhancements.map((e) => e.type);
      expect(
        enhancementTypes.some((type) =>
          [
            "error_handling",
            "optimization",
            "parameter_tune",
            "refactor",
          ].includes(type),
        ),
      ).toBe(true);
    });

    it("should handle workflow with good performance", () => {
      // Add good performance data
      performanceTracker.recordPerformance("goodWorkflow", {
        completionRate: 1.0,
        errorRate: 0.001,
        executionTime: 800,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.95,
        resourceUsage: {
          cpuTime: 400,
          memoryUsage: 80,
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3,
        },
        retryCount: 0,
        success: true,
      });

      const enhancements =
        performanceTracker.identifyEnhancements("goodWorkflow");

      expect(Array.isArray(enhancements)).toBe(true);
      // Good performance should result in fewer or no enhancement suggestions
    });

    it("should handle non-existent workflow", () => {
      const enhancements = performanceTracker.identifyEnhancements(
        "nonExistentWorkflow",
      );

      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBe(0);
    });
  });

  describe("generateOptimizationRecommendations", () => {
    beforeEach(() => {
      // Add test performance data
      performanceTracker.recordPerformance("testWorkflow", {
        completionRate: 0.9,
        errorRate: 0.03,
        executionTime: 1500,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.75,
        resourceUsage: {
          cpuTime: 900,
          memoryUsage: 150,
          networkRequests: 8,
          storageOperations: 5,
          toolCalls: 10,
        },
        retryCount: 1,
        success: true,
      });
    });

    it("should generate optimization recommendations", () => {
      const recommendations =
        performanceTracker.generateOptimizationRecommendations("testWorkflow");

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(recommendations.priority).toBeDefined();
      expect(["high", "medium", "low"]).toContain(recommendations.priority);
      expect(typeof recommendations.estimatedImpact).toBe("number");
    });

    it("should include actionable recommendations", () => {
      const recommendations =
        performanceTracker.generateOptimizationRecommendations("testWorkflow");

      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      recommendations.recommendations.forEach((rec) => {
        expect(typeof rec).toBe("string");
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it("should handle non-existent workflow", () => {
      const recommendations =
        performanceTracker.generateOptimizationRecommendations(
          "nonExistentWorkflow",
        );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(typeof recommendations.estimatedImpact).toBe("number");
      expect(["high", "medium", "low"]).toContain(recommendations.priority);
    });
  });

  describe("calculateTrendMetrics", () => {
    beforeEach(() => {
      // Add time-series performance data
      const baseTime = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days ago

      for (let i = 0; i < 7; i++) {
        const timestamp = new Date(
          baseTime + i * 24 * 60 * 60 * 1000,
        ).toISOString();
        performanceTracker.recordPerformance("trendWorkflow", {
          completionRate: 0.9 + i * 0.01,
          errorRate: 0.05 - i * 0.005, // Decreasing error rate
          executionTime: 1000 - i * 50, // Improving execution time
          lastExecuted: timestamp,
          qualityScore: 0.7 + i * 0.03, // Improving quality
          resourceUsage: {
            cpuTime: 700 - i * 30,
            memoryUsage: 120 - i * 5,
            networkRequests: 4,
            storageOperations: 2,
            toolCalls: 6,
          },
          retryCount: Math.max(0, 2 - i),
          success: true,
        });
      }
    });

    it("should calculate trend metrics for workflow", () => {
      const stats = performanceTracker.getPerformanceStats("trendWorkflow");

      expect(stats.trend).toBeDefined();
      expect(Array.isArray(stats.trend)).toBe(true);
      expect(stats.trend.length).toBeGreaterThan(0);
    });

    it("should detect improving trends", () => {
      const stats = performanceTracker.getPerformanceStats("trendWorkflow");

      // Should detect some improving trends based on our test data
      const improvingTrends = stats.trend.filter(
        (t) => t.trend === "improving",
      );
      expect(improvingTrends.length).toBeGreaterThan(0);
    });
  });

  describe("resource usage tracking", () => {
    it("should track resource usage metrics", () => {
      const performanceData = {
        completionRate: 1.0,
        errorRate: 0.01,
        executionTime: 1200,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.8,
        resourceUsage: {
          cpuTime: 1500,
          memoryUsage: 256,
          networkRequests: 12,
          storageOperations: 8,
          toolCalls: 15,
        },
        retryCount: 0,
        success: true,
      };

      performanceTracker.recordPerformance("resourceWorkflow", performanceData);
      const stats = performanceTracker.getPerformanceStats("resourceWorkflow");

      expect(stats.current).toBeDefined();
      expect(stats.current.resourceUsage).toBeDefined();
      expect(stats.current.resourceUsage.memoryUsage).toBe(256);
      expect(stats.current.resourceUsage.cpuTime).toBe(1500);
      expect(stats.current.resourceUsage.networkRequests).toBe(12);
      expect(stats.current.resourceUsage.storageOperations).toBe(8);
      expect(stats.current.resourceUsage.toolCalls).toBe(15);
    });
  });

  describe("edge cases", () => {
    it("should handle invalid quality scores", () => {
      const invalidData = {
        completionRate: 1.0,
        errorRate: 0,
        executionTime: 1000,
        lastExecuted: new Date().toISOString(),
        qualityScore: 1.5, // Invalid - greater than 1
        resourceUsage: {
          cpuTime: 600,
          memoryUsage: 100,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5,
        },
        retryCount: 0,
        success: true,
      };

      expect(() => {
        performanceTracker.recordPerformance("invalidWorkflow", invalidData);
      }).not.toThrow();
    });

    it("should handle negative execution times", () => {
      const invalidData = {
        completionRate: 1.0,
        errorRate: 0,
        executionTime: -500, // Invalid negative time
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.8,
        resourceUsage: {
          cpuTime: 600,
          memoryUsage: 100,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5,
        },
        retryCount: 0,
        success: true,
      };

      expect(() => {
        performanceTracker.recordPerformance("invalidWorkflow", invalidData);
      }).not.toThrow();
    });
  });
});
