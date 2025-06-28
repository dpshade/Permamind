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

  detectCircularReferences: () => Promise<string[]>;
  // Utility functions
  eventToAIMemory: (event: Record<string, unknown>) => AIMemory;

  findShortestPath: () => Promise<string[]>;

  getContextMemories: (hubId: string, contextId: string) => Promise<AIMemory[]>;

  // Analytics
  getMemoryAnalytics: (hubId: string, p?: string) => Promise<MemoryAnalytics>;
  // Relationship analysis methods
  getMemoryRelationships: () => Promise<MemoryLink[]>;

  getReasoningChain: (
    hubId: string,
    chainId: string,
  ) => Promise<null | ReasoningTrace>;
  getRelationshipAnalytics: () => Promise<unknown>;
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

    detectCircularReferences: async (): Promise<string[]> => {
      // Minimal implementation for TDD
      throw new Error("detectCircularReferences not implemented yet");
    },

    eventToAIMemory: eventToAIMemory,

    findShortestPath: async (): Promise<string[]> => {
      // Minimal implementation for TDD
      throw new Error("findShortestPath not implemented yet");
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
            workflow: 0,
          },
          totalMemories: 0,
        };
      }
    },
    getMemoryRelationships: async (): Promise<MemoryLink[]> => {
      // Minimal implementation for TDD
      throw new Error("getMemoryRelationships not implemented yet");
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

    getRelationshipAnalytics: async (): Promise<unknown> => {
      // Minimal implementation for TDD
      throw new Error("getRelationshipAnalytics not implemented yet");
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

  // Add workflow-specific tags if this is a workflow memory
  const workflowMemory = memory as any; // Type assertion for workflow properties
  if (workflowMemory.workflowId) {
    tags.push({ name: "workflow_id", value: workflowMemory.workflowId });
  }
  if (workflowMemory.workflowVersion) {
    tags.push({
      name: "workflow_version",
      value: workflowMemory.workflowVersion,
    });
  }
  if (workflowMemory.stage) {
    tags.push({ name: "workflow_stage", value: workflowMemory.stage });
  }
  if (workflowMemory.performance) {
    tags.push({
      name: "workflow_performance",
      value: JSON.stringify(workflowMemory.performance),
    });
  }
  if (workflowMemory.enhancement) {
    tags.push({
      name: "workflow_enhancement",
      value: JSON.stringify(workflowMemory.enhancement),
    });
  }
  if (
    workflowMemory.dependencies &&
    Array.isArray(workflowMemory.dependencies)
  ) {
    workflowMemory.dependencies.forEach((dep: string) => {
      tags.push({ name: "workflow_dependency", value: dep });
    });
  }
  if (
    workflowMemory.capabilities &&
    Array.isArray(workflowMemory.capabilities)
  ) {
    workflowMemory.capabilities.forEach((cap: string) => {
      tags.push({ name: "workflow_capability", value: cap });
    });
  }
  if (
    workflowMemory.requirements &&
    Array.isArray(workflowMemory.requirements)
  ) {
    workflowMemory.requirements.forEach((req: string) => {
      tags.push({ name: "workflow_requirement", value: req });
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

  // Add workflow-specific properties if present
  const workflowMemory = aiMemory as any;
  if (event.workflow_id) {
    workflowMemory.workflowId = event.workflow_id as string;
  }
  if (event.workflow_version) {
    workflowMemory.workflowVersion = event.workflow_version as string;
  }
  if (event.workflow_stage) {
    workflowMemory.stage = event.workflow_stage as string;
  }
  if (event.workflow_performance) {
    try {
      workflowMemory.performance = JSON.parse(
        event.workflow_performance as string,
      );
    } catch {
      // Ignore invalid JSON
    }
  }
  if (event.workflow_enhancement) {
    try {
      workflowMemory.enhancement = JSON.parse(
        event.workflow_enhancement as string,
      );
    } catch {
      // Ignore invalid JSON
    }
  }

  // Handle arrays
  if (event.workflow_dependency) {
    const deps = Array.isArray(event.workflow_dependency)
      ? (event.workflow_dependency as string[])
      : [event.workflow_dependency as string];
    workflowMemory.dependencies = deps;
  }
  if (event.workflow_capability) {
    const caps = Array.isArray(event.workflow_capability)
      ? (event.workflow_capability as string[])
      : [event.workflow_capability as string];
    workflowMemory.capabilities = caps;
  }
  if (event.workflow_requirement) {
    const reqs = Array.isArray(event.workflow_requirement)
      ? (event.workflow_requirement as string[])
      : [event.workflow_requirement as string];
    workflowMemory.requirements = reqs;
  }

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
    workflow: memoryTypeDistribution.workflow || 0,
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
