/**
 * Basic integration test for workflow ecosystem
 * Tests core workflow functionality without requiring full MCP setup
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Workflow Ecosystem Integration', () => {
  let WorkflowPerformanceTracker, WorkflowRelationshipManager, WorkflowEnhancementEngine, WorkflowAnalyticsService;

  beforeAll(async () => {
    // Import the workflow services
    const performanceModule = await import('../dist/services/WorkflowPerformanceTracker.js');
    const relationshipModule = await import('../dist/services/WorkflowRelationshipManager.js');
    const enhancementModule = await import('../dist/services/WorkflowEnhancementEngine.js');
    const analyticsModule = await import('../dist/services/WorkflowAnalyticsService.js');

    WorkflowPerformanceTracker = performanceModule.WorkflowPerformanceTracker;
    WorkflowRelationshipManager = relationshipModule.WorkflowRelationshipManager;
    WorkflowEnhancementEngine = enhancementModule.WorkflowEnhancementEngine;
    WorkflowAnalyticsService = analyticsModule.WorkflowAnalyticsService;
  });

  it('should create workflow services without errors', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const enhancementEngine = new WorkflowEnhancementEngine(performanceTracker, relationshipManager);
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);

    expect(performanceTracker).toBeDefined();
    expect(relationshipManager).toBeDefined();
    expect(enhancementEngine).toBeDefined();
    expect(analyticsService).toBeDefined();
  });

  it('should track workflow performance', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    
    const testPerformance = {
      executionTime: 1500,
      success: true,
      errorRate: 0.02,
      qualityScore: 0.95,
      completionRate: 1.0,
      retryCount: 0,
      resourceUsage: {
        memoryUsage: 128,
        cpuTime: 800,
        networkRequests: 3,
        storageOperations: 2,
        toolCalls: 5
      },
      userSatisfaction: 0.9,
      lastExecuted: new Date().toISOString()
    };

    expect(() => {
      performanceTracker.recordPerformance('test-workflow-1', testPerformance);
    }).not.toThrow();

    const stats = performanceTracker.getPerformanceStats('test-workflow-1');
    expect(stats.current).toBeDefined();
    expect(stats.current.executionTime).toBe(1500);
    expect(stats.current.success).toBe(true);
  });

  it('should create workflow relationships', () => {
    const relationshipManager = new WorkflowRelationshipManager();

    expect(() => {
      relationshipManager.createRelationship(
        'workflow-a',
        'workflow-b',
        'inherits',
        0.8
      );
    }).not.toThrow();

    const relationships = relationshipManager.getRelationships('workflow-a');
    expect(relationships).toHaveLength(1);
    expect(relationships[0].targetId).toBe('workflow-b');
    expect(relationships[0].type).toBe('inherits');
    expect(relationships[0].strength).toBe(0.8);
  });

  it('should initialize enhancement loops', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const enhancementEngine = new WorkflowEnhancementEngine(performanceTracker, relationshipManager);

    const optimizationTargets = [
      { metric: 'execution_time', targetValue: 0.8, weight: 0.3, achieved: false },
      { metric: 'success_rate', targetValue: 0.95, weight: 0.4, achieved: false },
      { metric: 'quality_score', targetValue: 0.9, weight: 0.3, achieved: false }
    ];

    expect(() => {
      enhancementEngine.initializeEnhancementLoop('test-workflow-1', optimizationTargets);
    }).not.toThrow();
  });

  it('should generate workflow analytics', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);

    // Add some test data
    const testPerformance = {
      executionTime: 1200,
      success: true,
      errorRate: 0.01,
      qualityScore: 0.92,
      completionRate: 1.0,
      retryCount: 0,
      resourceUsage: {
        memoryUsage: 96,
        cpuTime: 600,
        networkRequests: 2,
        storageOperations: 1,
        toolCalls: 3
      },
      lastExecuted: new Date().toISOString()
    };

    performanceTracker.recordPerformance('analytics-test-workflow', testPerformance);

    const analytics = analyticsService.getWorkflowAnalytics('analytics-test-workflow');
    expect(analytics).toBeDefined();
    expect(analytics.workflowDistribution).toBeDefined();
    expect(analytics.enhancementEffectiveness).toBeDefined();
    expect(analytics.collaborationMetrics).toBeDefined();
    expect(analytics.learningEfficiency).toBeDefined();
  });

  it('should identify potential enhancements', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    
    // Record some performance data to analyze
    for (let i = 0; i < 10; i++) {
      const performance = {
        executionTime: 1000 + (i * 100), // Increasing execution time
        success: i < 8, // Some failures
        errorRate: i > 5 ? 0.1 : 0.02,
        qualityScore: 0.9 - (i * 0.02),
        completionRate: 1.0,
        retryCount: i > 5 ? 1 : 0,
        resourceUsage: {
          memoryUsage: 100 + (i * 10),
          cpuTime: 500 + (i * 50),
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3
        },
        lastExecuted: new Date().toISOString()
      };
      
      performanceTracker.recordPerformance('degrading-workflow', performance);
    }

    const enhancements = performanceTracker.identifyEnhancements('degrading-workflow');
    expect(enhancements.length).toBeGreaterThan(0);
    
    // Should identify performance degradation
    const hasPerformanceEnhancement = enhancements.some(e => 
      e.description.toLowerCase().includes('performance') || 
      e.description.toLowerCase().includes('optimization')
    );
    expect(hasPerformanceEnhancement).toBe(true);
  });

  it('should generate optimization recommendations', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);

    const recommendations = analyticsService.generateRecommendations();
    expect(recommendations).toBeDefined();
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should calculate ecosystem health score', () => {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);

    const healthScore = analyticsService.getEcosystemHealthScore();
    expect(typeof healthScore).toBe('number');
    expect(healthScore).toBeGreaterThanOrEqual(0);
    expect(healthScore).toBeLessThanOrEqual(1);
  });
});