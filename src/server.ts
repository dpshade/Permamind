// SSE transport allows normal logging without protocol interference

import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";

import { HUB_REGISTRY_ID, ProcessHub } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { MemoryType } from "./models/AIMemory.js";
import { ProfileCreateData } from "./models/Profile.js";
import { Tag } from "./models/Tag.js";
import { event, fetchEvents } from "./relay.js";
import { aiMemoryService, MEMORY_KINDS } from "./services/aiMemoryService.js";
import { hubService } from "./services/hub.js";
import { processCommunicationService } from "./services/ProcessCommunicationService.js";
import { hubRegistryService } from "./services/registry.js";
import { defaultProcessService } from "./services/DefaultProcessService.js";
import { tokenService } from "./services/tokenservice.js";
import { 
  generateTokenLua, 
  validateTokenConfig, 
  exampleConfigs,
  type TokenConfig,
  type BasicMintConfig,
  type CascadeMintConfig,
  type DoubleMintConfig
} from "./services/token_lua.js";
import { 
  generateSimpleTokenLua, 
  validateSimpleTokenConfig,
  type SimpleTokenConfig 
} from "./services/simpleToken.js";

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
}

// Token registry and address book utility functions
interface TokenMatch {
  processId: string;
  name?: string;
  ticker?: string;
  confidence: number;
}

interface AddressMatch {
  address: string;
  name: string;
  confidence: number;
}

interface ResolutionResult<T> {
  resolved: boolean;
  value?: T;
  matches?: T[];
  requiresVerification: boolean;
  verificationMessage?: string;
}

// Check if input looks like a processId (43-character base64-like string)
function looksLikeProcessId(input: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(input);
}

// Resolve token name/ticker to processId using memories
async function resolveToken(input: string): Promise<ResolutionResult<string>> {
  if (looksLikeProcessId(input)) {
    return { resolved: true, value: input, requiresVerification: false };
  }

  try {
    // Use dedicated kind for efficient filtering
    const filter = {
      kinds: [MEMORY_KINDS.TOKEN_MAPPING],
      limit: 100
    };
    const _filters = JSON.stringify([filter]);
    const events = await fetchEvents(hubId, _filters);

    const tokenMatches: TokenMatch[] = [];
    const inputLower = input.toLowerCase();
    
    for (const event of events) {
      try {
        const name = (event.token_name as string) || "";
        const ticker = (event.token_ticker as string) || "";
        const processId = (event.token_processId as string) || "";
        
        if (!name || !ticker || !processId) continue;
        
        let confidence = 0;
        
        // Check if input matches ticker
        if (ticker.toLowerCase() === inputLower) {
          confidence = 0.9;
        }
        // Check if input matches name
        else if (name.toLowerCase().includes(inputLower)) {
          confidence = 0.8;
        }
        // Partial match
        else if (name.toLowerCase().includes(inputLower) || ticker.toLowerCase().includes(inputLower)) {
          confidence = 0.5;
        }
        
        if (confidence > 0) {
          tokenMatches.push({
            processId,
            name,
            ticker,
            confidence
          });
        }
      } catch (error) {
        // Skip invalid entries
        continue;
      }
    }

    // Sort by confidence
    tokenMatches.sort((a, b) => b.confidence - a.confidence);

    if (tokenMatches.length === 0) {
      return {
        resolved: false,
        requiresVerification: false,
        verificationMessage: `No token found for "${input}". Use saveTokenMapping to register this token.`
      };
    }

    if (tokenMatches.length === 1 && tokenMatches[0].confidence > 0.8) {
      const match = tokenMatches[0];
      return {
        resolved: true,
        value: match.processId,
        requiresVerification: true,
        verificationMessage: `Found token: ${match.name || match.ticker || 'Unknown'} (${match.processId}). Continue?`
      };
    }

    // Multiple matches or low confidence - return all for user selection
    return {
      resolved: false,
      matches: tokenMatches.map(m => m.processId),
      requiresVerification: true,
      verificationMessage: `Multiple tokens found for "${input}": ${tokenMatches.map(m => 
        `${m.name || m.ticker || 'Unknown'} (${m.processId.slice(0, 8)}...)`
      ).join(', ')}. Please specify which one to use.`
    };

  } catch (error) {
    return {
      resolved: false,
      requiresVerification: false,
      verificationMessage: `Error resolving token "${input}": ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Resolve contact name to address using memories
async function resolveAddress(input: string): Promise<ResolutionResult<string>> {
  if (looksLikeProcessId(input)) {
    return { resolved: true, value: input, requiresVerification: false };
  }

  try {
    // Use dedicated kind for efficient filtering
    const filter = {
      kinds: [MEMORY_KINDS.CONTACT_MAPPING],
      limit: 100
    };
    const _filters = JSON.stringify([filter]);
    const events = await fetchEvents(hubId, _filters);

    const addressMatches: AddressMatch[] = [];
    const inputLower = input.toLowerCase();
    
    for (const event of events) {
      try {
        const name = (event.contact_name as string) || "";
        const address = (event.contact_address as string) || "";
        
        if (!name || !address) continue;
        
        let confidence = 0;
        if (name.toLowerCase() === inputLower) {
          confidence = 0.9;
        } else if (name.toLowerCase().includes(inputLower)) {
          confidence = 0.7;
        }
        
        if (confidence > 0) {
          addressMatches.push({
            address,
            name,
            confidence
          });
        }
      } catch (error) {
        // Skip invalid entries
        continue;
      }
    }

    // Sort by confidence
    addressMatches.sort((a, b) => b.confidence - a.confidence);

    if (addressMatches.length === 0) {
      return {
        resolved: false,
        requiresVerification: false,
        verificationMessage: `No contact found for "${input}". Use saveAddressMapping to register this contact.`
      };
    }

    if (addressMatches.length === 1 && addressMatches[0].confidence > 0.8) {
      const match = addressMatches[0];
      return {
        resolved: true,
        value: match.address,
        requiresVerification: true,
        verificationMessage: `Found contact: ${match.name} (${match.address}). Continue?`
      };
    }

    // Multiple matches - return all for user selection
    return {
      resolved: false,
      matches: addressMatches.map(m => m.address),
      requiresVerification: true,
      verificationMessage: `Multiple contacts found for "${input}": ${addressMatches.map(m => 
        `${m.name} (${m.address.slice(0, 8)}...)`
      ).join(', ')}. Please specify which one to use.`
    };

  } catch (error) {
    return {
      resolved: false,
      requiresVerification: false,
      verificationMessage: `Error resolving contact "${input}": ${error instanceof Error ? error.message : 'Unknown error'}`
    };
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
      return JSON.stringify(await hubService.createEvent(keyPair, hubId, tags));
    } catch (error) {
      return JSON.stringify(error);
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
    const memories = await hubService.fetchByUser(hubId, args.user);
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
    const memories = await hubService.fetch(hubId);
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
  description:
    "Retrieve all stored Memories for the hubId by keywords or content. Call this tool when you need to search for memories based on a keyword or content",
  execute: async (args) => {
    const memories = await hubService.search(hubId, args.search, "10");
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

// Tool for natural language process communication
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Execute Process Action",
  },
  description: `Execute an action on any AO process using natural language. Process developers can provide a markdown description 
    of their process handlers, and you can interact with the process using natural language requests. The service will automatically 
    parse the process documentation, understand your request, format the appropriate AO message, and execute it.
    
    💡 TIP: For token operations, consider using 'executeTokenAction' or 'executeSmartProcessAction' which provide built-in 
    token templates and don't require manual documentation.`,
  execute: async (args) => {
    try {
      const result = await processCommunicationService.executeProcessRequest(
        args.processMarkdown,
        args.processId,
        args.request,
        keyPair,
      );
      return JSON.stringify(result);
    } catch (error) {
      return `Error: ${error}`;
    }
  },
  name: "executeProcessAction",
  parameters: z.object({
    processId: z.string().describe("The AO process ID to communicate with"),
    processMarkdown: z
      .string()
      .describe(
        "Markdown documentation describing the process handlers and parameters",
      ),
    request: z
      .string()
      .describe("Natural language request describing what action to perform"),
  }),
});

// Token Registry and Address Book Tools

// Save Token Mapping
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Save Token Mapping",
  },
  description: "Save a token name/ticker to processId mapping for future use",
  execute: async (args) => {
    try {
      // Use dedicated token mapping kind for better filtering
      const tags = [
        { name: "Kind", value: MEMORY_KINDS.TOKEN_MAPPING },
        { name: "Content", value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${args.processId}` },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: args.processId },
        { name: "domain", value: "token-registry" }
      ];

      const result = await event(keyPair, hubId, tags);
      
      return JSON.stringify({
        success: true,
        mapping: {
          name: args.name,
          ticker: args.ticker,
          processId: args.processId
        },
        message: `Token mapping saved: ${args.ticker} (${args.name}) -> ${args.processId}`,
        tags: result
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to save token mapping: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "saveTokenMapping",
  parameters: z.object({
    name: z.string().describe("Token name"),
    ticker: z.string().describe("Token ticker/symbol"),
    processId: z.string().describe("AO process ID for the token"),
  }),
});

// Save Address Mapping
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Save Address Mapping",
  },
  description: "Save a contact name to address mapping for future use",
  execute: async (args) => {
    try {
      // Use dedicated contact mapping kind for better filtering
      const tags = [
        { name: "Kind", value: MEMORY_KINDS.CONTACT_MAPPING },
        { name: "Content", value: `Contact mapping: name: ${args.name}, address: ${args.address}` },
        { name: "p", value: publicKey },
        { name: "contact_name", value: args.name },
        { name: "contact_address", value: args.address },
        { name: "domain", value: "address-book" }
      ];

      const result = await event(keyPair, hubId, tags);
      
      return JSON.stringify({
        success: true,
        mapping: {
          name: args.name,
          address: args.address
        },
        message: `Contact mapping saved: ${args.name} -> ${args.address}`,
        tags: result
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to save contact mapping: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "saveAddressMapping",
  parameters: z.object({
    name: z.string().describe("Contact name"),
    address: z.string().describe("Wallet address"),
  }),
});

// List Saved Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "List Saved Tokens",
  },
  description: "List all saved token mappings from the registry",
  execute: async () => {
    try {
      // Use dedicated kind for efficient filtering
      const filter = {
        kinds: [MEMORY_KINDS.TOKEN_MAPPING],
        //limit: 100
      };
      const _filters = JSON.stringify([filter]);
      const events = await fetchEvents(hubId, _filters);
      return JSON.stringify(events);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to list tokens: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "listTokens",
  parameters: z.object({}),
});

// List Saved Contacts
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "List Saved Contacts",
  },
  description: "List all saved contact mappings from the address book",
  execute: async () => {
    try {
      // Use dedicated kind for efficient filtering
      const filter = {
        kinds: [MEMORY_KINDS.CONTACT_MAPPING],
        //limit: 100
      };
      const _filters = JSON.stringify([filter]);
      const events = await fetchEvents(hubId, _filters);
      return JSON.stringify(events);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Failed to list contacts: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "listContacts",
  parameters: z.object({}),
});

// Individual Token Handler Tools

// Transfer Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Transfer Tokens",
  },
  description: "Transfer tokens from your account to another address. Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { read, send } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      // Resolve recipient address if needed
      const addressResolution = await resolveAddress(args.recipient);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Recipient resolution failed",
          message: addressResolution.verificationMessage,
          suggestion: "Use saveAddressMapping to register this contact or provide a valid address"
        });
      }
      
      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: addressResolution.verificationMessage,
          resolvedRecipient: addressResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this recipient"
        });
      }
      
      const recipient = addressResolution.value!;
      
      // Get token info to check denomination
      const tokenInfo = await read(processId, [{ name: 'Action', value: 'Info' }]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;
      
      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch (error) {
          // Use default denomination if parsing fails
        }
      }
      
      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes('.') && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (numericQuantity * Math.pow(10, denomination)).toString();
      }
      
      // First check current balance
      const balanceResult = await read(processId, [
        { name: 'Action', value: 'Balance' },
        { name: 'Target', value: publicKey }
      ]);
      
      // Then attempt transfer
      const tags = [
        { name: 'Action', value: 'Transfer' },
        { name: 'Recipient', value: recipient },
        { name: 'Quantity', value: actualQuantity }
      ];
      
      const result = await send(keyPair, processId, tags, null);
      
      return JSON.stringify({
        success: true,
        balanceCheck: balanceResult,
        transferResult: result,
        transferDetails: {
          from: publicKey,
          to: recipient,
          requestedQuantity: args.quantity,
          actualQuantity: actualQuantity,
          denomination: denomination,
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId,
            originalRecipient: args.recipient
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorDetails: error instanceof Error ? error.stack : undefined,
        transferAttempt: {
          processId: args.processId,
          recipient: args.recipient,
          quantity: args.quantity,
          from: publicKey
        }
      });
    }
  },
  name: "transferTokens",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    recipient: z.string().describe("Address or contact name to send tokens to"),
    quantity: z.string().describe("Amount of tokens to transfer (will be converted based on token denomination unless rawAmount is true)"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved tokens/addresses"),
    rawAmount: z.boolean().optional().describe("Set to true to send exact amount without denomination conversion"),
  }),
});

// Mint Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Mint Tokens",
  },
  description: "Create new tokens (owner only). Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { send, read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      // Resolve recipient address if needed
      const addressResolution = await resolveAddress(args.recipient);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Recipient resolution failed",
          message: addressResolution.verificationMessage,
          suggestion: "Use saveAddressMapping to register this contact or provide a valid address"
        });
      }
      
      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: addressResolution.verificationMessage,
          resolvedRecipient: addressResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this recipient"
        });
      }
      
      const recipient = addressResolution.value!;
      
      // Get token info to check denomination
      const tokenInfo = await read(processId, [{ name: 'Action', value: 'Info' }]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;
      
      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch (error) {
          // Use default denomination if parsing fails
        }
      }
      
      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes('.') && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (numericQuantity * Math.pow(10, denomination)).toString();
      }
      
      const tags = [
        { name: 'Action', value: 'Mint' },
        { name: 'Recipient', value: recipient },
        { name: 'Quantity', value: actualQuantity }
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        success: true,
        mintResult: result,
        mintDetails: {
          processId: processId,
          recipient: recipient,
          requestedQuantity: args.quantity,
          actualQuantity: actualQuantity,
          denomination: denomination,
          resolvedFromInput: {
            originalToken: args.processId,
            originalRecipient: args.recipient
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Mint failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "mintTokens",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    recipient: z.string().describe("Address or contact name to receive new tokens"),
    quantity: z.string().describe("Amount of tokens to mint (will be converted based on token denomination unless rawAmount is true)"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved tokens/addresses"),
    rawAmount: z.boolean().optional().describe("Set to true to mint exact amount without denomination conversion"),
  }),
});

// Burn Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Burn Tokens",
  },
  description: "Destroy tokens from your account. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { send, read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      // Get token info to check denomination
      const tokenInfo = await read(processId, [{ name: 'Action', value: 'Info' }]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;
      
      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch (error) {
          // Use default denomination if parsing fails
        }
      }
      
      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes('.') && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (numericQuantity * Math.pow(10, denomination)).toString();
      }
      
      const tags = [
        { name: 'Action', value: 'Burn' },
        { name: 'Quantity', value: actualQuantity }
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        success: true,
        burnResult: result,
        burnDetails: {
          processId: processId,
          requestedQuantity: args.quantity,
          actualQuantity: actualQuantity,
          denomination: denomination,
          resolvedFromInput: {
            originalToken: args.processId
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Burn failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "burnTokens",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: z.string().describe("Amount of tokens to burn (will be converted based on token denomination unless rawAmount is true)"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token"),
    rawAmount: z.boolean().optional().describe("Set to true to burn exact amount without denomination conversion"),
  }),
});

// Transfer Token Ownership
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Transfer Token Ownership",
  },
  description: "Transfer contract ownership to another address (owner only). Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { send } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      // Resolve new owner address if needed
      const addressResolution = await resolveAddress(args.newOwner);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "New owner resolution failed",
          message: addressResolution.verificationMessage,
          suggestion: "Use saveAddressMapping to register this contact or provide a valid address"
        });
      }
      
      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: addressResolution.verificationMessage,
          resolvedNewOwner: addressResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this new owner"
        });
      }
      
      const newOwner = addressResolution.value!;
      
      const tags = [
        { name: 'Action', value: 'Transfer-Ownership' },
        { name: 'NewOwner', value: newOwner }
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        success: true,
        ownershipResult: result,
        ownershipDetails: {
          processId: processId,
          newOwner: newOwner,
          resolvedFromInput: {
            originalToken: args.processId,
            originalNewOwner: args.newOwner
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Ownership transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "transferTokenOwnership",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    newOwner: z.string().describe("Address or contact name of the new owner"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token/address"),
  }),
});

// Get Token Balance
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Balance",
  },
  description: "Get token balance for a specific address. Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      let target = publicKey; // Default to current user
      
      // Resolve target address if provided
      if (args.target) {
        const addressResolution = await resolveAddress(args.target);
        if (!addressResolution.resolved) {
          return JSON.stringify({
            success: false,
            error: "Target address resolution failed",
            message: addressResolution.verificationMessage,
            suggestion: "Use saveAddressMapping to register this contact or provide a valid address"
          });
        }
        
        if (addressResolution.requiresVerification && !args.confirmed) {
          return JSON.stringify({
            success: false,
            requiresConfirmation: true,
            message: addressResolution.verificationMessage,
            resolvedTarget: addressResolution.value,
            instruction: "Add 'confirmed: true' to your request to proceed with this target address"
          });
        }
        
        target = addressResolution.value!;
      }
      
      const tags = [
        { name: 'Action', value: 'Balance' },
        { name: 'Target', value: target }
      ];
      
      const result = await read(processId, tags);
      return JSON.stringify({
        success: true,
        balanceResult: result,
        balanceDetails: {
          processId: processId,
          target: target,
          resolvedFromInput: {
            originalToken: args.processId,
            originalTarget: args.target
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Balance query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "getTokenBalance",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    target: z.string().optional().describe("Address or contact name to check balance for (optional, defaults to your wallet address)"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token/address"),
  }),
});

// Get All Token Balances
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Token Balances",
  },
  description: "Get all token balances in the contract. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      const tags = [{ name: 'Action', value: 'Balances' }];
      const result = await read(processId, tags);
      return JSON.stringify({
        success: true,
        balancesResult: result,
        balancesDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Balances query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "getAllTokenBalances",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token"),
  }),
});

// Get Token Info
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Info",
  },
  description: "Get comprehensive token information. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      const tags = [{ name: 'Action', value: 'Info' }];
      const result = await read(processId, tags);
      return JSON.stringify({
        success: true,
        infoResult: result,
        infoDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Info query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "getTokenInfo",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token"),
  }),
});

// Get Token Name
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Name",
  },
  description: "Get the token name. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");
      
      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          success: false,
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId"
        });
      }
      
      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          success: false,
          requiresConfirmation: true,
          message: tokenResolution.verificationMessage,
          resolvedToken: tokenResolution.value,
          instruction: "Add 'confirmed: true' to your request to proceed with this token"
        });
      }
      
      const processId = tokenResolution.value!;
      
      const tags = [{ name: 'Action', value: 'Name' }];
      const result = await read(processId, tags);
      return JSON.stringify({
        success: true,
        nameResult: result,
        nameDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId
          }
        }
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Name query failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "getTokenName",
  parameters: z.object({
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    confirmed: z.boolean().optional().describe("Set to true to confirm resolved token"),
  }),
});

// Tool for smart process execution with auto-detection and fallback
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Execute Smart Process Action",
  },
  description: `Intelligent process execution that automatically detects process types and uses appropriate templates. Falls back to 
    traditional documentation-based approach if auto-detection fails. Supports token operations out of the box, with extensibility 
    for other process types (NFT, DAO, DeFi, etc.).`,
  execute: async (args) => {
    try {
      const result = await processCommunicationService.executeSmartRequest(
        args.processId,
        args.request,
        keyPair,
        args.processMarkdown,
      );
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: `Smart process execution failed: ${error}`,
        success: false,
      });
    }
  },
  name: "executeSmartProcessAction",
  parameters: z.object({
    processId: z.string().describe("The AO process ID to communicate with"),
    request: z
      .string()
      .describe("Natural language request describing what action to perform"),
    processMarkdown: z
      .string()
      .optional()
      .describe("Optional markdown documentation (will attempt auto-detection if not provided)"),
  }),
});

// Tool to publish process integrations (Kind 11) to ProcessHub
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Publish Process Integration",
  },
  description: `Publish a Natural Language Process Integration (Kind 11) to the ProcessHub. This makes your AO process discoverable 
    and usable by AI agents through natural language. Provide the process documentation in markdown format following the VIP-11 specification.`,
  execute: async (args) => {
    try {
      const tags: Tag[] = [
        { name: "Kind", value: "11" },
        { name: "title", value: args.title },
        { name: "description", value: args.description },
      ];

      // Add optional tags
      if (args.version) {
        tags.push({ name: "version", value: args.version });
      }
      if (args.category) {
        tags.push({ name: "category", value: args.category });
      }
      if (args.processId) {
        tags.push({ name: "process_id", value: args.processId });
      }

      await event(keyPair, ProcessHub(), tags, args.processMarkdown);

      return JSON.stringify({
        description: args.description,
        message: "Process integration published successfully",
        processHub: ProcessHub(),
        success: true,
        title: args.title,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to publish process integration: ${error}`,
        success: false,
      });
    }
  },
  name: "publish",
  parameters: z.object({
    category: z
      .string()
      .optional()
      .describe("Process category (e.g., 'defi', 'nft', 'governance')"),
    description: z
      .string()
      .describe("Brief description of process functionality"),
    processId: z
      .string()
      .optional()
      .describe("Associated AO process identifier"),
    processMarkdown: z
      .string()
      .describe(
        "Markdown documentation describing the process handlers and parameters following VIP-11 format",
      ),
    title: z
      .string()
      .describe("Human-readable process name (e.g., 'Token Transfer Process')"),
    version: z
      .string()
      .optional()
      .describe("Documentation version string (e.g., '1.0.0')"),
  }),
});

// Tool to load/search process integrations (Kind 11) from ProcessHub
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Load Process Integrations",
  },
  description: `Search and load Natural Language Process Integrations (Kind 11) from the ProcessHub. Use natural language to find 
    process integrations by title, category, process ID, or general keywords. Returns process documentation that can be used with executeProcessAction.`,
  execute: async (args) => {
    try {
      // Parse query for specific filters
      const query = args.query?.toLowerCase() || "";

      const result = await hubService.loadProcessIntegrations(
        ProcessHub(),
        query,
      );

      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: `Failed to load process integrations: ${error}`,
        success: false,
      });
    }
  },
  name: "load",
  parameters: z.object({
    limit: z
      .number()
      .optional()
      .describe("Maximum number of results to return (default: 50, max: 500)"),
    query: z
      .string()
      .optional()
      .describe(
        "Natural language search query (title, category like 'defi', 'nft', 'governance', process ID, or keywords)",
      ),
  }),
});

// Tool to create configurable tokens with multiple minting strategies
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Create Configurable Token",
  },
  description: `Deploy a configurable AO token with custom minting strategies. Simple, focused tool for token deployment.
    
    Available strategies:
    - 'basic': Simple multiplier-based minting with buy token
    - 'cascade': Progressive minting limits that increase over time  
    - 'double_mint': Accept multiple buy tokens with different rates
    - 'none': Admin-only token with optional initial supply (auto-allocated to you)
    
    No complex allocation management needed - tokens are created ready to use.`,
  execute: async (args) => {
    try {
      // Build base token configuration
      const tokenConfig: TokenConfig = {
        name: args.name,
        ticker: args.ticker,
        logo: args.logo,
        description: args.description,
        denomination: args.denomination || 12,
        mintingStrategy: args.mintingStrategy as TokenConfig['mintingStrategy'],
        transferable: args.transferable ?? true,
        burnable: args.burnable ?? true,
      };

      // Handle strategy-specific configuration
      if (args.mintingStrategy === 'basic') {
        if (!args.buyToken || !args.multiplier || !args.maxMint) {
          return JSON.stringify({
            success: false,
            error: "Basic minting strategy requires buyToken, multiplier, and maxMint parameters"
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          multiplier: args.multiplier,
          maxMint: args.maxMint,
        } as BasicMintConfig;
      } 
      else if (args.mintingStrategy === 'cascade') {
        if (!args.buyToken || !args.multiplier || !args.maxMint || !args.baseMintLimit || !args.incrementBlocks || !args.maxCascadeLimit) {
          return JSON.stringify({
            success: false,
            error: "Cascade minting strategy requires buyToken, multiplier, maxMint, baseMintLimit, incrementBlocks, and maxCascadeLimit parameters"
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          multiplier: args.multiplier,
          maxMint: args.maxMint,
          baseMintLimit: args.baseMintLimit,
          incrementBlocks: args.incrementBlocks,
          maxCascadeLimit: args.maxCascadeLimit,
        } as CascadeMintConfig;
      }
      else if (args.mintingStrategy === 'double_mint') {
        if (!args.buyTokens || !args.maxMint) {
          return JSON.stringify({
            success: false,
            error: "Double mint strategy requires buyTokens and maxMint parameters"
          });
        }
        tokenConfig.mintingConfig = {
          buyTokens: args.buyTokens,
          maxMint: args.maxMint,
        } as DoubleMintConfig;
      }
      else if (args.mintingStrategy === 'none') {
        // For 'none' strategy, auto-allocate initial supply to creator if provided
        if (args.initialSupply) {
          tokenConfig.initialSupply = args.initialSupply;
          tokenConfig.initialAllocations = {
            [publicKey]: args.initialSupply  // Auto-allocate to creator
          };
        } else {
          tokenConfig.initialSupply = "0";
        }
      }

      // Validate configuration
      const validation = validateTokenConfig(tokenConfig);
      if (!validation.valid) {
        return JSON.stringify({
          success: false,
          error: "Token configuration validation failed",
          validationErrors: validation.errors,
          suggestion: "Check your parameters and try again"
        });
      }

      // Generate and deploy token
      const luaScript = generateTokenLua(tokenConfig);
      const processId = await tokenService.create(keyPair, luaScript);

      // Add to token registry for easy discovery
      const tokenTags = [
        { name: "Kind", value: MEMORY_KINDS.TOKEN_MAPPING },
        { name: "Content", value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${processId}` },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: processId },
        { name: "domain", value: "token-registry" }
      ];
      await event(keyPair, hubId, tokenTags);

      return JSON.stringify({
        success: true,
        processId,
        tokenInfo: {
          name: args.name,
          ticker: args.ticker,
          strategy: args.mintingStrategy,
          features: {
            transferable: tokenConfig.transferable,
            burnable: tokenConfig.burnable,
          },
        },
        message: `Token "${args.name}" (${args.ticker}) deployed successfully!`,
        nextSteps: args.mintingStrategy === 'none' ? [
          "Use mint action as admin to create tokens",
          `Process ID: ${processId}`
        ] : [
          `Send ${args.buyToken ? 'buy tokens' : 'payment tokens'} to process to mint`,
          `Process ID: ${processId}`
        ],
        registryAdded: true
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Token deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "createConfigurableToken",
  parameters: z.object({
    // Basic Token Metadata
    name: z.string().min(1).max(50).describe("Token name (e.g., 'My Awesome Token')"),
    ticker: z.string().min(1).max(10).describe("Token ticker/symbol (e.g., 'MAT')"),
    logo: z.string().optional().describe("Token logo URL (optional)"),
    description: z.string().optional().describe("Token description (optional)"),
    denomination: z.number().min(0).max(18).optional().describe("Token decimals (default: 12)"),
    
    // Minting Strategy
    mintingStrategy: z.enum(['basic', 'cascade', 'double_mint', 'none']).describe("Minting strategy"),
    
    // Strategy-specific parameters (flattened for simplicity)
    // Basic & Cascade shared parameters
    buyToken: z.string().optional().describe("Token address used for minting (required for basic/cascade strategies)"),
    multiplier: z.number().positive().optional().describe("Conversion rate (required for basic/cascade strategies)"),
    maxMint: z.string().optional().describe("Maximum tokens that can be minted (required for basic/cascade/double_mint)"),
    
    // Cascade-specific parameters
    baseMintLimit: z.string().optional().describe("Starting mint limit (required for cascade strategy)"),
    incrementBlocks: z.number().positive().optional().describe("Blocks between limit increases (required for cascade strategy)"),
    maxCascadeLimit: z.string().optional().describe("Final maximum limit (required for cascade strategy)"),
    
    // Double mint parameters
    buyTokens: z.record(z.string(), z.object({
      multiplier: z.number().positive(),
      enabled: z.boolean(),
    })).optional().describe("Map of buy token addresses to configurations (required for double_mint strategy)"),
    
    // None strategy parameter
    initialSupply: z.string().optional().describe("Initial supply for 'none' strategy (auto-allocated to you)"),
    
    // Feature toggles
    transferable: z.boolean().optional().describe("Whether tokens can be transferred (default: true)"),
    burnable: z.boolean().optional().describe("Whether tokens can be burned (default: true)"),
  }),
});

// Tool to validate token configuration without deploying
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Validate Token Configuration",
  },
  description: `Validate a token configuration without deploying it. Uses the same simplified parameters as createConfigurableToken.
    Returns detailed validation results and suggestions for improvement.`,
  execute: async (args) => {
    try {
      // Build token configuration using same logic as createConfigurableToken
      const tokenConfig: TokenConfig = {
        name: args.name,
        ticker: args.ticker,
        logo: args.logo,
        description: args.description,
        denomination: args.denomination || 12,
        mintingStrategy: args.mintingStrategy as TokenConfig['mintingStrategy'],
        transferable: args.transferable ?? true,
        burnable: args.burnable ?? true,
      };

      // Handle strategy-specific configuration (same as createConfigurableToken)
      if (args.mintingStrategy === 'basic') {
        if (!args.buyToken || !args.multiplier || !args.maxMint) {
          return JSON.stringify({
            valid: false,
            errors: ["Basic minting strategy requires buyToken, multiplier, and maxMint parameters"],
            suggestion: "Provide all required parameters for basic minting strategy"
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          multiplier: args.multiplier,
          maxMint: args.maxMint,
        } as BasicMintConfig;
      } 
      else if (args.mintingStrategy === 'cascade') {
        if (!args.buyToken || !args.multiplier || !args.maxMint || !args.baseMintLimit || !args.incrementBlocks || !args.maxCascadeLimit) {
          return JSON.stringify({
            valid: false,
            errors: ["Cascade minting strategy requires buyToken, multiplier, maxMint, baseMintLimit, incrementBlocks, and maxCascadeLimit parameters"],
            suggestion: "Provide all required parameters for cascade minting strategy"
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          multiplier: args.multiplier,
          maxMint: args.maxMint,
          baseMintLimit: args.baseMintLimit,
          incrementBlocks: args.incrementBlocks,
          maxCascadeLimit: args.maxCascadeLimit,
        } as CascadeMintConfig;
      }
      else if (args.mintingStrategy === 'double_mint') {
        if (!args.buyTokens || !args.maxMint) {
          return JSON.stringify({
            valid: false,
            errors: ["Double mint strategy requires buyTokens and maxMint parameters"],
            suggestion: "Provide buyTokens configuration and maxMint for double mint strategy"
          });
        }
        tokenConfig.mintingConfig = {
          buyTokens: args.buyTokens,
          maxMint: args.maxMint,
        } as DoubleMintConfig;
      }
      else if (args.mintingStrategy === 'none') {
        if (args.initialSupply) {
          tokenConfig.initialSupply = args.initialSupply;
        } else {
          tokenConfig.initialSupply = "0";
        }
      }

      const validation = validateTokenConfig(tokenConfig);
      
      return JSON.stringify({
        valid: validation.valid,
        errors: validation.errors,
        configuration: tokenConfig,
        suggestions: validation.valid ? [
          "Configuration is valid and ready for deployment",
          "Use createConfigurableToken with the same parameters to deploy",
        ] : [
          "Fix the validation errors before deployment",
          "Check parameter requirements for your chosen minting strategy",
        ],
      });
    } catch (error) {
      return JSON.stringify({
        valid: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        configuration: {},
      });
    }
  },
  name: "validateTokenConfiguration",
  parameters: z.object({
    // Same parameters as createConfigurableToken for consistency
    name: z.string().describe("Token name"),
    ticker: z.string().describe("Token ticker"),
    logo: z.string().optional().describe("Token logo URL (optional)"),
    description: z.string().optional().describe("Token description (optional)"),
    denomination: z.number().optional().describe("Token decimals (default: 12)"),
    mintingStrategy: z.enum(['basic', 'cascade', 'double_mint', 'none']).describe("Minting strategy"),
    
    // Flattened strategy-specific parameters
    buyToken: z.string().optional().describe("Token address for minting (required for basic/cascade)"),
    multiplier: z.number().positive().optional().describe("Conversion rate (required for basic/cascade)"),
    maxMint: z.string().optional().describe("Maximum mintable tokens (required for basic/cascade/double_mint)"),
    baseMintLimit: z.string().optional().describe("Starting mint limit (required for cascade)"),
    incrementBlocks: z.number().positive().optional().describe("Blocks between increases (required for cascade)"),
    maxCascadeLimit: z.string().optional().describe("Final maximum limit (required for cascade)"),
    buyTokens: z.record(z.string(), z.object({
      multiplier: z.number().positive(),
      enabled: z.boolean(),
    })).optional().describe("Buy token configurations (required for double_mint)"),
    initialSupply: z.string().optional().describe("Initial supply for 'none' strategy"),
    transferable: z.boolean().optional().describe("Whether tokens can be transferred (default: true)"),
    burnable: z.boolean().optional().describe("Whether tokens can be burned (default: true)"),
  }),
});

// Simple tool to create a token (reverted to pre-allocation logic approach)
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Create Simple Token",
  },
  description: "Create a simple token with basic functionality - reverted to working approach before allocation logic was added",
  execute: async (args) => {
    try {
      // Create simple token configuration (no complex allocation logic)
      const simpleConfig: SimpleTokenConfig = {
        name: args.name,
        ticker: args.ticker,
        totalSupply: args.totalSupply,
        denomination: args.denomination || 12,
        logo: args.logo,
        description: args.description
      };

      // Validate configuration
      const validation = validateSimpleTokenConfig(simpleConfig);
      if (!validation.valid) {
        return JSON.stringify({
          success: false,
          error: "Token configuration validation failed",
          validationErrors: validation.errors
        });
      }

      // Generate simple Lua script (without complex allocation logic)
      const luaScript = generateSimpleTokenLua(simpleConfig);
      const processId = await tokenService.create(keyPair, luaScript);

      // Add to token registry
      const tokenTags = [
        { name: "Kind", value: MEMORY_KINDS.TOKEN_MAPPING },
        { name: "Content", value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${processId}` },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: processId },
        { name: "domain", value: "token-registry" }
      ];
      await event(keyPair, hubId, tokenTags);

      return JSON.stringify({
        success: true,
        processId,
        tokenInfo: {
          name: args.name,
          ticker: args.ticker,
          totalSupply: args.totalSupply,
          denomination: args.denomination || 12,
          owner: publicKey,
          approach: 'simple'
        },
        message: `Simple token "${args.ticker}" created successfully (${args.totalSupply} tokens) and added to registry`,
        registryAdded: true,
        luaScriptLength: luaScript.length
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Simple token creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "createSimpleToken",
  parameters: z.object({
    name: z.string().describe("Token name (e.g. 'Arweave Official')"),
    ticker: z.string().describe("Token ticker (e.g. 'AO')"),
    totalSupply: z.string().describe("Total token supply (e.g. '1000000000000000000' for 1 billion with 12 decimals)"),
    denomination: z.number().optional().describe("Token decimals (default: 12)"),
    logo: z.string().optional().describe("Token logo URL (optional)"),
    description: z.string().optional().describe("Token description (optional)")
  }),
});

// Debug tool to generate and show Lua script
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Generate Token Lua Script",
  },
  description: "Generate and return the Lua script for a token configuration without deploying (for debugging)",
  execute: async (args) => {
    try {
      const tokenConfig: TokenConfig = {
        name: args.name,
        ticker: args.ticker,
        mintingStrategy: args.mintingStrategy as TokenConfig['mintingStrategy'],
        initialAllocations: args.initialAllocations,
        denomination: args.denomination || 12,
        initialSupply: args.initialSupply || "0"
      };

      const luaScript = generateTokenLua(tokenConfig);
      
      return JSON.stringify({
        success: true,
        tokenConfig,
        luaScript,
        scriptLength: luaScript.length
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: `Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  },
  name: "generateTokenLua",
  parameters: z.object({
    name: z.string().describe("Token name"),
    ticker: z.string().describe("Token ticker"),
    mintingStrategy: z.enum(['basic', 'cascade', 'double_mint', 'none']).describe("Minting strategy"),
    initialAllocations: z.record(z.string(), z.string()).optional().describe("Initial token allocations"),
    denomination: z.number().optional().describe("Token decimals"),
    initialSupply: z.string().optional().describe("Initial supply")
  }),
});

// Tool to get example token configurations
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Configuration Examples",
  },
  description: `Get example token configurations for different minting strategies. Returns ready-to-use configuration templates 
    that can be customized and deployed. Includes examples for basic, cascade, double mint, and simple token strategies.`,
  execute: async (args) => {
    try {
      const examples = {
        basic: {
          ...exampleConfigs.basic,
          description: "Simple multiplier-based minting with maximum limits and automatic refunds",
          useCase: "Standard token launch with fixed conversion rate",
        },
        cascade: {
          ...exampleConfigs.cascade,
          description: "Progressive minting limits that increase over time based on block height",
          useCase: "Controlled token distribution with growing supply over time",
        },
        double_mint: {
          ...exampleConfigs.doubleMint,
          description: "Accept multiple buy tokens with different conversion rates",
          useCase: "Flexible minting accepting various payment tokens",
        },
        simple: {
          ...exampleConfigs.simple,
          description: "Basic token with admin-only minting, no automatic minting strategies",
          useCase: "Simple token for manual distribution or specific use cases",
        },
      };

      if (args.strategy) {
        const selectedExample = examples[args.strategy as keyof typeof examples];
        if (selectedExample) {
          return JSON.stringify({
            strategy: args.strategy,
            example: selectedExample,
            instructions: `Customize the parameters and use createConfigurableToken to deploy this ${args.strategy} token.`,
          });
        } else {
          return JSON.stringify({
            error: `Unknown strategy: ${args.strategy}`,
            availableStrategies: Object.keys(examples),
          });
        }
      }

      return JSON.stringify({
        examples,
        instructions: "Choose a strategy and customize the configuration parameters for your needs.",
        availableStrategies: Object.keys(examples),
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to get examples: ${error instanceof Error ? error.message : 'Unknown error'}`,
        examples: {},
      });
    }
  },
  name: "getTokenExamples",
  parameters: z.object({
    strategy: z.enum(['basic', 'cascade', 'double_mint', 'simple']).optional().describe("Specific strategy to get example for (optional)"),
  }),
});

// Tool to query deployed token information
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Token Information",
  },
  description: `Get comprehensive information from a deployed token process. Returns token metadata, current state, 
    minting configuration, and operational status. Uses the token's built-in info handlers to provide detailed insights.`,
  execute: async (args) => {
    try {
      // Use direct AO call to get token info
      const { read } = await import("./process.js");
      const result = await read(args.processId, [{ name: 'Action', value: 'Info' }]);

      if (result) {
        return JSON.stringify({
          success: true,
          processId: args.processId,
          tokenInfo: result,
          queryTime: new Date().toISOString(),
        });
      } else {
        return JSON.stringify({
          success: false,
          processId: args.processId,
          error: "Failed to query token information",
          suggestion: "Ensure the process ID is correct and the token is properly deployed",
        });
      }
    } catch (error) {
      return JSON.stringify({
        success: false,
        processId: args.processId,
        error: `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  },
  name: "queryTokenInfo",
  parameters: z.object({
    processId: z.string().describe("The AO process ID of the deployed token"),
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
