/**
 * Comprehensive analytics service for workflow ecosystem insights
 * Provides metrics, trends, and recommendations for workflow optimization
 */
export class WorkflowAnalyticsService {
    analyticsCache = new Map();
    enhancementHistory = new Map();
    performanceTracker;
    relationshipManager;
    workflowMemories = new Map();
    constructor(performanceTracker, relationshipManager) {
        this.performanceTracker = performanceTracker;
        this.relationshipManager = relationshipManager;
    }
    /**
     * Track enhancement for analytics
     */
    addEnhancement(workflowId, enhancement) {
        const enhancements = this.enhancementHistory.get(workflowId) || [];
        enhancements.push(enhancement);
        this.enhancementHistory.set(workflowId, enhancements);
        // Keep only recent enhancements (last 500)
        if (enhancements.length > 500) {
            enhancements.splice(0, enhancements.length - 500);
        }
    }
    /**
     * Track workflow memory for analytics
     */
    addWorkflowMemory(workflowId, memory) {
        const memories = this.workflowMemories.get(workflowId) || [];
        memories.push(memory);
        this.workflowMemories.set(workflowId, memories);
        // Keep only recent memories (last 1000)
        if (memories.length > 1000) {
            memories.splice(0, memories.length - 1000);
        }
    }
    /**
     * Clear analytics cache
     */
    clearCache() {
        this.analyticsCache.clear();
    }
    /**
     * Generate optimization recommendations
     */
    generateRecommendations(workflowId) {
        const recommendations = [];
        const analytics = this.getWorkflowAnalytics(workflowId);
        const enhancement = this.getEnhancementEffectiveness(workflowId);
        const collaboration = this.getCollaborationMetrics();
        const learning = this.getLearningEfficiency(workflowId);
        // Performance-based recommendations
        if (analytics.workflowDistribution &&
            analytics.workflowDistribution["analysis"] > 0) {
            const lowPerformers = Object.entries(analytics.workflowDistribution)
                .filter(([category, count]) => count > 0)
                .map(([category]) => category);
            if (lowPerformers.length > 0) {
                recommendations.push(`Focus optimization efforts on ${lowPerformers.join(", ")} workflows`);
            }
        }
        // Enhancement effectiveness recommendations
        if (enhancement.successRate < 0.6) {
            recommendations.push("Improve enhancement validation process - current success rate is below 60%");
        }
        if (enhancement.averageImpact < 0.3) {
            recommendations.push("Target higher-impact enhancements - current average impact is low");
        }
        // Collaboration recommendations
        if (collaboration.networkDensity < 0.3) {
            recommendations.push("Increase workflow collaboration - network density is low");
        }
        if (collaboration.peerLearning < 5) {
            recommendations.push("Encourage more peer learning between workflows");
        }
        // Learning efficiency recommendations
        if (learning.learningRate < 1) {
            recommendations.push("Increase learning frequency - currently less than 1 improvement per day");
        }
        if (learning.knowledgeRetention < 0.7) {
            recommendations.push("Improve knowledge retention mechanisms");
        }
        if (learning.transferEfficiency < 0.3) {
            recommendations.push("Enhance cross-workflow knowledge transfer");
        }
        // Workflow-specific recommendations
        if (workflowId) {
            const workflowRecommendations = this.performanceTracker.generateOptimizationRecommendations(workflowId);
            recommendations.push(...workflowRecommendations.recommendations);
        }
        // Default recommendations if none generated
        if (recommendations.length === 0) {
            recommendations.push("Continue monitoring workflow performance", "Explore new enhancement opportunities", "Maintain current optimization practices");
        }
        return recommendations.slice(0, 10); // Limit to top 10 recommendations
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        const entries = this.analyticsCache.size;
        const now = Date.now();
        let oldestEntry = now;
        for (const [key, value] of this.analyticsCache.entries()) {
            if (value.timestamp < oldestEntry) {
                oldestEntry = value.timestamp;
            }
        }
        return {
            entries,
            oldestEntry: now - oldestEntry,
            totalSize: entries * 1024, // Rough estimate
        };
    }
    /**
     * Get collaboration metrics for the ecosystem
     */
    getCollaborationMetrics() {
        const ecosystemOverview = this.relationshipManager.getEcosystemOverview();
        // Calculate workflow sharing (workflows with outgoing relationships)
        const workflowSharing = ecosystemOverview.totalWorkflows -
            ecosystemOverview.isolatedWorkflows.length;
        // Calculate knowledge exchange (relationship-based)
        const knowledgeExchange = Math.floor(ecosystemOverview.totalRelationships * 0.3); // Estimate
        // Calculate peer learning events
        const peerLearning = Array.from(this.enhancementHistory.values())
            .flat()
            .filter((e) => this.inferEnhancementSource(e) === "peer").length;
        // Calculate network density
        const maxPossibleConnections = ecosystemOverview.totalWorkflows * (ecosystemOverview.totalWorkflows - 1);
        const networkDensity = maxPossibleConnections > 0
            ? ecosystemOverview.totalRelationships / maxPossibleConnections
            : 0;
        // Calculate influence score (based on hub workflows)
        const influenceScore = ecosystemOverview.totalWorkflows > 0
            ? ecosystemOverview.hubWorkflows.length /
                ecosystemOverview.totalWorkflows
            : 0;
        return {
            influenceScore: Math.min(1, influenceScore),
            knowledgeExchange,
            networkDensity: Math.min(1, networkDensity),
            peerLearning,
            workflowSharing,
        };
    }
    /**
     * Get workflow ecosystem health score
     */
    getEcosystemHealthScore() {
        const analytics = this.getWorkflowAnalytics();
        const enhancement = this.getEnhancementEffectiveness();
        const collaboration = this.getCollaborationMetrics();
        const learning = this.getLearningEfficiency();
        const scores = [
            enhancement.successRate,
            enhancement.averageImpact,
            collaboration.networkDensity,
            collaboration.influenceScore,
            learning.knowledgeRetention,
            learning.transferEfficiency,
            Math.min(1, learning.learningRate / 2), // Normalize learning rate
        ];
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
    /**
     * Get enhancement effectiveness analysis
     */
    getEnhancementEffectiveness(workflowId) {
        const allEnhancements = workflowId
            ? this.enhancementHistory.get(workflowId) || []
            : Array.from(this.enhancementHistory.values()).flat();
        const successful = allEnhancements.filter((e) => (e.actualImpact || 0) > 0);
        const totalImpact = allEnhancements.reduce((sum, e) => sum + (e.actualImpact || 0), 0);
        const byType = {};
        const bySource = {};
        // Calculate by type
        for (const type of this.getEnhancementTypes()) {
            const typeEnhancements = allEnhancements.filter((e) => e.type === type);
            const typeSuccessful = typeEnhancements.filter((e) => (e.actualImpact || 0) > 0);
            byType[type] = {
                averageImpact: typeEnhancements.length > 0
                    ? typeEnhancements.reduce((sum, e) => sum + (e.actualImpact || 0), 0) / typeEnhancements.length
                    : 0,
                count: typeEnhancements.length,
                successRate: typeEnhancements.length > 0
                    ? typeSuccessful.length / typeEnhancements.length
                    : 0,
            };
        }
        // Calculate by source (simplified - would need to track source in enhancements)
        const sources = [
            "self",
            "peer",
            "user",
            "analytics",
            "error",
            "emergent",
        ];
        for (const source of sources) {
            const sourceEnhancements = allEnhancements.filter((e) => this.inferEnhancementSource(e) === source);
            const sourceSuccessful = sourceEnhancements.filter((e) => (e.actualImpact || 0) > 0);
            bySource[source] = {
                averageImpact: sourceEnhancements.length > 0
                    ? sourceEnhancements.reduce((sum, e) => sum + (e.actualImpact || 0), 0) / sourceEnhancements.length
                    : 0,
                count: sourceEnhancements.length,
                successRate: sourceEnhancements.length > 0
                    ? sourceSuccessful.length / sourceEnhancements.length
                    : 0,
            };
        }
        return {
            averageImpact: allEnhancements.length > 0 ? totalImpact / allEnhancements.length : 0,
            bySource,
            byType,
            successRate: allEnhancements.length > 0
                ? successful.length / allEnhancements.length
                : 0,
        };
    }
    /**
     * Calculate learning efficiency metrics
     */
    getLearningEfficiency(workflowId) {
        const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        const now = Date.now();
        const windowStart = now - timeWindow;
        const recentEnhancements = workflowId
            ? (this.enhancementHistory.get(workflowId) || []).filter((e) => new Date(e.validation.validatedAt).getTime() > windowStart)
            : Array.from(this.enhancementHistory.values())
                .flat()
                .filter((e) => new Date(e.validation.validatedAt).getTime() > windowStart);
        // Learning rate: improvements per day
        const learningRate = recentEnhancements.length / 7;
        // Knowledge retention: successful enhancements that had lasting impact
        const retainedKnowledge = recentEnhancements.filter((e) => (e.actualImpact || 0) > 0.1 && e.validation.confidence > 0.7).length;
        const knowledgeRetention = recentEnhancements.length > 0
            ? retainedKnowledge / recentEnhancements.length
            : 0;
        // Transfer efficiency: cross-domain learning success
        const crossDomainEnhancements = recentEnhancements.filter((e) => this.inferEnhancementSource(e) === "peer" ||
            this.inferEnhancementSource(e) === "emergent");
        const transferEfficiency = recentEnhancements.length > 0
            ? crossDomainEnhancements.length / recentEnhancements.length
            : 0;
        // Adaptability: how well workflows adapt to new situations
        const adaptabilityScore = this.calculateAdaptabilityScore(workflowId);
        return {
            adaptabilityScore,
            knowledgeRetention,
            learningRate,
            transferEfficiency,
        };
    }
    // Private helper methods
    /**
     * Calculate performance trends over time
     */
    getPerformanceTrends(workflowId, timeWindow = "7d") {
        const stats = this.performanceTracker.getPerformanceStats(workflowId);
        return stats.trend;
    }
    /**
     * Get comprehensive workflow analytics
     */
    getWorkflowAnalytics(workflowId, participantId, timeWindow = "7d") {
        const cacheKey = `analytics_${workflowId || "all"}_${participantId || "all"}_${timeWindow}`;
        const cached = this.analyticsCache.get(cacheKey);
        // Return cached data if less than 5 minutes old
        if (cached && Date.now() - cached.timestamp < 300000) {
            return cached.data;
        }
        const analytics = this.calculateWorkflowAnalytics(workflowId, participantId, timeWindow);
        // Cache the result
        this.analyticsCache.set(cacheKey, {
            data: analytics,
            timestamp: Date.now(),
        });
        return analytics;
    }
    calculateAdaptabilityScore(workflowId) {
        // Calculate how well workflows adapt to new situations
        // This would analyze performance across different contexts and conditions
        const recentEnhancements = workflowId
            ? this.enhancementHistory.get(workflowId) || []
            : Array.from(this.enhancementHistory.values()).flat();
        if (recentEnhancements.length === 0)
            return 0.5;
        // Count different types of adaptations
        const adaptationTypes = new Set(recentEnhancements.map((e) => e.type));
        const maxAdaptationTypes = this.getEnhancementTypes().length;
        // Score based on diversity of adaptation types and success rate
        const diversityScore = adaptationTypes.size / maxAdaptationTypes;
        const successfulAdaptations = recentEnhancements.filter((e) => (e.actualImpact || 0) > 0);
        const successScore = recentEnhancements.length > 0
            ? successfulAdaptations.length / recentEnhancements.length
            : 0;
        return (diversityScore + successScore) / 2;
    }
    calculateWorkflowAnalytics(workflowId, participantId, timeWindow = "7d") {
        // This would integrate with the actual memory analytics
        const baseAnalytics = {
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
        // Calculate workflow-specific analytics
        const workflowDistribution = this.calculateWorkflowDistribution();
        const enhancementEffectiveness = this.getEnhancementEffectiveness(workflowId);
        const performanceTrends = workflowId
            ? this.getPerformanceTrends(workflowId, timeWindow)
            : [];
        const collaborationMetrics = this.getCollaborationMetrics();
        const learningEfficiency = this.getLearningEfficiency(workflowId);
        return {
            ...baseAnalytics,
            collaborationMetrics,
            enhancementEffectiveness,
            learningEfficiency,
            performanceTrends,
            workflowDistribution,
        };
    }
    calculateWorkflowDistribution() {
        const distribution = {
            analysis: 0,
            automation: 0,
            communication: 0,
            coordination: 0,
            creative: 0,
            data_processing: 0,
            decision_making: 0,
            monitoring: 0,
            optimization: 0,
            problem_solving: 0,
        };
        // Analyze actual workflow memories to categorize workflows
        for (const workflowList of this.workflowMemories.values()) {
            for (const workflow of workflowList) {
                const category = this.categorizeWorkflow(workflow);
                if (category &&
                    Object.prototype.hasOwnProperty.call(distribution, category)) {
                    distribution[category]++;
                }
            }
        }
        return distribution;
    }
    categorizeWorkflow(workflow) {
        const content = workflow.content.toLowerCase();
        const capabilities = workflow.capabilities || [];
        const requirements = workflow.requirements || [];
        // Analyze content and capabilities to determine category
        const keywords = {
            analysis: [
                "analyze",
                "research",
                "investigate",
                "study",
                "examine",
                "evaluate",
            ],
            automation: [
                "automate",
                "schedule",
                "batch",
                "trigger",
                "workflow",
                "pipeline",
            ],
            communication: [
                "notify",
                "email",
                "message",
                "alert",
                "communicate",
                "broadcast",
            ],
            coordination: [
                "coordinate",
                "orchestrate",
                "manage",
                "sync",
                "align",
                "integrate",
            ],
            creative: [
                "generate",
                "create",
                "design",
                "compose",
                "brainstorm",
                "innovate",
            ],
            data_processing: [
                "process",
                "transform",
                "parse",
                "filter",
                "aggregate",
                "clean",
            ],
            decision_making: [
                "decide",
                "choose",
                "select",
                "prioritize",
                "recommend",
                "classify",
            ],
            monitoring: ["monitor", "track", "watch", "observe", "check", "measure"],
            optimization: [
                "optimize",
                "improve",
                "enhance",
                "tune",
                "refine",
                "accelerate",
            ],
            problem_solving: [
                "solve",
                "fix",
                "resolve",
                "troubleshoot",
                "debug",
                "diagnose",
            ],
        };
        // Score each category
        const scores = {};
        for (const [category, terms] of Object.entries(keywords)) {
            let score = 0;
            // Check content
            score += terms.filter((term) => content.includes(term)).length * 2;
            // Check capabilities
            score +=
                capabilities.filter((cap) => terms.some((term) => cap.toLowerCase().includes(term))).length * 3;
            // Check requirements
            score += requirements.filter((req) => terms.some((term) => req.toLowerCase().includes(term))).length;
            scores[category] = score;
        }
        // Return category with highest score, or null if no clear category
        const maxScore = Math.max(...Object.values(scores));
        if (maxScore === 0)
            return null;
        return (Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || null);
    }
    getEnhancementTypes() {
        return [
            "optimization",
            "bug_fix",
            "feature_add",
            "refactor",
            "parameter_tune",
            "logic_improve",
            "error_handling",
            "user_experience",
        ];
    }
    inferEnhancementSource(enhancement) {
        // Infer source from enhancement characteristics
        if (enhancement.description.includes("error") ||
            enhancement.type === "bug_fix") {
            return "error";
        }
        if (enhancement.description.includes("user") ||
            enhancement.type === "user_experience") {
            return "user";
        }
        if (enhancement.description.includes("peer") ||
            enhancement.description.includes("adapted")) {
            return "peer";
        }
        if (enhancement.description.includes("analytics") ||
            enhancement.type === "optimization") {
            return "analytics";
        }
        if (enhancement.description.includes("composition") ||
            enhancement.description.includes("emergent")) {
            return "emergent";
        }
        return "self";
    }
}
