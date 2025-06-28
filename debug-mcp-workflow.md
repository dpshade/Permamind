# MCP Server JSON Error Debugging Workflow

## Problem
Claude Desktop shows "Unexpected token" JSON errors when connecting to Permamind MCP server, indicating the server is outputting non-JSON text that interferes with the MCP protocol.

## Root Cause Analysis

The MCP protocol expects pure JSON communication over stdio. Any text output (console.log, stderr, dependency warnings, etc.) breaks the protocol.

## Systematic Debugging Workflow

### Step 1: Create Minimal Test Server
Create a completely isolated test server to verify MCP protocol works.

### Step 2: Identify Output Sources
- Dependencies outputting during import
- Async initialization outputting after server start
- Environment/configuration warnings
- npm package resolution messages

### Step 3: Implement Complete Output Suppression
- Redirect ALL stdout/stderr during initialization
- Suppress console methods permanently
- Capture and silence dependency outputs

### Step 4: Test and Validate
- Verify server produces zero output
- Test MCP protocol compliance
- Validate Claude Desktop connection

## Implementation Steps

### Phase 1: Create Minimal MCP Server
1. Create `server-minimal.js` with only FastMCP basics
2. Test if minimal server connects without errors
3. If minimal works, issue is with Permamind dependencies

### Phase 2: Progressive Dependency Addition
1. Add dependencies one by one
2. Identify which dependency causes output
3. Implement targeted suppression

### Phase 3: Complete Output Isolation
1. Wrap server in output-capturing shell script
2. Redirect all output to /dev/null
3. Ensure only MCP JSON reaches Claude Desktop

### Phase 4: Automated Testing
1. Create test script to validate MCP compliance
2. Automated output detection
3. CI/CD integration for future changes

## Quick Fix: Shell Wrapper Approach
If systematic debugging takes too long, create a shell script wrapper that captures all output and only passes through valid MCP JSON.