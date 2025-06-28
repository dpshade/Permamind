# TDD - Test-Driven Development Workflow

A test-first development workflow following the Red-Green-Refactor cycle.

## Workflow Overview

Execute development using Test-Driven Development principles:

### Phase 1: 🔴 WRITE TESTS & COMMIT
**Create failing tests first**

- Understand requirements and expected behavior
- Write comprehensive test cases that define the interface
- Ensure tests fail initially (Red phase)
- Commit failing tests with descriptive message
- Use TodoWrite to track test implementation tasks

### Phase 2: 🟢 CODE & ITERATE
**Make tests pass with minimal implementation**

- Implement just enough code to make tests pass
- Focus on functionality over perfection
- Run tests frequently during development
- Mark todos as in_progress/completed throughout
- Commit working implementation (Green phase)

### Phase 3: 🔵 REFACTOR & COMMIT
**Improve code quality while keeping tests green**

- Refactor implementation for better design
- Optimize performance and readability
- Ensure all tests continue to pass
- Commit refactored code
- Update todos to reflect completion

## Command Usage

```
/tdd <feature_description>
```

## Detailed Workflow Steps

### 1. Test Planning
- Use TodoWrite to create test implementation plan
- Identify edge cases and error conditions
- Plan test structure and organization
- Define expected inputs/outputs

### 2. Test Implementation
- Write unit tests for core functionality
- Write integration tests for complex interactions
- Write error handling tests
- Ensure tests are readable and maintainable

### 3. Minimal Implementation
- Write simplest code that passes tests
- Don't optimize prematurely
- Focus on correctness first
- Validate with frequent test runs

### 4. Iterative Improvement
- Refactor implementation incrementally
- Add error handling and edge cases
- Improve performance where needed
- Maintain test coverage throughout

## Best Practices

- Always write tests before implementation code
- Make small, frequent commits
- Run tests after every change
- Keep test names descriptive and clear
- Test both happy path and error conditions
- Refactor tests when needed
- Use existing test patterns and frameworks
- Never skip the failing test phase

## Example Cycle

1. **Write Tests**: Create tests for user registration endpoint
2. **Commit**: "Add failing tests for user registration API"
3. **Code**: Implement basic registration handler
4. **Iterate**: Add validation, error handling, database integration
5. **Commit**: "Implement user registration with validation"
6. **Refactor**: Extract validation logic, improve error messages
7. **Commit**: "Refactor user registration with cleaner validation"

## Integration Notes

- Use with `/prime` for full context loading
- Combine with `/epcc` for exploration phase before TDD
- Always check existing test patterns before writing new tests
- Follow project's testing conventions and frameworks

$ARGUMENTS