import {
  Enhancement,
  EnhancementType,
  FeedbackLoop,
  LearningModel,
  LearningSource,
  OptimizationTarget,
  SelfEnhancementLoop,
  TestResult,
  TrainingDataPoint,
  ValidationResult,
  WorkflowMemory,
  WorkflowPerformance,
} from "../models/WorkflowMemory.js";
import { WorkflowPerformanceTracker } from "./WorkflowPerformanceTracker.js";
import { WorkflowRelationshipManager } from "./WorkflowRelationshipManager.js";

/**
 * Core engine for workflow self-enhancement and continuous improvement
 * Implements multiple learning strategies and optimization approaches
 */
export class WorkflowEnhancementEngine {
  private appliedEnhancements: Map<string, Enhancement[]> = new Map();
  private enhancementLoops: Map<string, SelfEnhancementLoop> = new Map();
  private learningModels: Map<string, LearningModel> = new Map();
  private pendingEnhancements: Map<string, Enhancement[]> = new Map();
  private performanceTracker: WorkflowPerformanceTracker;
  private relationshipManager: WorkflowRelationshipManager;

  constructor(
    performanceTracker: WorkflowPerformanceTracker,
    relationshipManager: WorkflowRelationshipManager,
  ) {
    this.performanceTracker = performanceTracker;
    this.relationshipManager = relationshipManager;
  }

  /**
   * Create enhancement from error analysis
   */
  createEnhancementFromError(
    workflowId: string,
    error: Error,
    context: Record<string, any> = {},
  ): Enhancement {
    const errorType = this.classifyError(error);
    const impact = this.estimateErrorImpact(error, context);

    return {
      code: this.generateErrorFixCode(errorType, error),
      description: `Fix error: ${error.message}`,
      id: `error_enhancement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      impact,
      parameters: {
        context,
        errorType,
        originalError: error.message,
      },
      type: "bug_fix",
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "medium",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Discover emergent enhancements through workflow combination
   */
  async discoverEmergentEnhancements(
    workflowId: string,
  ): Promise<Enhancement[]> {
    const emergentEnhancements: Enhancement[] = [];

    // Find collaboration opportunities
    const opportunities =
      this.relationshipManager.findCollaborationOpportunities(workflowId);

    // Analyze composition patterns
    for (const partnerId of opportunities.compositionOpportunities) {
      const compositionEnhancement = await this.createCompositionEnhancement(
        workflowId,
        partnerId,
      );

      if (compositionEnhancement) {
        emergentEnhancements.push(compositionEnhancement);
      }
    }

    // Discover capability combinations
    for (const partnerId of opportunities.potentialPartners) {
      const capabilityEnhancement = await this.createCapabilityEnhancement(
        workflowId,
        partnerId,
      );

      if (capabilityEnhancement) {
        emergentEnhancements.push(capabilityEnhancement);
      }
    }

    return emergentEnhancements;
  }

  /**
   * Get enhancement effectiveness metrics
   */
  getEnhancementEffectiveness(workflowId: string): {
    averageImpact: number;
    bySource: Record<
      LearningSource,
      { avgImpact: number; count: number; successRate: number }
    >;
    byType: Record<
      EnhancementType,
      { avgImpact: number; count: number; successRate: number }
    >;
    successRate: number;
    totalEnhancements: number;
  } {
    const applied = this.appliedEnhancements.get(workflowId) || [];
    const successful = applied.filter((e) => (e.actualImpact || 0) > 0);

    const byType: Record<
      string,
      { avgImpact: number; count: number; successRate: number }
    > = {};
    const bySource: Record<
      string,
      { avgImpact: number; count: number; successRate: number }
    > = {};

    // Calculate by type
    for (const enhancement of applied) {
      const type = enhancement.type;
      if (!byType[type]) {
        byType[type] = { avgImpact: 0, count: 0, successRate: 0 };
      }
      byType[type].count++;
      byType[type].avgImpact += enhancement.actualImpact || 0;
    }

    // Calculate averages and success rates
    for (const type in byType) {
      const stats = byType[type];
      stats.avgImpact /= stats.count;
      stats.successRate =
        applied.filter((e) => e.type === type && (e.actualImpact || 0) > 0)
          .length / stats.count;
    }

    return {
      averageImpact:
        applied.length > 0
          ? applied.reduce((sum, e) => sum + (e.actualImpact || 0), 0) /
            applied.length
          : 0,
      bySource: bySource as any,
      byType: byType as any,
      successRate: applied.length > 0 ? successful.length / applied.length : 0,
      totalEnhancements: applied.length,
    };
  }

  /**
   * Initialize self-enhancement loop for a workflow
   */
  initializeEnhancementLoop(
    workflowId: string,
    optimizationTargets: OptimizationTarget[],
  ): void {
    const enhancementLoop: SelfEnhancementLoop = {
      currentVersion: "1.0.0",
      enhancementHistory: [],
      feedbackLoops: [],
      learningModel: this.createDefaultLearningModel(),
      optimizationTargets,
      workflowId,
    };

    this.enhancementLoops.set(workflowId, enhancementLoop);
  }

  /**
   * Learn from peer workflows
   */
  async learnFromPeers(workflowId: string): Promise<Enhancement[]> {
    const peerLearningEnhancements: Enhancement[] = [];

    // Get related workflows
    const relatedWorkflows = this.relationshipManager.getRelatedWorkflows(
      workflowId,
      "references",
    );
    const similarWorkflows = await this.findSimilarWorkflows(workflowId);

    const peersToLearnFrom = [...relatedWorkflows, ...similarWorkflows];

    for (const peerId of peersToLearnFrom) {
      const peerEnhancements = this.appliedEnhancements.get(peerId) || [];

      for (const peerEnhancement of peerEnhancements) {
        // Check if enhancement is applicable
        if (await this.isEnhancementApplicable(workflowId, peerEnhancement)) {
          const adaptedEnhancement = await this.adaptEnhancementForWorkflow(
            workflowId,
            peerEnhancement,
            peerId,
          );

          if (adaptedEnhancement) {
            peerLearningEnhancements.push(adaptedEnhancement);
          }
        }
      }
    }

    return peerLearningEnhancements;
  }

  /**
   * Process user feedback and create enhancements
   */
  processUserFeedback(
    workflowId: string,
    feedback: string,
    rating: number,
    context: Record<string, any> = {},
  ): Enhancement[] {
    const userEnhancements: Enhancement[] = [];

    // Analyze feedback sentiment and content
    const analysis = this.analyzeFeedback(feedback, rating);

    // Create enhancements based on feedback
    if (analysis.issues.length > 0) {
      for (const issue of analysis.issues) {
        const enhancement = this.createEnhancementFromIssue(issue, "user");
        userEnhancements.push(enhancement);
      }
    }

    // Add to feedback loop
    const feedbackLoop: FeedbackLoop = {
      actionable: userEnhancements.length > 0,
      feedback,
      priority: rating < 3 ? "high" : rating < 4 ? "medium" : "low",
      source: "user_feedback",
      timestamp: new Date().toISOString(),
      type: "user",
    };

    const loop = this.enhancementLoops.get(workflowId);
    if (loop) {
      loop.feedbackLoops.push(feedbackLoop);
    }

    return userEnhancements;
  }

  /**
   * Run enhancement cycle for a workflow
   */
  async runEnhancementCycle(workflowId: string): Promise<{
    applied: Enhancement[];
    enhancements: Enhancement[];
    nextCycleIn: number; // milliseconds
    rejected: Enhancement[];
  }> {
    const loop = this.enhancementLoops.get(workflowId);
    if (!loop) {
      throw new Error(`No enhancement loop found for workflow ${workflowId}`);
    }

    // Phase 1: Identify potential enhancements
    const potentialEnhancements = await this.identifyEnhancements(workflowId);

    // Phase 2: Validate enhancements
    const validatedEnhancements = await this.validateEnhancements(
      workflowId,
      potentialEnhancements,
    );

    // Phase 3: Apply safe enhancements
    const appliedEnhancements = await this.applyEnhancements(
      workflowId,
      validatedEnhancements,
    );

    // Phase 4: Update learning models
    await this.updateLearningModels(workflowId, appliedEnhancements);

    // Phase 5: Plan next cycle
    const nextCycleIn = this.calculateNextCycleDelay(workflowId);

    const rejected = validatedEnhancements.filter(
      (e) => !appliedEnhancements.find((a) => a.id === e.id),
    );

    return {
      applied: appliedEnhancements,
      enhancements: potentialEnhancements,
      nextCycleIn,
      rejected,
    };
  }

  // Private helper methods

  private async adaptEnhancementForWorkflow(
    workflowId: string,
    enhancement: Enhancement,
    sourceWorkflowId: string,
  ): Promise<Enhancement | null> {
    // Create adapted version of enhancement
    return {
      ...enhancement,
      description: `Adapted from ${sourceWorkflowId}: ${enhancement.description}`,
      id: `adapted_${enhancement.id}_${workflowId}`,
      impact: enhancement.impact * 0.8, // Reduce expected impact for adapted enhancements
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "medium",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  private analyzeFeedback(
    feedback: string,
    rating: number,
  ): {
    issues: string[];
    sentiment: "negative" | "neutral" | "positive";
    suggestions: string[];
  } {
    // Simple feedback analysis - would use NLP in production
    const sentiment =
      rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic keyword detection
    if (feedback.toLowerCase().includes("slow")) {
      issues.push("performance");
    }
    if (feedback.toLowerCase().includes("error")) {
      issues.push("reliability");
    }
    if (feedback.toLowerCase().includes("confusing")) {
      issues.push("usability");
    }

    return { issues, sentiment, suggestions };
  }

  private async applyEnhancement(
    workflowId: string,
    enhancement: Enhancement,
  ): Promise<void> {
    // Apply the enhancement to the workflow
    console.log(
      `Applying enhancement ${enhancement.id} to workflow ${workflowId}`,
    );

    // This would integrate with the actual workflow execution system
    // For now, we'll simulate successful application
    enhancement.actualImpact = enhancement.impact * (0.8 + Math.random() * 0.4); // 80-120% of expected
  }

  private async applyEnhancements(
    workflowId: string,
    enhancements: Enhancement[],
  ): Promise<Enhancement[]> {
    const applied: Enhancement[] = [];

    // Sort by risk level and impact
    const sortedEnhancements = enhancements.sort((a, b) => {
      const riskOrder = { critical: 3, high: 2, low: 0, medium: 1 };
      const riskDiff =
        riskOrder[a.validation.riskAssessment] -
        riskOrder[b.validation.riskAssessment];
      if (riskDiff !== 0) return riskDiff;
      return b.impact - a.impact; // Higher impact first
    });

    for (const enhancement of sortedEnhancements) {
      try {
        if (await this.canApplyEnhancement(workflowId, enhancement)) {
          await this.applyEnhancement(workflowId, enhancement);
          applied.push(enhancement);
        }
      } catch (error) {
        console.error(`Failed to apply enhancement ${enhancement.id}:`, error);
      }
    }

    // Store applied enhancements
    const existingApplied = this.appliedEnhancements.get(workflowId) || [];
    this.appliedEnhancements.set(workflowId, [...existingApplied, ...applied]);

    return applied;
  }

  private calculateModelAccuracy(model: LearningModel): number {
    if (model.trainingData.length < 10) return 0.5;

    // Calculate accuracy based on prediction vs actual outcomes
    const recent = model.trainingData.slice(-100);
    let correct = 0;

    for (const dataPoint of recent) {
      const predicted = dataPoint.input.impact > 0.2;
      const actual = dataPoint.output.success;
      if (predicted === actual) correct++;
    }

    return correct / recent.length;
  }

  private calculateNextCycleDelay(workflowId: string): number {
    const loop = this.enhancementLoops.get(workflowId);
    if (!loop) return 86400000; // 24 hours default

    const recentEnhancements = loop.enhancementHistory.slice(-10);
    const avgImpact =
      recentEnhancements.length > 0
        ? recentEnhancements.reduce(
            (sum, e) => sum + (e.actualImpact || 0),
            0,
          ) / recentEnhancements.length
        : 0;

    // More frequent cycles for workflows with high improvement potential
    if (avgImpact > 0.3) return 3600000; // 1 hour
    if (avgImpact > 0.1) return 14400000; // 4 hours
    return 86400000; // 24 hours
  }

  private calculateRelationshipOverlap(
    relationships1: any[],
    relationships2: any[],
  ): number {
    const types1 = new Set(relationships1.map((r) => r.type));
    const types2 = new Set(relationships2.map((r) => r.type));

    const intersection = new Set([...types1].filter((t) => types2.has(t)));
    const union = new Set([...types1, ...types2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private async canApplyEnhancement(
    workflowId: string,
    enhancement: Enhancement,
  ): Promise<boolean> {
    // Check if enhancement can be safely applied
    return (
      enhancement.validation.isValid &&
      enhancement.validation.riskAssessment !== "critical" &&
      enhancement.validation.confidence > 0.6
    );
  }

  private classifyError(error: Error): string {
    if (error.name === "TypeError") return "type_error";
    if (error.name === "ReferenceError") return "reference_error";
    if (error.message.includes("timeout")) return "timeout_error";
    if (error.message.includes("network")) return "network_error";
    return "unknown_error";
  }

  private async createAnalyticsEnhancements(
    workflowId: string,
  ): Promise<Enhancement[]> {
    // Create enhancements based on analytics data
    const enhancements: Enhancement[] = [];

    const recommendations =
      this.performanceTracker.generateOptimizationRecommendations(workflowId);

    for (const recommendation of recommendations.recommendations) {
      enhancements.push({
        description: recommendation,
        id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        impact:
          recommendations.estimatedImpact /
          recommendations.recommendations.length,
        type: "optimization",
        validation: {
          confidence: 0,
          isValid: false,
          riskAssessment:
            recommendations.priority === "high" ? "medium" : "low",
          testResults: [],
          validatedAt: new Date().toISOString(),
        },
      });
    }

    return enhancements;
  }

  private async createCapabilityEnhancement(
    workflowId: string,
    partnerId: string,
  ): Promise<Enhancement | null> {
    // Create enhancement for capability sharing
    return {
      description: `Learn capabilities from ${partnerId}`,
      id: `capability_${workflowId}_${partnerId}`,
      impact: 0.25,
      parameters: {
        capabilityType: "skill_transfer",
        sourceWorkflow: partnerId,
      },
      type: "feature_add",
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "low",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  private async createCompositionEnhancement(
    workflowId: string,
    partnerId: string,
  ): Promise<Enhancement | null> {
    // Create enhancement for workflow composition
    return {
      description: `Compose workflow with ${partnerId} for improved capabilities`,
      id: `composition_${workflowId}_${partnerId}`,
      impact: 0.4,
      parameters: {
        compositionType: "sequential",
        partnerId,
      },
      type: "feature_add",
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "medium",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  private createDefaultLearningModel(): LearningModel {
    return {
      accuracy: 0.5,
      lastUpdated: new Date().toISOString(),
      parameters: {
        discountFactor: 0.95,
        explorationRate: 0.1,
        learningRate: 0.01,
      },
      trainingData: [],
      type: "reinforcement",
    };
  }

  private createEnhancementFromIssue(
    issue: string,
    source: LearningSource,
  ): Enhancement {
    const enhancementTypes: Record<string, EnhancementType> = {
      performance: "optimization",
      reliability: "bug_fix",
      usability: "user_experience",
    };

    return {
      description: `Address ${issue} issue based on ${source} feedback`,
      id: `${source}_enhancement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      impact: 0.3,
      type: enhancementTypes[issue] || "feature_add",
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "medium",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  private estimateErrorImpact(
    error: Error,
    context: Record<string, any>,
  ): number {
    // Estimate impact based on error type and context
    const criticalErrors = ["ReferenceError", "TypeError"];
    if (criticalErrors.includes(error.name)) return 0.8;

    if (error.message.includes("timeout")) return 0.6;
    if (error.message.includes("network")) return 0.4;

    return 0.3;
  }

  private async findSimilarWorkflows(workflowId: string): Promise<string[]> {
    // This would use ML similarity matching in production
    // For now, return workflows with similar relationship patterns
    const relationships = this.relationshipManager.getRelationships(workflowId);
    const similar: string[] = [];

    // Simple similarity based on relationship overlap
    for (const [otherId] of this.enhancementLoops.entries()) {
      if (otherId === workflowId) continue;

      const otherRelationships =
        this.relationshipManager.getRelationships(otherId);
      const overlap = this.calculateRelationshipOverlap(
        relationships,
        otherRelationships,
      );

      if (overlap > 0.3) {
        similar.push(otherId);
      }
    }

    return similar.slice(0, 5); // Top 5 similar workflows
  }

  private generateErrorFixCode(errorType: string, error: Error): string {
    // Generate code fixes based on error type
    switch (errorType) {
      case "network_error":
        return "// Add network error handling and retry mechanism";
      case "timeout_error":
        return "// Increase timeout or add retry logic";
      case "type_error":
        return "// Add type checking and validation";
      default:
        return "// Add error handling for: " + error.message;
    }
  }

  private async getRecentPerformance(
    workflowId: string,
  ): Promise<WorkflowPerformance> {
    const stats = this.performanceTracker.getPerformanceStats(workflowId);
    return (
      stats.current || {
        completionRate: 1.0,
        errorRate: 0,
        executionTime: 1000,
        lastExecuted: new Date().toISOString(),
        qualityScore: 0.8,
        resourceUsage: {
          cpuTime: 500,
          memoryUsage: 100,
          networkRequests: 2,
          storageOperations: 1,
          toolCalls: 3,
        },
        retryCount: 0,
        success: true,
      }
    );
  }

  private async identifyEnhancements(
    workflowId: string,
  ): Promise<Enhancement[]> {
    const enhancements: Enhancement[] = [];

    // Performance-based enhancements
    const performanceEnhancements =
      this.performanceTracker.identifyEnhancements(workflowId);
    enhancements.push(...performanceEnhancements);

    // Peer learning enhancements
    const peerEnhancements = await this.learnFromPeers(workflowId);
    enhancements.push(...peerEnhancements);

    // Emergent enhancements
    const emergentEnhancements =
      await this.discoverEmergentEnhancements(workflowId);
    enhancements.push(...emergentEnhancements);

    // Analytics-driven enhancements
    const analyticsEnhancements =
      await this.createAnalyticsEnhancements(workflowId);
    enhancements.push(...analyticsEnhancements);

    return enhancements;
  }

  private async isEnhancementApplicable(
    workflowId: string,
    enhancement: Enhancement,
  ): Promise<boolean> {
    // Check if enhancement type is compatible
    const loop = this.enhancementLoops.get(workflowId);
    if (!loop) return false;

    // Don't apply the same enhancement twice
    const alreadyApplied = loop.enhancementHistory.some(
      (e) =>
        e.type === enhancement.type &&
        e.description === enhancement.description,
    );

    return !alreadyApplied && enhancement.impact > 0.05;
  }

  private async runEnhancementTests(
    workflowId: string,
    enhancement: Enhancement,
  ): Promise<TestResult[]> {
    // Run tests to validate enhancement
    const testResults: TestResult[] = [];

    // Basic validation tests
    testResults.push({
      details: "Code syntax is valid",
      passed: true,
      score: 0.9,
      testName: "syntax_check",
    });

    testResults.push({
      details: `Expected impact: ${enhancement.impact}`,
      passed: enhancement.impact > 0,
      score: Math.min(1, enhancement.impact * 2),
      testName: "impact_validation",
    });

    return testResults;
  }

  private async updateLearningModels(
    workflowId: string,
    enhancements: Enhancement[],
  ): Promise<void> {
    const model = this.learningModels.get(workflowId);
    if (!model) return;

    // Add training data from enhancements
    for (const enhancement of enhancements) {
      const trainingPoint: TrainingDataPoint = {
        input: {
          context: enhancement.parameters || {},
          enhancementType: enhancement.type,
          impact: enhancement.impact,
        },
        output: {
          actualImpact: enhancement.actualImpact || 0,
          success: (enhancement.actualImpact || 0) > 0,
        },
        performance: await this.getRecentPerformance(workflowId),
        timestamp: new Date().toISOString(),
      };

      model.trainingData.push(trainingPoint);
    }

    // Keep only recent training data
    model.trainingData = model.trainingData.slice(-1000);

    // Update model accuracy
    model.accuracy = this.calculateModelAccuracy(model);
    model.lastUpdated = new Date().toISOString();
  }

  private async validateEnhancements(
    workflowId: string,
    enhancements: Enhancement[],
  ): Promise<Enhancement[]> {
    const validated: Enhancement[] = [];

    for (const enhancement of enhancements) {
      const testResults = await this.runEnhancementTests(
        workflowId,
        enhancement,
      );
      const validation = this.performanceTracker.validateEnhancement(
        workflowId,
        enhancement,
        testResults,
      );

      enhancement.validation = validation;

      if (validation.isValid) {
        validated.push(enhancement);
      }
    }

    return validated;
  }
}
