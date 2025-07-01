/**
 * Demonstration of the Workflow Ecosystem
 * Shows how workflows can self-enhance and collaborate
 */

import { WorkflowPerformanceTracker } from "../dist/services/WorkflowPerformanceTracker.js";
import { WorkflowRelationshipManager } from "../dist/services/WorkflowRelationshipManager.js";
import { WorkflowEnhancementEngine } from "../dist/services/WorkflowEnhancementEngine.js";
import { WorkflowAnalyticsService } from "../dist/services/WorkflowAnalyticsService.js";

console.log("🧠 Permamind Workflow Ecosystem Demo\n");

// Initialize the workflow ecosystem
const performanceTracker = new WorkflowPerformanceTracker();
const relationshipManager = new WorkflowRelationshipManager();
const enhancementEngine = new WorkflowEnhancementEngine(
  performanceTracker,
  relationshipManager,
);
const analyticsService = new WorkflowAnalyticsService(
  performanceTracker,
  relationshipManager,
);

console.log("✅ Workflow services initialized");

// Demo 1: Performance Tracking
console.log("\n📊 Demo 1: Performance Tracking");
console.log('Recording performance data for "data-processor" workflow...');

for (let i = 0; i < 5; i++) {
  const performance = {
    executionTime: 1000 + Math.random() * 500,
    success: Math.random() > 0.1, // 90% success rate
    errorRate: Math.random() * 0.05,
    qualityScore: 0.85 + Math.random() * 0.1,
    completionRate: 0.95 + Math.random() * 0.05,
    retryCount: Math.random() > 0.8 ? 1 : 0,
    resourceUsage: {
      memoryUsage: 80 + Math.random() * 40,
      cpuTime: 400 + Math.random() * 200,
      networkRequests: Math.floor(Math.random() * 5) + 1,
      storageOperations: Math.floor(Math.random() * 3) + 1,
      toolCalls: Math.floor(Math.random() * 8) + 2,
    },
    userSatisfaction: 0.8 + Math.random() * 0.2,
    lastExecuted: new Date().toISOString(),
  };

  performanceTracker.recordPerformance("data-processor", performance);
}

const stats = performanceTracker.getPerformanceStats("data-processor");
console.log(
  `  Current performance: ${stats.current?.qualityScore?.toFixed(2)} quality score`,
);
console.log(
  `  Average performance: ${stats.average?.qualityScore?.toFixed(2)} quality score`,
);
console.log(`  Performance trends: ${stats.trend.length} metrics tracked`);

// Demo 2: Workflow Relationships
console.log("\n🔗 Demo 2: Workflow Relationships");
console.log("Creating workflow relationships...");

relationshipManager.createRelationship(
  "data-processor-v2",
  "data-processor",
  "enhances",
  0.9,
);
relationshipManager.createRelationship(
  "data-analyzer",
  "data-processor",
  "depends_on",
  0.8,
);
relationshipManager.createRelationship(
  "report-generator",
  "data-analyzer",
  "depends_on",
  0.7,
);

const relationships = relationshipManager.getRelationships("data-processor");
console.log(
  `  data-processor has ${relationships.length} outgoing relationships`,
);

const dependents = relationshipManager.getDependentWorkflows("data-processor");
console.log(
  `  ${dependents.length} workflows depend on data-processor: ${dependents.join(", ")}`,
);

const networkMetrics =
  relationshipManager.calculateNetworkMetrics("data-processor");
console.log(
  `  Network connectivity: ${(networkMetrics.connectivityScore * 100).toFixed(1)}%`,
);
console.log(
  `  Influence score: ${(networkMetrics.influenceScore * 100).toFixed(1)}%`,
);

// Demo 3: Enhancement Identification
console.log("\n⚡ Demo 3: Enhancement Identification");
console.log("Identifying potential improvements...");

// Simulate declining performance
for (let i = 0; i < 8; i++) {
  const performance = {
    executionTime: 1200 + i * 150, // Increasing execution time
    success: i < 6, // Some failures at the end
    errorRate: i > 4 ? 0.15 : 0.02,
    qualityScore: 0.9 - i * 0.03,
    completionRate: 1.0,
    retryCount: i > 4 ? 2 : 0,
    resourceUsage: {
      memoryUsage: 120 + i * 20,
      cpuTime: 600 + i * 100,
      networkRequests: 3,
      storageOperations: 2,
      toolCalls: 4,
    },
    lastExecuted: new Date().toISOString(),
  };

  performanceTracker.recordPerformance("declining-workflow", performance);
}

const enhancements =
  performanceTracker.identifyEnhancements("declining-workflow");
console.log(`  Identified ${enhancements.length} potential enhancements:`);
enhancements.forEach((enhancement, index) => {
  console.log(
    `    ${index + 1}. ${enhancement.type}: ${enhancement.description}`,
  );
  console.log(
    `       Expected impact: ${(enhancement.impact * 100).toFixed(1)}%`,
  );
});

// Demo 4: Analytics and Insights
console.log("\n📈 Demo 4: Analytics and Insights");
console.log("Generating ecosystem analytics...");

const analytics = analyticsService.getWorkflowAnalytics();
console.log(
  `  Total workflow types: ${Object.keys(analytics.workflowDistribution).length}`,
);

const healthScore = analyticsService.getEcosystemHealthScore();
console.log(`  Ecosystem health score: ${(healthScore * 100).toFixed(1)}%`);

const recommendations = analyticsService.generateRecommendations();
console.log(`  Generated ${recommendations.length} recommendations:`);
recommendations.slice(0, 3).forEach((rec, index) => {
  console.log(`    ${index + 1}. ${rec}`);
});

// Demo 5: Ecosystem Overview
console.log("\n🌐 Demo 5: Ecosystem Overview");
const ecosystemOverview = relationshipManager.getEcosystemOverview();
console.log(`  Total workflows: ${ecosystemOverview.totalWorkflows}`);
console.log(`  Total relationships: ${ecosystemOverview.totalRelationships}`);
console.log(
  `  Average connectivity: ${ecosystemOverview.averageConnectivity.toFixed(2)}`,
);
console.log(`  Hub workflows: ${ecosystemOverview.hubWorkflows.length}`);
console.log(
  `  Isolated workflows: ${ecosystemOverview.isolatedWorkflows.length}`,
);

// Demo 6: Self-Enhancement Simulation
console.log("\n🤖 Demo 6: Self-Enhancement Simulation");
console.log("Simulating workflow self-improvement...");

// Initialize enhancement loop
const optimizationTargets = [
  { metric: "execution_time", targetValue: 0.8, weight: 0.3, achieved: false },
  { metric: "success_rate", targetValue: 0.95, weight: 0.4, achieved: false },
  { metric: "quality_score", targetValue: 0.9, weight: 0.3, achieved: false },
];

enhancementEngine.initializeEnhancementLoop(
  "self-improving-workflow",
  optimizationTargets,
);

// Simulate user feedback
const userEnhancements = enhancementEngine.processUserFeedback(
  "self-improving-workflow",
  "The workflow is sometimes slow and could be more reliable",
  2.5,
);

console.log(
  `  User feedback generated ${userEnhancements.length} enhancement suggestions:`,
);
userEnhancements.forEach((enhancement, index) => {
  console.log(`    ${index + 1}. ${enhancement.description}`);
});

console.log("\n🎉 Workflow Ecosystem Demo Complete!");
console.log("\nKey Features Demonstrated:");
console.log("  ✅ Performance tracking and trend analysis");
console.log("  ✅ Workflow relationship management");
console.log("  ✅ Automatic enhancement identification");
console.log("  ✅ Comprehensive analytics and insights");
console.log("  ✅ Ecosystem health monitoring");
console.log("  ✅ Self-improvement capabilities");
console.log("\n🚀 Ready for decentralized self-enhancing workflows!");
