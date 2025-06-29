# Cross-Hub Discovery Using Velocity Protocol [ARCHIVED]

> **📋 ARCHITECTURE CHANGE NOTE**: This document describes the original cross-hub implementation that was later replaced with a simplified WorkflowHubService architecture focusing on a single dedicated workflow hub for better performance and reliability.

## Overview

The cross-hub workflow discovery system now properly conforms to the Velocity protocol, using the existing `fetchEvents` method and standard event filtering instead of creating new message types. Workflows are treated as events with proper tagging for discovery and filtering.

## How It Works

### 1. **Workflow Storage as Events**

Workflows are stored as AI_MEMORY events (kind "10") with comprehensive tags:

```typescript
// Event structure for workflow memories
{
  Id: "event-unique-id",
  From: "creator-address",
  Kind: "10",              // AI_MEMORY
  Content: "Workflow description",
  Timestamp: "2024-01-01T00:00:00Z",

  // Core tags
  p: "user-address",
  ai_type: "workflow",
  ai_importance: "0.8",

  // Workflow-specific tags
  workflow_id: "data-processor-v1",
  workflow_version: "1.2.0",
  workflow_stage: "execution",
  workflow_capability: ["data-analysis", "reporting"], // Multiple tags
  workflow_requirement: ["input-data", "api-access"],  // Multiple tags
  workflow_performance: "{\"qualityScore\":0.95,\"executionTime\":1200}",
  workflow_enhancement: "{\"type\":\"optimization\",\"impact\":0.3}",

  // Discovery tags
  ai_tag: ["public", "discoverable", "open-source"],
  ai_domain: "finance",
  ai_access_count: "142"
}
```

### 2. **Cross-Hub Discovery Process**

#### Step 1: Hub Discovery

```typescript
// Discover active hubs with public workflows
const workflowFilter = {
  kinds: ["10"], // AI_MEMORY events
  tags: {
    ai_type: ["workflow"],
    ai_tag: ["public", "discoverable"],
  },
  limit: 100,
};

const events = await fetchEvents(hubId, JSON.stringify([workflowFilter]));
```

#### Step 2: Capability-Based Discovery

```typescript
// Find workflows with specific capabilities
const capabilityFilter = {
  kinds: ["10"],
  tags: {
    ai_type: ["workflow"],
    workflow_capability: ["data-analysis"], // Target capability
    ai_tag: ["public"],
  },
};
```

#### Step 3: Requirements-Based Matching

```typescript
// Find workflows that meet requirements
const requirementFilter = {
  kinds: ["10"],
  tags: {
    ai_type: ["workflow"],
    workflow_requirement: ["large-datasets", "real-time"],
    ai_tag: ["public"],
  },
};
```

#### Step 4: Performance-Based Filtering

```typescript
// Advanced filtering with performance thresholds
const performanceFilter = {
  kinds: ["10"],
  tags: {
    ai_type: ["workflow"],
    ai_tag: ["public"],
  },
  search: "qualityScore", // Search performance data
};

// Then filter results by parsed performance metrics
const highPerformers = events.filter((event) => {
  const performance = JSON.parse(event.workflow_performance || "{}");
  return performance.qualityScore > 0.8;
});
```

### 3. **Enhancement Pattern Sharing**

#### Request Enhancement Patterns

```typescript
// Get enhancement memories for a specific workflow
const enhancementFilter = {
  kinds: ["10"],
  tags: {
    ai_type: ["enhancement"],
    workflow_id: ["target-workflow-id"],
    ai_tag: ["public", "shareable"],
  },
  limit: 50,
};

const patterns = await fetchEvents(
  sourceHubId,
  JSON.stringify([enhancementFilter]),
);
```

#### Enhancement Event Structure

```typescript
{
  Kind: "10",
  ai_type: "enhancement",
  workflow_id: "target-workflow",
  enhancement_type: "optimization",
  enhancement_impact: "0.35",
  enhancement_risk: "low",
  workflow_enhancement: "{\"description\":\"Parallel processing\",\"validationSteps\":[...]}",
  ai_tag: ["public", "shareable", "performance"]
}
```

### 4. **Discovery Filter Patterns**

#### Multi-Criteria Discovery

```typescript
const complexFilter = {
  kinds: ["10"],
  tags: {
    ai_type: ["workflow"],
    workflow_capability: ["data-processing", "analytics"],
    workflow_stage: ["execution", "optimization"],
    ai_domain: ["finance", "business"],
    ai_tag: ["public", "high-performance"],
  },
  search: "financial reporting",
  limit: 50,
};
```

#### Progressive Filtering

```typescript
// 1. Broad search
const broadFilter = { kinds: ["10"], tags: { ai_type: ["workflow"] } };

// 2. Apply privacy filter
const publicOnly = events.filter(
  (e) => e.ai_tag?.includes("public") || e.ai_tag?.includes("discoverable"),
);

// 3. Apply capability filter
const capabilityMatch = publicOnly.filter((e) =>
  e.workflow_capability?.includes(targetCapability),
);

// 4. Apply performance threshold
const highQuality = capabilityMatch.filter((e) => {
  const perf = JSON.parse(e.workflow_performance || "{}");
  return perf.qualityScore > minQualityThreshold;
});
```

## Network Communication Flow

### Discovery Request Flow

```
Your Hub → fetchEvents(targetHub, filter) →
Target Hub Processes Filter →
Returns Matching Events →
Parse Events to Workflows →
Apply Additional Filters →
Return Ranked Results
```

### Enhancement Sharing Flow

```
Request Enhancement Patterns →
fetchEvents(sourceHub, enhancementFilter) →
Parse Enhancement Events →
Extract Implementation Patterns →
Apply Locally with Validation →
Share Results Back (Optional)
```

## Privacy and Security

### Workflow Visibility Levels

- **Public**: `ai_tag: ["public"]` - Discoverable by anyone
- **Discoverable**: `ai_tag: ["discoverable"]` - Findable but limited access
- **Network**: `ai_tag: ["network"]` - Only other Permamind users
- **Private**: No discovery tags - Hub-local only

### Enhancement Sharing Controls

- **Shareable**: `ai_tag: ["shareable"]` - Patterns can be shared
- **Implementation**: Actual code vs conceptual patterns
- **Risk Assessment**: `enhancement_risk: ["low", "medium", "high"]`

## Performance Optimizations

### Efficient Discovery

1. **Tag-based filtering** at the Velocity level reduces network traffic
2. **Progressive filtering** starts broad and narrows down
3. **Caching** results for repeated queries
4. **Batch processing** multiple hub queries in parallel

### Smart Caching

```typescript
// Cache key includes hub + filter combination
const cacheKey = `${hubId}_${JSON.stringify(filters)}`;
if (this.workflowCache.has(cacheKey)) {
  return this.workflowCache.get(cacheKey);
}
```

## Example Cross-Hub Learning Scenario

### Scenario: Data Processing Workflow Optimization

1. **Discovery Phase**

```typescript
// Find similar data processing workflows
const similarWorkflows =
  await discoveryService.discoverByCapability("data-processing");
// Returns: 23 workflows across 8 hubs
```

2. **Performance Analysis**

```typescript
// Filter for higher performers
const betterPerformers = similarWorkflows.filter(
  (w) =>
    w.performanceMetrics.qualityScore > myWorkflow.qualityScore &&
    w.performanceMetrics.averageExecutionTime < myWorkflow.executionTime,
);
// Found: 3 significantly better workflows
```

3. **Enhancement Request**

```typescript
// Request patterns from top performer
const patterns = await discoveryService.requestEnhancementPatterns(
  topPerformer.hubId,
  topPerformer.workflowId,
);
// Retrieved: 5 enhancement patterns
```

4. **Pattern Application**

```typescript
// Apply compatible patterns locally
const compatiblePatterns = patterns.filter(
  (p) =>
    p.applicableToCapabilities.some((cap) =>
      myWorkflow.capabilities.includes(cap),
    ) && p.riskLevel === "low",
);
// Applied: 2 patterns, 35% performance improvement
```

5. **Knowledge Sharing**

```typescript
// Share successful adaptations back to network
await shareEnhancementPattern({
  type: "adaptation",
  sourcePattern: originalPattern.patternId,
  localOptimization: adaptationDetails,
  impact: measuredImprovement,
  ai_tag: ["public", "shareable"],
});
```

## Benefits of Velocity Protocol Integration

1. **Standards Compliance**: Uses existing event structure and filtering
2. **Efficient Communication**: Leverages optimized fetchEvents implementation
3. **Flexible Filtering**: Rich tag-based discovery with complex criteria
4. **Privacy Controls**: Granular visibility through tag-based permissions
5. **Network Scalability**: Efficient cross-hub queries with proper caching
6. **Protocol Consistency**: Maintains compatibility with existing Permamind infrastructure

This integration creates a truly decentralized workflow discovery network that respects the Velocity protocol while enabling powerful cross-hub learning and collaboration.
