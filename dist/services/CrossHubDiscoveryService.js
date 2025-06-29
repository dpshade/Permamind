import { HUB_REGISTRY_ID } from "../constants.js";
import { fetchEvents, getZones } from "../relay.js";
import { aiMemoryService } from "./aiMemoryService.js";
export class CrossHubDiscoveryService {
    discoveredHubs = new Map();
    discoveryInterval = 300000; // 5 minutes
    lastDiscoveryTime = 0;
    workflowCache = new Map();
    statisticsCache = new Map();
    /**
     * Find workflows across all hubs by capability
     */
    async discoverByCapability(capability) {
        const hubs = await this.discoverHubs();
        const workflows = [];
        for (const hub of hubs) {
            if (!hub.hasPublicWorkflows)
                continue;
            try {
                const hubWorkflows = await this.queryHubWorkflows(hub.processId, {
                    capabilities: [capability],
                });
                workflows.push(...hubWorkflows);
            }
            catch (error) {
                console.warn(`Failed to query workflows from hub ${hub.processId}:`, error);
            }
        }
        return this.rankWorkflows(workflows);
    }
    /**
     * Discover all Permamind hubs in the network
     */
    async discoverHubs(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh &&
            now - this.lastDiscoveryTime < this.discoveryInterval) {
            return Array.from(this.discoveredHubs.values());
        }
        try {
            // Get all registered zones from the hub registry
            const zones = await getZones(HUB_REGISTRY_ID(), "{}", 0, 100);
            const hubs = [];
            for (const zone of zones) {
                try {
                    // Check if this hub has public workflows
                    const processId = zone.spec?.processId;
                    if (processId) {
                        const hubInfo = await this.queryHubInfo(processId);
                        if (hubInfo) {
                            hubs.push(hubInfo);
                            this.discoveredHubs.set(processId, hubInfo);
                        }
                    }
                }
                catch (error) {
                    // Skip unreachable or non-responsive hubs
                    const processId = zone.spec?.processId || "unknown";
                    console.warn(`Failed to query hub ${processId}:`, error);
                }
            }
            this.lastDiscoveryTime = now;
            return hubs;
        }
        catch (error) {
            console.error("Failed to discover hubs:", error);
            return Array.from(this.discoveredHubs.values());
        }
    }
    /**
     * Find workflows similar to a local workflow
     */
    async findSimilarWorkflows(localWorkflowId, hubId) {
        try {
            // Get the local workflow details
            const localWorkflows = await aiMemoryService.searchAdvanced(hubId, "", {
                memoryType: "workflow",
            });
            const localWorkflow = localWorkflows.find((w) => w.workflowId === localWorkflowId);
            if (!localWorkflow) {
                throw new Error(`Local workflow ${localWorkflowId} not found`);
            }
            // Search across network for workflows with similar capabilities
            const similarWorkflows = [];
            for (const capability of localWorkflow.capabilities || []) {
                const workflows = await this.discoverByCapability(capability);
                similarWorkflows.push(...workflows);
            }
            // Remove duplicates and filter by similarity
            const uniqueWorkflows = this.removeDuplicates(similarWorkflows);
            return this.filterBySimilarity(uniqueWorkflows, localWorkflow);
        }
        catch (error) {
            console.error("Failed to find similar workflows:", error);
            return [];
        }
    }
    /**
     * Find workflows that can fulfill specific requirements
     */
    async findWorkflowsForRequirements(requirements) {
        const hubs = await this.discoverHubs();
        const workflows = [];
        for (const hub of hubs) {
            if (!hub.hasPublicWorkflows)
                continue;
            try {
                const hubWorkflows = await this.queryHubWorkflows(hub.processId, {
                    requirements,
                });
                workflows.push(...hubWorkflows);
            }
            catch (error) {
                console.warn(`Failed to query workflows from hub ${hub.processId}:`, error);
            }
        }
        return this.rankWorkflows(workflows);
    }
    /**
     * Get network statistics
     */
    async getNetworkStatistics() {
        // Check cache first - cache for 5 minutes
        const cacheKey = "network_statistics";
        const cachedStats = this.statisticsCache.get(cacheKey);
        if (cachedStats && Date.now() - cachedStats.timestamp < 300000) {
            return cachedStats.data;
        }
        // Add timeout wrapper with shorter timeouts
        const withTimeout = (promise, timeoutMs) => {
            return Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)),
            ]);
        };
        try {
            // Get hubs with much shorter timeout
            const hubs = await withTimeout(this.discoverHubs(), 10000); // 10s timeout
            // For speed, limit to first 10 most active hubs and use sampling
            const activeHubs = hubs
                .filter((hub) => hub.hasPublicWorkflows)
                .sort((a, b) => b.workflowCount - a.workflowCount)
                .slice(0, 10); // Only check top 10 hubs
            const allWorkflows = [];
            // Process all hubs in parallel with much shorter timeout per hub
            const concurrencyLimit = 10; // Increase concurrency
            const workflowPromises = activeHubs.map(async (hub) => {
                try {
                    return await withTimeout(this.queryHubWorkflows(hub.processId), 5000);
                }
                catch (error) {
                    console.warn(`Failed to query hub ${hub.processId}:`, error);
                    return [];
                }
            });
            // Process all in one batch since we limited to 10 hubs
            const allResults = await Promise.all(workflowPromises);
            allResults.forEach((workflows) => allWorkflows.push(...workflows));
            const totalHubs = hubs.length;
            const totalPublicWorkflows = allWorkflows.length;
            const averageReputationScore = allWorkflows.length > 0
                ? allWorkflows.reduce((sum, w) => sum + w.reputationScore, 0) /
                    allWorkflows.length
                : 0;
            // Count capability frequency
            const capabilityCount = new Map();
            allWorkflows.forEach((w) => {
                w.capabilities.forEach((cap) => {
                    capabilityCount.set(cap, (capabilityCount.get(cap) || 0) + 1);
                });
            });
            const topCapabilities = Array.from(capabilityCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([cap]) => cap);
            const networkHealthScore = Math.min(1.0, totalHubs * 0.1 +
                totalPublicWorkflows * 0.05 +
                averageReputationScore * 0.5);
            const result = {
                averageReputationScore,
                networkHealthScore,
                topCapabilities,
                totalHubs,
                totalPublicWorkflows,
            };
            // Cache the result for 5 minutes
            this.statisticsCache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
            });
            return result;
        }
        catch (error) {
            console.warn("Failed to get network statistics:", error);
            // Return cached data if available, even if stale
            if (cachedStats) {
                return cachedStats.data;
            }
            // Return minimal fallback statistics
            return {
                averageReputationScore: 0,
                networkHealthScore: 0,
                topCapabilities: [],
                totalHubs: 0,
                totalPublicWorkflows: 0,
            };
        }
    }
    /**
     * Get cached network statistics instantly (no network calls)
     */
    getCachedNetworkStatistics() {
        const cacheKey = "network_statistics";
        const cachedStats = this.statisticsCache.get(cacheKey);
        return cachedStats ? cachedStats.data : null;
    }
    /**
     * Request enhancement patterns from a high-performing workflow using Velocity protocol
     */
    async requestEnhancementPatterns(sourceHubId, sourceWorkflowId) {
        try {
            // Use fetchEvents to get enhancement memories for this workflow
            const enhancementFilter = {
                kinds: ["10"], // AI_MEMORY events
                limit: 50,
                tags: {
                    ai_tag: ["public", "shareable"], // Only publicly shareable enhancements
                    ai_type: ["enhancement"],
                    workflow_id: [sourceWorkflowId],
                },
            };
            const filterString = JSON.stringify([enhancementFilter]);
            const events = await fetchEvents(sourceHubId, filterString);
            return events.map((event, index) => {
                // Parse enhancement data from event
                let enhancementData = {};
                if (event.workflow_enhancement) {
                    try {
                        enhancementData =
                            typeof event.workflow_enhancement === "string"
                                ? JSON.parse(event.workflow_enhancement)
                                : event.workflow_enhancement;
                    }
                    catch (error) {
                        console.warn("Failed to parse enhancement data:", error);
                    }
                }
                // Extract capabilities this enhancement applies to
                const applicableCapabilities = [];
                if (event.workflow_capability) {
                    if (Array.isArray(event.workflow_capability)) {
                        applicableCapabilities.push(...event.workflow_capability);
                    }
                    else {
                        applicableCapabilities.push(event.workflow_capability);
                    }
                }
                return {
                    applicableToCapabilities: applicableCapabilities,
                    description: enhancementData.description ||
                        event.Content ||
                        "Performance improvement pattern",
                    impact: parseFloat(enhancementData.impact || event.enhancement_impact || "0.1"),
                    implementationHints: enhancementData.implementationHints || [
                        "Review current implementation for bottlenecks",
                        "Apply optimization incrementally",
                        "Monitor performance impact",
                    ],
                    patternId: `pattern_${sourceWorkflowId}_${event.Id || index}`,
                    riskLevel: (enhancementData.riskLevel ||
                        event.enhancement_risk ||
                        "low"),
                    sourceHubId,
                    sourceWorkflowId,
                    type: enhancementData.type || event.enhancement_type || "optimization",
                    validationSteps: enhancementData.validationSteps || [
                        "Test with sample data",
                        "Measure performance improvement",
                        "Validate output quality",
                    ],
                };
            });
        }
        catch (error) {
            console.error("Failed to request enhancement patterns:", error);
            return [];
        }
    }
    /**
     * Search workflows globally by query and filters
     */
    async searchGlobalWorkflows(query, filters = {}) {
        const hubs = await this.discoverHubs();
        const workflows = [];
        for (const hub of hubs) {
            if (!hub.hasPublicWorkflows)
                continue;
            // Skip hubs that don't meet reputation threshold
            if (filters.minReputationScore &&
                hub.reputationScore < filters.minReputationScore) {
                continue;
            }
            try {
                const hubWorkflows = await this.queryHubWorkflows(hub.processId, filters);
                const filteredWorkflows = hubWorkflows.filter((w) => this.matchesQuery(w, query));
                workflows.push(...filteredWorkflows);
            }
            catch (error) {
                console.warn(`Failed to search workflows in hub ${hub.processId}:`, error);
            }
        }
        return this.rankWorkflows(workflows, filters);
    }
    /**
     * Calculate reputation score for an event-based workflow
     */
    calculateEventReputationScore(event, performanceMetrics) {
        const performanceScore = performanceMetrics.qualityScore || 0.5;
        const reliabilityScore = performanceMetrics.successRate || 0.5;
        const usageScore = Math.min(1.0, parseInt(event.ai_access_count || "0") / 100);
        const enhancementScore = event.workflow_enhancement ? 0.8 : 0.2;
        const importanceScore = parseFloat(event.ai_importance || "0.5");
        return (performanceScore * 0.3 +
            reliabilityScore * 0.25 +
            usageScore * 0.2 +
            enhancementScore * 0.15 +
            importanceScore * 0.1);
    }
    /**
     * Calculate overlap between two arrays
     */
    calculateOverlap(arr1, arr2) {
        if (arr1.length === 0 || arr2.length === 0)
            return 0;
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        const intersection = new Set([...set1].filter((x) => set2.has(x)));
        return intersection.size / Math.max(set1.size, set2.size);
    }
    /**
     * Calculate reputation score for a workflow (legacy method)
     */
    calculateReputationScore(workflow, performance) {
        const performanceScore = performance.qualityScore || 0.5;
        const reliabilityScore = performance.success ? 1.0 : 0.0;
        const usageScore = Math.min(1.0, (workflow.metadata?.accessCount || 0) / 100);
        const enhancementScore = workflow.enhancement ? 0.8 : 0.2;
        return (performanceScore * 0.4 +
            reliabilityScore * 0.3 +
            usageScore * 0.2 +
            enhancementScore * 0.1);
    }
    /**
     * Convert Velocity event to CrossHubWorkflow format
     */
    convertEventToCrossHubWorkflow(event, hubId) {
        // Extract workflow data from event tags
        const workflowId = event.workflow_id || event.Id;
        const name = event.workflow_id || `workflow-${event.Id.substring(0, 8)}`;
        const description = event.Content
            ? event.Content.substring(0, 200)
            : "Workflow description";
        // Parse capabilities from multiple workflow_capability tags
        const capabilities = [];
        if (event.workflow_capability) {
            if (Array.isArray(event.workflow_capability)) {
                capabilities.push(...event.workflow_capability);
            }
            else {
                capabilities.push(event.workflow_capability);
            }
        }
        // Parse requirements from multiple workflow_requirement tags
        const requirements = [];
        if (event.workflow_requirement) {
            if (Array.isArray(event.workflow_requirement)) {
                requirements.push(...event.workflow_requirement);
            }
            else {
                requirements.push(event.workflow_requirement);
            }
        }
        // Parse tags from ai_tag
        const tags = [];
        if (event.ai_tag) {
            if (Array.isArray(event.ai_tag)) {
                tags.push(...event.ai_tag);
            }
            else {
                tags.push(event.ai_tag);
            }
        }
        // Parse performance metrics
        let performanceMetrics = {
            averageExecutionTime: 0,
            enhancementCount: 0,
            qualityScore: 0.5,
            successRate: 0.5,
            userSatisfactionRating: 0.5,
        };
        if (event.workflow_performance) {
            try {
                const performance = typeof event.workflow_performance === "string"
                    ? JSON.parse(event.workflow_performance)
                    : event.workflow_performance;
                performanceMetrics = {
                    averageExecutionTime: performance.executionTime || 0,
                    enhancementCount: performance.enhancementCount || 0,
                    qualityScore: performance.qualityScore || 0.5,
                    successRate: performance.success ? 1.0 : 0.0,
                    userSatisfactionRating: performance.userSatisfaction || 0.5,
                };
            }
            catch (error) {
                console.warn("Failed to parse performance metrics:", error);
            }
        }
        // Calculate reputation score
        const reputationScore = this.calculateEventReputationScore(event, performanceMetrics);
        return {
            capabilities,
            createdAt: event.Timestamp || new Date().toISOString(),
            description,
            hubId,
            isPublic: tags.includes("public") || tags.includes("discoverable"),
            lastEnhancementDate: event.workflow_enhancement ? event.Timestamp : "",
            name,
            ownerAddress: event.p || event.From || "",
            performanceMetrics,
            reputationScore,
            requirements,
            tags,
            usageCount: parseInt(event.ai_access_count || "0"),
            workflowId,
        };
    }
    /**
     * Convert WorkflowMemory to CrossHubWorkflow format (legacy method)
     */
    convertToCrossHubWorkflow(workflow, hubId) {
        const performance = workflow.performance || {};
        return {
            capabilities: workflow.capabilities || [],
            createdAt: workflow.metadata?.lastAccessed || new Date().toISOString(),
            description: workflow.content.substring(0, 200),
            hubId,
            isPublic: this.isWorkflowPublic(workflow),
            lastEnhancementDate: workflow.enhancement?.validation?.validatedAt ||
                workflow.metadata?.lastAccessed ||
                "",
            name: workflow.workflowId,
            ownerAddress: workflow.p,
            performanceMetrics: {
                averageExecutionTime: performance.executionTime || 0,
                enhancementCount: workflow.enhancement ? 1 : 0,
                qualityScore: performance.qualityScore || 0.5,
                successRate: performance.success ? 1.0 : 0.0,
                userSatisfactionRating: performance.userSatisfaction || 0.5,
            },
            reputationScore: this.calculateReputationScore(workflow, performance),
            requirements: workflow.requirements || [],
            tags: workflow.metadata?.tags || [],
            usageCount: workflow.metadata?.accessCount || 0,
            workflowId: workflow.workflowId,
        };
    }
    /**
     * Filter workflows by similarity to a local workflow
     */
    filterBySimilarity(workflows, localWorkflow) {
        return workflows.filter((workflow) => {
            // Check capability overlap
            const capabilityOverlap = this.calculateOverlap(workflow.capabilities, localWorkflow.capabilities || []);
            // Check requirement overlap
            const requirementOverlap = this.calculateOverlap(workflow.requirements, localWorkflow.requirements || []);
            // Require at least 30% overlap in capabilities or requirements
            return capabilityOverlap >= 0.3 || requirementOverlap >= 0.3;
        });
    }
    /**
     * Check if a workflow is publicly discoverable
     */
    isWorkflowPublic(workflow) {
        // Check metadata tags for public visibility
        const tags = workflow.metadata?.tags || [];
        return tags.includes("public") || tags.includes("discoverable");
    }
    /**
     * Apply additional filters that couldn't be applied at the Velocity level
     */
    matchesAdditionalFilters(workflow, filters) {
        // Apply reputation score filter
        if (filters.minReputationScore &&
            workflow.reputationScore < filters.minReputationScore) {
            return false;
        }
        // Apply performance score filter
        if (filters.minPerformanceScore &&
            workflow.performanceMetrics.qualityScore < filters.minPerformanceScore) {
            return false;
        }
        // Apply open source filter
        if (filters.onlyOpenSource && !workflow.tags.includes("open-source")) {
            return false;
        }
        return true;
    }
    /**
     * Check if workflow matches discovery filters
     */
    matchesFilters(workflow, filters) {
        if (filters.capabilities) {
            const hasCapability = filters.capabilities.some((cap) => workflow.capabilities?.includes(cap));
            if (!hasCapability)
                return false;
        }
        if (filters.requirements) {
            const meetsRequirement = filters.requirements.every((req) => workflow.requirements?.includes(req));
            if (!meetsRequirement)
                return false;
        }
        if (filters.tags) {
            const hasTags = filters.tags.some((tag) => workflow.metadata?.tags?.includes(tag));
            if (!hasTags)
                return false;
        }
        if (filters.minPerformanceScore && workflow.performance) {
            if ((workflow.performance.qualityScore || 0) < filters.minPerformanceScore) {
                return false;
            }
        }
        return true;
    }
    /**
     * Check if a workflow matches a search query
     */
    matchesQuery(workflow, query) {
        const searchText = [
            workflow.name,
            workflow.description,
            ...workflow.capabilities,
            ...workflow.tags,
        ]
            .join(" ")
            .toLowerCase();
        const queryTerms = query.toLowerCase().split(" ");
        return queryTerms.every((term) => searchText.includes(term));
    }
    /**
     * Query a specific hub for basic information using Velocity protocol
     */
    async queryHubInfo(hubId) {
        try {
            // Use fetchEvents to get workflow memories from this hub
            const workflowFilter = {
                kinds: ["10"], // AI_MEMORY events
                limit: 100,
                tags: {
                    ai_tag: ["public", "discoverable"], // Only public workflows
                    ai_type: ["workflow"],
                },
            };
            const filterString = JSON.stringify([workflowFilter]);
            const events = await fetchEvents(hubId, filterString);
            // Count public workflows
            const workflowCount = events.length;
            const hasPublicWorkflows = workflowCount > 0;
            // Calculate basic reputation score based on activity and quality
            let totalQuality = 0;
            let qualityCount = 0;
            for (const event of events) {
                try {
                    // Extract performance data from workflow events
                    const performanceTag = event.workflow_performance;
                    if (performanceTag) {
                        const performance = JSON.parse(performanceTag);
                        if (performance.qualityScore) {
                            totalQuality += performance.qualityScore;
                            qualityCount++;
                        }
                    }
                }
                catch {
                    // Skip events with invalid performance data
                }
            }
            const averageQuality = qualityCount > 0 ? totalQuality / qualityCount : 0.5;
            const activityScore = Math.min(1.0, workflowCount * 0.02); // Up to 50 workflows = max activity
            const reputationScore = averageQuality * 0.7 + activityScore * 0.3;
            return {
                hasPublicWorkflows,
                lastActivity: events.length > 0
                    ? events[0].Timestamp || new Date().toISOString()
                    : new Date().toISOString(),
                ownerAddress: events.length > 0 ? events[0].p || "" : "",
                processId: hubId,
                profile: {}, // Would be filled from profile events if needed
                reputationScore,
                workflowCount,
            };
        }
        catch (error) {
            console.warn(`Failed to query hub info for ${hubId}:`, error);
            return null;
        }
    }
    /**
     * Query workflows from a specific hub using Velocity protocol fetchEvents
     */
    async queryHubWorkflows(hubId, filters = {}) {
        try {
            // Check cache first
            const cacheKey = `${hubId}_${JSON.stringify(filters)}`;
            if (this.workflowCache.has(cacheKey)) {
                return this.workflowCache.get(cacheKey);
            }
            // Build filter for fetchEvents using Velocity protocol
            const velocityFilter = {
                kinds: ["10"], // AI_MEMORY events
                limit: filters.maxResponseTime
                    ? Math.min(filters.maxResponseTime / 10, 500)
                    : 100,
                tags: {
                    ai_tag: ["public", "discoverable"], // Only public workflows
                    ai_type: ["workflow"],
                },
            };
            // Add capability filters
            if (filters.capabilities && filters.capabilities.length > 0) {
                velocityFilter.tags.workflow_capability = filters.capabilities;
            }
            // Add requirement filters
            if (filters.requirements && filters.requirements.length > 0) {
                velocityFilter.tags.workflow_requirement = filters.requirements;
            }
            // Add tag filters
            if (filters.tags && filters.tags.length > 0) {
                // Add to existing ai_tag array
                velocityFilter.tags.ai_tag = [
                    ...velocityFilter.tags.ai_tag,
                    ...filters.tags,
                ];
            }
            const filterString = JSON.stringify([velocityFilter]);
            const events = await fetchEvents(hubId, filterString);
            const workflows = [];
            for (const event of events) {
                try {
                    // Convert event to CrossHubWorkflow format
                    const crossHubWorkflow = this.convertEventToCrossHubWorkflow(event, hubId);
                    // Apply additional filters that couldn't be done at the Velocity level
                    if (this.matchesAdditionalFilters(crossHubWorkflow, filters)) {
                        workflows.push(crossHubWorkflow);
                    }
                }
                catch (error) {
                    console.warn(`Failed to convert event to workflow:`, error);
                    continue;
                }
            }
            // Cache the results
            this.workflowCache.set(cacheKey, workflows);
            return workflows;
        }
        catch (error) {
            console.warn(`Failed to query workflows from hub ${hubId}:`, error);
            return [];
        }
    }
    /**
     * Rank workflows by relevance and reputation
     */
    rankWorkflows(workflows, filters = {}) {
        return workflows.sort((a, b) => {
            // Primary sort by reputation score
            const reputationDiff = b.reputationScore - a.reputationScore;
            if (Math.abs(reputationDiff) > 0.1)
                return reputationDiff;
            // Secondary sort by performance
            const performanceDiff = b.performanceMetrics.qualityScore - a.performanceMetrics.qualityScore;
            if (Math.abs(performanceDiff) > 0.05)
                return performanceDiff;
            // Tertiary sort by usage count
            return b.usageCount - a.usageCount;
        });
    }
    /**
     * Remove duplicate workflows from results
     */
    removeDuplicates(workflows) {
        const seen = new Set();
        return workflows.filter((workflow) => {
            const key = `${workflow.hubId}_${workflow.workflowId}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
}
