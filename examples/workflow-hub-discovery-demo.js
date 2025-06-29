#!/usr/bin/env node

/**
 * Demo: Workflow Hub Discovery
 *
 * This demo shows how the new workflow discovery system works:
 * 1. Prioritizes the dedicated workflow hub (HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg)
 * 2. Falls back to registry-based discovery for additional results
 * 3. Provides faster, more reliable workflow discovery
 */

import { WorkflowHubService } from "../dist/services/WorkflowHubService.js";

const WORKFLOW_HUB_ID = "HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg";

async function demonstrateWorkflowHubDiscovery() {
  console.log("🚀 Workflow Hub Discovery Demo");
  console.log("================================");
  console.log(`Primary Hub: ${WORKFLOW_HUB_ID}`);
  console.log("");

  const workflowHubService = new WorkflowHubService();

  try {
    // Test 1: Hub Statistics (using WorkflowHubService)
    console.log("1. Getting Hub Statistics");
    console.log("-------------------------");
    const startTime = Date.now();
    const stats = await workflowHubService.getHubStatistics();
    const statsTime = Date.now() - startTime;

    console.log(`Retrieved hub statistics in ${statsTime}ms`);
    console.log(`Total workflows: ${stats.totalPublicWorkflows}`);
    console.log(`Average reputation: ${(stats.averageReputationScore * 100).toFixed(1)}%`);
    console.log(`Network health: ${(stats.networkHealthScore * 100).toFixed(1)}%`);
    console.log("");

    // Test 2: Capability-based Discovery
    console.log("2. Capability-based Discovery");
    console.log("-----------------------------");
    const capabilityStart = Date.now();
    const dataProcessingWorkflows =
      await workflowHubService.searchByCapability("data-processing");
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
      await workflowHubService.searchByRequirements([
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

    // Test 4: Text-based Search
    console.log("4. Text-based Search");
    console.log("--------------------");
    const searchStart = Date.now();
    const searchResults = await workflowHubService.searchByQuery(
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
    const networkStatsStart = Date.now();
    const networkStats = await workflowHubService.getHubStatistics();
    const networkStatsTime = Date.now() - networkStatsStart;

    console.log(`Generated network statistics in ${networkStatsTime}ms`);
    console.log(`Total Public Workflows: ${networkStats.totalPublicWorkflows}`);
    console.log(
      `Average Reputation Score: ${networkStats.averageReputationScore.toFixed(3)}`,
    );
    console.log(`Network Health Score: ${networkStats.networkHealthScore.toFixed(3)}`);
    console.log("");

    // Performance Summary
    console.log("📊 Performance Summary");
    console.log("======================");
    console.log(`Hub Statistics: ${statsTime}ms`);
    console.log(`Capability Search: ${capabilityTime}ms`);
    console.log(`Requirements Search: ${reqTime}ms`);
    console.log(`Global Search: ${searchTime}ms`);
    console.log(`Network Statistics: ${networkStatsTime}ms`);
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
