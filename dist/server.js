// SSE transport allows normal logging without protocol interference
//console.log('🧠 Permamind MCP Server starting with SSE transport...');
import Arweave from "arweave";
import dotenv from "dotenv";
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { HUB_REGISTRY_ID } from "./constants.js";
import { getKeyFromMnemonic } from "./mnemonic.js";
import { aiMemoryService } from "./services/aiMemoryService.js";
import { CrossHubDiscoveryService } from "./services/CrossHubDiscoveryService.js";
import { memoryService } from "./services/memory.js";
import { hubRegistryService } from "./services/registry.js";
import { WorkflowAnalyticsService } from "./services/WorkflowAnalyticsService.js";
import { WorkflowEnhancementEngine } from "./services/WorkflowEnhancementEngine.js";
import { WorkflowPerformanceTracker } from "./services/WorkflowPerformanceTracker.js";
import { WorkflowRelationshipManager } from "./services/WorkflowRelationshipManager.js";
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
// Initialize workflow ecosystem services
let workflowServices = null;
function initializeWorkflowServices() {
    const performanceTracker = new WorkflowPerformanceTracker();
    const relationshipManager = new WorkflowRelationshipManager();
    const enhancementEngine = new WorkflowEnhancementEngine(performanceTracker, relationshipManager);
    const analyticsService = new WorkflowAnalyticsService(performanceTracker, relationshipManager);
    const crossHubDiscovery = new CrossHubDiscoveryService();
    workflowServices = {
        analyticsService,
        crossHubDiscovery,
        enhancementEngine,
        performanceTracker,
        relationshipManager,
    };
    // Start background enhancement cycles
    startBackgroundEnhancementCycles();
}
// Background enhancement cycle management
const enhancementIntervals = new Map();
function startBackgroundEnhancementCycles() {
    // Start a periodic check for workflows that need enhancement cycles
    setInterval(async () => {
        if (!workflowServices)
            return;
        try {
            // Get all workflow memories to find active workflows
            const allMemories = await aiMemoryService.searchAdvanced(hubId, "", {
                memoryType: "workflow",
            });
            // Extract unique workflow IDs
            const workflowIds = new Set();
            allMemories.forEach((memory) => {
                if (memory.workflowId) {
                    workflowIds.add(memory.workflowId);
                }
            });
            // Start enhancement cycles for new workflows
            for (const workflowId of workflowIds) {
                if (!enhancementIntervals.has(workflowId)) {
                    startEnhancementCycleForWorkflow(workflowId);
                }
            }
        }
        catch (error) {
            // Silent error handling for background processes
        }
    }, 60000); // Check every minute
}
function startEnhancementCycleForWorkflow(workflowId) {
    if (!workflowServices)
        return;
    // Initialize enhancement loop for this workflow
    const optimizationTargets = [
        {
            achieved: false,
            metric: "execution_time",
            targetValue: 0.8,
            weight: 0.3,
        },
        { achieved: false, metric: "success_rate", targetValue: 0.95, weight: 0.4 },
        { achieved: false, metric: "quality_score", targetValue: 0.9, weight: 0.3 },
    ];
    workflowServices.enhancementEngine.initializeEnhancementLoop(workflowId, optimizationTargets);
    // Run enhancement cycles periodically
    const runEnhancementCycle = async () => {
        if (!workflowServices)
            return;
        try {
            const result = await workflowServices.enhancementEngine.runEnhancementCycle(workflowId);
            // Schedule next cycle based on the recommendation
            const nextInterval = Math.max(result.nextCycleIn, 300000); // Minimum 5 minutes
            clearTimeout(enhancementIntervals.get(workflowId));
            const timeout = setTimeout(runEnhancementCycle, nextInterval);
            enhancementIntervals.set(workflowId, timeout);
        }
        catch (error) {
            // Silent error handling, retry in 1 hour
            const timeout = setTimeout(runEnhancementCycle, 3600000);
            enhancementIntervals.set(workflowId, timeout);
        }
    };
    // Start the first cycle
    setTimeout(runEnhancementCycle, 5000); // Start after 5 seconds
}
function stopEnhancementCycleForWorkflow(workflowId) {
    const interval = enhancementIntervals.get(workflowId);
    if (interval) {
        clearTimeout(interval);
        enhancementIntervals.delete(workflowId);
    }
}
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
// Workflow-Specific Memory Tools
// Tool to add workflow memory with performance tracking
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Add Workflow Memory",
    },
    description: `Store workflow execution memories with performance metrics, enhancement tracking, and stage information. 
    IMPORTANT: Before creating a new workflow, ALWAYS use the findWorkflowNetworkFirst tool to search for existing workflows 
    that might accomplish the same task. Only use this tool to document NEW workflows after confirming none exist on the network.
    Use this for documenting workflow executions, tracking improvements, and building workflow intelligence.`,
    execute: async (args) => {
        try {
            const workflowMemory = {
                capabilities: args.capabilities
                    ? args.capabilities.split(",").map((s) => s.trim())
                    : [],
                content: args.content,
                context: {
                    domain: args.domain,
                    sessionId: args.sessionId,
                    topic: args.topic,
                },
                dependencies: args.dependencies
                    ? args.dependencies.split(",").map((s) => s.trim())
                    : [],
                enhancement: args.enhancement
                    ? JSON.parse(args.enhancement)
                    : undefined,
                importance: args.importance || 0.7,
                memoryType: "workflow",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: args.tags ? args.tags.split(",").map((s) => s.trim()) : [],
                },
                p: args.p,
                performance: args.performance
                    ? JSON.parse(args.performance)
                    : undefined,
                requirements: args.requirements
                    ? args.requirements.split(",").map((s) => s.trim())
                    : [],
                role: args.role,
                stage: args.stage,
                workflowId: args.workflowId,
                workflowVersion: args.workflowVersion || "1.0.0",
            };
            const result = await aiMemoryService.addEnhanced(keyPair, hubId, workflowMemory);
            return result;
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "addWorkflowMemory",
    parameters: z.object({
        capabilities: z
            .string()
            .optional()
            .describe("Comma-separated list of workflow capabilities"),
        content: z
            .string()
            .describe("The workflow execution content or description"),
        dependencies: z
            .string()
            .optional()
            .describe("Comma-separated list of dependency workflow IDs"),
        domain: z.string().optional().describe("Domain or category"),
        enhancement: z
            .string()
            .optional()
            .describe("JSON string of enhancement data"),
        importance: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Importance score 0-1 (default: 0.7)"),
        p: z.string().describe("Public key of the participant"),
        performance: z
            .string()
            .optional()
            .describe("JSON string of performance metrics"),
        requirements: z
            .string()
            .optional()
            .describe("Comma-separated list of workflow requirements"),
        role: z.string().describe("Role of the author (system/user/assistant)"),
        sessionId: z.string().optional().describe("Session or execution ID"),
        stage: z
            .enum(["planning", "execution", "evaluation", "optimization", "archived"])
            .describe("Current workflow stage"),
        tags: z.string().optional().describe("Comma-separated list of tags"),
        topic: z.string().optional().describe("Topic or subject"),
        workflowId: z.string().describe("Unique identifier for the workflow"),
        workflowVersion: z
            .string()
            .optional()
            .describe("Version of the workflow (default: 1.0.0)"),
    }),
});
// Tool to track workflow performance
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Track Workflow Performance",
    },
    description: `Record performance metrics for a workflow execution. Enables self-enhancement by tracking 
    execution time, success rates, resource usage, and quality scores over time.`,
    execute: async (args) => {
        try {
            const performance = {
                completionRate: args.completionRate || 1.0,
                errorRate: args.errorRate || 0,
                executionTime: args.executionTime,
                lastExecuted: new Date().toISOString(),
                qualityScore: args.qualityScore,
                resourceUsage: {
                    cpuTime: args.cpuTime || 0,
                    memoryUsage: args.memoryUsage || 0,
                    networkRequests: args.networkRequests || 0,
                    storageOperations: args.storageOperations || 0,
                    toolCalls: args.toolCalls || 0,
                },
                retryCount: args.retryCount || 0,
                success: args.success,
                userSatisfaction: args.userSatisfaction,
            };
            // Create performance memory
            const performanceMemory = {
                content: `Performance data for workflow ${args.workflowId}`,
                context: {
                    domain: "workflow_performance",
                    topic: "performance_tracking",
                },
                importance: 0.8,
                memoryType: "performance",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: ["performance", "metrics", args.workflowId],
                },
                p: args.p,
                performance,
                role: "system",
                stage: "evaluation",
                workflowId: args.workflowId,
            };
            const result = await aiMemoryService.addEnhanced(keyPair, hubId, performanceMemory);
            // Also track in performance tracker if available
            if (workflowServices) {
                workflowServices.performanceTracker.recordPerformance(args.workflowId, performance);
            }
            return result;
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "trackWorkflowPerformance",
    parameters: z.object({
        completionRate: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Completion rate (0-1, default: 1.0)"),
        cpuTime: z.number().optional().describe("CPU time in milliseconds"),
        errorRate: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Error rate (0-1, default: 0)"),
        executionTime: z.number().describe("Execution time in milliseconds"),
        memoryUsage: z.number().optional().describe("Memory usage in MB"),
        networkRequests: z
            .number()
            .optional()
            .describe("Number of network requests"),
        p: z.string().describe("Public key of the participant"),
        qualityScore: z
            .number()
            .min(0)
            .max(1)
            .describe("Quality score of the output (0-1)"),
        retryCount: z
            .number()
            .optional()
            .describe("Number of retries (default: 0)"),
        storageOperations: z
            .number()
            .optional()
            .describe("Number of storage operations"),
        success: z
            .boolean()
            .describe("Whether the workflow execution was successful"),
        toolCalls: z.number().optional().describe("Number of tool calls"),
        userSatisfaction: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("User satisfaction score (0-1)"),
        workflowId: z.string().describe("Unique identifier for the workflow"),
    }),
});
// Tool to create workflow relationships
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Create Workflow Relationship",
    },
    description: `Create relationships between workflows for inheritance, composition, dependency tracking, and collaboration. 
    Enables building workflow ecosystems where workflows can learn from and enhance each other.`,
    execute: async (args) => {
        try {
            const relationship = {
                strength: args.strength,
                targetId: args.targetWorkflowId,
                type: args.relationshipType,
            };
            const result = await aiMemoryService.linkMemories(keyPair, hubId, args.sourceWorkflowId, args.targetWorkflowId, relationship);
            // Also create a relationship memory for tracking
            const relationshipMemory = {
                content: `Workflow relationship: ${args.sourceWorkflowId} ${args.relationshipType} ${args.targetWorkflowId}`,
                context: {
                    domain: "workflow_relationships",
                    topic: "workflow_coordination",
                },
                dependencies: [args.targetWorkflowId],
                importance: 0.6,
                memoryType: "knowledge",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: ["relationship", args.relationshipType, "workflow"],
                },
                p: args.p,
                role: "system",
                stage: "planning",
                workflowId: args.sourceWorkflowId,
            };
            await aiMemoryService.addEnhanced(keyPair, hubId, relationshipMemory);
            // Also track in relationship manager if available
            if (workflowServices) {
                workflowServices.relationshipManager.createRelationship(args.sourceWorkflowId, args.targetWorkflowId, args.relationshipType, args.strength);
            }
            return result;
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "createWorkflowRelationship",
    parameters: z.object({
        p: z
            .string()
            .describe("Public key of the participant creating the relationship"),
        relationshipType: z
            .enum([
            "inherits",
            "composes",
            "enhances",
            "triggers",
            "depends_on",
            "replaces",
            "causes",
            "supports",
            "contradicts",
            "extends",
            "references",
        ])
            .describe("Type of relationship between workflows"),
        sourceWorkflowId: z.string().describe("ID of the source workflow"),
        strength: z
            .number()
            .min(0)
            .max(1)
            .describe("Strength of the relationship (0-1)"),
        targetWorkflowId: z.string().describe("ID of the target workflow"),
    }),
});
// Tool to add workflow enhancement
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Add Workflow Enhancement",
    },
    description: `Record workflow enhancements including optimizations, bug fixes, and new features. 
    Tracks the evolution of workflows and enables learning from enhancement patterns.`,
    execute: async (args) => {
        try {
            const enhancement = {
                actualImpact: args.actualImpact,
                code: args.code,
                description: args.description,
                id: args.enhancementId ||
                    `enhancement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                impact: args.expectedImpact,
                parameters: args.parameters ? JSON.parse(args.parameters) : {},
                type: args.enhancementType,
                validation: {
                    confidence: args.confidence || 0.5,
                    isValid: args.isValid,
                    riskAssessment: args.riskLevel,
                    testResults: args.testResults ? JSON.parse(args.testResults) : [],
                    validatedAt: new Date().toISOString(),
                },
            };
            const enhancementMemory = {
                content: `Enhancement: ${args.description}`,
                context: {
                    domain: "workflow_enhancement",
                    topic: "self_improvement",
                },
                enhancement,
                importance: Math.max(0.5, args.expectedImpact),
                memoryType: "enhancement",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: ["enhancement", args.enhancementType, "improvement"],
                },
                p: args.p,
                role: "system",
                stage: "optimization",
                workflowId: args.workflowId,
            };
            const result = await aiMemoryService.addEnhanced(keyPair, hubId, enhancementMemory);
            // Also track in analytics service if available
            if (workflowServices) {
                workflowServices.analyticsService.addEnhancement(args.workflowId, enhancement);
            }
            return result;
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "addWorkflowEnhancement",
    parameters: z.object({
        actualImpact: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Actual measured impact (0-1)"),
        code: z
            .string()
            .optional()
            .describe("Code changes or implementation details"),
        confidence: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Confidence in the enhancement (0-1)"),
        description: z.string().describe("Description of the enhancement"),
        enhancementId: z
            .string()
            .optional()
            .describe("Unique enhancement ID (auto-generated if not provided)"),
        enhancementType: z
            .enum([
            "optimization",
            "bug_fix",
            "feature_add",
            "refactor",
            "parameter_tune",
            "logic_improve",
            "error_handling",
            "user_experience",
        ])
            .describe("Type of enhancement"),
        expectedImpact: z
            .number()
            .min(0)
            .max(1)
            .describe("Expected impact score (0-1)"),
        isValid: z.boolean().describe("Whether the enhancement is validated"),
        p: z.string().describe("Public key of the participant"),
        parameters: z
            .string()
            .optional()
            .describe("JSON string of enhancement parameters"),
        riskLevel: z
            .enum(["low", "medium", "high", "critical"])
            .describe("Risk level of applying the enhancement"),
        testResults: z.string().optional().describe("JSON array of test results"),
        workflowId: z.string().describe("ID of the workflow being enhanced"),
    }),
});
// Tool to search workflow memories with advanced filters
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Search Workflow Memories",
    },
    description: `Search workflow memories with filters for workflow stage, performance metrics, enhancement types, 
    and learning sources. Enables discovery of workflow patterns and optimization opportunities.`,
    execute: async (args) => {
        try {
            const filters = {
                domain: "workflow",
                importanceThreshold: args.importanceThreshold,
                memoryType: args.memoryType,
                timeRange: args.startDate && args.endDate
                    ? {
                        end: args.endDate,
                        start: args.startDate,
                    }
                    : undefined,
            };
            // Add workflow-specific filters through tags
            const workflowTags = [];
            if (args.workflowId)
                workflowTags.push(args.workflowId);
            if (args.stage)
                workflowTags.push(args.stage);
            if (args.enhancementType)
                workflowTags.push(args.enhancementType);
            let query = args.query;
            if (workflowTags.length > 0) {
                query += ` tags:${workflowTags.join(",")}`;
            }
            const memories = await aiMemoryService.searchAdvanced(hubId, query, filters);
            return JSON.stringify(memories);
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "searchWorkflowMemories",
    parameters: z.object({
        endDate: z
            .string()
            .optional()
            .describe("End date for time range filter (ISO string)"),
        enhancementType: z
            .enum([
            "optimization",
            "bug_fix",
            "feature_add",
            "refactor",
            "parameter_tune",
            "logic_improve",
            "error_handling",
            "user_experience",
        ])
            .optional()
            .describe("Filter by enhancement type"),
        importanceThreshold: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Minimum importance score"),
        memoryType: z
            .enum(["workflow", "performance", "enhancement"])
            .optional()
            .describe("Filter by workflow memory type"),
        query: z.string().describe("Search query for workflow memories"),
        stage: z
            .enum(["planning", "execution", "evaluation", "optimization", "archived"])
            .optional()
            .describe("Filter by workflow stage"),
        startDate: z
            .string()
            .optional()
            .describe("Start date for time range filter (ISO string)"),
        workflowId: z
            .string()
            .optional()
            .describe("Filter by specific workflow ID"),
    }),
});
// Tool to get workflow analytics and insights
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Get Workflow Analytics",
    },
    description: `Get comprehensive analytics about workflow performance, enhancement effectiveness, 
    relationship patterns, and optimization opportunities. Provides insights for workflow ecosystem improvement.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                // Fallback to basic analytics if workflow services not initialized
                const basicAnalytics = await aiMemoryService.getMemoryAnalytics(hubId, args.p);
                return JSON.stringify({
                    ...basicAnalytics,
                    workflowSpecific: {
                        message: "Workflow services initializing...",
                        recommendations: ["Workflow ecosystem is starting up"],
                        totalWorkflows: 0,
                    },
                });
            }
            // Use the actual analytics service
            const workflowAnalytics = workflowServices.analyticsService.getWorkflowAnalytics(args.workflowId, args.p);
            // Get enhancement effectiveness
            const enhancement = workflowServices.analyticsService.getEnhancementEffectiveness(args.workflowId);
            // Get ecosystem health score
            const healthScore = workflowServices.analyticsService.getEcosystemHealthScore();
            // Get recommendations
            const recommendations = workflowServices.analyticsService.generateRecommendations(args.workflowId);
            const result = {
                ...workflowAnalytics,
                ecosystemHealthScore: healthScore,
                enhancementEffectiveness: enhancement,
                recommendations,
            };
            return JSON.stringify(result);
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "getWorkflowAnalytics",
    parameters: z.object({
        p: z
            .string()
            .optional()
            .describe("Public key to filter analytics for specific user (optional)"),
        workflowId: z
            .string()
            .optional()
            .describe("Get analytics for specific workflow (optional)"),
    }),
});
// Tool to create workflow composition
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Create Workflow Composition",
    },
    description: `Create a composition of multiple workflows that can be executed together. 
    IMPORTANT: Before creating a new composition, use findWorkflowNetworkFirst to search for existing workflow compositions 
    that might already solve your orchestration needs. This promotes reuse and learning from the community.
    Enables building complex workflows from simpler components and workflow reuse.`,
    execute: async (args) => {
        try {
            const composition = {
                description: args.description,
                errorHandling: {
                    maxRetries: args.maxRetries || 3,
                    onFailure: args.onFailure || "abort",
                    retryDelay: args.retryDelay || 1000,
                },
                executionStrategy: args.executionStrategy,
                id: args.compositionId,
                name: args.name,
                resourceAllocation: {
                    maxConcurrentWorkflows: args.maxConcurrent || 1,
                    memoryLimit: args.memoryLimit || 1024,
                    priority: args.priority || "medium",
                    timeLimit: args.timeLimit || 300000,
                },
                workflows: JSON.parse(args.workflowSteps),
            };
            const compositionMemory = {
                content: `Workflow composition: ${args.name}`,
                context: {
                    domain: "workflow_composition",
                    topic: "workflow_orchestration",
                },
                dependencies: JSON.parse(args.workflowSteps).map((step) => step.workflowId),
                importance: 0.8,
                memoryType: "procedure",
                metadata: {
                    accessCount: 0,
                    lastAccessed: new Date().toISOString(),
                    tags: ["composition", "orchestration", args.executionStrategy],
                },
                p: args.p,
                role: "system",
                stage: "planning",
                workflowId: args.compositionId,
            };
            const result = await aiMemoryService.addEnhanced(keyPair, hubId, compositionMemory);
            return result;
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "createWorkflowComposition",
    parameters: z.object({
        compositionId: z.string().describe("Unique identifier for the composition"),
        description: z
            .string()
            .describe("Description of what the composition does"),
        executionStrategy: z
            .enum(["sequential", "parallel", "conditional", "pipeline", "adaptive"])
            .describe("How workflows should be executed"),
        maxConcurrent: z
            .number()
            .optional()
            .describe("Max concurrent workflows (default: 1)"),
        maxRetries: z
            .number()
            .optional()
            .describe("Maximum number of retries (default: 3)"),
        memoryLimit: z
            .number()
            .optional()
            .describe("Memory limit in MB (default: 1024)"),
        name: z.string().describe("Name of the composition"),
        onFailure: z
            .enum(["abort", "continue", "retry", "fallback"])
            .optional()
            .describe("What to do when a workflow fails"),
        p: z.string().describe("Public key of the creator"),
        priority: z
            .enum(["low", "medium", "high"])
            .optional()
            .describe("Execution priority (default: medium)"),
        retryDelay: z
            .number()
            .optional()
            .describe("Delay between retries in ms (default: 1000)"),
        timeLimit: z
            .number()
            .optional()
            .describe("Time limit in ms (default: 300000)"),
        workflowSteps: z
            .string()
            .describe("JSON array of workflow steps with workflowId, order, conditions"),
    }),
});
// Tool to manage workflow enhancement cycles
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: false,
        title: "Manage Enhancement Cycles",
    },
    description: `Control workflow enhancement cycles - start, stop, or get status of automatic workflow improvement processes. 
    Enhancement cycles run in the background to continuously optimize workflow performance.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized";
            }
            switch (args.action) {
                case "force_cycle":
                    if (!args.workflowId) {
                        return "workflowId required for force_cycle action";
                    }
                    const result = await workflowServices.enhancementEngine.runEnhancementCycle(args.workflowId);
                    return JSON.stringify({
                        message: `Enhancement cycle completed for ${args.workflowId}`,
                        result,
                    });
                case "start":
                    if (args.workflowId) {
                        startEnhancementCycleForWorkflow(args.workflowId);
                        return `Started enhancement cycle for workflow ${args.workflowId}`;
                    }
                    else {
                        startBackgroundEnhancementCycles();
                        return "Started background enhancement cycles for all workflows";
                    }
                case "stop":
                    if (args.workflowId) {
                        stopEnhancementCycleForWorkflow(args.workflowId);
                        return `Stopped enhancement cycle for workflow ${args.workflowId}`;
                    }
                    else {
                        enhancementIntervals.forEach((interval, workflowId) => {
                            clearTimeout(interval);
                        });
                        enhancementIntervals.clear();
                        return "Stopped all enhancement cycles";
                    }
                case "status":
                    const activeWorkflows = Array.from(enhancementIntervals.keys());
                    const status = {
                        activeEnhancementCycles: activeWorkflows.length,
                        backgroundProcessActive: enhancementIntervals.size > 0,
                        workflowIds: activeWorkflows,
                    };
                    return JSON.stringify(status);
                default:
                    return "Invalid action. Use: start, stop, status, or force_cycle";
            }
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "manageEnhancementCycles",
    parameters: z.object({
        action: z
            .enum(["start", "stop", "status", "force_cycle"])
            .describe("Action to perform"),
        workflowId: z
            .string()
            .optional()
            .describe("Specific workflow ID (optional for start/stop actions)"),
    }),
});
// Cross-Hub Discovery Tools
// Tool to discover workflows across the network
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Discover Cross-Hub Workflows",
    },
    description: `Discover workflows across all Permamind hubs in the network by capability, requirements, or similarity. 
    Enables finding workflows from other users that could enhance your own workflows through learning and collaboration.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized";
            }
            const discoveryService = workflowServices.crossHubDiscovery;
            let workflows = [];
            switch (args.discoveryType) {
                case "capability":
                    if (!args.capability) {
                        return "capability parameter required for capability discovery";
                    }
                    workflows = await discoveryService.discoverByCapability(args.capability);
                    break;
                case "requirements":
                    if (!args.requirements) {
                        return "requirements parameter required for requirements discovery";
                    }
                    const requirementsList = args.requirements
                        .split(",")
                        .map((r) => r.trim());
                    workflows =
                        await discoveryService.findWorkflowsForRequirements(requirementsList);
                    break;
                case "search":
                    if (!args.query) {
                        return "query parameter required for search discovery";
                    }
                    const filters = {
                        capabilities: args.capabilities
                            ? args.capabilities.split(",").map((c) => c.trim())
                            : undefined,
                        minPerformanceScore: args.minPerformanceScore,
                        minReputationScore: args.minReputationScore,
                        tags: args.tags
                            ? args.tags.split(",").map((t) => t.trim())
                            : undefined,
                    };
                    workflows = await discoveryService.searchGlobalWorkflows(args.query, filters);
                    break;
                case "similar":
                    if (!args.localWorkflowId) {
                        return "localWorkflowId parameter required for similarity discovery";
                    }
                    workflows = await discoveryService.findSimilarWorkflows(args.localWorkflowId, hubId);
                    break;
                default:
                    return "Invalid discoveryType. Use: capability, requirements, similar, or search";
            }
            return JSON.stringify({
                discoveryType: args.discoveryType,
                hasMore: workflows.length > (args.limit || 10),
                totalFound: workflows.length,
                workflows: workflows.slice(0, args.limit || 10), // Limit results for readability
            });
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "discoverCrossHubWorkflows",
    parameters: z.object({
        capabilities: z
            .string()
            .optional()
            .describe("Comma-separated capabilities to filter by"),
        capability: z
            .string()
            .optional()
            .describe("Capability to search for (required for capability discovery)"),
        discoveryType: z
            .enum(["capability", "requirements", "similar", "search"])
            .describe("Type of discovery to perform"),
        limit: z
            .number()
            .optional()
            .describe("Maximum number of results to return (default: 10)"),
        localWorkflowId: z
            .string()
            .optional()
            .describe("Local workflow ID to find similar workflows for (required for similar discovery)"),
        minPerformanceScore: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Minimum performance score (0-1)"),
        minReputationScore: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Minimum reputation score (0-1)"),
        query: z
            .string()
            .optional()
            .describe("Search query (required for search discovery)"),
        requirements: z
            .string()
            .optional()
            .describe("Comma-separated requirements to fulfill (required for requirements discovery)"),
        tags: z.string().optional().describe("Comma-separated tags to filter by"),
    }),
});
// Tool to get network statistics
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Get Network Statistics",
    },
    description: `Get statistics about the workflow ecosystem network including total hubs, workflows, 
    top capabilities, and network health score. Provides insights into the ecosystem's growth and activity.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized";
            }
            const discoveryService = workflowServices.crossHubDiscovery;
            const stats = await discoveryService.getNetworkStatistics();
            return JSON.stringify(stats);
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "getNetworkStatistics",
    parameters: z.object({}),
});
// Tool to request enhancement patterns from other workflows
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Request Enhancement Patterns",
    },
    description: `Request enhancement patterns from high-performing workflows in other hubs. 
    Enables learning optimization techniques and improvement strategies from successful workflows across the network.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized";
            }
            const discoveryService = workflowServices.crossHubDiscovery;
            const patterns = await discoveryService.requestEnhancementPatterns(args.sourceHubId, args.sourceWorkflowId);
            return JSON.stringify({
                patterns: patterns,
                patternsFound: patterns.length,
                sourceHubId: args.sourceHubId,
                sourceWorkflowId: args.sourceWorkflowId,
            });
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "requestEnhancementPatterns",
    parameters: z.object({
        sourceHubId: z.string().describe("Hub ID containing the source workflow"),
        sourceWorkflowId: z
            .string()
            .describe("Workflow ID to request patterns from"),
    }),
});
// Tool to discover and analyze hub ecosystem
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Discover Hubs",
    },
    description: `Discover all Permamind hubs in the network and get information about their workflows, 
    activity levels, and reputation scores. Enables understanding the broader ecosystem landscape.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized";
            }
            const discoveryService = workflowServices.crossHubDiscovery;
            const hubs = await discoveryService.discoverHubs(args.forceRefresh || false);
            return JSON.stringify({
                hubs: hubs.map((hub) => ({
                    hasPublicWorkflows: hub.hasPublicWorkflows,
                    lastActivity: hub.lastActivity,
                    processId: hub.processId,
                    reputationScore: hub.reputationScore,
                    workflowCount: hub.workflowCount,
                })),
                totalHubs: hubs.length,
            });
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "discoverHubs",
    parameters: z.object({
        forceRefresh: z
            .boolean()
            .optional()
            .describe("Force refresh of hub discovery cache"),
    }),
});
// Network-First Workflow Discovery Tool
server.addTool({
    annotations: {
        openWorldHint: false,
        readOnlyHint: true,
        title: "Find Workflow (Network First)",
    },
    description: `PREFERRED: Always use this tool FIRST when a user needs a workflow for any task. 
    This tool searches the global Permamind network to find existing workflows that match the user's needs 
    before suggesting they create a new one. Just like how Permamind automatically stores memories, 
    it should automatically search the network for workflows first.
    
    Provide a natural language description of what the user wants to accomplish, and this tool will:
    1. Search for existing workflows across all hubs
    2. Find workflows by capability, requirements, or similarity
    3. Return ranked results with performance metrics
    4. Suggest the best existing workflows to try first
    5. Only recommend creating new workflows if none exist
    
    This promotes workflow reuse, learning from the community, and avoids duplicate work.`,
    execute: async (args) => {
        try {
            if (!workflowServices) {
                return "Workflow services not initialized. Please try again in a moment.";
            }
            const discoveryService = workflowServices.crossHubDiscovery;
            // Multi-strategy search approach
            const strategies = [];
            // 1. Direct search for the user's description
            strategies.push({
                type: "search",
                method: () => discoveryService.searchGlobalWorkflows(args.userRequest, {
                    minReputationScore: 0.3,
                    minPerformanceScore: 0.3,
                }),
                weight: 1.0,
            });
            // 2. Extract and search for capabilities if provided
            if (args.capabilities) {
                const capabilityList = args.capabilities.split(",").map(c => c.trim());
                for (const capability of capabilityList) {
                    strategies.push({
                        type: "capability",
                        method: () => discoveryService.discoverByCapability(capability),
                        weight: 0.8,
                    });
                }
            }
            // 3. Search for requirements if provided
            if (args.requirements) {
                const requirementsList = args.requirements.split(",").map(r => r.trim());
                strategies.push({
                    type: "requirements",
                    method: () => discoveryService.findWorkflowsForRequirements(requirementsList),
                    weight: 0.9,
                });
            }
            // Execute all search strategies in parallel
            const searchPromises = strategies.map(async (strategy) => {
                try {
                    const results = await strategy.method();
                    return results.map(workflow => ({
                        ...workflow,
                        searchStrategy: strategy.type,
                        relevanceWeight: strategy.weight,
                    }));
                }
                catch (error) {
                    console.warn(`Search strategy ${strategy.type} failed:`, error);
                    return [];
                }
            });
            const allResults = await Promise.all(searchPromises);
            const flatResults = allResults.flat();
            // Deduplicate by workflow ID and hub
            const uniqueWorkflows = new Map();
            flatResults.forEach(workflow => {
                const key = `${workflow.hubId}-${workflow.workflowId}`;
                if (!uniqueWorkflows.has(key) ||
                    uniqueWorkflows.get(key).relevanceWeight < workflow.relevanceWeight) {
                    uniqueWorkflows.set(key, workflow);
                }
            });
            // Sort by relevance score (combination of performance, reputation, and search relevance)
            const rankedWorkflows = Array.from(uniqueWorkflows.values())
                .map(workflow => ({
                ...workflow,
                combinedScore: (workflow.performanceScore * 0.4 +
                    workflow.reputationScore * 0.4 +
                    workflow.relevanceWeight * 0.2),
            }))
                .sort((a, b) => b.combinedScore - a.combinedScore)
                .slice(0, args.maxResults || 10);
            // Generate recommendations
            const recommendations = [];
            if (rankedWorkflows.length === 0) {
                recommendations.push("No existing workflows found that match your requirements.", "Consider creating a new workflow and sharing it with the network.", "Use the addWorkflowMemory tool to document your new workflow.");
            }
            else {
                recommendations.push(`Found ${rankedWorkflows.length} existing workflows that might help.`, "Review the top-ranked workflows first before creating a new one.", "Consider enhancing existing workflows rather than starting from scratch.");
            }
            return JSON.stringify({
                query: args.userRequest,
                totalFound: rankedWorkflows.length,
                workflows: rankedWorkflows,
                recommendations,
                searchStrategies: strategies.map(s => s.type),
                networkFirst: true,
            });
        }
        catch (error) {
            return `Error: ${error}`;
        }
    },
    name: "findWorkflowNetworkFirst",
    parameters: z.object({
        userRequest: z.string().describe("Natural language description of what the user wants to accomplish"),
        capabilities: z.string().optional().describe("Comma-separated list of required capabilities"),
        requirements: z.string().optional().describe("Comma-separated list of specific requirements"),
        maxResults: z.number().optional().describe("Maximum number of results to return (default: 10)"),
    }),
});
/*server.addResource({
  async load() {
    return {
      text: "Example log content",
    };
  },
  mimeType: "text/plain",
  name: "Application Logs",
  uri: "file:///logs/app.log",
});

server.addPrompt({
  
  arguments: [
    {
      description: "Git diff or description of changes",
      name: "changes",
      required: true,
    },
  ],
  description: "Generate a Git commit message",
  load: async (args) => {
    return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
  },
  name: "git-commit",
});*/
// Start server with stdio transport (matches Claude Desktop expectation)
server.start({
    transportType: "stdio",
});
// Initialize in background (silent for stdio transport)
init()
    .then(() => {
    // Initialize workflow services after main initialization
    initializeWorkflowServices();
})
    .catch(() => {
    // Silent error handling for stdio transport compatibility
});
