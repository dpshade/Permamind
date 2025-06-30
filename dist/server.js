// SSE transport allows normal logging without protocol interference
import Arweave from "arweave";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { HUB_REGISTRY_ID } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { aiMemoryService } from "./services/aiMemoryService.js";
import { memoryService } from "./services/memory.js";
import { hubRegistryService } from "./services/registry.js";
let keyPair;
let publicKey;
let hubId = "";
// Configure environment variables silently for MCP protocol compatibility
dotenv.config();
async function init() {
    const arweave = Arweave.init({});
    if (process.env.SEED_PHRASE) {
        keyPair = await getKeyFromMnemonic(process.env.SEED_PHRASE);
    }
    else {
        keyPair = await arweave.wallets.generate();
    }
    publicKey = await arweave.wallets.jwkToAddress(keyPair);
    try {
        // Add timeout protection for network operations
        const getZoneWithTimeout = Promise.race([
            hubRegistryService.getZoneById(HUB_REGISTRY_ID(), publicKey),
            new Promise((_, reject) => setTimeout(() => reject(new Error("getZoneById timeout")), 10000)),
        ]);
        const zone = (await getZoneWithTimeout);
        hubId = zone?.spec?.processId || "";
    }
    catch {
        console.log("Hub lookup failed, creating new hub...");
        try {
            const profile = {
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
                new Promise((_, reject) => setTimeout(() => reject(new Error("createHub timeout")), 15000)),
            ]);
            hubId = (await createHubWithTimeout);
        }
        catch {
            console.log("Hub creation failed, using fallback...");
            // Use a fallback hub ID or continue without hub
            hubId = "fallback-hub-local";
        }
    }
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
                services: {
                    aiMemoryService: !!aiMemoryService,
                },
            };
            statusMessage += "## 📋 Current Status\n\n";
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
                    }
                    catch (error) {
                        statusMessage += `❌ **Keypair Generation Failed**: ${error}\n\n`;
                        return JSON.stringify({
                            error: "Failed to generate keypair",
                            status: statusMessage,
                            success: false,
                        }, null, 2);
                    }
                }
                else {
                    statusMessage += "❌ **Wallet**: No keypair or seed phrase found\n";
                    statusMessage += "\n**Options:**\n";
                    statusMessage +=
                        "1. Run this tool again with generateKeypair=true for a temporary wallet\n";
                    statusMessage +=
                        "2. Set SEED_PHRASE environment variable for permanent wallet\n\n";
                    return JSON.stringify({
                        canGenerate: true,
                        nextAction: "Set generateKeypair parameter to true or configure SEED_PHRASE",
                        status: statusMessage,
                        success: false,
                    }, null, 2);
                }
            }
            else if (initialStatus.seedPhrase && !initialStatus.keyPair) {
                statusMessage += "🔑 **Loading wallet from seed phrase...**\n";
                try {
                    const seedKeyPair = await getKeyFromMnemonic(process.env.SEED_PHRASE);
                    const seedPublicKey = await arweave.wallets.jwkToAddress(seedKeyPair);
                    keyPair = seedKeyPair;
                    publicKey = seedPublicKey;
                    statusMessage += `✅ **Wallet Loaded**: ${publicKey.substring(0, 12)}...\n`;
                }
                catch (error) {
                    statusMessage += `❌ **Seed Phrase Invalid**: ${error}\n\n`;
                    return JSON.stringify({
                        error: "Invalid seed phrase",
                        status: statusMessage,
                        success: false,
                    }, null, 2);
                }
            }
            else if (initialStatus.keyPair && initialStatus.publicKey) {
                statusMessage += `✅ **Wallet**: Already initialized (${publicKey.substring(0, 12)}...)\n`;
            }
            // Step 3: Handle hub creation/setup
            if (!hubId || hubId === "fallback-hub-local") {
                if (args?.createHub && keyPair) {
                    statusMessage += "\n🏠 **Creating new hub...**\n";
                    try {
                        const profile = {
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
                            new Promise((_, reject) => setTimeout(() => reject(new Error("Hub creation timeout")), 30000)),
                        ]);
                        const newHubId = (await createHubWithTimeout);
                        hubId = newHubId;
                        statusMessage += `✅ **Hub Created**: ${hubId.substring(0, 12)}...\n`;
                    }
                    catch (error) {
                        statusMessage += `❌ **Hub Creation Failed**: ${error}\n`;
                        statusMessage += "Using fallback local hub for now.\n";
                        hubId = "fallback-hub-local";
                    }
                }
                else if (!keyPair) {
                    statusMessage += "\n⚠️ **Hub**: Cannot create hub without wallet\n";
                }
                else {
                    statusMessage += "\n❌ **Hub**: No hub configured\n";
                    statusMessage += "**Options:**\n";
                    statusMessage +=
                        "1. Run this tool again with createHub=true to create a new hub\n";
                    statusMessage +=
                        "2. Hub will be created automatically on next restart\n\n";
                    return JSON.stringify({
                        canCreateHub: !!keyPair,
                        nextAction: "Set createHub parameter to true",
                        status: statusMessage,
                        success: false,
                    }, null, 2);
                }
            }
            else {
                statusMessage += `\n✅ **Hub**: Connected (${hubId.substring(0, 12)}...)\n`;
            }
            // Step 4: Check services
            statusMessage += "\n📋 **Services Check**\n";
            const serviceCount = Object.values(initialStatus.services).filter(Boolean).length;
            if (serviceCount === Object.keys(initialStatus.services).length) {
                statusMessage += `✅ **Memory Service**: Ready\n`;
                setupComplete = true;
            }
            else {
                statusMessage += `❌ **Memory Service**: Not initialized\n`;
                setupComplete = false;
            }
            statusMessage += "\n---\n\n";
            if (setupComplete && keyPair && hubId && hubId !== "fallback-hub-local") {
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
                }
                else {
                    statusMessage += "- Storage: Temporary (generated wallet)\n";
                }
            }
            else {
                statusMessage += "⚙️ **Setup In Progress**\n\n";
                if (!keyPair) {
                    statusMessage +=
                        "**Next:** Run with `generateKeypair: true` to create a wallet\n";
                }
                else if (!hubId || hubId === "fallback-hub-local") {
                    statusMessage +=
                        "**Next:** Run with `createHub: true` to create a memory hub\n";
                }
                else {
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
            return JSON.stringify({
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
            }, null, 2);
        }
        catch (error) {
            return JSON.stringify({
                error: {
                    code: "SETUP_CHECK_ERROR",
                    details: error,
                    message: error instanceof Error
                        ? error.message
                        : "Unknown error during setup check",
                },
                status: "❌ Setup check failed - Permamind may need to be restarted",
                success: false,
            }, null, 2);
        }
    },
    name: "setupPermamind",
    parameters: z.object({
        createHub: z
            .boolean()
            .optional()
            .describe("Create a new memory hub for storage"),
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
        return JSON.stringify({
            message: "Permamind server is running and responsive",
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        }, null, 2);
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
        const kind = {
            name: "Kind",
            value: "10",
        };
        const content = {
            name: "Content",
            value: args.content,
        };
        const role = {
            name: "r",
            value: args.role,
        };
        const p = {
            name: "p",
            value: args.p,
        };
        const tags = [kind, content, role, p];
        try {
            await memoryService.createEvent(keyPair, hubId, tags);
            return "Added Memory";
        }
        catch (error) {
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
    description: "Retrieve all stored Memories for the hubId by keywords or content. Call this tool when you need to search for memories based on a keyword or content",
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
                memoryType: args.memoryType || "conversation",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: args.tags ? args.tags.split(",").map((s) => s.trim()) : [],
                },
                p: args.p,
                role: args.role,
            };
            const result = await aiMemoryService.addEnhanced(keyPair, hubId, aiMemory);
            return result;
        }
        catch (error) {
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
                memoryType: args.memoryType,
                sessionId: args.sessionId,
                timeRange: args.startDate && args.endDate
                    ? {
                        end: args.endDate,
                        start: args.startDate,
                    }
                    : undefined,
            };
            const memories = await aiMemoryService.searchAdvanced(hubId, args.query, filters);
            return JSON.stringify(memories);
        }
        catch (error) {
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
            const result = await aiMemoryService.linkMemories(keyPair, hubId, args.sourceMemoryId, args.targetMemoryId, relationship);
            return result;
        }
        catch (error) {
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
            const result = await aiMemoryService.addReasoningChain(keyPair, hubId, reasoning, args.p);
            return result;
        }
        catch (error) {
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
            .describe("JSON array of reasoning steps with stepType, content, confidence, timestamp"),
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
        }
        catch (error) {
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
            const results = await aiMemoryService.addMemoriesBatch(keyPair, hubId, memories, args.p);
            return JSON.stringify(results);
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "addMemoriesBatch",
    parameters: z.object({
        memories: z.string().describe("JSON array of memory objects to add"),
        p: z.string().describe("Public key of the participant"),
    }),
});
// Start server immediately for responsiveness
server.start({
    transportType: "stdio",
});
// Initialize in background with timeout protection
Promise.race([
    init().then(() => {
        console.log("✅ Permamind initialization complete");
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Initialization timeout")), 30000)),
]).catch((error) => {
    console.log("⚠️ Initialization failed or timed out:", error.message);
    // Server continues to run with limited functionality
});
