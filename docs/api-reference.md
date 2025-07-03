# Permamind API Reference

Complete reference for all Permamind MCP tools and their parameters.

## Tool Categories

- [Core Memory Operations](#core-memory-operations)
- [Enhanced AI Memory](#enhanced-ai-memory)
- [Knowledge Graph Operations](#knowledge-graph-operations)
- [AO Process Integration](#ao-process-integration)
- [Token Operations](#token-operations)
- [Analytics & Insights](#analytics--insights)
- [Server Management](#server-management)

---

## Core Memory Operations

### `addMemory`

Store basic conversation memories with minimal metadata.

**Purpose**: Simple memory storage for chat history and basic interactions.

**Parameters**:

- `content` (string, required): The memory content to store
- `role` (string, required): Message role - "user", "assistant", or "system"
- `p` (string, required): Public key of the memory owner

**Example**:

```json
{
  "content": "User prefers dark mode in all applications",
  "role": "system",
  "p": "abc123...xyz789"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Memory added successfully",
  "memoryId": "mem_12345"
}
```

---

### `getAllMemories`

Retrieve all stored memories, optionally filtered by conversation.

**Purpose**: Bulk memory retrieval for analysis or migration.

**Parameters**:

- `conversationId` (string, optional): Filter by specific conversation
- `limit` (number, optional): Maximum memories to return (default: 100)
- `offset` (number, optional): Skip this many memories (pagination)

**Example**:

```json
{
  "conversationId": "conv_123",
  "limit": 50
}
```

**Response**:

```json
{
  "success": true,
  "memories": [
    {
      "id": "mem_123",
      "content": "Memory content",
      "role": "user",
      "timestamp": "2024-01-15T10:30:00Z",
      "p": "abc123...xyz789"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

---

### `getAllMemoriesForConversation`

Get all memories associated with a specific conversation.

**Purpose**: Retrieve conversation-specific memory context.

**Parameters**:

- `conversationId` (string, required): Target conversation ID

**Example**:

```json
{
  "conversationId": "conv_456"
}
```

**Response**:

```json
{
  "success": true,
  "memories": [...],
  "conversationId": "conv_456",
  "memoryCount": 25
}
```

---

### `searchMemories`

Basic keyword-based memory search.

**Purpose**: Simple text search across memory content.

**Parameters**:

- `query` (string, required): Search keywords
- `conversationId` (string, optional): Limit search to specific conversation
- `limit` (number, optional): Maximum results (default: 20)

**Example**:

```json
{
  "query": "authentication security",
  "limit": 10
}
```

**Response**:

```json
{
  "success": true,
  "memories": [...],
  "query": "authentication security",
  "resultCount": 8
}
```

---

## Enhanced AI Memory

### `addMemoryEnhanced`

Store AI memories with rich metadata, importance scoring, and context.

**Purpose**: Advanced memory storage with AI-specific features.

**Parameters**:

- `content` (string, required): Memory content
- `role` (string, optional): Message role (default: "user")
- `p` (string, required): Owner's public key
- `importance` (number, optional): Relevance score 0-1 (default: 0.5)
- `memoryType` (string, optional): Memory classification
- `context` (object, optional): Rich contextual metadata
- `metadata` (object, optional): Additional metadata

**Memory Types**:

- `conversation` - Dialog interactions
- `reasoning` - AI decision processes
- `knowledge` - Factual information
- `procedure` - Step-by-step processes
- `enhancement` - Code improvements
- `performance` - Metrics and benchmarks
- `workflow` - Business processes

**Context Fields**:

- `sessionId` (string): Session identifier
- `topic` (string): Memory topic/subject
- `domain` (string): Domain or category
- `relatedMemories` (string[]): Related memory IDs

**Metadata Fields**:

- `tags` (string[]): Custom tags for categorization
- `source` (string): Source of the information
- `confidence` (number): Confidence in the information (0-1)

**Example**:

```json
{
  "content": "Implemented JWT authentication with refresh tokens and proper security headers",
  "importance": 0.9,
  "memoryType": "knowledge",
  "context": {
    "sessionId": "auth_implementation_2024",
    "topic": "authentication",
    "domain": "web_development"
  },
  "metadata": {
    "tags": ["security", "jwt", "authentication", "best-practices"],
    "source": "implementation_session",
    "confidence": 0.95
  },
  "p": "developer_public_key"
}
```

**Response**:

```json
{
  "success": true,
  "memoryId": "enhanced_mem_789",
  "importance": 0.9,
  "memoryType": "knowledge",
  "indexedTags": ["security", "jwt", "authentication", "web_development"]
}
```

---

### `searchMemoriesAdvanced`

Advanced memory search with filters, ranking, and faceted search.

**Purpose**: Sophisticated memory retrieval with multiple search criteria.

**Parameters**:

- `query` (string, required): Search query
- `filters` (object, optional): Search filters
- `ranking` (string, optional): Ranking strategy
- `limit` (number, optional): Maximum results (default: 20)

**Filter Options**:

- `memoryType` (string): Filter by memory type
- `importanceThreshold` (number): Minimum importance score
- `domain` (string): Filter by domain
- `sessionId` (string): Filter by session
- `tags` (string[]): Must include these tags
- `timeRange` (object): Date range filter
  - `start` (string): Start date (ISO 8601)
  - `end` (string): End date (ISO 8601)

**Ranking Strategies**:

- `relevance` (default): Sort by search relevance
- `importance`: Sort by importance score
- `recency`: Sort by creation time
- `access`: Sort by access frequency

**Example**:

```json
{
  "query": "authentication security",
  "filters": {
    "memoryType": "knowledge",
    "importanceThreshold": 0.7,
    "domain": "web_development",
    "tags": ["security"],
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-12-31T23:59:59Z"
    }
  },
  "ranking": "importance",
  "limit": 15
}
```

**Response**:

```json
{
  "success": true,
  "memories": [
    {
      "id": "mem_456",
      "content": "Memory content...",
      "importance": 0.9,
      "memoryType": "knowledge",
      "relevanceScore": 0.85,
      "context": {...},
      "metadata": {...}
    }
  ],
  "query": "authentication security",
  "resultCount": 12,
  "facets": {
    "memoryTypes": {"knowledge": 8, "procedure": 4},
    "domains": {"web_development": 10, "mobile": 2},
    "importanceRange": {"0.7-0.8": 5, "0.8-0.9": 4, "0.9-1.0": 3}
  }
}
```

---

### `addMemoriesBatch`

Efficiently add multiple memories in a single operation.

**Purpose**: Bulk memory creation for data imports or batch processing.

**Parameters**:

- `memories` (array, required): Array of memory objects
- `p` (string, required): Owner's public key for all memories

**Memory Object Structure**: Same as `addMemoryEnhanced`

**Example**:

```json
{
  "memories": [
    {
      "content": "First memory",
      "importance": 0.8,
      "memoryType": "knowledge"
    },
    {
      "content": "Second memory",
      "importance": 0.6,
      "memoryType": "conversation"
    }
  ],
  "p": "batch_owner_key"
}
```

**Response**:

```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "memoryIds": ["mem_100", "mem_101"],
  "errors": []
}
```

---

## Knowledge Graph Operations

### `linkMemories`

Create typed relationships between memories to build knowledge graphs.

**Purpose**: Connect related memories with semantic relationships.

**Parameters**:

- `sourceMemoryId` (string, required): Source memory ID
- `targetMemoryId` (string, required): Target memory ID
- `relationshipType` (string, required): Type of relationship
- `strength` (number, optional): Connection strength 0-1 (default: 0.5)
- `description` (string, optional): Relationship description
- `p` (string, required): Owner's public key

**Relationship Types**:

- `causes` - Causal relationships (A leads to B)
- `supports` - Evidence or reinforcement
- `contradicts` - Conflicting or opposing information
- `extends` - Elaboration or expansion
- `references` - Citation or mention
- `prerequisite` - Required knowledge dependency
- `example` - Illustrative example
- `implementation` - Concrete implementation of concept

**Example**:

```json
{
  "sourceMemoryId": "mem_jwt_auth",
  "targetMemoryId": "mem_security_practices",
  "relationshipType": "supports",
  "strength": 0.85,
  "description": "JWT authentication supports security best practices",
  "p": "knowledge_graph_owner"
}
```

**Response**:

```json
{
  "success": true,
  "linkId": "link_123",
  "sourceId": "mem_jwt_auth",
  "targetId": "mem_security_practices",
  "relationshipType": "supports",
  "strength": 0.85
}
```

---

### `getMemoryRelationships`

Explore memory relationships and knowledge graph connections.

**Purpose**: Analyze knowledge graph structure and find related memories.

**Parameters**:

- `memoryId` (string, optional): Focus on specific memory's relationships
- `relationshipType` (string, optional): Filter by relationship type
- `minStrength` (number, optional): Minimum connection strength
- `maxDepth` (number, optional): Maximum relationship depth (default: 2)
- `includeReverse` (boolean, optional): Include reverse relationships (default: true)

**Example**:

```json
{
  "memoryId": "mem_auth_concept",
  "minStrength": 0.7,
  "maxDepth": 3
}
```

**Response**:

```json
{
  "success": true,
  "relationships": [
    {
      "linkId": "link_456",
      "sourceId": "mem_auth_concept",
      "targetId": "mem_jwt_implementation",
      "relationshipType": "extends",
      "strength": 0.9,
      "distance": 1
    }
  ],
  "networkStats": {
    "totalNodes": 25,
    "totalEdges": 18,
    "avgConnections": 1.44,
    "strongestConnection": 0.95
  }
}
```

---

### `addReasoningChain`

Document AI reasoning processes and decision-making chains.

**Purpose**: Store and track AI decision-making processes for transparency and learning.

**Parameters**:

- `chainId` (string, required): Unique chain identifier
- `steps` (string, required): JSON string of reasoning steps
- `outcome` (string, required): Final decision or result
- `p` (string, required): Owner's public key
- `confidence` (number, optional): Overall confidence in reasoning (0-1)
- `context` (object, optional): Contextual information

**Reasoning Step Structure**:

```typescript
interface ReasoningStep {
  stepType: "observation" | "thought" | "action" | "reflection";
  content: string;
  confidence: number;
  timestamp: string;
  evidence?: string[];
  alternatives?: string[];
}
```

**Example**:

```json
{
  "chainId": "auth_decision_chain_001",
  "steps": "[
    {
      \"stepType\": \"observation\",
      \"content\": \"User needs secure authentication system\",
      \"confidence\": 0.95,
      \"timestamp\": \"2024-01-15T10:00:00Z\",
      \"evidence\": [\"security requirements\", \"user stories\"]
    },
    {
      \"stepType\": \"thought\",
      \"content\": \"JWT tokens provide stateless authentication\",
      \"confidence\": 0.8,
      \"timestamp\": \"2024-01-15T10:01:00Z\",
      \"alternatives\": [\"session-based auth\", \"OAuth\"]
    },
    {
      \"stepType\": \"action\",
      \"content\": \"Implement JWT-based authentication system\",
      \"confidence\": 0.9,
      \"timestamp\": \"2024-01-15T10:02:00Z\"
    }
  ]",
  "outcome": "Successfully implemented JWT authentication with refresh tokens",
  "confidence": 0.88,
  "p": "reasoning_agent_key"
}
```

**Response**:

```json
{
  "success": true,
  "chainId": "auth_decision_chain_001",
  "stepCount": 3,
  "averageConfidence": 0.88,
  "reasoningId": "reasoning_789"
}
```

---

## AO Process Integration

### `executeProcessAction`

Universal natural language interface for any AO process.

**Purpose**: Interact with AO processes using natural language and markdown documentation.

**Parameters**:

- `processId` (string, required): Target AO process ID
- `request` (string, required): Natural language request
- `processMarkdown` (string, required): Process documentation in markdown format

**Markdown Documentation Format**:

```markdown
# Process Name

Brief process description.

## handler1

Description of what this handler does

- parameter1: Description (required/optional)
- parameter2: Description (required/optional)

## handler2

Another handler description

- param1: Description (required)
```

**Example**:

```json
{
  "processId": "token_process_xyz789",
  "processMarkdown": "# Token Process\n\n## transfer\nTransfer tokens to another user\n- recipient: wallet address (required)\n- amount: number of tokens (required)\n- memo: optional message (optional)\n\n## balance\nGet current balance\n- account: wallet address to check (optional)",
  "request": "Send 100 tokens to alice with memo 'payment for consulting'"
}
```

**Response**:

```json
{
  "success": true,
  "handlerUsed": "transfer",
  "parameters": {
    "recipient": "alice",
    "amount": 100,
    "memo": "payment for consulting"
  },
  "data": {
    "transactionId": "tx_123",
    "status": "completed",
    "balanceAfter": 900
  },
  "confidence": 0.95
}
```

---

### `executeTokenRequest`

Simplified interface for common token operations without requiring documentation.

**Purpose**: Quick token operations using auto-detected templates.

**Parameters**:

- `processId` (string, required): Token process ID
- `request` (string, required): Natural language token request

**Supported Operations** (auto-detected):

- Balance queries: "What's my balance?", "Check balance for alice"
- Transfers: "Send 100 tokens to bob", "Transfer 50 tokens to alice with memo 'payment'"
- Token info: "Get token details", "What's the token name and supply?"
- Minting: "Mint 1000 tokens for alice" (if authorized)

**Example**:

```json
{
  "processId": "token_abc123",
  "request": "What's my current token balance?"
}
```

**Response**:

```json
{
  "success": true,
  "operation": "balance",
  "data": {
    "account": "user_wallet_address",
    "balance": 1500,
    "ticker": "PMIND",
    "name": "Permamind Token"
  },
  "processType": "token",
  "templateUsed": "default"
}
```

---

## Token Operations

### `createSimpleToken`

Deploy a basic AO token contract with standard functionality.

**Purpose**: Quick token creation for simple use cases.

**Parameters**:

- `name` (string, required): Token name
- `ticker` (string, required): Token symbol/ticker
- `description` (string, optional): Token description
- `initialSupply` (number, optional): Initial token supply (default: 0)
- `mintable` (boolean, optional): Can mint new tokens (default: true)
- `transferable` (boolean, optional): Can transfer tokens (default: true)
- `burnable` (boolean, optional): Can burn tokens (default: false)
- `denomination` (number, optional): Decimal places (default: 12)

**Example**:

```json
{
  "name": "My Project Token",
  "ticker": "MPT",
  "description": "Token for My Project ecosystem",
  "initialSupply": 1000000,
  "mintable": true,
  "transferable": true,
  "burnable": false,
  "denomination": 12
}
```

**Response**:

```json
{
  "success": true,
  "processId": "token_new_abc123",
  "name": "My Project Token",
  "ticker": "MPT",
  "initialSupply": 1000000,
  "owner": "creator_wallet_address",
  "transactionId": "deploy_tx_456"
}
```

---

### `createAdvancedToken`

Deploy tokens with sophisticated minting strategies and advanced features.

**Purpose**: Create tokens with complex economic models and minting behaviors.

**Parameters**:

- `name` (string, required): Token name
- `ticker` (string, required): Token symbol
- `description` (string, optional): Token description
- `initialSupply` (number, optional): Initial supply (default: 0)
- `mintingStrategy` (string, required): Minting strategy type
- `strategyConfig` (object, required): Strategy-specific configuration

**Minting Strategies**:

#### Basic Strategy

```json
{
  "mintingStrategy": "Basic",
  "basicConfig": {
    "maxSupply": 10000000,
    "ownerOnly": true
  }
}
```

#### Cascade Strategy

```json
{
  "mintingStrategy": "Cascade",
  "cascadeConfig": {
    "rewardPercentage": 5,
    "thresholdAmount": 1000,
    "maxRewards": 100
  }
}
```

#### DoubleMint Strategy

```json
{
  "mintingStrategy": "DoubleMint",
  "doubleMintConfig": {
    "maxSupply": 5000000,
    "ownerOnly": true
  }
}
```

**Example**:

```json
{
  "name": "Rewards Token",
  "ticker": "RWRD",
  "description": "Token with cascade minting rewards",
  "initialSupply": 100000,
  "mintingStrategy": "Cascade",
  "cascadeConfig": {
    "rewardPercentage": 5,
    "thresholdAmount": 1000,
    "maxRewards": 50
  }
}
```

**Response**:

```json
{
  "success": true,
  "processId": "advanced_token_xyz789",
  "name": "Rewards Token",
  "ticker": "RWRD",
  "mintingStrategy": "Cascade",
  "contractFeatures": [
    "cascade_minting",
    "credit_notice_detection",
    "reward_tracking"
  ],
  "transactionId": "advanced_deploy_789"
}
```

---

## Analytics & Insights

### `getMemoryAnalytics`

Comprehensive analytics about memory usage patterns and trends.

**Purpose**: Understand memory usage, identify patterns, and optimize memory management.

**Parameters**:

- `p` (string, optional): Filter by specific user's memories
- `timeRange` (object, optional): Date range for analysis
- `includeGraph` (boolean, optional): Include knowledge graph analytics (default: false)

**Example**:

```json
{
  "timeRange": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "includeGraph": true
}
```

**Response**:

```json
{
  "success": true,
  "totalMemories": 1247,
  "timeRange": "2024-01-01 to 2024-01-31",
  "memoryTypeDistribution": {
    "conversation": 456,
    "knowledge": 334,
    "reasoning": 123,
    "procedure": 89,
    "enhancement": 67,
    "performance": 45,
    "workflow": 133
  },
  "importanceDistribution": {
    "high": 124,
    "medium": 623,
    "low": 500
  },
  "accessPatterns": {
    "mostAccessed": ["mem_123", "mem_456", "mem_789"],
    "recentlyAccessed": ["mem_999", "mem_888", "mem_777"],
    "unusedMemories": ["mem_111", "mem_222"]
  },
  "graphAnalytics": {
    "totalNodes": 1247,
    "totalEdges": 892,
    "averageConnections": 1.43,
    "strongestConnections": [
      {
        "from": "mem_auth",
        "to": "mem_security",
        "strength": 0.95
      }
    ],
    "topRelationshipTypes": [
      { "type": "supports", "count": 234 },
      { "type": "extends", "count": 187 },
      { "type": "references", "count": 156 }
    ]
  },
  "growthTrends": {
    "dailyAverageNew": 12.3,
    "weeklyGrowthRate": 0.08,
    "peakUsageDays": ["Monday", "Wednesday", "Friday"]
  }
}
```

---

## Server Management

### `getServerInfo`

Get comprehensive information about the Permamind server status and configuration.

**Purpose**: Verify server status, get identity information, and check system health.

**Parameters**: None

**Response**:

```json
{
  "success": true,
  "server": {
    "version": "1.0.0",
    "status": "running",
    "uptime": "2d 5h 32m",
    "nodeVersion": "20.11.0"
  },
  "identity": {
    "walletAddress": "abc123...xyz789",
    "publicKey": "pubkey_123...",
    "hasSeedPhrase": true
  },
  "hub": {
    "hubId": "hub_456...def789",
    "registryId": "g_eSbkmD4LzfZtXaCLmeMcLIBQrqxnY-oFQJJNMIn4w",
    "status": "active",
    "memoryCount": 1247
  },
  "network": {
    "aoNetwork": "marshal-testnet",
    "cuUrl": "https://cu.velocity.cloudnet.marshal.ao",
    "muUrl": "https://mu.velocity.cloudnet.marshal.ao",
    "gatewayUrl": "https://gateway.velocity.cloudnet.marshal.ao"
  },
  "capabilities": {
    "memoryOperations": true,
    "knowledgeGraphs": true,
    "tokenOperations": true,
    "processIntegration": true,
    "batchOperations": true
  },
  "tools": [
    "addMemory",
    "addMemoryEnhanced",
    "searchMemoriesAdvanced",
    "executeProcessAction",
    "createAdvancedToken"
    // ... all available tools
  ]
}
```

---

## Error Handling

All tools follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error context
    }
  }
}
```

### Common Error Codes

- `INVALID_PARAMETERS` - Invalid or missing required parameters
- `MEMORY_NOT_FOUND` - Requested memory does not exist
- `PROCESS_NOT_FOUND` - AO process not found or inaccessible
- `NETWORK_ERROR` - AO network connectivity issues
- `AUTHENTICATION_ERROR` - Wallet or signature issues
- `RATE_LIMIT_ERROR` - Too many requests
- `STORAGE_ERROR` - Arweave storage issues
- `VALIDATION_ERROR` - Data validation failures

### Rate Limiting

Most tools are subject to rate limiting:

- **Memory operations**: 60 requests per minute
- **Search operations**: 30 requests per minute
- **Process operations**: 20 requests per minute
- **Token creation**: 5 requests per minute

Rate limit headers are included in error responses:

```json
{
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 60,
      "remaining": 0,
      "resetTime": "2024-01-15T10:31:00Z"
    }
  }
}
```

This comprehensive API reference covers all available Permamind tools with detailed parameters, examples, and error handling information.
