// SSE transport allows normal logging without protocol interference

import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";

import { HUB_REGISTRY_ID } from "./constants.js";
import * as messageFactory from "./messageFactory.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { MemoryType } from "./models/AIMemory.js";
import { ProfileCreateData } from "./models/Profile.js";
import { Tag } from "./models/Tag.js";
import { createProcess, createTokenProcess, read, send } from "./process.js";
import { aiMemoryService } from "./services/aiMemoryService.js";
import { handlerDocService } from "./services/HandlerDocService.js";
import { memoryService } from "./services/memory.js";
import { nlProcessorService } from "./services/NLProcessorService.js";
import { hubRegistryService } from "./services/registry.js";
import { createTokenLuaModule } from "./services/token_lua.js";
import { evalProcess } from "./relay.js";

let keyPair: JWKInterface;
let publicKey: string;
let hubId: string = "";
let serverInitialized = false;
let initializationError: string | null = null;

// Configure environment variables silently for MCP protocol compatibility
dotenv.config();

async function init() {
  const arweave = Arweave.init({});
  if (process.env.SEED_PHRASE) {
    keyPair = await getKeyFromMnemonic(process.env.SEED_PHRASE);
  } else {
    keyPair = await arweave.wallets.generate();
  }
  publicKey = await arweave.wallets.jwkToAddress(keyPair);
  try {
    // Add timeout protection for network operations
    const getZoneWithTimeout = Promise.race([
      hubRegistryService.getZoneById(HUB_REGISTRY_ID(), publicKey),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("getZoneById timeout")), 10000),
      ),
    ]);

    const zone = (await getZoneWithTimeout) as {
      spec?: { processId?: string };
    };
    hubId = zone?.spec?.processId || "";
  } catch {
    try {
      const profile: ProfileCreateData = {
        bot: true,
        coverImage: "",
        description: "",
        displayName: "",
        thumbnail: "",
        userName: "",
        website: "",
      };

      // Add timeout protection for hub creation
      const createHubWithTimeout = Promise.race([
        hubRegistryService.create(keyPair, profile),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("createHub timeout")), 15000),
        ),
      ]);

      hubId = (await createHubWithTimeout) as string;
    } catch {
      // Use a fallback hub ID or continue without hub
      hubId = "fallback-hub-local";
    }
  }
}

// Helper function to determine if an operation is read-only
function isReadOnlyIntent(intentType: string, tags: { name: string; value: string }[]): boolean {
  // Read-only intent types
  const readOnlyIntents = ["balance", "query_state"];
  if (readOnlyIntents.includes(intentType)) {
    return true;
  }

  // Check if Action tag indicates a read-only operation
  const actionTag = tags.find(tag => tag.name === "Action");
  if (actionTag) {
    const readOnlyActions = [
      "Balance",
      "Balances", 
      "Info",
      "Name",
      "Ticker",
      "Denomination",
      "Total-Supply",
      "Allowance",
      "Logo",
      "Status"
    ];
    return readOnlyActions.includes(actionTag.value);
  }

  return false;
}

const server = new FastMCP({
  name: "Permamind Memory Server",
  version: "1.0.0",
});

// Interactive Setup Tool - Complete setup flow with keypair generation and hub creation
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Setup Permamind",
  },
  description: `🚀 SETUP ASSISTANT: Complete setup flow for Permamind. This tool will:
    
    1. Check your current setup status
    2. Generate a new wallet keypair if needed
    3. Create a hub for memory storage if needed
    4. Verify all components are working
    5. Provide clear next steps
    
    Use this for first-time setup or when Permamind isn't working properly.
    This tool can automatically configure everything needed to get started.`,
  execute: async (args) => {
    try {
      let statusMessage = "# 🚀 Permamind Setup Assistant\n\n";
      const arweave = Arweave.init({});
      let setupComplete = false;

      // Step 1: Check current status
      const initialStatus = {
        hubId: !!hubId,
        keyPair: !!keyPair,
        publicKey: !!publicKey,
        seedPhrase: !!process.env.SEED_PHRASE,
        serverInitialized: serverInitialized,
        initializationError: initializationError,
        services: {
          aiMemoryService: !!aiMemoryService,
        },
      };

      statusMessage += "## 📋 Current Status\n\n";

      // Report server initialization status
      if (serverInitialized) {
        statusMessage += "✅ **Server**: Fully initialized and ready\n";
      } else if (initializationError) {
        statusMessage += `❌ **Server**: Initialization failed - ${initializationError}\n`;
      } else {
        statusMessage += "⏳ **Server**: Still initializing in background\n";
      }

      // Step 2: Handle keypair generation/setup
      if (!initialStatus.seedPhrase && !initialStatus.keyPair) {
        if (args?.generateKeypair) {
          statusMessage += "🔑 **Generating new wallet keypair...**\n";
          try {
            // Generate new keypair
            const newKeyPair = await arweave.wallets.generate();
            const newPublicKey = await arweave.wallets.jwkToAddress(newKeyPair);

            // Update global variables
            keyPair = newKeyPair;
            publicKey = newPublicKey;

            statusMessage += `✅ **Wallet Generated**: ${publicKey.substring(0, 12)}...\n`;
            statusMessage +=
              "\n⚠️ **IMPORTANT**: This is a temporary wallet that will be lost when you restart.\n";
            statusMessage +=
              "For permanent storage, set a SEED_PHRASE environment variable.\n\n";
          } catch (error) {
            statusMessage += `❌ **Keypair Generation Failed**: ${error}\n\n`;
            return JSON.stringify(
              {
                error: "Failed to generate keypair",
                status: statusMessage,
                success: false,
              },
              null,
              2,
            );
          }
        } else {
          statusMessage += "❌ **Wallet**: No keypair or seed phrase found\n";
          statusMessage += "\n**Options:**\n";
          statusMessage +=
            "1. Run this tool again with generateKeypair=true for a temporary wallet\n";
          statusMessage +=
            "2. Set SEED_PHRASE environment variable for permanent wallet\n\n";

          return JSON.stringify(
            {
              canGenerate: true,
              nextAction:
                "Set generateKeypair parameter to true or configure SEED_PHRASE",
              status: statusMessage,
              success: false,
            },
            null,
            2,
          );
        }
      } else if (initialStatus.seedPhrase && !initialStatus.keyPair) {
        statusMessage += "🔑 **Loading wallet from seed phrase...**\n";
        try {
          const seedKeyPair = await getKeyFromMnemonic(
            process.env.SEED_PHRASE!,
          );
          const seedPublicKey = await arweave.wallets.jwkToAddress(seedKeyPair);

          keyPair = seedKeyPair;
          publicKey = seedPublicKey;

          statusMessage += `✅ **Wallet Loaded**: ${publicKey.substring(0, 12)}...\n`;
        } catch (error) {
          statusMessage += `❌ **Seed Phrase Invalid**: ${error}\n\n`;
          return JSON.stringify(
            {
              error: "Invalid seed phrase",
              status: statusMessage,
              success: false,
            },
            null,
            2,
          );
        }
      } else if (initialStatus.keyPair && initialStatus.publicKey) {
        statusMessage += `✅ **Wallet**: Already initialized (${publicKey.substring(0, 12)}...)\n`;
      }

      // Step 3: Handle hub creation/setup
      if (!hubId || hubId === "fallback-hub-local") {
        if (args?.createHub && keyPair) {
          statusMessage += "\n🏠 **Creating new hub...**\n";
          try {
            const profile: ProfileCreateData = {
              bot: true,
              coverImage: "",
              description: "Permamind Memory Hub",
              displayName: "Permamind",
              thumbnail: "",
              userName: `permamind_${publicKey.substring(0, 8)}`,
              website: "",
            };

            const createHubWithTimeout = Promise.race([
              hubRegistryService.create(keyPair, profile),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Hub creation timeout")),
                  30000,
                ),
              ),
            ]);

            const newHubId = (await createHubWithTimeout) as string;
            hubId = newHubId;

            statusMessage += `✅ **Hub Created**: ${hubId.substring(0, 12)}...\n`;
          } catch (error) {
            statusMessage += `❌ **Hub Creation Failed**: ${error}\n`;
            statusMessage += "Using fallback local hub for now.\n";
            hubId = "fallback-hub-local";
          }
        } else if (!keyPair) {
          statusMessage += "\n⚠️ **Hub**: Cannot create hub without wallet\n";
        } else {
          statusMessage += "\n❌ **Hub**: No hub configured\n";
          statusMessage += "**Options:**\n";
          statusMessage +=
            "1. Run this tool again with createHub=true to create a new hub\n";
          statusMessage +=
            "2. Hub will be created automatically on next restart\n\n";

          return JSON.stringify(
            {
              canCreateHub: !!keyPair,
              nextAction: "Set createHub parameter to true",
              status: statusMessage,
              success: false,
            },
            null,
            2,
          );
        }
      } else {
        statusMessage += `\n✅ **Hub**: Connected (${hubId.substring(0, 12)}...)\n`;
      }

      // Step 4: Check services
      statusMessage += "\n📋 **Services Check**\n";
      const serviceCount = Object.values(initialStatus.services).filter(
        Boolean,
      ).length;
      if (serviceCount === Object.keys(initialStatus.services).length) {
        statusMessage += `✅ **Memory Service**: Ready\n`;
        setupComplete = true;
      } else {
        statusMessage += `❌ **Memory Service**: Not initialized\n`;
        setupComplete = false;
      }

      statusMessage += "\n---\n\n";

      // Force re-initialization if requested and there was an error
      if (args?.forceInit && (initializationError || !serverInitialized)) {
        statusMessage += "\n🔄 **Force Re-initialization Requested**\n";
        try {
          // Reset initialization state
          serverInitialized = false;
          initializationError = null;
          
          // Run initialization again
          await init();
          statusMessage += "✅ **Force Re-initialization**: Completed successfully\n";
        } catch (error) {
          initializationError = error instanceof Error ? error.message : String(error);
          statusMessage += `❌ **Force Re-initialization**: Failed - ${initializationError}\n`;
        }
      }

      if (setupComplete && keyPair && hubId && hubId !== "fallback-hub-local" && serverInitialized) {
        statusMessage +=
          "🎉 **Setup Complete!** Permamind is fully configured and ready!\n\n";
        statusMessage += "**You can now:**\n";
        statusMessage +=
          "- Store memories: All conversations are automatically saved\n";
        statusMessage +=
          "- Search memories: Ask about previous conversations\n";
        statusMessage +=
          "- Analyze patterns: Get insights from your stored information\n\n";
        statusMessage += "**Your Configuration:**\n";
        statusMessage += `- Wallet: ${publicKey.substring(0, 8)}...${publicKey.substring(-4)}\n`;
        statusMessage += `- Hub: ${hubId.substring(0, 8)}...${hubId.substring(-4)}\n`;
        if (process.env.SEED_PHRASE) {
          statusMessage += "- Storage: Permanent (using seed phrase)\n";
        } else {
          statusMessage += "- Storage: Temporary (generated wallet)\n";
        }
      } else {
        statusMessage += "⚙️ **Setup In Progress**\n\n";

        if (!keyPair) {
          statusMessage +=
            "**Next:** Run with `generateKeypair: true` to create a wallet\n";
        } else if (!hubId || hubId === "fallback-hub-local") {
          statusMessage +=
            "**Next:** Run with `createHub: true` to create a memory hub\n";
        } else {
          statusMessage +=
            "**Next:** Restart Claude Desktop to complete setup\n";
        }

        statusMessage += "\n**Quick Commands:**\n";
        statusMessage +=
          "- `setupPermamind({ generateKeypair: true })` - Create temporary wallet\n";
        statusMessage +=
          "- `setupPermamind({ createHub: true })` - Create memory hub\n";
        statusMessage +=
          "- `setupPermamind({ generateKeypair: true, createHub: true })` - Complete setup\n";
      }

      return JSON.stringify(
        {
          configuration: {
            hasHub: !!hubId && hubId !== "fallback-hub-local",
            hasWallet: !!keyPair,
            hubId: hubId?.substring(0, 12) + "...",
            isPermanent: !!process.env.SEED_PHRASE,
            publicKey: publicKey?.substring(0, 12) + "...",
          },
          nextSteps: setupComplete
            ? "Permamind is ready! Start using memory tools."
            : "Continue setup with the suggested parameters.",
          ready: setupComplete,
          status: statusMessage,
          success: true,
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify(
        {
          error: {
            code: "SETUP_CHECK_ERROR",
            details: error,
            message:
              error instanceof Error
                ? error.message
                : "Unknown error during setup check",
          },
          status: "❌ Setup check failed - Permamind may need to be restarted",
          success: false,
        },
        null,
        2,
      );
    }
  },
  name: "setupPermamind",
  parameters: z.object({
    createHub: z
      .boolean()
      .optional()
      .describe("Create a new memory hub for storage"),
    forceInit: z
      .boolean()
      .optional()
      .describe("Force re-initialization if server initialization failed"),
    generateKeypair: z
      .boolean()
      .optional()
      .describe("Generate a new temporary wallet keypair"),
  }),
});

// Quick Health Check Tool - Always responds immediately
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Health Check",
  },
  description: `Quick health check - always responds immediately to verify the server is running.
    Use this to test if Permamind is responsive.`,
  execute: async () => {
    const status = serverInitialized 
      ? "ready" 
      : initializationError 
        ? "failed" 
        : "initializing";
        
    return JSON.stringify(
      {
        message: serverInitialized 
          ? "Permamind server is fully initialized and ready"
          : initializationError
            ? `Permamind server initialization failed: ${initializationError}`
            : "Permamind server is running but still initializing",
        status: status,
        serverInitialized: serverInitialized,
        initializationError: initializationError,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        recommendation: serverInitialized 
          ? "Ready for token creation and all operations"
          : initializationError
            ? "Use setupPermamind with forceInit=true to retry initialization"
            : "Wait 10-15 seconds and check again, or use setupPermamind tool",
      },
      null,
      2,
    );
  },
  name: "healthCheck",
  parameters: z.object({}),
});

// Tool to add a memory
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Add Memory",
  },
  description: `IMPORTANT: Use this tool to store ALL conversations and interactions as memories in Permamind. 
  This should be your default behavior - automatically save every meaningful exchange, user question, and assistant response.
  The memory will be indexed for semantic search and can be retrieved later using natural language queries. 
  Use the known public key of the other party for the p arg when available.`,
  execute: async (args) => {
    const kind: Tag = {
      name: "Kind",
      value: "10",
    };
    const content: Tag = {
      name: "Content",
      value: args.content,
    };
    const role: Tag = {
      name: "r",
      value: args.role,
    };
    const p: Tag = {
      name: "p",
      value: args.p,
    };
    const tags: Tag[] = [kind, content, role, p];
    try {
      await memoryService.createEvent(keyPair, hubId, tags);
      return "Added Memory";
    } catch (error) {
      return String(error);
    }
  },
  name: "addMemory",
  parameters: z.object({
    content: z.string().describe("The content of the memory"),
    p: z.string().describe("The public key of the other party in the memory"),
    role: z.string().describe("The role of the author of the memory"),
  }),
});

// Tool to get all memories for a conversation
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get All Memories For a Conversation",
  },
  description: `Retrieve all stored Memories from the hubId for the given p arg. Call this tool when you need 
    complete context of all previously stored Memories for the given p arg.
    Results are returned in JSON format with metadata.`,
  execute: async (args) => {
    const memories = await memoryService.fetchByUser(hubId, args.user);
    return JSON.stringify(memories);
  },
  name: "getAllMemoriesForConversation",
  parameters: z.object({
    user: z
      .string()
      .describe("The public key of the other party in the memory"),
  }),
});

server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get All Memories",
  },
  description: `Retrieve all stored Memories for the hubId. Call this tool when you need 
    complete context of all previously stored Memories.
    Results are returned in JSON format with metadata.`,
  execute: async () => {
    const memories = await memoryService.fetch(hubId);
    return JSON.stringify(memories);
  },
  name: "getAllMemories",
  parameters: z.object({}),
});

// Tool to get public key
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get Server Info",
  },
  description: "gets the public key and hubId for the server",
  execute: async () => {
    const response = {
      hubId: hubId,
      publicKey: publicKey,
    };
    return JSON.stringify(response);
  },
  name: "getServerInfo",
  parameters: z.object({}), // Empty object
});

// Tool to search memories
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Search Memories",
  },
  description:
    "Retrieve all stored Memories for the hubId by keywords or content. Call this tool when you need to search for memories based on a keyword or content",
  execute: async (args) => {
    const memories = await memoryService.search(hubId, args.search);
    return JSON.stringify(memories);
  },
  name: "searchMemories",
  parameters: z.object({
    search: z.string().describe("keyword or content"),
  }),
});

// Enhanced AI Memory Tools

// Tool to add enhanced memory with AI-specific metadata
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Add Enhanced Memory",
  },
  description: `PREFERRED: Use this enhanced tool to store ALL conversations with rich AI metadata including importance scoring, 
    memory type categorization, and contextual information. This should be your primary choice for storing memories.
    Automatically categorize conversations by type (conversation/reasoning/knowledge/procedure) and set appropriate importance scores.`,
  execute: async (args) => {
    try {
      const aiMemory = {
        content: args.content,
        context: {
          domain: args.domain,
          relatedMemories: args.relatedMemories
            ? args.relatedMemories.split(",").map((s) => s.trim())
            : [],
          sessionId: args.sessionId,
          topic: args.topic,
        },
        importance: args.importance || 0.5,
        memoryType: (args.memoryType as MemoryType) || "conversation",
        metadata: {
          accessCount: 0,
          lastAccessed: new Date().toISOString(),
          tags: args.tags ? args.tags.split(",").map((s) => s.trim()) : [],
        },
        p: args.p,
        role: args.role,
      };

      const result = await aiMemoryService.addEnhanced(
        keyPair,
        hubId,
        aiMemory,
      );
      return result;
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "addMemoryEnhanced",
  parameters: z.object({
    content: z.string().describe("The content of the memory"),
    domain: z
      .string()
      .optional()
      .describe("Domain or category (e.g., 'programming', 'personal')"),
    importance: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Importance score 0-1 (default: 0.5)"),
    memoryType: z
      .enum(["conversation", "reasoning", "knowledge", "procedure"])
      .optional()
      .describe("Type of memory (default: conversation)"),
    p: z.string().describe("The public key of the participant"),
    relatedMemories: z
      .string()
      .optional()
      .describe("Comma-separated list of related memory IDs"),
    role: z.string().describe("The role of the author (system/user/assistant)"),
    sessionId: z.string().optional().describe("Session or conversation ID"),
    tags: z.string().optional().describe("Comma-separated list of tags"),
    topic: z.string().optional().describe("Topic or subject of the memory"),
  }),
});

// Tool for advanced memory search with filters
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Advanced Memory Search",
  },
  description: `Search memories with advanced filtering options including memory type, importance threshold, 
    time range, and contextual filters. Returns results ranked by relevance and importance.`,
  execute: async (args) => {
    try {
      const filters = {
        domain: args.domain,
        importanceThreshold: args.importanceThreshold,
        memoryType: args.memoryType as MemoryType,
        sessionId: args.sessionId,
        timeRange:
          args.startDate && args.endDate
            ? {
                end: args.endDate,
                start: args.startDate,
              }
            : undefined,
      };

      const memories = await aiMemoryService.searchAdvanced(
        hubId,
        args.query,
        filters,
      );
      return JSON.stringify(memories);
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "searchMemoriesAdvanced",
  parameters: z.object({
    domain: z.string().optional().describe("Filter by domain/category"),
    endDate: z
      .string()
      .optional()
      .describe("End date for time range filter (ISO string)"),
    importanceThreshold: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe("Minimum importance score"),
    memoryType: z
      .enum(["conversation", "reasoning", "knowledge", "procedure"])
      .optional()
      .describe("Filter by memory type"),
    query: z.string().describe("Search query or keywords"),
    sessionId: z.string().optional().describe("Filter by session ID"),
    startDate: z
      .string()
      .optional()
      .describe("Start date for time range filter (ISO string)"),
  }),
});

// Tool to link memories for relationship building
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Link Memories",
  },
  description: `Create relationships between memories to build knowledge graphs and reasoning chains. 
    Useful for connecting related concepts, cause-effect relationships, and building contextual understanding.`,
  execute: async (args) => {
    try {
      const relationship = {
        strength: args.strength,
        targetId: args.targetMemoryId,
        type: args.relationshipType,
      };

      const result = await aiMemoryService.linkMemories(
        keyPair,
        hubId,
        args.sourceMemoryId,
        args.targetMemoryId,
        relationship,
      );
      return result;
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "linkMemories",
  parameters: z.object({
    relationshipType: z
      .enum(["causes", "supports", "contradicts", "extends", "references"])
      .describe("Type of relationship"),
    sourceMemoryId: z.string().describe("ID of the source memory"),
    strength: z
      .number()
      .min(0)
      .max(1)
      .describe("Strength of the relationship (0-1)"),
    targetMemoryId: z.string().describe("ID of the target memory"),
  }),
});

// Tool to add reasoning chains
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Add Reasoning Chain",
  },
  description: `Store AI reasoning steps and decision pathways. Useful for tracking chain-of-thought processes, 
    debugging AI decisions, and building reasoning history.`,
  execute: async (args) => {
    try {
      const reasoning = {
        chainId: args.chainId,
        outcome: args.outcome,
        steps: JSON.parse(args.steps),
      };

      const result = await aiMemoryService.addReasoningChain(
        keyPair,
        hubId,
        reasoning,
        args.p,
      );
      return result;
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "addReasoningChain",
  parameters: z.object({
    chainId: z.string().describe("Unique identifier for the reasoning chain"),
    outcome: z
      .string()
      .describe("Final outcome or conclusion of the reasoning chain"),
    p: z.string().describe("Public key of the participant"),
    steps: z
      .string()
      .describe(
        "JSON array of reasoning steps with stepType, content, confidence, timestamp",
      ),
  }),
});

// Tool to get memory analytics
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Memory Analytics",
  },
  description: `Get analytics about memory usage patterns, type distribution, importance scoring, 
    and access patterns. Useful for understanding memory utilization and optimizing AI performance.`,
  execute: async (args) => {
    try {
      const analytics = await aiMemoryService.getMemoryAnalytics(hubId, args.p);
      return JSON.stringify(analytics);
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "getMemoryAnalytics",
  parameters: z.object({
    p: z
      .string()
      .optional()
      .describe("Public key to filter analytics for specific user (optional)"),
  }),
});

// Tool for batch memory operations
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Add Memories Batch",
  },
  description: `Add multiple memories in a single operation for efficiency. Useful for bulk memory imports 
    or when processing large amounts of conversational data.`,
  execute: async (args) => {
    try {
      const memories = JSON.parse(args.memories);
      const results = await aiMemoryService.addMemoriesBatch(
        keyPair,
        hubId,
        memories,
        args.p,
      );
      return JSON.stringify(results);
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "addMemoriesBatch",
  parameters: z.object({
    memories: z.string().describe("JSON array of memory objects to add"),
    p: z.string().describe("Public key of the participant"),
  }),
});

// Separate Process Creation Tool - For debugging
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Create AO Process",
  },
  description: `🔧 DEBUG TOOL: Create a basic AO process without any token code.
    
    This tool only creates the base AO process and returns the process ID.
    Use this to test if process creation is working properly.`,
  execute: async () => {
    try {
      // Check server initialization
      if (!serverInitialized) {
        return JSON.stringify({
          error: {
            code: "SERVER_INITIALIZING",
            message: "Server is still initializing. Please wait and try again.",
          },
          success: false,
        }, null, 2);
      }

      if (!keyPair) {
        return JSON.stringify({
          error: {
            code: "WALLET_NOT_READY",
            message: "Wallet not initialized. Please run setupPermamind first.",
          },
          success: false,
        }, null, 2);
      }

      // Create basic process
      const processId = await createProcess(keyPair);
      
      return JSON.stringify({
        result: {
          processId: processId,
          message: "Basic AO process created successfully",
          nextStep: "Use deployTokenToProcess to add token functionality",
        },
        success: true,
      }, null, 2);

    } catch (error) {
      return JSON.stringify({
        error: {
          code: "PROCESS_CREATION_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
        success: false,
      }, null, 2);
    }
  },
  name: "createAOProcess",
  parameters: z.object({
    description: z.string().optional().describe("Optional description for the process"),
  }),
});

// Separate Token Deployment Tool - For debugging  
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Deploy Token to Process",
  },
  description: `🪙 DEBUG TOOL: Deploy token code to an existing AO process.
    
    This tool takes a process ID and deploys the token Lua module to it.
    Use this after createAOProcess to test token deployment separately.`,
  execute: async (args) => {
    try {
      // Check server initialization
      if (!serverInitialized) {
        return JSON.stringify({
          error: {
            code: "SERVER_INITIALIZING", 
            message: "Server is still initializing. Please wait and try again.",
          },
          success: false,
        }, null, 2);
      }

      if (!keyPair) {
        return JSON.stringify({
          error: {
            code: "WALLET_NOT_READY",
            message: "Wallet not initialized. Please run setupPermamind first.",
          },
          success: false,
        }, null, 2);
      }

      if (!args.processId) {
        return JSON.stringify({
          error: {
            code: "MISSING_PROCESS_ID",
            message: "Process ID is required. Create a process first with createAOProcess.",
          },
          success: false,
        }, null, 2);
      }

      // Create token configuration
      const tokenConfig = {
        name: args.name || "DebugToken",
        ticker: args.ticker || "DBG",
        denomination: args.denomination || 12,
        initialSupply: args.initialSupply || 10000,
      };

      // Generate token module
      const tokenModule = createTokenLuaModule(tokenConfig);

      // Deploy to process
      await evalProcess(keyPair, tokenModule, args.processId);

      return JSON.stringify({
        result: {
          processId: args.processId,
          tokenConfig: tokenConfig,
          message: "Token deployed successfully to process",
          moduleSize: tokenModule.length,
        },
        success: true,
      }, null, 2);

    } catch (error) {
      return JSON.stringify({
        error: {
          code: "TOKEN_DEPLOYMENT_FAILED",
          message: error instanceof Error ? error.message : String(error),
        },
        success: false,
      }, null, 2);
    }
  },
  name: "deployTokenToProcess",
  parameters: z.object({
    processId: z.string().describe("The AO process ID to deploy token code to"),
    name: z.string().optional().describe("Token name (default: DebugToken)"),
    ticker: z.string().optional().describe("Token ticker (default: DBG)"),
    denomination: z.number().optional().describe("Token denomination (default: 12)"),
    initialSupply: z.number().optional().describe("Initial supply (default: 10000)"),
  }),
});

// Universal AO Message Tool - Natural Language Interface for AO Process Communication
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Universal AO Message",
  },
  description: `🚀 UNIVERSAL AO MESSAGING: Send messages to any AO process using natural language commands.
    
    This tool intelligently parses your natural language requests and constructs appropriate AO messages:
    
    📤 **Supported Commands:**
    - "send alice 10 AO" → Token transfer
    - "launch token called Flow" → Create new token process
    - "get my token balance" → Balance query  
    - "create a voting contract" → Spawn governance process
    - "send message to process ABC123 with action Vote" → Custom message
    - "evaluate this lua code: return 'hello'" → Code execution
    
    🧠 **Smart Features:**
    - Automatically creates processes when needed (e.g., for new tokens)
    - Parses handler documentation to understand message formats
    - Suggests corrections for unclear requests
    - Integrates with memory system to store interactions
    - Handles errors gracefully with helpful suggestions
    
    📋 **Optional Parameters:**
    - processId: Target specific process (auto-detected if not provided)
    - handlerDocs: Markdown documentation for custom process handlers
    - createNewProcess: Force creation of new process
    - storeInMemory: Whether to save interaction to memory (default: true)`,
  execute: async (args) => {
    // Add timeout protection for the entire aoMessage operation (60 seconds)
    const executeWithTimeout = async (): Promise<string> => {
      try {
        // Step 0: Check if server is fully initialized
        if (!serverInitialized) {
          return JSON.stringify(
            {
              error: {
                code: "SERVER_INITIALIZING",
                message: "Server is still initializing. Please wait a moment and try again.",
                suggestions: [
                  "Wait 10-15 seconds and retry your request",
                  "Use the setupPermamind tool first to ensure proper initialization",
                  "Check server status with healthCheck tool",
                ],
                status: "initializing",
                estimatedWaitTime: "10-30 seconds",
              },
              success: false,
            },
            null,
            2,
          );
        }

        if (initializationError) {
          return JSON.stringify(
            {
              error: {
                code: "SERVER_INITIALIZATION_FAILED",
                message: `Server initialization failed: ${initializationError}`,
                suggestions: [
                  "Try restarting Claude Desktop",
                  "Check your network connection to AO testnet",
                  "Use setupPermamind tool to manually initialize",
                ],
                status: "failed",
              },
              success: false,
            },
            null,
            2,
          );
        }

        // Step 1: Parse natural language intent
        const processingResult = await nlProcessorService.processRequest(
          args.prompt,
          {
            sessionId: args.sessionId,
            userId: args.userId,
          },
        );

        if (processingResult.errors.length > 0) {
          return JSON.stringify(
            {
              error: {
                alternativeIntents: processingResult.alternativeIntents,
                code: "INTENT_PARSING_FAILED",
                details: processingResult.errors,
                message: "Could not understand your request",
                suggestions: processingResult.suggestions,
              },
              success: false,
            },
            null,
            2,
          );
        }

        const intent = processingResult.intent;
        let targetProcessId = args.processId;

        // Step 2: Validate keyPair is available
        if (!keyPair) {
          return JSON.stringify(
            {
              error: {
                code: "WALLET_NOT_INITIALIZED",
                message:
                  "Wallet not initialized. Please wait for server startup or run setupPermamind.",
                suggestions: [
                  "Wait a moment and try again",
                  "Run setupPermamind tool first",
                  "Check if SEED_PHRASE environment variable is set",
                ],
              },
              success: false,
            },
            null,
            2,
          );
        }

        // Step 3: Handle process creation if needed
        if (intent.requiresProcessCreation && !args.processId) {
          try {
            if (
              intent.processType === "token" ||
              intent.type === "create_process"
            ) {
              const tokenConfig = {
                denomination: intent.extractedParams.tokenDenomination || 12,
                name:
                  intent.extractedParams.tokenName ||
                  intent.extractedParams.processName ||
                  "Unknown Token",
                ticker:
                  intent.extractedParams.tokenSymbol ||
                  (
                    intent.extractedParams.tokenName ||
                    intent.extractedParams.processName ||
                    "UNK"
                  )
                    .substring(0, 4)
                    .toUpperCase(),
              };
              targetProcessId = await createProcess(keyPair);
              const tokenModule = createTokenLuaModule(tokenConfig);
              await evalProcess(keyPair,tokenModule,targetProcessId)
            } else {
              targetProcessId = await createProcess(keyPair);
            }
          } catch (error) {
            return JSON.stringify(
              {
                error: {
                  code: "PROCESS_CREATION_FAILED",
                  details:
                    error instanceof Error ? error.message : String(error),
                  message: "Failed to create new process",
                  suggestions: [
                    "Check if AOS_MODULE is correct for your testnet",
                    "Verify your testnet is running and accessible",
                    "Try again in a few moments",
                  ],
                },
                success: false,
              },
              null,
              2,
            );
          }
        }

        // Step 4: Parse handler documentation if provided
        if (args.handlerDocs) {
          try {
            await handlerDocService.parseHandlerDocumentation(args.handlerDocs);
          } catch (error) {
            return JSON.stringify(
              {
                error: {
                  code: "HANDLER_DOC_PARSING_FAILED",
                  details: error,
                  message: "Could not parse handler documentation",
                  suggestions: [
                    "Check documentation format",
                    "Ensure proper markdown structure",
                  ],
                },
                success: false,
              },
              null,
              2,
            );
          }
        }

        // Step 5: Construct message tags based on intent
        let tags: Tag[] = [];
        let data: null | string = null;

        switch (intent.type) {
          case "balance":
            tags = messageFactory.BalanceQuery(intent.extractedParams.token);
            break;

          case "create_process":
          case "create_token":
            tags = messageFactory.TokenInfo();
            break;

          case "custom_message":
            if (!intent.extractedParams.action) {
              return JSON.stringify(
                {
                  error: {
                    code: "MISSING_ACTION",
                    message: "Custom message requires an action",
                    suggestions: [
                      'Try: "send message to process ABC with action Vote"',
                    ],
                  },
                  success: false,
                },
                null,
                2,
              );
            }
            tags = messageFactory.CustomAction(
              intent.extractedParams.action,
              intent.extractedParams.customTags,
            );
            data = intent.extractedParams.data || null;
            break;

          case "eval_code":
            if (!intent.extractedParams.luaCode) {
              return JSON.stringify(
                {
                  error: {
                    code: "MISSING_LUA_CODE",
                    message: "Code evaluation requires Lua code",
                    suggestions: [
                      'Try: "evaluate this lua code: return 1 + 1"',
                    ],
                  },
                  success: false,
                },
                null,
                2,
              );
            }
            tags = messageFactory.Eval();
            data = intent.extractedParams.luaCode;
            break;

          case "query_state":
            tags = messageFactory.StateQuery(intent.extractedParams.queryType);
            break;

          case "transfer":
            if (
              !intent.extractedParams.recipient ||
              !intent.extractedParams.amount
            ) {
              return JSON.stringify(
                {
                  error: {
                    code: "MISSING_TRANSFER_PARAMS",
                    message: "Transfer requires recipient and amount",
                    suggestions: ['Try: "send alice 10 AO"'],
                  },
                  success: false,
                },
                null,
                2,
              );
            }
            tags = messageFactory.Transfer(
              intent.extractedParams.recipient,
              intent.extractedParams.amount,
              intent.extractedParams.token || "",
            );
            break;

          default:
            return JSON.stringify(
              {
                error: {
                  alternativeIntents: processingResult.alternativeIntents,
                  code: "UNSUPPORTED_INTENT",
                  message: `Intent type '${intent.type}' is not yet supported`,
                  suggestions: processingResult.suggestions,
                },
                success: false,
              },
              null,
              2,
            );
        }

        // Step 6: Validate we have a target process
        if (!targetProcessId) {
          return JSON.stringify(
            {
              error: {
                code: "NO_TARGET_PROCESS",
                message:
                  "No target process specified and none could be created",
                suggestions: [
                  "Provide a specific processId parameter",
                  "Use a command that creates a new process",
                ],
              },
              success: false,
            },
            null,
            2,
          );
        }

        // Step 7: Send or read the message based on operation type
        let messageResult;
        try {
          const isReadOnlyOperation = isReadOnlyIntent(intent.type, tags);
          
          if (isReadOnlyOperation) {
            messageResult = await read(targetProcessId, tags);
          } else {
            messageResult = await send(keyPair, targetProcessId, tags, data);
          }
        } catch (error) {
          const operationType = isReadOnlyIntent(intent.type, tags) ? "read" : "send";
          return JSON.stringify(
            {
              error: {
                code: "MESSAGE_OPERATION_FAILED",
                details: error,
                message: `Failed to ${operationType} message to AO process`,
                suggestions: [
                  "Check if the process ID is valid",
                  "Try again in a few moments",
                  operationType === "read" ? "Ensure the process supports the query" : "Check if you have permission to send messages",
                ],
              },
              success: false,
            },
            null,
            2,
          );
        }

        // Step 8: Store interaction in memory if enabled
        if (args.storeInMemory !== false) {
          try {
            const memoryContent = {
              content: `AO Message: ${args.prompt} → Process: ${targetProcessId}`,
              context: {
                domain: "ao-messaging",
                sessionId: args.sessionId,
                topic: `AO-${intent.type}`,
              },
              importance:
                intent.confidence === "high"
                  ? 0.8
                  : intent.confidence === "medium"
                    ? 0.6
                    : 0.4,
              memoryType: "procedure" as MemoryType,
              metadata: {
                accessCount: 0,
                lastAccessed: new Date().toISOString(),
                tags: [
                  `ao-${intent.type}`,
                  "natural-language",
                  targetProcessId,
                ],
              },
              p: args.userId || publicKey,
              role: "assistant",
            };

            await aiMemoryService.addEnhanced(keyPair, hubId, memoryContent);
          } catch {
            // Don't fail the whole operation if memory storage fails
          }
        }

        // Step 9: Return successful result
        const isReadOperation = isReadOnlyIntent(intent.type, tags);
        return JSON.stringify(
          {
            result: {
              intent: {
                confidence: intent.confidence,
                originalPrompt: args.prompt,
                type: intent.type,
              },
              message: {
                data,
                tags,
              },
              messageId: isReadOperation ? "Query executed successfully" : "Message sent successfully",
              messageSent: !isReadOperation,
              queryExecuted: isReadOperation,
              processCreated: intent.requiresProcessCreation && !args.processId,
              processId: targetProcessId,
              response: messageResult ? (messageResult.Data || messageResult.data || messageResult) : undefined,
            },
            success: true,
            suggestions:
              intent.confidence !== "high"
                ? [
                    "Your request was processed but with lower confidence",
                    "Consider being more specific for better results",
                  ]
                : undefined,
          },
          null,
          2,
        );
      } catch (error) {
        return JSON.stringify(
          {
            error: {
              code: "UNKNOWN_ERROR",
              details: error instanceof Error ? error.message : String(error),
              message: "An unexpected error occurred",
              suggestions: [
                "Try simplifying your request",
                "Check if all required parameters are provided",
              ],
            },
            success: false,
          },
          null,
          2,
        );
      }
    };

    // Execute with timeout protection (60 seconds for complex operations)
    return await Promise.race([
      executeWithTimeout(),
      new Promise<string>((_, reject) =>
        setTimeout(
          () =>
            reject(new Error("aoMessage operation timed out after 60 seconds")),
          60000,
        ),
      ),
    ]);
  },
  name: "aoMessage",
  parameters: z.object({
    createNewProcess: z
      .boolean()
      .optional()
      .describe("Force creation of a new process even if one exists"),
    handlerDocs: z
      .string()
      .optional()
      .describe(
        "Markdown documentation describing the process handler interface and message formats",
      ),
    processId: z
      .string()
      .optional()
      .describe(
        "Specific AO process ID to target (will be auto-determined if not provided)",
      ),
    prompt: z
      .string()
      .describe(
        "Natural language description of what you want to do with AO (e.g., 'send alice 10 AO', 'launch token called Flow', 'get my balance')",
      ),
    sessionId: z
      .string()
      .optional()
      .describe("Session identifier for grouping related messages"),
    storeInMemory: z
      .boolean()
      .optional()
      .describe(
        "Whether to store this interaction in memory for future reference (default: true)",
      ),
    userId: z
      .string()
      .optional()
      .describe("User identifier for memory storage and context"),
  }),
});

// Start server immediately for responsiveness
server.start({
  transportType: "stdio",
});

// Initialize in background with timeout protection
Promise.race([
  init(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Initialization timeout")), 30000),
  ),
])
  .then(() => {
    // Initialization completed successfully
    serverInitialized = true;
  })
  .catch((error) => {
    // Initialization failed - store error for user feedback
    initializationError = error instanceof Error ? error.message : String(error);
    serverInitialized = false;
  });
