# Prepush - Comprehensive Pre-Push Validation & CI Simulation

A systematic that mirrors GitHub Actions CI/CD pipeline locally to prevent build failures, test failures, and deployment issues before pushing code.

## Overview

Execute comprehensive pre-push validation using this 9-phase approach that simulates the exact CI environment:

### Phase 1: 🚦 PRE-FLIGHT CHECKS

**Validate git state and branch readiness**

- Use Bash `git status --porcelain` to check working directory state
- Verify no uncommitted changes (warn if files need staging)
- Use Bash `git branch -vv` to check branch tracking and sync status
- Check for merge conflicts: `git diff --check`
- Validate branch is up-to-date with remote: `git fetch && git status`
- Confirm we're not on protected branches (main/master)
- Check for large files that might cause push issues: `find . -size +50M -not -path "./.git/*"`

**Recommendations:**

- Stage uncommitted changes: `git add .`
- Pull latest changes: `git pull origin <branch>`
- Resolve any merge conflicts before continuing

### Phase 2: 📦 DEPENDENCY VALIDATION

**Ensure clean dependency state matching CI environment**

- Use Bash `node --version && npm --version` to verify Node.js environment
- Check package-lock.json exists and is committed: `git ls-files package-lock.json`
- Run clean dependency installation: `npm ci` (exactly like CI)
- Verify no conflicting dependencies: `npm ls --depth=0`
- Check for outdated dependencies: `npm outdated` (informational)
- Validate package.json scripts exist: `npm run` (list available scripts)

**Performance Metrics:**

- Track `npm ci` installation time
- Monitor dependency count and size changes
- Alert on new dependencies or major version changes

### Phase 3: 🎨 CODE QUALITY CHECKS

**Run exact linting and formatting checks from CI**

- **Prettier Check**: `npm run format:check`
  - On failure, suggest: `npm run format` to auto-fix
  - Use Bash to capture specific file failures
- **ESLint Check**: `npm run lint:fix --dry-run`
  - Show linting errors with file locations
  - Suggest auto-fixes: `npm run lint:fix`
- **TypeScript Check**: `npm run type-check`
  - Parse TypeScript errors for detailed reporting
  - Show specific file and line numbers for failures

**Auto-Fix Integration:**

- Offer to run auto-fixes for formatting and linting
- Provide specific commands for manual fixes
- Re-run checks after auto-fixes to confirm resolution

### Phase 3.5: 🧹 LOGGING CLEANUP

**Remove all debug logging statements for clean production code**

- **Debug Pattern Removal**: Scan and remove debug console.log statements with patterns:
  - `[HUB COMPARISON DEBUG]`
  - `[ SAVE DEBUG]`
  - `[ SEARCH DEBUG]`
  - `[ QUERY DEBUG]`
  - `[ENHANCEMENT SAVE DEBUG]`
  - `[COMPOSITION SAVE DEBUG]`
  - `[TAG CREATION DEBUG]`
- **Service File Cleanup**: Remove standalone console.log/console.warn statements in:
  - `src/server.ts` (lines 70-78, 681-695, 1018-1019, 1138-1139)
  - `src/services/HubService.ts` (lines 131, 337-356, 403-422)
  - `src/services/aiMemoryService.ts` (lines 632-738)
  - `src/services/EnhancementEngine.ts`
- **Preservation Rules**:
  - Preserve user-facing CLI output in `bin/` directory
  - Preserve example/demo logging in `examples/` directory
  - Preserve test logging for debugging purposes
  - Preserve error handling console.error for critical failures

**Validation Commands:**

```bash
# Scan for debug logging patterns
grep -r "\[.*DEBUG\]" src/ || echo "✅ No debug logging found"
grep -r "console\.log" src/ --exclude-dir=examples || echo "✅ No console.log found"
grep -r "console\.warn" src/ | grep -v "error handling" || echo "✅ Clean console.warn usage"
```

**Auto-Fix Integration:**

- Provide specific sed commands to remove debug statements
- Re-run TypeScript build to update dist/ files
- Verify no logging artifacts remain in production code

### Phase 4: 🔨 BUILD VERIFICATION

**Simulate exact CI build process**

- Clean previous build: `rm -rf dist/` (exactly like CI)
- Run TypeScript build: `npx tsc` with timing
- Verify build output exists: `[ -d "dist" ]`
- Check dist directory structure: `find dist -type f -name "*.js" | head -20`
- Validate specific services: `find dist -name "**.js" -o -name "*CrossHub*.js"`
- Check for build warnings and errors
- Validate generated files match expected structure

**Build Metrics:**

- Track build time performance
- Monitor bundle size changes
- Alert on missing or unexpected build outputs

### Phase 6: 🧪 TEST EXECUTION

**Run complete test suite with coverage analysis**

- **Full Test Suite**: `npm test` (exact CI command)
  - Capture test results, failures, and timings
  - Show detailed failure information with file locations
- **Coverage Analysis**: `npm run test:coverage`
  - Parse coverage reports for threshold validation
  - Identify files with low coverage
  - Track coverage trends over time
- **Test Performance**: Monitor test execution time
  - Alert on slow or failing tests
  - Provide specific failure details and suggested fixes

**Coverage Validation:**

- Ensure coverage meets minimum thresholds (90% functions, 85% lines, 75% branches)
- Identify critical files with zero coverage
- Suggest test generation for uncovered code

### Phase 7: 🔒 SECURITY & AUDIT

**Security validation and dependency scanning**

- **NPM Audit**: `npm audit --audit-level moderate`
  - Parse audit results for vulnerabilities
  - Categorize by severity (critical, high, moderate, low)
  - Provide fix suggestions: `npm audit fix`
- **Dependency Analysis**: Check for known vulnerable packages
- **License Compliance**: Verify all dependencies have compatible licenses
- **Secret Detection**: Scan for accidentally committed secrets or keys

**Security Metrics:**

- Track vulnerability count trends
- Monitor new dependencies for security issues
- Alert on critical or high-severity vulnerabilities

### Phase 8: ⚡ PERFORMANCE VALIDATION

**Performance regression detection and optimization**

- **Bundle Size Analysis**: Calculate total build output size
  - Compare against previous builds
  - Alert on significant size increases (>10%)
  - Identify largest files and dependencies
- **Build Performance**: Track and compare build times
  - TypeScript compilation time
  - Test execution time
  - Total pipeline duration
- **Memory Usage**: Monitor Node.js memory usage during build/test
- **Dependency Size Impact**: Analyze package size contributions

**Performance Metrics:**

- Build time regression detection
- Bundle size trend analysis
- Memory usage optimization opportunities

### Phase 9: ✅ FINAL VALIDATION & PUSH READINESS

**Comprehensive status summary and confidence scoring**

- **Confidence Score Calculation** (0-100%):
  - Phase 1-3 failures: -20 points each (critical)
  - Phase 3.5 (logging) failures: -15 points (major - debug code in production)
  - Phase 4-6 failures: -15 points each (major)
  - Phase 7-8 failures: -10 points each (moderate)
  - Performance degradation: -5 points
- **Detailed Status Report**:
  - ✅ Passed phases with timing
  - ❌ Failed phases with specific remediation steps
  - ⚠️ Warnings with improvement suggestions
- **Push Readiness Assessment**:
  - 90-100%: Ready to push ✅
  - 70-89%: Ready with minor issues ⚠️
  - 50-69%: Fix issues before pushing ❌
  - <50%: Major problems, do not push 🚫

**Action Recommendations:**

- Provide specific fix commands for each failure
- Suggest optimization opportunities
- Generate ready-to-run command sequences
- Offer to set up git pre-push hook for automation

## Implementation Techniques

### Error Handling & Reporting

```bash
# Capture exit codes and provide detailed feedback
if ! npm run format:check; then
  echo "❌ Formatting check failed"
  echo "💡 Fix with: npm run format"
  echo "📄 Files that need formatting:"
  # Show specific files
fi
```

### Performance Tracking

```bash
# Time each phase and track trends
start_time=$(date +%s)
npm run build
end_time=$(date +%s)
build_duration=$((end_time - start_time))
echo "🏗️  Build completed in ${build_duration}s"
```

### Git Integration

```bash
# Validate git state thoroughly
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Uncommitted changes detected"
  git status --short
fi
```

## Usage Examples

### Quick Mode (Essential Checks Only)

- Phases 1-3: Git status, dependencies, code quality
- Duration: ~2-3 minutes
- Use for rapid iteration during development

### Full Mode (Complete CI Simulation)

- All 8 phases with detailed reporting
- Duration: ~5-10 minutes depending on test suite
- Use before major pushes, PRs, or releases

### Auto-Fix Mode

- Run quick checks first
- Automatically apply suggested fixes
- Re-run validation to confirm resolution
- Continue with full validation

### Git Hook Integration

- Optional pre-push hook installation
- Configurable validation levels
- Override capability for emergency pushes
- Team-wide consistency enforcement

## Expected Outcomes

### Immediate Benefits

- **Zero CI failures** from preventable issues (linting, formatting, type errors)
- **Faster feedback** loops (catch issues in 5 minutes vs 15+ minutes in CI)
- **Improved code quality** through systematic validation
- **Team consistency** with shared validation standards

### Long-term Benefits

- **Reduced CI/CD costs** by preventing failed builds
- **Faster development cycles** with early issue detection
- **Better code coverage** through systematic test validation
- **Performance optimization** through regression detection

This mirrors the exact GitHub Actions CI pipeline locally, preventing the linting and test failures experienced in CI by catching them early in the development process.
