import { describe, it, expect, beforeEach, vi } from "vitest";
import { ToolRegistry } from "../../../src/tools/core/ToolRegistry.js";
import { ToolContext } from "../../../src/tools/core/ToolCommand.js";
import { MemoryToolFactory } from "../../../src/tools/memory/MemoryToolFactory.js";
import { TokenToolFactory } from "../../../src/tools/token/TokenToolFactory.js";
import { ContactToolFactory } from "../../../src/tools/contact/ContactToolFactory.js";
import { ProcessToolFactory } from "../../../src/tools/process/ProcessToolFactory.js";
import { DocumentationToolFactory } from "../../../src/tools/documentation/DocumentationToolFactory.js";
import { SystemToolFactory } from "../../../src/tools/system/SystemToolFactory.js";

// Mock all services
vi.mock("../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

vi.mock("../../../src/process.js", () => ({
  read: vi.fn(),
  send: vi.fn(),
}));

vi.mock("../../../src/services/tokenservice.js", () => ({
  tokenService: {
    create: vi.fn(),
  },
}));

vi.mock("../../../src/services/ProcessCommunicationService.js", () => ({
  processCommunicationService: {
    executeProcessRequest: vi.fn(),
    executeSmartRequest: vi.fn(),
  },
}));

vi.mock("../../../src/services/ArweaveGraphQLService.js", () => ({
  arweaveGraphQLService: {
    queryTransactions: vi.fn(),
    queryAOProcessMessages: vi.fn(),
    getTransactionData: vi.fn(),
    queryBlocks: vi.fn(),
    getBlockData: vi.fn(),
    executeCustomQuery: vi.fn(),
  },
}));

vi.mock("../../../src/services/PermawebDocs.js", () => ({
  permawebDocs: {
    query: vi.fn(),
    estimateResponseTokens: vi.fn(),
    getCacheStatus: vi.fn(),
    preload: vi.fn(),
    clearCache: vi.fn(),
    getAvailableDomains: vi.fn(),
  },
}));

vi.mock("../../../src/services/PermawebDeployService.js", () => ({
  PermawebDeployService: vi.fn().mockImplementation(() => ({
    deployDirectory: vi.fn(),
    checkPrerequisites: vi.fn(),
  })),
}));

describe("All Tool Categories Integration", () => {
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
  });

  it("should register all tool categories", () => {
    // Register all tool factories
    const memoryFactory = new MemoryToolFactory({
      categoryName: "Memory",
      categoryDescription: "AI Memory management tools",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryName: "Token",
      categoryDescription: "Token management tools",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryName: "Contact",
      categoryDescription: "Contact management tools",
      context,
    });
    contactFactory.registerTools(registry);

    const processFactory = new ProcessToolFactory({
      categoryName: "Process",
      categoryDescription: "Process communication tools",
      context,
    });
    processFactory.registerTools(registry);

    const documentationFactory = new DocumentationToolFactory({
      categoryName: "Documentation",
      categoryDescription: "Documentation tools",
      context,
    });
    documentationFactory.registerTools(registry);

    const systemFactory = new SystemToolFactory({
      categoryName: "System",
      categoryDescription: "System tools",
      context,
    });
    systemFactory.registerTools(registry);

    // Verify all categories are registered
    expect(registry.getCategoryCount()).toBe(6);
    expect(registry.hasCategory("Memory")).toBe(true);
    expect(registry.hasCategory("Token")).toBe(true);
    expect(registry.hasCategory("Contact")).toBe(true);
    expect(registry.hasCategory("Process")).toBe(true);
    expect(registry.hasCategory("Documentation")).toBe(true);
    expect(registry.hasCategory("System")).toBe(true);

    // Verify tool counts per category
    expect(registry.getToolsByCategory("Memory")).toHaveLength(10);
    expect(registry.getToolsByCategory("Token")).toHaveLength(16);
    expect(registry.getToolsByCategory("Contact")).toHaveLength(2);
    expect(registry.getToolsByCategory("Process")).toHaveLength(7);
    expect(registry.getToolsByCategory("Documentation")).toHaveLength(4);
    expect(registry.getToolsByCategory("System")).toHaveLength(0); // No tools yet

    // Total tools should be 39 (10 + 16 + 2 + 7 + 4 + 0)
    expect(registry.getToolCount()).toBe(39);
  });

  it("should provide comprehensive tool definitions", () => {
    // Register all tool factories
    const memoryFactory = new MemoryToolFactory({
      categoryName: "Memory",
      categoryDescription: "AI Memory management tools",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryName: "Token",
      categoryDescription: "Token management tools",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryName: "Contact",
      categoryDescription: "Contact management tools",
      context,
    });
    contactFactory.registerTools(registry);

    const processFactory = new ProcessToolFactory({
      categoryName: "Process",
      categoryDescription: "Process communication tools",
      context,
    });
    processFactory.registerTools(registry);

    const documentationFactory = new DocumentationToolFactory({
      categoryName: "Documentation",
      categoryDescription: "Documentation tools",
      context,
    });
    documentationFactory.registerTools(registry);

    const systemFactory = new SystemToolFactory({
      categoryName: "System",
      categoryDescription: "System tools",
      context,
    });
    systemFactory.registerTools(registry);

    // Get all tool definitions
    const toolDefinitions = registry.getToolDefinitions(context);
    expect(toolDefinitions).toHaveLength(39);

    // Verify each definition has required properties
    for (const definition of toolDefinitions) {
      expect(definition.name).toBeDefined();
      expect(definition.description).toBeDefined();
      expect(definition.parameters).toBeDefined();
      expect(definition.execute).toBeDefined();
      expect(definition.annotations).toBeDefined();
    }

    // Verify specific tools exist
    const toolNames = toolDefinitions.map(def => def.name);
    
    // Memory tools
    expect(toolNames).toContain("addMemory");
    expect(toolNames).toContain("searchMemories");
    
    // Token tools
    expect(toolNames).toContain("saveTokenMapping");
    expect(toolNames).toContain("transferTokens");
    
    // Contact tools
    expect(toolNames).toContain("saveAddressMapping");
    expect(toolNames).toContain("listContacts");
    
    // Process tools
    expect(toolNames).toContain("executeProcessAction");
  });

  it("should provide registry statistics", () => {
    // Register a few tool factories
    const memoryFactory = new MemoryToolFactory({
      categoryName: "Memory",
      categoryDescription: "AI Memory management tools",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryName: "Token",
      categoryDescription: "Token management tools",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryName: "Contact",
      categoryDescription: "Contact management tools",
      context,
    });
    contactFactory.registerTools(registry);

    const stats = registry.getStats();
    
    expect(stats.totalTools).toBe(28); // 10 + 16 + 2
    expect(stats.totalCategories).toBe(3);
    expect(stats.toolsByCategory).toEqual({
      Memory: 10,
      Token: 16,
      Contact: 2,
    });
  });

  it("should execute contact tools successfully", async () => {
    const { event } = await import("../../../src/relay.js");
    const mockResult = { id: "test-contact-event", success: true };
    (event as any).mockResolvedValue(mockResult);

    const contactFactory = new ContactToolFactory({
      categoryName: "Contact",
      categoryDescription: "Contact management tools",
      context,
    });
    contactFactory.registerTools(registry);

    const saveAddressTool = registry.getTool("saveAddressMapping");
    expect(saveAddressTool).toBeDefined();

    const result = await saveAddressTool!.execute(
      {
        name: "Alice",
        address: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
      },
      context
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.mapping.name).toBe("Alice");
    expect(parsedResult.mapping.address).toBe("abcdefghijklmnopqrstuvwxyz1234567890abcdefg");
  });
});