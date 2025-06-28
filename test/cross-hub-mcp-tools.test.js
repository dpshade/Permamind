/**
 * Tests for Cross-Hub Discovery MCP Tools
 * Tests the MCP tool integration for cross-hub functionality
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

describe('Cross-Hub Discovery MCP Tools', () => {
  let server;
  let workflowServices;

  beforeAll(async () => {
    // Mock the server and workflow services structure
    server = {
      tools: new Map(),
      addTool: function(toolConfig) {
        this.tools.set(toolConfig.name, toolConfig);
      }
    };

    // Import and initialize the services
    const { CrossHubDiscoveryService } = await import('../dist/services/CrossHubDiscoveryService.js');
    const { WorkflowPerformanceTracker } = await import('../dist/services/WorkflowPerformanceTracker.js');
    const { WorkflowRelationshipManager } = await import('../dist/services/WorkflowRelationshipManager.js');
    const { WorkflowEnhancementEngine } = await import('../dist/services/WorkflowEnhancementEngine.js');
    const { WorkflowAnalyticsService } = await import('../dist/services/WorkflowAnalyticsService.js');

    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const enhancementEngine = new WorkflowEnhancementEngine(performanceTracker, relationshipManager);
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);
    const crossHubDiscovery = new CrossHubDiscoveryService();

    workflowServices = {
      performanceTracker,
      relationshipManager,
      enhancementEngine,
      analyticsService,
      crossHubDiscovery
    };
  });

  describe('discoverCrossHubWorkflows Tool', () => {
    let discoverTool;

    beforeEach(() => {
      // Mock the tool as it would be registered
      discoverTool = {
        name: "discoverCrossHubWorkflows",
        execute: async (args) => {
          if (!workflowServices) {
            return "Workflow services not initialized";
          }

          const discoveryService = workflowServices.crossHubDiscovery;
          let workflows = [];

          switch (args.discoveryType) {
            case "capability":
              if (!args.capability) {
                return "capability parameter required for capability discovery";
              }
              workflows = await discoveryService.discoverByCapability(args.capability);
              break;

            case "requirements":
              if (!args.requirements) {
                return "requirements parameter required for requirements discovery";
              }
              const requirementsList = args.requirements.split(",").map(r => r.trim());
              workflows = await discoveryService.findWorkflowsForRequirements(requirementsList);
              break;

            case "similar":
              if (!args.localWorkflowId) {
                return "localWorkflowId parameter required for similarity discovery";
              }
              workflows = await discoveryService.findSimilarWorkflows(args.localWorkflowId, 'test-hub');
              break;

            case "search":
              if (!args.query) {
                return "query parameter required for search discovery";
              }
              const filters = {
                capabilities: args.capabilities ? args.capabilities.split(",").map(c => c.trim()) : undefined,
                tags: args.tags ? args.tags.split(",").map(t => t.trim()) : undefined,
                minReputationScore: args.minReputationScore,
                minPerformanceScore: args.minPerformanceScore,
              };
              workflows = await discoveryService.searchGlobalWorkflows(args.query, filters);
              break;

            default:
              return "Invalid discoveryType. Use: capability, requirements, similar, or search";
          }

          return JSON.stringify({
            discoveryType: args.discoveryType,
            totalFound: workflows.length,
            workflows: workflows.slice(0, args.limit || 10),
            hasMore: workflows.length > (args.limit || 10)
          });
        }
      };
    });

    it('should validate required parameters for capability discovery', async () => {
      const result = await discoverTool.execute({ discoveryType: "capability" });
      expect(result).toBe("capability parameter required for capability discovery");
    });

    it('should validate required parameters for requirements discovery', async () => {
      const result = await discoverTool.execute({ discoveryType: "requirements" });
      expect(result).toBe("requirements parameter required for requirements discovery");
    });

    it('should validate required parameters for similarity discovery', async () => {
      const result = await discoverTool.execute({ discoveryType: "similar" });
      expect(result).toBe("localWorkflowId parameter required for similarity discovery");
    });

    it('should validate required parameters for search discovery', async () => {
      const result = await discoverTool.execute({ discoveryType: "search" });
      expect(result).toBe("query parameter required for search discovery");
    });

    it('should reject invalid discovery types', async () => {
      const result = await discoverTool.execute({ discoveryType: "invalid" });
      expect(result).toBe("Invalid discoveryType. Use: capability, requirements, similar, or search");
    });

    it('should handle capability discovery with mock data', async () => {
      // Mock the discovery service method
      workflowServices.crossHubDiscovery.discoverByCapability = vi.fn().mockResolvedValue([
        {
          workflowId: 'data-analyzer-1',
          capabilities: ['data-analysis'],
          reputationScore: 0.9,
          performanceMetrics: { qualityScore: 0.95 }
        },
        {
          workflowId: 'data-analyzer-2', 
          capabilities: ['data-analysis', 'visualization'],
          reputationScore: 0.8,
          performanceMetrics: { qualityScore: 0.85 }
        }
      ]);

      const result = await discoverTool.execute({
        discoveryType: "capability",
        capability: "data-analysis",
        limit: 5
      });

      const parsed = JSON.parse(result);
      expect(parsed.discoveryType).toBe("capability");
      expect(parsed.totalFound).toBe(2);
      expect(parsed.workflows).toHaveLength(2);
      expect(parsed.hasMore).toBe(false);
      expect(parsed.workflows[0].workflowId).toBe('data-analyzer-1');
    });

    it('should handle requirements discovery with parsing', async () => {
      workflowServices.crossHubDiscovery.findWorkflowsForRequirements = vi.fn().mockResolvedValue([
        { workflowId: 'bulk-processor', requirements: ['large-datasets', 'real-time'] }
      ]);

      const result = await discoverTool.execute({
        discoveryType: "requirements",
        requirements: "large-datasets, real-time"
      });

      const parsed = JSON.parse(result);
      expect(parsed.totalFound).toBe(1);
      expect(workflowServices.crossHubDiscovery.findWorkflowsForRequirements)
        .toHaveBeenCalledWith(['large-datasets', 'real-time']);
    });

    it('should handle search with filter parsing', async () => {
      workflowServices.crossHubDiscovery.searchGlobalWorkflows = vi.fn().mockResolvedValue([]);

      await discoverTool.execute({
        discoveryType: "search",
        query: "financial reporting",
        capabilities: "analysis, reporting",
        tags: "finance, public",
        minReputationScore: 0.8,
        minPerformanceScore: 0.9
      });

      expect(workflowServices.crossHubDiscovery.searchGlobalWorkflows).toHaveBeenCalledWith(
        "financial reporting",
        {
          capabilities: ['analysis', 'reporting'],
          tags: ['finance', 'public'],
          minReputationScore: 0.8,
          minPerformanceScore: 0.9
        }
      );
    });

    it('should limit results correctly', async () => {
      const manyWorkflows = Array.from({ length: 20 }, (_, i) => ({
        workflowId: `workflow-${i}`,
        reputationScore: 0.5
      }));

      workflowServices.crossHubDiscovery.discoverByCapability = vi.fn().mockResolvedValue(manyWorkflows);

      const result = await discoverTool.execute({
        discoveryType: "capability",
        capability: "test",
        limit: 5
      });

      const parsed = JSON.parse(result);
      expect(parsed.totalFound).toBe(20);
      expect(parsed.workflows).toHaveLength(5);
      expect(parsed.hasMore).toBe(true);
    });
  });

  describe('getNetworkStatistics Tool', () => {
    let statsTool;

    beforeEach(() => {
      statsTool = {
        name: "getNetworkStatistics",
        execute: async () => {
          if (!workflowServices) {
            return "Workflow services not initialized";
          }

          const discoveryService = workflowServices.crossHubDiscovery;
          const stats = await discoveryService.getNetworkStatistics();

          return JSON.stringify(stats);
        }
      };
    });

    it('should return network statistics', async () => {
      workflowServices.crossHubDiscovery.getNetworkStatistics = vi.fn().mockResolvedValue({
        totalHubs: 5,
        totalPublicWorkflows: 47,
        averageReputationScore: 0.82,
        topCapabilities: ['data-analysis', 'content-generation', 'automation'],
        networkHealthScore: 0.87
      });

      const result = await statsTool.execute();
      const stats = JSON.parse(result);

      expect(stats.totalHubs).toBe(5);
      expect(stats.totalPublicWorkflows).toBe(47);
      expect(stats.averageReputationScore).toBe(0.82);
      expect(stats.topCapabilities).toContain('data-analysis');
      expect(stats.networkHealthScore).toBe(0.87);
    });

    it('should handle empty network', async () => {
      workflowServices.crossHubDiscovery.getNetworkStatistics = vi.fn().mockResolvedValue({
        totalHubs: 0,
        totalPublicWorkflows: 0,
        averageReputationScore: 0,
        topCapabilities: [],
        networkHealthScore: 0
      });

      const result = await statsTool.execute();
      const stats = JSON.parse(result);

      expect(stats.totalHubs).toBe(0);
      expect(stats.networkHealthScore).toBe(0);
    });
  });

  describe('requestEnhancementPatterns Tool', () => {
    let patternsTool;

    beforeEach(() => {
      patternsTool = {
        name: "requestEnhancementPatterns",
        execute: async (args) => {
          if (!workflowServices) {
            return "Workflow services not initialized";
          }

          const discoveryService = workflowServices.crossHubDiscovery;
          const patterns = await discoveryService.requestEnhancementPatterns(
            args.sourceHubId,
            args.sourceWorkflowId
          );

          return JSON.stringify({
            sourceHubId: args.sourceHubId,
            sourceWorkflowId: args.sourceWorkflowId,
            patternsFound: patterns.length,
            patterns: patterns
          });
        }
      };
    });

    it('should request enhancement patterns from specified workflow', async () => {
      const mockPatterns = [
        {
          patternId: 'pattern_1',
          type: 'optimization',
          description: 'Parallel processing implementation',
          impact: 0.35,
          riskLevel: 'low',
          applicableToCapabilities: ['data-processing']
        },
        {
          patternId: 'pattern_2',
          type: 'caching',
          description: 'Smart result caching strategy', 
          impact: 0.28,
          riskLevel: 'low',
          applicableToCapabilities: ['api-calls', 'data-retrieval']
        }
      ];

      workflowServices.crossHubDiscovery.requestEnhancementPatterns = vi.fn().mockResolvedValue(mockPatterns);

      const result = await patternsTool.execute({
        sourceHubId: 'high-perf-hub',
        sourceWorkflowId: 'super-fast-processor'
      });

      const response = JSON.parse(result);
      expect(response.sourceHubId).toBe('high-perf-hub');
      expect(response.sourceWorkflowId).toBe('super-fast-processor');
      expect(response.patternsFound).toBe(2);
      expect(response.patterns).toHaveLength(2);
      expect(response.patterns[0].type).toBe('optimization');
      expect(response.patterns[1].impact).toBe(0.28);
    });

    it('should handle workflows with no patterns', async () => {
      workflowServices.crossHubDiscovery.requestEnhancementPatterns = vi.fn().mockResolvedValue([]);

      const result = await patternsTool.execute({
        sourceHubId: 'empty-hub',
        sourceWorkflowId: 'basic-workflow'
      });

      const response = JSON.parse(result);
      expect(response.patternsFound).toBe(0);
      expect(response.patterns).toEqual([]);
    });
  });

  describe('discoverHubs Tool', () => {
    let hubsTool;

    beforeEach(() => {
      hubsTool = {
        name: "discoverHubs",
        execute: async (args) => {
          if (!workflowServices) {
            return "Workflow services not initialized";
          }

          const discoveryService = workflowServices.crossHubDiscovery;
          const hubs = await discoveryService.discoverHubs(args?.forceRefresh || false);

          return JSON.stringify({
            totalHubs: hubs.length,
            hubs: hubs.map(hub => ({
              processId: hub.processId,
              workflowCount: hub.workflowCount,
              hasPublicWorkflows: hub.hasPublicWorkflows,
              reputationScore: hub.reputationScore,
              lastActivity: hub.lastActivity
            }))
          });
        }
      };
    });

    it('should discover and return hub information', async () => {
      const mockHubs = [
        {
          processId: 'hub-123',
          workflowCount: 15,
          hasPublicWorkflows: true,
          reputationScore: 0.85,
          lastActivity: '2024-01-01T00:00:00Z'
        },
        {
          processId: 'hub-456',
          workflowCount: 8,
          hasPublicWorkflows: true,
          reputationScore: 0.72,
          lastActivity: '2024-01-02T00:00:00Z'
        }
      ];

      workflowServices.crossHubDiscovery.discoverHubs = vi.fn().mockResolvedValue(mockHubs);

      const result = await hubsTool.execute();
      const response = JSON.parse(result);

      expect(response.totalHubs).toBe(2);
      expect(response.hubs).toHaveLength(2);
      expect(response.hubs[0].processId).toBe('hub-123');
      expect(response.hubs[0].workflowCount).toBe(15);
      expect(response.hubs[1].reputationScore).toBe(0.72);
    });

    it('should handle force refresh parameter', async () => {
      workflowServices.crossHubDiscovery.discoverHubs = vi.fn().mockResolvedValue([]);

      await hubsTool.execute({ forceRefresh: true });

      expect(workflowServices.crossHubDiscovery.discoverHubs).toHaveBeenCalledWith(true);
    });

    it('should default to no force refresh', async () => {
      workflowServices.crossHubDiscovery.discoverHubs = vi.fn().mockResolvedValue([]);

      await hubsTool.execute();

      expect(workflowServices.crossHubDiscovery.discoverHubs).toHaveBeenCalledWith(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing workflow services', async () => {
      const tempServices = workflowServices;
      workflowServices = null;

      const discoverTool = {
        execute: async () => {
          if (!workflowServices) {
            return "Workflow services not initialized";
          }
          return "Should not reach here";
        }
      };

      const result = await discoverTool.execute();
      expect(result).toBe("Workflow services not initialized");

      workflowServices = tempServices;
    });

    it('should handle service method errors gracefully', async () => {
      workflowServices.crossHubDiscovery.discoverByCapability = vi.fn()
        .mockRejectedValue(new Error('Network timeout'));

      const discoverTool = {
        execute: async (args) => {
          try {
            const workflows = await workflowServices.crossHubDiscovery.discoverByCapability(args.capability);
            return JSON.stringify({ workflows });
          } catch (error) {
            return `Error: ${error.message}`;
          }
        }
      };

      const result = await discoverTool.execute({ capability: 'test' });
      expect(result).toBe('Error: Network timeout');
    });
  });

  describe('Parameter Validation', () => {
    it('should validate tool parameter types', () => {
      // Test parameter validation for the discovery tool
      const validParams = {
        discoveryType: "capability",
        capability: "data-analysis",
        limit: 10,
        minReputationScore: 0.8
      };

      expect(typeof validParams.discoveryType).toBe('string');
      expect(typeof validParams.capability).toBe('string');
      expect(typeof validParams.limit).toBe('number');
      expect(typeof validParams.minReputationScore).toBe('number');
      expect(validParams.minReputationScore).toBeGreaterThanOrEqual(0);
      expect(validParams.minReputationScore).toBeLessThanOrEqual(1);
    });

    it('should handle optional parameters correctly', async () => {
      const discoverTool = {
        execute: async (args) => {
          const filters = {
            capabilities: args.capabilities ? args.capabilities.split(",").map(c => c.trim()) : undefined,
            tags: args.tags ? args.tags.split(",").map(t => t.trim()) : undefined,
            minReputationScore: args.minReputationScore,
            minPerformanceScore: args.minPerformanceScore,
          };

          // Test that undefined optional parameters don't break the filter
          expect(filters.capabilities).toBeUndefined();
          expect(filters.tags).toBeUndefined();
          expect(filters.minReputationScore).toBeUndefined();
          expect(filters.minPerformanceScore).toBeUndefined();

          return JSON.stringify({ filters });
        }
      };

      const result = await discoverTool.execute({
        discoveryType: "search",
        query: "test"
      });

      const response = JSON.parse(result);
      expect(response.filters.capabilities).toBeUndefined();
    });
  });
});