import "../chunks/CWj6FrbW.js";
import "../chunks/ccz7yLnK.js";
import {
  $ as R,
  h as P,
  f as C,
  w as $,
  aF as I,
  n as T,
  C as M,
  K as x,
  aG as H,
  aH as O,
  aw as W,
  d as z,
  av as F,
  g as v,
  X as N,
  _,
  a2 as u,
  a3 as j,
  a4 as G,
  a1 as E,
  a0 as p,
  a7 as s,
  j as n,
  y as K,
  aI as B,
  a9 as U,
  a5 as L,
} from "../chunks/B_egDBur.js";
import { h as Q, s as X, e as Y } from "../chunks/CJZ1Yolx.js";
import { i as J } from "../chunks/Tibg1Olc.js";
import { e as D, i as A } from "../chunks/Dj1GOHC4.js";
import { s as V } from "../chunks/DTq8wH66.js";
import { i as Z } from "../chunks/DE006Bpo.js";
function ee(h, y, c = !1, i = !1, S = !1) {
  var f = h,
    t = "";
  R(() => {
    var o = $;
    if (t === (t = y() ?? "")) {
      P && C();
      return;
    }
    if (
      (o.nodes_start !== null &&
        (I(o.nodes_start, o.nodes_end), (o.nodes_start = o.nodes_end = null)),
      t !== "")
    ) {
      if (P) {
        T.data;
        for (
          var r = C(), w = r;
          r !== null && (r.nodeType !== M || r.data !== "");

        )
          ((w = r), (r = x(r)));
        if (r === null) throw (H(), O);
        (W(T, w), (f = z(r)));
        return;
      }
      var a = t + "";
      c ? (a = `<svg>${a}</svg>`) : i && (a = `<math>${a}</math>`);
      var e = F(a);
      if (((c || i) && (e = v(e)), W(v(e), e.lastChild), c || i))
        for (; v(e); ) f.before(v(e));
      else f.before(e);
    }
  });
}
var re = _("<li><button> </button></li>"),
  oe = _('<div class="doc-section svelte-1mqx3g5"><!></div>'),
  te = _(
    '<div class="docs-layout svelte-1mqx3g5"><nav class="docs-sidebar svelte-1mqx3g5"><h2 class="svelte-1mqx3g5">Documentation</h2> <ul class="docs-nav svelte-1mqx3g5"></ul></nav> <main class="docs-content svelte-1mqx3g5"><div class="content-container svelte-1mqx3g5"></div></main></div>',
  );
function pe(h, y) {
  N(y, !1);
  let c = [
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
    ],
    i = K("overview");
  function S(e) {
    L(i, e);
  }
  function f(e) {
    return e
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/\n/g, "<br>");
  }
  Z();
  var t = te();
  Q((e) => {
    G.title = "Documentation - Permamind Dashboard";
  });
  var o = p(t),
    r = E(p(o), 2);
  (D(
    r,
    5,
    () => c,
    A,
    (e, l) => {
      var m = re(),
        d = p(m),
        g = p(d, !0);
      (s(d),
        s(m),
        R(() => {
          (V(
            d,
            1,
            `nav-button ${n(i) === n(l).id ? "active" : ""}`,
            "svelte-1mqx3g5",
          ),
            X(g, n(l).title));
        }),
        Y("click", d, () => S(n(l).id)),
        u(e, m));
    },
  ),
    s(r),
    s(o));
  var w = E(o, 2),
    a = p(w);
  (D(
    a,
    5,
    () => c,
    A,
    (e, l) => {
      var m = B(),
        d = U(m);
      {
        var g = (k) => {
          var b = oe(),
            q = p(b);
          (ee(q, () => f(n(l).content)), s(b), u(k, b));
        };
        J(d, (k) => {
          n(i) === n(l).id && k(g);
        });
      }
      u(e, m);
    },
  ),
    s(a),
    s(w),
    s(t),
    u(h, t),
    j());
}
export { pe as component };
