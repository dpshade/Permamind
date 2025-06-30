# Dynamic AO Workflow Support

Permamind now supports dynamic interaction with ANY AO process through workflow definitions. Instead of requiring hardcoded tools for each AO process, you can define how to interact with any process and use the universal `aoMessage` tool.

## Key Concepts

### Workflow Definitions

A workflow definition is a JSON structure that describes:

- Process metadata (ID, name, description)
- Available handlers and their message formats
- Response patterns and processing rules
- Capabilities and requirements

### Universal AO Tool

The `aoMessage` tool can send messages to any AO process by:

1. Taking a workflow definition that describes the process
2. Using AI reasoning to construct the proper message format
3. Handling responses according to the workflow specification

## Core Tools

### 1. `aoMessage` - Universal AO Interaction

Send messages to any AO process using workflow definitions.

**Parameters:**

- `workflowDefinition` (required): JSON string with the process definition
- `handler` (required): Name of the handler/action to invoke
- `parameters` (optional): JSON string or value with handler parameters
- `processId` (optional): Override process ID
- `data` (optional): Data payload if required
- `timeout` (optional): Timeout in milliseconds
- `priority` (optional): Message priority (low/medium/high)
- `storeAsMemory` (optional): Store interaction as memory (default: true)

### 2. `storeWorkflowDefinition` - Save Process Definitions

Store workflow definitions in Permamind's memory for reuse.

**Parameters:**

- `workflowDefinition` (required): Complete JSON workflow definition

### 3. `searchWorkflowDefinitions` - Find Stored Definitions

Search for stored workflow definitions by name, capability, or category.

**Parameters:**

- `query` (required): Search terms

## Workflow Definition Structure

```typescript
interface WorkflowDefinition {
  // Basic metadata
  id: string; // Unique identifier
  name: string; // Human-readable name
  description: string; // What the process does
  version: string; // Version number
  processId: string; // AO process ID

  // Classification
  capabilities: string[]; // What it can do
  category: string; // Process category
  tags: string[]; // Search tags

  // Handlers define available actions
  handlers: AOHandlerDefinition[];

  // Optional metadata
  documentation?: {
    website?: string;
    github?: string;
    docs?: string;
  };
  verification?: {
    codeVerified: boolean;
    riskLevel: "low" | "medium" | "high";
    permissions: string[];
  };
}
```

### Handler Definition Structure

```typescript
interface AOHandlerDefinition {
  name: string; // Handler name (e.g., "Transfer")
  description: string; // What it does
  messageSchema: {
    action: string; // AO Action tag value
    tags: AOTag[]; // Required/optional tags
    data?: {
      // Data requirements
      required: boolean;
      format: "string" | "json" | "lua";
      description: string;
    };
    examples?: Array<{
      // Usage examples
      description: string;
      tags: { name: string; value: string }[];
      data?: string;
      expectedResponse?: string;
    }>;
  };
  responsePatterns: AOResponsePattern[];
  capabilities: string[];
  rateLimit?: {
    requestsPerMinute: number;
  };
}
```

## Usage Examples

### Example 1: Token Transfer

```javascript
// Workflow definition for a token process
const tokenWorkflow = {
  id: "my-token-v1",
  name: "My AO Token",
  description: "Standard AO token with transfer capabilities",
  version: "1.0.0",
  processId: "your-token-process-id-here",
  capabilities: ["token-transfer", "balance-query"],
  category: "finance",
  tags: ["token", "currency"],
  network: "ao",
  handlers: [
    {
      name: "Transfer",
      description: "Transfer tokens to another address",
      messageSchema: {
        action: "Transfer",
        tags: [
          { name: "Action", value: "Transfer", required: true },
          {
            name: "Recipient",
            value: "",
            required: true,
            description: "Recipient address",
          },
          {
            name: "Quantity",
            value: "",
            required: true,
            description: "Amount to transfer",
          },
        ],
      },
      responsePatterns: [
        {
          messageType: "success",
          format: { structured: false, dataType: "string" },
        },
      ],
      capabilities: ["token-transfer"],
    },
  ],
};

// Use aoMessage tool to transfer tokens
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Transfer",
  parameters: JSON.stringify({
    Recipient: "target-address-here",
    Quantity: "100",
  }),
});
```

### Example 2: Social Hub Message

```javascript
// Velocity Protocol hub workflow
const socialHubWorkflow = {
  id: "velocity-hub-v1",
  name: "Social Hub",
  processId: "hub-process-id-here",
  handlers: [
    {
      name: "Event",
      description: "Post a social message",
      messageSchema: {
        action: "Event",
        tags: [
          { name: "Action", value: "Event", required: true },
          { name: "Kind", value: "1", required: true },
          {
            name: "Content",
            value: "",
            required: true,
            description: "Message content",
          },
        ],
      },
      capabilities: ["social-posting"],
    },
  ],
};

// Post a message
await aoMessage({
  workflowDefinition: JSON.stringify(socialHubWorkflow),
  handler: "Event",
  parameters: JSON.stringify({
    Content: "Hello from Permamind!",
  }),
});
```

### Example 3: Store and Reuse Workflow Definition

```javascript
// First, store the workflow definition
await storeWorkflowDefinition({
  workflowDefinition: JSON.stringify(tokenWorkflow),
});

// Later, search for it
const searchResults = await searchWorkflowDefinitions({
  query: "token",
});

// Extract workflow definition from search results
const storedWorkflow = JSON.parse(searchResults).workflowDefinitions[0];

// Use it with aoMessage
await aoMessage({
  workflowDefinition: JSON.stringify(storedWorkflow),
  handler: "Balance",
  parameters: "{}",
});
```

## AI Reasoning Process

When you use the `aoMessage` tool, the AI goes through this process:

1. **Parse Workflow Definition**: Understand the process capabilities and handlers
2. **Select Handler**: Match user request to appropriate handler
3. **Construct Message**: Build AO message tags based on handler schema
4. **Parameter Mapping**: Map user parameters to required tags
5. **Send Message**: Use existing AO infrastructure to send message
6. **Process Response**: Format response according to workflow patterns
7. **Store Memory**: Optionally store the interaction for future reference

## Benefits

### For Users

- **Universal**: Interact with any AO process without waiting for hardcoded tools
- **Flexible**: AI adapts to different message formats automatically
- **Discoverable**: Search and reuse workflow definitions
- **Memorable**: All interactions stored as memories

### For Developers

- **Extensible**: Support new AO processes instantly with workflow definitions
- **Maintainable**: Single tool instead of many process-specific tools
- **Collaborative**: Share workflow definitions across the network
- **AI-Enhanced**: Leverage Claude's reasoning vs manual coding

## Advanced Features

### Response Processing

Workflow definitions can specify how to parse and format responses:

```javascript
"responsePatterns": [
  {
    "messageType": "data",
    "format": {
      "structured": true,
      "dataType": "json",
      "parser": "Extract balance from response"
    }
  }
]
```

### Error Handling

Define expected error codes and handling:

```javascript
"responsePatterns": [
  {
    "messageType": "error",
    "indicators": {
      "errorCodes": ["Insufficient-Balance", "Invalid-Recipient"]
    }
  }
]
```

### Rate Limiting

Specify rate limits for responsible usage:

```javascript
"rateLimit": {
  "requestsPerMinute": 60,
  "cooldownMs": 1000
}
```

## Best Practices

1. **Start Simple**: Begin with basic handlers, add complexity gradually
2. **Include Examples**: Provide clear examples in workflow definitions
3. **Document Thoroughly**: Good descriptions help AI reasoning
4. **Test Patterns**: Verify response patterns work as expected
5. **Version Control**: Update version numbers when changing definitions
6. **Share Definitions**: Store useful workflows for community reuse

## Integration with Existing Permamind Features

- **Memory System**: All interactions automatically stored as memories
- **Workflow Discovery**: Integrates with existing workflow search tools
- **Performance Tracking**: Tracks success rates and response times
- **Enhancement Engine**: Can suggest improvements to workflow definitions

This dynamic AO workflow support transforms Permamind into a universal AO interaction platform, making it easy to work with any AO process through AI-driven message construction.
