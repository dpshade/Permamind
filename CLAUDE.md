# Permamind - Project Context for Claude Code

## Project Overview

Permamind is an MCP (Model Context Protocol) server that provides an immortal memory layer for AI agents and clients. It leverages Arweave's permanent storage and the AO (Autonomous Objects) ecosystem to create persistent, decentralized AI memory.

## Architecture

### Core Technologies

- **TypeScript** - Primary language with strict type checking
- **FastMCP** - TypeScript MCP server framework
- **AO Connect** - Interface to AO ecosystem (@permaweb/aoconnect)
- **Arweave** - Permanent data storage
- **Vitest** - Testing framework with comprehensive coverage
- **Node.js 20+** - Runtime environment

### Key Directories

```
src/
├── services/          # Core business logic services
├── models/           # Data models and TypeScript interfaces
├── types/            # Type definitions
├── constants.ts      # Configuration constants
├── process.ts        # AO process creation and messaging
├── relay.ts          # Arweave data relay functions
└── server.ts         # Main MCP server implementation

.claude/commands/     # Claude Code slash commands
├── cleanup.md        # Comprehensive code analysis
├── tdd.md           # Test-driven development workflow
├── prepush.md       # Pre-push validation
├── ship.md          # Complete pre-GitHub push workflow
├── epcc.md          # Explore, Plan, Code, Commit workflow
├── prime.md         # Load all documentation context
└── visual.md        # Visual development workflow
```

## Development Workflow

### Available Commands

- `/ship` - Complete pre-GitHub push workflow (cleanup → tdd → prepush)
- `/cleanup` - Comprehensive codebase analysis and housekeeping
- `/tdd` - Test-driven development validation
- `/prepush` - Pre-push validation and CI simulation
- `/epcc` - Structured development workflow
- `/prime` - Load all documentation context
- `/visual` - Visual development workflow

### Package Scripts

```json
{
  "build": "tsc",
  "start": "tsx src/server.ts",
  "dev": "fastmcp dev src/server.ts",
  "lint": "prettier --check . && eslint . && tsc --noEmit",
  "format": "prettier --write . && eslint --fix .",
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "ci:quality": "npm run lint && npm run type-check && npm run test:coverage && npm run audit && npm run build"
}
```

## Coding Standards

### TypeScript Guidelines

- **Strict Mode**: Full TypeScript strict mode enabled
- **Imports**: Use ES modules with `.js` extensions for local imports
- **Types**: Explicit typing preferred, avoid `any`
- **Interfaces**: Use interfaces for data structures
- **Error Handling**: Comprehensive try-catch with meaningful error messages

### Code Style

- **Prettier**: Auto-formatting with project configuration
- **ESLint**: Linting with TypeScript ESLint configuration
- **Line Length**: 100 characters maximum
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Required

### File Naming

- **Services**: PascalCase with Service suffix (`AIMemoryService.ts`)
- **Models**: PascalCase (`AIMemory.ts`, `WorkflowDefinition.ts`)
- **Tests**: `.unit.test.ts` or `.integration.test.ts` suffix
- **Constants**: camelCase with descriptive names

## AO Ecosystem Integration

### Key Concepts

- **Processes**: Long-running computational units in AO
- **Messages**: Data/instruction packets sent to processes
- **Tags**: Metadata attached to messages for routing/filtering
- **Handlers**: Process functions that respond to specific message types
- **Schedulers**: Units that manage process execution timing

### AO Message Structure

```typescript
interface AOMessage {
  processId: string;
  tags: { name: string; value: string }[];
  data?: string;
  signer: DataItemSigner;
  scheduler: string;
}
```

### Process Creation Pattern

```typescript
import { spawn, createDataItemSigner } from "@permaweb/aoconnect";

const processId = await spawn({
  module: AOS_MODULE(),
  scheduler: SCHEDULER(),
  signer: createDataItemSigner(keyPair),
  tags: optionalTags,
});
```

## MCP Server Architecture

### Tool Definitions

- Use Zod schemas for parameter validation
- Provide comprehensive descriptions for AI understanding
- Return structured responses with success/error states
- Handle asynchronous operations properly

### Resource Management

- Memory operations through aiMemoryService
- Workflow operations through WorkflowHubService
- AO messaging through AOMessageService and MarkdownWorkflowService

### Error Handling

```typescript
try {
  const result = await operation();
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: {
      code: "OPERATION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error",
      details: error,
    },
  };
}
```

## Testing Strategy

### Test Structure

- **Unit Tests**: Individual service and model testing
- **Integration Tests**: Cross-service functionality
- **Coverage Targets**: 90% functions, 85% lines, 75% branches

### Testing Patterns

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock external dependencies
vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

describe("ServiceName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle normal operation", async () => {
    // Test implementation
  });
});
```

## Memory System

### AI Memory Types

- **conversation**: Chat interactions and context
- **knowledge**: Factual information and learning
- **procedure**: Step-by-step processes and methods
- **reasoning**: Decision trees and logic chains
- **enhancement**: Code improvements and optimizations
- **performance**: Metrics and benchmarking data

### Memory Features

- **Enhanced Search**: Advanced filtering with importance scoring
- **Memory Linking**: Create relationships between memories
- **Analytics**: Pattern analysis and usage insights
- **Batch Operations**: Efficient bulk memory operations

## Security Considerations

### Key Management

- Wallet keys stored securely in environment variables
- Mnemonic phrase generation for deterministic keys
- No hardcoded secrets or credentials in code

### Input Validation

- All user inputs validated with Zod schemas
- Sanitization of data before AO message construction
- Rate limiting and error handling for external calls

### Audit Requirements

- Regular dependency auditing (`npm audit`)
- Security scanning in CI/CD pipeline
- No debug logging in production code

## Performance Guidelines

### Optimization Patterns

- Async/await for all I/O operations
- Proper error boundaries and timeouts
- Efficient data structures for large datasets
- Lazy loading for optional dependencies

### Memory Management

- Clean up event listeners and timers
- Avoid memory leaks in long-running processes
- Monitor heap usage in development

## Git Workflow

### Branch Strategy

- **main**: Production-ready code
- **feature/\***: Feature development branches
- **fix/\***: Bug fix branches

### Commit Standards

- Conventional commits with scope
- Descriptive commit messages
- Co-authored attribution for AI assistance

### Pre-Push Validation

- Automated debug log removal
- Code quality checks (lint, format, type-check)
- Complete test suite execution
- Security audit and dependency validation

## Environment Configuration

### Required Environment Variables

```bash
SEED_PHRASE=your_arweave_wallet_mnemonic
NODE_ENV=development|production
```

### Optional Configuration

```bash
DEBUG=true                    # Enable debug mode
MCP_LOG_LEVEL=info           # MCP logging level
TEST_TIMEOUT=60000           # Test timeout in ms
```

## Integration Points

### Velocity Protocol

- Decentralized social/operational network for AO
- Hub registry for memory storage
- Zone-based organization and permissions

### FastMCP Features

- Server-sent events (SSE) transport
- Tool, resource, and prompt definitions
- Authentication and session management
- Standard schema support (Zod validation)

## Development Best Practices

### Code Organization

- Single responsibility principle for services
- Clear separation of concerns
- Dependency injection where appropriate
- Immutable data structures when possible

### Documentation

- JSDoc comments for public APIs
- README files for complex modules
- Architecture diagrams for system overview
- Change logs for version tracking

### Monitoring and Debugging

- Structured logging with context
- Error tracking and reporting
- Performance monitoring
- Health check endpoints

## Common Patterns

### Service Implementation

```typescript
export class ServiceName {
  constructor(private dependency: DependencyType) {}

  async operation(params: ParamsType): Promise<ResultType> {
    try {
      // Implementation
      return result;
    } catch (error) {
      throw new Error(`ServiceName.operation failed: ${error}`);
    }
  }
}
```

### Setup and Initialization

```typescript
// Interactive setup with keypair generation and hub creation
const setupResult = await setupPermamind({
  generateKeypair: true, // Create temporary wallet
  createHub: true, // Create memory hub
});

// Check setup status
const healthCheck = await healthCheck();
```

### Memory Storage

```typescript
const memory: Partial<AIMemory> = {
  content: "Memory content",
  memoryType: "knowledge",
  importance: 0.8,
  context: { sessionId, topic, domain },
};

await aiMemoryService.addEnhanced(signer, hubId, memory);
```

### First-Time Setup Flow

1. **Check Status**: Use `setupPermamind()` to check current configuration
2. **Generate Wallet**: Use `setupPermamind({ generateKeypair: true })` for temporary wallet
3. **Create Hub**: Use `setupPermamind({ createHub: true })` for memory storage
4. **Complete Setup**: Use `setupPermamind({ generateKeypair: true, createHub: true })` for full setup
5. **Verify**: Use `healthCheck()` to confirm everything is working

For permanent storage, set the `SEED_PHRASE` environment variable before starting Claude Desktop.

This project provides a robust, decentralized AI memory layer using Arweave for permanent storage and AO for computational capabilities, all standardized through the MCP protocol.
