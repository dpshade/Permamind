// SSE transport allows normal logging without protocol interference

import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";

import type {
  AOProcessQuery,
  BlockQuery,
  SortOrder,
  TagOperator,
  TransactionQuery,
} from "./models/ArweaveGraphQL.js";
import type {
  PermawebDocsResult,
  PermawebDomain,
} from "./services/PermawebDocs.js";

import { HUB_REGISTRY_ID, ProcessHub } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { MemoryType } from "./models/AIMemory.js";
import { ProfileCreateData } from "./models/Profile.js";
import { Tag } from "./models/Tag.js";
import { event, fetchEvents } from "./relay.js";
import { aiMemoryService, MEMORY_KINDS } from "./services/aiMemoryService.js";
import { arweaveGraphQLService } from "./services/ArweaveGraphQLService.js";
import { defaultProcessService } from "./services/DefaultProcessService.js";
import { hubService } from "./services/hub.js";
import { PermawebDeployService } from "./services/PermawebDeployService.js";
import { processCommunicationService } from "./services/ProcessCommunicationService.js";
import { hubRegistryService } from "./services/registry.js";
import {
  generateSimpleTokenLua,
  type SimpleTokenConfig,
  validateSimpleTokenConfig,
} from "./services/simpleToken.js";
import {
  type BasicMintConfig,
  type CascadeMintConfig,
  type DoubleMintConfig,
  exampleConfigs,
  generateTokenLua,
  type TokenConfig,
  validateTokenConfig,
} from "./services/token_lua.js";
import { tokenService } from "./services/tokenservice.js";

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

interface AddressMatch {
  address: string;
  confidence: number;
  name: string;
}

interface ResolutionResult<T> {
  matches?: T[];
  requiresVerification: boolean;
  resolved: boolean;
  value?: T;
  verificationMessage?: string;
}

// Token registry and address book utility functions
interface TokenMatch {
  confidence: number;
  name?: string;
  processId: string;
  ticker?: string;
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

// Check if input looks like a processId (43-character base64-like string)
function looksLikeProcessId(input: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(input);
}

// Resolve contact name to address using memories
async function resolveAddress(
  input: string,
): Promise<ResolutionResult<string>> {
  if (looksLikeProcessId(input)) {
    return { requiresVerification: false, resolved: true, value: input };
  }

  try {
    // Use dedicated kind for efficient filtering
    const filter = {
      kinds: [MEMORY_KINDS.CONTACT_MAPPING],
      limit: 100,
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
            confidence,
            name,
          });
        }
      } catch {
        // Skip invalid entries
        continue;
      }
    }

    // Sort by confidence
    addressMatches.sort((a, b) => b.confidence - a.confidence);

    if (addressMatches.length === 0) {
      return {
        requiresVerification: false,
        resolved: false,
        verificationMessage: `No contact found for "${input}". Use saveAddressMapping to register this contact.`,
      };
    }

    if (addressMatches.length === 1 && addressMatches[0].confidence > 0.8) {
      const match = addressMatches[0];
      return {
        requiresVerification: true,
        resolved: true,
        value: match.address,
        verificationMessage: `Found contact: ${match.name} (${match.address}). Continue?`,
      };
    }

    // Multiple matches - return all for user selection
    return {
      matches: addressMatches.map((m) => m.address),
      requiresVerification: true,
      resolved: false,
      verificationMessage: `Multiple contacts found for "${input}": ${addressMatches
        .map((m) => `${m.name} (${m.address.slice(0, 8)}...)`)
        .join(", ")}. Please specify which one to use.`,
    };
  } catch (error) {
    return {
      requiresVerification: false,
      resolved: false,
      verificationMessage: `Error resolving contact "${input}": ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Resolve token name/ticker to processId using memories
async function resolveToken(input: string): Promise<ResolutionResult<string>> {
  if (looksLikeProcessId(input)) {
    return { requiresVerification: false, resolved: true, value: input };
  }

  try {
    // Use dedicated kind for efficient filtering
    const filter = {
      kinds: [MEMORY_KINDS.TOKEN_MAPPING],
      limit: 100,
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
        else if (
          name.toLowerCase().includes(inputLower) ||
          ticker.toLowerCase().includes(inputLower)
        ) {
          confidence = 0.5;
        }

        if (confidence > 0) {
          tokenMatches.push({
            confidence,
            name,
            processId,
            ticker,
          });
        }
      } catch {
        // Skip invalid entries
        continue;
      }
    }

    // Sort by confidence
    tokenMatches.sort((a, b) => b.confidence - a.confidence);

    if (tokenMatches.length === 0) {
      return {
        requiresVerification: false,
        resolved: false,
        verificationMessage: `No token found for "${input}". Use saveTokenMapping to register this token.`,
      };
    }

    if (tokenMatches.length === 1 && tokenMatches[0].confidence > 0.8) {
      const match = tokenMatches[0];
      return {
        requiresVerification: true,
        resolved: true,
        value: match.processId,
        verificationMessage: `Found token: ${match.name || match.ticker || "Unknown"} (${match.processId}). Continue?`,
      };
    }

    // Multiple matches or low confidence - return all for user selection
    return {
      matches: tokenMatches.map((m) => m.processId),
      requiresVerification: true,
      resolved: false,
      verificationMessage: `Multiple tokens found for "${input}": ${tokenMatches
        .map(
          (m) =>
            `${m.name || m.ticker || "Unknown"} (${m.processId.slice(0, 8)}...)`,
        )
        .join(", ")}. Please specify which one to use.`,
    };
  } catch (error) {
    return {
      requiresVerification: false,
      resolved: false,
      verificationMessage: `Error resolving token "${input}": ${error instanceof Error ? error.message : "Unknown error"}`,
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
    "Retrieve all stored Memories for the hubId by keywords or content. Automatically searches both user memories and comprehensive Permaweb ecosystem context documentation. Call this tool when you need to search for memories based on a keyword or content.",
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
      .enum(["conversation", "context", "reasoning", "knowledge", "procedure"])
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
    time range, and contextual filters. Returns results ranked by relevance and importance. Can also include 
    live Permaweb documentation results for comprehensive answers.`,
  execute: async (args) => {
    try {
      let permawebResults: Array<{
        content: string;
        domain: PermawebDomain;
        relevanceScore: number;
        section?: string;
        type: string;
        url: string;
      }> = [];

      // Check if we should include Permaweb documentation
      if (args.includePermawebDocs !== false) {
        try {
          const { permawebDocs } = await import("./services/PermawebDocs.js");

          // Use new BFS-powered query signature, more generous with results
          const docsResults = await permawebDocs.query(args.query);

          if (docsResults.length > 0) {
            permawebResults = docsResults.map((result) => ({
              content: result.content,
              domain: result.domain,
              isFullDocument: true,
              relevanceScore: result.relevanceScore,
              type: "permaweb_docs",
              url: result.url,
            }));
          }
        } catch {
          // Continue with search even if docs query fails
        }
      }

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

      // Combine memory results with Permaweb docs if available
      const response = {
        memories,
        permawebDocs: permawebResults,
        query: args.query,
        totalResults: memories.length + permawebResults.length,
      };

      return JSON.stringify(response);
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
    includePermawebDocs: z
      .boolean()
      .optional()
      .describe("Include live Permaweb documentation results (default: true)"),
    memoryType: z
      .enum(["conversation", "context", "reasoning", "knowledge", "procedure"])
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
        {
          name: "Content",
          value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${args.processId}`,
        },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: args.processId },
        { name: "domain", value: "token-registry" },
      ];

      const result = await event(keyPair, hubId, tags);

      return JSON.stringify({
        mapping: {
          name: args.name,
          processId: args.processId,
          ticker: args.ticker,
        },
        message: `Token mapping saved: ${args.ticker} (${args.name}) -> ${args.processId}`,
        success: true,
        tags: result,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to save token mapping: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "saveTokenMapping",
  parameters: z.object({
    name: z.string().describe("Token name"),
    processId: z.string().describe("AO process ID for the token"),
    ticker: z.string().describe("Token ticker/symbol"),
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
        {
          name: "Content",
          value: `Contact mapping: name: ${args.name}, address: ${args.address}`,
        },
        { name: "p", value: publicKey },
        { name: "contact_name", value: args.name },
        { name: "contact_address", value: args.address },
        { name: "domain", value: "address-book" },
      ];

      const result = await event(keyPair, hubId, tags);

      return JSON.stringify({
        mapping: {
          address: args.address,
          name: args.name,
        },
        message: `Contact mapping saved: ${args.name} -> ${args.address}`,
        success: true,
        tags: result,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to save contact mapping: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "saveAddressMapping",
  parameters: z.object({
    address: z.string().describe("Wallet address"),
    name: z.string().describe("Contact name"),
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
        error: `Failed to list tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
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
        error: `Failed to list contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
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
  description:
    "Transfer tokens from your account to another address. Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { read, send } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Resolve recipient address if needed
      const addressResolution = await resolveAddress(args.recipient);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          error: "Recipient resolution failed",
          message: addressResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveAddressMapping to register this contact or provide a valid address",
        });
      }

      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this recipient",
          message: addressResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedRecipient: addressResolution.value,
          success: false,
        });
      }

      const recipient = addressResolution.value!;

      // Get token info to check denomination
      const tokenInfo = await read(processId, [
        { name: "Action", value: "Info" },
      ]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;

      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch {
          // Use default denomination if parsing fails
        }
      }

      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes(".") && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (
          numericQuantity * Math.pow(10, denomination)
        ).toString();
      }

      // First check current balance
      const balanceResult = await read(processId, [
        { name: "Action", value: "Balance" },
        { name: "Target", value: publicKey },
      ]);

      // Then attempt transfer
      const tags = [
        { name: "Action", value: "Transfer" },
        { name: "Recipient", value: recipient },
        { name: "Quantity", value: actualQuantity },
      ];

      const result = await send(keyPair, processId, tags, null);

      return JSON.stringify({
        balanceCheck: balanceResult,
        success: true,
        transferDetails: {
          actualQuantity: actualQuantity,
          denomination: denomination,
          from: publicKey,
          processId: processId,
          requestedQuantity: args.quantity,
          resolvedFromInput: {
            originalRecipient: args.recipient,
            originalToken: args.processId,
          },
          to: recipient,
        },
        transferResult: result,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        errorDetails: error instanceof Error ? error.stack : undefined,
        success: false,
        transferAttempt: {
          from: publicKey,
          processId: args.processId,
          quantity: args.quantity,
          recipient: args.recipient,
        },
      });
    }
  },
  name: "transferTokens",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved tokens/addresses"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: z
      .string()
      .describe(
        "Amount of tokens to transfer (will be converted based on token denomination unless rawAmount is true)",
      ),
    rawAmount: z
      .boolean()
      .optional()
      .describe(
        "Set to true to send exact amount without denomination conversion",
      ),
    recipient: z.string().describe("Address or contact name to send tokens to"),
  }),
});

// Mint Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Mint Tokens",
  },
  description:
    "Create new tokens (owner only). Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { read, send } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Resolve recipient address if needed
      const addressResolution = await resolveAddress(args.recipient);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          error: "Recipient resolution failed",
          message: addressResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveAddressMapping to register this contact or provide a valid address",
        });
      }

      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this recipient",
          message: addressResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedRecipient: addressResolution.value,
          success: false,
        });
      }

      const recipient = addressResolution.value!;

      // Get token info to check denomination
      const tokenInfo = await read(processId, [
        { name: "Action", value: "Info" },
      ]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;

      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch {
          // Use default denomination if parsing fails
        }
      }

      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes(".") && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (
          numericQuantity * Math.pow(10, denomination)
        ).toString();
      }

      const tags = [
        { name: "Action", value: "Mint" },
        { name: "Recipient", value: recipient },
        { name: "Quantity", value: actualQuantity },
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        mintDetails: {
          actualQuantity: actualQuantity,
          denomination: denomination,
          processId: processId,
          recipient: recipient,
          requestedQuantity: args.quantity,
          resolvedFromInput: {
            originalRecipient: args.recipient,
            originalToken: args.processId,
          },
        },
        mintResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Mint failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "mintTokens",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved tokens/addresses"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: z
      .string()
      .describe(
        "Amount of tokens to mint (will be converted based on token denomination unless rawAmount is true)",
      ),
    rawAmount: z
      .boolean()
      .optional()
      .describe(
        "Set to true to mint exact amount without denomination conversion",
      ),
    recipient: z
      .string()
      .describe("Address or contact name to receive new tokens"),
  }),
});

// Burn Tokens
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Burn Tokens",
  },
  description:
    "Destroy tokens from your account. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read, send } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Get token info to check denomination
      const tokenInfo = await read(processId, [
        { name: "Action", value: "Info" },
      ]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;

      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch {
          // Use default denomination if parsing fails
        }
      }

      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes(".") && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (
          numericQuantity * Math.pow(10, denomination)
        ).toString();
      }

      const tags = [
        { name: "Action", value: "Burn" },
        { name: "Quantity", value: actualQuantity },
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        burnDetails: {
          actualQuantity: actualQuantity,
          denomination: denomination,
          processId: processId,
          requestedQuantity: args.quantity,
          resolvedFromInput: {
            originalToken: args.processId,
          },
        },
        burnResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Burn failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "burnTokens",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: z
      .string()
      .describe(
        "Amount of tokens to burn (will be converted based on token denomination unless rawAmount is true)",
      ),
    rawAmount: z
      .boolean()
      .optional()
      .describe(
        "Set to true to burn exact amount without denomination conversion",
      ),
  }),
});

// Transfer Token Ownership
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Transfer Token Ownership",
  },
  description:
    "Transfer contract ownership to another address (owner only). Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { send } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Resolve new owner address if needed
      const addressResolution = await resolveAddress(args.newOwner);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          error: "New owner resolution failed",
          message: addressResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveAddressMapping to register this contact or provide a valid address",
        });
      }

      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this new owner",
          message: addressResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedNewOwner: addressResolution.value,
          success: false,
        });
      }

      const newOwner = addressResolution.value!;

      const tags = [
        { name: "Action", value: "Transfer-Ownership" },
        { name: "NewOwner", value: newOwner },
      ];
      const result = await send(keyPair, processId, tags, null);
      return JSON.stringify({
        ownershipDetails: {
          newOwner: newOwner,
          processId: processId,
          resolvedFromInput: {
            originalNewOwner: args.newOwner,
            originalToken: args.processId,
          },
        },
        ownershipResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Ownership transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "transferTokenOwnership",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token/address"),
    newOwner: z.string().describe("Address or contact name of the new owner"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
  }),
});

// Get Token Balance
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Balance",
  },
  description:
    "Get token balance for a specific address. Supports token names/tickers and contact names from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      let target = publicKey; // Default to current user

      // Resolve target address if provided
      if (args.target) {
        const addressResolution = await resolveAddress(args.target);
        if (!addressResolution.resolved) {
          return JSON.stringify({
            error: "Target address resolution failed",
            message: addressResolution.verificationMessage,
            success: false,
            suggestion:
              "Use saveAddressMapping to register this contact or provide a valid address",
          });
        }

        if (addressResolution.requiresVerification && !args.confirmed) {
          return JSON.stringify({
            instruction:
              "Add 'confirmed: true' to your request to proceed with this target address",
            message: addressResolution.verificationMessage,
            requiresConfirmation: true,
            resolvedTarget: addressResolution.value,
            success: false,
          });
        }

        target = addressResolution.value!;
      }

      const tags = [
        { name: "Action", value: "Balance" },
        { name: "Target", value: target },
      ];

      const result = await read(processId, tags);
      return JSON.stringify({
        balanceDetails: {
          processId: processId,
          resolvedFromInput: {
            originalTarget: args.target,
            originalToken: args.processId,
          },
          target: target,
        },
        balanceResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Balance query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "getTokenBalance",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token/address"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    target: z
      .string()
      .optional()
      .describe(
        "Address or contact name to check balance for (optional, defaults to your wallet address)",
      ),
  }),
});

// Get All Token Balances
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Token Balances",
  },
  description:
    "Get all token balances in the contract. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      const tags = [{ name: "Action", value: "Balances" }];
      const result = await read(processId, tags);
      return JSON.stringify({
        balancesDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId,
          },
        },
        balancesResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Balances query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "getAllTokenBalances",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
  }),
});

// Get Token Info
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Info",
  },
  description:
    "Get comprehensive token information. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      const tags = [{ name: "Action", value: "Info" }];
      const result = await read(processId, tags);
      return JSON.stringify({
        infoDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId,
          },
        },
        infoResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Info query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "getTokenInfo",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
  }),
});

// Get Token Name
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Name",
  },
  description:
    "Get the token name. Supports token names/tickers from registry.",
  execute: async (args) => {
    try {
      const { read } = await import("./process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      const tags = [{ name: "Action", value: "Name" }];
      const result = await read(processId, tags);
      return JSON.stringify({
        nameDetails: {
          processId: processId,
          resolvedFromInput: {
            originalToken: args.processId,
          },
        },
        nameResult: result,
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Name query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "getTokenName",
  parameters: z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
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
    processMarkdown: z
      .string()
      .optional()
      .describe(
        "Optional markdown documentation (will attempt auto-detection if not provided)",
      ),
    request: z
      .string()
      .describe("Natural language request describing what action to perform"),
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
        burnable: args.burnable ?? true,
        denomination: args.denomination || 12,
        description: args.description,
        logo: args.logo,
        mintingStrategy: args.mintingStrategy as TokenConfig["mintingStrategy"],
        name: args.name,
        ticker: args.ticker,
        transferable: args.transferable ?? true,
      };

      // Handle strategy-specific configuration
      if (args.mintingStrategy === "basic") {
        if (!args.buyToken || !args.multiplier || !args.maxMint) {
          return JSON.stringify({
            error:
              "Basic minting strategy requires buyToken, multiplier, and maxMint parameters",
            success: false,
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          maxMint: args.maxMint,
          multiplier: args.multiplier,
        } as BasicMintConfig;
      } else if (args.mintingStrategy === "cascade") {
        if (
          !args.buyToken ||
          !args.multiplier ||
          !args.maxMint ||
          !args.baseMintLimit ||
          !args.incrementBlocks ||
          !args.maxCascadeLimit
        ) {
          return JSON.stringify({
            error:
              "Cascade minting strategy requires buyToken, multiplier, maxMint, baseMintLimit, incrementBlocks, and maxCascadeLimit parameters",
            success: false,
          });
        }
        tokenConfig.mintingConfig = {
          baseMintLimit: args.baseMintLimit,
          buyToken: args.buyToken,
          incrementBlocks: args.incrementBlocks,
          maxCascadeLimit: args.maxCascadeLimit,
          maxMint: args.maxMint,
          multiplier: args.multiplier,
        } as CascadeMintConfig;
      } else if (args.mintingStrategy === "double_mint") {
        if (!args.buyTokens || !args.maxMint) {
          return JSON.stringify({
            error:
              "Double mint strategy requires buyTokens and maxMint parameters",
            success: false,
          });
        }
        tokenConfig.mintingConfig = {
          buyTokens: args.buyTokens,
          maxMint: args.maxMint,
        } as DoubleMintConfig;
      } else if (args.mintingStrategy === "none") {
        // For 'none' strategy, auto-allocate initial supply to creator if provided
        if (args.initialSupply) {
          tokenConfig.initialSupply = args.initialSupply;
          tokenConfig.initialAllocations = {
            [publicKey]: args.initialSupply, // Auto-allocate to creator
          };
        } else {
          tokenConfig.initialSupply = "0";
        }
      }

      // Validate configuration
      const validation = validateTokenConfig(tokenConfig);
      if (!validation.valid) {
        return JSON.stringify({
          error: "Token configuration validation failed",
          success: false,
          suggestion: "Check your parameters and try again",
          validationErrors: validation.errors,
        });
      }

      // Generate and deploy token
      const luaScript = generateTokenLua(tokenConfig);
      const processId = await tokenService.create(keyPair, luaScript);

      // Add to token registry for easy discovery
      const tokenTags = [
        { name: "Kind", value: MEMORY_KINDS.TOKEN_MAPPING },
        {
          name: "Content",
          value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${processId}`,
        },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: processId },
        { name: "domain", value: "token-registry" },
      ];
      await event(keyPair, hubId, tokenTags);

      return JSON.stringify({
        message: `Token "${args.name}" (${args.ticker}) deployed successfully!`,
        nextSteps:
          args.mintingStrategy === "none"
            ? [
                "Use mint action as admin to create tokens",
                `Process ID: ${processId}`,
              ]
            : [
                `Send ${args.buyToken ? "buy tokens" : "payment tokens"} to process to mint`,
                `Process ID: ${processId}`,
              ],
        processId,
        registryAdded: true,
        success: true,
        tokenInfo: {
          features: {
            burnable: tokenConfig.burnable,
            transferable: tokenConfig.transferable,
          },
          name: args.name,
          strategy: args.mintingStrategy,
          ticker: args.ticker,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: `Token deployment failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "createConfigurableToken",
  parameters: z.object({
    // Cascade-specific parameters
    baseMintLimit: z
      .string()
      .optional()
      .describe("Starting mint limit (required for cascade strategy)"),
    burnable: z
      .boolean()
      .optional()
      .describe("Whether tokens can be burned (default: true)"),
    // Strategy-specific parameters (flattened for simplicity)
    // Basic & Cascade shared parameters
    buyToken: z
      .string()
      .optional()
      .describe(
        "Token address used for minting (required for basic/cascade strategies)",
      ),
    // Double mint parameters
    buyTokens: z
      .record(
        z.string(),
        z.object({
          enabled: z.boolean(),
          multiplier: z.number().positive(),
        }),
      )
      .optional()
      .describe(
        "Map of buy token addresses to configurations (required for double_mint strategy)",
      ),
    denomination: z
      .number()
      .min(0)
      .max(18)
      .optional()
      .describe("Token decimals (default: 12)"),

    description: z.string().optional().describe("Token description (optional)"),

    incrementBlocks: z
      .number()
      .positive()
      .optional()
      .describe(
        "Blocks between limit increases (required for cascade strategy)",
      ),
    // None strategy parameter
    initialSupply: z
      .string()
      .optional()
      .describe("Initial supply for 'none' strategy (auto-allocated to you)"),
    logo: z.string().optional().describe("Token logo URL (optional)"),

    maxCascadeLimit: z
      .string()
      .optional()
      .describe("Final maximum limit (required for cascade strategy)"),
    maxMint: z
      .string()
      .optional()
      .describe(
        "Maximum tokens that can be minted (required for basic/cascade/double_mint)",
      ),
    // Minting Strategy
    mintingStrategy: z
      .enum(["basic", "cascade", "double_mint", "none"])
      .describe("Minting strategy"),

    multiplier: z
      .number()
      .positive()
      .optional()
      .describe("Conversion rate (required for basic/cascade strategies)"),

    // Basic Token Metadata
    name: z
      .string()
      .min(1)
      .max(50)
      .describe("Token name (e.g., 'My Awesome Token')"),

    ticker: z
      .string()
      .min(1)
      .max(10)
      .describe("Token ticker/symbol (e.g., 'MAT')"),
    // Feature toggles
    transferable: z
      .boolean()
      .optional()
      .describe("Whether tokens can be transferred (default: true)"),
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
        burnable: args.burnable ?? true,
        denomination: args.denomination || 12,
        description: args.description,
        logo: args.logo,
        mintingStrategy: args.mintingStrategy as TokenConfig["mintingStrategy"],
        name: args.name,
        ticker: args.ticker,
        transferable: args.transferable ?? true,
      };

      // Handle strategy-specific configuration (same as createConfigurableToken)
      if (args.mintingStrategy === "basic") {
        if (!args.buyToken || !args.multiplier || !args.maxMint) {
          return JSON.stringify({
            errors: [
              "Basic minting strategy requires buyToken, multiplier, and maxMint parameters",
            ],
            suggestion:
              "Provide all required parameters for basic minting strategy",
            valid: false,
          });
        }
        tokenConfig.mintingConfig = {
          buyToken: args.buyToken,
          maxMint: args.maxMint,
          multiplier: args.multiplier,
        } as BasicMintConfig;
      } else if (args.mintingStrategy === "cascade") {
        if (
          !args.buyToken ||
          !args.multiplier ||
          !args.maxMint ||
          !args.baseMintLimit ||
          !args.incrementBlocks ||
          !args.maxCascadeLimit
        ) {
          return JSON.stringify({
            errors: [
              "Cascade minting strategy requires buyToken, multiplier, maxMint, baseMintLimit, incrementBlocks, and maxCascadeLimit parameters",
            ],
            suggestion:
              "Provide all required parameters for cascade minting strategy",
            valid: false,
          });
        }
        tokenConfig.mintingConfig = {
          baseMintLimit: args.baseMintLimit,
          buyToken: args.buyToken,
          incrementBlocks: args.incrementBlocks,
          maxCascadeLimit: args.maxCascadeLimit,
          maxMint: args.maxMint,
          multiplier: args.multiplier,
        } as CascadeMintConfig;
      } else if (args.mintingStrategy === "double_mint") {
        if (!args.buyTokens || !args.maxMint) {
          return JSON.stringify({
            errors: [
              "Double mint strategy requires buyTokens and maxMint parameters",
            ],
            suggestion:
              "Provide buyTokens configuration and maxMint for double mint strategy",
            valid: false,
          });
        }
        tokenConfig.mintingConfig = {
          buyTokens: args.buyTokens,
          maxMint: args.maxMint,
        } as DoubleMintConfig;
      } else if (args.mintingStrategy === "none") {
        if (args.initialSupply) {
          tokenConfig.initialSupply = args.initialSupply;
        } else {
          tokenConfig.initialSupply = "0";
        }
      }

      const validation = validateTokenConfig(tokenConfig);

      return JSON.stringify({
        configuration: tokenConfig,
        errors: validation.errors,
        suggestions: validation.valid
          ? [
              "Configuration is valid and ready for deployment",
              "Use createConfigurableToken with the same parameters to deploy",
            ]
          : [
              "Fix the validation errors before deployment",
              "Check parameter requirements for your chosen minting strategy",
            ],
        valid: validation.valid,
      });
    } catch (error) {
      return JSON.stringify({
        configuration: {},
        errors: [
          `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        valid: false,
      });
    }
  },
  name: "validateTokenConfiguration",
  parameters: z.object({
    baseMintLimit: z
      .string()
      .optional()
      .describe("Starting mint limit (required for cascade)"),
    burnable: z
      .boolean()
      .optional()
      .describe("Whether tokens can be burned (default: true)"),
    // Flattened strategy-specific parameters
    buyToken: z
      .string()
      .optional()
      .describe("Token address for minting (required for basic/cascade)"),
    buyTokens: z
      .record(
        z.string(),
        z.object({
          enabled: z.boolean(),
          multiplier: z.number().positive(),
        }),
      )
      .optional()
      .describe("Buy token configurations (required for double_mint)"),
    denomination: z
      .number()
      .optional()
      .describe("Token decimals (default: 12)"),
    description: z.string().optional().describe("Token description (optional)"),

    incrementBlocks: z
      .number()
      .positive()
      .optional()
      .describe("Blocks between increases (required for cascade)"),
    initialSupply: z
      .string()
      .optional()
      .describe("Initial supply for 'none' strategy"),
    logo: z.string().optional().describe("Token logo URL (optional)"),
    maxCascadeLimit: z
      .string()
      .optional()
      .describe("Final maximum limit (required for cascade)"),
    maxMint: z
      .string()
      .optional()
      .describe(
        "Maximum mintable tokens (required for basic/cascade/double_mint)",
      ),
    mintingStrategy: z
      .enum(["basic", "cascade", "double_mint", "none"])
      .describe("Minting strategy"),
    multiplier: z
      .number()
      .positive()
      .optional()
      .describe("Conversion rate (required for basic/cascade)"),
    // Same parameters as createConfigurableToken for consistency
    name: z.string().describe("Token name"),
    ticker: z.string().describe("Token ticker"),
    transferable: z
      .boolean()
      .optional()
      .describe("Whether tokens can be transferred (default: true)"),
  }),
});

// Simple tool to create a token (reverted to pre-allocation logic approach)
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Create Simple Token",
  },
  description:
    "Create a simple token with basic functionality - reverted to working approach before allocation logic was added",
  execute: async (args) => {
    try {
      // Create simple token configuration (no complex allocation logic)
      const simpleConfig: SimpleTokenConfig = {
        denomination: args.denomination || 12,
        description: args.description,
        logo: args.logo,
        name: args.name,
        ticker: args.ticker,
        totalSupply: args.totalSupply,
      };

      // Validate configuration
      const validation = validateSimpleTokenConfig(simpleConfig);
      if (!validation.valid) {
        return JSON.stringify({
          error: "Token configuration validation failed",
          success: false,
          validationErrors: validation.errors,
        });
      }

      // Generate simple Lua script (without complex allocation logic)
      const luaScript = generateSimpleTokenLua(simpleConfig);
      const processId = await tokenService.create(keyPair, luaScript);

      // Add to token registry
      const tokenTags = [
        { name: "Kind", value: MEMORY_KINDS.TOKEN_MAPPING },
        {
          name: "Content",
          value: `Token mapping: name: ${args.name}, ticker: ${args.ticker}, processId: ${processId}`,
        },
        { name: "p", value: publicKey },
        { name: "token_name", value: args.name },
        { name: "token_ticker", value: args.ticker },
        { name: "token_processId", value: processId },
        { name: "domain", value: "token-registry" },
      ];
      await event(keyPair, hubId, tokenTags);

      return JSON.stringify({
        luaScriptLength: luaScript.length,
        message: `Simple token "${args.ticker}" created successfully (${args.totalSupply} tokens) and added to registry`,
        processId,
        registryAdded: true,
        success: true,
        tokenInfo: {
          approach: "simple",
          denomination: args.denomination || 12,
          name: args.name,
          owner: publicKey,
          ticker: args.ticker,
          totalSupply: args.totalSupply,
        },
      });
    } catch (error) {
      return JSON.stringify({
        error: `Simple token creation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "createSimpleToken",
  parameters: z.object({
    denomination: z
      .number()
      .optional()
      .describe("Token decimals (default: 12)"),
    description: z.string().optional().describe("Token description (optional)"),
    logo: z.string().optional().describe("Token logo URL (optional)"),
    name: z.string().describe("Token name (e.g. 'Arweave Official')"),
    ticker: z.string().describe("Token ticker (e.g. 'AO')"),
    totalSupply: z
      .string()
      .describe(
        "Total token supply (e.g. '1000000000000000000' for 1 billion with 12 decimals)",
      ),
  }),
});

// Debug tool to generate and show Lua script
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Generate Token Lua Script",
  },
  description:
    "Generate and return the Lua script for a token configuration without deploying (for debugging)",
  execute: async (args) => {
    try {
      const tokenConfig: TokenConfig = {
        denomination: args.denomination || 12,
        initialAllocations: args.initialAllocations,
        initialSupply: args.initialSupply || "0",
        mintingStrategy: args.mintingStrategy as TokenConfig["mintingStrategy"],
        name: args.name,
        ticker: args.ticker,
      };

      const luaScript = generateTokenLua(tokenConfig);

      return JSON.stringify({
        luaScript,
        scriptLength: luaScript.length,
        success: true,
        tokenConfig,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "generateTokenLua",
  parameters: z.object({
    denomination: z.number().optional().describe("Token decimals"),
    initialAllocations: z
      .record(z.string(), z.string())
      .optional()
      .describe("Initial token allocations"),
    initialSupply: z.string().optional().describe("Initial supply"),
    mintingStrategy: z
      .enum(["basic", "cascade", "double_mint", "none"])
      .describe("Minting strategy"),
    name: z.string().describe("Token name"),
    ticker: z.string().describe("Token ticker"),
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
          description:
            "Simple multiplier-based minting with maximum limits and automatic refunds",
          useCase: "Standard token launch with fixed conversion rate",
        },
        cascade: {
          ...exampleConfigs.cascade,
          description:
            "Progressive minting limits that increase over time based on block height",
          useCase:
            "Controlled token distribution with growing supply over time",
        },
        double_mint: {
          ...exampleConfigs.doubleMint,
          description:
            "Accept multiple buy tokens with different conversion rates",
          useCase: "Flexible minting accepting various payment tokens",
        },
        simple: {
          ...exampleConfigs.simple,
          description:
            "Basic token with admin-only minting, no automatic minting strategies",
          useCase: "Simple token for manual distribution or specific use cases",
        },
      };

      if (args.strategy) {
        const selectedExample =
          examples[args.strategy as keyof typeof examples];
        if (selectedExample) {
          return JSON.stringify({
            example: selectedExample,
            instructions: `Customize the parameters and use createConfigurableToken to deploy this ${args.strategy} token.`,
            strategy: args.strategy,
          });
        } else {
          return JSON.stringify({
            availableStrategies: Object.keys(examples),
            error: `Unknown strategy: ${args.strategy}`,
          });
        }
      }

      return JSON.stringify({
        availableStrategies: Object.keys(examples),
        examples,
        instructions:
          "Choose a strategy and customize the configuration parameters for your needs.",
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to get examples: ${error instanceof Error ? error.message : "Unknown error"}`,
        examples: {},
      });
    }
  },
  name: "getTokenExamples",
  parameters: z.object({
    strategy: z
      .enum(["basic", "cascade", "double_mint", "simple"])
      .optional()
      .describe("Specific strategy to get example for (optional)"),
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
      const result = await read(args.processId, [
        { name: "Action", value: "Info" },
      ]);

      if (result) {
        return JSON.stringify({
          processId: args.processId,
          queryTime: new Date().toISOString(),
          success: true,
          tokenInfo: result,
        });
      } else {
        return JSON.stringify({
          error: "Failed to query token information",
          processId: args.processId,
          success: false,
          suggestion:
            "Ensure the process ID is correct and the token is properly deployed",
        });
      }
    } catch (error) {
      return JSON.stringify({
        error: `Query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        processId: args.processId,
        success: false,
      });
    }
  },
  name: "queryTokenInfo",
  parameters: z.object({
    processId: z.string().describe("The AO process ID of the deployed token"),
  }),
});

// Permaweb Documentation Tool
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Permaweb Documentation",
  },
  description: `Query comprehensive Permaweb ecosystem documentation with intelligent domain detection. 
    Automatically searches through Arweave, AO, AR.IO, HyperBEAM, and Permaweb glossary based on your query. 
    Returns relevant documentation sections with high accuracy scoring. Includes automatic backoff 
    mechanism to reduce results if response size approaches context limits.`,
  execute: async (args) => {
    try {
      const { permawebDocs } = await import("./services/PermawebDocs.js");

      // Progressive backoff strategy for context limit management
      const backoffLevels = [
        { label: "standard", maxResults: args.maxResults || 10 },
        { label: "reduced", maxResults: 5 },
        { label: "minimal", maxResults: 3 },
        { label: "single", maxResults: 1 },
      ];

      const maxContextTokens = 8000; // Conservative estimate for context limits
      let backoffLevel = 0;
      let docsResults: PermawebDocsResult[] = [];
      let estimatedTokens = 0;

      // Try each backoff level until we get a manageable response size
      for (const level of backoffLevels) {
        try {
          const domains = args.domains
            ? args.domains.split(",").map((d) => d.trim())
            : undefined;
          docsResults = await permawebDocs.query(
            args.query,
            domains,
            level.maxResults,
          );

          if (docsResults.length === 0) {
            break; // No results to process
          }

          // Estimate token count for the response
          estimatedTokens = permawebDocs.estimateResponseTokens(docsResults);

          // Add some overhead for JSON structure and metadata
          const responseOverhead = 1000;
          const totalEstimatedTokens = estimatedTokens + responseOverhead;

          if (
            totalEstimatedTokens <= maxContextTokens ||
            backoffLevel === backoffLevels.length - 1
          ) {
            break; // Response size is acceptable or this is our last attempt
          }

          backoffLevel++;
        } catch (queryError) {
          // If query fails at this level, try the next backoff level
          if (backoffLevel === backoffLevels.length - 1) {
            throw queryError; // This was our last attempt
          }
          backoffLevel++;
        }
      }

      if (docsResults.length > 0) {
        const permawebResults = docsResults.map((result) => ({
          content: result.content,
          domain: result.domain,
          isFullDocument: false, // These are chunked results
          relevanceScore: result.relevanceScore,
          type: "permaweb_docs",
          url: result.url,
        }));

        const response = {
          query: args.query,
          results: permawebResults,
          success: true,
          totalResults: permawebResults.length,
          ...(backoffLevel > 0 && {
            backoff: {
              estimatedTokens: estimatedTokens,
              level: backoffLevel,
              message: `Results limited to ${backoffLevels[backoffLevel].maxResults} to stay within context limits`,
              strategy: backoffLevels[backoffLevel].label,
            },
          }),
        };

        return JSON.stringify(response);
      }

      return JSON.stringify({
        query: args.query,
        results: [],
        success: true,
        totalResults: 0,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Documentation query failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args.query,
        success: false,
      });
    }
  },
  name: "queryPermawebDocs",
  parameters: z.object({
    domains: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of domains to search (arweave,ao,ario,hyperbeam,permaweb-glossary). If not provided, domains are auto-detected.",
      ),
    maxResults: z
      .number()
      .min(1)
      .max(20)
      .optional()
      .describe(
        "Maximum number of results to return (default: 10). May be automatically reduced to prevent context limits.",
      ),
    query: z
      .string()
      .describe("Your question or search query about the Permaweb ecosystem"),
  }),
});

// Tool to manage Permaweb documentation cache
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: false,
    title: "Manage Permaweb Docs Cache",
  },
  description: `Manage the Permaweb documentation cache. Check cache status, preload documentation, 
    or clear cached content for specific domains. Useful for ensuring fresh documentation or optimizing performance.`,
  execute: async (args) => {
    try {
      const { permawebDocs } = await import("./services/PermawebDocs.js");

      if (args.action === "status") {
        const status = permawebDocs.getCacheStatus();
        return JSON.stringify({
          action: "status",
          cacheStatus: status,
          success: true,
        });
      }

      if (args.action === "preload") {
        const domains = args.domains
          ? (args.domains.split(",").map((d) => d.trim()) as PermawebDomain[])
          : undefined;
        await permawebDocs.preload(domains);
        return JSON.stringify({
          action: "preload",
          domains: domains || permawebDocs.getAvailableDomains(),
          message: "Documentation preloaded successfully",
          success: true,
        });
      }

      if (args.action === "clear") {
        if (args.domains) {
          const domains = args.domains
            .split(",")
            .map((d) => d.trim()) as PermawebDomain[];
          domains.forEach((domain) => permawebDocs.clearCache(domain));
          return JSON.stringify({
            action: "clear",
            domains: domains,
            message: "Cache cleared for specified domains",
            success: true,
          });
        } else {
          permawebDocs.clearCache();
          return JSON.stringify({
            action: "clear",
            message: "All cache cleared",
            success: true,
          });
        }
      }

      return JSON.stringify({
        error: "Invalid action. Use: status, preload, or clear",
        success: false,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Cache management failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  },
  name: "managePermawebDocsCache",
  parameters: z.object({
    action: z
      .enum(["status", "preload", "clear"])
      .describe(
        "Action to perform: status (check cache), preload (load docs), clear (remove cache)",
      ),
    domains: z
      .string()
      .optional()
      .describe(
        "Comma-separated list of domains for preload/clear actions (arweave,ao,ario,hyperbeam,permaweb-glossary)",
      ),
  }),
});

// Arweave GraphQL Query Tools

// Tool to query Arweave transactions with comprehensive filtering
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Arweave Transactions",
  },
  description: `Query Arweave transactions using GraphQL with comprehensive filtering options. 
    Supports filtering by owners, recipients, tags, blocks, and more. Uses Goldsky primary endpoint 
    with arweave.net fallback. Includes pagination support for large result sets.
    
    DISPLAY FORMAT: When presenting results, use this consistent format:
    
    For individual transactions:
    Transaction: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    
    For transaction lists:
    Found X transactions:
    1. abc123...def789 | 2024-01-01 12:00 UTC | 1.2 MB | App: PublicSquare | Action: Transfer
    2. def456...ghi012 | 2024-01-01 11:30 UTC | 0.8 MB | App: ArDrive | Action: Upload
    
    REQUIREMENTS:
    - Truncate transaction IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Show data size in human-readable format (MB, KB)
    - Use clean markdown formatting for clarity`,
  execute: async (args) => {
    try {
      const query: TransactionQuery = {
        first: args.first || 10,
        sort: (args.sort as SortOrder) || "HEIGHT_DESC",
      };

      if (args.ids) {
        query.ids = args.ids;
      }

      if (args.owners) {
        query.owners = args.owners;
      }

      if (args.recipients) {
        query.recipients = args.recipients;
      }

      if (args.tags) {
        query.tags = args.tags.map((tag) => ({
          name: tag.name,
          op: (tag.op as TagOperator) || "EQ",
          values: tag.values,
        }));
      }

      if (args.blockHeight) {
        query.block = {
          max: args.blockHeight.max,
          min: args.blockHeight.min,
        };
      }

      if (args.ingestedAt) {
        query.ingested_at = {
          max: args.ingestedAt.max,
          min: args.ingestedAt.min,
        };
      }

      if (args.after) {
        query.after = args.after;
      }

      const result = await arweaveGraphQLService.queryTransactions(query);

      return JSON.stringify({
        query: args,
        result: {
          count: result.transactions.length,
          pageInfo: result.pageInfo,
          transactions: result.transactions,
        },
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to query transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  },
  name: "queryArweaveTransactions",
  parameters: z.object({
    after: z.string().optional().describe("Cursor for pagination"),
    blockHeight: z
      .object({
        max: z.number().optional().describe("Maximum block height"),
        min: z.number().optional().describe("Minimum block height"),
      })
      .optional()
      .describe("Block height filter"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    ids: z
      .array(z.string())
      .optional()
      .describe("Array of transaction IDs to query"),
    ingestedAt: z
      .object({
        max: z.number().optional().describe("Maximum ingested timestamp"),
        min: z.number().optional().describe("Minimum ingested timestamp"),
      })
      .optional()
      .describe("Ingested at filter"),
    owners: z
      .array(z.string())
      .optional()
      .describe("Array of owner wallet addresses"),
    recipients: z
      .array(z.string())
      .optional()
      .describe("Array of recipient wallet addresses"),
    sort: z
      .enum([
        "HEIGHT_ASC",
        "HEIGHT_DESC",
        "INGESTED_AT_ASC",
        "INGESTED_AT_DESC",
      ])
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
    tags: z
      .array(
        z.object({
          name: z.string().describe("Tag name"),
          op: z
            .enum(["EQ", "NEQ"])
            .optional()
            .describe("Tag operator (default: EQ)"),
          values: z.array(z.string()).describe("Array of tag values to match"),
        }),
      )
      .optional()
      .describe("Array of tag filters"),
  }),
});

// Tool to query AO process messages
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query AO Process Messages",
  },
  description: `Query AO (Autonomous Objects) process messages and interactions. 
    Filter by process IDs, message references, actions, and other AO-specific parameters. 
    Useful for tracking process communications and state changes.
    
    DISPLAY FORMAT: When presenting AO process messages, use this consistent format:
    
    For individual messages:
    Message: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    From: ProcessA...123 → To: ProcessB...456
    Size: 1.2 MB (application/json)
    App: AO-Process (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Reference: msg_ref_123
    
    For message lists:
    Found X AO messages:
    1. abc123...def789 | 2024-01-01 12:00 UTC | ProcessA...123 → ProcessB...456 | Action: Transfer
    2. def456...ghi012 | 2024-01-01 11:30 UTC | ProcessA...123 → ProcessC...789 | Action: Mint
    
    REQUIREMENTS:
    - Truncate transaction and process IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Show process communication flow (From → To)
    - Include message references when available`,
  execute: async (args) => {
    try {
      const query: AOProcessQuery = {
        first: args.first || 10,
        sort: (args.sort as SortOrder) || "INGESTED_AT_DESC",
      };

      if (args.fromProcessId) {
        query.fromProcessId = args.fromProcessId;
      }

      if (args.toProcessId) {
        query.toProcessId = args.toProcessId;
      }

      if (args.msgRefs) {
        query.msgRefs = args.msgRefs;
      }

      if (args.action) {
        query.action = args.action;
      }

      if (args.after) {
        query.after = args.after;
      }

      const result = await arweaveGraphQLService.queryAOProcessMessages(query);

      return JSON.stringify({
        query: args,
        result: {
          count: result.transactions.length,
          pageInfo: result.pageInfo,
          transactions: result.transactions,
        },
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to query AO process messages: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  },
  name: "queryAOProcessMessages",
  parameters: z.object({
    action: z
      .string()
      .optional()
      .describe("Filter by action type (e.g., 'Transfer', 'Mint')"),
    after: z.string().optional().describe("Cursor for pagination"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    fromProcessId: z
      .string()
      .optional()
      .describe("Filter by sender process ID"),
    msgRefs: z
      .array(z.string())
      .optional()
      .describe("Array of message reference IDs"),
    sort: z
      .enum([
        "HEIGHT_ASC",
        "HEIGHT_DESC",
        "INGESTED_AT_ASC",
        "INGESTED_AT_DESC",
      ])
      .optional()
      .describe("Sort order (default: INGESTED_AT_DESC)"),
    toProcessId: z
      .string()
      .optional()
      .describe("Filter by recipient process ID"),
  }),
});

// Tool to get specific transaction details
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Transaction Details",
  },
  description: `Get detailed information for a specific Arweave transaction by ID. 
    Returns comprehensive transaction data including tags, block information, 
    data size, and bundle information if applicable.
    
    DISPLAY FORMAT: When presenting transaction details, use this comprehensive format:
    
    Transaction Details: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    Tags: Show important tags like App-Name, Action, Content-Type
    Parent: parent123...def789 (if applicable)
    
    REQUIREMENTS:
    - Truncate transaction IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Display all relevant tags in a readable format
    - Show parent transaction if available
    - Include comprehensive transaction metadata`,
  execute: async (args) => {
    try {
      const transaction = await arweaveGraphQLService.getTransactionData(
        args.transactionId,
      );

      if (!transaction) {
        return JSON.stringify({
          error: `Transaction not found: ${args.transactionId}`,
          success: false,
          transactionId: args.transactionId,
        });
      }

      return JSON.stringify({
        success: true,
        transaction: transaction,
        transactionId: args.transactionId,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to get transaction details: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
        transactionId: args.transactionId,
      });
    }
  },
  name: "getTransactionDetails",
  parameters: z.object({
    transactionId: z.string().describe("The Arweave transaction ID to query"),
  }),
});

// Tool to query block information
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Block Information",
  },
  description: `Query Arweave block information with filtering by height ranges or specific block IDs. 
    Includes pagination support for querying multiple blocks efficiently.
    
    DISPLAY FORMAT: When presenting block information, use this consistent format:
    
    For individual blocks:
    Block: block123...def789
    Time: 2024-01-01 12:00:00 UTC
    Height: #1234567
    Previous: prev123...abc456
    
    For block lists:
    Found X blocks:
    1. block123...def789 | 2024-01-01 12:00 UTC | Height: #1234567
    2. block456...ghi012 | 2024-01-01 11:30 UTC | Height: #1234566
    
    REQUIREMENTS:
    - Truncate block IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - Always show block height prominently
    - Show previous block relationship when available
    - Use clean markdown formatting for clarity`,
  execute: async (args) => {
    try {
      if (args.blockId) {
        // Single block query
        const block = await arweaveGraphQLService.getBlockData(args.blockId);

        if (!block) {
          return JSON.stringify({
            blockId: args.blockId,
            error: `Block not found: ${args.blockId}`,
            success: false,
          });
        }

        return JSON.stringify({
          block: block,
          blockId: args.blockId,
          success: true,
        });
      } else {
        // Multiple blocks query
        const query: BlockQuery = {
          first: args.first || 10,
          sort: (args.sort as SortOrder) || "HEIGHT_DESC",
        };

        if (args.ids) {
          query.ids = args.ids;
        }

        if (args.heightRange) {
          query.height = {
            max: args.heightRange.max,
            min: args.heightRange.min,
          };
        }

        if (args.after) {
          query.after = args.after;
        }

        const result = await arweaveGraphQLService.queryBlocks(query);

        return JSON.stringify({
          query: args,
          result: {
            blocks: result.blocks,
            count: result.blocks.length,
            pageInfo: result.pageInfo,
          },
          success: true,
        });
      }
    } catch (error) {
      return JSON.stringify({
        error: `Failed to query block information: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  },
  name: "queryBlockInfo",
  parameters: z.object({
    after: z.string().optional().describe("Cursor for pagination"),
    blockId: z
      .string()
      .optional()
      .describe("Specific block ID to query (for single block)"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    heightRange: z
      .object({
        max: z.number().optional().describe("Maximum block height"),
        min: z.number().optional().describe("Minimum block height"),
      })
      .optional()
      .describe("Block height range filter"),
    ids: z
      .array(z.string())
      .optional()
      .describe("Array of block IDs to query (for multiple blocks)"),
    sort: z
      .enum(["HEIGHT_ASC", "HEIGHT_DESC"])
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
  }),
});

// Tool to execute custom GraphQL queries
server.addTool({
  annotations: {
    openWorldHint: false,
    readOnlyHint: true,
    title: "Execute Custom GraphQL Query",
  },
  description: `Execute a custom GraphQL query against Arweave's GraphQL API. 
    Supports full GraphQL syntax with variables. Use this for advanced queries 
    not covered by the specialized tools. Includes automatic endpoint fallback.

    DISPLAY FORMAT: When presenting GraphQL results, use consistent formatting:
    
    For transactions in results:
    Transaction: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    
    For blocks in results:
    Block: #1234567 (abc123...def789)
    Time: 2024-01-01 12:00:00 UTC
    Previous: #1234566
    
    REQUIREMENTS:
    - Truncate long IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Present data in structured, readable format
    - Group related information logically`,
  execute: async (args) => {
    try {
      const variables = args.variables ? JSON.parse(args.variables) : undefined;
      const result = await arweaveGraphQLService.executeCustomQuery(
        args.query,
        variables,
      );

      if (result.errors && result.errors.length > 0) {
        return JSON.stringify({
          data: result.data,
          errors: result.errors,
          query: args.query,
          success: false,
          variables: variables,
        });
      }

      return JSON.stringify({
        data: result.data,
        query: args.query,
        success: true,
        variables: variables,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to execute GraphQL query: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args.query,
        success: false,
      });
    }
  },
  name: "executeGraphQLQuery",
  parameters: z.object({
    query: z.string().describe("The GraphQL query string to execute"),
    variables: z
      .string()
      .optional()
      .describe("JSON string of GraphQL variables (optional)"),
  }),
});

// Tool to deploy a directory to the Permaweb with ArNS support
server.addTool({
  annotations: {
    openWorldHint: true,
    readOnlyHint: false,
    title: "Deploy Directory to Permaweb",
  },
  description: `Deploy a directory to the Permaweb using permaweb-deploy CLI with ArNS and undername support.
    This tool handles wallet management, directory validation, and deployment execution.
    
    Wallet options:
    - Use current wallet: Generated from SEED_PHRASE environment variable
    - Use custom wallet: Provide path to Arweave wallet JSON file
    
    The tool automatically handles base64 encoding of wallet JSON and sets DEPLOY_KEY environment variable.
    
    Prerequisites:
    - permaweb-deploy CLI tool must be installed
    - Wallet must have Turbo credits for deployment
    - Wallet must have ownership/controller privileges for the ArNS name`,
  execute: async (args) => {
    try {
      const permawebDeployService = new PermawebDeployService();
      const result = await permawebDeployService.deployDirectory({
        arnsName: args.arnsName,
        directoryPath: args.directoryPath,
        network: args.network,
        undername: args.undername,
        useCurrentWallet: args.useCurrentWallet ?? true,
        walletPath: args.walletPath,
      });

      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: {
          code: "DEPLOYMENT_ERROR",
          details: error,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
        success: false,
      });
    }
  },
  name: "deployPermawebDirectory",
  parameters: z.object({
    arnsName: z.string().describe("Top-level ArNS name for deployment"),
    directoryPath: z.string().describe("Path to the build directory to deploy"),
    network: z
      .enum(["mainnet", "testnet"])
      .optional()
      .default("mainnet")
      .describe("Network to deploy to (default: mainnet)"),
    undername: z
      .string()
      .optional()
      .describe("Optional undername/subdomain for deployment"),
    useCurrentWallet: z
      .boolean()
      .optional()
      .default(true)
      .describe("Use wallet generated from SEED_PHRASE (default: true)"),
    walletPath: z
      .string()
      .optional()
      .describe(
        "Path to custom Arweave wallet JSON file (if not using current wallet)",
      ),
  }),
});

// Tool to check permaweb deployment prerequisites
server.addTool({
  annotations: {
    openWorldHint: true,
    readOnlyHint: true,
    title: "Check Permaweb Deploy Prerequisites",
  },
  description: `Check all prerequisites for permaweb deployment without attempting to deploy.
    This tool validates:
    - permaweb-deploy CLI installation
    - Directory existence and content
    - Wallet configuration and validation
    
    Returns detailed status of each check with helpful solutions for any issues found.
    Use this tool to verify your setup before attempting deployment.`,
  execute: async (args) => {
    try {
      const permawebDeployService = new PermawebDeployService();
      const result = await permawebDeployService.checkPrerequisites({
        arnsName: args.arnsName,
        directoryPath: args.directoryPath,
        network: args.network,
        undername: args.undername,
        useCurrentWallet: args.useCurrentWallet ?? true,
        walletPath: args.walletPath,
      });

      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        allPassed: false,
        checks: [],
        error: {
          code: "PREREQUISITE_CHECK_ERROR",
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          solutions: ["Check your parameters and try again"],
        },
      });
    }
  },
  name: "checkPermawebDeployPrerequisites",
  parameters: z.object({
    arnsName: z.string().describe("ArNS name (for validation context)"),
    directoryPath: z.string().describe("Path to the build directory to check"),
    network: z
      .enum(["mainnet", "testnet"])
      .optional()
      .default("mainnet")
      .describe("Network context (default: mainnet)"),
    undername: z.string().optional().describe("Optional undername/subdomain"),
    useCurrentWallet: z
      .boolean()
      .optional()
      .default(true)
      .describe("Use wallet generated from SEED_PHRASE (default: true)"),
    walletPath: z
      .string()
      .optional()
      .describe(
        "Path to custom Arweave wallet JSON file (if not using current wallet)",
      ),
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
