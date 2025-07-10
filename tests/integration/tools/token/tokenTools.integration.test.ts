import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToolContext } from "../../../../src/tools/core/ToolCommand.js";
import { ToolRegistry } from "../../../../src/tools/core/ToolRegistry.js";
import { TokenToolFactory } from "../../../../src/tools/token/TokenToolFactory.js";

// Mock the services with more detailed mocks
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

vi.mock("../../../../src/services/simpleToken.js", () => ({
  generateSimpleTokenLua: vi.fn(),
}));

describe("Token Tools Integration", () => {
  let factory: TokenToolFactory;
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

    factory = new TokenToolFactory({
      categoryDescription: "Token management tools",
      categoryName: "Token",
      context,
    });
  });

  it("should integrate token tools with registry", () => {
    factory.registerTools(registry);

    expect(registry.getToolCount()).toBe(16);
    expect(registry.getCategoryCount()).toBe(1);

    const toolDefinitions = registry.getToolDefinitions(context);
    expect(toolDefinitions).toHaveLength(16);

    const saveTokenDefinition = toolDefinitions.find(
      (def) => def.name === "saveTokenMapping",
    );
    expect(saveTokenDefinition).toBeDefined();
    expect(saveTokenDefinition!.execute).toBeDefined();
  });

  it("should execute saveTokenMapping tool successfully", async () => {
    const { event } = await import("../../../../src/relay.js");
    const mockResult = { id: "test-event-id", success: true };
    (event as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockResult,
    );

    factory.registerTools(registry);
    const saveTokenTool = registry.getTool("saveTokenMapping");

    expect(saveTokenTool).toBeDefined();

    const result = await saveTokenTool!.execute(
      {
        name: "Test Token",
        processId: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
        ticker: "TEST",
      },
      context,
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.mapping.name).toBe("Test Token");
    expect(parsedResult.mapping.ticker).toBe("TEST");
    expect(parsedResult.mapping.processId).toBe(
      "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
    );

    expect(event).toHaveBeenCalledWith(
      context.keyPair,
      context.hubId,
      expect.arrayContaining([
        expect.objectContaining({ name: "Kind", value: "30" }),
        expect.objectContaining({ name: "token_name", value: "Test Token" }),
        expect.objectContaining({ name: "token_ticker", value: "TEST" }),
        expect.objectContaining({
          name: "token_processId",
          value: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
        }),
      ]),
    );
  });

  it("should execute listTokens tool successfully", async () => {
    const { fetchEvents } = await import("../../../../src/relay.js");
    const mockEvents = [
      {
        token_name: "Test Token",
        token_processId: "process1",
        token_ticker: "TEST",
      },
      {
        token_name: "Another Token",
        token_processId: "process2",
        token_ticker: "OTHER",
      },
    ];
    (fetchEvents as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockEvents,
    );

    factory.registerTools(registry);
    const listTokensTool = registry.getTool("listTokens");

    expect(listTokensTool).toBeDefined();

    const result = await listTokensTool!.execute({}, context);

    expect(result).toBe(JSON.stringify(mockEvents));
    expect(fetchEvents).toHaveBeenCalledWith(
      context.hubId,
      JSON.stringify([{ kinds: ["30"] }]),
    );
  });

  it("should execute getTokenBalance tool successfully", async () => {
    const { read } = await import("../../../../src/process.js");
    const { fetchEvents } = await import("../../../../src/relay.js");

    // Mock token resolution
    (fetchEvents as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        token_name: "Test Token",
        token_processId: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
        token_ticker: "TEST",
      },
    ]);

    // Mock balance query
    const mockBalance = { Data: JSON.stringify({ balance: "1000" }) };
    (read as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockBalance,
    );

    factory.registerTools(registry);
    const getTokenBalanceTool = registry.getTool("getTokenBalance");

    expect(getTokenBalanceTool).toBeDefined();

    const result = await getTokenBalanceTool!.execute(
      {
        confirmed: true,
        processId: "TEST", // Use ticker for resolution
      },
      context,
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(true);
    expect(parsedResult.balance).toEqual({ balance: "1000" });

    expect(read).toHaveBeenCalledWith(
      "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
      expect.arrayContaining([
        expect.objectContaining({ name: "Action", value: "Balance" }),
        expect.objectContaining({ name: "Target", value: context.publicKey }),
      ]),
    );
  });

  it("should handle token resolution errors gracefully", async () => {
    const { fetchEvents } = await import("../../../../src/relay.js");

    // Mock no tokens found
    (fetchEvents as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    factory.registerTools(registry);
    const getTokenBalanceTool = registry.getTool("getTokenBalance");

    expect(getTokenBalanceTool).toBeDefined();

    const result = await getTokenBalanceTool!.execute(
      {
        processId: "NONEXISTENT",
      },
      context,
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(false);
    expect(parsedResult.error).toBe("Token resolution failed");
  });

  it("should require confirmation for token operations", async () => {
    const { fetchEvents } = await import("../../../../src/relay.js");

    // Mock token found but requires verification
    (fetchEvents as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        token_name: "Test Token",
        token_processId: "abcdefghijklmnopqrstuvwxyz1234567890abcdefg",
        token_ticker: "TEST",
      },
    ]);

    factory.registerTools(registry);
    const getTokenBalanceTool = registry.getTool("getTokenBalance");

    expect(getTokenBalanceTool).toBeDefined();

    const result = await getTokenBalanceTool!.execute(
      {
        processId: "TEST", // Use ticker for resolution
        // No confirmed flag
      },
      context,
    );

    const parsedResult = JSON.parse(result);
    expect(parsedResult.success).toBe(false);
    expect(parsedResult.requiresConfirmation).toBe(true);
    expect(parsedResult.instruction).toContain("confirmed: true");
  });
});
