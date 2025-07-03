# 🚀 Installation & Quick Start

Get Permamind up and running in 5 minutes! This guide covers everything from prerequisites to your first AI memory operations.

---

## Prerequisites

Before installing Permamind, ensure you have:

- **Node.js 20+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- An **MCP-compatible client** (Claude Desktop, VS Code, Cursor)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/ALLiDoizCode/Permamind.git
cd Permamind

# Install dependencies
npm install
```

---

## 2. Build & Test

```bash
# Build the project
npm run build

# Run tests to verify installation
npm test

# Start development server (optional)
npm run dev
```

If all tests pass, you're ready to configure your MCP client!

---

## 3. Configure MCP Client

### For Claude Desktop

1. **Locate your config file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add Permamind configuration:**

```json
{
  "mcpServers": {
    "permamind": {
      "command": "tsx",
      "args": ["/absolute/path/to/Permamind/src/server.ts"],
      "env": {
        "SEED_PHRASE": "your_optional_seed_phrase_here"
      }
    }
  }
}
```

> **💡 Pro Tip**: Use absolute paths to avoid configuration issues.

### For VS Code/Cursor

1. Install the MCP extension from your editor's marketplace
2. Add Permamind server configuration to your settings
3. Restart your editor

### For Custom MCP Clients

Permamind follows the standard MCP protocol. Connect using:

- **Transport**: Server-sent events (SSE) or stdio
- **Command**: `tsx src/server.ts`
- **Working Directory**: Your Permamind installation path

---

## 4. Generate Your Identity (Optional)

For persistent memory across sessions, generate a seed phrase:

```bash
# Generate a new 12-word seed phrase
node -e "
const { generateMnemonic } = require('bip39');
console.log('Your seed phrase:', generateMnemonic());
console.log('⚠️  Save this securely - it controls your permanent memory!');
"
```

**Important Security Notes:**

- 🔐 Store your seed phrase securely (password manager recommended)
- 🚫 Never share your seed phrase
- 💾 This phrase controls your permanent Arweave identity
- 🔄 Without it, you'll get a new random identity each session

---

## 5. Verify Installation

Test your installation using the `getServerInfo` tool in your MCP client:

```javascript
// This should return server status and identity information
await mcp.getServerInfo();
```

**Expected output:**

```json
{
  "success": true,
  "data": {
    "serverName": "Permamind",
    "version": "1.x.x",
    "aoAddress": "your-arweave-address",
    "hubProcessId": "your-hub-process-id",
    "networkStatus": "connected"
  }
}
```

---

## 6. Your First Memory Operation

Store your first permanent AI memory:

```javascript
// Store a basic memory
await mcp.addMemory({
  content: "I prefer TypeScript for all new projects",
  role: "user",
  p: "your-public-key", // Optional: uses default identity if omitted
});

// Store an enhanced memory with AI metadata
await mcp.addMemoryEnhanced({
  content: "Learned how to implement JWT authentication with refresh tokens",
  importance: 0.8,
  memoryType: "knowledge",
  context: {
    sessionId: "learning_session_2024",
    topic: "authentication",
    domain: "web_development",
  },
  metadata: {
    tags: ["security", "jwt", "best-practices"],
  },
});
```

---

## 7. Test Advanced Features

### Search Your Memories

```javascript
// Basic search
const results = await mcp.searchMemories({
  query: "authentication",
  limit: 10,
});

// Advanced search with filters
const filteredResults = await mcp.searchMemoriesAdvanced({
  query: "TypeScript",
  filters: {
    memoryType: ["knowledge", "procedure"],
    importanceRange: { min: 0.5, max: 1.0 },
    tags: ["best-practices"],
  },
  ranking: "importance",
});
```

### Create Memory Relationships

```javascript
// Link related memories
await mcp.linkMemories({
  sourceMemoryId: "jwt_memory_id",
  targetMemoryId: "security_memory_id",
  relationshipType: "supports",
  strength: 0.9,
});
```

---

## Environment Configuration

### Environment Variables

Create a `.env` file (optional):

```bash
# Required: Your Arweave wallet seed phrase
SEED_PHRASE="word1 word2 word3 ... word12"

# Optional: Development settings
NODE_ENV=development
DEBUG=true
MCP_LOG_LEVEL=info

# Optional: Custom AO network endpoints
AO_CU_URL=https://cu.velocity.cloudnet.marshal.ao
AO_MU_URL=https://mu.velocity.cloudnet.marshal.ao
AO_GATEWAY_URL=https://gateway.velocity.cloudnet.marshal.ao
```

### Package Scripts Reference

```bash
# Development
npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm run start        # Production server

# Quality Assurance
npm run lint         # ESLint + Prettier check
npm run format       # Auto-fix formatting
npm run type-check   # TypeScript validation
npm test             # Run test suite
npm run test:coverage # Coverage report

# CI/CD Pipeline
npm run ci:quality   # Full quality check (lint + type + test + audit)
npm run audit        # Security audit
```

---

## Troubleshooting Quick Start

### ❌ "SEED_PHRASE not set" Warning

This is normal! Permamind will generate a random identity. For persistent memory:

```bash
# Generate and use a seed phrase
export SEED_PHRASE="$(node -e 'console.log(require("bip39").generateMnemonic())')"
```

### ❌ MCP Client Connection Issues

1. **Check Node.js version**: `node --version` (should be 20+)
2. **Verify build**: `npm run build`
3. **Check paths**: Use absolute paths in MCP config
4. **Restart client**: Restart Claude Desktop, VS Code, etc.

### ❌ AO Network Issues

- Default uses Marshal testnet (free, no setup required)
- Check network status: [Marshal AO Twitter](https://x.com/Marshal_AO)
- Firewall: Ensure outbound HTTPS connections are allowed

### ❌ Import/Module Errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Next Steps

🎉 **Congratulations!** Permamind is now running. Here's what to explore next:

1. **[📖 MCP Tools Reference](tools-reference.md)** - Learn all available tools
2. **[💡 Usage Examples](examples.md)** - Practical patterns and code samples
3. **[🏗 Architecture Guide](architecture.md)** - Deep dive into configuration
4. **[🌐 AO Integration](ao-integration.md)** - Connect custom AO processes

---

## Development Workflow

For contributors and advanced users:

```bash
# Development setup
git clone https://github.com/ALLiDoizCode/Permamind.git
cd Permamind
npm install

# Development workflow
npm run dev        # Start development server
npm run test:watch # Run tests in watch mode
npm run lint       # Check code quality
npm run format     # Fix formatting

# Pre-commit checks
npm run ci:quality # Run full quality pipeline
```

---

## Getting Help

- 📖 **Documentation**: [docs/](../docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ALLiDoizCode/Permamind/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/ALLiDoizCode/Permamind/discussions)
- 🐦 **Updates**: Follow [@ALLiDoizCode](https://twitter.com/ALLiDoizCode)

---

**🎯 Ready to build the future of AI memory? Let's go!**

[Next: MCP Tools Reference →](tools-reference.md)
