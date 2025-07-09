import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactToolFactory } from "../../../src/tools/contact/ContactToolFactory.js";
import { ToolContext } from "../../../src/tools/core/ToolCommand.js";
import { ToolRegistry } from "../../../src/tools/core/ToolRegistry.js";
import { DocumentationToolFactory } from "../../../src/tools/documentation/DocumentationToolFactory.js";
import { MemoryToolFactory } from "../../../src/tools/memory/MemoryToolFactory.js";
import { ProcessToolFactory } from "../../../src/tools/process/ProcessToolFactory.js";
import { SystemToolFactory } from "../../../src/tools/system/SystemToolFactory.js";
import { TokenToolFactory } from "../../../src/tools/token/TokenToolFactory.js";

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
    executeCustomQuery: vi.fn(),
    getBlockData: vi.fn(),
    getTransactionData: vi.fn(),
    queryAOProcessMessages: vi.fn(),
    queryBlocks: vi.fn(),
    queryTransactions: vi.fn(),
  },
}));

vi.mock("../../../src/services/PermawebDocs.js", () => ({
  permawebDocs: {
    clearCache: vi.fn(),
    estimateResponseTokens: vi.fn(),
    getAvailableDomains: vi.fn(),
    getCacheStatus: vi.fn(),
    preload: vi.fn(),
    query: vi.fn(),
  },
}));

vi.mock("../../../src/services/PermawebDeployService.js", () => ({
  PermawebDeployService: vi.fn().mockImplementation(() => ({
    checkPrerequisites: vi.fn(),
    deployDirectory: vi.fn(),
  })),
}));

describe("All Tool Categories Integration", () => {
  let registry: ToolRegistry;
  let context: ToolContext;

  beforeEach(() => {
    vi.clearAllMocks();

    context = {
      hubId: "test-hub-id",
      keyPair: { kty: "RSA", n: "test" } as unknown as CryptoKeyPair,
      publicKey: "test-public-key",
    };

    registry = new ToolRegistry();
  });

  it("should register all tool categories", () => {
    // Register all tool factories
    const memoryFactory = new MemoryToolFactory({
      categoryDescription: "AI Memory management tools",
      categoryName: "Memory",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryDescription: "Token management tools",
      categoryName: "Token",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryDescription: "Contact management tools",
      categoryName: "Contact",
      context,
    });
    contactFactory.registerTools(registry);

    const processFactory = new ProcessToolFactory({
      categoryDescription: "Process communication tools",
      categoryName: "Process",
      context,
    });
    processFactory.registerTools(registry);

    const documentationFactory = new DocumentationToolFactory({
      categoryDescription: "Documentation tools",
      categoryName: "Documentation",
      context,
    });
    documentationFactory.registerTools(registry);

    const systemFactory = new SystemToolFactory({
      categoryDescription: "System tools",
      categoryName: "System",
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
      categoryDescription: "AI Memory management tools",
      categoryName: "Memory",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryDescription: "Token management tools",
      categoryName: "Token",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryDescription: "Contact management tools",
      categoryName: "Contact",
      context,
    });
    contactFactory.registerTools(registry);

    const processFactory = new ProcessToolFactory({
      categoryDescription: "Process communication tools",
      categoryName: "Process",
      context,
    });
    processFactory.registerTools(registry);

    const documentationFactory = new DocumentationToolFactory({
      categoryDescription: "Documentation tools",
      categoryName: "Documentation",
      context,
    });
    documentationFactory.registerTools(registry);

    const systemFactory = new SystemToolFactory({
      categoryDescription: "System tools",
      categoryName: "System",
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
    const toolNames = toolDefinitions.map((def) => def.name);

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
      categoryDescription: "AI Memory management tools",
      categoryName: "Memory",
      context,
    });
    memoryFactory.registerTools(registry);

    const tokenFactory = new TokenToolFactory({
      categoryDescription: "Token management tools",
      categoryName: "Token",
      context,
    });
    tokenFactory.registerTools(registry);

    const contactFactory = new ContactToolFactory({
      categoryDescription: "Contact management tools",
      categoryName: "Contact",
      context,
    });
    contactFactory.registerTools(registry);

    const stats = registry.getStats();

    expect(stats.totalTools).toBe(28); // 10 + 16 + 2
    expect(stats.totalCategories).toBe(3);
    expect(stats.toolsByCategory).toEqual({
      Contact: 2,
      Memory: 10,
      Token: 16,
    });
  });

  it("should execute contact tools successfully", async () => {
    const { event } = await import("../../../src/relay.js");
    const mockResult = { id: "test-contact-event", success: true };
    (event as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResult,
    );

    const contactFactory = new ContactToolFactory({
      categoryDescription: "Contact management tools",
      categoryName: "Contact",
      context,
    });
    contactFactory.registerTools(registry);

    const saveAddressTool = registry.getTool("saveAddressMapping");
    expect(saveAddressTool).toBeDefined();

    const result = await saveAddressTool!.execute(
      {
        address: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
        name: "Alice",
      },
      context,
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.mapping.name).toBe("Alice");
    expect(parsedResult.mapping.address).toBe(
      "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
    );
  });
});
