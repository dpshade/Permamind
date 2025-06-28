import { AIMemory, MemoryType, RelationshipType, MemoryAnalytics, SearchFilters } from "./AIMemory.js";

// Workflow memory types and relationship types are now part of the base MemoryType and RelationshipType

export interface WorkflowMemory extends AIMemory {
  workflowId: string;
  workflowVersion: string;
  stage: WorkflowStage;
  performance?: WorkflowPerformance;
  enhancement?: WorkflowEnhancement;
  dependencies: string[];
  capabilities: string[];
  requirements: string[];
}

export type WorkflowStage = 
  | "planning"
  | "execution" 
  | "evaluation"
  | "optimization"
  | "archived";

export interface WorkflowPerformance {
  executionTime: number;           // milliseconds
  success: boolean;
  errorRate: number;               // 0-1
  resourceUsage: ResourceMetrics;
  qualityScore: number;            // 0-1
  userSatisfaction?: number;       // 0-1
  completionRate: number;          // 0-1
  retryCount: number;
  lastExecuted: string;            // ISO timestamp
}

export interface ResourceMetrics {
  memoryUsage: number;             // MB
  cpuTime: number;                 // milliseconds
  networkRequests: number;
  storageOperations: number;
  toolCalls: number;
}

export interface WorkflowEnhancement {
  previousVersion?: string;
  improvements: Enhancement[];
  learningSource: LearningSource;
  confidence: number;              // 0-1
  validationResults: ValidationResult[];
  appliedAt: string;               // ISO timestamp
}

export type LearningSource = 
  | "self"          // Self-optimization
  | "peer"          // Learning from other workflows
  | "user"          // User feedback
  | "analytics"     // Performance data analysis
  | "error"         // Error-driven improvement
  | "emergent";     // Discovered through combination

export interface Enhancement {
  id: string;
  type: EnhancementType;
  description: string;
  impact: number;                  // Expected improvement 0-1
  actualImpact?: number;           // Measured improvement 0-1
  validation: ValidationResult;
  code?: string;                   // Code changes if applicable
  parameters?: Record<string, any>; // Parameter adjustments
}

export type EnhancementType = 
  | "optimization"   // Performance improvement
  | "bug_fix"        // Error correction
  | "feature_add"    // New capability
  | "refactor"       // Code restructuring
  | "parameter_tune" // Parameter optimization
  | "logic_improve"  // Decision logic enhancement
  | "error_handling" // Better error management
  | "user_experience"; // UX improvement

export interface ValidationResult {
  isValid: boolean;
  confidence: number;              // 0-1
  testResults: TestResult[];
  riskAssessment: RiskLevel;
  approvedBy?: string;             // Public key of approver
  validatedAt: string;             // ISO timestamp
}

export interface TestResult {
  testName: string;
  passed: boolean;
  score?: number;                  // 0-1
  details?: string;
  executionTime?: number;          // milliseconds
}

export type RiskLevel = "low" | "medium" | "high" | "critical";

// Workflow registry and discovery types
export interface WorkflowRegistryEntry {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  capabilities: string[];
  requirements: string[];
  performance: PerformanceStats;
  hubId: string;
  creator: string;                 // Public key
  version: string;
  enhancementCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export type WorkflowCategory = 
  | "data_processing"
  | "analysis"
  | "communication"
  | "automation"
  | "decision_making"
  | "creative"
  | "problem_solving"
  | "coordination"
  | "monitoring"
  | "optimization";

export interface PerformanceStats {
  averageExecutionTime: number;
  successRate: number;             // 0-1
  averageQualityScore: number;     // 0-1
  totalExecutions: number;
  averageResourceUsage: ResourceMetrics;
  reliabilityScore: number;        // 0-1
  userRating?: number;             // 0-5
}

// Self-enhancement system types
export interface SelfEnhancementLoop {
  workflowId: string;
  currentVersion: string;
  enhancementHistory: Enhancement[];
  learningModel: LearningModel;
  optimizationTargets: OptimizationTarget[];
  feedbackLoops: FeedbackLoop[];
}

export interface LearningModel {
  type: "reinforcement" | "supervised" | "unsupervised" | "transfer";
  parameters: Record<string, any>;
  trainingData: TrainingDataPoint[];
  accuracy: number;                // 0-1
  lastUpdated: string;
}

export interface TrainingDataPoint {
  input: any;
  output: any;
  performance: WorkflowPerformance;
  timestamp: string;
}

export interface OptimizationTarget {
  metric: "execution_time" | "success_rate" | "quality_score" | "resource_usage" | "user_satisfaction";
  targetValue: number;
  weight: number;                  // 0-1 relative importance
  achieved: boolean;
}

export interface FeedbackLoop {
  type: "performance" | "user" | "peer" | "system";
  source: string;
  feedback: string;
  actionable: boolean;
  priority: "low" | "medium" | "high";
  timestamp: string;
}

// Workflow coordination and composition types
export interface WorkflowComposition {
  id: string;
  name: string;
  description: string;
  workflows: WorkflowStep[];
  executionStrategy: ExecutionStrategy;
  errorHandling: ErrorHandlingStrategy;
  resourceAllocation: ResourceAllocation;
}

export interface WorkflowStep {
  workflowId: string;
  order: number;
  condition?: string;              // Conditional execution logic
  timeout?: number;                // milliseconds
  retryPolicy?: RetryPolicy;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
}

export type ExecutionStrategy = 
  | "sequential"    // Execute workflows in order
  | "parallel"      // Execute workflows simultaneously
  | "conditional"   // Execute based on conditions
  | "pipeline"      // Output of one feeds into next
  | "adaptive";     // Dynamic strategy selection

export interface ErrorHandlingStrategy {
  onFailure: "abort" | "continue" | "retry" | "fallback";
  maxRetries: number;
  retryDelay: number;              // milliseconds
  fallbackWorkflow?: string;
  escalationPolicy?: string[];     // Notification recipients
}

export interface ResourceAllocation {
  maxConcurrentWorkflows: number;
  memoryLimit: number;             // MB
  timeLimit: number;               // milliseconds
  priority: "low" | "medium" | "high";
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: "linear" | "exponential" | "fixed";
  initialDelay: number;            // milliseconds
  maxDelay: number;                // milliseconds
}

// Analytics and monitoring types
export interface WorkflowAnalytics extends MemoryAnalytics {
  workflowDistribution: Record<WorkflowCategory, number>;
  enhancementEffectiveness: EnhancementEffectiveness;
  performanceTrends: PerformanceTrend[];
  collaborationMetrics: CollaborationMetrics;
  learningEfficiency: LearningEfficiency;
}

export interface EnhancementEffectiveness {
  averageImpact: number;           // 0-1
  successRate: number;             // 0-1
  byType: Record<EnhancementType, {
    count: number;
    averageImpact: number;
    successRate: number;
  }>;
  bySource: Record<LearningSource, {
    count: number;
    averageImpact: number;
    successRate: number;
  }>;
}

export interface PerformanceTrend {
  metric: string;
  timeWindow: string;              // e.g., "1h", "1d", "1w"
  values: {
    timestamp: string;
    value: number;
  }[];
  trend: "improving" | "declining" | "stable";
  confidence: number;              // 0-1
}

export interface CollaborationMetrics {
  workflowSharing: number;         // Count of shared workflows
  knowledgeExchange: number;       // Count of knowledge transfers
  peerLearning: number;            // Count of peer learning events
  networkDensity: number;          // 0-1 connectivity measure
  influenceScore: number;          // 0-1 workflow influence measure
}

export interface LearningEfficiency {
  learningRate: number;            // Improvements per unit time
  knowledgeRetention: number;      // 0-1 knowledge persistence
  transferEfficiency: number;      // 0-1 cross-domain learning
  adaptabilityScore: number;       // 0-1 adaptation to new situations
}

// Extended search filters for workflow memories
export interface WorkflowSearchFilters extends SearchFilters {
  workflowId?: string;
  workflowCategory?: WorkflowCategory;
  stage?: WorkflowStage;
  performanceThreshold?: number;   // Minimum quality score
  enhancementType?: EnhancementType;
  learningSource?: LearningSource;
  hasPerformanceData?: boolean;
  hasEnhancements?: boolean;
  createdAfter?: string;           // ISO timestamp
  createdBefore?: string;          // ISO timestamp
}