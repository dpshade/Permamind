/**
 * Workflow Definition Types for Dynamic AO Process Support
 *
 * These interfaces define how any AO process can be described to Permamind,
 * enabling dynamic interaction without hard-coded tools for each process.
 */

export interface AOTag {
  name: string;
  value: string;
  required?: boolean;
  description?: string;
  examples?: string[];
}

export interface AOMessageSchema {
  action: string;
  description: string;
  tags: AOTag[];
  data?: {
    required: boolean;
    format: "string" | "json" | "lua" | "binary";
    description: string;
    examples?: string[];
  };
  examples?: {
    description: string;
    tags: { name: string; value: string }[];
    data?: string;
    expectedResponse?: string;
  }[];
}

export interface AOResponsePattern {
  messageType: "success" | "error" | "data" | "status";
  indicators: {
    tags?: { name: string; values: string[] }[];
    dataPattern?: string; // regex or description
    errorCodes?: string[];
  };
  format: {
    structured: boolean;
    dataType: "string" | "json" | "lua" | "binary";
    parser?: string; // description of how to parse
  };
}

export interface AOHandlerDefinition {
  name: string;
  description: string;
  messageSchema: AOMessageSchema;
  responsePatterns: AOResponsePattern[];
  capabilities: string[];
  requirements?: string[];
  rateLimit?: {
    requestsPerMinute: number;
    cooldownMs?: number;
  };
  costs?: {
    computeUnits?: number;
    tokenCost?: number;
    description?: string;
  };
}

export interface WorkflowDefinition {
  // Process metadata
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  processId: string;

  // Capabilities and classification
  capabilities: string[];
  category:
    | "social"
    | "finance"
    | "gaming"
    | "utility"
    | "data"
    | "ai"
    | "infrastructure"
    | "other";
  tags: string[];

  // Process configuration
  network: "ao" | "arweave" | "other";
  scheduler?: string;
  module?: string;

  // Handler definitions
  handlers: AOHandlerDefinition[];

  // Process-specific information
  documentation?: {
    website?: string;
    github?: string;
    docs?: string;
    examples?: string;
  };

  // Performance and reliability info
  metrics?: {
    avgResponseTime?: number;
    successRate?: number;
    lastUpdated?: string;
    userRating?: number;
  };

  // Security and trust
  verification?: {
    codeVerified: boolean;
    auditedBy?: string[];
    riskLevel: "low" | "medium" | "high";
    permissions: string[];
  };
}

export interface AOMessageRequest {
  processId: string;
  handler: string;
  parameters: Record<string, any>;
  data?: string;
  metadata?: {
    timeout?: number;
    retries?: number;
    priority?: "low" | "medium" | "high";
  };
}

export interface AOMessageResponse {
  success: boolean;
  data?: any;
  rawResponse?: any;
  messageId?: string;
  executionTime?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    handler: string;
    processId: string;
    timestamp: string;
  };
}

export interface WorkflowExecutionContext {
  workflowDefinition: WorkflowDefinition;
  selectedHandler: AOHandlerDefinition;
  userRequest: string;
  constructedMessage: {
    processId: string;
    tags: { name: string; value: string }[];
    data?: string;
  };
}

// Utility types for workflow discovery and management
export interface WorkflowRegistry {
  workflows: Map<string, WorkflowDefinition>;
  addWorkflow(definition: WorkflowDefinition): void;
  getWorkflow(id: string): WorkflowDefinition | undefined;
  findByCapability(capability: string): WorkflowDefinition[];
  findByCategory(category: string): WorkflowDefinition[];
  search(query: string): WorkflowDefinition[];
}

export interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
