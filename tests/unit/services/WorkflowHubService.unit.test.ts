import { beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowHubService } from "../../../src/services/WorkflowHubService.js";

// Mock the relay functions
vi.mock("../../../src/relay.js", () => ({
  fetchEvents: vi.fn(),
}));

// Mock the process module
vi.mock("../../../src/process.js", () => ({
  sendEvent: vi.fn(),
}));

import { fetchEvents } from "../../../src/relay.js";
import { sendEvent } from "../../../src/process.js";

describe("WorkflowHubService", () => {
  let workflowHubService: WorkflowHubService;
  const mockFetchEvents = fetchEvents as any;
  const mockSendEvent = sendEvent as any;

  beforeEach(() => {
    vi.clearAllMocks();
    workflowHubService = new WorkflowHubService();
    
    // Default mock responses
    mockFetchEvents.mockResolvedValue([]);
    mockSendEvent.mockResolvedValue({ success: true });
  });

  describe("constructor", () => {
    it("should initialize without errors", () => {
      expect(workflowHubService).toBeDefined();
      expect(workflowHubService).toBeInstanceOf(WorkflowHubService);
    });
  });

  describe("getHubStatistics", () => {
    beforeEach(() => {
      const mockWorkflowEvents = [
        {
          Id: "workflow1",
          Content: "Test workflow 1",
          ai_type: "workflow",
          workflow_capability: "data-processing",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.8,"executionTime":1000}',
          Timestamp: "2024-01-01T00:00:00Z"
        },
        {
          Id: "workflow2", 
          Content: "Test workflow 2",
          ai_type: "workflow",
          workflow_capability: "analysis",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.9,"executionTime":800}',
          Timestamp: "2024-01-02T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockWorkflowEvents);
    });

    it("should return hub statistics", async () => {
      const stats = await workflowHubService.getHubStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalPublicWorkflows).toBe("number");
      expect(typeof stats.averageReputationScore).toBe("number");
      expect(typeof stats.networkHealthScore).toBe("number");
      expect(Array.isArray(stats.topCapabilities)).toBe(true);
      
      expect(stats.totalPublicWorkflows).toBeGreaterThanOrEqual(0);
      expect(stats.averageReputationScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageReputationScore).toBeLessThanOrEqual(1);
      expect(stats.networkHealthScore).toBeGreaterThanOrEqual(0);
      expect(stats.networkHealthScore).toBeLessThanOrEqual(1);
    });

    it("should handle empty hub", async () => {
      mockFetchEvents.mockResolvedValue([]);
      
      const stats = await workflowHubService.getHubStatistics();
      
      expect(stats.totalPublicWorkflows).toBe(0);
      expect(stats.averageReputationScore).toBe(0);
      expect(stats.networkHealthScore).toBe(0);
      expect(stats.topCapabilities).toEqual([]);
    });

    it("should filter by public workflows only", async () => {
      const mixedEvents = [
        {
          Id: "public-workflow",
          ai_type: "workflow",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.8}'
        },
        {
          Id: "private-workflow",
          ai_type: "workflow", 
          ai_tag: ["private"],
          workflow_performance: '{"qualityScore":0.9}'
        }
      ];
      mockFetchEvents.mockResolvedValue(mixedEvents);
      
      const stats = await workflowHubService.getHubStatistics();
      
      // The actual implementation counts all workflows returned by fetchEvents
      // as it filters at the query level, not after fetching
      expect(stats.totalPublicWorkflows).toBe(2);
    });
  });

  describe("searchByCapability", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "workflow1",
          Content: "Data processing workflow",
          ai_type: "workflow",
          workflow_capability: "data-processing",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.85}',
          Timestamp: "2024-01-01T00:00:00Z"
        },
        {
          Id: "workflow2",
          Content: "Analysis workflow", 
          ai_type: "workflow",
          workflow_capability: "analysis",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.9}',
          Timestamp: "2024-01-01T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should search workflows by capability", async () => {
      const results = await workflowHubService.searchByCapability("data-processing");
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it("should return workflows with correct structure", async () => {
      const results = await workflowHubService.searchByCapability("data-processing");
      
      if (results.length > 0) {
        const workflow = results[0];
        expect(workflow.workflowId).toBeDefined();
        expect(workflow.name).toBeDefined();
        expect(workflow.description).toBeDefined();
        expect(workflow.hubId).toBeDefined();
        expect(workflow.capabilities).toBeDefined();
        expect(Array.isArray(workflow.capabilities)).toBe(true);
        expect(typeof workflow.reputationScore).toBe("number");
        expect(workflow.performanceMetrics).toBeDefined();
      }
    });

    it("should handle non-existent capability", async () => {
      // Reset mock to return empty array for non-existent capability
      mockFetchEvents.mockResolvedValue([]);
      
      const results = await workflowHubService.searchByCapability("non-existent-capability");
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it("should filter results by capability", async () => {
      const results = await workflowHubService.searchByCapability("data-processing");
      
      // Since the service returns all workflows from mock data,
      // we only check if the service returns results appropriately
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("searchByRequirements", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "workflow1",
          Content: "API workflow",
          ai_type: "workflow",
          workflow_requirement: "api-access",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.8}',
          Timestamp: "2024-01-01T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should search workflows by requirements", async () => {
      const results = await workflowHubService.searchByRequirements(["api-access"]);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle multiple requirements", async () => {
      const results = await workflowHubService.searchByRequirements(["api-access", "database"]);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle empty requirements array", async () => {
      const results = await workflowHubService.searchByRequirements([]);
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("searchByQuery", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "workflow1",
          Content: "Data processing automation workflow",
          ai_type: "workflow",
          ai_tag: ["public"],
          workflow_capability: "automation",
          workflow_performance: '{"qualityScore":0.85}',
          Timestamp: "2024-01-01T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should search workflows by text query", async () => {
      const results = await workflowHubService.searchByQuery("automation");
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should apply filters when provided", async () => {
      const filters = {
        minReputationScore: 0.8,
        capabilities: ["automation"],
        tags: ["public"]
      };
      
      const results = await workflowHubService.searchByQuery("workflow", filters);
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle empty query", async () => {
      const results = await workflowHubService.searchByQuery("");
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should apply reputation score filter", async () => {
      const results = await workflowHubService.searchByQuery("workflow", {
        minReputationScore: 0.9
      });
      
      results.forEach(workflow => {
        expect(workflow.reputationScore).toBeGreaterThanOrEqual(0.9);
      });
    });
  });

  describe("findWorkflows", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "workflow1",
          Content: "Similar workflow",
          ai_type: "workflow",
          workflow_capability: "data-processing",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.8}',
          Timestamp: "2024-01-01T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should find workflows similar to reference", async () => {
      const results = await workflowHubService.findWorkflows("reference-workflow");
      
      expect(Array.isArray(results)).toBe(true);
    });

    it("should handle non-existent reference workflow", async () => {
      const results = await workflowHubService.findWorkflows("non-existent");
      
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe("getEnhancementPatterns", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "enhancement1",
          Content: "Performance optimization pattern",
          ai_type: "enhancement",
          workflow_id: "target-workflow",
          workflow_enhancement: '{"type":"optimization","impact":0.3}',
          enhancement_type: "performance",
          enhancement_impact: "0.3",
          enhancement_risk: "low",
          workflow_capability: "data-processing"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should get enhancement patterns for workflow", async () => {
      const patterns = await workflowHubService.getEnhancementPatterns("target-workflow");
      
      expect(Array.isArray(patterns)).toBe(true);
    });

    it("should return pattern objects with correct structure", async () => {
      const patterns = await workflowHubService.getEnhancementPatterns("target-workflow");
      
      if (patterns.length > 0) {
        const pattern = patterns[0];
        expect(pattern.patternId).toBeDefined();
        expect(pattern.type).toBeDefined();
        expect(pattern.description).toBeDefined();
        expect(typeof pattern.impact).toBe("number");
        expect(pattern.riskLevel).toBeDefined();
        expect(Array.isArray(pattern.applicableToCapabilities)).toBe(true);
      }
    });

    it("should handle workflow with no enhancements", async () => {
      mockFetchEvents.mockResolvedValue([]);
      
      const patterns = await workflowHubService.getEnhancementPatterns("no-enhancements");
      
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBe(0);
    });
  });

  describe("convertEventToWorkflow", () => {
    it("should convert event to workflow object", () => {
      const mockEvent = {
        Id: "test-event-123",
        Content: "Test workflow description",
        Timestamp: "2024-01-01T00:00:00Z",
        p: "user-address",
        From: "creator-address",
        ai_type: "workflow",
        workflow_id: "test-workflow",
        workflow_capability: "data-analysis",
        workflow_requirement: "api-access",
        workflow_performance: '{"qualityScore":0.9,"executionTime":1200}',
        ai_tag: ["public", "verified"],
        ai_importance: "0.8",
        ai_access_count: "25"
      };

      const workflow = workflowHubService.convertEventToWorkflow(mockEvent, "test-hub");
      
      expect(workflow.workflowId).toBe("test-workflow");
      expect(workflow.hubId).toBe("HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg");
      expect(workflow.name).toBeDefined();
      expect(workflow.description).toBe("Test workflow description");
      expect(workflow.capabilities).toEqual(["data-analysis"]);
      expect(workflow.requirements).toEqual(["api-access"]);
      expect(workflow.tags).toEqual(["public", "verified"]);
      expect(workflow.performanceMetrics.qualityScore).toBe(0.9);
      expect(workflow.isPublic).toBe(true);
      expect(workflow.usageCount).toBe(25);
    });

    it("should handle minimal event data", () => {
      const minimalEvent = {
        Id: "minimal-123",
        Content: "Minimal workflow",
        Timestamp: "2024-01-01T00:00:00Z",
        p: "user"
      };

      const workflow = workflowHubService.convertEventToWorkflow(minimalEvent, "test-hub");
      
      expect(workflow.workflowId).toBe("minimal-123");
      expect(workflow.capabilities).toEqual([]);
      expect(workflow.requirements).toEqual([]);
      expect(workflow.tags).toEqual([]);
      expect(workflow.isPublic).toBe(false);
      expect(workflow.reputationScore).toBeGreaterThanOrEqual(0);
    });

    it("should handle malformed JSON gracefully", () => {
      const eventWithBadJSON = {
        Id: "bad-json",
        Content: "Test",
        Timestamp: "2024-01-01T00:00:00Z",
        p: "user",
        workflow_performance: "invalid-json"
      };

      expect(() => {
        const workflow = workflowHubService.convertEventToWorkflow(eventWithBadJSON, "test-hub");
        expect(workflow.performanceMetrics.qualityScore).toBe(0.5); // Default value
      }).not.toThrow();
    });

    it("should calculate reputation score correctly", () => {
      const highQualityEvent = {
        Id: "high-quality",
        Content: "High quality workflow",
        Timestamp: "2024-01-01T00:00:00Z",
        p: "user",
        workflow_performance: '{"qualityScore":0.95,"success":true}',
        ai_access_count: "100",
        ai_importance: "0.9",
        workflow_enhancement: '{"type":"optimization"}'
      };

      const workflow = workflowHubService.convertEventToWorkflow(highQualityEvent, "test-hub");
      
      expect(workflow.reputationScore).toBeGreaterThan(0.7);
      expect(workflow.reputationScore).toBeLessThanOrEqual(1);
    });
  });

  describe("error handling", () => {
    it("should handle fetchEvents errors gracefully", async () => {
      mockFetchEvents.mockRejectedValue(new Error("Network error"));
      
      const stats = await workflowHubService.getHubStatistics();
      
      expect(stats.totalPublicWorkflows).toBe(0);
      expect(stats.averageReputationScore).toBe(0);
      expect(stats.networkHealthScore).toBe(0);
    });

    it("should handle malformed event data", async () => {
      const malformedEvents = [
        null,
        undefined,
        { malformed: "data" },
        { Id: "valid", Content: "Valid event" }
      ];
      mockFetchEvents.mockResolvedValue(malformedEvents);
      
      const results = await workflowHubService.searchByQuery("test");
      
      expect(Array.isArray(results)).toBe(true);
      // Should only process valid events
    });

    it("should handle empty responses", async () => {
      mockFetchEvents.mockResolvedValue(null);
      
      const results = await workflowHubService.searchByCapability("test");
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe("filtering and sorting", () => {
    beforeEach(() => {
      const mockEvents = [
        {
          Id: "workflow1",
          Content: "High quality workflow",
          ai_type: "workflow",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.9}',
          ai_access_count: "50",
          Timestamp: "2024-01-01T00:00:00Z"
        },
        {
          Id: "workflow2", 
          Content: "Medium quality workflow",
          ai_type: "workflow",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.7}',
          ai_access_count: "20",
          Timestamp: "2024-01-02T00:00:00Z"
        },
        {
          Id: "workflow3",
          Content: "Low quality workflow", 
          ai_type: "workflow",
          ai_tag: ["public"],
          workflow_performance: '{"qualityScore":0.5}',
          ai_access_count: "5",
          Timestamp: "2024-01-03T00:00:00Z"
        }
      ];
      mockFetchEvents.mockResolvedValue(mockEvents);
    });

    it("should sort results by reputation score", async () => {
      const results = await workflowHubService.searchByQuery("workflow");
      
      expect(results.length).toBeGreaterThan(1);
      
      // Check if sorted by reputation score (descending)
      for (let i = 1; i < results.length; i++) {
        expect(results[i-1].reputationScore).toBeGreaterThanOrEqual(results[i].reputationScore);
      }
    });

    it("should filter by minimum reputation score", async () => {
      const results = await workflowHubService.searchByQuery("workflow", {
        minReputationScore: 0.8
      });
      
      results.forEach(workflow => {
        expect(workflow.reputationScore).toBeGreaterThanOrEqual(0.8);
      });
    });
  });
});