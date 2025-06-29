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
        executionTime: 1500,
        success: true,
        errorRate: 0.02,
        qualityScore: 0.85,
        completionRate: 0.95,
        retryCount: 1,
        resourceUsage: {
          memoryUsage: 120,
          cpuTime: 800,
          networkRequests: 5,
          storageOperations: 3,
          toolCalls: 7
        },
        userSatisfaction: 0.8,
        lastExecuted: new Date().toISOString()
      };

      expect(() => {
        performanceTracker.recordPerformance("workflow1", performanceData);
      }).not.toThrow();
    });

    it("should handle minimal performance data", () => {
      const minimalData = {
        executionTime: 1000,
        success: true,
        errorRate: 0,
        qualityScore: 0.7,
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 80,
          cpuTime: 500,
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3
        },
        lastExecuted: new Date().toISOString()
      };

      expect(() => {
        performanceTracker.recordPerformance("workflow2", minimalData);
      }).not.toThrow();
    });

    it("should handle multiple performance records for same workflow", () => {
      const baseData = {
        executionTime: 1000,
        success: true,
        errorRate: 0.01,
        qualityScore: 0.8,
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 100,
          cpuTime: 600,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5
        },
        lastExecuted: new Date().toISOString()
      };

      // Record multiple performances
      for (let i = 0; i < 5; i++) {
        expect(() => {
          performanceTracker.recordPerformance("workflow1", {
            ...baseData,
            executionTime: 1000 + i * 100
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
          executionTime: 1000,
          success: true,
          errorRate: 0.01,
          qualityScore: 0.8,
          completionRate: 1.0,
          retryCount: 0,
          resourceUsage: {
            memoryUsage: 100,
            cpuTime: 600,
            networkRequests: 3,
            storageOperations: 2,
            toolCalls: 5
          },
          lastExecuted: new Date().toISOString()
        },
        {
          executionTime: 1200,
          success: true,
          errorRate: 0.02,
          qualityScore: 0.85,
          completionRate: 0.95,
          retryCount: 1,
          resourceUsage: {
            memoryUsage: 120,
            cpuTime: 700,
            networkRequests: 4,
            storageOperations: 3,
            toolCalls: 6
          },
          lastExecuted: new Date().toISOString()
        }
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
      stats.trend.forEach(trend => {
        expect(trend.metric).toBeDefined();
        expect(trend.timeWindow).toBeDefined();
        expect(["improving", "declining", "stable"]).toContain(trend.trend);
        expect(typeof trend.confidence).toBe("number");
        expect(trend.confidence).toBeGreaterThanOrEqual(0);
        expect(trend.confidence).toBeLessThanOrEqual(1);
      });
    });

    it("should handle non-existent workflow", () => {
      const stats = performanceTracker.getPerformanceStats("nonExistentWorkflow");
      
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
          executionTime: 1000 + (i * 300), // Increasing execution time
          success: i < 3, // Some failures
          errorRate: 0.01 + (i * 0.05), // Increasing error rate
          qualityScore: 0.9 - (i * 0.1), // Decreasing quality
          completionRate: 1.0 - (i * 0.05), // Decreasing completion rate
          retryCount: i > 2 ? 2 : 0,
          resourceUsage: {
            memoryUsage: 100 + (i * 50), // Increasing memory usage
            cpuTime: 600 + (i * 200),
            networkRequests: 3,
            storageOperations: 2,
            toolCalls: 5
          },
          lastExecuted: new Date().toISOString()
        });
      }
    });

    it("should identify potential enhancements for declining performance", () => {
      const enhancements = performanceTracker.identifyEnhancements("decliningWorkflow");
      
      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBeGreaterThan(0);
    });

    it("should return enhancement objects with required properties", () => {
      const enhancements = performanceTracker.identifyEnhancements("decliningWorkflow");
      
      enhancements.forEach(enhancement => {
        expect(enhancement.id).toBeDefined();
        expect(enhancement.type).toBeDefined();
        expect(enhancement.description).toBeDefined();
        expect(typeof enhancement.impact).toBe("number");
        expect(enhancement.impact).toBeGreaterThan(0);
        expect(enhancement.impact).toBeLessThanOrEqual(1);
      });
    });

    it("should identify different types of enhancements", () => {
      const enhancements = performanceTracker.identifyEnhancements("decliningWorkflow");
      
      const enhancementTypes = enhancements.map(e => e.type);
      expect(enhancementTypes.some(type => 
        ["optimization", "error_handling", "parameter_tune", "refactor"].includes(type)
      )).toBe(true);
    });

    it("should handle workflow with good performance", () => {
      // Add good performance data
      performanceTracker.recordPerformance("goodWorkflow", {
        executionTime: 800,
        success: true,
        errorRate: 0.001,
        qualityScore: 0.95,
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 80,
          cpuTime: 400,
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3
        },
        lastExecuted: new Date().toISOString()
      });

      const enhancements = performanceTracker.identifyEnhancements("goodWorkflow");
      
      expect(Array.isArray(enhancements)).toBe(true);
      // Good performance should result in fewer or no enhancement suggestions
    });

    it("should handle non-existent workflow", () => {
      const enhancements = performanceTracker.identifyEnhancements("nonExistentWorkflow");
      
      expect(Array.isArray(enhancements)).toBe(true);
      expect(enhancements.length).toBe(0);
    });
  });

  describe("generateOptimizationRecommendations", () => {
    beforeEach(() => {
      // Add test performance data
      performanceTracker.recordPerformance("testWorkflow", {
        executionTime: 1500,
        success: true,
        errorRate: 0.03,
        qualityScore: 0.75,
        completionRate: 0.9,
        retryCount: 1,
        resourceUsage: {
          memoryUsage: 150,
          cpuTime: 900,
          networkRequests: 8,
          storageOperations: 5,
          toolCalls: 10
        },
        lastExecuted: new Date().toISOString()
      });
    });

    it("should generate optimization recommendations", () => {
      const recommendations = performanceTracker.generateOptimizationRecommendations("testWorkflow");
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(recommendations.priority).toBeDefined();
      expect(["high", "medium", "low"]).toContain(recommendations.priority);
      expect(typeof recommendations.estimatedImpact).toBe("number");
    });

    it("should include actionable recommendations", () => {
      const recommendations = performanceTracker.generateOptimizationRecommendations("testWorkflow");
      
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      recommendations.recommendations.forEach(rec => {
        expect(typeof rec).toBe("string");
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it("should handle non-existent workflow", () => {
      const recommendations = performanceTracker.generateOptimizationRecommendations("nonExistentWorkflow");
      
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(typeof recommendations.estimatedImpact).toBe("number");
      expect(["high", "medium", "low"]).toContain(recommendations.priority);
    });
  });

  describe("calculateTrendMetrics", () => {
    beforeEach(() => {
      // Add time-series performance data
      const baseTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      for (let i = 0; i < 7; i++) {
        const timestamp = new Date(baseTime + (i * 24 * 60 * 60 * 1000)).toISOString();
        performanceTracker.recordPerformance("trendWorkflow", {
          executionTime: 1000 - (i * 50), // Improving execution time
          success: true,
          errorRate: 0.05 - (i * 0.005), // Decreasing error rate
          qualityScore: 0.7 + (i * 0.03), // Improving quality
          completionRate: 0.9 + (i * 0.01),
          retryCount: Math.max(0, 2 - i),
          resourceUsage: {
            memoryUsage: 120 - (i * 5),
            cpuTime: 700 - (i * 30),
            networkRequests: 4,
            storageOperations: 2,
            toolCalls: 6
          },
          lastExecuted: timestamp
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
      const improvingTrends = stats.trend.filter(t => t.trend === "improving");
      expect(improvingTrends.length).toBeGreaterThan(0);
    });
  });

  describe("resource usage tracking", () => {
    it("should track resource usage metrics", () => {
      const performanceData = {
        executionTime: 1200,
        success: true,
        errorRate: 0.01,
        qualityScore: 0.8,
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 256,
          cpuTime: 1500,
          networkRequests: 12,
          storageOperations: 8,
          toolCalls: 15
        },
        lastExecuted: new Date().toISOString()
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
        executionTime: 1000,
        success: true,
        errorRate: 0,
        qualityScore: 1.5, // Invalid - greater than 1
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 100,
          cpuTime: 600,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5
        },
        lastExecuted: new Date().toISOString()
      };

      expect(() => {
        performanceTracker.recordPerformance("invalidWorkflow", invalidData);
      }).not.toThrow();
    });

    it("should handle negative execution times", () => {
      const invalidData = {
        executionTime: -500, // Invalid negative time
        success: true,
        errorRate: 0,
        qualityScore: 0.8,
        completionRate: 1.0,
        retryCount: 0,
        resourceUsage: {
          memoryUsage: 100,
          cpuTime: 600,
          networkRequests: 3,
          storageOperations: 2,
          toolCalls: 5
        },
        lastExecuted: new Date().toISOString()
      };

      expect(() => {
        performanceTracker.recordPerformance("invalidWorkflow", invalidData);
      }).not.toThrow();
    });
  });
});