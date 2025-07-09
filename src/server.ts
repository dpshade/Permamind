// SSE transport allows normal logging without protocol interference

import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";

import { HUB_REGISTRY_ID } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
// MemoryType is now imported via the tools module
import { ProfileCreateData } from "./models/Profile.js";
import { defaultProcessService } from "./services/DefaultProcessService.js";
import { hubRegistryService } from "./services/registry.js";
import { ContactToolFactory } from "./tools/contact/ContactToolFactory.js";
import { DocumentationToolFactory } from "./tools/documentation/DocumentationToolFactory.js";
import { ToolContext, toolRegistry } from "./tools/index.js";
import { MemoryToolFactory } from "./tools/memory/MemoryToolFactory.js";
import { ProcessToolFactory } from "./tools/process/ProcessToolFactory.js";
import { SystemToolFactory } from "./tools/system/SystemToolFactory.js";
import { TokenToolFactory } from "./tools/token/TokenToolFactory.js";

let keyPair: JWKInterface;
let publicKey: string;
let hubId: string;

// Configure environment variables silently for MCP protocol compatibility
// Suppress all output from dotenv and any other initialization
const originalLog = globalThis.console.log;
const originalError = globalThis.console.error;
globalThis.console.log = () => {};
globalThis.console.error = () => {};

dotenv.config({ debug: false });

// Only restore console after dotenv is loaded (for MCP protocol compatibility)
if (process.env.NODE_ENV !== "production") {
  globalThis.console.log = originalLog;
  globalThis.console.error = originalError;
}

async function init() {
  const arweave = Arweave.init({});
  if (process.env.SEED_PHRASE) {
    keyPair = await getKeyFromMnemonic(process.env.SEED_PHRASE);
  } else {
    keyPair = await arweave.wallets.generate();
  }
  publicKey = await arweave.wallets.jwkToAddress(keyPair);
  try {
    const zone = await hubRegistryService.getZoneById(
      HUB_REGISTRY_ID(),
      publicKey,
    );
    hubId = (zone.spec as { processId: string }).processId;
  } catch (e) {
    if (
      e ==
      "TypeError: Cannot read properties of undefined (reading 'processId')"
    ) {
      const profile: ProfileCreateData = {
        bot: true,
        coverImage: "",
        description: "",
        displayName: "",
        thumbnail: "",
        userName: "",
        website: "",
      };
      hubId = await hubRegistryService.create(keyPair, profile);
    }
  }

  // Verify default process templates are loaded (silently for MCP compatibility)
  defaultProcessService.getDefaultProcesses();

  // No automatic context loading on startup for better performance
}

// Setup tool registry with all available tools
function setupToolRegistry() {
  // Clear registry first
  toolRegistry.clear();

  // Create tool context
  const context: ToolContext = {
    hubId,
    keyPair,
    publicKey,
  };

  // Register Memory tools
  const memoryFactory = new MemoryToolFactory({
    categoryDescription:
      "AI Memory management tools for persistent storage and retrieval",
    categoryName: "Memory",
    context,
  });

  memoryFactory.registerTools(toolRegistry);

  // Register Token tools
  const tokenFactory = new TokenToolFactory({
    categoryDescription:
      "Token management tools for creating, transferring, and querying tokens",
    categoryName: "Token",
    context,
  });

  tokenFactory.registerTools(toolRegistry);

  // Register Contact tools
  const contactFactory = new ContactToolFactory({
    categoryDescription: "Contact and address management tools",
    categoryName: "Contact",
    context,
  });

  contactFactory.registerTools(toolRegistry);

  // Register Process tools
  const processFactory = new ProcessToolFactory({
    categoryDescription: "AO process communication and blockchain query tools",
    categoryName: "Process",
    context,
  });

  processFactory.registerTools(toolRegistry);

  // Register Documentation tools
  const documentationFactory = new DocumentationToolFactory({
    categoryDescription: "Permaweb documentation and deployment tools",
    categoryName: "Documentation",
    context,
  });

  documentationFactory.registerTools(toolRegistry);

  // Register System tools
  const systemFactory = new SystemToolFactory({
    categoryDescription: "System information and utility tools",
    categoryName: "System",
    context,
  });

  systemFactory.registerTools(toolRegistry);
}

const server = new FastMCP({
  name: "Permamind Memory Server",
  version: "1.0.0",
});

// Register tools from the tool registry
function registerToolsFromRegistry() {
  const context: ToolContext = {
    hubId,
    keyPair,
    publicKey,
  };

  const toolDefinitions = toolRegistry.getToolDefinitions(context);

  for (const toolDefinition of toolDefinitions) {
    server.addTool(toolDefinition);
  }
}

// All tools are now registered via the tool registry (see setupToolRegistry and registerToolsFromRegistry)
// Start server with stdio transport (matches Claude Desktop expectation)
server.start({
  transportType: "stdio",
});

// Initialize in background (silent for stdio transport)
init()
  .then(() => {
    // After initialization, set up the tool registry
    setupToolRegistry();
    registerToolsFromRegistry();
  })
  .catch(() => {
    // Silent error handling for stdio transport compatibility
  });
