/**
 * Workflow Definition Types for Dynamic AO Process Support
 *
 * These interfaces define how any AO process can be described to Permamind,
 * enabling dynamic interaction without hard-coded tools for each process.
 */

export interface AOHandlerDefinition {
  capabilities: string[];
  costs?: {
    computeUnits?: number;
    description?: string;
    tokenCost?: number;
  };
  description: string;
  messageSchema: AOMessageSchema;
  name: string;
  rateLimit?: {
    cooldownMs?: number;
    requestsPerMinute: number;
  };
  requirements?: string[];
  responsePatterns: AOResponsePattern[];
}

export interface AOMessageRequest {
  data?: string;
  handler: string;
  metadata?: {
    priority?: "high" | "low" | "medium";
    retries?: number;
    timeout?: number;
  };
  parameters: Record<string, any>;
  processId: string;
}

export interface AOMessageResponse {
  data?: any;
  error?: {
    code: string;
    details?: any;
    message: string;
  };
  executionTime?: number;
  messageId?: string;
  metadata?: {
    handler: string;
    processId: string;
    timestamp: string;
  };
  rawResponse?: any;
  success: boolean;
}

export interface AOMessageSchema {
  action: string;
  data?: {
    description: string;
    examples?: string[];
    format: "binary" | "json" | "lua" | "string";
    required: boolean;
  };
  description: string;
  examples?: {
    data?: string;
    description: string;
    expectedResponse?: string;
    tags: { name: string; value: string }[];
  }[];
  tags: AOTag[];
}

export interface AOResponsePattern {
  format: {
    dataType: "binary" | "json" | "lua" | "string";
    parser?: string; // description of how to parse
    structured: boolean;
  };
  indicators: {
    dataPattern?: string; // regex or description
    errorCodes?: string[];
    tags?: { name: string; values: string[] }[];
  };
  messageType: "data" | "error" | "status" | "success";
}

export interface AOTag {
  description?: string;
  examples?: string[];
  name: string;
  required?: boolean;
  value: string;
}

// Enhanced interfaces for markdown workflows
export interface MarkdownWorkflowRequest {
  markdownWorkflow: string;
  processId?: string;
  request: string;
  storeAsMemory?: boolean;
}

export interface MarkdownWorkflowResponse {
  data?: any;
  error?: {
    code: string;
    details?: any;
    message: string;
  };
  executionTime?: number;
  rawResponse?: any;
  reasoningChain?: string[];
  success: boolean;
}

export interface NaturalLanguageExample {
  description: string;
  expectedAction: string;
  expectedParameters: Record<string, string>;
  phrase: string;
}

export interface ParameterMapping {
  conversion?: "decimal" | "none";
  examples: string[];
  parameter: string;
  patterns: string[];
  type: "address" | "amount" | "boolean" | "string";
}

export interface WorkflowActionMapping {
  action: string;
  keywords: string[];
  parameterMappings: ParameterMapping[];
}

export interface WorkflowDefinition {
  author?: string;
  // Capabilities and classification
  capabilities: string[];
  category:
    | "ai"
    | "data"
    | "finance"
    | "gaming"
    | "infrastructure"
    | "other"
    | "social"
    | "utility";
  description: string;
  // Process-specific information
  documentation?: {
    docs?: string;
    examples?: string;
    github?: string;
    website?: string;
  };
  // Handler definitions
  handlers: AOHandlerDefinition[];

  // Process metadata
  id: string;
  // Performance and reliability info
  metrics?: {
    avgResponseTime?: number;
    lastUpdated?: string;
    successRate?: number;
    userRating?: number;
  };
  module?: string;

  name: string;
  // Process configuration
  network: "ao" | "arweave" | "other";
  processId: string;

  scheduler?: string;

  tags: string[];

  // Security and trust
  verification?: {
    auditedBy?: string[];
    codeVerified: boolean;
    permissions: string[];
    riskLevel: "high" | "low" | "medium";
  };

  version: string;
}

export interface WorkflowExecutionContext {
  constructedMessage: {
    data?: string;
    processId: string;
    tags: { name: string; value: string }[];
  };
  selectedHandler: AOHandlerDefinition;
  userRequest: string;
  workflowDefinition: WorkflowDefinition;
}

export interface WorkflowMetadata {
  category?: string;
  decimals?: number;
  description?: string;
  name?: string;
  processId?: string;
  version?: string;
}

// Utility types for workflow discovery and management
export interface WorkflowRegistry {
  addWorkflow(definition: WorkflowDefinition): void;
  findByCapability(capability: string): WorkflowDefinition[];
  findByCategory(category: string): WorkflowDefinition[];
  getWorkflow(id: string): undefined | WorkflowDefinition;
  search(query: string): WorkflowDefinition[];
  workflows: Map<string, WorkflowDefinition>;
}

export interface WorkflowValidationResult {
  errors: string[];
  suggestions: string[];
  valid: boolean;
  warnings: string[];
}
