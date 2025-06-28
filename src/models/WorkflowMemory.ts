import {
  AIMemory,
  MemoryAnalytics,
  MemoryType,
  RelationshipType,
  SearchFilters,
} from "./AIMemory.js";

// Workflow memory types and relationship types are now part of the base MemoryType and RelationshipType

export interface CollaborationMetrics {
  influenceScore: number; // 0-1 workflow influence measure
  knowledgeExchange: number; // Count of knowledge transfers
  networkDensity: number; // 0-1 connectivity measure
  peerLearning: number; // Count of peer learning events
  workflowSharing: number; // Count of shared workflows
}

export interface Enhancement {
  actualImpact?: number; // Measured improvement 0-1
  code?: string; // Code changes if applicable
  description: string;
  id: string;
  impact: number; // Expected improvement 0-1
  parameters?: Record<string, any>; // Parameter adjustments
  type: EnhancementType;
  validation: ValidationResult;
}

export interface EnhancementEffectiveness {
  averageImpact: number; // 0-1
  bySource: Record<
    LearningSource,
    {
      averageImpact: number;
      count: number;
      successRate: number;
    }
  >;
  byType: Record<
    EnhancementType,
    {
      averageImpact: number;
      count: number;
      successRate: number;
    }
  >;
  successRate: number; // 0-1
}

export type EnhancementType =
  | "bug_fix" // Error correction
  | "error_handling" // Better error management
  | "feature_add" // New capability
  | "logic_improve" // Decision logic enhancement
  | "optimization" // Performance improvement
  | "parameter_tune" // Parameter optimization
  | "refactor" // Code restructuring
  | "user_experience"; // UX improvement

export interface ErrorHandlingStrategy {
  escalationPolicy?: string[]; // Notification recipients
  fallbackWorkflow?: string;
  maxRetries: number;
  onFailure: "abort" | "continue" | "fallback" | "retry";
  retryDelay: number; // milliseconds
}

export type ExecutionStrategy =
  | "adaptive" // Dynamic strategy selection
  | "conditional" // Execute based on conditions
  | "parallel" // Execute workflows simultaneously
  | "pipeline" // Output of one feeds into next
  | "sequential"; // Execute workflows in order

export interface FeedbackLoop {
  actionable: boolean;
  feedback: string;
  priority: "high" | "low" | "medium";
  source: string;
  timestamp: string;
  type: "peer" | "performance" | "system" | "user";
}

export interface LearningEfficiency {
  adaptabilityScore: number; // 0-1 adaptation to new situations
  knowledgeRetention: number; // 0-1 knowledge persistence
  learningRate: number; // Improvements per unit time
  transferEfficiency: number; // 0-1 cross-domain learning
}

export interface LearningModel {
  accuracy: number; // 0-1
  lastUpdated: string;
  parameters: Record<string, any>;
  trainingData: TrainingDataPoint[];
  type: "reinforcement" | "supervised" | "transfer" | "unsupervised";
}

export type LearningSource =
  | "analytics" // Performance data analysis
  | "emergent" // Discovered through combination
  | "error" // Error-driven improvement
  | "peer" // Learning from other workflows
  | "self" // Self-optimization
  | "user"; // User feedback

export interface OptimizationTarget {
  achieved: boolean;
  metric:
    | "execution_time"
    | "quality_score"
    | "resource_usage"
    | "success_rate"
    | "user_satisfaction";
  targetValue: number;
  weight: number; // 0-1 relative importance
}

export interface PerformanceStats {
  averageExecutionTime: number;
  averageQualityScore: number; // 0-1
  averageResourceUsage: ResourceMetrics;
  reliabilityScore: number; // 0-1
  successRate: number; // 0-1
  totalExecutions: number;
  userRating?: number; // 0-5
}

export interface PerformanceTrend {
  confidence: number; // 0-1
  metric: string;
  timeWindow: string; // e.g., "1h", "1d", "1w"
  trend: "declining" | "improving" | "stable";
  values: {
    timestamp: string;
    value: number;
  }[];
}

export interface ResourceAllocation {
  maxConcurrentWorkflows: number;
  memoryLimit: number; // MB
  priority: "high" | "low" | "medium";
  timeLimit: number; // milliseconds
}

export interface ResourceMetrics {
  cpuTime: number; // milliseconds
  memoryUsage: number; // MB
  networkRequests: number;
  storageOperations: number;
  toolCalls: number;
}

export interface RetryPolicy {
  backoffStrategy: "exponential" | "fixed" | "linear";
  initialDelay: number; // milliseconds
  maxAttempts: number;
  maxDelay: number; // milliseconds
}

export type RiskLevel = "critical" | "high" | "low" | "medium";

// Self-enhancement system types
export interface SelfEnhancementLoop {
  currentVersion: string;
  enhancementHistory: Enhancement[];
  feedbackLoops: FeedbackLoop[];
  learningModel: LearningModel;
  optimizationTargets: OptimizationTarget[];
  workflowId: string;
}

export interface TestResult {
  details?: string;
  executionTime?: number; // milliseconds
  passed: boolean;
  score?: number; // 0-1
  testName: string;
}

export interface TrainingDataPoint {
  input: any;
  output: any;
  performance: WorkflowPerformance;
  timestamp: string;
}

export interface ValidationResult {
  approvedBy?: string; // Public key of approver
  confidence: number; // 0-1
  isValid: boolean;
  riskAssessment: RiskLevel;
  testResults: TestResult[];
  validatedAt: string; // ISO timestamp
}

// Analytics and monitoring types
export interface WorkflowAnalytics extends MemoryAnalytics {
  collaborationMetrics: CollaborationMetrics;
  enhancementEffectiveness: EnhancementEffectiveness;
  learningEfficiency: LearningEfficiency;
  performanceTrends: PerformanceTrend[];
  workflowDistribution: Record<WorkflowCategory, number>;
}

export type WorkflowCategory =
  | "analysis"
  | "automation"
  | "communication"
  | "coordination"
  | "creative"
  | "data_processing"
  | "decision_making"
  | "monitoring"
  | "optimization"
  | "problem_solving";

// Workflow coordination and composition types
export interface WorkflowComposition {
  description: string;
  errorHandling: ErrorHandlingStrategy;
  executionStrategy: ExecutionStrategy;
  id: string;
  name: string;
  resourceAllocation: ResourceAllocation;
  workflows: WorkflowStep[];
}

export interface WorkflowEnhancement {
  appliedAt: string; // ISO timestamp
  confidence: number; // 0-1
  improvements: Enhancement[];
  learningSource: LearningSource;
  previousVersion?: string;
  validationResults: ValidationResult[];
}

export interface WorkflowMemory extends AIMemory {
  capabilities: string[];
  dependencies: string[];
  enhancement?: WorkflowEnhancement;
  performance?: WorkflowPerformance;
  requirements: string[];
  stage: WorkflowStage;
  workflowId: string;
  workflowVersion: string;
}

export interface WorkflowPerformance {
  completionRate: number; // 0-1
  errorRate: number; // 0-1
  executionTime: number; // milliseconds
  lastExecuted: string; // ISO timestamp
  qualityScore: number; // 0-1
  resourceUsage: ResourceMetrics;
  retryCount: number;
  success: boolean;
  userSatisfaction?: number; // 0-1
}

// Workflow registry and discovery types
export interface WorkflowRegistryEntry {
  capabilities: string[];
  category: WorkflowCategory;
  createdAt: string;
  creator: string; // Public key
  description: string;
  enhancementCount: number;
  hubId: string;
  id: string;
  name: string;
  performance: PerformanceStats;
  requirements: string[];
  tags: string[];
  updatedAt: string;
  version: string;
}

// Extended search filters for workflow memories
export interface WorkflowSearchFilters extends SearchFilters {
  createdAfter?: string; // ISO timestamp
  createdBefore?: string; // ISO timestamp
  enhancementType?: EnhancementType;
  hasEnhancements?: boolean;
  hasPerformanceData?: boolean;
  learningSource?: LearningSource;
  performanceThreshold?: number; // Minimum quality score
  stage?: WorkflowStage;
  workflowCategory?: WorkflowCategory;
  workflowId?: string;
}

export type WorkflowStage =
  | "archived"
  | "evaluation"
  | "execution"
  | "optimization"
  | "planning";

export interface WorkflowStep {
  condition?: string; // Conditional execution logic
  inputMapping?: Record<string, string>;
  order: number;
  outputMapping?: Record<string, string>;
  retryPolicy?: RetryPolicy;
  timeout?: number; // milliseconds
  workflowId: string;
}
