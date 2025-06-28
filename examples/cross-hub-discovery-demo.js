/**
 * Demonstration of Cross-Hub Workflow Discovery
 * Shows how workflows can discover and learn from workflows in other users' hubs
 */

import { CrossHubDiscoveryService } from "../dist/services/CrossHubDiscoveryService.js";

console.log("🌐 Cross-Hub Workflow Discovery Demo\n");

// Initialize the cross-hub discovery service
const discoveryService = new CrossHubDiscoveryService();

console.log("✅ Cross-hub discovery service initialized");

// Demo 1: Hub Discovery
console.log("\n🔍 Demo 1: Discovering Permamind Hubs in the Network");
console.log("Scanning the network for registered hubs...");

try {
  const hubs = await discoveryService.discoverHubs();
  console.log(`  Found ${hubs.length} active hubs in the network:`);

  hubs.slice(0, 3).forEach((hub, index) => {
    console.log(`    ${index + 1}. Hub ${hub.processId.substring(0, 8)}...`);
    console.log(`       Workflows: ${hub.workflowCount}`);
    console.log(`       Public: ${hub.hasPublicWorkflows ? "Yes" : "No"}`);
    console.log(
      `       Reputation: ${(hub.reputationScore * 100).toFixed(1)}%`,
    );
  });
} catch (error) {
  console.log("  Demo mode: Simulating hub discovery...");
  console.log(
    "    1. Hub 12ab34cd... Workflows: 5, Public: Yes, Reputation: 85.3%",
  );
  console.log(
    "    2. Hub 56ef78gh... Workflows: 12, Public: Yes, Reputation: 92.1%",
  );
  console.log(
    "    3. Hub 9ijk01lm... Workflows: 3, Public: Yes, Reputation: 78.7%",
  );
}

// Demo 2: Capability-Based Discovery
console.log("\n🎯 Demo 2: Finding Workflows by Capability");
console.log('Searching for "data-analysis" workflows across all hubs...');

try {
  const dataAnalysisWorkflows =
    await discoveryService.discoverByCapability("data-analysis");
  console.log(
    `  Found ${dataAnalysisWorkflows.length} workflows with data-analysis capability:`,
  );

  dataAnalysisWorkflows.slice(0, 3).forEach((workflow, index) => {
    console.log(
      `    ${index + 1}. ${workflow.name} (Hub: ${workflow.hubId.substring(0, 8)}...)`,
    );
    console.log(
      `       Quality Score: ${(workflow.performanceMetrics.qualityScore * 100).toFixed(1)}%`,
    );
    console.log(
      `       Success Rate: ${(workflow.performanceMetrics.successRate * 100).toFixed(1)}%`,
    );
    console.log(
      `       Reputation: ${(workflow.reputationScore * 100).toFixed(1)}%`,
    );
  });
} catch (error) {
  console.log("  Demo mode: Simulating capability discovery...");
  console.log("    1. advanced-data-processor (Hub: 12ab34cd...)");
  console.log(
    "       Quality Score: 94.2%, Success Rate: 98.5%, Reputation: 91.8%",
  );
  console.log("    2. ml-data-analyzer (Hub: 56ef78gh...)");
  console.log(
    "       Quality Score: 89.7%, Success Rate: 95.3%, Reputation: 87.4%",
  );
  console.log("    3. financial-data-engine (Hub: 9ijk01lm...)");
  console.log(
    "       Quality Score: 92.1%, Success Rate: 97.2%, Reputation: 89.6%",
  );
}

// Demo 3: Cross-Hub Enhancement Pattern Discovery
console.log("\n⚡ Demo 3: Learning Enhancement Patterns from High-Performers");
console.log("Requesting enhancement patterns from top-performing workflows...");

try {
  // In a real scenario, we'd have actual hub IDs and workflow IDs
  const sampleHubId = "sample-hub-id-12345";
  const sampleWorkflowId = "advanced-data-processor";

  const patterns = await discoveryService.requestEnhancementPatterns(
    sampleHubId,
    sampleWorkflowId,
  );
  console.log(`  Retrieved ${patterns.length} enhancement patterns:`);

  patterns.slice(0, 3).forEach((pattern, index) => {
    console.log(`    ${index + 1}. ${pattern.type}: ${pattern.description}`);
    console.log(
      `       Expected Impact: ${(pattern.impact * 100).toFixed(1)}%`,
    );
    console.log(`       Risk Level: ${pattern.riskLevel}`);
    console.log(
      `       Applicable to: ${pattern.applicableToCapabilities.join(", ")}`,
    );
  });
} catch (error) {
  console.log("  Demo mode: Simulating enhancement pattern discovery...");
  console.log(
    "    1. optimization: Implement parallel processing for large datasets",
  );
  console.log("       Expected Impact: 45.2%, Risk Level: low");
  console.log("       Applicable to: data-processing, analysis, reporting");
  console.log("    2. caching: Add intelligent result caching with TTL");
  console.log("       Expected Impact: 32.8%, Risk Level: low");
  console.log("       Applicable to: data-retrieval, computation, api-calls");
  console.log(
    "    3. error_handling: Implement exponential backoff for API failures",
  );
  console.log("       Expected Impact: 28.4%, Risk Level: medium");
  console.log("       Applicable to: api-integration, external-services");
}

// Demo 4: Requirements-Based Workflow Matching
console.log("\n🔧 Demo 4: Finding Workflows that Meet Specific Requirements");
console.log(
  'Looking for workflows that can handle "large-datasets" and "real-time-processing"...',
);

try {
  const requirements = ["large-datasets", "real-time-processing"];
  const matchingWorkflows =
    await discoveryService.findWorkflowsForRequirements(requirements);
  console.log(
    `  Found ${matchingWorkflows.length} workflows meeting these requirements:`,
  );

  matchingWorkflows.slice(0, 2).forEach((workflow, index) => {
    console.log(`    ${index + 1}. ${workflow.name}`);
    console.log(`       Hub: ${workflow.hubId.substring(0, 8)}...`);
    console.log(`       Capabilities: ${workflow.capabilities.join(", ")}`);
    console.log(
      `       Avg Execution Time: ${workflow.performanceMetrics.averageExecutionTime}ms`,
    );
    console.log(`       Usage Count: ${workflow.usageCount} times`);
  });
} catch (error) {
  console.log("  Demo mode: Simulating requirements-based matching...");
  console.log("    1. stream-data-processor");
  console.log(
    "       Hub: 56ef78gh..., Capabilities: streaming, real-time, data-transform",
  );
  console.log("       Avg Execution Time: 245ms, Usage Count: 1,247 times");
  console.log("    2. high-volume-analyzer");
  console.log(
    "       Hub: ab12cd34..., Capabilities: bulk-processing, analytics, visualization",
  );
  console.log("       Avg Execution Time: 1,890ms, Usage Count: 892 times");
}

// Demo 5: Global Workflow Search
console.log("\n🌍 Demo 5: Global Workflow Search with Filters");
console.log(
  'Searching for "financial reporting" workflows with high reputation...',
);

try {
  const searchFilters = {
    minReputationScore: 0.8,
    minPerformanceScore: 0.85,
    tags: ["finance", "reporting"],
  };

  const searchResults = await discoveryService.searchGlobalWorkflows(
    "financial reporting",
    searchFilters,
  );
  console.log(
    `  Found ${searchResults.length} high-quality financial reporting workflows:`,
  );

  searchResults.slice(0, 2).forEach((workflow, index) => {
    console.log(`    ${index + 1}. ${workflow.name}`);
    console.log(`       Owner: ${workflow.ownerAddress.substring(0, 12)}...`);
    console.log(
      `       Performance: ${(workflow.performanceMetrics.qualityScore * 100).toFixed(1)}%`,
    );
    console.log(
      `       User Satisfaction: ${(workflow.performanceMetrics.userSatisfactionRating * 100).toFixed(1)}%`,
    );
    console.log(`       Tags: ${workflow.tags.join(", ")}`);
  });
} catch (error) {
  console.log("  Demo mode: Simulating global search...");
  console.log("    1. enterprise-financial-reporter");
  console.log("       Owner: 1A2B3C4D5E6F..., Performance: 96.3%");
  console.log(
    "       User Satisfaction: 94.7%, Tags: finance, reporting, automation",
  );
  console.log("    2. regulatory-compliance-generator");
  console.log("       Owner: 7G8H9I0J1K2L..., Performance: 93.8%");
  console.log(
    "       User Satisfaction: 91.2%, Tags: finance, compliance, regulatory",
  );
}

// Demo 6: Network Statistics and Health
console.log("\n📊 Demo 6: Network Ecosystem Statistics");
console.log("Analyzing the health and activity of the workflow ecosystem...");

try {
  const stats = await discoveryService.getNetworkStatistics();
  console.log(`  Network Overview:`);
  console.log(`    Total Hubs: ${stats.totalHubs}`);
  console.log(`    Total Public Workflows: ${stats.totalPublicWorkflows}`);
  console.log(
    `    Average Reputation Score: ${(stats.averageReputationScore * 100).toFixed(1)}%`,
  );
  console.log(
    `    Network Health Score: ${(stats.networkHealthScore * 100).toFixed(1)}%`,
  );
  console.log(
    `    Top Capabilities: ${stats.topCapabilities.slice(0, 5).join(", ")}`,
  );
} catch (error) {
  console.log("  Demo mode: Simulating network statistics...");
  console.log("    Total Hubs: 47");
  console.log("    Total Public Workflows: 312");
  console.log("    Average Reputation Score: 84.7%");
  console.log("    Network Health Score: 89.3%");
  console.log(
    "    Top Capabilities: data-analysis, content-generation, automation, api-integration, reporting",
  );
}

// Demo 7: Cross-Hub Learning Simulation
console.log("\n🤖 Demo 7: Cross-Hub Learning Workflow");
console.log("Simulating how a local workflow learns from the network...");

const localWorkflowCapabilities = ["data-processing", "report-generation"];
console.log(
  `Local workflow capabilities: ${localWorkflowCapabilities.join(", ")}`,
);
console.log(
  `Current performance: 72% quality score, 1,850ms avg execution time`,
);

console.log("\n  Step 1: Discovering similar workflows...");
console.log("    Found 8 similar workflows across 5 different hubs");

console.log("\n  Step 2: Identifying higher-performing workflows...");
console.log("    Found 3 workflows with significantly better performance:");
console.log(
  "      - workflow-a: 94% quality, 890ms execution time (+22% quality, -52% time)",
);
console.log(
  "      - workflow-b: 91% quality, 1,120ms execution time (+19% quality, -39% time)",
);
console.log(
  "      - workflow-c: 89% quality, 1,340ms execution time (+17% quality, -28% time)",
);

console.log("\n  Step 3: Requesting enhancement patterns...");
console.log("    Retrieved 7 enhancement patterns from high-performers:");
console.log("      - Parallel data chunking (45% performance boost)");
console.log("      - Smart caching strategy (32% time reduction)");
console.log("      - Optimized memory usage (18% efficiency gain)");

console.log("\n  Step 4: Applying compatible enhancements...");
console.log("    Testing and validating 3 most promising patterns...");
console.log("    ✅ Parallel chunking: +38% performance improvement");
console.log("    ✅ Smart caching: +29% time reduction");
console.log("    ⚠️  Memory optimization: Requires more testing");

console.log("\n  Step 5: Sharing improvements back to network...");
console.log(
  "    Local workflow now performs at 89% quality, 1,250ms execution time",
);
console.log("    Sharing successful adaptations with 12 similar workflows");
console.log("    Contributing to ecosystem knowledge base");

console.log("\n🎉 Cross-Hub Discovery Demo Complete!");
console.log("\nKey Capabilities Demonstrated:");
console.log("  ✅ Hub discovery across the decentralized network");
console.log("  ✅ Capability-based workflow discovery");
console.log("  ✅ Enhancement pattern sharing between hubs");
console.log("  ✅ Requirements-based workflow matching");
console.log("  ✅ Global search with reputation filtering");
console.log("  ✅ Network health and ecosystem analytics");
console.log("  ✅ Cross-hub learning and improvement cycles");

console.log("\n🌟 Network Effect in Action:");
console.log("Every workflow improvement benefits the entire ecosystem!");
console.log(
  "Decentralized learning creates exponentially better AI workflows.",
);
console.log("Your workflows get smarter by learning from thousands of others.");
console.log("Knowledge is permanent, owned by creators, and shared globally.");

console.log("\n🚀 Ready for truly collaborative AI intelligence!");
