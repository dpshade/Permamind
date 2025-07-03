# 🚨 Troubleshooting Guide

Comprehensive solutions for common Permamind issues, error codes, and debugging techniques.

## Table of Contents

- [Installation Issues](#installation-issues)
- [MCP Client Connection Problems](#mcp-client-connection-problems)
- [Server Startup Issues](#server-startup-issues)
- [Memory Operations Failures](#memory-operations-failures)
- [AO Network Issues](#ao-network-issues)
- [Token Operations Problems](#token-operations-problems)
- [Search and Retrieval Issues](#search-and-retrieval-issues)
- [Performance Problems](#performance-problems)
- [Configuration Issues](#configuration-issues)
- [Error Codes Reference](#error-codes-reference)

---

## Installation Issues

### Issue: "npm install" fails with permission errors

**Symptoms**:

```bash
npm ERR! Error: EACCES: permission denied
```

**Solutions**:

1. **Use npm global directory** (Recommended):

```bash
# Configure npm to use different global directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to your shell profile (.bashrc, .zshrc, etc.)
export PATH=~/.npm-global/bin:$PATH

# Install Permamind
npm install -g permamind
```

2. **Use sudo** (macOS/Linux):

```bash
sudo npm install -g permamind
```

3. **Use Node Version Manager**:

```bash
# Install nvm if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install latest Node.js
nvm install node
nvm use node

# Now install Permamind
npm install -g permamind
```

### Issue: Node.js version compatibility

**Symptoms**:

```bash
Error: This package requires Node.js 20.0.0 or higher
```

**Solutions**:

1. **Check current version**:

```bash
node --version
```

2. **Update Node.js**:
   - **Using nvm** (Recommended):
     ```bash
     nvm install 20
     nvm use 20
     ```
   - **Direct download**: Visit [nodejs.org](https://nodejs.org/) and download Node.js 20+

3. **Verify installation**:

```bash
node --version  # Should show 20.x.x or higher
npm --version
```

### Issue: TypeScript/tsx not found

**Symptoms**:

```bash
tsx: command not found
```

**Solutions**:

1. **Install tsx globally**:

```bash
npm install -g tsx
```

2. **Verify installation**:

```bash
tsx --version
```

3. **Alternative: use npx**:

```bash
npx tsx src/server.ts
```

---

## MCP Client Connection Problems

### Issue: Claude Desktop doesn't recognize Permamind

**Symptoms**:

- No Permamind tools appear in Claude Desktop
- "Server not found" errors
- Tools not loading

**Solutions**:

1. **Verify configuration file location**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Check configuration syntax**:

```json
{
  "mcpServers": {
    "permamind": {
      "command": "tsx",
      "args": ["/absolute/path/to/Permamind/src/server.ts"],
      "env": {
        "SEED_PHRASE": "your_seed_phrase_here"
      }
    }
  }
}
```

3. **Common configuration mistakes**:
   - ❌ Relative paths: `"./src/server.ts"`
   - ✅ Absolute paths: `"/Users/name/Permamind/src/server.ts"`
   - ❌ Missing commas in JSON
   - ❌ Wrong quotation marks

4. **Restart Claude Desktop** after configuration changes

5. **Test configuration**:

```bash
# Test the exact command Claude will run
tsx /absolute/path/to/Permamind/src/server.ts
```

### Issue: VS Code MCP extension problems

**Symptoms**:

- MCP servers not appearing
- Connection timeouts
- Tool execution failures

**Solutions**:

1. **Install latest MCP extension**:
   - Open VS Code Extensions
   - Search for "MCP" or "Model Context Protocol"
   - Install/update to latest version

2. **Configure server correctly**:
   - Open Command Palette (`Cmd/Ctrl + Shift + P`)
   - Run "MCP: Configure Servers"
   - Add Permamind configuration

3. **Check VS Code settings**:

```json
{
  "mcp.servers": {
    "permamind": {
      "command": "tsx",
      "args": ["/absolute/path/to/Permamind/src/server.ts"],
      "env": {
        "SEED_PHRASE": "your_seed_phrase_here"
      }
    }
  }
}
```

4. **Restart VS Code** after configuration

### Issue: Cursor IDE connection problems

**Symptoms**:

- Similar to VS Code issues
- Server not starting
- Tools not available

**Solutions**:

1. **Check Cursor MCP settings**:
   - Open Settings (`Cmd/Ctrl + ,`)
   - Search for "MCP"
   - Configure server settings

2. **Use same configuration format** as VS Code

3. **Restart Cursor** after changes

---

## Server Startup Issues

### Issue: "SEED_PHRASE not set" warning

**Symptoms**:

```bash
⚠️ Warning: SEED_PHRASE not set. Using temporary wallet.
```

**Impact**: Memories won't persist across server restarts

**Solutions**:

1. **Generate a seed phrase**:

```bash
node -e "
const { generateMnemonic } = require('bip39');
console.log('Your seed phrase:', generateMnemonic());
"
```

2. **Set as environment variable**:

```bash
# Linux/macOS
export SEED_PHRASE="your twelve word seed phrase here"

# Windows
set SEED_PHRASE=your twelve word seed phrase here
```

3. **Create .env file**:

```bash
# In your Permamind directory
echo 'SEED_PHRASE="your twelve word seed phrase here"' > .env
```

4. **Update MCP configuration**:

```json
{
  "mcpServers": {
    "permamind": {
      "command": "tsx",
      "args": ["/path/to/Permamind/src/server.ts"],
      "env": {
        "SEED_PHRASE": "your twelve word seed phrase here"
      }
    }
  }
}
```

### Issue: Hub deployment failures

**Symptoms**:

```bash
Error: Failed to deploy hub process
Error: AO network connection timeout
```

**Solutions**:

1. **Check internet connection**:

```bash
ping cu.velocity.cloudnet.marshal.ao
```

2. **Verify AO network status**:
   - Check [Marshal AO Status](https://x.com/Marshal_AO)
   - Test with simple AO operation

3. **Retry with increased timeout**:

```bash
DEBUG=true npm run dev
```

4. **Check firewall settings**:
   - Allow outbound HTTPS connections
   - Ports: 443 (HTTPS)
   - Domains: `*.marshal.ao`, `*.arweave.net`

### Issue: TypeScript compilation errors

**Symptoms**:

```bash
Error: Cannot find module '@types/node'
TypeScript compilation failed
```

**Solutions**:

1. **Install dependencies**:

```bash
npm install
```

2. **Rebuild TypeScript**:

```bash
npm run build
```

3. **Check TypeScript version**:

```bash
npx tsc --version
```

4. **Clear cache and reinstall**:

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Memory Operations Failures

### Issue: "Memory not found" errors

**Symptoms**:

```bash
Error: Memory with ID mem_123 not found
```

**Solutions**:

1. **Verify memory ID exists**:

```javascript
// Use getAllMemories to list all memory IDs
await getAllMemories();
```

2. **Check wallet consistency**:
   - Same SEED_PHRASE across sessions
   - Same wallet address in getServerInfo

3. **Wait for AO propagation**:
   - AO messages can take 30-60 seconds to propagate
   - Try the operation again after waiting

4. **Verify hub status**:

```javascript
await getServerInfo();
// Check hub.status is "active"
```

### Issue: Memory search returns no results

**Symptoms**:

- Search queries return empty results
- Expected memories not found

**Solutions**:

1. **Check search syntax**:

```javascript
// Correct
await searchMemories({
  query: "authentication security",
});

// Check spelling and keywords
```

2. **Verify memories exist**:

```javascript
await getAllMemories();
```

3. **Try broader search terms**:

```javascript
// Instead of specific terms
query: "jwt authentication";

// Try broader terms
query: "auth";
```

4. **Check importance filters**:

```javascript
await searchMemoriesAdvanced({
  query: "your_search",
  filters: {
    importanceThreshold: 0.1, // Lower threshold
  },
});
```

### Issue: Batch operations timing out

**Symptoms**:

```bash
Error: Batch operation timeout
Error: Too many concurrent operations
```

**Solutions**:

1. **Reduce batch size**:

```javascript
// Instead of 100 memories at once
const batchSize = 10;
for (let i = 0; i < memories.length; i += batchSize) {
  const batch = memories.slice(i, i + batchSize);
  await addMemoriesBatch({ memories: batch, p: publicKey });

  // Add delay between batches
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
```

2. **Add retry logic**:

```javascript
async function addMemoryWithRetry(memory, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await addMemoryEnhanced(memory);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

## AO Network Issues

### Issue: AO connection timeouts

**Symptoms**:

```bash
Error: Request timeout
Error: AO network unreachable
```

**Solutions**:

1. **Check network connectivity**:

```bash
curl -I https://cu.velocity.cloudnet.marshal.ao
curl -I https://mu.velocity.cloudnet.marshal.ao
```

2. **Test with different endpoints**:

```bash
# Set custom AO endpoints
export AO_CU_URL=https://cu.ao-testnet.xyz
export AO_MU_URL=https://mu.ao-testnet.xyz
```

3. **Increase timeout settings**:

```javascript
// In your configuration
{
  "env": {
    "AO_TIMEOUT": "30000"  // 30 seconds
  }
}
```

4. **Check proxy/VPN settings**:
   - Disable VPN if causing issues
   - Configure proxy settings if needed

### Issue: AO message failures

**Symptoms**:

```bash
Error: Message failed to process
Error: Invalid AO message format
```

**Solutions**:

1. **Check message structure**:

```javascript
// Verify proper tag format
{
  processId: "valid_process_id",
  tags: [
    { name: "Action", value: "ValidAction" },
    { name: "Parameter", value: "value" }
  ]
}
```

2. **Verify process ID**:

```bash
# Check if process exists
curl "https://cu.velocity.cloudnet.marshal.ao/result/your_process_id"
```

3. **Check wallet balance**:
   - AO operations may require small fees
   - Ensure wallet has sufficient balance

---

## Token Operations Problems

### Issue: Token creation fails

**Symptoms**:

```bash
Error: Token deployment failed
Error: Process creation timeout
```

**Solutions**:

1. **Verify token configuration**:

```javascript
{
  name: "Valid Token Name",  // Required
  ticker: "VTN",            // Required, 2-5 characters
  initialSupply: 1000000,   // Valid number
  mintable: true            // Boolean
}
```

2. **Check for duplicate tickers**:
   - Token tickers should be unique
   - Try different ticker symbol

3. **Simplify configuration**:

```javascript
// Minimal configuration
{
  name: "Test Token",
  ticker: "TEST"
}
```

### Issue: Token transfers fail

**Symptoms**:

```bash
Error: Transfer failed
Error: Insufficient balance
```

**Solutions**:

1. **Check balance first**:

```javascript
await executeTokenRequest({
  processId: "token_id",
  request: "What's my balance?",
});
```

2. **Verify recipient address**:

```javascript
// Correct format
"recipient": "valid_arweave_address"

// Check address length and format
```

3. **Use credit notice pattern**:
   - Modern AO tokens use credit notices
   - Ensure your token implements proper credit notice handling

### Issue: Credit notice detection problems

**Symptoms**:

- Tokens not appearing after transfer
- Minting strategies not triggering

**Solutions**:

1. **Verify credit notice handler**:

```lua
-- In your AO process
Handlers.add("Credit-Notice",
  Handlers.utils.hasMatchingTag("Action", "Credit-Notice"),
  function (msg)
    -- Proper credit notice handling
    local quantity = tonumber(msg.Quantity)
    local from = msg.From

    -- Update balances and trigger minting if needed
  end
)
```

2. **Check message tags**:

```javascript
// Credit notices should have these tags
{
  "Action": "Credit-Notice",
  "Sender": "sender_address",
  "Quantity": "amount"
}
```

---

## Search and Retrieval Issues

### Issue: Advanced search not working

**Symptoms**:

- Filters not applied correctly
- Unexpected search results
- Search timing out

**Solutions**:

1. **Verify filter syntax**:

```javascript
{
  query: "search terms",
  filters: {
    memoryType: "knowledge",           // Correct string
    importanceThreshold: 0.7,          // Correct number
    timeRange: {                       // Correct object
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-31T23:59:59Z"
    }
  }
}
```

2. **Check memory type values**:

```javascript
// Valid memory types
("conversation",
  "knowledge",
  "reasoning",
  "procedure",
  "enhancement",
  "performance",
  "workflow");
```

3. **Simplify search progressively**:

```javascript
// Start simple
{ query: "test" }

// Add filters gradually
{
  query: "test",
  filters: { memoryType: "knowledge" }
}
```

### Issue: Knowledge graph relationships not working

**Symptoms**:

- Cannot create memory links
- Relationship queries return empty
- Circular reference detection fails

**Solutions**:

1. **Verify memory IDs exist**:

```javascript
// Check both memories exist
await getAllMemories(); // Find valid memory IDs
```

2. **Check relationship parameters**:

```javascript
{
  sourceMemoryId: "valid_mem_id",
  targetMemoryId: "valid_mem_id",
  relationshipType: "supports",  // Valid type
  strength: 0.8                  // 0-1 range
}
```

3. **Valid relationship types**:

```javascript
("causes",
  "supports",
  "contradicts",
  "extends",
  "references",
  "prerequisite",
  "example",
  "implementation");
```

---

## Performance Problems

### Issue: Slow memory operations

**Symptoms**:

- Operations taking >30 seconds
- Timeouts on large queries
- High memory usage

**Solutions**:

1. **Optimize search queries**:

```javascript
// Add limits
{
  query: "search terms",
  limit: 20  // Reasonable limit
}

// Use specific filters
{
  query: "terms",
  filters: {
    memoryType: "knowledge",  // Narrow scope
    importanceThreshold: 0.7  // Reduce results
  }
}
```

2. **Batch operations efficiently**:

```javascript
// Smaller batches
const batchSize = 5; // Instead of 50+

// Add delays
await new Promise((resolve) => setTimeout(resolve, 100));
```

3. **Monitor memory usage**:

```javascript
// Check memory analytics
await getMemoryAnalytics();
```

### Issue: High CPU usage

**Symptoms**:

- Server consuming high CPU
- System becoming unresponsive
- Fan noise on laptops

**Solutions**:

1. **Check for infinite loops**:

```bash
# Monitor process
top -p $(pgrep node)
```

2. **Reduce concurrent operations**:

```javascript
// Limit concurrent operations
const semaphore = new Semaphore(3); // Max 3 concurrent
```

3. **Add debug logging**:

```bash
DEBUG=true npm run dev
```

---

## Configuration Issues

### Issue: Environment variables not loading

**Symptoms**:

```bash
SEED_PHRASE undefined
Custom configuration not applied
```

**Solutions**:

1. **Check .env file format**:

```bash
# Correct format (.env file)
SEED_PHRASE="word1 word2 word3 ... word12"
NODE_ENV=development
DEBUG=true

# No spaces around =
# Use quotes for multi-word values
```

2. **Verify file location**:

```bash
# .env should be in project root
/path/to/Permamind/.env
```

3. **Check file permissions**:

```bash
chmod 600 .env  # Read/write for owner only
```

4. **Test environment loading**:

```bash
node -e "
require('dotenv').config();
console.log('SEED_PHRASE:', process.env.SEED_PHRASE ? 'Set' : 'Not set');
"
```

### Issue: MCP client configuration problems

**Symptoms**:

- Tools not appearing
- Wrong server behavior
- Environment variables not passed

**Solutions**:

1. **Validate JSON syntax**:

```bash
# Test JSON validity
cat claude_desktop_config.json | python -m json.tool
```

2. **Check environment variable passing**:

```json
{
  "mcpServers": {
    "permamind": {
      "command": "tsx",
      "args": ["/path/to/server.ts"],
      "env": {
        "SEED_PHRASE": "actual_seed_phrase",
        "NODE_ENV": "development"
      }
    }
  }
}
```

3. **Test configuration manually**:

```bash
# Test exact command
SEED_PHRASE="your_seed" tsx /path/to/server.ts
```

---

## Error Codes Reference

### MEMORY_001: Invalid Memory Parameters

**Cause**: Missing or invalid parameters for memory operations
**Solution**: Check required parameters: content, role, p

### MEMORY_002: Memory Not Found

**Cause**: Requested memory ID doesn't exist
**Solution**: Verify memory ID with getAllMemories

### NETWORK_001: AO Connection Timeout

**Cause**: Cannot connect to AO network
**Solution**: Check internet connection and AO network status

### NETWORK_002: Hub Deployment Failed

**Cause**: Cannot deploy memory hub process
**Solution**: Verify wallet balance and network connectivity

### TOKEN_001: Invalid Token Configuration

**Cause**: Invalid parameters for token creation
**Solution**: Check required fields: name, ticker

### TOKEN_002: Transfer Failed

**Cause**: Token transfer operation failed
**Solution**: Check balance, recipient address, and token permissions

### SEARCH_001: Invalid Search Parameters

**Cause**: Malformed search query or filters
**Solution**: Verify search syntax and filter values

### SEARCH_002: Search Timeout

**Cause**: Search operation timed out
**Solution**: Add limits, use more specific filters

### CONFIG_001: Missing Configuration

**Cause**: Required configuration missing
**Solution**: Check SEED_PHRASE and MCP configuration

### CONFIG_002: Invalid Environment

**Cause**: Environment variables not properly set
**Solution**: Verify .env file and environment variable syntax

## Debug Mode

Enable comprehensive debugging:

```bash
# Full debug mode
DEBUG=true npm run dev

# Specific debug categories
DEBUG=permamind:memory npm run dev
DEBUG=permamind:ao npm run dev
DEBUG=permamind:search npm run dev
```

Debug output helps identify:

- Network requests and responses
- Memory operation details
- AO message construction
- Search query processing
- Configuration loading

## Getting Additional Help

### 1. Check Logs

```bash
# Enable detailed logging
DEBUG=true npm run dev 2>&1 | tee permamind.log
```

### 2. Gather System Information

```bash
# System info for bug reports
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"
echo "Permamind: $(npm list -g permamind)"
```

### 3. Test with Minimal Configuration

```bash
# Minimal test
node -e "
const server = require('./dist/server.js');
console.log('Server tools:', Object.keys(server.tools || {}));
"
```

### 4. Community Support

- **GitHub Issues**: [Report bugs and issues](https://github.com/ALLiDoizCode/Permamind/issues)
- **GitHub Discussions**: [Ask questions](https://github.com/ALLiDoizCode/Permamind/discussions)
- **Discord**: Community chat (coming soon)

### 5. Creating Bug Reports

Include this information:

- **Environment**: OS, Node.js version, npm version
- **Configuration**: MCP client, configuration files (redact sensitive data)
- **Steps to reproduce**: Exact steps that cause the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Logs**: Debug output and error messages
- **Workarounds**: Any temporary solutions found

This troubleshooting guide covers the most common issues users encounter with Permamind. For additional help, consult the community resources or create a detailed bug report.
