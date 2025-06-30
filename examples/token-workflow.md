# AO Standard Token Workflow

**Process ID:** `YOUR_TOKEN_PROCESS_ID_HERE`
**Version:** 1.2.0
**Category:** Finance
**Network:** AO

A comprehensive AO token implementation with transfer, balance, allowance, and metadata capabilities following AO token standards.

## Capabilities

- Token deployment and process creation
- Token transfers between addresses
- Balance queries for any address
- Allowance management (approve/transferFrom pattern)
- Token metadata retrieval
- Minting and burning (owner privileges)
- Comprehensive error handling

## Actions

### Transfer

**Description:** Send tokens from your address to another address.

**AO Message Format:**

- Action: `Transfer`
- Recipient: `[target_address]` - The address to send tokens to
- Quantity: `[amount]` - Amount of tokens to transfer (in token's smallest units)

**Natural Language Examples:**

- "transfer 100 tokens to alice" → Action: Transfer, Recipient: alice, Quantity: 100000000000000 (assuming 12 decimals)
- "send 50 tokens to xyz123..." → Action: Transfer, Recipient: xyz123..., Quantity: 50000000000000
- "move 1000 tokens to bob" → Action: Transfer, Recipient: bob, Quantity: 1000000000000000

**Expected Responses:**

- Success: "Transfer successful - [amount] tokens sent to [recipient]"
- Error: "Insufficient-Balance" | "Invalid-Recipient" | "Transfer-Failed"

**Parameter Mapping:**

- User says "to [address]" → maps to Recipient tag
- User says "[number] tokens" → maps to Quantity tag (convert to wei/smallest units)
- User says "send/transfer/move" → maps to Transfer action

---

### Balance

**Description:** Check the token balance for any address.

**AO Message Format:**

- Action: `Balance`
- Target: `[address]` (optional) - Address to check balance for. If omitted, checks sender's balance.

**Natural Language Examples:**

- "check my balance" → Action: Balance (no Target tag)
- "what's alice's balance?" → Action: Balance, Target: alice
- "balance of xyz123..." → Action: Balance, Target: xyz123...
- "how many tokens does bob have?" → Action: Balance, Target: bob

**Expected Responses:**

- Success: "Balance: [amount]" (in smallest units)

**Parameter Mapping:**

- User says "my balance" → no Target tag (defaults to sender)
- User says "[address]'s balance" or "balance of [address]" → maps to Target tag
- User says "check/what's/how many" → maps to Balance action

---

### Info

**Description:** Get comprehensive token metadata and information.

**AO Message Format:**

- Action: `Info`

**Natural Language Examples:**

- "what is this token?" → Action: Info
- "token info" → Action: Info
- "tell me about this token" → Action: Info
- "token details" → Action: Info

**Expected Responses:**

- Success: JSON object with token name, symbol, decimals, totalSupply, owner, etc.

**Parameter Mapping:**

- User says "info/details/about/what is" + "token" → maps to Info action

---

### Mint

**Description:** Create new tokens and assign them to an address (owner only).

**AO Message Format:**

- Action: `Mint`
- Quantity: `[amount]` - Amount of tokens to mint
- Target: `[address]` (optional) - Address to receive minted tokens. Defaults to sender.

**Natural Language Examples:**

- "mint 1000 tokens" → Action: Mint, Quantity: 1000000000000000
- "create 500 tokens for alice" → Action: Mint, Quantity: 500000000000000, Target: alice
- "mint 100 tokens to bob" → Action: Mint, Quantity: 100000000000000, Target: bob

**Expected Responses:**

- Success: "Minted [amount] tokens" or "Minted [amount] tokens to [address]"
- Error: "Unauthorized" | "Invalid-Quantity" | "Mint-Failed"

**Parameter Mapping:**

- User says "mint/create [number] tokens" → maps to Mint action + Quantity
- User says "for/to [address]" → maps to Target tag
- Requires owner privileges

---

### Burn

**Description:** Destroy tokens from your balance, reducing total supply.

**AO Message Format:**

- Action: `Burn`
- Quantity: `[amount]` - Amount of tokens to burn from sender's balance

**Natural Language Examples:**

- "burn 100 tokens" → Action: Burn, Quantity: 100000000000000
- "destroy 50 tokens" → Action: Burn, Quantity: 50000000000000
- "remove 25 tokens from supply" → Action: Burn, Quantity: 25000000000000

**Expected Responses:**

- Success: "Burned [amount] tokens"
- Error: "Insufficient-Balance" | "Invalid-Quantity" | "Burn-Failed"

**Parameter Mapping:**

- User says "burn/destroy/remove [number] tokens" → maps to Burn action + Quantity

---

### Approve

**Description:** Grant another address permission to spend tokens on your behalf.

**AO Message Format:**

- Action: `Approve`
- Spender: `[address]` - Address to grant spending permission
- Quantity: `[amount]` - Maximum amount they can spend

**Natural Language Examples:**

- "approve alice to spend 100 tokens" → Action: Approve, Spender: alice, Quantity: 100000000000000
- "allow bob to use 500 tokens" → Action: Approve, Spender: bob, Quantity: 500000000000000
- "give xyz123... permission for 1000 tokens" → Action: Approve, Spender: xyz123..., Quantity: 1000000000000000

**Expected Responses:**

- Success: "Approved [spender] to spend [amount] tokens"

**Parameter Mapping:**

- User says "approve/allow/give permission" → maps to Approve action
- User says "to [address]" or "[address] to" → maps to Spender tag
- User says "[number] tokens" → maps to Quantity tag

---

### TransferFrom

**Description:** Transfer tokens from one address to another using a previously approved allowance.

**AO Message Format:**

- Action: `TransferFrom`
- From: `[owner_address]` - Address to transfer from (must have approved sender)
- To: `[recipient_address]` - Address to transfer to
- Quantity: `[amount]` - Amount to transfer

**Natural Language Examples:**

- "transfer 100 tokens from alice to bob" → Action: TransferFrom, From: alice, To: bob, Quantity: 100000000000000
- "move 50 tokens from xyz123... to carol" → Action: TransferFrom, From: xyz123..., To: carol, Quantity: 50000000000000
- "spend 25 tokens from dave for eve" → Action: TransferFrom, From: dave, To: eve, Quantity: 25000000000000

**Expected Responses:**

- Success: "Transferred [amount] tokens from [from] to [to]"
- Error: "Insufficient-Allowance" | "Insufficient-Balance" | "Transfer-Failed"

**Parameter Mapping:**

- User says "from [address]" → maps to From tag
- User says "to [address]" → maps to To tag
- User says "[number] tokens" → maps to Quantity tag
- User says "transfer/move/spend" → maps to TransferFrom action

---

### Allowance

**Description:** Check how much one address is allowed to spend on behalf of another.

**AO Message Format:**

- Action: `Allowance`
- Owner: `[owner_address]` - Address that owns the tokens
- Spender: `[spender_address]` - Address that can spend the tokens

**Natural Language Examples:**

- "check allowance from alice to bob" → Action: Allowance, Owner: alice, Spender: bob
- "how much can carol spend from dave?" → Action: Allowance, Owner: dave, Spender: carol
- "allowance between xyz123... and abc456..." → Action: Allowance, Owner: xyz123..., Spender: abc456...

**Expected Responses:**

- Success: "Allowance: [amount]"

**Parameter Mapping:**

- User says "from [address]" or "[address] to" → maps to Owner tag
- User says "to [address]" or "can [address] spend" → maps to Spender tag
- User says "allowance/how much can" → maps to Allowance action

---

### Deploy

**Description:** Create a new token process with specified parameters.

**AO Process Creation:**

- Creates new AO process with token module
- Name: `[token_name]` - Full name of the token
- Ticker: `[symbol]` - Token symbol/ticker (e.g., "MYCOIN")
- Denomination: `[decimals]` - Number of decimal places (default: 12)
- Total-Supply: `[initial_supply]` - Initial token supply (optional)
- Logo: `[arweave_tx_id]` - Arweave transaction ID for token logo (optional)
- Description: `[description]` - Token description (optional)

**Natural Language Examples:**

- "launch a token called MyToken with symbol MT" → Deploy with Name: MyToken, Ticker: MT
- "create a new token named SuperCoin with ticker SUPER and 1 million supply" → Deploy with Name: SuperCoin, Ticker: SUPER, Total-Supply: 1000000000000000000
- "deploy token GoldCoin symbol GOLD with 18 decimals" → Deploy with Name: GoldCoin, Ticker: GOLD, Denomination: 18
- "make a token called TestToken with symbol TEST and description 'A test token'" → Deploy with Name: TestToken, Ticker: TEST, Description: A test token

**Expected Responses:**

- Success: "Token deployed successfully. Process ID: [process_id]"
- Error: "Token deployment failed: [error_reason]"

**Parameter Mapping:**

- User says "launch/create/deploy/make" + "token" → maps to Deploy action
- User says "called/named [name]" → maps to Name tag
- User says "symbol/ticker [symbol]" → maps to Ticker tag
- User says "[number] decimals" → maps to Denomination tag
- User says "[number] supply" → maps to Total-Supply tag (convert to wei/smallest units)
- User says "description [text]" → maps to Description tag
- User says "logo [tx_id]" → maps to Logo tag

**Token Creation Process:**

1. Parse token parameters from natural language
2. Validate required fields (Name, Ticker)
3. Apply defaults (Denomination: 12)
4. Convert supply to smallest units if specified
5. Create AO process with token module and configuration tags
6. Return new process ID for token interaction

## Token Configuration

**Decimals:** 12 (most AO tokens use 12 decimal places)
**Unit Conversion:** When user says "100 tokens", convert to "100000000000000" (100 \* 10^12)

**Common Address Formats:**

- Full AO process ID: 43-character alphanumeric string
- Short names: "alice", "bob", "carol" (for examples)
- Partial IDs: "xyz123..." format

**Error Handling:**

- Always provide helpful error messages
- Suggest alternatives when operations fail
- Validate addresses and amounts before sending

## Usage Notes

This workflow enables natural language interaction with AO tokens. The AI should:

1. **Parse User Intent:** Understand what the user wants to do (transfer, check balance, etc.)
2. **Extract Parameters:** Pull out addresses, amounts, and other details from natural language
3. **Convert Units:** Handle decimal conversion automatically
4. **Construct AO Message:** Build proper Action and tag structure
5. **Handle Responses:** Parse and format responses for the user

The workflow supports both technical users (who might specify exact process IDs) and casual users (who might say "send tokens to alice").
