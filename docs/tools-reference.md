# 🛠 MCP Tools Reference

Complete API documentation for all Permamind MCP tools. Each tool includes parameter details, response formats, and practical examples.

---

## Core Memory Operations

### `addMemory`

Store basic conversation memory with minimal metadata.

**Parameters:**

```typescript
{
  content: string;     // Memory content (required)
  role: string;        // Memory role: "user" | "assistant" | "system"
  conversationId?: string; // Optional conversation grouping
  p?: string;          // Public key (uses default if omitted)
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    memoryId: string;
    timestamp: string;
  };
  error?: ErrorDetails;
}
```

**Example:**

```javascript
await mcp.addMemory({
  content: "User prefers dark mode in all applications",
  role: "system",
  conversationId: "user_preferences_2024",
});
```

---

### `addMemoryEnhanced`

Store AI memory with rich metadata, importance scoring, and context.

**Parameters:**

```typescript
{
  content: string;           // Memory content (required)
  importance: number;        // 0-1 relevance score (required)
  memoryType: MemoryType;    // Classification (required)
  context: MemoryContext;    // Rich metadata (required)
  metadata?: {
    tags?: string[];
    accessCount?: number;
    lastAccessed?: string;
  };
  p?: string;               // Public key (uses default if omitted)
}
```

**Memory Types:**

- `conversation` - Dialog interactions
- `reasoning` - AI decision processes
- `knowledge` - Factual information
- `procedure` - Step-by-step processes
- `enhancement` - Code improvements
- `performance` - Metrics & benchmarks
- `workflow` - Business processes

**Context Structure:**

```typescript
{
  sessionId?: string;    // Session identifier
  topic?: string;        // Subject matter
  domain?: string;       // Knowledge domain
  [key: string]: any;    // Additional context
}
```

**Example:**

```javascript
await mcp.addMemoryEnhanced({
  content: "Implemented JWT authentication with refresh token rotation",
  importance: 0.9,
  memoryType: "knowledge",
  context: {
    sessionId: "auth_implementation_2024",
    topic: "authentication",
    domain: "web_security",
  },
  metadata: {
    tags: ["security", "jwt", "best-practices", "tokens"],
  },
});
```

---

### `searchMemories`

Basic keyword search across all memories.

**Parameters:**

```typescript
{
  query: string;           // Search query (required)
  conversationId?: string; // Limit to conversation
  limit?: number;          // Max results (default: 10)
  p?: string;             // Public key filter
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    memories: Memory[];
    total: number;
    query: string;
  };
  error?: ErrorDetails;
}
```

**Example:**

```javascript
const results = await mcp.searchMemories({
  query: "authentication security",
  limit: 5,
});
```

---

### `searchMemoriesAdvanced`

Advanced search with filters, ranking, and complex queries.

**Parameters:**

```typescript
{
  query: string;              // Search query (required)
  filters?: {
    memoryType?: MemoryType[];        // Filter by types
    importanceRange?: {               // Importance scoring filter
      min: number;
      max: number;
    };
    dateRange?: {                     // Time-based filter
      start: string;
      end: string;
    };
    tags?: string[];                  // Tag-based filter
    context?: {                       // Context-based filter
      sessionId?: string;
      topic?: string;
      domain?: string;
    };
  };
  ranking?: "relevance" | "importance" | "date"; // Sort order
  limit?: number;                     // Max results (default: 10)
  p?: string;                        // Public key filter
}
```

**Example:**

```javascript
const results = await mcp.searchMemoriesAdvanced({
  query: "TypeScript security patterns",
  filters: {
    memoryType: ["knowledge", "procedure"],
    importanceRange: { min: 0.7, max: 1.0 },
    tags: ["typescript", "security"],
    context: { domain: "web_development" },
  },
  ranking: "importance",
  limit: 15,
});
```

---

### `getAllMemories`

Retrieve all memories with optional conversation filtering.

**Parameters:**

```typescript
{
  conversationId?: string; // Filter by conversation
  p?: string;             // Public key filter
  limit?: number;         // Max results
  offset?: number;        // Pagination offset
}
```

**Example:**

```javascript
const allMemories = await mcp.getAllMemories({
  conversationId: "project_planning_2024",
  limit: 50,
});
```

---

### `getMemoryAnalytics`

Get usage patterns, insights, and memory statistics.

**Parameters:**

```typescript
{
  p?: string;              // Public key filter
  timeRange?: {            // Analysis period
    start: string;
    end: string;
  };
  includeDetails?: boolean; // Include detailed breakdowns
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    totalMemories: number;
    memoriesByType: Record<MemoryType, number>;
    averageImportance: number;
    topTags: { tag: string; count: number }[];
    memoryGrowth: { date: string; count: number }[];
    accessPatterns: { memoryId: string; accessCount: number }[];
  };
  error?: ErrorDetails;
}
```

**Example:**

```javascript
const analytics = await mcp.getMemoryAnalytics({
  timeRange: {
    start: "2024-01-01",
    end: "2024-12-31",
  },
  includeDetails: true,
});
```

---

### `addMemoriesBatch`

Efficiently store multiple memories in a single operation.

**Parameters:**

```typescript
{
  memories: Array<{
    content: string;
    role?: string;
    importance?: number;
    memoryType?: MemoryType;
    context?: MemoryContext;
    metadata?: object;
  }>;
  p?: string; // Public key (applies to all memories)
}
```

**Example:**

```javascript
await mcp.addMemoriesBatch({
  memories: [
    {
      content: "Learned React hooks patterns",
      importance: 0.8,
      memoryType: "knowledge",
    },
    {
      content: "Implemented state management with Zustand",
      importance: 0.7,
      memoryType: "procedure",
    },
  ],
});
```

---

## Knowledge Graph Operations

### `linkMemories`

Create typed relationships between memories.

**Parameters:**

```typescript
{
  sourceMemoryId: string;           // Source memory ID (required)
  targetMemoryId: string;           // Target memory ID (required)
  relationshipType: RelationshipType; // Relationship type (required)
  strength: number;                 // 0-1 connection strength (required)
  description?: string;             // Optional relationship description
  p?: string;                      // Public key
}
```

**Relationship Types:**

- `causes` - Causal relationships (A leads to B)
- `supports` - Evidence or reinforcement
- `contradicts` - Conflicting information
- `extends` - Elaboration or expansion
- `references` - Citations or mentions

**Example:**

```javascript
await mcp.linkMemories({
  sourceMemoryId: "jwt_implementation_memory",
  targetMemoryId: "security_best_practices_memory",
  relationshipType: "supports",
  strength: 0.85,
  description: "JWT implementation follows security best practices",
});
```

---

### `addReasoningChain`

Store AI decision-making processes and logic chains.

**Parameters:**

```typescript
{
  chainId: string;              // Unique chain identifier (required)
  steps: ReasoningStep[];       // Reasoning steps (required)
  outcome: string;              // Final decision/result (required)
  confidence?: number;          // 0-1 confidence score
  context?: MemoryContext;      // Associated context
  p?: string;                  // Public key
}
```

**Reasoning Step Structure:**

```typescript
{
  stepNumber: number;
  description: string;
  reasoning: string;
  evidence?: string[];
  assumptions?: string[];
}
```

**Example:**

```javascript
await mcp.addReasoningChain({
  chainId: "architecture_decision_2024_001",
  steps: [
    {
      stepNumber: 1,
      description: "Evaluate database options",
      reasoning: "Need to handle high write throughput",
      evidence: ["100k+ daily writes", "Real-time requirements"],
    },
    {
      stepNumber: 2,
      description: "Consider PostgreSQL vs MongoDB",
      reasoning: "ACID compliance vs flexible schema",
      assumptions: ["Structured data will remain stable"],
    },
  ],
  outcome: "Selected PostgreSQL with read replicas",
  confidence: 0.8,
  context: {
    sessionId: "architecture_review_2024",
    topic: "database_selection",
  },
});
```

---

### `getMemoryRelationships`

Find related memories and explore knowledge graph connections.

**Parameters:**

```typescript
{
  memoryId?: string;              // Specific memory to explore
  relationshipType?: RelationshipType; // Filter by relationship type
  minStrength?: number;           // Minimum connection strength
  maxDepth?: number;             // Maximum traversal depth
  includeReverse?: boolean;      // Include incoming relationships
  p?: string;                   // Public key filter
}
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    relationships: Array<{
      sourceId: string;
      targetId: string;
      type: RelationshipType;
      strength: number;
      description?: string;
    }>;
    memoryDetails?: Record<string, Memory>;
    pathAnalysis?: {
      shortestPaths: Array<{
        from: string;
        to: string;
        path: string[];
        totalStrength: number;
      }>;
    };
  };
  error?: ErrorDetails;
}
```

**Example:**

```javascript
// Explore all relationships for a memory
const relationships = await mcp.getMemoryRelationships({
  memoryId: "jwt_implementation_memory",
  maxDepth: 2,
  includeReverse: true,
});

// Find all supporting evidence
const evidence = await mcp.getMemoryRelationships({
  relationshipType: "supports",
  minStrength: 0.7,
});
```

---

## AO Process Integration

### `executeProcessAction`

Communicate with any AO process using natural language.

**Parameters:**

```typescript
{
  processId: string;           // AO process ID (required)
  request: string;             // Natural language request (required)
  processMarkdown?: string;    // Process documentation (optional)
  context?: object;           // Additional context
}
```

**Process Markdown Format:**

```markdown
# Process Name

## actionName

Description of what this action does

- parameter1: Description (required/optional)
- parameter2: Description (required/optional)

## anotherAction

Another action description

- param: Description (required)
```

**Example:**

```javascript
await mcp.executeProcessAction({
  processId: "dao-governance-process-id",
  processMarkdown: `
# DAO Governance Process

## vote
Cast a vote on a proposal
- proposalId: The proposal ID (required)
- vote: yes/no/abstain (required)
- reason: Voting rationale (optional)

## createProposal
Create a new governance proposal
- title: Proposal title (required)
- description: Detailed description (required)
- votingPeriod: Days for voting (optional, default 7)
`,
  request: "Vote yes on proposal #42 with reason 'This improves token utility'",
});
```

---

### `executeTokenRequest`

Simplified token operations with natural language interface.

**Parameters:**

```typescript
{
  processId: string; // Token process ID (required)
  request: string; // Natural language request (required)
}
```

**Supported Operations:**

- Transfer tokens
- Check balances
- View transaction history
- Query token information
- Mint tokens (if authorized)

**Examples:**

```javascript
// Transfer tokens
await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "Send 100 tokens to alice with memo 'payment for consulting'",
});

// Check balance
await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "What's my current balance?",
});

// View recent transactions
await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "Show me the last 10 transactions",
});
```

---

### `createSimpleToken`

Deploy a basic token contract with standard functionality.

**Parameters:**

```typescript
{
  name: string;           // Token name (required)
  ticker: string;         // Token ticker/symbol (required)
  initialSupply: number;  // Initial token supply (required)
  decimals?: number;      // Token decimals (default: 18)
  description?: string;   // Token description
  metadata?: object;      // Additional metadata
}
```

**Example:**

```javascript
const tokenResult = await mcp.createSimpleToken({
  name: "MyProject Token",
  ticker: "MPT",
  initialSupply: 1000000,
  decimals: 18,
  description: "Utility token for MyProject ecosystem",
});
```

---

### `createAdvancedToken`

Deploy tokens with advanced minting strategies and features.

**Parameters:**

```typescript
{
  name: string;              // Token name (required)
  ticker: string;            // Token ticker (required)
  mintingStrategy: MintingStrategy; // Strategy type (required)
  initialSupply: number;     // Initial supply (required)
  decimals?: number;         // Token decimals (default: 18)

  // Strategy-specific configurations
  basicConfig?: BasicMintConfig;
  cascadeConfig?: CascadeMintConfig;
  doubleMintConfig?: DoubleMintConfig;
}
```

**Minting Strategies:**

- `Basic` - Standard minting without special mechanics
- `Cascade` - Reward holders when transfer thresholds are met
- `DoubleMint` - Double rewards for specific actions

**Cascade Configuration:**

```typescript
{
  rewardPercentage: number;    // % of transfer as reward (1-100)
  thresholdAmount: number;     // Minimum transfer to trigger
  maxRewards: number;          // Maximum reward recipients
  excludeAddresses?: string[]; // Addresses to exclude from rewards
}
```

**DoubleMint Configuration:**

```typescript
{
  doubleMintThreshold: number; // Threshold for double rewards
  doubleMintDuration: number; // Duration in blocks/time
  maxDoubleMints: number; // Maximum double mints per period
}
```

**Example:**

```javascript
await mcp.createAdvancedToken({
  name: "RewardToken",
  ticker: "RWRD",
  mintingStrategy: "Cascade",
  initialSupply: 500000,
  cascadeConfig: {
    rewardPercentage: 5,
    thresholdAmount: 1000,
    maxRewards: 10,
    excludeAddresses: ["contract-address-1"],
  },
});
```

---

## Utility Operations

### `getServerInfo`

Get server status, identity, and configuration information.

**Parameters:**

```typescript
{
} // No parameters required
```

**Response:**

```typescript
{
  success: boolean;
  data?: {
    serverName: string;
    version: string;
    aoAddress: string;           // Arweave address
    hubProcessId: string;        // Memory hub process ID
    networkStatus: string;       // AO network connectivity
    memoryStats: {
      totalMemories: number;
      hubDeployed: boolean;
    };
    configuration: {
      networkEndpoints: {
        cu: string;
        mu: string;
        gateway: string;
      };
      features: string[];        // Enabled features
    };
  };
  error?: ErrorDetails;
}
```

**Example:**

```javascript
const serverInfo = await mcp.getServerInfo();
console.log(
  `Server: ${serverInfo.data.serverName} v${serverInfo.data.version}`,
);
console.log(`AO Address: ${serverInfo.data.aoAddress}`);
console.log(`Hub Process: ${serverInfo.data.hubProcessId}`);
```

---

## Error Handling

All tools return responses in the following format:

```typescript
type ToolResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
```

**Common Error Codes:**

- `INVALID_PARAMETERS` - Missing or invalid parameters
- `NETWORK_ERROR` - AO network connectivity issues
- `MEMORY_NOT_FOUND` - Memory ID not found
- `PROCESS_ERROR` - AO process execution failed
- `AUTHENTICATION_ERROR` - Invalid credentials or permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `STORAGE_ERROR` - Arweave storage issues

**Error Handling Example:**

```javascript
const result = await mcp.addMemoryEnhanced({
  content: "Test memory",
  importance: 0.5,
  memoryType: "knowledge",
  context: { topic: "testing" },
});

if (!result.success) {
  console.error(`Error ${result.error.code}: ${result.error.message}`);
  if (result.error.details) {
    console.error("Details:", result.error.details);
  }
} else {
  console.log("Memory stored:", result.data);
}
```

---

## Rate Limits & Best Practices

### Rate Limits

- **Memory Operations**: 100 requests/minute
- **Search Operations**: 50 requests/minute
- **AO Process Calls**: 30 requests/minute
- **Batch Operations**: 10 requests/minute

### Best Practices

1. **Use Batch Operations**: For multiple memories, use `addMemoriesBatch`
2. **Cache Search Results**: Avoid repeated identical searches
3. **Optimize Queries**: Use specific filters in advanced search
4. **Handle Errors Gracefully**: Always check `success` field
5. **Memory Cleanup**: Regularly review and remove low-importance memories
6. **Process Documentation**: Provide `processMarkdown` for better AO integration

---

## Next Steps

- **[💡 Usage Examples](examples.md)** - Practical patterns and code samples
- **[🏗 Architecture Guide](architecture.md)** - Deep dive into configuration
- **[🌐 AO Integration](ao-integration.md)** - Custom process integration
- **[🚨 Troubleshooting](troubleshooting.md)** - Common issues and solutions

---

**🛠 Ready to build with Permamind? Start with the examples!**

[Next: Usage Examples →](examples.md)
