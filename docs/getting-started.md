# Getting Started with Permamind

Welcome to Permamind! This guide will help you set up and start using the world's first permanent, decentralized AI memory system.

## Overview

Permamind provides immortal memory for AI agents using Arweave's permanent storage and the AO (Autonomous Objects) ecosystem. Unlike traditional memory systems that are ephemeral, Permamind creates persistent AI memory that survives forever.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20 or higher** ([Download here](https://nodejs.org/))
- **Git** ([Download here](https://git-scm.com/))
- An **MCP-compatible client** (Claude Desktop recommended)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be 20.0.0 or higher

# Check Git installation
git --version

# Check npm (comes with Node.js)
npm --version
```

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/ALLiDoizCode/Permamind.git
cd Permamind
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- TypeScript compiler and types
- FastMCP framework
- AO Connect libraries
- Testing frameworks (Vitest)
- Code quality tools (ESLint, Prettier)

### Step 3: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript and prepares the server for execution.

### Step 4: Run Tests (Optional but Recommended)

```bash
npm test
```

This verifies your installation is working correctly. You should see output indicating all tests pass.

## Configuration

### Option 1: Quick Start (Temporary Identity)

For immediate testing, you can run Permamind without any configuration:

```bash
npm run dev
```

This will:
- Generate a temporary wallet identity
- Create a memory hub on AO
- Start the MCP server
- Display your temporary identity information

⚠️ **Warning**: Temporary identities are not persistent. Your memories will be lost when you restart without a seed phrase.

### Option 2: Persistent Identity (Recommended)

For permanent memory storage, generate a seed phrase:

```bash
# Generate a secure 12-word seed phrase
node -e "
const { generateMnemonic } = require('bip39');
console.log('🔑 Your seed phrase:');
console.log(generateMnemonic());
console.log('');
console.log('⚠️  IMPORTANT: Save this securely!');
console.log('This controls access to your permanent memories.');
"
```

Save the generated seed phrase securely, then set it as an environment variable:

```bash
# Linux/macOS (Bash/Zsh)
export SEED_PHRASE="your twelve word seed phrase here"

# Linux/macOS (Fish)
set -x SEED_PHRASE "your twelve word seed phrase here"

# Windows (Command Prompt)
set SEED_PHRASE=your twelve word seed phrase here

# Windows (PowerShell)
$env:SEED_PHRASE="your twelve word seed phrase here"
```

### Environment File Setup

Create a `.env` file in the project root for persistent configuration:

```bash
# Create .env file
cat > .env << 'EOF'
# Your Arweave wallet seed phrase (12 words)
SEED_PHRASE=your twelve word seed phrase here

# Optional: Development settings
NODE_ENV=development
DEBUG=true
MCP_LOG_LEVEL=info
EOF
```

## MCP Client Setup

### Claude Desktop (Recommended)

1. **Locate your Claude Desktop config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add Permamind configuration:**

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

3. **Replace the path** with your actual Permamind installation path

4. **Restart Claude Desktop**

### VS Code with MCP Extension

1. **Install the MCP extension** from the VS Code marketplace
2. **Open Command Palette** (`Cmd/Ctrl + Shift + P`)
3. **Run**: "MCP: Add Server"
4. **Configure Permamind**:
   - Name: `permamind`
   - Command: `tsx`
   - Args: `["/path/to/Permamind/src/server.ts"]`
   - Environment: `{"SEED_PHRASE": "your_seed_phrase_here"}`

### Cursor IDE

1. **Open Settings** (`Cmd/Ctrl + ,`)
2. **Search for**: "MCP"
3. **Add server configuration**:
```json
{
  "mcp.servers": {
    "permamind": {
      "command": "tsx",
      "args": ["/path/to/Permamind/src/server.ts"],
      "env": {
        "SEED_PHRASE": "your_seed_phrase_here"
      }
    }
  }
}
```

## Verification

### Test Installation

Start the development server:

```bash
npm run dev
```

You should see output similar to:

```
Permamind MCP Server starting...
🔑 Wallet Address: abc123...
🏠 Hub ID: xyz789...
🚀 MCP Server ready on stdio
```

### Test MCP Connection

In your MCP client (Claude Desktop), try using the `getServerInfo` tool:

**Request**: "Use the getServerInfo tool to check my Permamind server status"

**Expected Response**: Information about your server including wallet address, hub ID, and available tools.

### Test Basic Memory Operations

Try storing your first memory:

**Request**: "Add a memory that I prefer TypeScript over JavaScript using the addMemory tool"

**Follow up**: "Search for memories about TypeScript using searchMemories"

## First Steps

### 1. Store Your First Enhanced Memory

```javascript
// Using addMemoryEnhanced tool
{
  "content": "I'm learning Permamind - a permanent AI memory system",
  "importance": 0.8,
  "memoryType": "knowledge",
  "context": {
    "sessionId": "getting_started_2024",
    "topic": "permamind_learning",
    "domain": "ai_tools"
  },
  "metadata": {
    "tags": ["learning", "permamind", "ai-memory"]
  },
  "p": "your_wallet_address"
}
```

### 2. Create Your First Token

```javascript
// Using createSimpleToken tool
{
  "name": "My First Token",
  "ticker": "MFT",
  "description": "Learning token creation with Permamind",
  "initialSupply": 1000000,
  "mintable": true,
  "transferable": true,
  "burnable": false
}
```

### 3. Explore Process Communication

```javascript
// Using executeProcessAction tool
{
  "processId": "your_token_process_id",
  "request": "What's my current balance?",
  "processMarkdown": `
# Token Process
## balance
Get current token balance
- account: wallet address (optional)
`
}
```

## Common Operations

### Memory Management

- **Store conversations**: Use `addMemory` for basic chat history
- **Store knowledge**: Use `addMemoryEnhanced` with metadata and importance scoring
- **Search memories**: Use `searchMemoriesAdvanced` with filters
- **Link concepts**: Use `linkMemories` to create knowledge graphs
- **Track reasoning**: Use `addReasoningChain` to document AI decision processes

### AO Process Integration

- **Token operations**: Use `executeTokenRequest` for simple token interactions
- **Complex processes**: Use `executeProcessAction` with markdown documentation
- **Create tokens**: Use `createSimpleToken` or `createAdvancedToken`

### Analytics & Insights

- **Usage patterns**: Use `getMemoryAnalytics` to understand memory usage
- **Relationships**: Use `getMemoryRelationships` to explore knowledge graphs

## Troubleshooting

### Common Issues

**"Command not found" errors**
- Ensure Node.js 20+ is installed
- Verify TypeScript is available: `npx tsx --version`
- Use full paths in MCP configuration

**"SEED_PHRASE not set" warnings**
- Generate a seed phrase with the command above
- Set it as an environment variable or in .env file
- The server will work without it but memories won't persist

**MCP client connection issues**
- Verify JSON syntax in configuration files
- Check file paths are absolute, not relative
- Restart your MCP client after configuration changes

**Memory operations fail**
- Check internet connection (requires access to AO network)
- Wait 30-60 seconds for AO message propagation
- Use `getServerInfo` to verify hub deployment

### Debug Mode

Enable verbose logging:

```bash
DEBUG=true npm run dev
```

This will show detailed logs about:
- Wallet generation and loading
- Hub creation and registration
- AO message sending and receiving
- Memory operations and storage

### Getting Help

If you encounter issues:

1. **Check the logs** with debug mode enabled
2. **Verify prerequisites** are installed correctly
3. **Review configuration** syntax and paths
4. **Consult the troubleshooting guide**: [docs/troubleshooting.md](./troubleshooting.md)
5. **Open an issue**: [GitHub Issues](https://github.com/ALLiDoizCode/Permamind/issues)

## Next Steps

Now that you have Permamind running:

1. **Read the Architecture Guide**: [docs/architecture.md](./architecture.md)
2. **Explore API Reference**: [docs/api-reference.md](./api-reference.md)
3. **Try Examples**: [examples/](../examples/)
4. **Learn about Memory Systems**: [docs/memory-system.md](./memory-system.md)
5. **Integrate AO Processes**: [docs/ao-integration.md](./ao-integration.md)

Welcome to the future of permanent AI memory! 🧠⚡️