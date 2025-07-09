import { describe, it, expect, beforeEach, vi } from "vitest";
import { MemoryToolFactory } from "../../../../src/tools/memory/MemoryToolFactory.js";
import { ToolRegistry } from "../../../../src/tools/core/ToolRegistry.js";
import { ToolContext } from "../../../../src/tools/core/ToolCommand.js";
import { hubService } from "../../../../src/services/hub.js";
import { aiMemoryService } from "../../../../src/services/aiMemoryService.js";

// Mock the services with more detailed mocks
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

vi.mock("../../../../src/services/PermawebDocs.js", () => ({
  PermawebDocs: vi.fn().mockImplementation(() => ({
    search: vi.fn().mockResolvedValue({ results: [] }),
  })),
}));

describe("Memory Tools Integration", () => {
  let factory: MemoryToolFactory;
  let registry: ToolRegistry;
  let context: ToolContext;

  beforeEach(() => {
    vi.clearAllMocks();
    
    context = {
      keyPair: { kty: "RSA", n: "test" } as any,
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

  it("should integrate memory tools with registry", () => {
    factory.registerTools(registry);
    
    expect(registry.getToolCount()).toBe(10);
    expect(registry.getCategoryCount()).toBe(1);
    
    const toolDefinitions = registry.getToolDefinitions();
    expect(toolDefinitions).toHaveLength(10);
    
    const addMemoryDefinition = toolDefinitions.find(def => def.name === "addMemory");
    expect(addMemoryDefinition).toBeDefined();
    expect(addMemoryDefinition!.execute).toBeDefined();
  });

  it("should execute addMemory tool successfully", async () => {
    const mockResult = { id: "test-memory-id", success: true };
    (hubService.createEvent as any).mockResolvedValue(mockResult);
    
    factory.registerTools(registry);
    const addMemoryTool = registry.getTool("addMemory");
    
    expect(addMemoryTool).toBeDefined();
    
    const result = await addMemoryTool!.execute(
      {
        content: "Test memory content",
        p: "test-public-key",
        role: "user",
      },
      context
    );
    
    expect(result).toBe(JSON.stringify(mockResult));
    expect(hubService.createEvent).toHaveBeenCalledWith(
      context.keyPair,
      context.hubId,
      expect.arrayContaining([
        expect.objectContaining({ name: "Kind", value: "10" }),
        expect.objectContaining({ name: "Content", value: "Test memory content" }),
        expect.objectContaining({ name: "r", value: "user" }),
        expect.objectContaining({ name: "p", value: "test-public-key" }),
      ])
    );
  });

  it("should execute addMemoryEnhanced tool successfully", async () => {
    const mockResult = { id: "test-enhanced-memory-id", success: true };
    (aiMemoryService.addEnhanced as any).mockResolvedValue(mockResult);
    
    factory.registerTools(registry);
    const addMemoryEnhancedTool = registry.getTool("addMemoryEnhanced");
    
    expect(addMemoryEnhancedTool).toBeDefined();
    
    const result = await addMemoryEnhancedTool!.execute(
      {
        content: "Test enhanced memory content",
        p: "test-public-key",
        role: "user",
        importance: 0.8,
        memoryType: "knowledge",
        domain: "programming",
      },
      context
    );
    
    expect(result).toBe(mockResult);
    expect(aiMemoryService.addEnhanced).toHaveBeenCalledWith(
      context.keyPair,
      context.hubId,
      expect.objectContaining({
        content: "Test enhanced memory content",
        p: "test-public-key",
        role: "user",
        importance: 0.8,
        memoryType: "knowledge",
        context: expect.objectContaining({
          domain: "programming",
        }),
      })
    );
  });

  it("should execute searchMemories tool successfully", async () => {
    const mockResults = [
      { id: "memory-1", content: "Search result 1" },
      { id: "memory-2", content: "Search result 2" },
    ];
    (hubService.search as any).mockResolvedValue(mockResults);
    
    factory.registerTools(registry);
    const searchMemoriesTool = registry.getTool("searchMemories");
    
    expect(searchMemoriesTool).toBeDefined();
    
    const result = await searchMemoriesTool!.execute(
      {
        search: "test query",
      },
      context
    );
    
    expect(result).toBe(JSON.stringify(mockResults));
    expect(hubService.search).toHaveBeenCalledWith(
      context.hubId,
      "test query",
      "10"
    );
  });

  it("should execute searchMemoriesAdvanced tool successfully", async () => {
    const mockMemories = [
      { id: "memory-1", content: "Advanced search result 1" },
    ];
    (aiMemoryService.searchAdvanced as any).mockResolvedValue(mockMemories);
    
    factory.registerTools(registry);
    const searchMemoriesAdvancedTool = registry.getTool("searchMemoriesAdvanced");
    
    expect(searchMemoriesAdvancedTool).toBeDefined();
    
    const result = await searchMemoriesAdvancedTool!.execute(
      {
        query: "advanced test query",
        memoryType: "knowledge",
        importanceThreshold: 0.5,
        includePermawebDocs: false,
      },
      context
    );
    
    const parsedResult = JSON.parse(result);
    expect(parsedResult.memories).toEqual(mockMemories);
    expect(parsedResult.permawebDocs).toEqual([]);
    expect(parsedResult.query).toBe("advanced test query");
    
    expect(aiMemoryService.searchAdvanced).toHaveBeenCalledWith(
      context.hubId,
      "advanced test query",
      expect.objectContaining({
        memoryType: "knowledge",
        importanceThreshold: 0.5,
      })
    );
  });

  it("should handle tool execution errors gracefully", async () => {
    const mockError = new Error("Service error");
    (hubService.createEvent as any).mockRejectedValue(mockError);
    
    factory.registerTools(registry);
    const addMemoryTool = registry.getTool("addMemory");
    
    expect(addMemoryTool).toBeDefined();
    
    await expect(
      addMemoryTool!.execute(
        {
          content: "Test memory content",
          p: "test-public-key",
          role: "user",
        },
        context
      )
    ).rejects.toThrow("Failed to add memory: Service error");
  });
});