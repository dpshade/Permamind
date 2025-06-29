import { fetchEvents } from "../relay.js";

// Dedicated workflow hub for all workflow discovery
const WORKFLOW_HUB_ID = "HwMaF8hOPt1xUBkDhI3k00INvr5t4d6V9dLmCGj5YYg";

export interface EnhancementPattern {
  applicableToCapabilities: string[];
  description: string;
  impact: number;
  implementationHints: string[];
  patternId: string;
  riskLevel: "high" | "low" | "medium";
  sourceWorkflowId: string;
  type: string;
  validationSteps: string[];
}

export interface SearchFilters {
  capabilities?: string[];
  maxResponseTime?: number;
  minPerformanceScore?: number;
  minReputationScore?: number;
  onlyOpenSource?: boolean;
  requirements?: string[];
  tags?: string[];
}

export interface WorkflowResult {
  capabilities: string[];
  createdAt: string;
  description: string;
  hubId: string;
  isPublic: boolean;
  lastEnhancementDate: string;
  name: string;
  ownerAddress: string;
  performanceMetrics: {
    averageExecutionTime: number;
    enhancementCount: number;
    qualityScore: number;
    successRate: number;
    userSatisfactionRating: number;
  };
  reputationScore: number;
  requirements: string[];
  tags: string[];
  usageCount: number;
  workflowId: string;
}

/**
 * Simplified workflow discovery service for single dedicated workflow hub
 * Applies progressive broad-to-narrow search strategy based on Claude Desktop learnings
 */
export class WorkflowHubService {
  private readonly cacheTimeout = 120000; // 2 minutes
  private statisticsCache: { data: any; timestamp: number } | null = null;
  private readonly statsTimeout = 300000; // 5 minutes
  private workflowCache = new Map<string, WorkflowResult[]>();

  /**
   * Progressive workflow discovery - starts broad, narrows when needed
   * Applies Claude Desktop learning: broad capability search first
   */
  async findWorkflows(
    query: string,
    filters: SearchFilters = {},
  ): Promise<WorkflowResult[]> {
    // Stage 1: Extract primary capability for broad search
    const primaryCapability = this.extractPrimaryCapability(query);

    // Stage 2: Broad capability-based search
    const broadResults = await this.searchByCapability(
      primaryCapability,
      filters,
    );

    // Stage 3: Quality threshold check - early return if good broad results
    const highQualityBroad = broadResults.filter(
      (w) => w.reputationScore > 0.75,
    );

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
   * Get cached statistics instantly (no network calls)
   */
  getCachedStatistics() {
    return this.statisticsCache?.data || null;
  }

  /**
   * Request enhancement patterns from a workflow
   */
  async getEnhancementPatterns(
    workflowId: string,
  ): Promise<EnhancementPattern[]> {
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

      return events.map((event: any, index: number) => {
        let enhancementData: any = {};
        if (event.workflow_enhancement) {
          try {
            enhancementData =
              typeof event.workflow_enhancement === "string"
                ? JSON.parse(event.workflow_enhancement)
                : event.workflow_enhancement;
          } catch (error) {
            console.warn("Failed to parse enhancement data:", error);
          }
        }

        const applicableCapabilities: string[] = [];
        if (event.workflow_capability) {
          if (Array.isArray(event.workflow_capability)) {
            applicableCapabilities.push(...event.workflow_capability);
          } else {
            applicableCapabilities.push(event.workflow_capability);
          }
        }

        return {
          applicableToCapabilities: applicableCapabilities,
          description:
            enhancementData.description ||
            event.Content ||
            "Performance improvement pattern",
          impact: parseFloat(
            enhancementData.impact || event.enhancement_impact || "0.1",
          ),
          implementationHints: enhancementData.implementationHints || [
            "Review current implementation for bottlenecks",
            "Apply optimization incrementally",
            "Monitor performance impact",
          ],
          patternId: `pattern_${workflowId}_${event.Id || index}`,
          riskLevel: (enhancementData.riskLevel ||
            event.enhancement_risk ||
            "low") as "high" | "low" | "medium",
          sourceWorkflowId: workflowId,
          type:
            enhancementData.type || event.enhancement_type || "optimization",
          validationSteps: enhancementData.validationSteps || [
            "Test with sample data",
            "Measure performance improvement",
            "Validate output quality",
          ],
        };
      });
    } catch (error) {
      console.error("Failed to get enhancement patterns:", error);
      return [];
    }
  }

  /**
   * Get workflow hub statistics
   */
  async getHubStatistics(): Promise<{
    averageReputationScore: number;
    networkHealthScore: number;
    topCapabilities: string[];
    totalPublicWorkflows: number;
  }> {
    // Check cache first
    if (
      this.statisticsCache &&
      Date.now() - this.statisticsCache.timestamp < this.statsTimeout
    ) {
      return this.statisticsCache.data;
    }

    try {
      const velocityFilter = {
        kinds: ["10"],
        limit: 500, // Higher limit for comprehensive stats
        tags: {
          ai_tag: ["public", "discoverable"],
          ai_type: ["workflow"],
        },
      };

      const filterString = JSON.stringify([velocityFilter]);
      const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);

      const workflows = events.map((event) =>
        this.convertEventToWorkflow(event),
      );

      const totalPublicWorkflows = workflows.length;
      const averageReputationScore =
        workflows.length > 0
          ? workflows.reduce((sum, w) => sum + w.reputationScore, 0) /
            workflows.length
          : 0;

      // Count capability frequency
      const capabilityCount = new Map<string, number>();
      workflows.forEach((w) => {
        w.capabilities.forEach((cap) => {
          capabilityCount.set(cap, (capabilityCount.get(cap) || 0) + 1);
        });
      });

      const topCapabilities = Array.from(capabilityCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cap]) => cap);

      const networkHealthScore = Math.min(
        1.0,
        totalPublicWorkflows * 0.02 + averageReputationScore * 0.8,
      );

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
    } catch (error) {
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
   * Get search suggestions for improving discovery
   */
  getSearchSuggestions(
    query: string,
    foundWorkflows: WorkflowResult[],
  ): string[] {
    const suggestions: string[] = [];

    if (foundWorkflows.length === 0) {
      suggestions.push(
        `Try searching for broader terms like "format-conversion", "data-processing", or "automation"`,
        `Search by capabilities like "transformation", "validation", or "analysis"`,
        `Use specific workflow names if you know them (e.g., "json-processor-v1")`,
      );
    } else if (foundWorkflows.length < 3) {
      const capabilities = new Set<string>();
      foundWorkflows.forEach((workflow) =>
        workflow.capabilities.forEach((cap) => capabilities.add(cap)),
      );

      if (capabilities.size > 0) {
        suggestions.push(
          `Try related capabilities: ${Array.from(capabilities).join(", ")}`,
          `Search for similar workflows using broader terms`,
        );
      }
    } else {
      suggestions.push(
        `Found ${foundWorkflows.length} workflows! Consider filtering by performance or reputation.`,
        `Try the top-ranked workflows first for best results.`,
      );
    }

    return suggestions;
  }

  /**
   * Search workflows by specific capability
   */
  async searchByCapability(
    capability: string,
    filters: SearchFilters = {},
  ): Promise<WorkflowResult[]> {
    const cacheKey = `capability_${capability}_${JSON.stringify(filters)}`;

    // Check cache first
    if (this.workflowCache.has(cacheKey)) {
      return this.workflowCache.get(cacheKey)!;
    }

    try {
      const velocityFilter: any = {
        kinds: ["10"], // AI_MEMORY events
        limit: 100,
        tags: {
          ai_tag: ["public", "discoverable"],
          ai_type: ["workflow"],
          workflow_capability: [capability],
        },
      };

      // Add additional filters
      this.applyFiltersToVelocityQuery(velocityFilter, filters);

      const filterString = JSON.stringify([velocityFilter]);

        `[WORKFLOW SEARCH DEBUG] Searching in hard-coded hub: ${WORKFLOW_HUB_ID}`,
      );

      const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);


      events.forEach((event: any, index) => {
          ai_tag: event.ai_tag,
          ai_type: event.ai_type,
          allTags: Object.keys(event).filter(
            (key) => key.startsWith("ai_") || key.startsWith("workflow_"),
          ),
          id: event.Id || event.id,
          memoryType: event.memoryType,
          workflow_capability: event.workflow_capability,
          workflow_id: event.workflow_id,
        });
      });

      const workflows = events
        .map((event) => this.convertEventToWorkflow(event))
        .filter((workflow) => this.matchesAdditionalFilters(workflow, filters));

      // Cache results
      this.workflowCache.set(cacheKey, workflows);
      setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);

      return workflows;
    } catch (error) {
      console.warn(`Failed to search by capability ${capability}:`, error);
      return [];
    }
  }

  /**
   * Search workflows by text query
   */
  async searchByQuery(
    query: string,
    filters: SearchFilters = {},
  ): Promise<WorkflowResult[]> {
    const cacheKey = `query_${query}_${JSON.stringify(filters)}`;

    // Check cache first
    if (this.workflowCache.has(cacheKey)) {
      return this.workflowCache.get(cacheKey)!;
    }

    try {
      const velocityFilter: any = {
        kinds: ["10"], // AI_MEMORY events
        limit: 200,
        tags: {
          ai_tag: ["public", "discoverable"],
          ai_type: ["workflow"],
        },
      };

      // Add additional filters
      this.applyFiltersToVelocityQuery(velocityFilter, filters);

      const filterString = JSON.stringify([velocityFilter]);

        `[WORKFLOW QUERY DEBUG] Searching in hard-coded hub: ${WORKFLOW_HUB_ID}`,
      );

      const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);

        `[WORKFLOW QUERY DEBUG] Found ${events.length} events before query filtering`,
      );

      events.slice(0, 3).forEach((event: any, index) => {
          ai_tag: event.ai_tag,
          ai_type: event.ai_type,
          allTags: Object.keys(event).filter(
            (key) => key.startsWith("ai_") || key.startsWith("workflow_"),
          ),
          content: event.Content?.substring(0, 100) + "...",
          id: event.Id || event.id,
          workflow_capability: event.workflow_capability,
          workflow_id: event.workflow_id,
        });
      });

      const workflows = events
        .map((event) => this.convertEventToWorkflow(event))
        .filter((workflow) => this.matchesQuery(workflow, query))
        .filter((workflow) => this.matchesAdditionalFilters(workflow, filters));

      // Cache results
      this.workflowCache.set(cacheKey, workflows);
      setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);

      return workflows;
    } catch (error) {
      console.warn(`Failed to search by query ${query}:`, error);
      return [];
    }
  }

  /**
   * Search workflows by requirements
   */
  async searchByRequirements(
    requirements: string[],
    filters: SearchFilters = {},
  ): Promise<WorkflowResult[]> {
    const cacheKey = `requirements_${requirements.join(",")}_${JSON.stringify(filters)}`;

    if (this.workflowCache.has(cacheKey)) {
      return this.workflowCache.get(cacheKey)!;
    }

    try {
      const velocityFilter: any = {
        kinds: ["10"],
        limit: 100,
        tags: {
          ai_tag: ["public", "discoverable"],
          ai_type: ["workflow"],
          workflow_requirement: requirements,
        },
      };

      this.applyFiltersToVelocityQuery(velocityFilter, filters);

      const filterString = JSON.stringify([velocityFilter]);
      const events = await fetchEvents(WORKFLOW_HUB_ID, filterString);

      const workflows = events
        .map((event) => this.convertEventToWorkflow(event))
        .filter((workflow) => this.matchesAdditionalFilters(workflow, filters));

      this.workflowCache.set(cacheKey, workflows);
      setTimeout(() => this.workflowCache.delete(cacheKey), this.cacheTimeout);

      return workflows;
    } catch (error) {
      console.warn(`Failed to search by requirements:`, error);
      return [];
    }
  }

  /**
   * Apply additional filters to Velocity query
   */
  private applyFiltersToVelocityQuery(
    velocityFilter: any,
    filters: SearchFilters,
  ): void {
    if (filters.capabilities && filters.capabilities.length > 0) {
      velocityFilter.tags.workflow_capability = filters.capabilities;
    }

    if (filters.requirements && filters.requirements.length > 0) {
      velocityFilter.tags.workflow_requirement = filters.requirements;
    }

    if (filters.tags && filters.tags.length > 0) {
      velocityFilter.tags.ai_tag = [
        ...velocityFilter.tags.ai_tag,
        ...filters.tags,
      ];
    }
  }

  /**
   * Calculate reputation score for a workflow
   */
  private calculateReputationScore(
    event: any,
    performanceMetrics: any,
  ): number {
    const performanceScore = performanceMetrics.qualityScore || 0.5;
    const reliabilityScore = performanceMetrics.successRate || 0.5;
    const usageScore = Math.min(
      1.0,
      parseInt(event.ai_access_count || "0") / 100,
    );
    const enhancementScore = event.workflow_enhancement ? 0.8 : 0.2;
    const importanceScore = parseFloat(event.ai_importance || "0.5");

    return (
      performanceScore * 0.3 +
      reliabilityScore * 0.25 +
      usageScore * 0.2 +
      enhancementScore * 0.15 +
      importanceScore * 0.1
    );
  }

  /**
   * Convert Velocity event to WorkflowResult format
   */
  private convertEventToWorkflow(event: any): WorkflowResult {
    const workflowId = event.workflow_id || event.Id;
    const name = event.workflow_id || `workflow-${event.Id.substring(0, 8)}`;
    const description = event.Content
      ? event.Content.substring(0, 200)
      : "Workflow description";

    // Parse capabilities
    const capabilities: string[] = [];
    if (event.workflow_capability) {
      if (Array.isArray(event.workflow_capability)) {
        capabilities.push(...event.workflow_capability);
      } else {
        capabilities.push(event.workflow_capability);
      }
    }

    // Parse requirements
    const requirements: string[] = [];
    if (event.workflow_requirement) {
      if (Array.isArray(event.workflow_requirement)) {
        requirements.push(...event.workflow_requirement);
      } else {
        requirements.push(event.workflow_requirement);
      }
    }

    // Parse tags
    const tags: string[] = [];
    if (event.ai_tag) {
      if (Array.isArray(event.ai_tag)) {
        tags.push(...event.ai_tag);
      } else {
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
        const performance =
          typeof event.workflow_performance === "string"
            ? JSON.parse(event.workflow_performance)
            : event.workflow_performance;

        performanceMetrics = {
          averageExecutionTime: performance.executionTime || 0,
          enhancementCount: performance.enhancementCount || 0,
          qualityScore: performance.qualityScore || 0.5,
          successRate: performance.success ? 1.0 : 0.0,
          userSatisfactionRating: performance.userSatisfaction || 0.5,
        };
      } catch (error) {
        console.warn("Failed to parse performance metrics:", error);
      }
    }

    // Calculate reputation score
    const reputationScore = this.calculateReputationScore(
      event,
      performanceMetrics,
    );

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
   * Extract primary capability from query for broad search
   * Implements Claude Desktop learning: start with general capability
   */
  private extractPrimaryCapability(query: string): string {
    const queryLower = query.toLowerCase();

    // Capability mapping: specific terms -> broad categories
    const capabilityMap: Record<string, string> = {
      // Analysis and reporting
      analysis: "data-analysis",
      analytics: "data-analysis",
      // Integration
      api: "integration",
      // Automation
      automation: "workflow-automation",
      connector: "integration",
      csv: "format-conversion",

      insights: "data-analysis",
      // Data processing
      json: "format-conversion",
      orchestration: "workflow-automation",
      parsing: "data-processing",

      pipeline: "workflow-automation",
      reporting: "data-analysis",
      transformation: "data-processing",

      validation: "data-processing",
      webhook: "integration",
      xml: "format-conversion",
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
   * Check if workflow matches additional filters
   */
  private matchesAdditionalFilters(
    workflow: WorkflowResult,
    filters: SearchFilters,
  ): boolean {
    if (
      filters.minReputationScore &&
      workflow.reputationScore < filters.minReputationScore
    ) {
      return false;
    }

    if (
      filters.minPerformanceScore &&
      workflow.performanceMetrics.qualityScore < filters.minPerformanceScore
    ) {
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
  private matchesQuery(workflow: WorkflowResult, query: string): boolean {
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
   * Merge and rank results from broad and specific searches
   */
  private mergeAndRankResults(
    broadResults: WorkflowResult[],
    specificResults: WorkflowResult[],
  ): WorkflowResult[] {
    // Combine results and remove duplicates
    const allResults = [...broadResults];
    const seenIds = new Set(broadResults.map((w) => w.workflowId));

    specificResults.forEach((workflow) => {
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
  private rankWorkflows(workflows: WorkflowResult[]): WorkflowResult[] {
    return workflows.sort((a, b) => {
      // Primary sort by reputation score
      const reputationDiff = b.reputationScore - a.reputationScore;
      if (Math.abs(reputationDiff) > 0.1) return reputationDiff;

      // Secondary sort by performance
      const performanceDiff =
        b.performanceMetrics.qualityScore - a.performanceMetrics.qualityScore;
      if (Math.abs(performanceDiff) > 0.05) return performanceDiff;

      // Tertiary sort by usage count
      return b.usageCount - a.usageCount;
    });
  }
}
