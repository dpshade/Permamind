# Enhanced Markdown Workflow System

Permamind now features an advanced natural language workflow system that makes AO interaction as intuitive as talking to a human assistant. Instead of constructing complex JSON parameters, you can simply describe what you want to do in plain English.

## Revolution in AO Interaction

### Before: Complex JSON Construction
```javascript
await aoMessage({
  workflowDefinition: JSON.stringify({
    "handlers": [{"name": "Transfer", "messageSchema": {"tags": [...]}}]
  }),
  handler: "Transfer",
  parameters: JSON.stringify({
    "Recipient": "alice",
    "Quantity": "100000000000000"
  }),
  processId: "token-process-id"
});
```

### Now: Natural Language Requests
```javascript
await aoMessageNL({
  markdownWorkflow: "# Token Workflow\n...", // Human-readable documentation
  request: "transfer 100 tokens to alice"     // Natural language
});
```

## How It Works

### 1. Markdown Documentation
Workflows are now written as human-readable markdown documentation that describes:
- Available actions and what they do
- Parameter mapping and examples
- Natural language patterns
- Response handling

### 2. AI-Powered Parameter Extraction
The system uses advanced AI reasoning to:
- Parse workflow documentation like a human would
- Extract intent from natural language requests
- Map casual phrases to technical parameters
- Handle various formats and synonyms

### 3. Intelligent Message Construction
The AI automatically:
- Determines the correct AO action
- Extracts addresses, amounts, and other parameters
- Converts units (e.g., "100 tokens" → "100000000000000" smallest units)
- Constructs proper AO message format

## Core Tools

### `aoMessageNL` - Natural Language AO Interaction
**Primary tool for AI-driven AO interaction using markdown workflows.**

**Parameters:**
- `markdownWorkflow` - Human-readable workflow documentation
- `request` - Natural language description of what you want to do
- `processId` - Optional process ID override
- `storeAsMemory` - Whether to save interaction (default: true)

**Examples:**
```javascript
// Token transfer
await aoMessageNL({
  markdownWorkflow: tokenWorkflowDoc,
  request: "send 50 tokens to bob"
});

// Balance check
await aoMessageNL({
  markdownWorkflow: tokenWorkflowDoc,
  request: "what's alice's balance?"
});

// Token approval
await aoMessageNL({
  markdownWorkflow: tokenWorkflowDoc,
  request: "approve carol to spend 200 tokens"
});
```

### Legacy Support
The original `aoMessage` tool remains available for users who prefer JSON-based workflows.

## Markdown Workflow Format

### Structure
```markdown
# Workflow Name
**Process ID:** `process-id-here`
**Category:** Finance
**Network:** AO

Brief description of what this process does.

## Actions

### ActionName
**Description:** What this action does.

**AO Message Format:**
- Action: `ActionName`
- Parameter1: `[value]` - Description
- Parameter2: `[value]` - Description

**Natural Language Examples:**
- "example request" → Action: ActionName, Parameter1: value
- "another example" → Action: ActionName, Parameter2: value

**Expected Responses:**
- Success: "Success message format"
- Error: "Error1" | "Error2"

**Parameter Mapping:**
- User says "pattern" → maps to Parameter1
- User says "amount" → maps to Parameter2 with unit conversion
```

### Key Features

#### Smart Parameter Detection
```markdown
**Parameter Mapping:**
- User says "to [address]" → maps to Recipient tag
- User says "[number] tokens" → maps to Quantity tag (convert to wei)
- User says "transfer/send/move" → maps to Transfer action
```

#### Unit Conversion
```markdown
**Decimals:** 12
**Unit Conversion:** When user says "100 tokens", convert to "100000000000000"
```

#### Flexible Address Formats
```markdown
**Common Address Formats:**
- Full AO process ID: 43-character alphanumeric string
- Short names: "alice", "bob", "carol"
- Partial IDs: "xyz123..." format
```

## Advanced Natural Language Features

### Context Understanding
The AI understands various ways to express the same intent:

**Transfer Variations:**
- "transfer 100 tokens to alice"
- "send 100 to alice"
- "move 100 tokens to alice"
- "give alice 100 tokens"

**Balance Queries:**
- "check my balance"
- "what's my balance?"
- "how many tokens do I have?"
- "balance check"

### Smart Amount Parsing
- **Integers:** "100 tokens" → properly converted to smallest units
- **Decimals:** "50.5 tokens" → handles fractional amounts
- **Large numbers:** "1000000 tokens" → manages big values correctly

### Address Recognition
- **Names:** alice, bob, carol (common test names)
- **Full Process IDs:** 43-character AO addresses
- **Abbreviated:** xyz123...def456 format
- **Mixed formats:** Handles any combination

### Error Handling with Context
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_PARSE_REQUEST",
    "message": "Could not determine action from user request",
    "details": {
      "userRequest": "make me rich",
      "reasoningChain": [
        "Analyzing user request: \"make me rich\"",
        "Could not detect action from user request"
      ]
    }
  }
}
```

## Workflow Creation Best Practices

### 1. Write for Humans First
Create workflows as documentation that humans can read and understand:

```markdown
### Transfer
**Description:** Send tokens from your address to another address.

This action moves tokens from your wallet to someone else's wallet.
The recipient must have a valid AO address.
```

### 2. Include Rich Examples
Provide diverse natural language examples:

```markdown
**Natural Language Examples:**
- "transfer 100 tokens to alice"
- "send 50.5 tokens to bob"
- "move 1000 tokens to abc123...xyz789"
- "give carol 25 tokens"
```

### 3. Clear Parameter Mapping
Explain how natural language maps to technical parameters:

```markdown
**Parameter Mapping:**
- User says "to [address]" → maps to Recipient tag
- User says "[number] tokens" → maps to Quantity tag (convert to smallest units)
- User says "transfer/send/move/give" → maps to Transfer action
```

### 4. Handle Edge Cases
Document common variations and edge cases:

```markdown
**Address Formats:**
- Names: alice, bob, carol
- Full IDs: 43-character process IDs
- Abbreviated: xyz123...def456
```

## Integration Examples

### Complete Token Workflow
```javascript
// Natural language interaction with comprehensive token workflow
const tokenWorkflow = await fs.readFile('token-workflow.md', 'utf8');

// Users can make natural requests
const requests = [
  "check my balance",
  "transfer 100 tokens to alice", 
  "approve bob to spend 500 tokens",
  "what's carol's balance?",
  "mint 1000 tokens",
  "burn 50 tokens"
];

for (const request of requests) {
  const result = await aoMessageNL({
    markdownWorkflow: tokenWorkflow,
    request: request,
    processId: "your-token-process-id"
  });
  
  console.log(`Request: ${request}`);
  console.log(`Result: ${JSON.stringify(result.data)}`);
  console.log(`Reasoning: ${result.reasoningChain?.join(' → ')}`);
}
```

### Workflow Storage and Reuse
```javascript
// Store markdown workflow for reuse
await storeWorkflowDefinition({
  workflowDefinition: markdownWorkflow
});

// Later, search and use
const workflows = await searchWorkflowDefinitions({
  query: "token transfer balance"
});

const workflow = workflows.workflowDefinitions[0];

// Use with natural language
await aoMessageNL({
  markdownWorkflow: workflow,
  request: "send 100 tokens to alice"
});
```

### Cross-Process Interaction
```javascript
// Different workflows for different processes
const tokenWorkflow = await loadWorkflow('token-workflow.md');
const dexWorkflow = await loadWorkflow('dex-workflow.md');
const gameWorkflow = await loadWorkflow('game-workflow.md');

// Natural language works across all workflows
await aoMessageNL({
  markdownWorkflow: tokenWorkflow,
  request: "check my token balance"
});

await aoMessageNL({
  markdownWorkflow: dexWorkflow,
  request: "swap 100 tokens for ETH"
});

await aoMessageNL({
  markdownWorkflow: gameWorkflow,
  request: "buy a sword for 50 tokens"
});
```

## Benefits

### For Users
- **Natural Interaction:** Talk to AO like a human assistant
- **No Technical Knowledge Required:** No need to understand AO message formats
- **Flexible Input:** Multiple ways to express the same request
- **Intelligent Conversion:** Automatic unit and format conversion

### For Developers
- **Documentation as Code:** Workflows are executable documentation
- **AI-Native Design:** Leverages LLM strengths in natural language
- **Rapid Prototyping:** Quick workflow creation and testing
- **Community Sharing:** Human-readable workflows are easy to share

### For the Ecosystem
- **Lower Barrier to Entry:** Makes AO accessible to non-technical users
- **Rapid Adoption:** New processes supported instantly with markdown docs
- **Knowledge Sharing:** Workflows become community documentation
- **AI Enhancement:** System improves through usage and feedback

## Migration Path

### From JSON to Markdown
Existing JSON workflows can be converted to markdown format:

1. **Extract Core Information:** Pull out process metadata and handler definitions
2. **Create Human-Readable Descriptions:** Write clear explanations of each action
3. **Add Natural Language Examples:** Include diverse usage examples
4. **Define Parameter Mapping:** Explain how natural language maps to parameters
5. **Test with Natural Requests:** Verify the AI can parse your documentation

### Gradual Adoption
- Both `aoMessage` (JSON) and `aoMessageNL` (Markdown) tools are available
- Existing workflows continue to work unchanged
- New workflows can use the enhanced markdown format
- Gradual migration as workflows are updated

This enhanced markdown workflow system represents a fundamental shift toward more natural, AI-driven blockchain interaction, making AO processes accessible through conversational interfaces while maintaining the full power and flexibility of the underlying technology.