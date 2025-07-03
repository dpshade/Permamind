# AO Process Integration Guide

Learn how to integrate any AO (Autonomous Objects) process with Permamind using natural language interfaces and markdown documentation.

## Overview

Permamind provides a universal interface for communicating with AO processes using natural language. Instead of manually crafting AO messages with specific tags, you can:

- Document processes in simple markdown format
- Use plain English to interact with any AO process
- Automatically detect common process types (tokens, NFTs, DAOs)
- Get intelligent parameter extraction and validation

## Core Concepts

### AO Message Structure

AO processes communicate through tagged messages:

```typescript
interface AOMessage {
  processId: string;        // Target process identifier
  tags: Tag[];             // Message metadata and parameters
  data?: string;           // Optional message body
  isWrite?: boolean;       // Read vs write operation
}

interface Tag {
  name: string;            // Tag name (e.g., "Action", "Recipient")
  value: string;           // Tag value
}
```

### Process Documentation Format

Permamind uses markdown to document AO processes:

```markdown
# Process Name

Brief description of what this process does.

## handlerName
Description of what this handler does
- parameter1: Description of parameter (required/optional)
- parameter2: Description of parameter (required/optional)

## anotherHandler
Another handler description
- param: Parameter description (required)
```

## Getting Started

### Step 1: Document Your Process

Create markdown documentation for your AO process. Here's a comprehensive token process example:

```markdown
# Token Process

A standard AO token implementing ERC20-like functionality with additional features.

## Balance
Get token balance for an account
- Target: Wallet address to check balance for (optional, defaults to sender)

## Transfer
Transfer tokens to another account
- Recipient: Destination wallet address (required)
- Quantity: Amount of tokens to transfer (required)
- Note: Optional transfer memo (optional)

## Mint
Create new tokens (owner only)
- Recipient: Address to mint tokens to (required)
- Quantity: Amount of tokens to mint (required)

## Burn
Destroy tokens from sender's balance
- Quantity: Amount of tokens to burn (required)

## Info
Get detailed token information
- No parameters required

## Balances
Get all token balances
- No parameters required
```

### Step 2: Use Natural Language Interface

With your process documented, you can use natural language:

**Example Interactions**:

```javascript
// Check balance
await executeProcessAction({
  processId: "your_token_process_id",
  processMarkdown: "...", // Your documentation
  request: "What's my current balance?"
});

// Transfer tokens
await executeProcessAction({
  processId: "your_token_process_id", 
  processMarkdown: "...",
  request: "Send 100 tokens to alice with note 'payment for services'"
});

// Get token information
await executeProcessAction({
  processId: "your_token_process_id",
  processMarkdown: "...", 
  request: "Show me the token details and total supply"
});
```

## Advanced Process Integration

### Complex Parameter Extraction

Permamind can extract complex parameters from natural language:

```markdown
## CreateProposal
Create a new governance proposal
- Title: Proposal title (required)
- Description: Detailed proposal description (required)
- VotingPeriod: Voting duration in days (optional, default 7)
- QuorumThreshold: Minimum participation percentage (optional, default 25)
- Category: Proposal category (optional)
```

**Natural Language**: "Create a proposal titled 'Increase staking rewards' with description 'Proposal to increase staking rewards from 5% to 7% APY to attract more validators and improve network security' for 10 days voting period with 30% quorum threshold in the rewards category"

**Extracted Parameters**:
```json
{
  "Title": "Increase staking rewards",
  "Description": "Proposal to increase staking rewards from 5% to 7% APY to attract more validators and improve network security",
  "VotingPeriod": "10",
  "QuorumThreshold": "30",
  "Category": "rewards"
}
```

### Handler Type Detection

Permamind automatically detects read vs write operations:

**Write Operations** (detected keywords):
- transfer, send, create, update, delete, set, add, remove
- mint, burn, stake, withdraw, deposit, register, vote

**Read Operations**:
- get, fetch, read, check, balance, info, status, list, query, view, show

### Process Type Auto-Detection

For common process types, Permamind can auto-detect without documentation:

```javascript
// Token operations without markdown docs
await executeTokenRequest({
  processId: "token_process_id",
  request: "Send 50 tokens to bob"
});
```

Supported auto-detection:
- **Token processes**: ERC20-like functionality
- **NFT processes**: (coming soon)
- **DAO processes**: (coming soon)

## Real-World Examples

### Example 1: NFT Marketplace

```markdown
# NFT Marketplace

Decentralized marketplace for trading NFTs with auction and fixed-price sales.

## ListNFT
List an NFT for sale
- TokenId: NFT token identifier (required)
- Price: Sale price in tokens (required)
- SaleType: 'auction' or 'fixed' (required)
- Duration: Sale duration in hours (optional, default 168)

## BuyNFT
Purchase an NFT at fixed price
- TokenId: NFT token identifier (required)
- MaxPrice: Maximum price willing to pay (required)

## PlaceBid
Place bid on auction NFT
- TokenId: NFT token identifier (required)
- BidAmount: Bid amount in tokens (required)

## GetListing
Get details of an NFT listing
- TokenId: NFT token identifier (required)

## GetMarketStats
Get marketplace statistics
- No parameters required
```

**Usage**:
```javascript
await executeProcessAction({
  processId: "nft_marketplace_id",
  processMarkdown: marketplaceDoc,
  request: "List my NFT #1234 for fixed price sale at 100 tokens for 7 days"
});

await executeProcessAction({
  processId: "nft_marketplace_id",
  processMarkdown: marketplaceDoc, 
  request: "Show me the current listing for NFT #5678"
});
```

### Example 2: DAO Governance

```markdown
# DAO Governance

Decentralized governance system for community decision making.

## CreateProposal
Submit a new governance proposal
- Title: Proposal title (required)
- Description: Detailed description (required)
- ProposalType: 'funding', 'parameter', 'upgrade' (required)
- RequestedAmount: Funding amount if applicable (optional)
- VotingPeriod: Days for voting (optional, default 7)

## Vote
Cast vote on a proposal
- ProposalId: Proposal identifier (required)
- VoteChoice: 'yes', 'no', 'abstain' (required)
- Reason: Voting rationale (optional)
- VotingPower: Tokens to use for voting (optional)

## ExecuteProposal
Execute a passed proposal
- ProposalId: Proposal identifier (required)

## GetProposal
Get proposal details
- ProposalId: Proposal identifier (required)

## GetActiveProposals
List all active proposals
- No parameters required
```

**Usage**:
```javascript
await executeProcessAction({
  processId: "dao_governance_id",
  processMarkdown: daoDoc,
  request: "Create a funding proposal titled 'Community Event Sponsorship' requesting 5000 tokens for organizing a blockchain conference with 10 days voting period"
});

await executeProcessAction({
  processId: "dao_governance_id",
  processMarkdown: daoDoc,
  request: "Vote yes on proposal #42 with reason 'This initiative will increase community engagement and adoption'"
});
```

### Example 3: DeFi Staking Pool

```markdown
# Staking Pool

Decentralized staking pool with rewards distribution.

## Stake
Stake tokens to earn rewards
- Amount: Amount of tokens to stake (required)
- LockPeriod: Lock period in days (optional, default 30)

## Unstake
Withdraw staked tokens
- Amount: Amount to unstake (required)

## ClaimRewards
Claim accumulated staking rewards
- No parameters required

## GetStakeInfo
Get staking information for user
- User: User address (optional, defaults to sender)

## GetPoolStats
Get pool statistics
- No parameters required

## UpdateRewardRate
Update reward rate (admin only)
- NewRate: New reward rate percentage (required)
```

**Usage**:
```javascript
await executeProcessAction({
  processId: "staking_pool_id",
  processMarkdown: stakingDoc,
  request: "Stake 1000 tokens with 60 day lock period"
});

await executeProcessAction({
  processId: "staking_pool_id",
  processMarkdown: stakingDoc,
  request: "What are my current staking details and pending rewards?"
});
```

## Best Practices

### 1. Clear Handler Documentation

✅ **Good**:
```markdown
## Transfer
Transfer tokens to another account
- Recipient: Destination wallet address (required)
- Quantity: Amount of tokens to transfer as integer (required)
- Memo: Optional message attached to transfer (optional)
```

❌ **Avoid**:
```markdown
## Transfer
Sends tokens
- to: address
- amt: number
```

### 2. Consistent Parameter Naming

Use consistent naming across your process:
- `Recipient` vs `Target` vs `To` - pick one
- `Quantity` vs `Amount` vs `Value` - be consistent
- `TokenId` vs `TokenID` vs `Id` - standardize

### 3. Required vs Optional Parameters

Clearly mark parameter requirements:
- `(required)` - Must be provided
- `(optional)` - Can be omitted
- `(optional, default X)` - Default value if omitted

### 4. Parameter Type Hints

Include type information when helpful:
- `Amount: Number of tokens as integer (required)`
- `Duration: Time period in hours (optional, default 24)`
- `Address: Valid Arweave wallet address (required)`

### 5. Handler Grouping

Group related handlers logically:
```markdown
# Token Operations
## Balance
## Transfer
## Approve

# Administrative Functions  
## Mint
## Burn
## SetOwner

# Information Queries
## Info
## Balances
## Allowances
```

## Advanced Features

### Custom Parameter Patterns

You can define custom parameter extraction patterns:

```markdown
## ComplexOperation
Perform complex operation with structured data
- Config: JSON configuration object (required)
  Example: {"setting1": "value1", "setting2": 123}
- Recipients: Comma-separated list of addresses (required)
  Example: "addr1,addr2,addr3"  
- Schedule: Cron-like schedule expression (optional)
  Example: "0 0 * * 0" for weekly
```

### Conditional Parameters

Document parameter dependencies:

```markdown
## CreateSale
Create NFT sale listing
- TokenId: NFT identifier (required)
- SaleType: 'auction' or 'fixed' (required)
- Price: Starting/fixed price (required if fixed sale)
- Duration: Auction duration in hours (required if auction)
- ReservePrice: Minimum auction price (optional for auctions)
```

### Response Interpretation

Permamind automatically interprets common AO response patterns:

```lua
-- AO Process Response
return {
  Success = true,
  Message = "Transfer completed",
  Data = {
    TransactionId = "tx_123",
    NewBalance = 500,
    Recipient = "alice_address"
  }
}
```

**Interpreted Response**:
```json
{
  "success": true,
  "handlerUsed": "Transfer",
  "data": {
    "transactionId": "tx_123", 
    "newBalance": 500,
    "recipient": "alice_address",
    "message": "Transfer completed"
  }
}
```

## Error Handling

### Common AO Errors

Permamind handles common AO error patterns:

```lua
-- AO Error Response
return {
  Error = "Insufficient balance",
  Code = "INSUFFICIENT_FUNDS",
  Details = {
    Available = 100,
    Requested = 500
  }
}
```

**Interpreted Error**:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient balance",
    "details": {
      "available": 100,
      "requested": 500
    }
  }
}
```

### Parameter Validation Errors

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Missing required parameter: Recipient",
    "details": {
      "missingParameters": ["Recipient"],
      "providedParameters": ["Quantity"]
    }
  }
}
```

## Testing Your Integration

### 1. Start with Simple Operations

Test basic read operations first:
```javascript
await executeProcessAction({
  processId: "your_process",
  processMarkdown: docs,
  request: "Get current status"
});
```

### 2. Test Parameter Extraction

Verify parameter extraction works:
```javascript
await executeProcessAction({
  processId: "your_process",
  processMarkdown: docs,
  request: "Transfer 100 tokens to alice with memo 'test payment'"
});
```

### 3. Test Edge Cases

- Missing required parameters
- Invalid parameter values
- Unknown handlers
- Complex parameter combinations

### 4. Validate Responses

Check that responses are properly interpreted:
- Success/error status
- Data extraction
- Message formatting

## Performance Considerations

### 1. Documentation Caching

Permamind caches process documentation for better performance. Update documentation when your process changes.

### 2. Batch Operations

For multiple operations, consider batching:
```javascript
// Instead of multiple calls
for (const recipient of recipients) {
  await executeProcessAction({...});
}

// Consider process-level batch operations
await executeProcessAction({
  processId: "batch_process",
  request: "Transfer 100 tokens each to alice, bob, and charlie"
});
```

### 3. Read vs Write Optimization

- Read operations are faster and don't require AO fees
- Batch read operations when possible
- Cache frequently accessed data

## Security Considerations

### 1. Input Validation

Always validate inputs in your AO process:
```lua
-- AO Process Handler
function Transfer(msg)
  assert(msg.Recipient, "Recipient is required")
  assert(tonumber(msg.Quantity), "Quantity must be a number")
  assert(tonumber(msg.Quantity) > 0, "Quantity must be positive")
  
  -- Process transfer
end
```

### 2. Permission Checks

Implement proper authorization:
```lua
function Mint(msg)
  assert(msg.From == Owner, "Only owner can mint")
  -- Mint logic
end
```

### 3. Rate Limiting

Consider rate limiting in your process:
```lua
local rateLimitRegistry = {}

function Transfer(msg)
  local now = os.time()
  local userLimits = rateLimitRegistry[msg.From] or {}
  
  -- Check rate limit
  if #userLimits >= 10 then
    local oldestRequest = userLimits[1]
    if now - oldestRequest < 60 then -- 1 minute
      return { Error = "Rate limit exceeded" }
    end
  end
  
  -- Update rate limit tracking
  table.insert(userLimits, now)
  if #userLimits > 10 then
    table.remove(userLimits, 1)
  end
  rateLimitRegistry[msg.From] = userLimits
  
  -- Process transfer
end
```

## Migration from Manual AO Integration

### Before (Manual Tags)
```javascript
await aoConnect.message({
  process: processId,
  tags: [
    { name: "Action", value: "Transfer" },
    { name: "Recipient", value: "alice_address" },
    { name: "Quantity", value: "100" },
    { name: "Note", value: "Payment for services" }
  ],
  signer: wallet
});
```

### After (Natural Language)
```javascript
await executeProcessAction({
  processId: processId,
  processMarkdown: processDocumentation,
  request: "Send 100 tokens to alice with note 'Payment for services'"
});
```

### Migration Steps

1. **Document your process** using the markdown format
2. **Test natural language requests** against your documentation
3. **Validate parameter extraction** matches your expectations
4. **Replace manual message construction** with natural language calls
5. **Update error handling** to use interpreted responses

## Community Process Templates

Permamind includes templates for common process types:

### Token Template
- Standard ERC20-like functionality
- Balance, Transfer, Mint, Burn operations
- Credit notice handling
- Minting strategies (Basic, Cascade, DoubleMint)

### NFT Template (Coming Soon)
- NFT minting and transfer
- Metadata management
- Marketplace integration
- Royalty handling

### DAO Template (Coming Soon)
- Proposal creation and voting
- Treasury management
- Member management
- Governance parameters

## Contributing Process Templates

Help the community by contributing process templates:

1. **Create comprehensive documentation** for your process type
2. **Test thoroughly** with various natural language inputs
3. **Submit to the Permamind repository** with examples
4. **Include deployment instructions** and best practices

This enables the entire AO ecosystem to benefit from natural language interfaces to your process innovations.

## Summary

AO process integration with Permamind provides:
- ✅ Natural language interfaces for any AO process
- ✅ Automatic parameter extraction and validation
- ✅ Intelligent read/write operation detection
- ✅ Standardized error handling and response interpretation
- ✅ Documentation-driven development workflow
- ✅ Support for complex parameter patterns and conditional logic

This approach makes AO processes more accessible to users while maintaining the full power and flexibility of the underlying AO infrastructure.