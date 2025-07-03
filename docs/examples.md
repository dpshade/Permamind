# 💡 Usage Examples

Practical code examples and patterns for using Permamind effectively. From basic memory operations to advanced knowledge graphs and AO process integration.

---

## Basic Memory Operations

### Storing Simple Memories

```javascript
// Basic conversation memory
await mcp.addMemory({
  content: "User prefers TypeScript over JavaScript for new projects",
  role: "user",
  conversationId: "user_preferences_2024",
});

// System-level memory
await mcp.addMemory({
  content: "Project uses Vite for build tooling with TypeScript config",
  role: "system",
  conversationId: "project_setup_2024",
});

// Assistant learning
await mcp.addMemory({
  content: "Successfully explained JWT implementation with code examples",
  role: "assistant",
  conversationId: "learning_session_auth",
});
```

### Enhanced Memory with AI Features

```javascript
// Knowledge with high importance
await mcp.addMemoryEnhanced({
  content:
    "OAuth 2.0 PKCE flow prevents authorization code interception attacks",
  importance: 0.95,
  memoryType: "knowledge",
  context: {
    sessionId: "security_training_2024",
    topic: "oauth_security",
    domain: "web_security",
  },
  metadata: {
    tags: ["oauth", "pkce", "security", "authentication"],
    source: "RFC 7636",
  },
});

// Procedural memory for workflows
await mcp.addMemoryEnhanced({
  content: `Docker deployment process:
1. Build image with multi-stage Dockerfile
2. Push to container registry
3. Update Kubernetes manifests
4. Apply with kubectl
5. Verify deployment health`,
  importance: 0.8,
  memoryType: "procedure",
  context: {
    sessionId: "devops_procedures_2024",
    topic: "deployment",
    domain: "infrastructure",
  },
  metadata: {
    tags: ["docker", "kubernetes", "deployment", "ci-cd"],
  },
});

// Code enhancement memory
await mcp.addMemoryEnhanced({
  content:
    "Replaced useState with useReducer for complex state - improved predictability and testing",
  importance: 0.7,
  memoryType: "enhancement",
  context: {
    sessionId: "react_refactoring_2024",
    topic: "state_management",
    domain: "frontend",
  },
  metadata: {
    tags: ["react", "hooks", "refactoring", "state-management"],
  },
});
```

---

## Advanced Search Patterns

### Basic Search Operations

```javascript
// Simple keyword search
const authResults = await mcp.searchMemories({
  query: "authentication JWT",
  limit: 10,
});

console.log(`Found ${authResults.data.total} memories about authentication`);

// Conversation-specific search
const projectMemories = await mcp.searchMemories({
  query: "TypeScript configuration",
  conversationId: "project_setup_2024",
  limit: 5,
});
```

### Advanced Filtering and Ranking

```javascript
// Find high-importance security knowledge
const securityKnowledge = await mcp.searchMemoriesAdvanced({
  query: "security vulnerability authentication",
  filters: {
    memoryType: ["knowledge", "procedure"],
    importanceRange: { min: 0.8, max: 1.0 },
    tags: ["security"],
  },
  ranking: "importance",
  limit: 20,
});

// Recent learning in specific domain
const recentLearning = await mcp.searchMemoriesAdvanced({
  query: "React hooks patterns",
  filters: {
    memoryType: ["knowledge", "enhancement"],
    dateRange: {
      start: "2024-01-01",
      end: "2024-12-31",
    },
    context: { domain: "frontend" },
  },
  ranking: "date",
  limit: 15,
});

// Find contradicting information
const contradictions = await mcp.searchMemoriesAdvanced({
  query: "database performance",
  filters: {
    memoryType: ["knowledge", "performance"],
    context: { topic: "database_optimization" },
  },
  ranking: "relevance",
});
```

### Complex Multi-Filter Searches

```javascript
// Advanced DevOps procedures
const devopsPatterns = await mcp.searchMemoriesAdvanced({
  query: "deployment automation CI/CD",
  filters: {
    memoryType: ["procedure", "knowledge"],
    importanceRange: { min: 0.6, max: 1.0 },
    tags: ["ci-cd", "automation"],
    context: {
      domain: "infrastructure",
      topic: "deployment",
    },
  },
  ranking: "importance",
  limit: 25,
});

// Find learning progressions
const learningPath = await mcp.searchMemoriesAdvanced({
  query: "TypeScript advanced patterns",
  filters: {
    memoryType: ["knowledge", "enhancement", "procedure"],
    context: { sessionId: "typescript_mastery_2024" },
  },
  ranking: "date",
});
```

---

## Knowledge Graph Building

### Creating Memory Relationships

```javascript
// Link authentication concepts
await mcp.linkMemories({
  sourceMemoryId: "jwt_implementation_memory_id",
  targetMemoryId: "oauth_security_memory_id",
  relationshipType: "extends",
  strength: 0.8,
  description: "JWT tokens are often used in OAuth 2.0 flows",
});

// Connect problem and solution
await mcp.linkMemories({
  sourceMemoryId: "performance_problem_memory_id",
  targetMemoryId: "optimization_solution_memory_id",
  relationshipType: "causes",
  strength: 0.9,
  description: "Database query optimization solved the performance issue",
});

// Link supporting evidence
await mcp.linkMemories({
  sourceMemoryId: "security_claim_memory_id",
  targetMemoryId: "vulnerability_report_memory_id",
  relationshipType: "supports",
  strength: 0.85,
  description: "CVE report confirms the security vulnerability",
});
```

### Building Reasoning Chains

```javascript
// Architecture decision reasoning
await mcp.addReasoningChain({
  chainId: "microservices_vs_monolith_2024",
  steps: [
    {
      stepNumber: 1,
      description: "Assess current system complexity",
      reasoning: "Monolithic app has grown to 500k+ lines of code",
      evidence: ["Code metrics report", "Team velocity declining"],
      assumptions: ["Current growth rate continues"],
    },
    {
      stepNumber: 2,
      description: "Evaluate team capabilities",
      reasoning: "Team has experience with containerization and service mesh",
      evidence: ["Kubernetes adoption success", "Istio implementation"],
      assumptions: ["Team can manage distributed systems complexity"],
    },
    {
      stepNumber: 3,
      description: "Consider operational overhead",
      reasoning:
        "Microservices increase operational complexity but improve scalability",
      evidence: ["Industry benchmarks", "Previous migration experience"],
      assumptions: ["DevOps capabilities will scale with team"],
    },
  ],
  outcome: "Gradual migration to microservices with domain-driven boundaries",
  confidence: 0.75,
  context: {
    sessionId: "architecture_review_q1_2024",
    topic: "system_architecture",
    domain: "software_architecture",
  },
});

// Technical implementation reasoning
await mcp.addReasoningChain({
  chainId: "state_management_choice_2024",
  steps: [
    {
      stepNumber: 1,
      description: "Analyze application state complexity",
      reasoning: "App has complex nested state with frequent updates",
      evidence: ["State tree depth analysis", "Update frequency metrics"],
    },
    {
      stepNumber: 2,
      description: "Compare solutions",
      reasoning:
        "Redux vs Zustand vs React Context performance characteristics",
      evidence: ["Bundle size comparison", "Runtime performance tests"],
    },
  ],
  outcome:
    "Selected Zustand for lightweight state management with TypeScript support",
  confidence: 0.8,
  context: {
    sessionId: "frontend_architecture_2024",
    topic: "state_management",
  },
});
```

### Exploring Knowledge Connections

```javascript
// Explore all relationships for a specific memory
const relationships = await mcp.getMemoryRelationships({
  memoryId: "react_hooks_best_practices_memory_id",
  maxDepth: 2,
  includeReverse: true,
});

console.log("Related memories:", relationships.data.relationships);
console.log("Shortest paths:", relationships.data.pathAnalysis?.shortestPaths);

// Find all supporting evidence for claims
const evidence = await mcp.getMemoryRelationships({
  relationshipType: "supports",
  minStrength: 0.7,
});

// Discover contradictory information
const contradictions = await mcp.getMemoryRelationships({
  relationshipType: "contradicts",
  minStrength: 0.5,
});
```

---

## Batch Operations

### Efficient Bulk Memory Storage

```javascript
// Import learning session notes
const learningMemories = [
  {
    content: "React 18 concurrent features improve user experience",
    importance: 0.8,
    memoryType: "knowledge",
    context: { topic: "react_18", domain: "frontend" },
    metadata: { tags: ["react", "concurrent", "performance"] },
  },
  {
    content: "useTransition hook prevents blocking UI updates",
    importance: 0.7,
    memoryType: "procedure",
    context: { topic: "react_hooks", domain: "frontend" },
    metadata: { tags: ["react", "hooks", "performance"] },
  },
  {
    content: "Suspense boundaries handle async loading states",
    importance: 0.75,
    memoryType: "knowledge",
    context: { topic: "react_suspense", domain: "frontend" },
    metadata: { tags: ["react", "suspense", "async"] },
  },
];

await mcp.addMemoriesBatch({
  memories: learningMemories,
});

// Import code review feedback
const reviewFeedback = [
  {
    content: "Add error boundaries for better error handling",
    importance: 0.6,
    memoryType: "enhancement",
    context: { sessionId: "code_review_001" },
  },
  {
    content: "Extract custom hooks for reusable logic",
    importance: 0.7,
    memoryType: "enhancement",
    context: { sessionId: "code_review_001" },
  },
  {
    content: "Consider memoization for expensive calculations",
    importance: 0.8,
    memoryType: "enhancement",
    context: { sessionId: "code_review_001" },
  },
];

await mcp.addMemoriesBatch({
  memories: reviewFeedback,
});
```

---

## AO Process Integration

### Natural Language Token Operations

```javascript
// Simple token transfers
await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "Send 100 tokens to alice with memo 'Q1 bonus payment'",
});

await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "Transfer 50 tokens to bob for consulting work",
});

// Balance and transaction queries
const balance = await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "What's my current balance?",
});

const history = await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "Show me transactions from the last 30 days",
});

const holders = await mcp.executeTokenRequest({
  processId: "your-token-process-id",
  request: "List the top 10 token holders",
});
```

### Complex AO Process Communication

```javascript
// DAO governance interaction
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
- category: Proposal category (required)
- votingPeriod: Days for voting (optional, default 7)

## getProposal
Get proposal details
- proposalId: The proposal ID (required)
`,
  request:
    "Create a proposal titled 'Increase Block Rewards' with description 'Proposal to increase mining rewards by 10% to incentivize network security' in category 'tokenomics' with 14 day voting period",
});

// NFT marketplace interaction
await mcp.executeProcessAction({
  processId: "nft-marketplace-process-id",
  processMarkdown: `
# NFT Marketplace

## listItem
List an NFT for sale
- tokenId: NFT token ID (required)
- price: Price in tokens (required)
- currency: Payment token (optional, default: AR)
- duration: Listing duration in days (optional, default: 30)

## buyItem
Purchase a listed NFT
- listingId: Marketplace listing ID (required)
- maxPrice: Maximum price willing to pay (optional)

## cancelListing
Cancel an active listing
- listingId: Listing ID to cancel (required)
`,
  request: "List NFT #1337 for sale at 50 AR tokens for 21 days",
});

// Custom smart contract interaction
await mcp.executeProcessAction({
  processId: "defi-lending-process-id",
  processMarkdown: `
# DeFi Lending Protocol

## deposit
Deposit tokens to earn interest
- amount: Amount to deposit (required)
- token: Token type (required)

## withdraw
Withdraw deposited tokens plus interest
- amount: Amount to withdraw (required)
- token: Token type (required)

## borrow
Borrow against collateral
- amount: Amount to borrow (required)
- collateralToken: Collateral token type (required)
- borrowToken: Token to borrow (required)

## repay
Repay borrowed amount
- amount: Amount to repay (required)
- token: Token type (required)
`,
  request: "Deposit 1000 USDC tokens to start earning interest",
});
```

### Token Creation Examples

```javascript
// Simple utility token
const simpleToken = await mcp.createSimpleToken({
  name: "Community Points",
  ticker: "COMM",
  initialSupply: 10000000,
  decimals: 18,
  description: "Utility token for community governance and rewards",
});

console.log("Token created:", simpleToken.data.processId);

// Advanced token with cascade rewards
const cascadeToken = await mcp.createAdvancedToken({
  name: "Reward Token",
  ticker: "RWRD",
  mintingStrategy: "Cascade",
  initialSupply: 5000000,
  decimals: 18,
  cascadeConfig: {
    rewardPercentage: 3, // 3% of transfer amount
    thresholdAmount: 100, // Minimum 100 tokens to trigger
    maxRewards: 5, // Max 5 random holders get rewards
    excludeAddresses: [
      // Exclude these addresses from rewards
      "contract-address-1",
      "burn-address",
    ],
  },
});

// DoubleMint strategy token
const doubleMintToken = await mcp.createAdvancedToken({
  name: "Growth Token",
  ticker: "GROW",
  mintingStrategy: "DoubleMint",
  initialSupply: 1000000,
  doubleMintConfig: {
    doubleMintThreshold: 500, // Double rewards when holding 500+ tokens
    doubleMintDuration: 1000, // Duration in blocks
    maxDoubleMints: 100, // Max double mints per period
  },
});
```

---

## Memory Analytics and Insights

### Usage Pattern Analysis

```javascript
// Get comprehensive analytics
const analytics = await mcp.getMemoryAnalytics({
  timeRange: {
    start: "2024-01-01",
    end: "2024-12-31",
  },
  includeDetails: true,
});

console.log("Memory Statistics:");
console.log(`Total memories: ${analytics.data.totalMemories}`);
console.log(`Average importance: ${analytics.data.averageImportance}`);
console.log("Memories by type:", analytics.data.memoriesByType);
console.log("Top tags:", analytics.data.topTags);

// Track learning progress
const learningProgress = analytics.data.memoryGrowth.map((point) => ({
  date: point.date,
  knowledgeGrowth: point.count,
}));

console.log("Learning velocity:", learningProgress);

// Identify most accessed memories
const popularMemories = analytics.data.accessPatterns
  .sort((a, b) => b.accessCount - a.accessCount)
  .slice(0, 10);

console.log("Most referenced memories:", popularMemories);
```

### Memory Quality Assessment

```javascript
// Find memories that might need updates
const lowQualityMemories = await mcp.searchMemoriesAdvanced({
  query: "*",
  filters: {
    importanceRange: { min: 0, max: 0.3 },
    dateRange: {
      start: "2023-01-01",
      end: "2023-12-31",
    },
  },
  ranking: "date",
  limit: 50,
});

console.log(
  "Memories that might need review:",
  lowQualityMemories.data.memories,
);

// Find orphaned memories (no relationships)
const allMemories = await mcp.getAllMemories({ limit: 1000 });
const orphanedMemories = [];

for (const memory of allMemories.data.memories) {
  const relationships = await mcp.getMemoryRelationships({
    memoryId: memory.id,
    includeReverse: true,
  });

  if (relationships.data.relationships.length === 0) {
    orphanedMemories.push(memory);
  }
}

console.log("Orphaned memories (no connections):", orphanedMemories);
```

---

## Real-World Use Cases

### Personal Learning Assistant

```javascript
// Capture learning from a coding session
await mcp.addMemoryEnhanced({
  content:
    "Learned that React.memo should be used sparingly - only when component has expensive renders and props change infrequently",
  importance: 0.8,
  memoryType: "knowledge",
  context: {
    sessionId: "react_optimization_session_2024",
    topic: "react_performance",
    domain: "frontend",
  },
  metadata: {
    tags: ["react", "memo", "performance", "optimization"],
    source: "React docs + performance profiling",
  },
});

// Link to related optimization technique
await mcp.linkMemories({
  sourceMemoryId: "react_memo_learning_id",
  targetMemoryId: "usecallback_learning_id",
  relationshipType: "extends",
  strength: 0.7,
  description: "useCallback works together with React.memo for optimization",
});
```

### Code Review Memory System

```javascript
// Store review insights
const reviewInsights = [
  {
    content:
      "Team tends to over-abstract early - prefer simple solutions first",
    importance: 0.9,
    memoryType: "reasoning",
    context: { topic: "code_review_patterns", domain: "team_practices" },
    metadata: { tags: ["code-review", "abstraction", "team-practices"] },
  },
  {
    content: "TypeScript strict mode catches 40% more bugs during development",
    importance: 0.85,
    memoryType: "performance",
    context: { topic: "typescript_benefits", domain: "development_tools" },
    metadata: { tags: ["typescript", "bug-prevention", "metrics"] },
  },
];

await mcp.addMemoriesBatch({ memories: reviewInsights });
```

### Project Architecture Documentation

```javascript
// Document architectural decisions
await mcp.addReasoningChain({
  chainId: "authentication_architecture_2024",
  steps: [
    {
      stepNumber: 1,
      description: "Evaluate authentication requirements",
      reasoning: "Need to support SSO, 2FA, and role-based access",
      evidence: ["Security audit requirements", "User stories"],
    },
    {
      stepNumber: 2,
      description: "Compare authentication providers",
      reasoning: "Auth0 vs AWS Cognito vs self-hosted solutions",
      evidence: [
        "Cost analysis",
        "Feature comparison",
        "Compliance requirements",
      ],
    },
    {
      stepNumber: 3,
      description: "Assess integration complexity",
      reasoning: "Existing microservices need consistent auth",
      evidence: ["Service inventory", "Current auth patterns"],
    },
  ],
  outcome: "Selected Auth0 with custom claims for role management",
  confidence: 0.8,
  context: {
    sessionId: "auth_architecture_decision_2024",
    topic: "authentication",
    domain: "system_architecture",
  },
});
```

---

## Advanced Patterns

### Memory Hierarchies

```javascript
// Create a learning hierarchy
const conceptMemory = await mcp.addMemoryEnhanced({
  content: "Microservices architecture pattern",
  importance: 0.9,
  memoryType: "knowledge",
  context: { topic: "architecture_patterns" },
});

const implementationMemory = await mcp.addMemoryEnhanced({
  content: "Implemented user service with domain-driven design boundaries",
  importance: 0.7,
  memoryType: "procedure",
  context: { topic: "microservices_implementation" },
});

// Link concept to implementation
await mcp.linkMemories({
  sourceMemoryId: conceptMemory.data.memoryId,
  targetMemoryId: implementationMemory.data.memoryId,
  relationshipType: "extends",
  strength: 0.8,
});
```

### Contextual Memory Retrieval

```javascript
// Context-aware search for current project
const projectContext = {
  sessionId: "ecommerce_platform_2024",
  domain: "backend_development",
  topic: "api_design",
};

const relevantMemories = await mcp.searchMemoriesAdvanced({
  query: "REST API design patterns",
  filters: {
    context: projectContext,
    memoryType: ["knowledge", "procedure"],
    importanceRange: { min: 0.6, max: 1.0 },
  },
  ranking: "importance",
});

// Use memories to inform current decisions
console.log(
  "Relevant patterns for current API design:",
  relevantMemories.data.memories,
);
```

---

## Next Steps

- **[🏗 Architecture Guide](architecture.md)** - Deep dive into configuration and advanced features
- **[🌐 AO Integration](ao-integration.md)** - Custom process integration patterns
- **[🚨 Troubleshooting](troubleshooting.md)** - Common issues and solutions
- **[🤝 Contributing](contributing.md)** - Join the development community

---

**💡 Ready to implement these patterns? Start building your AI memory system!**

[Next: Architecture Guide →](architecture.md)
