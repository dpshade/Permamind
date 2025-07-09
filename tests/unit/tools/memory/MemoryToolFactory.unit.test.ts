import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryToolFactory } from "../../../../src/tools/memory/MemoryToolFactory.js";
import { ToolContext } from "../../../../src/tools/core/ToolCommand.js";
import { ToolRegistry } from "../../../../src/tools/core/ToolRegistry.js";

// Mock the services
vi.mock("../../../../src/services/hub.js", () => ({
  hubService: {
    createEvent: vi.fn(),
    fetch: vi.fn(),
    fetchByUser: vi.fn(),
    search: vi.fn(),
  },
}));

vi.mock("../../../../src/services/aiMemoryService.js", () => ({
  aiMemoryService: {
    addEnhanced: vi.fn(),
    addMemoriesBatch: vi.fn(),
    addReasoningChain: vi.fn(),
    getMemoryAnalytics: vi.fn(),
    linkMemories: vi.fn(),
    searchAdvanced: vi.fn(),
  },
}));

describe("MemoryToolFactory", () => {
  let factory: MemoryToolFactory;
  let registry: ToolRegistry;
  let context: ToolContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    context = {
      keyPair: {} as any,
      publicKey: "test-public-key",
      hubId: "test-hub-id",
    };

    registry = new ToolRegistry();
    
    factory = new MemoryToolFactory({
      categoryName: "Memory",
      categoryDescription: "Memory management tools",
      context,
    });
  });

  it("should create memory tools", () => {
    const tools = factory.createTools();
    
    expect(tools).toHaveLength(10);
    
    const toolNames = tools.map(tool => tool.getMetadata().name);
    expect(toolNames).toContain("addMemory");
    expect(toolNames).toContain("addMemoryEnhanced");
    expect(toolNames).toContain("addMemoriesBatch");
    expect(toolNames).toContain("addReasoningChain");
    expect(toolNames).toContain("getAllMemories");
    expect(toolNames).toContain("getAllMemoriesForConversation");
    expect(toolNames).toContain("getMemoryAnalytics");
    expect(toolNames).toContain("searchMemories");
    expect(toolNames).toContain("searchMemoriesAdvanced");
    expect(toolNames).toContain("linkMemories");
  });

  it("should register tools with registry", () => {
    factory.registerTools(registry);
    
    expect(registry.getToolCount()).toBe(10);
    expect(registry.hasCategory("Memory")).toBe(true);
    expect(registry.getToolsByCategory("Memory")).toHaveLength(10);
  });

  it("should have correct tool metadata", () => {
    const tools = factory.createTools();
    
    const addMemoryTool = tools.find(tool => tool.getMetadata().name === "addMemory");
    expect(addMemoryTool).toBeDefined();
    expect(addMemoryTool!.getMetadata().title).toBe("Add Memory");
    expect(addMemoryTool!.getMetadata().readOnlyHint).toBe(false);
    
    const searchMemoriesTool = tools.find(tool => tool.getMetadata().name === "searchMemories");
    expect(searchMemoriesTool).toBeDefined();
    expect(searchMemoriesTool!.getMetadata().title).toBe("Search Memories");
    expect(searchMemoriesTool!.getMetadata().readOnlyHint).toBe(true);
  });

  it("should create tools with correct parameter schemas", () => {
    const tools = factory.createTools();
    
    const addMemoryTool = tools.find(tool => tool.getMetadata().name === "addMemory");
    const schema = addMemoryTool!.getParametersSchema();
    
    // Test that the schema validates correctly
    const validArgs = {
      content: "Test memory content",
      p: "test-public-key",
      role: "user",
    };
    
    const result = schema.safeParse(validArgs);
    expect(result.success).toBe(true);
    
    // Test that invalid args are rejected
    const invalidArgs = {
      content: "Test memory content",
      // Missing required fields
    };
    
    const invalidResult = schema.safeParse(invalidArgs);
    expect(invalidResult.success).toBe(false);
  });

  it("should create tool definitions", () => {
    const tools = factory.createTools();
    const addMemoryTool = tools.find(tool => tool.getMetadata().name === "addMemory");
    
    const definition = addMemoryTool!.toToolDefinition();
    
    expect(definition.name).toBe("addMemory");
    expect(definition.description).toBe("Add a memory to the hub");
    expect(definition.parameters).toBeDefined();
    expect(definition.execute).toBeDefined();
    expect(definition.annotations).toBeDefined();
    expect(definition.annotations?.title).toBe("Add Memory");
    expect(definition.annotations?.readOnlyHint).toBe(false);
    expect(definition.annotations?.openWorldHint).toBe(false);
  });

  it("should have correct category information", () => {
    expect(factory.getCategoryName()).toBe("Memory");
    expect(factory.getCategoryDescription()).toBe("Memory management tools");
    expect(factory.getContext()).toBe(context);
  });
});