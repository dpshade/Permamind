# Permamind

An MCP server that provides an immortal memory layer for AI agents and clients using AO/Arweave.

This MCP server leverages the Velocity Protocol on AO and Arweave (the permaweb) as the datastore, providing permanent, decentralized memory storage with advanced AI-specific features for reasoning, knowledge management, and multi-agent coordination.

## 🚀 Features

### Core Memory Operations

- **Immortal Storage**: Permanent memory storage on Arweave blockchain
- **Decentralized Architecture**: Velocity Protocol hubs for distributed memory access
- **MCP Integration**: Native Model Context Protocol support for AI agents

### AI-Enhanced Memory Features

- **Semantic Memory Organization**: Rich metadata and contextual information
- **Importance Scoring**: Relevance-based memory prioritization (0-1 scale)
- **Memory Type Classification**: Conversation, reasoning, knowledge, and procedural memories
- **Advanced Search**: Multi-filter search with relevance ranking
- **Memory Analytics**: Usage patterns and optimization insights
- **Batch Operations**: Efficient bulk memory operations

### Knowledge Graph Capabilities

- **Memory Relationships**: Link related memories with typed relationships
- **Reasoning Chain Storage**: Document AI decision-making processes
- **Knowledge Networks**: Build interconnected concept maps
- **Cross-Reference Support**: Navigate related information efficiently

### Multi-Agent Coordination

- **Shared Memory Spaces**: Collaborative memory building between AI agents
- **Access Control**: Permission-based memory sharing
- **Conflict Resolution**: Handle concurrent memory updates
- **Hub Discovery**: Find and connect to specialized memory hubs

## 📋 MCP Tools

### Basic Memory Operations

- **`addMemory`** - Store basic conversation memories
- **`getAllMemories`** - Retrieve all stored memories
- **`getAllMemoriesForConversation`** - Get memories for specific conversations
- **`searchMemories`** - Keyword-based memory search
- **`getServerInfo`** - Get server identity and hub information

### Enhanced AI Memory Operations

- **`addMemoryEnhanced`** - Store memories with AI-specific metadata
- **`searchMemoriesAdvanced`** - Advanced search with filters and ranking
- **`linkMemories`** - Create relationships between memories
- **`addReasoningChain`** - Store AI reasoning processes and decision paths
- **`getMemoryAnalytics`** - Get memory usage analytics and patterns
- **`addMemoriesBatch`** - Efficient batch memory operations

## 🛠 Development

### Quick Start

```bash
git clone https://github.com/ALLiDoizCode/Permamind.git
cd Permamind
npm install
npm run build
npm run dev
```

### Environment Setup

Create a `.env` file with your seed phrase (optional):

```
SEED_PHRASE=your_mnemonic_seed_phrase_here
```

If no seed phrase is provided, the server will generate one automatically (not persistent across restarts).

### Available Scripts

- **`npm run build`** - Build TypeScript to JavaScript
- **`npm run start`** - Start the production server
- **`npm run dev`** - Start development server with hot reload
- **`npm run lint`** - Run linting and type checking
- **`npm run format`** - Format code with Prettier
- **`npm test`** - Run tests

### Server Setup

The server will automatically:

1. Generate or load wallet keys
2. Register with the hub registry
3. Deploy hub infrastructure on AO
4. Start the MCP server on stdio

To fund your server for AO operations:

1. Get your server's public key: use the `getServerInfo` tool
2. Transfer AO tokens to that address
3. The default environment uses Marshal testnet (currently **FREE**)

## 🧠 AI Memory Architecture

### Memory Types

- **`conversation`** - Dialog and interaction memories
- **`reasoning`** - AI decision-making processes and logic chains
- **`knowledge`** - Factual information and learned concepts
- **`procedure`** - Step-by-step processes and methodologies

### Memory Metadata

Each enhanced memory includes:

- **Importance Score** (0-1): Relevance and priority weighting
- **Context Information**: Session ID, topic, domain, related memories
- **Access Patterns**: Usage tracking and optimization data
- **Custom Tags**: Flexible categorization and labeling
- **Relationships**: Links to related memories with typed connections

### Relationship Types

- **`causes`** - Causal relationships (A leads to B)
- **`supports`** - Evidence or reinforcement relationships
- **`contradicts`** - Conflicting or opposing information
- **`extends`** - Elaboration or expansion relationships
- **`references`** - Citation or mention relationships

## 🔧 Configuration

### Velocity Protocol Integration

Permamind uses the Velocity Protocol for:

- **Hub Registry**: Decentralized hub discovery at `g_eSbkmD4LzfZtXaCLmeMcLIBQrqxnY-oFQJJNMIn4w`
- **Event Storage**: Structured event-based memory storage
- **Message Routing**: Efficient memory access and synchronization
- **Protocol Compliance**: Standard Kind system with AI extensions

### AO Network Configuration

Default network endpoints (Marshal testnet):

- **Compute Unit**: `https://cu.velocity.cloudnet.marshal.ao`
- **Message Unit**: `https://mu.velocity.cloudnet.marshal.ao`
- **Gateway**: `https://gateway.velocity.cloudnet.marshal.ao`
- **Scheduler**: `Tm7v2ddwSr_5UxjmuCmhkMSZpzhtKJkkpLMZK_p6mQU`

## 📖 Usage Examples

### Basic Memory Storage

```javascript
// Store a simple conversation memory
await mcp.addMemory({
  content: "User prefers TypeScript over JavaScript",
  role: "system",
  p: "user_public_key",
});
```

### Enhanced Memory with AI Metadata

```javascript
// Store memory with AI-specific features
await mcp.addMemoryEnhanced({
  content: "Implemented authentication using JWT tokens",
  role: "system",
  p: "user_public_key",
  importance: 0.8,
  memoryType: "knowledge",
  sessionId: "project_setup_session",
  topic: "authentication",
  domain: "web_development",
  tags: "security,jwt,implementation",
});
```

### Advanced Memory Search

```javascript
// Search with filters and ranking
const memories = await mcp.searchMemoriesAdvanced({
  query: "authentication security",
  memoryType: "knowledge",
  importanceThreshold: 0.5,
  domain: "web_development",
  startDate: "2024-01-01T00:00:00Z",
});
```

### Knowledge Graph Building

```javascript
// Link related memories
await mcp.linkMemories({
  sourceMemoryId: "auth_implementation_memory",
  targetMemoryId: "security_best_practices_memory",
  relationshipType: "supports",
  strength: 0.9,
});
```

### Reasoning Chain Documentation

```javascript
// Store AI reasoning process
await mcp.addReasoningChain({
  chainId: "auth_decision_chain",
  steps: JSON.stringify([
    {
      stepType: "observation",
      content: "User needs secure authentication",
      confidence: 0.95,
      timestamp: "2024-01-01T10:00:00Z",
    },
    {
      stepType: "thought",
      content: "JWT tokens provide stateless authentication",
      confidence: 0.8,
      timestamp: "2024-01-01T10:01:00Z",
    },
    {
      stepType: "action",
      content: "Implement JWT-based authentication system",
      confidence: 0.9,
      timestamp: "2024-01-01T10:02:00Z",
    },
  ]),
  outcome: "Successfully implemented JWT authentication",
  p: "user_public_key",
});
```

## 🌐 Velocity Protocol Extensions

Permamind implements AI-specific extensions to the Velocity Protocol:

### New Kind Types (Proposed VIP)

- **Kind "10"** - Enhanced AI Memory (extends basic memory with metadata)
- **Kind "11"** - Memory Relationships (links between memories)
- **Kind "23"** - Reasoning Chains (AI decision processes)
- **Kind "40"** - Memory Contexts (grouped memory spaces)

### AI-Specific Event Tags

- **`ai_importance`** - Memory importance score (0-1)
- **`ai_type`** - Memory type classification
- **`ai_context`** - Rich contextual metadata (JSON)
- **`ai_session`** - Session/conversation identifier
- **`ai_topic`** - Memory topic or subject
- **`ai_domain`** - Domain or category
- **`ai_tag`** - Custom memory tags

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines and:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: https://github.com/ALLiDoizCode/Permamind
- **Velocity Protocol**: https://github.com/SpaceTurtle-Dao/velocity-protocol
- **AO Cookbook**: https://github.com/permaweb/ao-cookbook
- **Arweave**: https://arweave.org
- **Marshal AO Testnet**: https://x.com/Marshal_AO

## 🙏 Acknowledgments

- AO and Arweave teams for the permanent compute and storage layers
- MCP community for the standardized AI tool interface
- Contributors and early adopters of Permamind

---

**Building the future of AI memory with permanent, decentralized storage** 🧠⚡️
