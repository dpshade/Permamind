import { JWKInterface } from "arweave/node/lib/wallet.js";

import {
  AIMemory,
  MemoryAnalytics,
  MemoryContext,
  MemoryLink,
  MemoryType,
  ReasoningTrace,
  SearchFilters,
} from "../models/AIMemory.js";
import { Memory } from "../models/Memory.js";
import { Tag } from "../models/Tag.js";
import { event, fetchEvents } from "../relay.js";

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

  // Utility functions
  eventToAIMemory: (event: any) => AIMemory;
  getContextMemories: (hubId: string, contextId: string) => Promise<AIMemory[]>;

  // Analytics
  getMemoryAnalytics: (hubId: string, p?: string) => Promise<MemoryAnalytics>;

  getReasoningChain: (
    hubId: string,
    chainId: string,
  ) => Promise<null | ReasoningTrace>;

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
        const tags: Tag[] = [
          { name: "kind", value: "23" }, // Reasoning chain kind
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
        const tags: Tag[] = [
          { name: "kind", value: "40" }, // Context kind
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

    eventToAIMemory: eventToAIMemory,

    getContextMemories: async (
      hubId: string,
      contextId: string,
    ): Promise<AIMemory[]> => {
      try {
        const filter = {
          kinds: ["10"],
          tags: { ai_context_id: [contextId] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        return events
          .filter((event) => event.Content)
          .map((event) => eventToAIMemory(event));
      } catch (error) {
        return [];
      }
    },

    getMemoryAnalytics: async (
      hubId: string,
      p?: string,
    ): Promise<MemoryAnalytics> => {
      try {
        const filter: any = {
          kinds: ["10"],
        };

        if (p) {
          filter.tags = { p: [p] };
        }

        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);
        const aiMemories = events
          .filter((event) => event.Content)
          .map((event) => eventToAIMemory(event));

        return generateAnalytics(aiMemories);
      } catch (error) {
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
            knowledge: 0,
            procedure: 0,
            reasoning: 0,
          },
          totalMemories: 0,
        };
      }
    },

    getReasoningChain: async (
      hubId: string,
      chainId: string,
    ): Promise<null | ReasoningTrace> => {
      try {
        const filter = {
          kinds: ["23"],
          tags: { chainId: [chainId] },
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        if (events.length === 0) return null;

        const event = events[0];
        return {
          chainId: event.chainId,
          outcome: event.outcome || "",
          steps: JSON.parse(event.steps || "[]"),
        };
      } catch (error) {
        return null;
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
        const tags: Tag[] = [
          { name: "kind", value: "11" }, // Memory relationship kind
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
        const filter: any = {
          kinds: ["10"],
        };

        if (query) {
          filter.search = query;
        }

        // Add filter conditions based on AI-specific tags
        if (filters?.memoryType) {
          filter.tags = filter.tags || {};
          filter.tags.ai_type = [filters.memoryType];
        }

        if (filters?.importanceThreshold) {
          // Note: This would require hub-side filtering support
          filter.tags = filter.tags || {};
          filter.tags.ai_importance_min = [
            filters.importanceThreshold.toString(),
          ];
        }

        if (filters?.sessionId) {
          filter.tags = filter.tags || {};
          filter.tags.ai_session = [filters.sessionId];
        }

        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);

        const aiMemories = events
          .filter((event) => event.Content)
          .map((event) => eventToAIMemory(event))
          .filter((memory) => matchesFilters(memory, filters));

        return rankMemoriesByRelevance(aiMemories, query);
      } catch (error) {
        throw new Error(`Failed to search memories: ${error}`);
      }
    },
  };
};

// Helper functions
function createAIMemoryTags(memory: Partial<AIMemory>): Tag[] {
  const tags: Tag[] = [
    { name: "kind", value: "10" },
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

function eventToAIMemory(event: any): AIMemory {
  const baseMemory: Memory = {
    content: event.Content,
    id: event.Id,
    p: event.p,
    role: event.r || event.role || "user",
    timestamp: event.Timestamp,
  };

  // Parse AI-specific fields with defaults
  const importance = parseFloat(event.ai_importance || "0.5");
  const memoryType: MemoryType = event.ai_type || "conversation";
  const context: MemoryContext = event.ai_context
    ? JSON.parse(event.ai_context)
    : {};

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
          ? event.ai_tag
          : [event.ai_tag]
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
    knowledge: memoryTypeDistribution.knowledge || 0,
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

function rankMemoriesByRelevance(
  memories: AIMemory[],
  query?: string,
): AIMemory[] {
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
