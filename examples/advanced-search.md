# Advanced Search Patterns Tutorial

Master sophisticated memory retrieval techniques using Permamind's advanced search capabilities.

## Prerequisites

- Completed [Basic Memory Operations](./basic-memory.md) tutorial
- Have at least 10-15 memories stored in your system
- Understanding of memory types and importance scoring

## Tutorial Overview

This tutorial covers:

1. Enhanced memory storage with metadata
2. Advanced filtering techniques
3. Search ranking strategies
4. Faceted search capabilities
5. Time-based and domain-specific searches
6. Complex query patterns

## Step 1: Create Rich Memories for Search

First, let's create some enhanced memories with rich metadata to search against.

### Store Enhanced Memories

**Prompt**: "Use addMemoryEnhanced to store these memories with rich metadata:

1. A high-importance knowledge memory about JWT authentication with tags for security and web development
2. A procedure memory about database optimization with medium importance
3. A reasoning memory about choosing React over Vue with your decision process"

**Example Enhanced Memory**:

```json
{
  "content": "JWT (JSON Web Tokens) provide stateless authentication by encoding user information in a cryptographically signed token. Key benefits: no server-side session storage, scalable across microservices, mobile-friendly. Security considerations: use HTTPS, short expiration times, secure secret management.",
  "importance": 0.9,
  "memoryType": "knowledge",
  "context": {
    "sessionId": "auth_research_2024",
    "topic": "authentication",
    "domain": "web_development"
  },
  "metadata": {
    "tags": ["jwt", "authentication", "security", "stateless", "tokens"],
    "source": "research_session",
    "confidence": 0.95
  },
  "p": "your_wallet_address"
}
```

### Store Different Memory Types

Create memories of different types to see how filtering works:

**Knowledge Memory**:

- Topic: Database indexing strategies
- Importance: 0.8
- Tags: ["database", "performance", "indexing"]

**Procedure Memory**:

- Topic: Code review process
- Importance: 0.7
- Tags: ["process", "code-quality", "team"]

**Reasoning Memory**:

- Topic: Architecture decision for microservices
- Importance: 0.8
- Tags: ["architecture", "microservices", "decision"]

## Step 2: Basic Advanced Search

### Search by Memory Type

**Prompt**: "Use searchMemoriesAdvanced to find all knowledge-type memories"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "memoryType": "knowledge"
  }
}
```

**What This Does**:

- Searches all memories (`"*"` query)
- Filters to only show knowledge-type memories
- Returns structured results with metadata

### Search by Importance Threshold

**Prompt**: "Find all memories with importance above 0.8"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "importanceThreshold": 0.8
  }
}
```

## Step 3: Combined Filters

### Multi-Filter Search

**Prompt**: "Search for security-related knowledge with high importance"

**Tool Parameters**:

```json
{
  "query": "security authentication",
  "filters": {
    "memoryType": "knowledge",
    "importanceThreshold": 0.7,
    "tags": ["security"]
  }
}
```

### Domain-Specific Search

**Prompt**: "Find all web development memories about authentication"

**Tool Parameters**:

```json
{
  "query": "authentication",
  "filters": {
    "domain": "web_development",
    "memoryType": ["knowledge", "procedure"]
  }
}
```

## Step 4: Search Ranking Strategies

### Importance-Based Ranking

**Prompt**: "Search for 'database' memories ranked by importance"

**Tool Parameters**:

```json
{
  "query": "database",
  "filters": {
    "importanceThreshold": 0.5
  },
  "ranking": "importance"
}
```

**Result**: Shows highest-importance database memories first

### Recency-Based Ranking

**Prompt**: "Search for recent memories about development practices"

**Tool Parameters**:

```json
{
  "query": "development practices",
  "ranking": "recency"
}
```

**Result**: Shows newest memories first

### Access-Based Ranking

**Prompt**: "Find frequently accessed memories about performance"

**Tool Parameters**:

```json
{
  "query": "performance",
  "ranking": "access"
}
```

**Result**: Shows most-accessed performance memories first

## Step 5: Time-Based Searches

### Recent Memories

**Prompt**: "Find memories created in the last week"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "timeRange": {
      "start": "2024-01-08T00:00:00Z",
      "end": "2024-01-15T23:59:59Z"
    }
  }
}
```

### Session-Specific Search

**Prompt**: "Find all memories from my authentication research session"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "sessionId": "auth_research_2024"
  }
}
```

## Step 6: Tag-Based Search Patterns

### Single Tag Filter

**Prompt**: "Find all memories tagged with 'security'"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "tags": ["security"]
  }
}
```

### Multiple Tag Filter (AND)

**Prompt**: "Find memories tagged with both 'security' AND 'web'"

**Tool Parameters**:

```json
{
  "query": "*",
  "filters": {
    "tags": ["security", "web"]
  }
}
```

### Complex Tag Combinations

**Prompt**: "Find high-importance security or performance memories"

**Tool Parameters**:

```json
{
  "query": "security OR performance",
  "filters": {
    "importanceThreshold": 0.7,
    "tags": ["security"]
  }
}
```

## Step 7: Advanced Query Patterns

### Keyword Expansion

**Prompt**: "Search for authentication concepts using related terms"

**Tool Parameters**:

```json
{
  "query": "authentication login signin jwt oauth",
  "filters": {
    "memoryType": "knowledge",
    "importanceThreshold": 0.6
  }
}
```

### Negative Filtering

Find memories that match criteria but exclude certain types:

**Prompt**: "Find development memories but exclude conversation type"

**Tool Parameters**:

```json
{
  "query": "development",
  "filters": {
    "domain": "web_development"
  }
}
```

_Note: Then manually filter out conversation types from results_

### Context-Aware Search

**Prompt**: "Find memories related to current project architecture decisions"

**Tool Parameters**:

```json
{
  "query": "architecture decision microservices",
  "filters": {
    "memoryType": ["reasoning", "knowledge"],
    "importanceThreshold": 0.7,
    "domain": "system_architecture"
  },
  "ranking": "importance"
}
```

## Step 8: Search Result Analysis

### Understanding Search Response

Advanced search returns rich information:

```json
{
  "success": true,
  "memories": [...],
  "query": "authentication security",
  "resultCount": 8,
  "facets": {
    "memoryTypes": {
      "knowledge": 5,
      "procedure": 2,
      "reasoning": 1
    },
    "domains": {
      "web_development": 6,
      "mobile_development": 2
    },
    "importanceRange": {
      "0.7-0.8": 3,
      "0.8-0.9": 4,
      "0.9-1.0": 1
    }
  }
}
```

**Facets Help You**:

- Understand result distribution
- Refine searches with additional filters
- Identify knowledge gaps

### Using Facets for Refinement

If facets show:

- Many low-importance results → Increase `importanceThreshold`
- Mixed domains → Add domain filter
- Mostly one memory type → Expand or narrow type filter

## Step 9: Complex Search Scenarios

### Scenario 1: Learning Research

"I want to find all high-quality knowledge about a topic I'm learning"

**Prompt**: "Find comprehensive knowledge about React development patterns"

**Tool Parameters**:

```json
{
  "query": "React patterns components hooks state",
  "filters": {
    "memoryType": "knowledge",
    "importanceThreshold": 0.8,
    "domain": "web_development"
  },
  "ranking": "importance",
  "limit": 10
}
```

### Scenario 2: Project Context

"I need all memories related to my current authentication project"

**Tool Parameters**:

```json
{
  "query": "authentication jwt security",
  "filters": {
    "sessionId": "auth_project_2024",
    "memoryType": ["knowledge", "procedure", "reasoning"],
    "importanceThreshold": 0.6
  },
  "ranking": "recency"
}
```

### Scenario 3: Problem Solving

"I'm debugging a performance issue and need relevant memories"

**Tool Parameters**:

```json
{
  "query": "performance optimization database slow",
  "filters": {
    "memoryType": ["knowledge", "procedure", "enhancement"],
    "tags": ["performance", "database"],
    "importanceThreshold": 0.7
  },
  "ranking": "relevance"
}
```

### Scenario 4: Code Review Preparation

"I need to review best practices before a code review"

**Tool Parameters**:

```json
{
  "query": "best practices code quality standards",
  "filters": {
    "memoryType": ["knowledge", "procedure"],
    "domain": "software_development",
    "importanceThreshold": 0.8
  },
  "ranking": "importance"
}
```

## Step 10: Search Optimization Techniques

### 1. Start Broad, Then Narrow

```json
// First search - broad
{
  "query": "database",
  "limit": 20
}

// Analyze facets, then narrow
{
  "query": "database optimization performance",
  "filters": {
    "memoryType": "enhancement",
    "importanceThreshold": 0.7
  }
}
```

### 2. Use Multiple Search Strategies

- **Keyword search** for discovery
- **Filter search** for precision
- **Tag search** for categorization
- **Session search** for context

### 3. Leverage Ranking for Different Needs

- **Relevance**: General exploration
- **Importance**: Finding authoritative information
- **Recency**: Current project context
- **Access**: Popular/useful information

## Common Search Patterns

### Pattern 1: Expert Knowledge Lookup

```json
{
  "query": "topic_keywords",
  "filters": {
    "memoryType": "knowledge",
    "importanceThreshold": 0.8
  },
  "ranking": "importance"
}
```

### Pattern 2: How-To Procedures

```json
{
  "query": "implementation_keywords",
  "filters": {
    "memoryType": "procedure",
    "importanceThreshold": 0.6
  },
  "ranking": "relevance"
}
```

### Pattern 3: Recent Context

```json
{
  "query": "project_keywords",
  "filters": {
    "sessionId": "current_session",
    "timeRange": {
      "start": "recent_date"
    }
  },
  "ranking": "recency"
}
```

### Pattern 4: Cross-Reference Research

```json
{
  "query": "broad_topic",
  "filters": {
    "memoryType": ["knowledge", "reasoning"],
    "importanceThreshold": 0.7,
    "domain": "target_domain"
  },
  "ranking": "relevance"
}
```

## Troubleshooting Search Issues

### Issue: Too Many Results

**Solutions**:

- Increase `importanceThreshold`
- Add more specific filters
- Use more specific keywords
- Limit to specific memory types

### Issue: Too Few Results

**Solutions**:

- Lower `importanceThreshold`
- Remove restrictive filters
- Use broader keywords
- Check memory type filters

### Issue: Irrelevant Results

**Solutions**:

- Use more specific queries
- Add domain filters
- Use tag filters
- Improve memory tagging

### Issue: Missing Expected Results

**Solutions**:

- Check if memories actually exist
- Verify filter criteria
- Try broader search terms
- Check spelling and terminology

## Best Practices

### 1. Consistent Tagging Strategy

- Use standardized tag vocabularies
- Tag memories when creating them
- Create tag hierarchies (general → specific)

### 2. Meaningful Memory Types

- Choose appropriate memory types
- Be consistent in type assignment
- Use type filters effectively

### 3. Importance Calibration

- Regularly review importance scores
- Align importance with actual value
- Use importance for quality filtering

### 4. Rich Context Information

- Include domain information
- Use descriptive session IDs
- Add topic classification

## Practice Exercises

### Exercise 1: Multi-Stage Search

1. Search broadly for "authentication"
2. Analyze facets to understand result distribution
3. Refine with specific filters based on facets
4. Use different ranking strategies on the same query

### Exercise 2: Comparative Analysis

1. Search for memories about two competing technologies
2. Use filters to compare by memory type
3. Analyze importance distributions
4. Look for reasoning memories about choices

### Exercise 3: Project Memory Audit

1. Search for all memories from a recent project
2. Analyze memory type distribution
3. Identify knowledge gaps
4. Find the most important insights

## Next Steps

Now that you've mastered advanced search, explore:

1. **[Knowledge Graph Building](./knowledge-graph.md)** - Connect related memories
2. **[Token Operations](./token-operations.md)** - AO process integration
3. **Memory Analytics** - Understand usage patterns

## Summary

You've learned to:

- ✅ Use complex filters for precise memory retrieval
- ✅ Apply different ranking strategies for various needs
- ✅ Combine multiple search criteria effectively
- ✅ Analyze search results using facets
- ✅ Optimize search strategies for different scenarios
- ✅ Troubleshoot common search issues

Advanced search capabilities make Permamind a powerful knowledge management system, allowing you to find exactly the information you need when you need it.
