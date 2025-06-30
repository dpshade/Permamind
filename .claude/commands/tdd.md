# TDD - Comprehensive Test-Driven Development & Quality Assurance

A systematic  for discovering, creating, executing, and optimizing tests to ensure comprehensive coverage and high-quality testing practices.

##  Overview

Execute comprehensive test-driven development using this 8-phase approach:

### Phase 1: 🔍 TEST DISCOVERY & ANALYSIS

**Map current testing landscape and identify structure**

- Use Glob to find all existing test files (`**/*.{test,spec}.{js,ts,tsx}`)
- Use LS to examine test directory structure (`/test/`, `/tests/`, organization)
- Use Read to analyze test configurations (vitest.config.ts, vitest.unit.config.ts, vitest.integration.config.ts)
- Map test types: unit, integration, e2e, and their patterns
- Document current test framework setup and dependencies
- Identify naming conventions and organizational patterns

### Phase 2: 🎯 COVERAGE ANALYSIS & GAP IDENTIFICATION

**Identify what needs testing most urgently**

- Run `npm run test:coverage` to generate coverage reports
- Use Read to parse coverage reports (JSON/HTML) for detailed analysis
- Use Glob to find all source files (`src/**/*.{ts,js}`)
- Cross-reference source files with existing tests to find gaps
- Prioritize missing tests by:
  - Code complexity (services > models > utilities)
  - Business criticality (core functionality first)
  - Coverage thresholds (functions 90%, lines 85%, branches 75%)
- Generate prioritized list of files needing tests

### Phase 3: 🏗️ TEST GENERATION & SCAFFOLDING

**Create comprehensive test stubs and templates**

- Generate test files for untested services and models
- Use existing test patterns as templates (e.g., aiMemoryService.unit.test.ts)
- Create appropriate mocks for external dependencies:
  - Arweave connections (`vi.mock("arweave")`)
  - Relay functions (`vi.mock("../../../src/relay.js")`)
  - AO Connect (`vi.mock("@permaweb/aoconnect")`)
- Generate test fixtures for complex data structures
- Set up proper test scaffolding with describe/it blocks
- Ensure consistent naming conventions and file structure

### Phase 4: 🧪 TEST QUALITY ASSESSMENT

**Evaluate and improve existing test quality**

- Analyze test patterns for consistency and best practices
- Check for proper test isolation (no interdependent tests)
- Verify mock usage is appropriate and comprehensive
- Assess test coverage completeness (happy path, edge cases, error conditions)
- Review test documentation and clarity
- Identify flaky or unreliable tests
- Check for proper cleanup in beforeEach/afterEach hooks
- Validate test data management and fixture usage

### Phase 5: ⚡ TEST EXECUTION & VALIDATION

**Run and validate all test suites**

- Execute unit tests: `npm run test:unit`
- Execute integration tests: `npm run test:integration`
- Execute all tests with coverage: `npm run test:coverage`
- Run e2e tests if applicable
- Profile test performance and identify slow tests
- Validate that new generated tests actually run and pass
- Analyze test failures and categorize issues:
  - Test implementation problems
  - Missing dependencies or setup
  - Actual code issues discovered by tests

### Phase 6: 📊 TEST METRICS & REPORTING

**Generate comprehensive testing insights**

- Parse coverage reports to extract key metrics
- Calculate coverage percentages by file type and directory
- Identify coverage trends and gaps
- Generate test performance metrics:
  - Execution time per test suite
  - Slowest individual tests
  - Memory usage during testing
- Create quality metrics dashboard:
  - Test-to-code ratio
  - Mock usage patterns
  - Test complexity scores
- Document testing ROI and coverage improvements

### Phase 7: 🔧 TEST INFRASTRUCTURE OPTIMIZATION

**Optimize testing setup and **

- Review and optimize Vitest configurations for performance
- Assess test script efficiency and improve npm scripts
- Evaluate CI/CD integration requirements
- Check linting and formatting integration with tests
- Optimize test file organization and structure
- Review test environment setup and teardown
- Assess parallel test execution opportunities
- Validate TypeScript integration and type checking in tests

### Phase 8: 📋 ACTION PLAN & RECOMMENDATIONS

**Create systematic improvement roadmap**

- Prioritize test creation tasks by impact and effort
- Generate specific recommendations for:
  - Critical missing tests (high-risk, untested code)
  - Test quality improvements (flaky or incomplete tests)
  - Infrastructure enhancements (performance, CI/CD)
  - Maintenance guidelines (ongoing practices)
- Create implementation timeline with phases
- Document testing best practices and conventions
- Establish ongoing testing maintenance procedures

## Command Usage

```
/tdd [target_scope] [--generate] [--report-only]
```

**Parameters:**

- `target_scope` (optional): Focus on specific area (e.g., "services", "models", "")
- `--generate`: Automatically generate missing test files
- `--report-only`: Only run analysis and reporting, no test generation

## Detailed Implementation Techniques

### Test Discovery

- Use `Glob "**/*.{test,spec}.{js,ts}"` to find all test files
- Use `Read vitest.config.ts` to understand test setup
- Use `Grep "describe|it|test" tests/` to analyze test patterns

### Coverage Analysis

- Use `Bash "npm run test:coverage"` to generate reports
- Use `Read coverage/index.html` or `coverage/coverage-final.json` to parse results
- Cross-reference with `Glob "src/**/*.{ts,js}"` for complete file inventory

### Test Generation

- Create test templates based on existing patterns
- Generate proper imports and mocks for each service
- Follow naming convention: `${filename}.unit.test.ts`
- Place in appropriate directory structure

### Quality Assessment

- Use `Grep "vi.mock|jest.mock" tests/` to find mock usage
- Use `Read` to analyze individual test files for patterns
- Check for proper test structure and organization

## Example  Results

1. **Discovery**: Found 12 existing test files covering 8 services
2. **Coverage Analysis**: Identified 15 untested files (5 services, 7 models, 3 utilities)
3. **Generation**: Created 15 test stubs with proper scaffolding
4. **Quality Assessment**: Found 3 flaky tests, 2 missing edge cases
5. **Execution**: All 27 tests pass, coverage improved from 65% to 87%
6. **Metrics**: Test suite runs in 2.3s, 92% function coverage achieved
7. **Optimization**: Reduced test execution time by 40% through parallel execution
8. **Action Plan**: 8 high-priority tests, 3 infrastructure improvements identified

## Integration Notes

- Use with `/cleanup` for comprehensive codebase health
- Can be combined with `/prime` for full context loading
- Results in TodoWrite tasks for systematic test implementation
- Follow up with specific test creation using identified gaps

## Best Practices

- Always run tests before and after major changes
- Maintain coverage thresholds: 90% functions, 85% lines, 75% branches
- Focus on testing public APIs and critical business logic first
- Use proper mocking for external dependencies
- Write tests that document expected behavior
- Keep tests simple, focused, and independent
- Regularly review and refactor tests for maintainability

## Testing Patterns for Permamind

### Service Testing Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServiceName } from "../../../src/services/ServiceName.js";

// Mock external dependencies
vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

describe("ServiceName", () => {
  let service: ServiceName;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ServiceName();
  });

  describe("methodName", () => {
    it("should handle normal operation", async () => {
      // Test implementation
    });

    it("should handle edge cases", async () => {
      // Edge case testing
    });

    it("should handle errors gracefully", async () => {
      // Error condition testing
    });
  });
});
```

### Model Testing Pattern

```typescript
import { describe, it, expect } from "vitest";
import { ModelName } from "../../../src/models/ModelName.js";

describe("ModelName", () => {
  describe("validation", () => {
    it("should validate correct data", () => {
      // Validation testing
    });

    it("should reject invalid data", () => {
      // Invalid data handling
    });
  });
});
```

$ARGUMENTS
