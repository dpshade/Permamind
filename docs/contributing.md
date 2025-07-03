# Contributing to Permamind

Thank you for your interest in contributing to Permamind! This guide will help you get started with contributing to the world's first permanent, decentralized AI memory system.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Areas](#contributing-areas)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- **Node.js 20+** installed
- **Git** for version control
- Basic knowledge of **TypeScript**, **AO**, and **Arweave**
- Understanding of **Model Context Protocol (MCP)**

### Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/Permamind.git
   cd Permamind
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Run tests**:
   ```bash
   npm test
   ```

## Development Setup

### Environment Setup

1. **Create a development environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Generate a development seed phrase**:
   ```bash
   node -e "
   const { generateMnemonic } = require('bip39');
   console.log('DEV_SEED_PHRASE=' + generateMnemonic());
   " >> .env
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Development Scripts

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
npm run ci:quality   # Full quality check
```

### Project Structure

```
src/
├── server.ts              # Main MCP server
├── services/              # Core business logic
│   ├── aiMemoryService.ts      # AI memory operations
│   ├── AOMessageService.ts     # AO message handling
│   ├── ProcessCommunicationService.ts # Process integration
│   ├── DefaultProcessService.ts # Auto-detection
│   ├── tokenservice.ts         # Token operations
│   └── simpleToken.ts          # Simple token creation
├── models/                # Data models and types
│   ├── AIMemory.ts            # AI memory interfaces
│   ├── Memory.ts              # Basic memory model
│   ├── Tag.ts                 # AO tag interface
│   └── Profile.ts             # User profile model
├── templates/             # Process templates
│   └── defaultTokenProcess.ts  # Token process template
├── utils/                 # Utility functions
│   └── vip01Processing.ts     # Velocity protocol utils
├── constants.ts           # Configuration constants
├── process.ts             # AO process creation
└── relay.ts               # Arweave data relay

tests/                     # Test suites
├── unit/                  # Unit tests
├── integration/           # Integration tests
└── e2e/                   # End-to-end tests

docs/                      # Documentation
├── getting-started.md     # Setup guide
├── architecture.md        # System design
├── api-reference.md       # Tool documentation
├── memory-system.md       # Memory concepts
├── ao-integration.md      # AO process guide
└── troubleshooting.md     # Problem solving

examples/                  # Usage examples
├── basic-memory.md        # Basic operations
├── advanced-search.md     # Search patterns
└── token-operations.md    # Token examples
```

## Contributing Areas

### 🧠 Memory Systems

**Areas for contribution**:
- Enhanced memory algorithms
- New memory relationship types
- Improved importance scoring
- Memory consolidation strategies
- Advanced analytics

**Getting started**:
1. Study `src/services/aiMemoryService.ts`
2. Review memory models in `src/models/`
3. Check existing tests for patterns
4. Propose improvements via GitHub issues

### 🌐 AO Integration

**Areas for contribution**:
- New process type templates
- Natural language processing improvements
- Parameter extraction patterns
- Response interpretation
- Error handling

**Getting started**:
1. Review `src/services/ProcessCommunicationService.ts`
2. Study `src/templates/defaultTokenProcess.ts`
3. Read AO documentation
4. Test with real AO processes

### 🔍 Search & Analytics

**Areas for contribution**:
- Search algorithm improvements
- New filtering capabilities
- Performance optimizations
- Faceted search features
- Memory usage analytics

**Getting started**:
1. Examine search implementation in `aiMemoryService.ts`
2. Review VIP01 processing utilities
3. Study search test cases
4. Benchmark search performance

### 📚 Documentation & Examples

**Areas for contribution**:
- Tutorial improvements
- New usage examples
- API documentation updates
- Architecture explanations
- Troubleshooting guides

**Getting started**:
1. Review existing documentation in `docs/`
2. Try examples and find gaps
3. Improve clarity and completeness
4. Add real-world use cases

### 🧪 Testing & Quality

**Areas for contribution**:
- Increase test coverage
- Add integration tests
- Performance benchmarks
- Edge case testing
- CI/CD improvements

**Getting started**:
1. Review test structure in `tests/`
2. Check coverage reports
3. Identify untested code paths
4. Add comprehensive test cases

### 🛡 Security & Performance

**Areas for contribution**:
- Security audit and improvements
- Performance optimizations
- Memory leak detection
- Rate limiting enhancements
- Error handling improvements

**Getting started**:
1. Review security considerations
2. Profile performance bottlenecks
3. Study error handling patterns
4. Propose security improvements

## Code Standards

### TypeScript Guidelines

1. **Strict Mode**: Full TypeScript strict mode enabled
2. **Explicit Types**: Prefer explicit typing over `any`
3. **Interfaces**: Use interfaces for data structures
4. **Immutability**: Prefer immutable data patterns
5. **Error Handling**: Comprehensive error handling

**Example**:
```typescript
interface MemoryCreateRequest {
  content: string;
  importance: number;
  memoryType: MemoryType;
  context: MemoryContext;
}

export async function createMemory(
  request: MemoryCreateRequest
): Promise<MemoryCreateResponse> {
  try {
    // Implementation with proper error handling
    return { success: true, memoryId: "mem_123" };
  } catch (error) {
    throw new Error(`Memory creation failed: ${error}`);
  }
}
```

### Code Style

1. **Prettier**: Auto-formatting with project configuration
2. **ESLint**: Follow TypeScript ESLint rules
3. **Naming**: Use descriptive, consistent naming
4. **Comments**: JSDoc for public APIs, inline for complex logic
5. **Imports**: ES modules with `.js` extensions for local imports

**Example**:
```typescript
/**
 * Creates an enhanced AI memory with metadata and relationships
 * @param signer - Arweave wallet for signing transactions
 * @param hubId - Target memory hub process ID
 * @param memory - Memory data with AI-specific metadata
 * @returns Promise resolving to memory creation result
 */
export async function addEnhanced(
  signer: JWKInterface,
  hubId: string,
  memory: Partial<AIMemory>
): Promise<string> {
  // Implementation
}
```

### File Organization

1. **Services**: Business logic in `src/services/`
2. **Models**: Type definitions in `src/models/`
3. **Tests**: Comprehensive test coverage
4. **Documentation**: Clear, up-to-date docs

### Error Handling

1. **Consistent Format**: Standardized error responses
2. **Error Codes**: Specific error codes for different failures
3. **Graceful Degradation**: Handle failures gracefully
4. **Logging**: Appropriate logging for debugging

**Example**:
```typescript
interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

export async function serviceOperation(): Promise<ServiceResponse<Data>> {
  try {
    const result = await performOperation();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "OPERATION_FAILED",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error
      }
    };
  }
}
```

## Testing Guidelines

### Test Structure

1. **Unit Tests**: Test individual functions and methods
2. **Integration Tests**: Test service interactions
3. **End-to-End Tests**: Test complete workflows

### Testing Patterns

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock external dependencies
vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

describe("AIMemoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addEnhanced", () => {
    it("should create memory with proper tags", async () => {
      // Arrange
      const memory = {
        content: "Test memory",
        importance: 0.8,
        memoryType: "knowledge" as MemoryType
      };

      // Act
      const result = await aiMemoryService.addEnhanced(
        mockSigner,
        "hub_123",
        memory
      );

      // Assert
      expect(result).toBeDefined();
      expect(event).toHaveBeenCalledWith(
        mockSigner,
        "hub_123",
        expect.arrayContaining([
          { name: "Content", value: "Test memory" },
          { name: "ai_importance", value: "0.8" }
        ])
      );
    });

    it("should validate required parameters", async () => {
      // Test error cases
      await expect(
        aiMemoryService.addEnhanced(mockSigner, "hub_123", {})
      ).rejects.toThrow("Memory content is required");
    });
  });
});
```

### Coverage Requirements

- **Functions**: 90% coverage minimum
- **Lines**: 85% coverage minimum
- **Branches**: 75% coverage minimum

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npx vitest run src/services/aiMemoryService.test.ts
```

## Pull Request Process

### Before Creating a PR

1. **Create an issue** describing the problem or feature
2. **Fork the repository** and create a feature branch
3. **Write comprehensive tests** for your changes
4. **Ensure all tests pass** locally
5. **Run quality checks**:
   ```bash
   npm run ci:quality
   ```

### PR Guidelines

1. **Descriptive Title**: Clear, concise description
2. **Detailed Description**: Explain what and why
3. **Link Issues**: Reference related issues
4. **Test Coverage**: Include test results
5. **Breaking Changes**: Clearly document any breaking changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Test coverage maintained/improved

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)

## Related Issues
Fixes #(issue_number)
```

### Review Process

1. **Automated Checks**: CI/CD pipeline validates code quality
2. **Code Review**: Maintainers review for:
   - Code quality and style
   - Test coverage
   - Documentation
   - Performance impact
   - Security considerations
3. **Feedback**: Address review comments
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge after approval

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment:

1. **Be Respectful**: Treat everyone with respect and kindness
2. **Be Inclusive**: Welcome people of all backgrounds and skill levels
3. **Be Constructive**: Provide helpful, actionable feedback
4. **Be Patient**: Remember that everyone is learning
5. **Be Professional**: Maintain professional communication

### Communication

1. **GitHub Issues**: Bug reports and feature requests
2. **GitHub Discussions**: Questions and general discussion
3. **Pull Requests**: Code contributions and reviews
4. **Discord**: Real-time community chat (coming soon)

### Getting Help

1. **Documentation**: Start with the comprehensive docs
2. **Examples**: Review working examples
3. **Issues**: Search existing issues for solutions
4. **Discussions**: Ask questions in GitHub Discussions
5. **Community**: Engage with other contributors

## Advanced Contributing

### Architecture Decisions

When making significant architectural changes:

1. **Create an RFC** (Request for Comments) as a GitHub issue
2. **Describe the problem** and proposed solution
3. **Consider alternatives** and trade-offs
4. **Get community feedback** before implementation
5. **Document decisions** in code and documentation

### Performance Considerations

1. **Benchmark Changes**: Measure performance impact
2. **Memory Usage**: Monitor memory consumption
3. **Network Efficiency**: Optimize AO network calls
4. **Cache Strategies**: Implement appropriate caching
5. **Async Operations**: Use proper async patterns

### Security Guidelines

1. **Input Validation**: Validate all user inputs
2. **Secret Management**: Never commit secrets
3. **Permission Checks**: Implement proper authorization
4. **Error Messages**: Don't leak sensitive information
5. **Dependencies**: Keep dependencies updated

## Recognition

### Contributors

We recognize contributors through:
- **GitHub Contributors** page
- **Changelog** acknowledgments
- **Community spotlight** (coming soon)
- **Maintainer roles** for regular contributors

### Becoming a Maintainer

Regular contributors may be invited to become maintainers based on:
- **Consistent Contributions**: Regular, high-quality contributions
- **Community Engagement**: Helping other contributors
- **Technical Expertise**: Deep understanding of the codebase
- **Reliability**: Consistent availability and responsiveness

## Resources

### Documentation
- [Getting Started](./getting-started.md)
- [Architecture Guide](./architecture.md)
- [API Reference](./api-reference.md)
- [Memory System](./memory-system.md)

### External Resources
- [AO Cookbook](https://cookbook_ao.g8way.io/)
- [Arweave Documentation](https://docs.arweave.org/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools and Libraries
- [FastMCP](https://github.com/jlowin/fastmcp) - MCP framework
- [AO Connect](https://www.npmjs.com/package/@permaweb/aoconnect) - AO integration
- [Vitest](https://vitest.dev/) - Testing framework
- [Zod](https://zod.dev/) - Schema validation

Thank you for contributing to Permamind! Together, we're building the future of permanent AI memory. 🧠⚡️