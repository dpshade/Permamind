import { JWKInterface } from "arweave/node/lib/wallet.js";

import {
  AIMemory,
  MemoryAnalytics,
  MemoryContext,
  MemoryLink,
  MemoryType,
  ReasoningTrace,
  RelationshipType,
  SearchFilters,
} from "../models/AIMemory.js";
import { Memory } from "../models/Memory.js";
import { Tag } from "../models/Tag.js";
import { event, fetchEvents } from "../relay.js";

// Constants for memory kinds
const MEMORY_KINDS = {
  AI_MEMORY: "10",
  MEMORY_CONTEXT: "40",
  MEMORY_RELATIONSHIP: "11",
  REASONING_CHAIN: "23",
} as const;

// Validation utilities
const isValidImportance = (importance: number): boolean =>
  importance >= 0 && importance <= 1;

const isValidStrength = (strength: number): boolean =>
  strength >= 0 && strength <= 1;

const isNonEmptyString = (value: string): boolean =>
  typeof value === "string" && value.trim().length > 0;

export interface AIMemoryService {
  // Enhanced memory operations
  addEnhanced: (
    signer: JWKInterface,
    hubId: string,
    memory: Partial<AIMemory>,
  ) => Promise<string>;
  // Batch operations
  addMemoriesBatch: (
    signer: JWKInterface,
    hubId: string,
    memories: Partial<AIMemory>[],
    p: string,
  ) => Promise<string[]>;
  // Reasoning chain operations
  addReasoningChain: (
    signer: JWKInterface,
    hubId: string,
    reasoning: ReasoningTrace,
    p: string,
  ) => Promise<string>;

  createAIMemoryTags: (memory: Partial<AIMemory>) => Tag[];
  // Context management
  createMemoryContext: (
    signer: JWKInterface,
    hubId: string,
    contextName: string,
    description: string,
    p: string,
  ) => Promise<string>;

  detectCircularReferences: (hubId: string) => Promise<string[]>;
  // Utility functions
  eventToAIMemory: (event: Record<string, unknown>) => AIMemory;

  findShortestPath: (
    hubId: string,
    fromId: string,
    toId: string,
  ) => Promise<string[]>;

  getContextMemories: (hubId: string, contextId: string) => Promise<AIMemory[]>;

  // Analytics
  getMemoryAnalytics: (hubId: string, p?: string) => Promise<MemoryAnalytics>;
  // Relationship analysis methods
  getMemoryRelationships: (
    hubId: string,
    memoryId?: string,
  ) => Promise<MemoryLink[]>;

  getReasoningChain: (
    hubId: string,
    chainId: string,
  ) => Promise<null | ReasoningTrace>;
  getRelationshipAnalytics: (hubId: string) => Promise<{
    averageStrength: number;
    strongestConnections: Array<{ from: string; strength: number; to: string }>;
    topRelationshipTypes: Array<{ count: number; type: string }>;
    totalLinks: number;
  }>;
  linkMemories: (
    signer: JWKInterface,
    hubId: string,
    sourceId: string,
    targetId: string,
    relationship: MemoryLink,
  ) => Promise<string>;
  searchAdvanced: (
    hubId: string,
    query: string,
    filters?: SearchFilters,
  ) => Promise<AIMemory[]>;
}

const aiService = (): AIMemoryService => {
  return {
    addEnhanced: async (
      signer: JWKInterface,
      hubId: string,
      memory: Partial<AIMemory>,
    ): Promise<string> => {
      try {
        // Validate required fields
        if (!memory.content || !isNonEmptyString(memory.content)) {
          throw new Error("Memory content is required");
        }
        if (!memory.p || !isNonEmptyString(memory.p)) {
          throw new Error("Memory p parameter is required");
        }
        if (
          memory.importance !== undefined &&
          !isValidImportance(memory.importance)
        ) {
          throw new Error("Importance must be between 0 and 1");
        }

        const tags = createAIMemoryTags(memory);
        await event(signer, hubId, tags);
        return "Enhanced memory added successfully";
      } catch (e) {
        throw new Error(`Failed to add enhanced memory: ${e}`);
      }
    },

    addMemoriesBatch: async (
      signer: JWKInterface,
      hubId: string,
      memories: Partial<AIMemory>[],
      p: string,
    ): Promise<string[]> => {
      try {
        const results: string[] = [];

        for (const memory of memories) {
          memory.p = p; // Ensure p is set
          const result = await aiService().addEnhanced(signer, hubId, memory);
          results.push(result);
        }

        return results;
      } catch (e) {
        throw new Error(`Failed to add memories batch: ${e}`);
      }
    },

    addReasoningChain: async (
      signer: JWKInterface,
      hubId: string,
      reasoning: ReasoningTrace,
      p: string,
    ): Promise<string> => {
      try {
        // Validate inputs
        if (!isNonEmptyString(reasoning.chainId)) {
          throw new Error("Chain ID is required");
        }
        if (!reasoning.steps || reasoning.steps.length === 0) {
          throw new Error("At least one reasoning step is required");
        }
        if (!isNonEmptyString(p)) {
          throw new Error("P parameter is required");
        }

        const tags: Tag[] = [
          { name: "kind", value: MEMORY_KINDS.REASONING_CHAIN },
          { name: "chainId", value: reasoning.chainId },
          { name: "steps", value: JSON.stringify(reasoning.steps) },
          { name: "outcome", value: reasoning.outcome },
          { name: "p", value: p },
        ];

        await event(signer, hubId, tags);
        return "Reasoning chain added successfully";
      } catch (e) {
        throw new Error(`Failed to add reasoning chain: ${e}`);
      }
    },

    createAIMemoryTags: createAIMemoryTags,

    createMemoryContext: async (
      signer: JWKInterface,
      hubId: string,
      contextName: string,
      description: string,
      p: string,
    ): Promise<string> => {
      try {
        // Validate inputs
        if (!isNonEmptyString(contextName)) {
          throw new Error("Context name is required");
        }
        if (!isNonEmptyString(p)) {
          throw new Error("P parameter is required");
        }

        const tags: Tag[] = [
          { name: "kind", value: MEMORY_KINDS.MEMORY_CONTEXT },
          { name: "contextName", value: contextName },
          { name: "description", value: description },
          { name: "p", value: p },
        ];

        await event(signer, hubId, tags);
        return "Memory context created successfully";
      } catch (e) {
        throw new Error(`Failed to create memory context: ${e}`);
      }
    },

    detectCircularReferences: async (hubId: string): Promise<string[]> => {
      try {
        const filter = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
          limit: 1000,
          tags: { ai_type: ["link"] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        const links = new Map<string, Set<string>>();
        const visited = new Set<string>();
        const cycles: string[] = [];

        // Build adjacency list from memory links
        events.forEach((event: any) => {
          const fromId = event.from_memory_id;
          const toId = event.to_memory_id;
          if (fromId && toId) {
            if (!links.has(fromId)) links.set(fromId, new Set());
            links.get(fromId)!.add(toId);
          }
        });

        // DFS to detect cycles
        const dfs = (nodeId: string, path: Set<string>): void => {
          if (path.has(nodeId)) {
            cycles.push(Array.from(path).join(" -> ") + " -> " + nodeId);
            return;
          }
          if (visited.has(nodeId)) return;

          visited.add(nodeId);
          path.add(nodeId);

          const neighbors = links.get(nodeId) || new Set();
          neighbors.forEach((neighbor) => dfs(neighbor, path));

          path.delete(nodeId);
        };

        links.keys().forEach((nodeId) => {
          if (!visited.has(nodeId)) {
            dfs(nodeId, new Set());
          }
        });

        return cycles;
      } catch (error) {
        console.error("Error detecting circular references:", error);
        return [];
      }
    },

    eventToAIMemory: eventToAIMemory,

    findShortestPath: async (
      hubId: string,
      fromId: string,
      toId: string,
    ): Promise<string[]> => {
      try {
        const filter = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
          limit: 1000,
          tags: { ai_type: ["link"] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        const graph = new Map<string, string[]>();

        // Build adjacency list
        events.forEach((event: any) => {
          const from = event.from_memory_id;
          const to = event.to_memory_id;
          if (from && to) {
            if (!graph.has(from)) graph.set(from, []);
            graph.get(from)!.push(to);
          }
        });

        // BFS to find shortest path
        const queue: Array<{ id: string; path: string[] }> = [
          { id: fromId, path: [fromId] },
        ];
        const visited = new Set<string>();

        while (queue.length > 0) {
          const { id, path } = queue.shift()!;

          if (id === toId) {
            return path;
          }

          if (visited.has(id)) continue;
          visited.add(id);

          const neighbors = graph.get(id) || [];
          neighbors.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              queue.push({ id: neighbor, path: [...path, neighbor] });
            }
          });
        }

        return []; // No path found
      } catch (error) {
        console.error("Error finding shortest path:", error);
        return [];
      }
    },

    getContextMemories: async (
      hubId: string,
      contextId: string,
    ): Promise<AIMemory[]> => {
      try {
        const filter = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
          tags: { ai_context_id: [contextId] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        return events
          .filter(
            (event): event is Record<string, unknown> =>
              typeof event === "object" && event !== null && "Content" in event,
          )
          .map((event) => eventToAIMemory(event));
      } catch {
        return [];
      }
    },

    getMemoryAnalytics: async (
      hubId: string,
      p?: string,
    ): Promise<MemoryAnalytics> => {
      try {
        const filter: Record<string, unknown> = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
        };

        if (p) {
          filter.tags = { p: [p] };
        }

        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);
        const aiMemories = events
          .filter(
            (event): event is Record<string, unknown> =>
              typeof event === "object" && event !== null && "Content" in event,
          )
          .map((event) => eventToAIMemory(event));

        return generateAnalytics(aiMemories);
      } catch {
        // Return default analytics on error
        return {
          accessPatterns: {
            mostAccessed: [],
            recentlyAccessed: [],
            unusedMemories: [],
          },
          importanceDistribution: {
            high: 0,
            low: 0,
            medium: 0,
          },
          memoryTypeDistribution: {
            conversation: 0,
            enhancement: 0,
            knowledge: 0,
            performance: 0,
            procedure: 0,
            reasoning: 0,
          },
          totalMemories: 0,
        };
      }
    },
    getMemoryRelationships: async (
      hubId: string,
      memoryId?: string,
    ): Promise<MemoryLink[]> => {
      try {
        const filter: any = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
          limit: 500,
          tags: { ai_type: ["link"] },
        };

        if (memoryId) {
          filter.tags.from_memory_id = [memoryId];
        }

        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        return events.map((event: any) => ({
          strength: parseFloat(event.link_strength || "0.5"),
          targetId: event.to_memory_id || "",
          type: (event.link_type || "references") as RelationshipType,
        }));
      } catch (error) {
        console.error("Error getting memory relationships:", error);
        return [];
      }
    },

    getReasoningChain: async (
      hubId: string,
      chainId: string,
    ): Promise<null | ReasoningTrace> => {
      try {
        const filter = {
          kinds: [MEMORY_KINDS.REASONING_CHAIN],
          tags: { chainId: [chainId] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        if (events.length === 0) return null;

        const event = events[0] as Record<string, unknown>;
        return {
          chainId: event.chainId as string,
          outcome: (event.outcome as string) || "",
          steps: JSON.parse((event.steps as string) || "[]"),
        };
      } catch {
        return null;
      }
    },

    getRelationshipAnalytics: async (
      hubId: string,
    ): Promise<{
      averageStrength: number;
      strongestConnections: Array<{
        from: string;
        strength: number;
        to: string;
      }>;
      topRelationshipTypes: Array<{ count: number; type: string }>;
      totalLinks: number;
    }> => {
      try {
        const links = await aiMemoryService.getMemoryRelationships(hubId);

        const totalLinks = links.length;
        const averageStrength =
          totalLinks > 0
            ? links.reduce((sum, link) => sum + link.strength, 0) / totalLinks
            : 0;

        // Count relationship types
        const typeCount = new Map<string, number>();
        links.forEach((link) => {
          typeCount.set(link.type, (typeCount.get(link.type) || 0) + 1);
        });

        const topRelationshipTypes = Array.from(typeCount.entries())
          .map(([type, count]) => ({ count, type }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Get events for connection analysis
        const eventsFilter = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
          limit: 500,
          tags: { ai_type: ["link"] },
        };
        const _eventsFilters = JSON.stringify([eventsFilter]);
        const linkEvents = await fetchEvents(hubId, _eventsFilters);

        const strongestConnections = linkEvents
          .sort(
            (a: any, b: any) =>
              parseFloat(b.link_strength || "0") -
              parseFloat(a.link_strength || "0"),
          )
          .slice(0, 10)
          .map((event: any) => ({
            from: event.from_memory_id || "",
            strength: parseFloat(event.link_strength || "0"),
            to: event.to_memory_id || "",
          }));

        return {
          averageStrength,
          strongestConnections,
          topRelationshipTypes,
          totalLinks,
        };
      } catch (error) {
        console.error("Error getting relationship analytics:", error);
        return {
          averageStrength: 0,
          strongestConnections: [],
          topRelationshipTypes: [],
          totalLinks: 0,
        };
      }
    },

    linkMemories: async (
      signer: JWKInterface,
      hubId: string,
      sourceId: string,
      targetId: string,
      relationship: MemoryLink,
    ): Promise<string> => {
      try {
        // Validate inputs
        if (!isNonEmptyString(sourceId)) {
          throw new Error("Source ID is required");
        }
        if (!isNonEmptyString(targetId)) {
          throw new Error("Target ID is required");
        }
        if (sourceId === targetId) {
          throw new Error("Self-referential relationships are not allowed");
        }
        if (!isValidStrength(relationship.strength)) {
          throw new Error("Relationship strength must be between 0 and 1");
        }

        const tags: Tag[] = [
          { name: "kind", value: MEMORY_KINDS.MEMORY_RELATIONSHIP },
          { name: "sourceId", value: sourceId },
          { name: "targetId", value: targetId },
          { name: "relationshipType", value: relationship.type },
          { name: "strength", value: relationship.strength.toString() },
        ];

        await event(signer, hubId, tags);
        return "Memory link created successfully";
      } catch (e) {
        throw new Error(`Failed to link memories: ${e}`);
      }
    },

    searchAdvanced: async (
      hubId: string,
      query: string,
      filters?: SearchFilters,
    ): Promise<AIMemory[]> => {
      try {
        const filter: Record<string, unknown> = {
          kinds: [MEMORY_KINDS.AI_MEMORY],
        };

        if (query) {
          filter.search = query;
        }

        // Add filter conditions based on AI-specific tags
        if (filters?.memoryType) {
          filter.tags = filter.tags || {};
          (filter.tags as Record<string, unknown>).ai_type = [
            filters.memoryType,
          ];
        }

        if (filters?.importanceThreshold) {
          // Note: This would require hub-side filtering support
          filter.tags = filter.tags || {};
          (filter.tags as Record<string, unknown>).ai_importance_min = [
            filters.importanceThreshold.toString(),
          ];
        }

        if (filters?.sessionId) {
          filter.tags = filter.tags || {};
          (filter.tags as Record<string, unknown>).ai_session = [
            filters.sessionId,
          ];
        }

        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        const aiMemories = events
          .filter(
            (event): event is Record<string, unknown> =>
              typeof event === "object" && event !== null && "Content" in event,
          )
          .map((event) => eventToAIMemory(event))
          .filter((memory) => matchesFilters(memory, filters));

        return rankMemoriesByRelevance(aiMemories);
      } catch (error) {
        throw new Error(`Failed to search memories: ${error}`);
      }
    },
  };
};

// Helper functions
function createAIMemoryTags(memory: Partial<AIMemory>): Tag[] {
  const tags: Tag[] = [
    { name: "kind", value: MEMORY_KINDS.AI_MEMORY },
    { name: "Content", value: memory.content || "" },
    { name: "p", value: memory.p || "" },
    { name: "role", value: memory.role || "user" },
  ];

  // Add AI-specific tags
  if (memory.importance !== undefined) {
    tags.push({ name: "ai_importance", value: memory.importance.toString() });
  }

  if (memory.memoryType) {
    tags.push({ name: "ai_type", value: memory.memoryType });
  }

  if (memory.context) {
    tags.push({ name: "ai_context", value: JSON.stringify(memory.context) });

    if (memory.context.sessionId) {
      tags.push({ name: "ai_session", value: memory.context.sessionId });
    }

    if (memory.context.topic) {
      tags.push({ name: "ai_topic", value: memory.context.topic });
    }

    if (memory.context.domain) {
      tags.push({ name: "ai_domain", value: memory.context.domain });
    }
  }

  if (memory.metadata?.tags) {
    memory.metadata.tags.forEach((tag) => {
      tags.push({ name: "ai_tag", value: tag });
    });
  }

  return tags;
}

function eventToAIMemory(event: Record<string, unknown>): AIMemory {
  const baseMemory: Memory = {
    content: event.Content as string,
    id: event.Id as string,
    p: event.p as string,
    role: (event.r as string) || (event.role as string) || "user",
    timestamp: event.Timestamp as string,
  };

  // Parse AI-specific fields with defaults
  const importance = parseFloat((event.ai_importance as string) || "0.5");
  const memoryType: MemoryType =
    (event.ai_type as MemoryType) || "conversation";
  const context: MemoryContext = event.ai_context
    ? JSON.parse(event.ai_context as string)
    : {};

  // Add domain from event tags if available
  if (event.ai_domain) {
    context.domain = event.ai_domain as string;
  }

  const aiMemory: AIMemory = {
    ...baseMemory,
    context,
    importance,
    memoryType,
    metadata: {
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      tags: event.ai_tag
        ? Array.isArray(event.ai_tag)
          ? (event.ai_tag as string[])
          : [event.ai_tag as string]
        : [],
    },
  };

  return aiMemory;
}

function generateAnalytics(memories: AIMemory[]): MemoryAnalytics {
  const memoryTypeDistribution = memories.reduce(
    (acc, memory) => {
      acc[memory.memoryType] = (acc[memory.memoryType] || 0) + 1;
      return acc;
    },
    {} as Record<MemoryType, number>,
  );

  // Ensure all types are represented
  const typeDistribution: Record<MemoryType, number> = {
    conversation: memoryTypeDistribution.conversation || 0,
    enhancement: memoryTypeDistribution.enhancement || 0,
    knowledge: memoryTypeDistribution.knowledge || 0,
    performance: memoryTypeDistribution.performance || 0,
    procedure: memoryTypeDistribution.procedure || 0,
    reasoning: memoryTypeDistribution.reasoning || 0,
  };

  const importanceDistribution = memories.reduce(
    (acc, memory) => {
      if (memory.importance >= 0.7) acc.high++;
      else if (memory.importance >= 0.3) acc.medium++;
      else acc.low++;
      return acc;
    },
    { high: 0, low: 0, medium: 0 },
  );

  // Sort by access count and recency for access patterns
  const sortedByAccess = [...memories].sort(
    (a, b) => b.metadata.accessCount - a.metadata.accessCount,
  );
  const sortedByRecency = [...memories].sort(
    (a, b) =>
      new Date(b.metadata.lastAccessed).getTime() -
      new Date(a.metadata.lastAccessed).getTime(),
  );

  return {
    accessPatterns: {
      mostAccessed: sortedByAccess.slice(0, 10).map((m) => m.id),
      recentlyAccessed: sortedByRecency.slice(0, 10).map((m) => m.id),
      unusedMemories: memories
        .filter((m) => m.metadata.accessCount === 0)
        .map((m) => m.id),
    },
    importanceDistribution,
    memoryTypeDistribution: typeDistribution,
    totalMemories: memories.length,
  };
}

function matchesFilters(memory: AIMemory, filters?: SearchFilters): boolean {
  if (!filters) return true;

  if (filters.memoryType && memory.memoryType !== filters.memoryType) {
    return false;
  }

  if (
    filters.importanceThreshold &&
    memory.importance < filters.importanceThreshold
  ) {
    return false;
  }

  if (filters.domain && memory.context.domain !== filters.domain) {
    return false;
  }

  if (filters.sessionId && memory.context.sessionId !== filters.sessionId) {
    return false;
  }

  if (filters.timeRange) {
    const memoryTime = new Date(memory.timestamp);
    const start = new Date(filters.timeRange.start);
    const end = new Date(filters.timeRange.end);

    if (memoryTime < start || memoryTime > end) {
      return false;
    }
  }

  return true;
}

function rankMemoriesByRelevance(memories: AIMemory[]): AIMemory[] {
  return memories.sort((a, b) => {
    // Primary sort: importance score
    if (a.importance !== b.importance) {
      return b.importance - a.importance;
    }

    // Secondary sort: recency
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

export const aiMemoryService = aiService();
