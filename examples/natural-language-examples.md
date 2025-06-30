# Natural Language AO Workflow Examples

This document demonstrates how the enhanced markdown workflow system enables completely natural interaction with AO processes.

## How It Works

The new `aoMessageNL` tool combines:
1. **Markdown Documentation** - Human-readable workflow definitions
2. **Natural Language Processing** - AI extracts intent and parameters from casual requests
3. **Intelligent Parameter Mapping** - Automatic conversion to proper AO message format

## Token Workflow Examples

Using the markdown token workflow, here are natural language examples that work automatically:

### Balance Queries

**Natural Request:** `"check my balance"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "check my balance"
})
```
**AI Reasoning:**
- Detects "check" + "balance" keywords
- Maps to Balance action
- No Target parameter (defaults to sender)
- Constructs: `Action: Balance`

---

**Natural Request:** `"what's alice's balance?"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "what's alice's balance?"
})
```
**AI Reasoning:**
- Detects "balance" keyword
- Extracts "alice" as target address
- Maps to Balance action with Target parameter
- Constructs: `Action: Balance, Target: alice`

---

**Natural Request:** `"how many tokens does xyz123...def456 have?"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "how many tokens does xyz123...def456 have?"
})
```
**AI Reasoning:**
- Understands this is a balance query
- Extracts full process ID as target
- Constructs: `Action: Balance, Target: xyz123...def456`

### Token Transfers

**Natural Request:** `"transfer 100 tokens to alice"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "transfer 100 tokens to alice"
})
```
**AI Reasoning:**
- Detects "transfer" keyword
- Extracts "100" as amount, converts to smallest units (100 * 10^12)
- Extracts "alice" as recipient
- Constructs: `Action: Transfer, Recipient: alice, Quantity: 100000000000000`

---

**Natural Request:** `"send 50.5 tokens to bob"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "send 50.5 tokens to bob"
})
```
**AI Reasoning:**
- Detects "send" as transfer keyword
- Handles decimal amounts: 50.5 * 10^12
- Extracts "bob" as recipient
- Constructs: `Action: Transfer, Recipient: bob, Quantity: 50500000000000`

---

**Natural Request:** `"move 1000 tokens to abc123...xyz789"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "move 1000 tokens to abc123...xyz789"
})
```
**AI Reasoning:**
- Detects "move" as transfer synonym
- Extracts large amount and full address
- Constructs: `Action: Transfer, Recipient: abc123...xyz789, Quantity: 1000000000000000`

### Token Information

**Natural Request:** `"what is this token?"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "what is this token?"
})
```
**AI Reasoning:**
- Detects "what is" + "token" as info request
- Maps to Info action
- Constructs: `Action: Info`

---

**Natural Request:** `"token details"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "token details"
})
```
**AI Reasoning:**
- Detects "details" keyword for info
- Constructs: `Action: Info`

### Minting (Owner Operations)

**Natural Request:** `"mint 1000 tokens"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "mint 1000 tokens"
})
```
**AI Reasoning:**
- Detects "mint" keyword
- Extracts amount and converts to smallest units
- No target specified (defaults to sender)
- Constructs: `Action: Mint, Quantity: 1000000000000000`

---

**Natural Request:** `"create 500 tokens for alice"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "create 500 tokens for alice"
})
```
**AI Reasoning:**
- Detects "create" as mint synonym
- Extracts amount and target recipient
- Constructs: `Action: Mint, Quantity: 500000000000000, Target: alice`

### Burning Tokens

**Natural Request:** `"burn 100 tokens"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "burn 100 tokens"
})
```
**AI Reasoning:**
- Detects "burn" keyword
- Extracts amount to destroy
- Constructs: `Action: Burn, Quantity: 100000000000000`

---

**Natural Request:** `"destroy 25 tokens from supply"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "destroy 25 tokens from supply"
})
```
**AI Reasoning:**
- Detects "destroy" as burn synonym
- Ignores "from supply" (contextual understanding)
- Constructs: `Action: Burn, Quantity: 25000000000000`

### Allowance Management

**Natural Request:** `"approve alice to spend 100 tokens"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "approve alice to spend 100 tokens"
})
```
**AI Reasoning:**
- Detects "approve" keyword
- Extracts "alice" as spender
- Extracts "100" as allowance amount
- Constructs: `Action: Approve, Spender: alice, Quantity: 100000000000000`

---

**Natural Request:** `"allow bob to use 500 tokens"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "allow bob to use 500 tokens"
})
```
**AI Reasoning:**
- Detects "allow" as approve synonym
- Maps "use" to spending permission
- Constructs: `Action: Approve, Spender: bob, Quantity: 500000000000000`

---

**Natural Request:** `"check allowance from alice to bob"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "check allowance from alice to bob"
})
```
**AI Reasoning:**
- Detects "allowance" keyword
- Extracts "from alice" as owner
- Extracts "to bob" as spender
- Constructs: `Action: Allowance, Owner: alice, Spender: bob`

---

**Natural Request:** `"how much can carol spend from dave?"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "how much can carol spend from dave?"
})
```
**AI Reasoning:**
- Understands this as allowance query
- Maps "carol spend" to spender
- Maps "from dave" to owner
- Constructs: `Action: Allowance, Owner: dave, Spender: carol`

### Complex Transfer Operations

**Natural Request:** `"transfer 100 tokens from alice to bob"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "transfer 100 tokens from alice to bob"
})
```
**AI Reasoning:**
- Detects "transfer from" pattern (TransferFrom action)
- Extracts "alice" as source (From parameter)
- Extracts "bob" as destination (To parameter)
- Extracts amount
- Constructs: `Action: TransferFrom, From: alice, To: bob, Quantity: 100000000000000`

---

**Natural Request:** `"spend 50 tokens from carol for dave"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "spend 50 tokens from carol for dave"
})
```
**AI Reasoning:**
- Detects "spend from" pattern
- Maps to TransferFrom action
- Constructs: `Action: TransferFrom, From: carol, To: dave, Quantity: 50000000000000`

## Advanced Natural Language Features

### Conversational Context

The system handles conversational patterns:

**User:** `"I want to send some tokens"`
**AI:** `"I can help with that. How many tokens and to which address?"`

**User:** `"100 to alice"`
```
aoMessageNL({
  markdownWorkflow: tokenWorkflowMarkdown,
  request: "100 to alice"
})
```
**AI Reasoning:**
- Uses previous context to understand this is a transfer
- Constructs complete transfer message

### Flexible Address Formats

The system handles various address formats:
- **Names:** alice, bob, carol
- **Full IDs:** abc123def456ghi789jkl012mno345pqr678stu90xyz
- **Abbreviated:** xyz123...def456
- **Mixed:** Send to alice or abc123...

### Smart Amount Parsing

- **Integers:** `"100 tokens"` → `100000000000000`
- **Decimals:** `"50.5 tokens"` → `50500000000000`
- **Large numbers:** `"1000000 tokens"` → `1000000000000000000`
- **Context clues:** `"all my tokens"` (would need balance query first)

### Error Handling

**Invalid Request:** `"make me rich"`
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

**Missing Process ID:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PROCESS_ID",
    "message": "Process ID not specified in workflow or parameters"
  }
}
```

## Integration Examples

### Complete Interaction Flow

```javascript
// 1. User makes natural request
const request = "transfer 100 tokens to alice";

// 2. Load workflow (could be from memory)
const workflow = await fs.readFile('token-workflow.md', 'utf8');

// 3. Execute with natural language
const result = await aoMessageNL({
  markdownWorkflow: workflow,
  request: request,
  processId: "your-token-process-id"
});

// 4. Get natural response
console.log(result);
// {
//   "success": true,
//   "data": "Transfer successful - 100000000000000 tokens sent to alice",
//   "executionTime": 2340,
//   "reasoningChain": [
//     "Analyzing user request: \"transfer 100 tokens to alice\"",
//     "Detected action: Transfer",
//     "Extracted recipient/target: alice",
//     "Extracted amount: 100 tokens = 100000000000000 smallest units"
//   ]
// }
```

### Workflow Reuse

```javascript
// Store the workflow once
await storeWorkflowDefinition({
  workflowDefinition: markdownWorkflow
});

// Later, search and use
const workflows = await searchWorkflowDefinitions({
  query: "token transfer"
});

const tokenWorkflow = JSON.parse(workflows).workflowDefinitions[0];

// Use with natural language
await aoMessageNL({
  markdownWorkflow: tokenWorkflow,
  request: "check my balance"
});
```

This natural language system transforms AO interaction from technical message construction to conversational requests, making blockchain operations as intuitive as talking to a human assistant.