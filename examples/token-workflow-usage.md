# Token Process Workflow Usage Examples

This document shows practical examples of how to use the AO Standard Token workflow definition with Permamind's `aoMessage` tool.

## Setup

First, you'll need to update the workflow definition with your actual token process ID:

```json
{
  "processId": "your-actual-token-process-id-here"
}
```

## Basic Token Operations

### 1. Check Token Information

Get comprehensive metadata about the token:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Info",
  parameters: "{}",
});
```

**Expected Response:**

```json
{
  "name": "My AO Token",
  "symbol": "MAT",
  "decimals": 12,
  "totalSupply": "1000000000000000000",
  "owner": "owner-address-here"
}
```

### 2. Check Your Balance

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Balance",
  parameters: "{}",
});
```

**Expected Response:**

```
Balance: 1500000000000000
```

### 3. Check Another Address Balance

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Balance",
  parameters: JSON.stringify({
    Target: "target-address-to-check",
  }),
});
```

## Token Transfers

### 4. Simple Transfer

Transfer 100 tokens to another address:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Transfer",
  parameters: JSON.stringify({
    Recipient: "recipient-address-here",
    Quantity: "100000000000000", // 100 tokens with 12 decimals
  }),
});
```

**Expected Response:**

```
Transfer successful - 100000000000000 tokens sent to recipient-address-here
```

### 5. Transfer Large Amount

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Transfer",
  parameters: JSON.stringify({
    Recipient: "whale-address-here",
    Quantity: "1000000000000000000", // 1000 tokens
  }),
});
```

## Allowance Management

### 6. Approve Spending Allowance

Allow another address to spend tokens on your behalf:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Approve",
  parameters: JSON.stringify({
    Spender: "dex-contract-address",
    Quantity: "500000000000000", // 500 tokens allowance
  }),
});
```

### 7. Check Allowance

See how much a spender can use:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Allowance",
  parameters: JSON.stringify({
    Owner: "token-owner-address",
    Spender: "spender-address",
  }),
});
```

**Expected Response:**

```
Allowance: 500000000000000
```

### 8. Transfer From Allowance

Use approved tokens to transfer on behalf of someone:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "TransferFrom",
  parameters: JSON.stringify({
    From: "owner-who-approved-me",
    To: "final-recipient",
    Quantity: "250000000000000", // 250 tokens
  }),
});
```

## Owner Operations (if you're the token owner)

### 9. Mint New Tokens

Create new tokens (owner only):

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Mint",
  parameters: JSON.stringify({
    Quantity: "1000000000000000", // 1000 new tokens
    Target: "recipient-for-new-tokens", // optional, defaults to you
  }),
});
```

### 10. Burn Tokens

Destroy tokens from your balance:

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Burn",
  parameters: JSON.stringify({
    Quantity: "100000000000000", // Burn 100 tokens
  }),
});
```

## Storing and Reusing the Workflow

### Store the Workflow Definition

```javascript
await storeWorkflowDefinition({
  workflowDefinition: JSON.stringify(tokenWorkflow),
});
```

### Search for Token Workflows

```javascript
const results = await searchWorkflowDefinitions({
  query: "token finance transfer",
});

// Extract the workflow from results
const storedTokenWorkflow = JSON.parse(results).workflowDefinitions[0];
```

### Use Stored Workflow

```javascript
await aoMessage({
  workflowDefinition: JSON.stringify(storedTokenWorkflow),
  handler: "Transfer",
  parameters: JSON.stringify({
    Recipient: "new-recipient",
    Quantity: "50000000000000",
  }),
});
```

## Error Handling Examples

### Insufficient Balance Error

```javascript
try {
  await aoMessage({
    workflowDefinition: JSON.stringify(tokenWorkflow),
    handler: "Transfer",
    parameters: JSON.stringify({
      Recipient: "recipient",
      Quantity: "999999999999999999999", // Way more than you have
    }),
  });
} catch (error) {
  // Will return error response with "Insufficient-Balance" code
}
```

### Unauthorized Mint Attempt

```javascript
// If you're not the owner, this will fail
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Mint",
  parameters: JSON.stringify({
    Quantity: "1000000000000000",
  }),
});
// Returns: "Unauthorized" error
```

## Advanced Usage Patterns

### Batch Operations

You can perform multiple operations by calling aoMessage multiple times:

```javascript
// Check balance first
const balanceResult = await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Balance",
  parameters: "{}",
});

// Parse balance and transfer half
const balance = parseInt(balanceResult.match(/Balance: (\d+)/)[1]);
const halfBalance = Math.floor(balance / 2);

await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  handler: "Transfer",
  parameters: JSON.stringify({
    Recipient: "savings-address",
    Quantity: halfBalance.toString(),
  }),
});
```

### Dynamic Process Interaction

```javascript
// You can even override the process ID for different token contracts
await aoMessage({
  workflowDefinition: JSON.stringify(tokenWorkflow),
  processId: "different-token-process-id", // Override the default
  handler: "Balance",
  parameters: "{}",
});
```

## Tips for Success

1. **Always use the correct decimal places** - Most AO tokens use 12 decimals
2. **Check balances before transfers** - Avoid insufficient balance errors
3. **Verify process IDs** - Make sure you're interacting with the right token
4. **Handle errors gracefully** - The workflow includes comprehensive error patterns
5. **Store frequently used workflows** - Use `storeWorkflowDefinition` for reuse
6. **Test with small amounts first** - Verify everything works before large transfers

This workflow definition makes interacting with AO tokens as simple as calling the `aoMessage` tool with the appropriate parameters, while the AI handles all the message construction details.
