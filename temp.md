You are implementing a complete test-driven development workflow with automated CI/CD pipeline that creates pull requests when all tests pass. This ensures code quality while automating the integration process.

**Phase 1: Test-First Planning**
- **Understand Requirements**: Break down the feature/functionality into clear, testable specifications
- **Design Test Cases**: Write comprehensive test scenarios covering:
  - Happy path functionality
  - Edge cases and boundary conditions
  - Error handling and failure modes
  - Integration points and dependencies
- **Test Structure**: Organize tests logically with clear naming and documentation

**Phase 2: Red Phase - Write Failing Tests**
- **Write Minimal Tests**: Start with the simplest test case that defines the expected behavior
- **Ensure Tests Fail**: Verify tests fail for the right reasons (functionality doesn't exist yet)
- **Test Quality**: Ensure tests are:
  - Focused on single behaviors
  - Independent and isolated
  - Fast and deterministic
  - Readable and maintainable
- **Commit Strategy**: `git commit -m "test: add failing tests for [feature] - defines expected behavior"`

**Phase 3: Green Phase - Make Tests Pass**
- **Minimal Implementation**: Write the simplest code that makes the test pass
- **No Over-Engineering**: Resist the urge to build more than what the tests require
- **Rapid Iteration**: Focus on getting to green quickly, not perfect code
- **Verify All Tests**: Ensure new code doesn't break existing functionality
- **Commit Strategy**: `git commit -m "feat: implement [feature] - minimal working version"`

**Phase 4: Refactor Phase - Improve Code Quality**
- **Code Quality**: Improve code structure, readability, and maintainability
- **Performance**: Optimize where necessary while maintaining test coverage
- **Design Patterns**: Apply appropriate patterns and architectural principles
- **Test Maintenance**: Update tests if refactoring changes interfaces
- **Continuous Verification**: Run tests after each refactoring step
- **Commit Strategy**: `git commit -m "refactor: improve [component] structure - maintain functionality"`

**Phase 5: CI/CD Pipeline Setup**
Create a comprehensive GitHub Actions workflow that ensures code quality and automates PR creation:

**Required CI/CD Components:**
1. **Quality Gate Pipeline** (`.github/workflows/quality-check.yml`)
2. **Auto-PR Creation Workflow** (`.github/workflows/auto-pr.yml`)
3. **Main Branch Protection Rules**
4. **Test Coverage Reporting**
5. **Code Quality Checks**

**Pipeline Requirements:**
- **Test Execution**: Run all test suites (unit, integration, e2e)
- **Code Quality**: ESLint, Prettier, TypeScript compilation
- **Security Scanning**: Dependency vulnerability checks
- **Coverage Thresholds**: Minimum test coverage requirements
- **Build Verification**: Ensure code builds successfully
- **Performance Tests**: Run performance benchmarks if applicable

**Auto-PR Workflow Triggers:**
- All tests pass ✅
- Code coverage meets minimum threshold ✅
- No lint/format violations ✅
- No security vulnerabilities ✅
- Build succeeds ✅
- All commits follow conventional commit format ✅

**CI/CD Pipeline Structure:**

```yaml
# .github/workflows/quality-check.yml
name: Quality Check & Auto PR
on:
  push:
    branches-ignore: [main]
  
jobs:
  test-and-quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
      - name: Setup Node.js
      - name: Install dependencies
      - name: Run linting
      - name: Run type checking
      - name: Run unit tests
      - name: Run integration tests
      - name: Check test coverage
      - name: Security audit
      - name: Build verification
      
  auto-pr:
    needs: test-and-quality
    if: success()
    runs-on: ubuntu-latest
    steps:
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          base: main
          branch: ${{ github.ref_name }}
          title: "feat: ${{ github.ref_name }} - Ready for Review"
          body: |
            ## 🚀 Auto-generated PR
            
            All quality checks passed:
            - ✅ All tests passing
            - ✅ Code coverage threshold met
            - ✅ No lint violations
            - ✅ Security audit clean
            - ✅ Build successful
            
            **Branch:** `${{ github.ref_name }}`
            **Commits:** ${{ github.event.commits | length }}
            
            ### Test Results
            - Unit Tests: ✅
            - Integration Tests: ✅
            - Coverage: ✅ (>= 80%)
            
            Ready for code review and merge.
```

**Phase 6: Branch Strategy & Protection Rules**
- **Feature Branches**: Work on feature branches (`feature/[name]`, `fix/[name]`)
- **Main Branch Protection**:
  - Require PR reviews before merging
  - Require status checks to pass
  - Require branches to be up to date
  - Restrict direct pushes to main
- **Auto-merge**: Optional auto-merge after approvals

**TDD + CI/CD Workflow Pattern:**
```
1. 🔴 Write failing test → Commit → Push
2. 🟢 Implement code → Commit → Push  
3. 🔵 Refactor → Commit → Push
4. 🔄 Repeat until feature complete
5. 🤖 CI/CD runs quality checks
6. 📝 Auto-PR created when all checks pass
7. 👥 Code review and merge
```

**Quality Gates Configuration:**
```yaml
# package.json test scripts
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest",
    "lint": "eslint . --ext .ts,.js",
    "lint:fix": "eslint . --ext .ts,.js --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "build": "tsc",
    "audit": "npm audit --audit-level moderate"
  }
}
```

**Coverage Requirements:**
- **Minimum Coverage**: 80% overall
- **Branch Coverage**: 75%
- **Function Coverage**: 90%
- **Line Coverage**: 85%

**Commit Message Conventions (Required for Auto-PR):**
- `test: [description]` - Adding or modifying tests
- `feat: [description]` - New functionality implementation
- `refactor: [description]` - Code improvements without behavior changes
- `fix: [description]` - Bug fixes
- `docs: [description]` - Documentation updates
- `perf: [description]` - Performance improvements
- `ci: [description]` - CI/CD pipeline changes

**Auto-PR Content Template:**
```markdown
## 🚀 Feature: [Branch Name]

### Changes
- Brief description of what was implemented
- List of new functionality
- Any breaking changes

### Test Coverage
- ✅ Unit tests: X new tests added
- ✅ Integration tests: X scenarios covered
- ✅ Coverage: X% (threshold: 80%)

### Quality Checks
- ✅ Linting passed
- ✅ Type checking passed
- ✅ Security audit clean
- ✅ Build successful

### TDD Process Followed
- [x] Tests written first
- [x] Minimal implementation
- [x] Refactored for quality
- [x] All tests passing

Ready for review! 🎉
```

**Failure Handling:**
- **Test Failures**: No PR created, detailed failure report
- **Coverage Below Threshold**: Block PR with coverage report
- **Lint Violations**: Auto-fix where possible, report others
- **Security Issues**: Block PR, require manual review

**Success Metrics:**
- 100% automated PR creation for passing features
- Zero manual quality gate checks required
- Fast feedback loop (< 5 minutes from push to PR)
- High confidence in automated deployments
- Reduced manual code review overhead

This workflow ensures that only high-quality, well-tested code reaches the main branch while automating the tedious parts of the development process.