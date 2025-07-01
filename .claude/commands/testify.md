# Testify - AI-Powered Complete Test Implementation

A comprehensive command that transforms test scaffolds into fully functional, executable test suites with complete business logic validation, edge case coverage, and proper assertions.

## Overview

Execute AI-powered test completion using this 7-phase approach:

### Phase 1: 🔍 SCAFFOLD ANALYSIS & DISCOVERY

**Identify incomplete test implementations**

- Use Glob to find all test files (`tests/**/*.{test,spec}.{js,ts}`)
- Use Read to analyze each test file for completeness:
  - Empty describe/it blocks with no assertions
  - Placeholder comments like "// TODO: implement test"
  - Missing test data and fixtures
  - Incomplete mock implementations
- Cross-reference with source files to understand business logic
- Map test coverage gaps and missing test scenarios
- Identify test files that exist but have minimal implementations

### Phase 2: 🧠 SOURCE CODE ANALYSIS

**Deep analysis of source files to understand expected behavior**

- Use Read to analyze corresponding source files for each incomplete test
- Extract public methods, interfaces, and business logic
- Identify input/output patterns and data structures
- Analyze error handling and edge cases in source code
- Map dependencies and external service interactions
- Document expected behavior patterns and validation rules
- Identify critical paths and complex business logic

### Phase 3: 🎯 TEST PATTERN RECOGNITION

**Learn from existing high-quality tests**

- Use Read to analyze complete, well-written test files as templates
- Extract testing patterns and best practices from existing tests
- Identify common mock setups and test data patterns
- Document assertion patterns and test structure conventions
- Analyze how external dependencies are mocked
- Study error handling test patterns
- Create reusable testing templates and utilities

### Phase 4: 🏗️ INTELLIGENT TEST GENERATION

**Generate complete test implementations with AI**

- **Business Logic Tests**: Generate tests for core functionality
  - Happy path scenarios with realistic test data
  - Input validation and sanitization tests
  - Output format and structure validation
  - State management and persistence tests
- **Edge Case Coverage**: Generate comprehensive edge case tests
  - Boundary value testing (min/max values, empty inputs)
  - Null/undefined handling
  - Invalid input scenarios
  - Resource exhaustion and limits
- **Error Handling Tests**: Generate robust error scenario tests
  - Network failures and timeouts
  - Invalid API responses
  - Authentication and authorization failures
  - Database connection issues
- **Integration Tests**: Generate cross-service interaction tests
  - Service dependency interactions
  - Data flow between components
  - Event handling and message passing

### Phase 5: 🔧 MOCK & FIXTURE GENERATION

**Create comprehensive test doubles and data**

- **Smart Mocking**: Generate intelligent mocks for external dependencies
  - Arweave connection mocks with realistic responses
  - AO Connect mocks with proper message handling
  - Database mocks with CRUD operations
  - Network request mocks with various response scenarios
- **Test Data Generation**: Create realistic test fixtures
  - Valid and invalid input data sets
  - Complex nested data structures
  - Realistic user scenarios and workflows
  - Performance testing data sets
- **Utility Functions**: Generate test helper functions
  - Data factory functions for consistent test data
  - Assertion helpers for complex validations
  - Setup and teardown utilities
  - Mock reset and cleanup functions

### Phase 6: 🧪 TEST EXECUTION & VALIDATION

**Validate generated tests work correctly**

- Execute generated tests: `npm test`
- Validate all tests pass with proper assertions
- Check test coverage improvements
- Identify and fix any test failures
- Optimize test performance and execution time
- Ensure tests are isolated and don't interfere with each other
- Validate mock implementations are correct
- Check for test flakiness and timing issues

### Phase 7: 📊 QUALITY ASSURANCE & OPTIMIZATION

**Ensure test quality and maintainability**

- **Code Quality**: Ensure generated tests follow project conventions
  - Consistent naming patterns
  - Proper TypeScript typing
  - Clear test descriptions and comments
  - Appropriate test organization
- **Coverage Analysis**: Validate coverage improvements
  - Function coverage targets (90%+)
  - Line coverage targets (85%+)
  - Branch coverage targets (75%+)
  - Critical path coverage validation
- **Performance Optimization**: Optimize test suite performance
  - Parallel test execution where possible
  - Efficient mock setup and teardown
  - Test data optimization
  - Memory usage optimization
- **Maintenance Guidelines**: Document test maintenance practices
  - Test update procedures
  - Mock maintenance guidelines
  - Test data management practices
  - CI/CD integration best practices

## Command Usage

```
/testify [scope] [--mode=MODE] [--coverage-target=PERCENT]
```

**Parameters:**

- `scope` (optional): Focus area (e.g., "services", "models", "tools", "all")
- `--mode` (optional):
  - `generate` - Generate missing test implementations (default)
  - `enhance` - Improve existing incomplete tests
  - `validate` - Check test quality and coverage
  - `optimize` - Optimize test performance
- `--coverage-target` (optional): Minimum coverage percentage (default: 90%)

## Implementation Techniques

### Test Generation Patterns

```typescript
// Service Test Pattern
describe("ServiceName", () => {
  let service: ServiceName;
  let mockDependency: MockType;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDependency = createMockDependency();
    service = new ServiceName(mockDependency);
  });

  describe("methodName", () => {
    it("should handle valid input successfully", async () => {
      // Arrange
      const input = createValidInput();
      const expectedOutput = createExpectedOutput();
      mockDependency.someMethod.mockResolvedValue(expectedOutput);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockDependency.someMethod).toHaveBeenCalledWith(input);
    });

    it("should handle invalid input gracefully", async () => {
      // Arrange
      const invalidInput = createInvalidInput();

      // Act & Assert
      await expect(service.methodName(invalidInput)).rejects.toThrow(
        "Invalid input",
      );
    });

    it("should handle network failures", async () => {
      // Arrange
      const input = createValidInput();
      mockDependency.someMethod.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(service.methodName(input)).rejects.toThrow("Network error");
    });
  });
});
```

### Mock Generation Patterns

```typescript
// Arweave Mock
vi.mock("arweave", () => ({
  default: {
    transactions: {
      post: vi.fn().mockResolvedValue({ id: "mock-tx-id" }),
      get: vi.fn().mockResolvedValue({ data: "mock-data" }),
    },
    wallets: {
      jwkToAddress: vi.fn().mockResolvedValue("mock-address"),
    },
  },
}));

// AO Connect Mock
vi.mock("@permaweb/aoconnect", () => ({
  message: vi.fn().mockResolvedValue("mock-message-id"),
  result: vi.fn().mockResolvedValue({ Output: "mock-output" }),
  spawn: vi.fn().mockResolvedValue("mock-process-id"),
}));
```

### Test Data Factory Pattern

```typescript
// Test Data Factories
export const createValidAIMemory = (
  overrides: Partial<AIMemory> = {},
): AIMemory => ({
  id: "memory-123",
  content: "Test memory content",
  memoryType: "knowledge",
  importance: 0.8,
  context: { topic: "test", domain: "testing" },
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createInvalidAIMemory = (): Partial<AIMemory> => ({
  id: "", // Invalid empty ID
  content: "", // Invalid empty content
  importance: 1.5, // Invalid importance > 1
});
```

## Integration with Existing Commands

### Standalone Usage

- `/testify services` - Generate tests for all service files
- `/testify models` - Generate tests for all model files
- `/testify --mode=enhance` - Improve existing incomplete tests
- `/testify --coverage-target=95` - Target 95% coverage

### Integration with /ship

- **Phase 2.5**: `/testify` runs after TDD scaffold generation
- **Workflow**: cleanup → tdd → **testify** → prepush
- **Confidence Impact**: Incomplete tests reduce confidence score by 20 points
- **Skip Option**: `--skip-testify` for quick mode

## Success Criteria

### Test Completeness

- ✅ All test files have complete implementations
- ✅ No placeholder comments or empty test blocks
- ✅ Comprehensive assertion coverage
- ✅ Proper mock implementations
- ✅ Realistic test data and scenarios

### Coverage Targets

- ✅ Function coverage: 90%+ (configurable)
- ✅ Line coverage: 85%+ (configurable)
- ✅ Branch coverage: 75%+ (configurable)
- ✅ Critical path coverage: 100%

### Quality Standards

- ✅ All generated tests pass
- ✅ Tests follow project conventions
- ✅ Proper TypeScript typing
- ✅ Clear test descriptions
- ✅ Efficient test execution

## Permamind-Specific Patterns

### AO Message Testing

```typescript
describe("AO Message Handling", () => {
  it("should create valid AO message", async () => {
    const messageData = {
      processId: "test-process",
      data: JSON.stringify({ action: "test" }),
      tags: [{ name: "Action", value: "Test" }],
    };

    const result = await aoMessageService.send(messageData);

    expect(result).toHaveProperty("messageId");
    expect(result.messageId).toMatch(/^[a-zA-Z0-9_-]+$/);
  });
});
```

### Memory Service Testing

```typescript
describe("AI Memory Service", () => {
  it("should store and retrieve memories", async () => {
    const memory = createValidAIMemory();

    await aiMemoryService.store(memory);
    const retrieved = await aiMemoryService.get(memory.id);

    expect(retrieved).toEqual(memory);
  });
});
```

### Arweave Integration Testing

```typescript
describe("Arweave Integration", () => {
  it("should handle permanent storage", async () => {
    const data = { test: "data" };

    const txId = await relay.event(data);

    expect(txId).toBeDefined();
    expect(typeof txId).toBe("string");
  });
});
```

This command transforms incomplete test scaffolds into comprehensive, executable test suites that provide real confidence in code quality and reliability.

$ARGUMENTS
