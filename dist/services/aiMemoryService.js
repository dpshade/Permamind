import { event, fetchEvents } from "../relay.js";
// Constants for memory kinds
const MEMORY_KINDS = {
    AI_MEMORY: "10",
    MEMORY_CONTEXT: "40",
    MEMORY_RELATIONSHIP: "11",
    REASONING_CHAIN: "23",
};
// Validation utilities
const isValidImportance = (importance) => importance >= 0 && importance <= 1;
const isValidStrength = (strength) => strength >= 0 && strength <= 1;
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const aiService = () => {
    return {
        addEnhanced: async (signer, hubId, memory) => {
            try {
                // Validate required fields
                if (!memory.content || !isNonEmptyString(memory.content)) {
                    throw new Error("Memory content is required");
                }
                if (!memory.p || !isNonEmptyString(memory.p)) {
                    throw new Error("Memory p parameter is required");
                }
                if (memory.importance !== undefined &&
                    !isValidImportance(memory.importance)) {
                    throw new Error("Importance must be between 0 and 1");
                }
                const tags = createAIMemoryTags(memory);
                await event(signer, hubId, tags);
                return "Enhanced memory added successfully";
            }
            catch (e) {
                throw new Error(`Failed to add enhanced memory: ${e}`);
            }
        },
        addMemoriesBatch: async (signer, hubId, memories, p) => {
            try {
                const results = [];
                for (const memory of memories) {
                    memory.p = p; // Ensure p is set
                    const result = await aiService().addEnhanced(signer, hubId, memory);
                    results.push(result);
                }
                return results;
            }
            catch (e) {
                throw new Error(`Failed to add memories batch: ${e}`);
            }
        },
        addReasoningChain: async (signer, hubId, reasoning, p) => {
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
                const tags = [
                    { name: "kind", value: MEMORY_KINDS.REASONING_CHAIN },
                    { name: "chainId", value: reasoning.chainId },
                    { name: "steps", value: JSON.stringify(reasoning.steps) },
                    { name: "outcome", value: reasoning.outcome },
                    { name: "p", value: p },
                ];
                await event(signer, hubId, tags);
                return "Reasoning chain added successfully";
            }
            catch (e) {
                throw new Error(`Failed to add reasoning chain: ${e}`);
            }
        },
        createAIMemoryTags: createAIMemoryTags,
        createMemoryContext: async (signer, hubId, contextName, description, p) => {
            try {
                // Validate inputs
                if (!isNonEmptyString(contextName)) {
                    throw new Error("Context name is required");
                }
                if (!isNonEmptyString(p)) {
                    throw new Error("P parameter is required");
                }
                const tags = [
                    { name: "kind", value: MEMORY_KINDS.MEMORY_CONTEXT },
                    { name: "contextName", value: contextName },
                    { name: "description", value: description },
                    { name: "p", value: p },
                ];
                await event(signer, hubId, tags);
                return "Memory context created successfully";
            }
            catch (e) {
                throw new Error(`Failed to create memory context: ${e}`);
            }
        },
        detectCircularReferences: async () => {
            // Minimal implementation for TDD
            throw new Error("detectCircularReferences not implemented yet");
        },
        eventToAIMemory: eventToAIMemory,
        findShortestPath: async () => {
            // Minimal implementation for TDD
            throw new Error("findShortestPath not implemented yet");
        },
        getContextMemories: async (hubId, contextId) => {
            try {
                const filter = {
                    kinds: [MEMORY_KINDS.AI_MEMORY],
                    tags: { ai_context_id: [contextId] },
                };
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                return events
                    .filter((event) => typeof event === "object" && event !== null && "Content" in event)
                    .map((event) => eventToAIMemory(event));
            }
            catch {
                return [];
            }
        },
        getMemoryAnalytics: async (hubId, p) => {
            try {
                const filter = {
                    kinds: [MEMORY_KINDS.AI_MEMORY],
                };
                if (p) {
                    filter.tags = { p: [p] };
                }
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                const aiMemories = events
                    .filter((event) => typeof event === "object" && event !== null && "Content" in event)
                    .map((event) => eventToAIMemory(event));
                return generateAnalytics(aiMemories);
            }
            catch {
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
        getMemoryRelationships: async () => {
            // Minimal implementation for TDD
            throw new Error("getMemoryRelationships not implemented yet");
        },
        getReasoningChain: async (hubId, chainId) => {
            try {
                const filter = {
                    kinds: [MEMORY_KINDS.REASONING_CHAIN],
                    tags: { chainId: [chainId] },
                };
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                if (events.length === 0)
                    return null;
                const event = events[0];
                return {
                    chainId: event.chainId,
                    outcome: event.outcome || "",
                    steps: JSON.parse(event.steps || "[]"),
                };
            }
            catch {
                return null;
            }
        },
        getRelationshipAnalytics: async () => {
            // Minimal implementation for TDD
            throw new Error("getRelationshipAnalytics not implemented yet");
        },
        linkMemories: async (signer, hubId, sourceId, targetId, relationship) => {
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
                const tags = [
                    { name: "kind", value: MEMORY_KINDS.MEMORY_RELATIONSHIP },
                    { name: "sourceId", value: sourceId },
                    { name: "targetId", value: targetId },
                    { name: "relationshipType", value: relationship.type },
                    { name: "strength", value: relationship.strength.toString() },
                ];
                await event(signer, hubId, tags);
                return "Memory link created successfully";
            }
            catch (e) {
                throw new Error(`Failed to link memories: ${e}`);
            }
        },
        searchAdvanced: async (hubId, query, filters) => {
            try {
                const filter = {
                    kinds: [MEMORY_KINDS.AI_MEMORY],
                };
                if (query) {
                    filter.search = query;
                }
                // Add filter conditions based on AI-specific tags
                if (filters?.memoryType) {
                    filter.tags = filter.tags || {};
                    filter.tags.ai_type = [
                        filters.memoryType,
                    ];
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
                    filter.tags.ai_session = [
                        filters.sessionId,
                    ];
                }
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                const aiMemories = events
                    .filter((event) => typeof event === "object" && event !== null && "Content" in event)
                    .map((event) => eventToAIMemory(event))
                    .filter((memory) => matchesFilters(memory, filters));
                return rankMemoriesByRelevance(aiMemories);
            }
            catch (error) {
                throw new Error(`Failed to search memories: ${error}`);
            }
        },
    };
};
// Helper functions
function createAIMemoryTags(memory) {
    const tags = [
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
    const workflowMemory = memory; // Type assertion for workflow properties
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
    if (workflowMemory.dependencies &&
        Array.isArray(workflowMemory.dependencies)) {
        workflowMemory.dependencies.forEach((dep) => {
            tags.push({ name: "workflow_dependency", value: dep });
        });
    }
    if (workflowMemory.capabilities &&
        Array.isArray(workflowMemory.capabilities)) {
        workflowMemory.capabilities.forEach((cap) => {
            tags.push({ name: "workflow_capability", value: cap });
        });
    }
    if (workflowMemory.requirements &&
        Array.isArray(workflowMemory.requirements)) {
        workflowMemory.requirements.forEach((req) => {
            tags.push({ name: "workflow_requirement", value: req });
        });
    }
    return tags;
}
function eventToAIMemory(event) {
    const baseMemory = {
        content: event.Content,
        id: event.Id,
        p: event.p,
        role: event.r || event.role || "user",
        timestamp: event.Timestamp,
    };
    // Parse AI-specific fields with defaults
    const importance = parseFloat(event.ai_importance || "0.5");
    const memoryType = event.ai_type || "conversation";
    const context = event.ai_context
        ? JSON.parse(event.ai_context)
        : {};
    // Add domain from event tags if available
    if (event.ai_domain) {
        context.domain = event.ai_domain;
    }
    const aiMemory = {
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
    // Add workflow-specific properties if present
    const workflowMemory = aiMemory;
    if (event.workflow_id) {
        workflowMemory.workflowId = event.workflow_id;
    }
    if (event.workflow_version) {
        workflowMemory.workflowVersion = event.workflow_version;
    }
    if (event.workflow_stage) {
        workflowMemory.stage = event.workflow_stage;
    }
    if (event.workflow_performance) {
        try {
            workflowMemory.performance = JSON.parse(event.workflow_performance);
        }
        catch {
            // Ignore invalid JSON
        }
    }
    if (event.workflow_enhancement) {
        try {
            workflowMemory.enhancement = JSON.parse(event.workflow_enhancement);
        }
        catch {
            // Ignore invalid JSON
        }
    }
    // Handle arrays
    if (event.workflow_dependency) {
        const deps = Array.isArray(event.workflow_dependency)
            ? event.workflow_dependency
            : [event.workflow_dependency];
        workflowMemory.dependencies = deps;
    }
    if (event.workflow_capability) {
        const caps = Array.isArray(event.workflow_capability)
            ? event.workflow_capability
            : [event.workflow_capability];
        workflowMemory.capabilities = caps;
    }
    if (event.workflow_requirement) {
        const reqs = Array.isArray(event.workflow_requirement)
            ? event.workflow_requirement
            : [event.workflow_requirement];
        workflowMemory.requirements = reqs;
    }
    return aiMemory;
}
function generateAnalytics(memories) {
    const memoryTypeDistribution = memories.reduce((acc, memory) => {
        acc[memory.memoryType] = (acc[memory.memoryType] || 0) + 1;
        return acc;
    }, {});
    // Ensure all types are represented
    const typeDistribution = {
        conversation: memoryTypeDistribution.conversation || 0,
        enhancement: memoryTypeDistribution.enhancement || 0,
        knowledge: memoryTypeDistribution.knowledge || 0,
        performance: memoryTypeDistribution.performance || 0,
        procedure: memoryTypeDistribution.procedure || 0,
        reasoning: memoryTypeDistribution.reasoning || 0,
        workflow: memoryTypeDistribution.workflow || 0,
    };
    const importanceDistribution = memories.reduce((acc, memory) => {
        if (memory.importance >= 0.7)
            acc.high++;
        else if (memory.importance >= 0.3)
            acc.medium++;
        else
            acc.low++;
        return acc;
    }, { high: 0, low: 0, medium: 0 });
    // Sort by access count and recency for access patterns
    const sortedByAccess = [...memories].sort((a, b) => b.metadata.accessCount - a.metadata.accessCount);
    const sortedByRecency = [...memories].sort((a, b) => new Date(b.metadata.lastAccessed).getTime() -
        new Date(a.metadata.lastAccessed).getTime());
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
function matchesFilters(memory, filters) {
    if (!filters)
        return true;
    if (filters.memoryType && memory.memoryType !== filters.memoryType) {
        return false;
    }
    if (filters.importanceThreshold &&
        memory.importance < filters.importanceThreshold) {
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
function rankMemoriesByRelevance(memories) {
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
