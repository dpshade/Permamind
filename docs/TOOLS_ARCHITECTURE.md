# Tools Architecture

## Overview

The Permamind server has been refactored to use a decoupled tools architecture that separates tool definitions from the main server.ts file. This improves maintainability, testability, and extensibility.

## Architecture Components

### Core Components

- **ToolCommand**: Abstract base class for all tool implementations
- **ToolRegistry**: Central registry for managing and organizing tools
- **ToolFactory**: Base factory class for creating tool instances
- **ToolValidator**: Utilities for validating tool parameters

### Directory Structure

```
src/tools/
├── core/
│   ├── ToolCommand.ts          # Base command interface
│   ├── ToolRegistry.ts         # Central tool registry
│   ├── ToolFactory.ts          # Factory for tool creation
│   ├── ToolValidator.ts        # Common validation utilities
│   └── index.ts                # Core exports
├── memory/
│   ├── MemoryToolFactory.ts    # Factory for memory tools
│   ├── commands/
│   │   ├── AddMemoryCommand.ts
│   │   ├── AddMemoryEnhancedCommand.ts
│   │   └── [8 more memory commands]
│   └── index.ts
└── index.ts                    # Main tools exports
```

## Key Benefits

1. **Separation of Concerns**: Tools are isolated from server logic
2. **Improved Testability**: Each tool can be tested independently
3. **Better Maintainability**: Clear organization by functionality
4. **Easier Extension**: Adding new tools doesn't require modifying server.ts
5. **Type Safety**: Strong TypeScript typing throughout

## Usage Example

### Creating a New Tool

```typescript
import { ToolCommand, ToolContext, ToolMetadata } from "../core/index.js";
import { z } from "zod";

interface MyToolArgs {
  input: string;
}

export class MyToolCommand extends ToolCommand<MyToolArgs, string> {
  protected metadata: ToolMetadata = {
    name: "myTool",
    description: "Does something useful",
    readOnlyHint: true,
    title: "My Tool",
  };

  protected parametersSchema = z.object({
    input: z.string().describe("Input parameter"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: MyToolArgs): Promise<string> {
    // Implementation here
    return `Processed: ${args.input}`;
  }
}
```

### Creating a Tool Factory

```typescript
import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { MyToolCommand } from "./commands/MyToolCommand.js";

export class MyToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [MyToolCommand];
  }
}
```

### Registering Tools

```typescript
// In server.ts
function setupToolRegistry() {
  const context: ToolContext = { keyPair, publicKey, hubId };
  
  const myFactory = new MyToolFactory({
    categoryName: "MyCategory",
    categoryDescription: "My category of tools",
    context,
  });
  
  myFactory.registerTools(toolRegistry);
}
```

## Migration Status

### ✅ Completed
- **Core Infrastructure**: Base classes and utilities
- **Memory Tools**: All 10 memory tools migrated
- **Server Integration**: Registry integrated with FastMCP server
- **Tests**: Unit and integration tests for the new architecture

### 📋 Pending (Lower Priority)
- **Token Tools**: 14 token management tools
- **Contact Tools**: 4 contact/address management tools  
- **Process Tools**: 7 process communication tools
- **Documentation Tools**: 4 Permaweb documentation tools
- **System Tools**: 3 system/server tools

## Testing

### Unit Tests
- `tests/unit/tools/memory/MemoryToolFactory.unit.test.ts`
- Tool command parameter validation
- Tool metadata verification
- Tool factory instantiation

### Integration Tests
- `tests/integration/tools/memory/memoryTools.integration.test.ts`
- End-to-end tool execution
- Service integration testing
- Error handling validation

## Performance Impact

- **Reduced server.ts size**: From 30,359 tokens to a much smaller, focused file
- **Improved startup time**: Tools are only instantiated when needed
- **Better memory usage**: Clear separation of concerns
- **Maintainability**: Each tool category is self-contained

## Future Extensions

The architecture is designed to easily support:
- Dynamic tool loading
- Plugin-based tool extensions
- Tool versioning and compatibility
- Cross-tool dependencies
- Tool caching and optimization

This architecture provides a solid foundation for scaling the Permamind server's tool ecosystem while maintaining clean, testable, and maintainable code.