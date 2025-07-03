# Ship - Enhanced CI-Guaranteed Pre-GitHub Push Workflow

Orchestrates a comprehensive 6-phase development workflow with auto-fix capabilities before pushing to GitHub. **Guarantees CI success** by running exact CI commands locally, automatically fixing common issues, and providing complete validation with recovery mechanisms.

## Workflow Overview

Executes a comprehensive 6-phase approach to prepare code for GitHub push with automatic fixing:

### Phase 0: 🔧 PRE-FLIGHT AUTO-FIX

**Automatic resolution of common issues**

- Stage untracked files that should be included
- Run `npm run format` to auto-fix formatting and basic ESLint issues
- Remove common debug logging patterns
- Validate git state and suggest corrections

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
- Run **EXACT CI COMMANDS**: `npm run lint` (prettier + eslint + tsc)
- Remove debug logging statements
- Execute build verification
- Run complete test suite with coverage
- Perform security audit and dependency scanning
- Validate performance metrics
- Generate final push readiness assessment

### Phase 4: 🔄 AUTO-RECOVERY

**Automatic issue resolution where possible**

- Auto-fix formatting issues: `npm run format`
- Stage corrected files automatically
- Retry failed validations after fixes
- Report unfixable issues with specific guidance

### Phase 5: ✅ FINAL VALIDATION

**CI-identical verification and push confidence**

- Run complete CI simulation: `npm run ci:quality`
- Generate confidence score (0-100%)
- Provide specific fix commands for any remaining issues
- Create ready-to-execute push commands

## Command Usage

```
/ship [mode] [target]
```

**Parameters:**

- `mode` (optional):
  - `quick` - Essential checks only (prepush phases 1-3)
  - `full` - Complete workflow (default: all three phases)
  - `analysis` - Cleanup and TDD analysis only (no build/push validation)
- `target` (optional): Focus area (e.g., "services", "tests", "docs")

## Execution Flow

### 1. Pre-Flight Validation

```
🔍 Starting Ship workflow...
📋 Mode: full
🎯 Target: entire codebase
⏰ Estimated time: 8-15 minutes
```

### 2. Phase 0: Pre-Flight Auto-Fix

```
🔧 Phase 0: PRE-FLIGHT AUTO-FIX
Auto-fixing common issues...
✅ Formatted 4 files
✅ Staged 2 untracked files
⚠️ Manual fix needed: TypeScript errors
```

### 3. Phase 1: Cleanup Execution

```
🧹 Phase 1: CLEANUP
Running comprehensive codebase analysis...
[Detailed cleanup workflow output]
✅ Cleanup completed - 15 improvements identified
```

### 4. Phase 2: TDD Execution

```
🧪 Phase 2: TDD
Running test-driven development validation...
[Detailed TDD workflow output]
✅ TDD completed - Coverage: 89% → 93%
```

### 5. Phase 3: Prepush Execution

```
🚀 Phase 3: PREPUSH
Running EXACT CI validation...
[Detailed prepush workflow output]
✅ Prepush completed - CI commands pass ✅
```

### 6. Phase 4: Auto-Recovery

```
🔄 Phase 4: AUTO-RECOVERY
Attempting automatic fixes...
✅ Auto-fixed 3 ESLint issues
🔄 Re-running validation...
✅ All issues resolved
```

### 7. Phase 5: Final Validation

```
✅ Phase 5: FINAL VALIDATION
Running complete CI simulation...
✅ npm run ci:quality - PASSED
🎯 Confidence Score: 98%
```

### 8. Final Assessment

```
🎉 SHIP WORKFLOW COMPLETED

📊 Summary:
  🔧 Pre-flight: 6 issues auto-fixed
  🧹 Cleanup: 15 improvements applied
  🧪 TDD: Coverage improved 89% → 93%
  🚀 Prepush: CI commands pass ✅
  🔄 Auto-recovery: 3 additional fixes applied
  ✅ Final validation: CI simulation passed

⚡ Performance:
  Total execution time: 12m 34s
  Auto-fix time: 1m 45s
  Build time: 2m 18s
  Test time: 4m 12s
  CI simulation: 3m 21s

🎯 CONFIDENCE SCORE: 98% - READY TO PUSH

💡 Next steps:
  1. Review auto-applied changes: git diff
  2. Commit staged changes: git commit -m "feat: your commit message"
  3. Push with confidence: git push origin your-branch

🔮 CI Prediction: ✅ WILL PASS (exact command validation completed)
```

## Mode-Specific Behavior

### Quick Mode (`/ship quick`)

- **Duration**: ~3-5 minutes
- **Focus**: Essential validation with auto-fix
- **Phases**: Pre-flight auto-fix + Prepush + Auto-recovery
- **Auto-Fix**: ✅ Formatting, basic ESLint, git staging
- **Use Case**: Rapid iteration, small changes, hotfixes

### Full Mode (`/ship` or `/ship full`)

- **Duration**: ~8-15 minutes
- **Focus**: Comprehensive quality assurance with auto-fix
- **Phases**: All six phases (pre-flight → cleanup → tdd → prepush → auto-recovery → final validation)
- **Auto-Fix**: ✅ All automatic fixes + comprehensive validation
- **Use Case**: Feature completion, major changes, releases

### Analysis Mode (`/ship analysis`)

- **Duration**: ~5-8 minutes
- **Focus**: Code quality and test analysis with suggestions
- **Phases**: Pre-flight + Cleanup + TDD (no build/push validation)
- **Auto-Fix**: ✅ Basic fixes + detailed analysis reports
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

- **Action**: Stop workflow, provide specific fixes
- **Impact**: Not ready for GitHub push
- **Recovery**: Fix critical issues, re-run workflow

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

### Combined Workflows

- `/prime` + `/ship` - Full context + complete validation
- `/visual` + `/ship` - UI development + validation
- `/ship` + git push - Complete deployment workflow

## Success Criteria

### Confidence Score Calculation

- **Pre-flight**: Auto-fixes applied successfully
- **Cleanup**: Improvements identified and prioritized
- **TDD**: Coverage thresholds met (90%+ functions, 85%+ lines)
- **Prepush**: EXACT CI commands pass (npm run lint)
- **Auto-recovery**: All fixable issues resolved
- **Final validation**: Complete CI simulation passes

### Ready to Ship Indicators

- ✅ All lint and format checks pass (EXACT CI COMMANDS)
- ✅ TypeScript compilation successful
- ✅ Complete test suite passes
- ✅ Security audit clean
- ✅ Performance metrics acceptable
- ✅ No debug logging in production code
- ✅ Git state ready for push
- ✅ Auto-fixes applied and validated
- 🎯 **CI GUARANTEE**: Local validation matches CI exactly

This enhanced workflow **guarantees CI success** by running exact CI commands locally, with automatic fixing of common issues. Prevents CI failures through comprehensive validation, auto-recovery mechanisms, and final CI simulation. The ultimate solution for confident, failure-free GitHub pushes.

$ARGUMENTS
