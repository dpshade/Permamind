# EPCC - Explore, Plan, Code, Commit Workflow

A structured development workflow for systematic feature implementation and bug fixes.

## Workflow Overview

Execute development tasks using this 4-phase approach:

### 1. 🔍 EXPLORE Phase
**Understand the codebase and requirements**

- Use search tools (Grep, Glob, Task) to understand existing code patterns
- Read relevant files to understand current implementation
- Identify dependencies, libraries, and frameworks in use
- Analyze code conventions and architectural patterns
- Document findings and constraints

### 2. 📋 PLAN Phase  
**Create structured implementation plan**

- Use TodoWrite to create detailed task breakdown
- Prioritize tasks (high/medium/low)
- Identify potential risks and blockers
- Plan testing strategy
- Define success criteria

### 3. 💻 CODE Phase
**Implement with systematic execution**

- Mark todos as in_progress before starting each task
- Follow existing code conventions and patterns
- Use existing libraries and utilities
- Implement incrementally with frequent validation
- Mark todos as completed immediately after finishing each task
- Run type checks and lints throughout development

### 4. ✅ COMMIT Phase
**Validate and commit changes**

- Run full test suite if available
- Execute lint and typecheck commands
- Review all changes with git diff
- Create descriptive commit message
- Only commit when explicitly requested by user

## Command Usage

```
/epcc <task_description>
```

## Example Workflow

1. **Explore**: Search for existing authentication patterns
2. **Plan**: Break down login feature into 5 specific tasks  
3. **Code**: Implement each task systematically, updating todos
4. **Commit**: Run tests, validate changes, create commit

## Best Practices

- Always use TodoWrite for complex tasks (3+ steps)
- Search extensively before making assumptions
- Follow existing code patterns and conventions
- Validate changes before marking todos complete
- Never commit without explicit user request
- Keep responses concise and action-focused

## Integration with Prime

Use with `/prime` command for full context loading:
1. Run `/prime` to load all documentation context
2. Run `/epcc <task>` to execute structured development

$ARGUMENTS