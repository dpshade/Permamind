# CLEANUP - Comprehensive Legacy Code Analysis & Housekeeping

A systematic workflow for identifying and cleaning up legacy code, dead code, and general housekeeping issues in any codebase.

## Workflow Overview

Execute comprehensive codebase cleanup using this 8-phase approach:

### Phase 1: 🗺️ ARCHITECTURE MAPPING

**Understand current vs intended architecture**

- Use Glob and LS to map project structure and identify all services/modules
- Read main entry points (server.ts, index.ts) to understand current architecture
- Use Grep to find service imports and usage patterns
- Document actual vs documented architecture
- Create dependency graph and identify architectural inconsistencies

### Phase 2: 🗑️ DEAD CODE DETECTION

**Find unused and orphaned code**

- Search for unused imports/exports in TypeScript/JavaScript files
- Identify functions, classes, methods defined but never called
- Find unused dependencies in package.json vs actual imports
- Locate orphaned configuration files and settings
- Detect test files for non-existent functionality
- Find unreachable code and dead conditional branches

### Phase 3: 🏗️ LEGACY PATTERN ANALYSIS

**Identify outdated implementations**

- Search for references to old/replaced services and classes
- Find inconsistent naming conventions across the codebase
- Identify deprecated API patterns and outdated frameworks
- Locate architectural patterns that have been superseded
- Find TODO/FIXME comments referencing old implementations

### Phase 4: 📖 DOCUMENTATION AUDIT

**Ensure documentation accuracy**

- Verify README accuracy against current implementation
- Check API documentation alignment with actual code
- Validate example code functionality and imports
- Review inline comments for accuracy and relevance
- Ensure architecture documentation reflects current state
- Find documentation for removed features

### Phase 5: 🧪 TEST SUITE HEALTH CHECK

**Optimize test infrastructure**

- Find tests importing non-existent modules or services
- Identify tests for deprecated/removed functionality
- Analyze complex mocking patterns indicating design mismatches
- Check test coverage gaps and redundant tests
- Verify test naming conventions and organization
- Find flaky or unreliable tests

### Phase 6: ⚙️ CONFIGURATION CLEANUP

**Optimize build and environment setup**

- Audit build scripts for accuracy and efficiency
- Review environment configurations and remove unused variables
- Check CI/CD pipeline for optimization opportunities
- Assess security configurations and remove deprecated settings
- Evaluate performance configurations
- Clean up linting and formatting configurations

### Phase 7: 🔧 CODE QUALITY ASSESSMENT

**Identify improvement opportunities**

- Find and categorize TODO/FIXME/HACK/BUG comments
- Identify performance bottlenecks and memory leaks
- Check for security vulnerabilities and exposed secrets
- Locate technical debt hotspots requiring refactoring
- Find code duplication and consolidation opportunities
- Assess code style consistency

### Phase 8: 📊 PRIORITIZATION & ACTION PLAN

**Create systematic cleanup roadmap**

- Risk assessment of each finding (critical/high/medium/low)
- Effort estimation for fixes (quick wins vs major refactors)
- Impact analysis (user-facing vs internal improvements)
- Dependencies between cleanup tasks
- Create prioritized action plan with clear next steps

## Command Usage

```
/cleanup [target_area]
```

**Parameters:**
- `target_area` (optional): Focus on specific area (e.g., "tests", "docs", "services")

## Detailed Analysis Techniques

### Architecture Mapping
- Use `Glob "**/*.{ts,js}"` to find all source files
- Use `Grep "import.*from" src/` to map dependencies
- Use `Read` on main entry points to understand service initialization
- Create mental model of intended vs actual architecture

### Dead Code Detection
- Use `Grep "export.*{" src/` to find all exports
- Use `Grep "import.*{" src/` to find all imports
- Cross-reference to find unused exports
- Use `Bash "npm ls --depth=0"` to check dependency usage

### Legacy Pattern Search
- Use `Grep "class.*Service" src/` to find all services
- Use `Grep "TODO|FIXME|XXX|HACK|BUG" src/` for technical debt
- Use `Grep "deprecated|legacy|old" src/` for known legacy code

### Documentation Validation
- Use `Glob "**/*.md"` to find all documentation
- Use `Read` to check documentation against actual implementation
- Use `Grep "```" docs/` to find code examples for validation

## Example Workflow

1. **Map Architecture**: Discover all services and their relationships
2. **Find Dead Code**: Identify 15 unused imports and 3 orphaned files
3. **Legacy Analysis**: Find references to 2 removed services
4. **Doc Audit**: Update 5 outdated documentation files
5. **Test Health**: Remove 3 tests for non-existent functionality
6. **Config Cleanup**: Remove 4 unused environment variables
7. **Code Quality**: Address 12 TODO comments and 2 security issues
8. **Action Plan**: Create prioritized list of 25 cleanup tasks

## Integration Notes

- Use with `/prime` for full context loading before analysis
- Can be combined with `/tdd` for test-driven cleanup
- Follow up with `/epcc` for implementing identified improvements
- Results in TodoWrite tasks for systematic cleanup execution

## Best Practices

- Always backup or commit before major cleanup operations
- Focus on high-impact, low-risk changes first
- Validate changes with tests after each cleanup task
- Document architectural decisions and rationale
- Use incremental approach for large legacy codebases
- Coordinate with team before removing functionality

$ARGUMENTS