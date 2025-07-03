# Permamind Memory System Guide

This guide explains Permamind's AI memory concepts, architecture, and best practices for building effective knowledge systems.

## Memory System Overview

Permamind implements a sophisticated AI memory architecture that goes beyond simple storage to create intelligent, interconnected knowledge systems. The memory system is designed to:

- **Preserve Context**: Maintain rich contextual information across sessions
- **Enable Learning**: Support continuous learning and knowledge accumulation
- **Build Knowledge Graphs**: Create interconnected networks of related concepts
- **Track Reasoning**: Document AI decision-making processes
- **Optimize Access**: Provide intelligent memory retrieval and ranking

## Memory Types and Classification

### Core Memory Types

#### `conversation`

**Purpose**: Store dialog interactions and chat history

- User messages and responses
- Context about user preferences
- Conversation flow and patterns
- Session-specific information

**Best Practices**:

- Use for preserving user interaction context
- Include conversation metadata (topic, participants)
- Set moderate importance (0.3-0.7) unless critical

**Example**:

```json
{
  "content": "User prefers concise code explanations with practical examples",
  "memoryType": "conversation",
  "importance": 0.6,
  "context": {
    "sessionId": "chat_2024_01_15",
    "topic": "user_preferences"
  }
}
```

#### `knowledge`

**Purpose**: Store factual information, concepts, and learned knowledge

- Technical facts and definitions
- Domain-specific knowledge
- Learned concepts and principles
- Reference information

**Best Practices**:

- Use high importance (0.7-1.0) for core concepts
- Include domain classification
- Link to related knowledge with relationships
- Tag with relevant keywords

**Example**:

```json
{
  "content": "JWT tokens consist of header, payload, and signature. They provide stateless authentication but require careful handling of secrets.",
  "memoryType": "knowledge",
  "importance": 0.9,
  "context": {
    "domain": "web_security",
    "topic": "authentication"
  },
  "metadata": {
    "tags": ["jwt", "authentication", "security", "stateless"]
  }
}
```

#### `reasoning`

**Purpose**: Document AI decision-making processes and logic chains

- Problem-solving approaches
- Decision rationales
- Alternative considerations
- Logic chains and inferences

**Best Practices**:

- Link to the knowledge used in reasoning
- Include confidence levels
- Document alternatives considered
- Reference supporting evidence

**Example**:

```json
{
  "content": "Chose JWT over session-based auth because: 1) Stateless design better for microservices, 2) Easier horizontal scaling, 3) Mobile app compatibility. Considered: OAuth complexity, session storage overhead.",
  "memoryType": "reasoning",
  "importance": 0.8,
  "context": {
    "domain": "architecture_decisions",
    "topic": "authentication_choice"
  }
}
```

#### `procedure`

**Purpose**: Store step-by-step processes and methodologies

- Implementation procedures
- Best practice workflows
- Troubleshooting steps
- Methodological approaches

**Best Practices**:

- Structure as clear, actionable steps
- Include prerequisites and conditions
- Link to related procedures
- Update when processes evolve

**Example**:

```json
{
  "content": "JWT Implementation Process: 1) Install jwt library, 2) Create secret key, 3) Implement token generation, 4) Add middleware for verification, 5) Handle token refresh, 6) Test security",
  "memoryType": "procedure",
  "importance": 0.8,
  "context": {
    "domain": "implementation",
    "topic": "jwt_setup"
  }
}
```

#### `enhancement`

**Purpose**: Store code improvements and optimization insights

- Performance optimizations
- Refactoring approaches
- Code quality improvements
- Efficiency enhancements

**Example**:

```json
{
  "content": "Optimized database queries by adding proper indexes and using connection pooling. Response time improved from 200ms to 50ms.",
  "memoryType": "enhancement",
  "importance": 0.7,
  "context": {
    "domain": "performance",
    "topic": "database_optimization"
  }
}
```

#### `performance`

**Purpose**: Store metrics, benchmarks, and performance data

- Benchmark results
- Performance metrics
- Comparison data
- Optimization outcomes

**Example**:

```json
{
  "content": "API endpoint /users now handles 1000 req/sec (up from 200 req/sec) after implementing Redis caching and database optimization.",
  "memoryType": "performance",
  "importance": 0.6,
  "context": {
    "domain": "api_performance",
    "topic": "users_endpoint"
  }
}
```

#### `workflow`

**Purpose**: Store business processes and AO workflow definitions

- Business logic workflows
- AO process definitions
- Integration patterns
- Automation procedures

**Example**:

```json
{
  "content": "User registration workflow: validate email -> create account -> send verification -> activate on confirm -> trigger welcome sequence",
  "memoryType": "workflow",
  "importance": 0.8,
  "context": {
    "domain": "user_management",
    "topic": "registration_flow"
  }
}
```

## Memory Context System

### Context Fields

#### `sessionId`

**Purpose**: Group related memories from the same session or task

- Links related interactions
- Enables session-based retrieval
- Supports conversation continuity

**Usage**:

```json
{
  "context": {
    "sessionId": "auth_implementation_2024_01_15"
  }
}
```

#### `topic`

**Purpose**: Categorize memories by subject matter

- Enables topic-based grouping
- Supports thematic search
- Facilitates knowledge organization

**Examples**:

- `authentication`
- `database_design`
- `api_development`
- `user_experience`

#### `domain`

**Purpose**: Classify memories by technical or business domain

- Enables domain-specific retrieval
- Supports expertise areas
- Facilitates specialization

**Examples**:

- `web_development`
- `mobile_development`
- `devops`
- `data_science`
- `business_logic`

#### `relatedMemories`

**Purpose**: Reference directly related memory IDs

- Creates explicit connections
- Supports navigation paths
- Enables context expansion

**Usage**:

```json
{
  "context": {
    "relatedMemories": ["mem_jwt_basics", "mem_security_headers"]
  }
}
```

## Importance Scoring System

### Scoring Guidelines

#### Critical Knowledge (0.9-1.0)

- Core system concepts
- Critical security information
- Essential business logic
- Fundamental principles

**Examples**:

- Authentication mechanisms
- Data security practices
- Core business rules
- System architecture decisions

#### Important Information (0.7-0.8)

- Significant implementation details
- Best practices
- Important procedures
- Key performance insights

**Examples**:

- Coding standards
- Deployment procedures
- Performance optimization techniques
- Integration patterns

#### Relevant Context (0.5-0.6)

- Supporting information
- Helpful examples
- Useful references
- Contextual details

**Examples**:

- Code examples
- Configuration details
- Tool usage tips
- Environment specifics

#### Minor Details (0.3-0.4)

- Supplementary information
- Edge cases
- Historical context
- Debugging information

**Examples**:

- Troubleshooting logs
- Temporary workarounds
- Version-specific notes
- Development environment setup

#### Low Priority (0.0-0.2)

- Cleanup candidates
- Outdated information
- Experimental notes
- Temporary observations

### Dynamic Importance Adjustment

Permamind can automatically adjust importance based on:

- **Access Frequency**: Frequently accessed memories gain importance
- **Reference Count**: Memories referenced by others gain importance
- **Recency**: Recent memories start with baseline importance
- **Validation**: Confirmed accuracy increases importance

## Knowledge Graph Relationships

### Relationship Types

#### `causes` - Causal Relationships

**When to Use**: When one concept directly leads to or causes another
**Examples**:

- "Poor database indexing" → causes → "Slow query performance"
- "Proper input validation" → causes → "Reduced security vulnerabilities"

#### `supports` - Evidence and Reinforcement

**When to Use**: When one memory provides evidence or support for another
**Examples**:

- "JWT security practices" → supports → "Authentication best practices"
- "Performance test results" → supports → "Optimization recommendations"

#### `contradicts` - Conflicting Information

**When to Use**: When memories contain conflicting or opposing information
**Examples**:

- "Use sessions for simplicity" → contradicts → "Use JWT for scalability"
- "Premature optimization is evil" → contradicts → "Always optimize critical paths"

#### `extends` - Elaboration and Expansion

**When to Use**: When one memory elaborates on or extends another
**Examples**:

- "JWT basics" → extends → "JWT security considerations"
- "REST API design" → extends → "REST API authentication"

#### `references` - Citations and Mentions

**When to Use**: When one memory mentions or cites another
**Examples**:

- "API implementation guide" → references → "Authentication middleware"
- "Troubleshooting guide" → references → "Common error patterns"

#### `prerequisite` - Required Knowledge Dependencies

**When to Use**: When one concept is required to understand another
**Examples**:

- "HTTP basics" → prerequisite → "REST API design"
- "JavaScript fundamentals" → prerequisite → "React development"

#### `example` - Illustrative Examples

**When to Use**: When one memory provides concrete examples of another
**Examples**:

- "JWT implementation example" → example → "JWT authentication concept"
- "Database query optimization case" → example → "Performance optimization principles"

#### `implementation` - Concrete Implementations

**When to Use**: When one memory shows how to implement a concept
**Examples**:

- "JWT middleware code" → implementation → "JWT authentication strategy"
- "Database connection pool setup" → implementation → "Connection optimization"

### Relationship Strength Scoring

#### Strong Connections (0.8-1.0)

- Direct causal relationships
- Essential prerequisites
- Primary implementations
- Core supporting evidence

#### Moderate Connections (0.5-0.7)

- Secondary relationships
- Helpful but not essential
- Alternative approaches
- Contextual references

#### Weak Connections (0.2-0.4)

- Tangential relationships
- Distant connections
- Weak correlations
- Exploratory links

#### Minimal Connections (0.0-0.1)

- Cleanup candidates
- Accidental relationships
- Very weak correlations
- Experimental connections

## Search and Retrieval Strategies

### Basic Search Patterns

#### Keyword Search

```json
{
  "query": "JWT authentication security"
}
```

**Best For**: Quick lookups, general exploration

#### Type-Filtered Search

```json
{
  "query": "database optimization",
  "filters": {
    "memoryType": "enhancement"
  }
}
```

**Best For**: Finding specific types of information

#### Domain-Specific Search

```json
{
  "query": "performance",
  "filters": {
    "domain": "web_development",
    "importanceThreshold": 0.7
  }
}
```

**Best For**: Expert-level information in specific domains

### Advanced Search Patterns

#### Context-Aware Search

```json
{
  "query": "authentication",
  "filters": {
    "sessionId": "current_project",
    "memoryType": ["knowledge", "procedure"],
    "importanceThreshold": 0.6
  }
}
```

**Best For**: Project-specific information retrieval

#### Time-Based Search

```json
{
  "query": "optimization",
  "filters": {
    "timeRange": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    }
  }
}
```

**Best For**: Finding recent insights or historical context

#### Tag-Based Search

```json
{
  "query": "security",
  "filters": {
    "tags": ["best-practices", "implementation"],
    "ranking": "importance"
  }
}
```

**Best For**: Finding curated, high-quality information

### Search Ranking Strategies

#### `relevance` (Default)

- Combines text relevance with metadata
- Weights importance and access patterns
- Considers relationship strength

#### `importance`

- Prioritizes high-importance memories
- Good for finding critical information
- Useful for learning core concepts

#### `recency`

- Shows most recent memories first
- Good for finding latest insights
- Useful for current project context

#### `access`

- Prioritizes frequently accessed memories
- Good for finding commonly used information
- Useful for identifying important patterns

## Memory Lifecycle Management

### Creation Best Practices

#### Rich Metadata

Always include comprehensive metadata:

```json
{
  "content": "Detailed memory content...",
  "importance": 0.8,
  "memoryType": "knowledge",
  "context": {
    "sessionId": "project_setup_2024",
    "topic": "authentication",
    "domain": "web_development"
  },
  "metadata": {
    "tags": ["jwt", "security", "implementation"],
    "source": "implementation_session",
    "confidence": 0.9
  }
}
```

#### Atomic Concepts

Keep memories focused on single concepts:

- ✅ "JWT tokens provide stateless authentication"
- ❌ "JWT tokens provide stateless authentication and Redis is good for caching and PostgreSQL is our database"

#### Clear Content

Write clear, self-contained content:

- Include context needed to understand the memory
- Use consistent terminology
- Avoid ambiguous references

### Update Strategies

#### Version Control

Create new memories for significant updates:

```json
{
  "content": "Updated JWT implementation with refresh token support (v2)",
  "context": {
    "relatedMemories": ["jwt_implementation_v1"]
  }
}
```

#### Link New Information

Connect updates to existing knowledge:

```json
{
  "sourceMemoryId": "jwt_implementation_v2",
  "targetMemoryId": "jwt_implementation_v1",
  "relationshipType": "extends",
  "strength": 0.9
}
```

### Cleanup Strategies

#### Importance Decay

Lower importance of outdated memories:

- Mark deprecated approaches with low importance
- Maintain for historical context
- Link to current best practices

#### Relationship Pruning

Remove weak or invalid relationships:

- Regularly review relationship strength
- Remove accidental connections
- Consolidate redundant links

## Reasoning Chain Documentation

### Structure Best Practices

#### Complete Step Documentation

```json
{
  "chainId": "auth_decision_2024_01_15",
  "steps": [
    {
      "stepType": "observation",
      "content": "Current session-based auth creates scalability issues",
      "confidence": 0.9,
      "evidence": ["server memory usage", "session storage costs"]
    },
    {
      "stepType": "thought",
      "content": "JWT tokens could provide stateless alternative",
      "confidence": 0.8,
      "alternatives": ["OAuth 2.0", "API keys", "session optimization"]
    },
    {
      "stepType": "action",
      "content": "Implement JWT-based authentication system",
      "confidence": 0.85
    },
    {
      "stepType": "reflection",
      "content": "Implementation successful, response times improved 40%",
      "confidence": 0.95,
      "evidence": ["performance metrics", "user feedback"]
    }
  ],
  "outcome": "Successfully migrated to JWT authentication with improved performance"
}
```

#### Link to Supporting Memories

Connect reasoning chains to relevant knowledge:

```json
{
  "sourceMemoryId": "auth_decision_chain",
  "targetMemoryId": "jwt_knowledge_base",
  "relationshipType": "references",
  "strength": 0.9
}
```

## Analytics and Optimization

### Memory Usage Analytics

Use `getMemoryAnalytics` to understand:

- **Type Distribution**: Which memory types are most common
- **Importance Patterns**: How importance is distributed
- **Access Patterns**: Which memories are most/least used
- **Growth Trends**: How your knowledge base is evolving

### Knowledge Graph Analytics

Monitor graph health:

- **Connection Density**: Average relationships per memory
- **Strong Connections**: High-value knowledge paths
- **Isolated Nodes**: Memories that need better integration
- **Relationship Types**: Balance of different relationship types

### Optimization Strategies

#### Memory Consolidation

Combine related memories when appropriate:

```json
{
  "content": "JWT Authentication Complete Guide: Includes token structure, security practices, implementation patterns, and refresh strategies",
  "memoryType": "knowledge",
  "importance": 0.95,
  "context": {
    "relatedMemories": [
      "jwt_basics",
      "jwt_security",
      "jwt_implementation",
      "jwt_refresh"
    ]
  }
}
```

#### Relationship Optimization

Strengthen important connections:

- Increase strength of validated relationships
- Add missing prerequisite relationships
- Create implementation examples for concepts

#### Importance Calibration

Regularly review and adjust importance:

- Increase importance of frequently accessed memories
- Decrease importance of outdated information
- Align importance with actual value

## Integration Patterns

### Session-Based Memory

Group related work:

```json
{
  "sessionId": "feature_auth_2024_01_15",
  "memories": [
    "Planning phase memories",
    "Implementation memories",
    "Testing memories",
    "Deployment memories"
  ]
}
```

### Domain-Specific Knowledge

Organize by expertise areas:

```json
{
  "domain": "backend_security",
  "topics": ["authentication", "authorization", "data_validation", "encryption"]
}
```

### Project-Specific Context

Maintain project boundaries:

```json
{
  "context": {
    "projectId": "ecommerce_platform",
    "component": "user_service",
    "domain": "user_management"
  }
}
```

This memory system provides the foundation for building truly intelligent AI assistants that learn, remember, and make connections across vast knowledge domains while maintaining context and supporting sophisticated reasoning processes.
