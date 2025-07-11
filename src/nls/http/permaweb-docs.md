# Permaweb Documentation NLS Specification

This Natural Language Service (NLS) specification defines how to intelligently query Permaweb ecosystem documentation via HTTP requests using content-based analysis rather than keyword matching.

## Documentation Sources

### Arweave Documentation
- **URL**: `https://fuel_permawebllms.permagate.io/arweave-llms.txt`
- **Content**: Arweave blockchain, transactions, wallets, GraphQL API, data storage, fees, mining

### AO Computer Documentation  
- **URL**: `https://fuel_permawebllms.permagate.io/ao-llms.txt`
- **Content**: AO processes, messages, compute, spawning, handlers, Lua programming, autonomous systems

### AR.IO Documentation
- **URL**: `https://fuel_permawebllms.permagate.io/ario-llms.txt`
- **Content**: AR.IO gateways, name system, infrastructure, DNS, network protocols

### HyperBEAM Documentation
- **URL**: `https://fuel_permawebllms.permagate.io/hyperbeam-llms.txt`
- **Content**: HyperBEAM distributed computing, infrastructure, processing

### Permaweb Glossary
- **URL**: `https://fuel_permawebllms.permagate.io/permaweb-glossary-llms.txt`
- **Content**: Definitions, terms, concepts, explanations, terminology

## Intelligent Query Classification

### Query Types

#### Definition Queries
- **Patterns**: 
  - "What is {term}?"
  - "Define {term}"
  - "What does {term} mean?"
  - "Explain {term}"
  - "{term} definition"
- **Strategy**: Fetch all documentation sources, prioritize glossary in results
- **Post-processing**: Look for definition-style content (starts with "X is...", bullet points, clear explanations)

#### How-To Queries
- **Patterns**:
  - "How do I {action}?"
  - "How to {action}"
  - "Steps to {action}"
  - "Guide for {action}"
  - "Tutorial on {action}"
- **Strategy**: Fetch all sources, prioritize tutorial and example content
- **Post-processing**: Look for step-by-step instructions, code examples, numbered lists

#### General Information Queries
- **Patterns**:
  - "Tell me about {topic}"
  - "Information on {topic}"
  - "{topic} overview"
  - "Learn about {topic}"
- **Strategy**: Comprehensive search across all sources
- **Post-processing**: Aggregate information from multiple sources for complete picture

#### Troubleshooting Queries
- **Patterns**:
  - "Why is {problem}?"
  - "Fix {issue}"
  - "Error with {topic}"
  - "Problem with {topic}"
- **Strategy**: Search all sources, prioritize error handling and troubleshooting content
- **Post-processing**: Look for error messages, solutions, common issues sections

## Content Analysis Strategy

### Default Approach: Fetch All Sources
- **Strategy**: For any permaweb-related query, fetch all 5 documentation sources
- **Reasoning**: Content-based analysis is more reliable than keyword guessing
- **Benefits**: Never miss relevant information due to poor keyword matching

### Post-Fetch Content Scoring
- **Relevance Scoring**: Analyze fetched content for query term frequency and context
- **Content Quality**: Prefer structured content (definitions, examples, clear explanations)
- **Source Ranking**: Rank results by relevance across all sources

### Result Presentation
- **Best Match First**: Present most relevant content first
- **Source Attribution**: Always indicate which documentation source provided the information
- **Comprehensive Coverage**: Include relevant information from multiple sources when available

## Query Classification Logic

### Detect Query Type
```javascript
function classifyQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Definition queries
  if (lowerQuery.match(/what is|define|meaning|explain/)) {
    return { type: 'definition', prioritizeGlossary: true };
  }
  
  // How-to queries  
  if (lowerQuery.match(/how to|how do|steps|guide|tutorial/)) {
    return { type: 'howto', prioritizeTutorials: true };
  }
  
  // Troubleshooting
  if (lowerQuery.match(/why|error|problem|fix|issue/)) {
    return { type: 'troubleshooting', prioritizeErrorContent: true };
  }
  
  // General information
  return { type: 'general', balanced: true };
}
```

### Fetch Strategy
```javascript
function getFetchStrategy(queryType) {
  // Always fetch all sources for comprehensive coverage
  return {
    sources: [
      'https://fuel_permawebllms.permagate.io/arweave-llms.txt',
      'https://fuel_permawebllms.permagate.io/ao-llms.txt', 
      'https://fuel_permawebllms.permagate.io/ario-llms.txt',
      'https://fuel_permawebllms.permagate.io/hyperbeam-llms.txt',
      'https://fuel_permawebllms.permagate.io/permaweb-glossary-llms.txt'
    ],
    concurrent: true,
    timeout: 30000
  };
}
```

## Examples

### Definition Query
- **Input**: "What is Arlink?"
- **Classification**: Definition query
- **Strategy**: Fetch all 5 sources
- **Post-processing**: Search all content for "arlink" or "Arlink", prioritize definition-style content
- **Result**: Present best definition found across all sources

### How-To Query  
- **Input**: "How do I create an Arweave transaction?"
- **Classification**: How-to query
- **Strategy**: Fetch all 5 sources
- **Post-processing**: Look for step-by-step instructions, code examples
- **Result**: Comprehensive guide compiled from relevant sources

### General Query
- **Input**: "Tell me about bundlers"
- **Classification**: General information query
- **Strategy**: Fetch all 5 sources  
- **Post-processing**: Aggregate all mentions of bundlers across sources
- **Result**: Comprehensive overview from multiple perspectives

This approach ensures no valid queries are missed due to keyword limitations while providing more intelligent, comprehensive responses.