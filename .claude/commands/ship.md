# Ship - Complete Pre-GitHub Push 

Orchestrates the complete development  before pushing to GitHub by running cleanup → tdd → prepush in sequence. This command ensures maximum code quality and prevents CI/CD failures.

##  Overview

Executes a comprehensive 3-phase approach to prepare code for GitHub push:

### Phase 1: 🧹 CLEANUP

**Comprehensive codebase health assessment**

Executes `/cleanup` command to:

- Map architecture and identify inconsistencies
- Detect and remove dead code and unused imports
- Analyze legacy patterns and outdated implementations
- Audit documentation accuracy
- Optimize test suite health
- Clean configuration and environment setup
- Assess code quality and identify technical debt
- Generate prioritized action plan for improvements

### Phase 2: 🧪 TDD

**Test-driven development validation**

Executes `/tdd` command to:

- Discover and analyze existing test coverage
- Identify critical testing gaps
- Generate test scaffolding for untested code
- Assess test quality and patterns
- Execute complete test suite with coverage
- Generate testing metrics and reports
- Optimize test infrastructure
- Create systematic testing improvement plan

### Phase 3: 🚀 PREPUSH

**Pre-push validation and CI simulation**

Executes `/prepush` command to:

- Validate git state and branch readiness
- Ensure clean dependency installation (npm ci)
- Run code quality checks (prettier, eslint, typescript)
- Remove debug logging statements
- Execute build verification
- Run complete test suite with coverage
- Perform security audit and dependency scanning
- Validate performance metrics
- Generate final push readiness assessment

## Command Usage

```
/ship [mode] [target]
```

**Parameters:**

- `mode` (optional):
  - `quick` - Essential checks only (prepush phases 1-3)
  - `full` - Complete  (default: all three phases)
  - `analysis` - Cleanup and TDD analysis only (no build/push validation)
- `target` (optional): Focus area (e.g., "services", "tests", "docs")

## Execution Flow

### 1. Pre-Flight Validation

```
🔍 Starting Ship ...
📋 Mode: full
🎯 Target: entire codebase
⏰ Estimated time: 8-15 minutes
```

### 2. Phase 1: Cleanup Execution

```
🧹 Phase 1: CLEANUP
Running comprehensive codebase analysis...
[Detailed cleanup  output]
✅ Cleanup completed - 15 improvements identified
```

### 3. Phase 2: TDD Execution

```
🧪 Phase 2: TDD
Running test-driven development validation...
[Detailed TDD  output]
✅ TDD completed - Coverage: 89% → 93%
```

### 4. Phase 3: Prepush Execution

```
🚀 Phase 3: PREPUSH
Running pre-push validation and CI simulation...
[Detailed prepush  output]
✅ Prepush completed - Confidence: 95%
```

### 5. Final Assessment

```
🎉 SHIP  COMPLETED

📊 Summary:
  🧹 Cleanup: 15 improvements applied
  🧪 TDD: Coverage improved 89% → 93%
  🚀 Prepush: Confidence score 95%

⚡ Performance:
  Total execution time: 12m 34s
  Build time: 2m 18s
  Test time: 4m 12s

✅ READY TO PUSH TO GITHUB

💡 Next steps:
  1. Review changes: git status && git diff
  2. Stage changes: git add .
  3. Commit: git commit -m "feat: your commit message"
  4. Push: git push origin your-branch
```

## Mode-Specific Behavior

### Quick Mode (`/ship quick`)

- **Duration**: ~3-5 minutes
- **Focus**: Essential validation only
- **Phases**: Prepush only (git, deps, quality, build, tests)
- **Use Case**: Rapid iteration, small changes, hotfixes

### Full Mode (`/ship` or `/ship full`)

- **Duration**: ~8-15 minutes
- **Focus**: Comprehensive quality assurance
- **Phases**: All three (cleanup → tdd → prepush)
- **Use Case**: Feature completion, major changes, releases

### Analysis Mode (`/ship analysis`)

- **Duration**: ~5-8 minutes
- **Focus**: Code quality and test analysis
- **Phases**: Cleanup + TDD (no build/push validation)
- **Use Case**: Code review preparation, quality assessment

## Integration Points

### Git Hook Compatibility

- Works with existing pre-push hook
- Complements automated debug log removal
- Provides additional validation layers
- Can be configured as optional pre-push validation

### CI/CD Alignment

- Mirrors GitHub Actions pipeline locally
- Prevents common CI failures (linting, tests, build)
- Validates exact dependency installation (npm ci)
- Tests performance and security metrics

### Project-Specific Optimizations

- Leverages existing package.json scripts
- Uses project's Vitest configuration
- Respects TypeScript strict mode settings
- Maintains AO message and MCP server patterns

## Error Handling and Recovery

### Cleanup Phase Failures

- **Action**: Continue with warnings, create TODO tasks
- **Impact**: Code quality improvements deferred
- **Recovery**: Address high-priority items identified

### TDD Phase Failures

- **Action**: Report coverage gaps, continue to prepush
- **Impact**: Test coverage below thresholds
- **Recovery**: Create test generation tasks

### Prepush Phase Failures

- **Action**: Stop , provide specific fixes
- **Impact**: Not ready for GitHub push
- **Recovery**: Fix critical issues, re-run 

## Performance Optimization

### Parallel Execution

- Run compatible checks simultaneously
- Cache dependency installation
- Reuse build artifacts where possible
- Stream output for immediate feedback

### Incremental Validation

- Skip unchanged areas when possible
- Use git diff to identify scope
- Cache test results for unchanged files
- Optimize based on change impact

## Best Practices

### Before Running

- Ensure working directory is clean or changes are staged
- Verify you're on the correct branch
- Confirm remote branch is up to date
- Review any large changes manually

### During Execution

- Monitor output for critical issues
- Be prepared to address failures interactively
- Keep terminal window visible for progress
- Don't interrupt unless absolutely necessary

### After Completion

- Review all suggested improvements
- Prioritize critical and high-impact items
- Create follow-up tasks for deferred improvements
- Document any manual fixes applied

## Integration with Existing Commands

### Standalone Usage

- `/cleanup` - For code quality analysis only
- `/tdd` - For test coverage validation only
- `/prepush` - For pre-push validation only
- `/epcc` - For structured feature development

### Combined 

- `/prime` + `/ship` - Full context + complete validation
- `/visual` + `/ship` - UI development + validation
- `/ship` + git push - Complete deployment 

## Success Criteria

### Confidence Score Calculation

- **Cleanup**: Improvements identified and prioritized
- **TDD**: Coverage thresholds met (90%+ functions, 85%+ lines)
- **Prepush**: All validations pass (95%+ confidence)

### Ready to Ship Indicators

- ✅ All lint and format checks pass
- ✅ TypeScript compilation successful
- ✅ Complete test suite passes
- ✅ Security audit clean
- ✅ Performance metrics acceptable
- ✅ No debug logging in production code
- ✅ Git state ready for push

This comprehensive  ensures maximum code quality and confidence before pushing to GitHub, preventing CI failures and maintaining high development standards.

$ARGUMENTS
