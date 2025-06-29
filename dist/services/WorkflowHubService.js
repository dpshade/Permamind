import { fetchEvents } from "../relay.js";
// Dedicated workflow hub for all workflow discovery
const WORKFLOW_HUB_ID = "HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg";
/**
 * Simplified workflow discovery service for single dedicated workflow hub
 * Applies progressive broad-to-narrow search strategy based on Claude Desktop learnings
 */
export class WorkflowHubService {
    workflowCache = new Map();
    statisticsCache = null;
    cacheTimeout = 120000; // 2 minutes
    statsTimeout = 300000; // 5 minutes
    /**
     * Progressive workflow discovery - starts broad, narrows when needed
     * Applies Claude Desktop learning: broad capability search first
     */
    async findWorkflows(query, filters = {}) {
        // Stage 1: Extract primary capability for broad search
        const primaryCapability = this.extractPrimaryCapability(query);
        // Stage 2: Broad capability-based search
        const broadResults = await this.searchByCapability(primaryCapability, filters);
        // Stage 3: Quality threshold check - early return if good broad results
        const highQualityBroad = broadResults.filter(w => w.reputationScore > 0.75);
        if (highQualityBroad.length >= 3) {
            // Return high-quality broad results immediately
            return this.rankWorkflows(highQualityBroad);
        }
        // Stage 4: Specific search if broad results insufficient
        const specificResults = await this.searchByQuery(query, filters);
        // Stage 5: Intelligent merging of broad and specific results
        return this.mergeAndRankResults(broadResults, specificResults);
    }
    /**
     * Search workflows by specific capability
     */
    async searchByCapability(capability, filters = {}) {
        const cacheKey = `capability_${capability}_${JSON.stringify(filters)}`;
        // Check cache first
        if (this.workflowCache.has(cacheKey)) {
            return this.workflowCache.get(cacheKey);
        }
        try {
            const velocityFilter = {
                kinds: ["10"], // AI_MEMORY events
                limit: 100,
                tags: {
                    ai_type: ["workflow"],
                    ai_tag: ["public", "discoverable"],
                    workflow_capability: [capability],
                },
            };
            // Add additional filters
            this.applyFiltersToVelocityQuery(velocityFilter, filters);
            const filterString = JSON.stringify([velocityFilter]);
            const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);
            const workflows = events
                .map(event => this.convertEventToWorkflow(event))
                .filter(workflow => this.matchesAdditionalFilters(workflow, filters));
            // Cache results
            this.workflowCache.set(cacheKey, workflows);
            setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);
            return workflows;
        }
        catch (error) {
            console.warn(`Failed to search by capability ${capability}:`, error);
            return [];
        }
    }
    /**
     * Search workflows by text query
     */
    async searchByQuery(query, filters = {}) {
        const cacheKey = `query_${query}_${JSON.stringify(filters)}`;
        // Check cache first
        if (this.workflowCache.has(cacheKey)) {
            return this.workflowCache.get(cacheKey);
        }
        try {
            const velocityFilter = {
                kinds: ["10"], // AI_MEMORY events
                limit: 200,
                tags: {
                    ai_type: ["workflow"],
                    ai_tag: ["public", "discoverable"],
                },
            };
            // Add additional filters
            this.applyFiltersToVelocityQuery(velocityFilter, filters);
            const filterString = JSON.stringify([velocityFilter]);
            const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);
            const workflows = events
                .map(event => this.convertEventToWorkflow(event))
                .filter(workflow => this.matchesQuery(workflow, query))
                .filter(workflow => this.matchesAdditionalFilters(workflow, filters));
            // Cache results
            this.workflowCache.set(cacheKey, workflows);
            setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);
            return workflows;
        }
        catch (error) {
            console.warn(`Failed to search by query ${query}:`, error);
            return [];
        }
    }
    /**
     * Search workflows by requirements
     */
    async searchByRequirements(requirements, filters = {}) {
        const cacheKey = `requirements_${requirements.join(",")}_${JSON.stringify(filters)}`;
        if (this.workflowCache.has(cacheKey)) {
            return this.workflowCache.get(cacheKey);
        }
        try {
            const velocityFilter = {
                kinds: ["10"],
                limit: 100,
                tags: {
                    ai_type: ["workflow"],
                    ai_tag: ["public", "discoverable"],
                    workflow_requirement: requirements,
                },
            };
            this.applyFiltersToVelocityQuery(velocityFilter, filters);
            const filterString = JSON.stringify([velocityFilter]);
            const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);
            const workflows = events
                .map(event => this.convertEventToWorkflow(event))
                .filter(workflow => this.matchesAdditionalFilters(workflow, filters));
            this.workflowCache.set(cacheKey, workflows);
            setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);
            return workflows;
        }
        catch (error) {
            console.warn(`Failed to search by requirements:`, error);
            return [];
        }
    }
    /**
     * Get workflow hub statistics
     */
    async getHubStatistics() {
        // Check cache first
        if (this.statisticsCache && Date.now() - this.statisticsCache.timestamp < this.statsTimeout) {
            return this.statisticsCache.data;
        }
        try {
            const velocityFilter = {
                kinds: ["10"],
                limit: 500, // Higher limit for comprehensive stats
                tags: {
                    ai_type: ["workflow"],
                    ai_tag: ["public", "discoverable"],
                },
            };
            const filterString = JSON.stringify([velocityFilter]);
            const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);
            const workflows = events.map(event => this.convertEventToWorkflow(event));
            const totalPublicWorkflows = workflows.length;
            const averageReputationScore = workflows.length > 0
                ? workflows.reduce((sum, w) => sum + w.reputationScore, 0) / workflows.length
                : 0;
            // Count capability frequency
            const capabilityCount = new Map();
            workflows.forEach(w => {
                w.capabilities.forEach(cap => {
                    capabilityCount.set(cap, (capabilityCount.get(cap) || 0) + 1);
                });
            });
            const topCapabilities = Array.from(capabilityCount.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([cap]) => cap);
            const networkHealthScore = Math.min(1.0, totalPublicWorkflows * 0.02 + averageReputationScore * 0.8);
            const result = {
                averageReputationScore,
                networkHealthScore,
                topCapabilities,
                totalPublicWorkflows,
            };
            // Cache the result
            this.statisticsCache = {
                data: result,
                timestamp: Date.now(),
            };
            return result;
        }
        catch (error) {
            console.warn("Failed to get hub statistics:", error);
            // Return cached data if available, even if stale
            if (this.statisticsCache) {
                return this.statisticsCache.data;
            }
            // Return minimal fallback
            return {
                averageReputationScore: 0,
                networkHealthScore: 0,
                topCapabilities: [],
                totalPublicWorkflows: 0,
            };
        }
    }
    /**
     * Get cached statistics instantly (no network calls)
     */
    getCachedStatistics() {
        return this.statisticsCache?.data || null;
    }
    /**
     * Request enhancement patterns from a workflow
     */
    async getEnhancementPatterns(workflowId) {
        try {
            const enhancementFilter = {
                kinds: ["10"],
                limit: 50,
                tags: {
                    ai_tag: ["public", "shareable"],
                    ai_type: ["enhancement"],
                    workflow_id: [workflowId],
                },
            };
            const filterString = JSON.stringify([enhancementFilter]);
            const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);
            return events.map((event, index) => {
                let enhancementData = {};
                if (event.workflow_enhancement) {
                    try {
                        enhancementData = typeof event.workflow_enhancement === "string"
                            ? JSON.parse(event.workflow_enhancement)
                            : event.workflow_enhancement;
                    }
                    catch (error) {
                        console.warn("Failed to parse enhancement data:", error);
                    }
                }
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
                    description: enhancementData.description || event.Content || "Performance improvement pattern",
                    impact: parseFloat(enhancementData.impact || event.enhancement_impact || "0.1"),
                    implementationHints: enhancementData.implementationHints || [
                        "Review current implementation for bottlenecks",
                        "Apply optimization incrementally",
                        "Monitor performance impact",
                    ],
                    patternId: `pattern_${workflowId}_${event.Id || index}`,
                    riskLevel: (enhancementData.riskLevel || event.enhancement_risk || "low"),
                    sourceWorkflowId: workflowId,
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
            console.error("Failed to get enhancement patterns:", error);
            return [];
        }
    }
    /**
     * Get search suggestions for improving discovery
     */
    getSearchSuggestions(query, foundWorkflows) {
        const suggestions = [];
        if (foundWorkflows.length === 0) {
            suggestions.push(`Try searching for broader terms like "format-conversion", "data-processing", or "automation"`, `Search by capabilities like "transformation", "validation", or "analysis"`, `Use specific workflow names if you know them (e.g., "json-processor-v1")`);
        }
        else if (foundWorkflows.length < 3) {
            const capabilities = new Set();
            foundWorkflows.forEach(workflow => workflow.capabilities.forEach(cap => capabilities.add(cap)));
            if (capabilities.size > 0) {
                suggestions.push(`Try related capabilities: ${Array.from(capabilities).join(", ")}`, `Search for similar workflows using broader terms`);
            }
        }
        else {
            suggestions.push(`Found ${foundWorkflows.length} workflows! Consider filtering by performance or reputation.`, `Try the top-ranked workflows first for best results.`);
        }
        return suggestions;
    }
    /**
     * Extract primary capability from query for broad search
     * Implements Claude Desktop learning: start with general capability
     */
    extractPrimaryCapability(query) {
        const queryLower = query.toLowerCase();
        // Capability mapping: specific terms -> broad categories
        const capabilityMap = {
            // Data processing
            "json": "format-conversion",
            "xml": "format-conversion",
            "csv": "format-conversion",
            "parsing": "data-processing",
            "validation": "data-processing",
            "transformation": "data-processing",
            // Analysis and reporting
            "analysis": "data-analysis",
            "analytics": "data-analysis",
            "reporting": "data-analysis",
            "insights": "data-analysis",
            // Automation
            "automation": "workflow-automation",
            "orchestration": "workflow-automation",
            "pipeline": "workflow-automation",
            // Integration
            "api": "integration",
            "webhook": "integration",
            "connector": "integration",
        };
        // Find the first matching capability
        for (const [term, capability] of Object.entries(capabilityMap)) {
            if (queryLower.includes(term)) {
                return capability;
            }
        }
        // Default broad capability
        return "data-processing";
    }
    /**
     * Apply additional filters to Velocity query
     */
    applyFiltersToVelocityQuery(velocityFilter, filters) {
        if (filters.capabilities && filters.capabilities.length > 0) {
            velocityFilter.tags.workflow_capability = filters.capabilities;
        }
        if (filters.requirements && filters.requirements.length > 0) {
            velocityFilter.tags.workflow_requirement = filters.requirements;
        }
        if (filters.tags && filters.tags.length > 0) {
            velocityFilter.tags.ai_tag = [...velocityFilter.tags.ai_tag, ...filters.tags];
        }
    }
    /**
     * Check if workflow matches additional filters
     */
    matchesAdditionalFilters(workflow, filters) {
        if (filters.minReputationScore && workflow.reputationScore < filters.minReputationScore) {
            return false;
        }
        if (filters.minPerformanceScore && workflow.performanceMetrics.qualityScore < filters.minPerformanceScore) {
            return false;
        }
        if (filters.onlyOpenSource && !workflow.tags.includes("open-source")) {
            return false;
        }
        return true;
    }
    /**
     * Check if workflow matches text query
     */
    matchesQuery(workflow, query) {
        const searchText = [
            workflow.name,
            workflow.description,
            ...workflow.capabilities,
            ...workflow.tags,
        ].join(" ").toLowerCase();
        const queryTerms = query.toLowerCase().split(" ");
        return queryTerms.every(term => searchText.includes(term));
    }
    /**
     * Merge and rank results from broad and specific searches
     */
    mergeAndRankResults(broadResults, specificResults) {
        // Combine results and remove duplicates
        const allResults = [...broadResults];
        const seenIds = new Set(broadResults.map(w => w.workflowId));
        specificResults.forEach(workflow => {
            if (!seenIds.has(workflow.workflowId)) {
                allResults.push(workflow);
                seenIds.add(workflow.workflowId);
            }
        });
        return this.rankWorkflows(allResults);
    }
    /**
     * Rank workflows by relevance and reputation
     */
    rankWorkflows(workflows) {
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
     * Convert Velocity event to WorkflowResult format
     */
    convertEventToWorkflow(event) {
        const workflowId = event.workflow_id || event.Id;
        const name = event.workflow_id || `workflow-${event.Id.substring(0, 8)}`;
        const description = event.Content ? event.Content.substring(0, 200) : "Workflow description";
        // Parse capabilities
        const capabilities = [];
        if (event.workflow_capability) {
            if (Array.isArray(event.workflow_capability)) {
                capabilities.push(...event.workflow_capability);
            }
            else {
                capabilities.push(event.workflow_capability);
            }
        }
        // Parse requirements
        const requirements = [];
        if (event.workflow_requirement) {
            if (Array.isArray(event.workflow_requirement)) {
                requirements.push(...event.workflow_requirement);
            }
            else {
                requirements.push(event.workflow_requirement);
            }
        }
        // Parse tags
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
        const reputationScore = this.calculateReputationScore(event, performanceMetrics);
        return {
            capabilities,
            createdAt: event.Timestamp || new Date().toISOString(),
            description,
            hubId: WORKFLOW_HUB_ID,
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
     * Calculate reputation score for a workflow
     */
    calculateReputationScore(event, performanceMetrics) {
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
}
