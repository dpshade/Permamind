import {
  Enhancement,
  EnhancementType,
  LearningSource,
  OptimizationTarget,
  PerformanceTrend,
  ResourceMetrics,
  RiskLevel,
  TestResult,
  ValidationResult,
  WorkflowMemory,
  WorkflowPerformance,
} from "../models/WorkflowMemory.js";

/**
 * Service for tracking and analyzing workflow performance metrics
 * Supports self-enhancement through performance data analysis
 */
export class WorkflowPerformanceTracker {
  private baselineMetrics: Map<string, WorkflowPerformance> = new Map();
  private enhancementImpacts: Map<string, Enhancement[]> = new Map();
  private performanceHistory: Map<string, WorkflowPerformance[]> = new Map();

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(workflowId: string): {
    estimatedImpact: number;
    priority: "high" | "low" | "medium";
    recommendations: string[];
  } {
    const stats = this.getPerformanceStats(workflowId);
    const enhancements = this.identifyEnhancements(workflowId);

    const recommendations: string[] = [];
    let totalImpact = 0;
    let maxPriority: "high" | "low" | "medium" = "low";

    // Analyze trends
    for (const trend of stats.trend) {
      if (trend.trend === "declining" && trend.confidence > 0.8) {
        recommendations.push(
          `${trend.metric} is declining - investigate and optimize`,
        );
        totalImpact += 0.2;
        maxPriority = "high";
      }
    }

    // Add enhancement recommendations
    for (const enhancement of enhancements) {
      recommendations.push(enhancement.description);
      totalImpact += enhancement.impact;

      if (enhancement.impact > 0.3) {
        maxPriority = maxPriority === "low" ? "medium" : "high";
      }
    }

    return {
      estimatedImpact: Math.min(totalImpact, 1.0),
      priority: maxPriority,
      recommendations,
    };
  }

  /**
   * Get comprehensive performance analysis
   */
  getPerformanceAnalysis(workflowId: string): {
    enhancements: Enhancement[];
    healthScore: number; // 0-1
    metrics: null | WorkflowPerformance;
    recommendations: string[];
    summary: string;
    trends: PerformanceTrend[];
  } {
    const stats = this.getPerformanceStats(workflowId);
    const enhancements = this.identifyEnhancements(workflowId);
    const recommendations =
      this.generateOptimizationRecommendations(workflowId);
    const healthScore = this.calculateHealthScore(workflowId);

    const summary = this.generatePerformanceSummary(
      stats,
      healthScore,
      recommendations.priority,
    );

    return {
      enhancements,
      healthScore,
      metrics: stats.current,
      recommendations: recommendations.recommendations,
      summary,
      trends: stats.trend,
    };
  }

  /**
   * Get performance statistics for a workflow
   */
  getPerformanceStats(workflowId: string): {
    average: null | WorkflowPerformance;
    current: null | WorkflowPerformance;
    improvement: number; // Percentage improvement from baseline
    trend: PerformanceTrend[];
  } {
    const history = this.performanceHistory.get(workflowId) || [];

    if (history.length === 0) {
      return { average: null, current: null, improvement: 0, trend: [] };
    }

    const current = history[history.length - 1];
    const average = this.calculateAveragePerformance(history);
    const trend = this.calculateTrends(workflowId, history);
    const improvement = this.calculateImprovement(workflowId, current);

    return { average, current, improvement, trend };
  }

  /**
   * Identify potential enhancements based on performance data
   */
  identifyEnhancements(workflowId: string): Enhancement[] {
    const history = this.performanceHistory.get(workflowId) || [];
    if (history.length < 5) return []; // Need sufficient data

    const enhancements: Enhancement[] = [];
    const recent = history.slice(-10); // Last 10 executions
    const baseline = this.baselineMetrics.get(workflowId);

    // Performance degradation detection
    if (this.detectPerformanceDegradation(recent)) {
      enhancements.push(
        this.createOptimizationEnhancement(
          "Performance optimization needed - execution time increasing",
          "optimization",
          0.3,
        ),
      );
    }

    // High error rate detection
    const avgErrorRate =
      recent.reduce((sum, p) => sum + p.errorRate, 0) / recent.length;
    if (avgErrorRate > 0.1) {
      // More than 10% error rate
      enhancements.push(
        this.createOptimizationEnhancement(
          "Error handling improvement - high error rate detected",
          "error_handling",
          0.4,
        ),
      );
    }

    // Resource usage optimization
    if (this.detectHighResourceUsage(recent)) {
      enhancements.push(
        this.createOptimizationEnhancement(
          "Resource optimization - high memory/CPU usage",
          "optimization",
          0.25,
        ),
      );
    }

    // Quality score improvement opportunities
    const avgQuality =
      recent.reduce((sum, p) => sum + p.qualityScore, 0) / recent.length;
    if (avgQuality < 0.8) {
      // Below 80% quality
      enhancements.push(
        this.createOptimizationEnhancement(
          "Quality improvement - output quality below threshold",
          "feature_add",
          0.35,
        ),
      );
    }

    // User satisfaction optimization
    const satisfactionScores = recent.filter(
      (p) => p.userSatisfaction !== undefined,
    );
    if (satisfactionScores.length > 0) {
      const avgSatisfaction =
        satisfactionScores.reduce(
          (sum, p) => sum + (p.userSatisfaction || 0),
          0,
        ) / satisfactionScores.length;
      if (avgSatisfaction < 0.7) {
        enhancements.push(
          this.createOptimizationEnhancement(
            "User experience improvement - low satisfaction scores",
            "user_experience",
            0.4,
          ),
        );
      }
    }

    return enhancements;
  }

  /**
   * Record performance metrics for a workflow execution
   */
  recordPerformance(
    workflowId: string,
    performance: WorkflowPerformance,
  ): void {
    const history = this.performanceHistory.get(workflowId) || [];
    history.push({
      ...performance,
      lastExecuted: new Date().toISOString(),
    });

    // Keep only last 100 executions to manage memory
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.performanceHistory.set(workflowId, history);
  }

  /**
   * Set baseline performance metrics for comparison
   */
  setBaseline(workflowId: string, performance: WorkflowPerformance): void {
    this.baselineMetrics.set(workflowId, performance);
  }

  /**
   * Track enhancement impact after application
   */
  trackEnhancementImpact(
    workflowId: string,
    enhancement: Enhancement,
    beforePerformance: WorkflowPerformance,
    afterPerformance: WorkflowPerformance,
  ): void {
    const actualImpact = this.calculateActualImpact(
      beforePerformance,
      afterPerformance,
    );

    const enhancementWithImpact: Enhancement = {
      ...enhancement,
      actualImpact,
    };

    const impacts = this.enhancementImpacts.get(workflowId) || [];
    impacts.push(enhancementWithImpact);
    this.enhancementImpacts.set(workflowId, impacts);
  }

  /**
   * Validate enhancement effectiveness
   */
  validateEnhancement(
    workflowId: string,
    enhancement: Enhancement,
    testResults: TestResult[],
  ): ValidationResult {
    const riskLevel = this.assessEnhancementRisk(enhancement);
    const confidence = this.calculateValidationConfidence(testResults);

    return {
      confidence,
      isValid: testResults.every((t) => t.passed) && confidence > 0.7,
      riskAssessment: riskLevel,
      testResults,
      validatedAt: new Date().toISOString(),
    };
  }

  // Private helper methods

  private analyzeTrend(values: { timestamp: string; value: number }[]): {
    confidence: number;
    direction: "declining" | "improving" | "stable";
  } {
    if (values.length < 5) return { confidence: 0, direction: "stable" };

    // Simple linear regression to detect trend
    const n = values.length;
    const x = values.map((_, i) => i);
    const y = values.map((v) => v.value);

    const meanX = x.reduce((a, b) => a + b) / n;
    const meanY = y.reduce((a, b) => a + b) / n;

    const numerator = x.reduce(
      (sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY),
      0,
    );
    const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const slopeAbs = Math.abs(slope);

    // Calculate R-squared for confidence
    const yPred = x.map((xi) => meanY + slope * (xi - meanX));
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - yPred[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    let direction: "declining" | "improving" | "stable";
    if (slopeAbs < 0.01) {
      direction = "stable";
    } else if (slope > 0) {
      direction = "improving";
    } else {
      direction = "declining";
    }

    return {
      confidence: Math.max(0, Math.min(1, rSquared)),
      direction,
    };
  }

  private assessEnhancementRisk(enhancement: Enhancement): RiskLevel {
    // Risk assessment based on enhancement type and impact
    if (enhancement.type === "bug_fix" && enhancement.impact < 0.3)
      return "low";
    if (enhancement.type === "parameter_tune" && enhancement.impact < 0.2)
      return "low";
    if (enhancement.type === "refactor" || enhancement.impact > 0.5)
      return "high";
    return "medium";
  }

  private calculateActualImpact(
    before: WorkflowPerformance,
    after: WorkflowPerformance,
  ): number {
    const improvements = [
      this.calculateMetricImprovement(
        before.executionTime,
        after.executionTime,
        true,
      ),
      this.calculateMetricImprovement(before.errorRate, after.errorRate, true),
      this.calculateMetricImprovement(
        before.qualityScore,
        after.qualityScore,
        false,
      ),
      this.calculateMetricImprovement(
        before.completionRate,
        after.completionRate,
        false,
      ),
    ];

    return (
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
    );
  }

  private calculateAveragePerformance(
    history: WorkflowPerformance[],
  ): WorkflowPerformance {
    const count = history.length;

    return {
      completionRate:
        history.reduce((sum, p) => sum + p.completionRate, 0) / count,
      errorRate: history.reduce((sum, p) => sum + p.errorRate, 0) / count,
      executionTime:
        history.reduce((sum, p) => sum + p.executionTime, 0) / count,
      lastExecuted: history[history.length - 1].lastExecuted,
      qualityScore: history.reduce((sum, p) => sum + p.qualityScore, 0) / count,
      resourceUsage: this.calculateAverageResourceUsage(history),
      retryCount: history.reduce((sum, p) => sum + p.retryCount, 0) / count,
      success: history.filter((p) => p.success).length / count > 0.5,
      userSatisfaction: this.calculateAverageUserSatisfaction(history),
    };
  }

  private calculateAverageResourceUsage(
    history: WorkflowPerformance[],
  ): ResourceMetrics {
    const count = history.length;

    return {
      cpuTime:
        history.reduce((sum, p) => sum + p.resourceUsage.cpuTime, 0) / count,
      memoryUsage:
        history.reduce((sum, p) => sum + p.resourceUsage.memoryUsage, 0) /
        count,
      networkRequests:
        history.reduce((sum, p) => sum + p.resourceUsage.networkRequests, 0) /
        count,
      storageOperations:
        history.reduce((sum, p) => sum + p.resourceUsage.storageOperations, 0) /
        count,
      toolCalls:
        history.reduce((sum, p) => sum + p.resourceUsage.toolCalls, 0) / count,
    };
  }

  private calculateAverageUserSatisfaction(
    history: WorkflowPerformance[],
  ): number | undefined {
    const satisfactionScores = history.filter(
      (p) => p.userSatisfaction !== undefined,
    );
    if (satisfactionScores.length === 0) return undefined;

    return (
      satisfactionScores.reduce(
        (sum, p) => sum + (p.userSatisfaction || 0),
        0,
      ) / satisfactionScores.length
    );
  }

  private calculateHealthScore(workflowId: string): number {
    const stats = this.getPerformanceStats(workflowId);
    if (!stats.current) return 0;

    const performance = stats.current;
    const scores = [
      performance.success ? 1 : 0, // Success rate
      Math.max(0, 1 - performance.errorRate), // Error rate (inverted)
      performance.qualityScore, // Quality score
      performance.completionRate, // Completion rate
      performance.userSatisfaction || 0.5, // User satisfaction (default to neutral)
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateImprovement(
    workflowId: string,
    current: WorkflowPerformance,
  ): number {
    const baseline = this.baselineMetrics.get(workflowId);
    if (!baseline) return 0;

    // Calculate improvement across multiple metrics
    const improvements = [
      this.calculateMetricImprovement(
        baseline.executionTime,
        current.executionTime,
        true,
      ), // Lower is better
      this.calculateMetricImprovement(
        baseline.errorRate,
        current.errorRate,
        true,
      ), // Lower is better
      this.calculateMetricImprovement(
        baseline.qualityScore,
        current.qualityScore,
        false,
      ), // Higher is better
      this.calculateMetricImprovement(
        baseline.completionRate,
        current.completionRate,
        false,
      ), // Higher is better
    ];

    return (
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
    );
  }

  private calculateMetricImprovement(
    baseline: number,
    current: number,
    lowerIsBetter: boolean,
  ): number {
    if (baseline === 0) return 0;

    const change = lowerIsBetter
      ? (baseline - current) / baseline
      : (current - baseline) / baseline;

    // Cap improvement at ±100%
    return Math.max(-1, Math.min(1, change));
  }

  private calculateTrends(
    workflowId: string,
    history: WorkflowPerformance[],
  ): PerformanceTrend[] {
    if (history.length < 5) return [];

    const trends: PerformanceTrend[] = [];
    const metrics = [
      "executionTime",
      "errorRate",
      "qualityScore",
      "completionRate",
    ];

    for (const metric of metrics) {
      const values = history.map((p, index) => ({
        timestamp: p.lastExecuted,
        value: this.getMetricValue(p, metric),
      }));

      const trend = this.analyzeTrend(values);
      trends.push({
        confidence: trend.confidence,
        metric,
        timeWindow: "24h", // Could be configurable
        trend: trend.direction,
        values: values.slice(-20), // Last 20 data points
      });
    }

    return trends;
  }

  private calculateValidationConfidence(testResults: TestResult[]): number {
    if (testResults.length === 0) return 0;

    const passedTests = testResults.filter((t) => t.passed).length;
    const testScores = testResults
      .filter((t) => t.score !== undefined)
      .map((t) => t.score!);

    const passRate = passedTests / testResults.length;
    const avgScore =
      testScores.length > 0
        ? testScores.reduce((sum, score) => sum + score, 0) / testScores.length
        : passRate;

    return (passRate + avgScore) / 2;
  }

  private createOptimizationEnhancement(
    description: string,
    type: EnhancementType,
    impact: number,
  ): Enhancement {
    return {
      description,
      id: `enhancement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      impact,
      type,
      validation: {
        confidence: 0,
        isValid: false,
        riskAssessment: "medium",
        testResults: [],
        validatedAt: new Date().toISOString(),
      },
    };
  }

  private detectHighResourceUsage(recent: WorkflowPerformance[]): boolean {
    const avgMemory =
      recent.reduce((sum, p) => sum + p.resourceUsage.memoryUsage, 0) /
      recent.length;
    const avgCpu =
      recent.reduce((sum, p) => sum + p.resourceUsage.cpuTime, 0) /
      recent.length;

    // Thresholds for high resource usage (configurable)
    return avgMemory > 500 || avgCpu > 10000; // 500MB or 10 seconds
  }

  private detectPerformanceDegradation(recent: WorkflowPerformance[]): boolean {
    if (recent.length < 5) return false;

    const first = recent.slice(0, Math.floor(recent.length / 2));
    const second = recent.slice(Math.floor(recent.length / 2));

    const firstAvgTime =
      first.reduce((sum, p) => sum + p.executionTime, 0) / first.length;
    const secondAvgTime =
      second.reduce((sum, p) => sum + p.executionTime, 0) / second.length;

    // Performance degraded if execution time increased by more than 20%
    return (secondAvgTime - firstAvgTime) / firstAvgTime > 0.2;
  }

  private generatePerformanceSummary(
    stats: any,
    healthScore: number,
    priority: "high" | "low" | "medium",
  ): string {
    if (!stats.current) {
      return "No performance data available";
    }

    const health =
      healthScore > 0.8
        ? "excellent"
        : healthScore > 0.6
          ? "good"
          : healthScore > 0.4
            ? "fair"
            : "poor";

    const improvement =
      stats.improvement > 0.1
        ? "improving"
        : stats.improvement < -0.1
          ? "declining"
          : "stable";

    return (
      `Workflow health: ${health} (${(healthScore * 100).toFixed(1)}%). ` +
      `Performance trend: ${improvement}. ` +
      `Optimization priority: ${priority}.`
    );
  }

  private getMetricValue(
    performance: WorkflowPerformance,
    metric: string,
  ): number {
    switch (metric) {
      case "completionRate":
        return performance.completionRate;
      case "errorRate":
        return performance.errorRate;
      case "executionTime":
        return performance.executionTime;
      case "qualityScore":
        return performance.qualityScore;
      default:
        return 0;
    }
  }
}
