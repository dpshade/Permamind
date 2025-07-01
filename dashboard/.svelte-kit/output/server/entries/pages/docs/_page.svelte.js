import {
  f as ensure_array_like,
  h as head,
  k as attr_class,
  e as escape_html,
  j as stringify,
  c as pop,
  p as push,
} from "../../../chunks/index.js";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function _page($$payload, $$props) {
  push();
  let sections = [
    {
      id: "overview",
      title: "Overview",
      content: `
# Permamind Overview

Permamind is a decentralized AI memory system built on Arweave that provides persistent, immortal memory for AI agents and applications.

## Key Features

- **Permanent Storage**: All memories are stored permanently on Arweave blockchain
- **Decentralized Network**: No single point of failure or control
- **Cross-Hub Discovery**: Discover and learn from workflows across the network
- **Self-Enhancement**: Workflows continuously improve through performance tracking
- **Rich Memory Types**: Support for conversations, reasoning chains, knowledge, and procedures

## Architecture

Permamind consists of:
- **Hubs**: Individual nodes that store and process memories
- **Registry**: Decentralized registry for hub discovery
- **Workflow Ecosystem**: Self-enhancing workflow network
- **Cross-Hub Discovery**: Network-wide workflow sharing and learning
			`,
    },
    {
      id: "getting-started",
      title: "Getting Started",
      content: `
# Getting Started with Permamind

## Installation

\`\`\`bash
npm install -g permamind
\`\`\`

## Setup

1. Initialize your hub:
\`\`\`bash
permamind-setup
\`\`\`

2. Start the MCP server:
\`\`\`bash
permamind start
\`\`\`

## Configuration

Set your environment variables:
\`\`\`bash
export SEED_PHRASE="your mnemonic phrase"
\`\`\`

## First Memory

Add your first memory:
\`\`\`javascript
await addMemoryEnhanced({
  content: "Hello, Permamind!",
  memoryType: "conversation",
  importance: 0.8,
  p: "participant-public-key",
  role: "user"
});
\`\`\`
			`,
    },
    {
      id: "memory-types",
      title: "Memory Types",
      content: `
# Memory Types

Permamind supports several memory types for different use cases:

## Conversation
- Chat messages and dialogues
- User interactions
- Support conversations

## Reasoning
- Chain-of-thought processes
- Decision pathways
- Problem-solving steps

## Knowledge
- Facts and information
- Reference data
- Learned concepts

## Procedure
- Step-by-step processes
- Workflows and automation
- Task sequences

## Workflow
- Workflow execution data
- Performance metrics
- Enhancement tracking

## Performance
- Execution metrics
- Success rates
- Resource usage

## Enhancement
- Optimization records
- Bug fixes
- Feature additions
			`,
    },
    {
      id: "workflow-system",
      title: "Workflow System",
      content: `
# Workflow Ecosystem

The Permamind workflow system enables self-enhancing AI workflows that learn and improve over time.

## Key Concepts

### Workflow Stages
- **Planning**: Initial workflow design
- **Execution**: Active workflow running
- **Evaluation**: Performance assessment
- **Optimization**: Enhancement and improvement
- **Archived**: Completed or deprecated workflows

### Enhancement Cycles
Workflows automatically improve through:
- Performance monitoring
- Pattern recognition
- Cross-workflow learning
- Automated optimization

### Workflow Relationships
- **Inheritance**: Workflows can inherit from others
- **Composition**: Combine multiple workflows
- **Dependencies**: Track workflow dependencies
- **Enhancement**: Share optimization patterns

## Performance Tracking

Track key metrics:
- Execution time
- Success rate
- Quality score
- Resource usage
- User satisfaction
			`,
    },
    {
      id: "cross-hub-discovery",
      title: "Cross-Hub Discovery",
      content: `
# Cross-Hub Discovery

Discover and learn from workflows across the entire Permamind network.

## Discovery Types

### By Capability
Find workflows that provide specific capabilities:
\`\`\`javascript
const workflows = await discoverCrossHubWorkflows({
  discoveryType: "capability",
  capability: "text-processing"
});
\`\`\`

### By Requirements
Find workflows that fulfill specific requirements:
\`\`\`javascript
const workflows = await discoverCrossHubWorkflows({
  discoveryType: "requirements",
  requirements: "image-analysis,real-time"
});
\`\`\`

### Similar Workflows
Find workflows similar to your own:
\`\`\`javascript
const workflows = await discoverCrossHubWorkflows({
  discoveryType: "similar",
  localWorkflowId: "my-workflow-id"
});
\`\`\`

### Global Search
Search across all workflows:
\`\`\`javascript
const workflows = await discoverCrossHubWorkflows({
  discoveryType: "search",
  query: "machine learning optimization",
  minPerformanceScore: 0.8
});
\`\`\`

## Network Statistics

Get insights into the ecosystem:
\`\`\`javascript
const stats = await getNetworkStatistics();
// Returns: total hubs, workflows, top capabilities, network health
\`\`\`
			`,
    },
    {
      id: "api-reference",
      title: "API Reference",
      content: `
# API Reference

## Memory Operations

### addMemoryEnhanced
Add a memory with rich metadata and AI-specific features.

**Parameters:**
- \`content\`: Memory content (string)
- \`memoryType\`: Type of memory (conversation|reasoning|knowledge|procedure)
- \`importance\`: Importance score 0-1 (number)
- \`p\`: Participant public key (string)
- \`role\`: Author role (string)
- \`domain\`: Optional domain/category (string)
- \`tags\`: Optional comma-separated tags (string)

### searchMemoriesAdvanced
Search memories with advanced filtering.

**Parameters:**
- \`query\`: Search query (string)
- \`memoryType\`: Filter by memory type (optional)
- \`importanceThreshold\`: Minimum importance (optional)
- \`startDate\`: Time range start (optional)
- \`endDate\`: Time range end (optional)

## Workflow Operations

### addWorkflowMemory
Store workflow execution data with performance tracking.

### trackWorkflowPerformance
Record performance metrics for workflows.

### createWorkflowRelationship
Create relationships between workflows.

### addWorkflowEnhancement
Record workflow improvements and optimizations.

## Discovery Operations

### discoverCrossHubWorkflows
Discover workflows across the network.

### getNetworkStatistics
Get ecosystem-wide statistics.

### requestEnhancementPatterns
Request optimization patterns from other workflows.
			`,
    },
  ];
  let activeSection = "overview";
  function renderMarkdown(content) {
    return content
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/\n/g, "<br>");
  }
  const each_array = ensure_array_like(sections);
  const each_array_1 = ensure_array_like(sections);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Documentation - Permamind Dashboard</title>`;
  });
  $$payload.out += `<div class="docs-layout svelte-1mqx3g5"><nav class="docs-sidebar svelte-1mqx3g5"><h2 class="svelte-1mqx3g5">Documentation</h2> <ul class="docs-nav svelte-1mqx3g5"><!--[-->`;
  for (
    let $$index = 0, $$length = each_array.length;
    $$index < $$length;
    $$index++
  ) {
    let section = each_array[$$index];
    $$payload.out += `<li><button${attr_class(`nav-button ${stringify(activeSection === section.id ? "active" : "")}`, "svelte-1mqx3g5")}>${escape_html(section.title)}</button></li>`;
  }
  $$payload.out += `<!--]--></ul></nav> <main class="docs-content svelte-1mqx3g5"><div class="content-container svelte-1mqx3g5"><!--[-->`;
  for (
    let $$index_1 = 0, $$length = each_array_1.length;
    $$index_1 < $$length;
    $$index_1++
  ) {
    let section = each_array_1[$$index_1];
    if (activeSection === section.id) {
      $$payload.out += "<!--[-->";
      $$payload.out += `<div class="doc-section svelte-1mqx3g5">${html(renderMarkdown(section.content))}</div>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></div></main></div>`;
  pop();
}
export { _page as default };
