import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToolContext } from "../../../../src/tools/core/ToolCommand.js";
import { ToolRegistry } from "../../../../src/tools/core/ToolRegistry.js";
import { TokenToolFactory } from "../../../../src/tools/token/TokenToolFactory.js";

// Mock the services
vi.mock("../../../../src/relay.js", () => ({
  event: vi.fn(),
  fetchEvents: vi.fn(),
}));

vi.mock("../../../../src/process.js", () => ({
  read: vi.fn(),
  send: vi.fn(),
}));

vi.mock("../../../../src/services/tokenservice.js", () => ({
  tokenService: {
    create: vi.fn(),
  },
}));

describe("TokenToolFactory", () => {
  let factory: TokenToolFactory;
  let registry: ToolRegistry;
  let context: ToolContext;

  beforeEach(() => {
    vi.clearAllMocks();

    context = {
      hubId: "test-hub-id",
      keyPair: {} as unknown as CryptoKeyPair,
      publicKey: "test-public-key",
    };

    registry = new ToolRegistry();

    factory = new TokenToolFactory({
      categoryDescription: "Token management tools",
      categoryName: "Token",
      context,
    });
  });

  it("should create token tools", () => {
    const tools = factory.createTools();

    expect(tools).toHaveLength(16);

    const toolNames = tools.map((tool) => tool.getMetadata().name);
    expect(toolNames).toContain("saveTokenMapping");
    expect(toolNames).toContain("listTokens");
    expect(toolNames).toContain("transferTokens");
    expect(toolNames).toContain("mintTokens");
    expect(toolNames).toContain("burnTokens");
    expect(toolNames).toContain("transferTokenOwnership");
    expect(toolNames).toContain("getTokenBalance");
    expect(toolNames).toContain("getAllTokenBalances");
    expect(toolNames).toContain("getTokenInfo");
    expect(toolNames).toContain("getTokenName");
    expect(toolNames).toContain("createConfigurableToken");
    expect(toolNames).toContain("validateTokenConfiguration");
    expect(toolNames).toContain("createSimpleToken");
    expect(toolNames).toContain("generateTokenLua");
    expect(toolNames).toContain("getTokenExamples");
    expect(toolNames).toContain("queryTokenInfo");
  });

  it("should register tools with registry", () => {
    factory.registerTools(registry);

    expect(registry.getToolCount()).toBe(16);
    expect(registry.hasCategory("Token")).toBe(true);
    expect(registry.getToolsByCategory("Token")).toHaveLength(16);
  });

  it("should have correct tool metadata", () => {
    const tools = factory.createTools();

    const saveTokenTool = tools.find(
      (tool) => tool.getMetadata().name === "saveTokenMapping",
    );
    expect(saveTokenTool).toBeDefined();
    expect(saveTokenTool!.getMetadata().title).toBe("Save Token Mapping");
    expect(saveTokenTool!.getMetadata().readOnlyHint).toBe(false);

    const listTokensTool = tools.find(
      (tool) => tool.getMetadata().name === "listTokens",
    );
    expect(listTokensTool).toBeDefined();
    expect(listTokensTool!.getMetadata().title).toBe("List Saved Tokens");
    expect(listTokensTool!.getMetadata().readOnlyHint).toBe(true);
  });

  it("should create tools with correct parameter schemas", () => {
    const tools = factory.createTools();

    const saveTokenTool = tools.find(
      (tool) => tool.getMetadata().name === "saveTokenMapping",
    );
    const schema = saveTokenTool!.getParametersSchema();

    // Test that the schema validates correctly
    const validArgs = {
      name: "Test Token",
      processId: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg", // Exactly 43 characters
      ticker: "TEST",
    };

    const result = schema.safeParse(validArgs);
    expect(result.success).toBe(true);

    // Test that invalid args are rejected
    const invalidArgs = {
      name: "Test Token",
      // Missing required fields
    };

    const invalidResult = schema.safeParse(invalidArgs);
    expect(invalidResult.success).toBe(false);
  });

  it("should have correct category information", () => {
    expect(factory.getCategoryName()).toBe("Token");
    expect(factory.getCategoryDescription()).toBe("Token management tools");
    expect(factory.getContext()).toBe(context);
  });
});
