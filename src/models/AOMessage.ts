import { JWKInterface } from "arweave/node/lib/wallet.js";

import { MessageTemplate, ProcessCreationConfig } from "./MessageIntent.js";
import { Tag } from "./Tag.js";

/**
 * Error codes for AO message operations
 */
export type AOErrorCode =
  | "INSUFFICIENT_BALANCE"
  | "INVALID_DATA"
  | "INVALID_PROCESS_ID"
  | "INVALID_TAGS"
  | "NETWORK_ERROR"
  | "PROCESS_NOT_FOUND"
  | "RATE_LIMITED"
  | "SIGNER_ERROR"
  | "TIMEOUT_ERROR"
  | "UNAUTHORIZED"
  | "UNKNOWN_ERROR"
  | "VALIDATION_FAILED";

/**
 * Enhanced AO Message with template metadata and natural language context
 */
export interface AOMessage {
  /** Optional data payload */
  data?: string;
  /** Message metadata */
  metadata?: AOMessageMetadata;
  /** Natural language context */
  nlContext?: NLMessageContext;
  /** Target process ID */
  processId: string;
  /** AO scheduler endpoint */
  scheduler: string;
  /** Wallet signer for authentication */
  signer: JWKInterface;
  /** Message tags for AO protocol */
  tags: Tag[];
  /** Template used to construct this message */
  template?: MessageTemplate;
}

/**
 * Batch of AO messages to send together
 */
export interface AOMessageBatch {
  /** Array of messages to send */
  messages: AOMessage[];
  /** Batch metadata */
  metadata?: BatchMetadata;
  /** Whether to send messages in parallel */
  parallel: boolean;
  /** Whether to stop on first error */
  stopOnError: boolean;
}

/**
 * Result of sending a batch of AO messages
 */
export interface AOMessageBatchResult {
  /** Any batch-level errors */
  errors: AOMessageError[];
  /** Results for individual messages */
  results: AOMessageResult[];
  /** Overall success status */
  success: boolean;
  /** Summary statistics */
  summary: BatchSummary;
}

/**
 * Error details for failed AO messages
 */
export interface AOMessageError {
  /** Error code */
  code: AOErrorCode;
  /** Technical error details */
  details?: any;
  /** Human-readable error message */
  message: string;
  /** Whether the error is retryable */
  retryable: boolean;
  /** Suggested fixes */
  suggestions?: string[];
}

/**
 * Real-time event for AO message operations
 */
export interface AOMessageEvent {
  /** Event data */
  data: any;
  /** Message ID associated with the event */
  messageId?: string;
  /** Process ID associated with the event */
  processId?: string;
  /** Event timestamp */
  timestamp: string;
  /** Event type */
  type:
    | "batch_completed"
    | "error_occurred"
    | "message_sent"
    | "response_received";
  /** User ID who triggered the event */
  userId?: string;
}

/**
 * Metadata for AO messages
 */
export interface AOMessageMetadata {
  /** Unique message identifier */
  messageId?: string;
  /** Whether this is a read-only operation */
  readOnly: boolean;
  /** Expected response format */
  responseFormat?: "custom" | "json" | "text";
  /** Retry configuration */
  retry?: RetryConfig;
  /** Timeout for message processing */
  timeout?: number;
  /** Custom validation rules */
  validation?: ValidationRule[];
}

/**
 * Response from an AO process
 */
export interface AOMessageResponse {
  /** Response data */
  data?: string;
  /** Parsed response object */
  parsedData?: any;
  /** Process that generated the response */
  processId: string;
  /** Response tags */
  tags?: Tag[];
  /** Response timestamp */
  timestamp: string;
  /** Response type */
  type: "error" | "partial" | "success";
}

/**
 * Result of sending an AO message
 */
export interface AOMessageResult {
  /** Error details if sending failed */
  error?: AOMessageError;
  /** Message ID returned by AO */
  messageId?: string;
  /** Metadata about the message sending */
  metadata: ResultMetadata;
  /** Response data from the process */
  response?: AOMessageResponse;
  /** Whether the message was sent successfully */
  success: boolean;
}

/**
 * Configuration for the AO message service
 */
export interface AOMessageServiceConfig {
  /** Cache TTL in milliseconds */
  cacheTTL: number;
  /** Default retry configuration */
  defaultRetry: RetryConfig;
  /** Default scheduler URL */
  defaultScheduler: string;
  /** Default timeout for messages */
  defaultTimeout: number;
  /** Whether to enable caching */
  enableCaching: boolean;
  /** Template registry */
  templateRegistry: TemplateRegistry;
}

/**
 * Statistics for AO message operations
 */
export interface AOMessageStats {
  /** Average response time */
  averageResponseTime: number;
  /** Most common error codes */
  commonErrors: Record<AOErrorCode, number>;
  /** Failed messages */
  failedMessages: number;
  /** Message volume by intent type */
  intentVolume: Record<string, number>;
  /** Process usage statistics */
  processUsage: Record<string, number>;
  /** Successful messages */
  successfulMessages: number;
  /** Total messages sent */
  totalMessages: number;
}

/**
 * Subscription for AO message events
 */
export interface AOMessageSubscription {
  /** Whether the subscription is active */
  active: boolean;
  /** Callback function for events */
  callback: (event: AOMessageEvent) => void;
  /** Event types to listen for */
  eventTypes: string[];
  /** Subscription ID */
  id: string;
  /** Process IDs to filter by */
  processIds?: string[];
  /** User IDs to filter by */
  userIds?: string[];
}

/**
 * Configuration for process creation with AO messages
 */
export interface AOProcessConfig extends ProcessCreationConfig {
  /** Initial message to send after process creation */
  initialMessage?: Omit<AOMessage, "processId" | "signer">;
  /** Initialization timeout in milliseconds */
  initTimeout: number;
  /** Tags to apply to the process itself */
  processTags?: Tag[];
  /** Whether to wait for process initialization */
  waitForInit: boolean;
}

/**
 * Metadata for message batches
 */
export interface BatchMetadata {
  /** Batch identifier */
  batchId: string;
  /** Description of the batch operation */
  description?: string;
  /** Expected total processing time */
  estimatedDuration?: number;
  /** User who created the batch */
  userId?: string;
}

/**
 * Summary statistics for batch operations
 */
export interface BatchSummary {
  /** Average time per message */
  averageTime: number;
  /** Total time taken */
  duration: number;
  /** Number of failed messages */
  failed: number;
  /** Number of successful messages */
  successful: number;
  /** Total number of messages */
  total: number;
}

/**
 * Cache entry for AO message responses
 */
export interface MessageCacheEntry {
  /** Cache expiry timestamp */
  expiresAt: number;
  /** Number of cache hits */
  hits: number;
  /** Cache key */
  key: string;
  /** Cached response */
  response: AOMessageResponse;
  /** Cache timestamp */
  timestamp: number;
}

/**
 * Natural language context for AO messages
 */
export interface NLMessageContext {
  /** Confidence level of parsing */
  confidence: "high" | "low" | "medium";
  /** Parsed intent type */
  intentType: string;
  /** Original natural language prompt */
  originalPrompt: string;
  /** Session ID for grouping related messages */
  sessionId?: string;
  /** Timestamp when message was created */
  timestamp: string;
  /** User ID who sent the message */
  userId?: string;
}

/**
 * Metadata about message sending result
 */
export interface ResultMetadata {
  /** Number of retry attempts made */
  attempts: number;
  /** Block height when message was processed */
  blockHeight?: number;
  /** Whether the result was cached */
  cached: boolean;
  /** Time taken to send the message */
  duration: number;
  /** Gas cost for the operation */
  gasCost?: string;
}

/**
 * Retry configuration for message sending
 */
export interface RetryConfig {
  /** Delay between retries in milliseconds */
  delay: number;
  /** Whether to use exponential backoff */
  exponentialBackoff: boolean;
  /** Maximum number of retry attempts */
  maxAttempts: number;
}

/**
 * Template mapping for natural language intents to AO message templates
 */
export interface TemplateMapping {
  /** Default values for template parameters */
  defaults?: Record<string, any>;
  /** Intent type this mapping applies to */
  intentType: string;
  /** Process types this mapping works with */
  processTypes: string[];
  /** Whether this mapping requires a new process */
  requiresNewProcess: boolean;
  /** Template to use for message construction */
  template: MessageTemplate;
}

/**
 * Registry of available message templates
 */
export interface TemplateRegistry {
  /** Default template for unknown intents */
  defaultTemplate: MessageTemplate;
  /** Map of intent type to available templates */
  intentMappings: Map<string, TemplateMapping[]>;
  /** Map of template ID to template definition */
  templates: Map<string, MessageTemplate>;
}

/**
 * Validation rule for message parameters
 */
export interface ValidationRule {
  /** Field to validate */
  field: string;
  /** Error message if validation fails */
  message: string;
  /** Validation pattern or function */
  rule: ((value: any) => boolean) | string;
  /** Validation type */
  type: "custom" | "format" | "range" | "required";
}
