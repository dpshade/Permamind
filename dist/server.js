// SSE transport allows normal logging without protocol interference
import Arweave from "arweave";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { HUB_REGISTRY_ID } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { aiMemoryService } from "./services/aiMemoryService.js";
import { memoryService } from "./services/memory.js";
import { processCommunicationService } from "./services/ProcessCommunicationService.js";
import { hubRegistryService } from "./services/registry.js";
let keyPair;
let publicKey;
let hubId;
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
        const zone = await hubRegistryService.getZoneById(HUB_REGISTRY_ID(), publicKey);
        hubId = zone.spec.processId;
    }
    catch (e) {
        if (e ==
            "TypeError: Cannot read properties of undefined (reading 'processId')") {
            const profile = {
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
}
const server = new FastMCP({
    name: "Permamind Memory Server",
    version: "1.0.0",
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
    description: "gets the public key hubId for the server",
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
// Tool for natural language process communication
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Execute Process Action",
    },
    description: `Execute an action on any AO process using natural language. Process developers can provide a markdown description 
    of their process handlers, and you can interact with the process using natural language requests. The service will automatically 
    parse the process documentation, understand your request, format the appropriate AO message, and execute it.`,
    execute: async (args) => {
        try {
            const result = await processCommunicationService.executeProcessRequest(args.processMarkdown, args.processId, args.request, keyPair);
            return JSON.stringify(result);
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "executeProcessAction",
    parameters: z.object({
        processId: z.string().describe("The AO process ID to communicate with"),
        processMarkdown: z
            .string()
            .describe("Markdown documentation describing the process handlers and parameters"),
        request: z
            .string()
            .describe("Natural language request describing what action to perform"),
    }),
});
// Start server with stdio transport (matches Claude Desktop expectation)
server.start({
    transportType: "stdio",
});
// Initialize in background (silent for stdio transport)
init().catch(() => {
    // Silent error handling for stdio transport compatibility
});
