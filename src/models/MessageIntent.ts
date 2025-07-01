import { Tag } from "./Tag.js";

/**
 * Confidence levels for intent parsing
 */
export type ConfidenceLevel = "high" | "low" | "medium";

/**
 * Individual field in a data structure
 */
export interface DataField {
  description: string;
  name: string;
  required: boolean;
  type: string;
  validation?: string;
}

/**
 * Data structure definition from handler documentation
 */
export interface DataStructure {
  description: string;
  examples: any[];
  fields: DataField[];
  name: string;
}

/**
 * Individual handler action definition
 */
export interface HandlerAction {
  dataFormat?: string;
  description: string;
  examples: string[];
  name: string;
  optionalTags: Tag[];
  requiredTags: Tag[];
  responseFormat?: string;
}

/**
 * Example from handler documentation
 */
export interface HandlerExample {
  description: string;
  input: {
    data?: string;
    tags: Tag[];
  };
  output: {
    data?: string;
    description: string;
    tags?: Tag[];
  };
  title: string;
}

/**
 * Handler interface definition parsed from documentation
 */
export interface HandlerInterface {
  actions: HandlerAction[];
  dataStructures: DataStructure[];
  description: string;
  examples: HandlerExample[];
  name: string;
}

/**
 * Core intent types that can be parsed from natural language
 */
export type IntentType =
  | "balance" // "get my token balance"
  | "create_process" // "create a voting contract"
  | "create_token" // "launch token called Flow"
  | "custom_message" // "send message to process ABC with action Vote"
  | "eval_code" // "evaluate this lua code"
  | "query_state" // "what is the current state"
  | "transfer" // "send alice 10 AO"
  | "unknown"; // fallback for unparseable intents

/**
 * Example usage of a message template
 */
export interface MessageExample {
  description: string;
  expectedData?: string;
  expectedTags: Tag[];
  params: MessageParams;
  prompt: string;
}

/**
 * Parsed natural language intent with extracted parameters
 */
export interface MessageIntent {
  confidence: ConfidenceLevel;
  extractedParams: MessageParams;
  originalPrompt: string;
  processType?: ProcessType;
  requiresProcessCreation: boolean;
  suggestedTemplate?: string;
  type: IntentType;
}

/**
 * Parameters extracted from natural language
 */
export interface MessageParams {
  action?: string;
  amount?: string;
  customTags?: Record<string, string>;

  data?: string;
  // Common parameters
  description?: string;
  // Code evaluation
  luaCode?: string;
  metadata?: Record<string, any>;

  // Custom messaging
  processId?: string;
  // Process creation
  processName?: string;
  // Query parameters
  queryType?: string;
  // Transfer-specific
  recipient?: string;

  targetProperty?: string;

  token?: string;
  tokenDenomination?: number;

  tokenName?: string;
  tokenSymbol?: string;
}

/**
 * Template for constructing AO messages
 */
export interface MessageTemplate {
  dataTemplate?: string;
  description: string;
  examples: MessageExample[];
  id: string;
  intentTypes: IntentType[];
  name: string;
  optionalParams: string[];
  processTypes?: ProcessType[];
  requiredParams: string[];
  tagTemplate: Tag[];
}

/**
 * Error codes for natural language processing
 */
export type NLErrorCode =
  | "AMBIGUOUS_INTENT"
  | "INVALID_PARAM_FORMAT"
  | "MISSING_REQUIRED_PARAM"
  | "PROCESS_NOT_FOUND"
  | "TEMPLATE_NOT_FOUND"
  | "UNKNOWN_INTENT"
  | "UNSUPPORTED_ACTION"
  | "VALIDATION_FAILED";

/**
 * Context for natural language processing
 */
export interface NLProcessingContext {
  preferences?: UserPreferences;
  previousMessages?: MessageIntent[];
  sessionId?: string;
  userId?: string;
  userProcesses?: UserProcess[];
}

/**
 * Errors that can occur during natural language processing
 */
export interface NLProcessingError {
  code: NLErrorCode;
  field?: string;
  message: string;
  suggestion?: string;
}

/**
 * Parsed natural language processing result
 */
export interface NLProcessingResult {
  alternativeIntents?: MessageIntent[];
  errors: NLProcessingError[];
  intent: MessageIntent;
  processedMessage?: ProcessedMessage;
  suggestions: string[];
}

/**
 * Configuration for process creation
 */
export interface ProcessCreationConfig {
  description?: string;
  initialTags?: Tag[];
  luaCode?: string;
  name?: string;
  templateId?: string;
  // Token-specific config
  tokenConfig?: {
    denomination?: number;
    description?: string;
    logo?: string;
    name: string;
    symbol: string;
    totalSupply?: string;
  };

  type: ProcessType;
}

/**
 * Result of message template processing
 */
export interface ProcessedMessage {
  confidence: ConfidenceLevel;
  data: null | string;
  processConfig?: ProcessCreationConfig;
  processId?: string;
  requiresNewProcess: boolean;
  tags: Tag[];
  template: MessageTemplate;
}

/**
 * Types of processes that can be created
 */
export type ProcessType =
  | "basic" // Basic AOS process
  | "custom" // Custom lua code
  | "marketplace" // Trading/exchange contract
  | "registry" // Registry/directory contract
  | "token" // Token contract
  | "voting"; // Voting/governance contract

/**
 * User preferences for message processing
 */
export interface UserPreferences {
  autoConfirm?: boolean;
  defaultTokenSymbol?: string;
  preferredProcessNames?: Record<ProcessType, string>;
  verboseResponses?: boolean;
}

/**
 * User's created processes for context
 */
export interface UserProcess {
  createdAt: string;
  id: string;
  lastUsed?: string;
  name?: string;
  tags?: string[];
  type: ProcessType;
}
