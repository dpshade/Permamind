#!/usr/bin/env node

/**
 * Demo: Workflow Hub Discovery
 *
 * This demo shows how the new workflow discovery system works:
 * 1. Prioritizes the dedicated workflow hub (HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg)
 * 2. Falls back to registry-based discovery for additional results
 * 3. Provides faster, more reliable workflow discovery
 */

import { CrossHubDiscoveryService } from "../dist/services/CrossHubDiscoveryService.js";

const WORKFLOW_HUB_ID = "HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg";

async function demonstrateWorkflowHubDiscovery() {
  console.log("🚀 Workflow Hub Discovery Demo");
  console.log("================================");
  console.log(`Primary Hub: ${WORKFLOW_HUB_ID}`);
  console.log("");

  const discoveryService = new CrossHubDiscoveryService();

  try {
    // Test 1: Hub Discovery (should prioritize workflow hub)
    console.log("1. Discovering Hubs");
    console.log("-------------------");
    const startTime = Date.now();
    const hubs = await discoveryService.discoverHubs();
    const hubDiscoveryTime = Date.now() - startTime;

    console.log(`Found ${hubs.length} hubs in ${hubDiscoveryTime}ms`);
    console.log(
      `Primary workflow hub: ${hubs.find((h) => h.processId === WORKFLOW_HUB_ID) ? "✅ Found" : "❌ Not found"}`,
    );
    console.log("");

    // Test 2: Capability-based Discovery (should use hub-first approach)
    console.log("2. Capability-based Discovery");
    console.log("-----------------------------");
    const capabilityStart = Date.now();
    const dataProcessingWorkflows =
      await discoveryService.discoverByCapability("data processing");
    const capabilityTime = Date.now() - capabilityStart;

    console.log(
      `Found ${dataProcessingWorkflows.length} data processing workflows in ${capabilityTime}ms`,
    );
    if (dataProcessingWorkflows.length > 0) {
      console.log("Top workflow:");
      const top = dataProcessingWorkflows[0];
      console.log(`  - ${top.name} (Score: ${top.reputationScore.toFixed(3)})`);
      console.log(
        `  - Hub: ${top.hubId === WORKFLOW_HUB_ID ? "Primary Workflow Hub" : "Other Hub"}`,
      );
    }
    console.log("");

    // Test 3: Requirements-based Discovery
    console.log("3. Requirements-based Discovery");
    console.log("-------------------------------");
    const reqStart = Date.now();
    const automationWorkflows =
      await discoveryService.findWorkflowsForRequirements([
        "automation",
        "scheduling",
      ]);
    const reqTime = Date.now() - reqStart;

    console.log(
      `Found ${automationWorkflows.length} automation workflows in ${reqTime}ms`,
    );
    if (automationWorkflows.length > 0) {
      console.log("Top workflow:");
      const top = automationWorkflows[0];
      console.log(`  - ${top.name} (Score: ${top.reputationScore.toFixed(3)})`);
      console.log(
        `  - Hub: ${top.hubId === WORKFLOW_HUB_ID ? "Primary Workflow Hub" : "Other Hub"}`,
      );
    }
    console.log("");

    // Test 4: Global Search (should use hub-first with fallback)
    console.log("4. Global Search");
    console.log("----------------");
    const searchStart = Date.now();
    const searchResults = await discoveryService.searchGlobalWorkflows(
      "workflow automation",
      {
        minReputationScore: 0.1,
      },
    );
    const searchTime = Date.now() - searchStart;

    console.log(
      `Found ${searchResults.length} workflows matching "workflow automation" in ${searchTime}ms`,
    );

    // Analyze hub distribution
    const hubDistribution = searchResults.reduce((acc, workflow) => {
      const hubType =
        workflow.hubId === WORKFLOW_HUB_ID ? "Primary Hub" : "Other Hubs";
      acc[hubType] = (acc[hubType] || 0) + 1;
      return acc;
    }, {});

    console.log("Hub Distribution:");
    for (const [hubType, count] of Object.entries(hubDistribution)) {
      console.log(`  - ${hubType}: ${count} workflows`);
    }
    console.log("");

    // Test 5: Network Statistics (should be fast with hub prioritization)
    console.log("5. Network Statistics");
    console.log("---------------------");
    const statsStart = Date.now();
    const stats = await discoveryService.getNetworkStatistics();
    const statsTime = Date.now() - statsStart;

    console.log(`Generated network statistics in ${statsTime}ms`);
    console.log(`Total Hubs: ${stats.totalHubs}`);
    console.log(`Total Public Workflows: ${stats.totalPublicWorkflows}`);
    console.log(
      `Average Reputation Score: ${stats.averageReputationScore.toFixed(3)}`,
    );
    console.log(`Network Health Score: ${stats.networkHealthScore.toFixed(3)}`);
    console.log(
      `Top Capabilities: ${stats.topCapabilities.slice(0, 5).join(", ")}`,
    );
    console.log("");

    // Performance Summary
    console.log("📊 Performance Summary");
    console.log("======================");
    console.log(`Hub Discovery: ${hubDiscoveryTime}ms`);
    console.log(`Capability Search: ${capabilityTime}ms`);
    console.log(`Requirements Search: ${reqTime}ms`);
    console.log(`Global Search: ${searchTime}ms`);
    console.log(`Network Statistics: ${statsTime}ms`);
    console.log(`Total Demo Time: ${Date.now() - startTime}ms`);
    console.log("");

    console.log("✅ Demo completed successfully!");
    console.log(
      "The new workflow hub-based discovery provides faster, more reliable results.",
    );
  } catch (error) {
    console.error("❌ Demo failed:", error);
    process.exit(1);
  }
}

// Run the demo
demonstrateWorkflowHubDiscovery();
