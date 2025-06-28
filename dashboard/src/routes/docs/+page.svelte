<script>
	import { onMount } from 'svelte';

	let sections = [
		{
			id: 'overview',
			title: 'Overview',
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
			`
		},
		{
			id: 'getting-started',
			title: 'Getting Started',
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
			`
		},
		{
			id: 'memory-types',
			title: 'Memory Types',
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
			`
		},
		{
			id: 'workflow-system',
			title: 'Workflow System',
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
			`
		},
		{
			id: 'cross-hub-discovery',
			title: 'Cross-Hub Discovery',
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
			`
		},
		{
			id: 'api-reference',
			title: 'API Reference',
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
			`
		}
	];

	let activeSection = 'overview';

	function setActiveSection(sectionId) {
		activeSection = sectionId;
	}

	function renderMarkdown(content) {
		// Simple markdown rendering - in a real app you'd use a proper markdown parser
		return content
			.replace(/^# (.*$)/gm, '<h1>$1</h1>')
			.replace(/^## (.*$)/gm, '<h2>$1</h2>')
			.replace(/^### (.*$)/gm, '<h3>$1</h3>')
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.*?)\*/g, '<em>$1</em>')
			.replace(/`(.*?)`/g, '<code>$1</code>')
			.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
			.replace(/\n/g, '<br>');
	}
</script>

<svelte:head>
	<title>Documentation - Permamind Dashboard</title>
</svelte:head>

<div class="docs-layout">
	<nav class="docs-sidebar">
		<h2>Documentation</h2>
		<ul class="docs-nav">
			{#each sections as section}
				<li>
					<button 
						class="nav-button {activeSection === section.id ? 'active' : ''}"
						on:click={() => setActiveSection(section.id)}
					>
						{section.title}
					</button>
				</li>
			{/each}
		</ul>
	</nav>

	<main class="docs-content">
		<div class="content-container">
			{#each sections as section}
				{#if activeSection === section.id}
					<div class="doc-section">
						{@html renderMarkdown(section.content)}
					</div>
				{/if}
			{/each}
		</div>
	</main>
</div>

<style>
	.docs-layout {
		display: flex;
		min-height: calc(100vh - 40px);
	}

	.docs-sidebar {
		width: 280px;
		background: #111;
		border-right: 1px solid #333;
		padding: 20px;
		position: sticky;
		top: 0;
		height: fit-content;
	}

	.docs-sidebar h2 {
		margin-bottom: 20px;
		color: #fff;
	}

	.docs-nav {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-button {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		color: #ccc;
		padding: 12px 16px;
		margin: 4px 0;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 14px;
	}

	.nav-button:hover {
		background: #2a2a2a;
		color: #fff;
	}

	.nav-button.active {
		background: #2563eb;
		color: #fff;
	}

	.docs-content {
		flex: 1;
		padding: 20px 40px;
		max-width: none;
	}

	.content-container {
		max-width: 800px;
	}

	.doc-section :global(h1) {
		color: #fff;
		border-bottom: 2px solid #333;
		padding-bottom: 10px;
		margin-bottom: 20px;
	}

	.doc-section :global(h2) {
		color: #2563eb;
		margin-top: 30px;
		margin-bottom: 15px;
	}

	.doc-section :global(h3) {
		color: #ccc;
		margin-top: 25px;
		margin-bottom: 10px;
	}

	.doc-section :global(code) {
		background: #2a2a2a;
		color: #fbbf24;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: 'Monaco', 'Consolas', monospace;
		font-size: 14px;
	}

	.doc-section :global(pre) {
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 6px;
		padding: 16px;
		overflow-x: auto;
		margin: 16px 0;
	}

	.doc-section :global(pre code) {
		background: none;
		color: #e5e5e5;
		padding: 0;
	}

	.doc-section :global(strong) {
		color: #fff;
		font-weight: 600;
	}

	.doc-section :global(em) {
		color: #fbbf24;
		font-style: italic;
	}

	.doc-section :global(p) {
		margin: 12px 0;
		line-height: 1.6;
	}

	.doc-section :global(ul) {
		margin: 12px 0;
		padding-left: 20px;
	}

	.doc-section :global(li) {
		margin: 6px 0;
		line-height: 1.6;
	}
</style>