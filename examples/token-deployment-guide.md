# AO Token Deployment Guide

## Overview

This guide demonstrates how to deploy tokens using the natural language AO workflow system. Token deployment creates a new AO process with token capabilities.

## Basic Token Deployment

### Simple Token Creation

**Request:**

```
"launch a token called MyToken with symbol MT"
```

**Result:**

- Creates token process with Name: "MyToken", Ticker: "MT"
- Uses default 12 decimals
- No initial supply (can be minted later)

### Token with Initial Supply

**Request:**

```
"create a new token named SuperCoin with ticker SUPER and 1 million supply"
```

**Result:**

- Name: "SuperCoin"
- Ticker: "SUPER"
- Total Supply: 1,000,000 tokens (1000000000000000000 smallest units)
- Decimals: 12 (default)

### Token with Custom Decimals

**Request:**

```
"deploy token GoldCoin symbol GOLD with 18 decimals"
```

**Result:**

- Name: "GoldCoin"
- Ticker: "GOLD"
- Decimals: 18
- No initial supply

### Full Token Configuration

**Request:**

```
"make a token called TestToken with symbol TEST and description 'A test token for development'"
```

**Result:**

- Name: "TestToken"
- Ticker: "TEST"
- Description: "A test token for development"
- Default decimals: 12

## Advanced Examples

### Gaming Token

**Request:**

```
"launch a gaming token called GameCoin with symbol GAME, 10 million supply, and description 'In-game currency for our RPG'"
```

**Expected Response:**

```json
{
  "processId": "abc123...",
  "message": "Token deployed successfully. Process ID: abc123...",
  "config": {
    "name": "GameCoin",
    "ticker": "GAME",
    "denomination": 12,
    "totalSupply": "10000000000000000000000000",
    "description": "In-game currency for our RPG"
  }
}
```

### DeFi Token

**Request:**

```
"create DeFi token called YieldFarm symbol YIELD with 100000 supply and 18 decimals"
```

**Expected Response:**

```json
{
  "processId": "def456...",
  "message": "Token deployed successfully. Process ID: def456...",
  "config": {
    "name": "YieldFarm",
    "ticker": "YIELD",
    "denomination": 18,
    "totalSupply": "100000000000000000000000000"
  }
}
```

### Meme Token

**Request:**

```
"deploy meme token named DogeCoin2 with ticker DOGE2 and 1 billion supply"
```

**Expected Response:**

```json
{
  "processId": "ghi789...",
  "message": "Token deployed successfully. Process ID: ghi789...",
  "config": {
    "name": "DogeCoin2",
    "ticker": "DOGE2",
    "denomination": 12,
    "totalSupply": "1000000000000000000000000000"
  }
}
```

## Natural Language Patterns

### Token Name Extraction

- "called [name]" → Name parameter
- "named [name]" → Name parameter
- "token [name]" → Name parameter

### Symbol/Ticker Extraction

- "symbol [TICKER]" → Ticker parameter
- "ticker [TICKER]" → Ticker parameter
- "with symbol [TICKER]" → Ticker parameter

### Supply Patterns

- "[number] supply" → Total-Supply parameter
- "[number] million supply" → Total-Supply (multiplied by 1M)
- "[number] tokens supply" → Total-Supply parameter

### Decimal Configuration

- "[number] decimals" → Denomination parameter
- "with [number] decimals" → Denomination parameter

### Description Patterns

- "description '[text]'" → Description parameter
- "description [text]" → Description parameter

## Error Handling

### Missing Required Parameters

**Request:**

```
"create a token with symbol ABC"
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_DEPLOYMENT_PARAMS",
    "message": "Token name and ticker are required for deployment"
  }
}
```

### Invalid Parameters

**Request:**

```
"launch token called Test123 with symbol TOOLONG"
```

**Notes:**

- Name should be valid token name
- Ticker should be 2-10 characters, uppercase
- Supply should be valid number
- Decimals should be 0-18

## Post-Deployment Usage

After deployment, you can interact with your new token using the process ID:

### Check Token Info

```
Process ID: abc123...
Request: "what is this token?"
```

### Mint Initial Supply (if not set during deployment)

```
Process ID: abc123...
Request: "mint 1000000 tokens"
```

### Transfer Tokens

```
Process ID: abc123...
Request: "transfer 100 tokens to alice"
```

## Best Practices

1. **Choose Clear Names**: Use descriptive, memorable token names
2. **Standard Tickers**: Use 3-5 character uppercase tickers
3. **Appropriate Decimals**:
   - 12 decimals for most tokens (AO standard)
   - 18 decimals for DeFi compatibility
   - 0 decimals for NFT-like tokens
4. **Initial Supply**: Consider whether to set initial supply or mint as needed
5. **Documentation**: Add meaningful descriptions for complex tokens

## Integration with Existing Tokens

Once deployed, your token can be used with all standard AO token operations:

- Transfer, Balance, Info
- Mint, Burn (owner operations)
- Approve, TransferFrom, Allowance (DeFi patterns)

The deployed process ID becomes the permanent identifier for your token on the AO network.
