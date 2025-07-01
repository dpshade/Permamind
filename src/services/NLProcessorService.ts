import {
  ConfidenceLevel,
  IntentType,
  MessageIntent,
  MessageParams,
  NLProcessingContext,
  NLProcessingError,
  NLProcessingResult,
  ProcessType,
} from "../models/MessageIntent.js";

// Regular expressions for intent matching
const INTENT_PATTERNS = {
  balance: [
    /(?:get|check|show|what(?:'s|is))\s+(?:my\s+)?(?:token\s+)?balance/i,
    /balance\s+(?:of\s+)?(\w+)?/i,
    /how\s+many\s+(\w+)?\s*(?:tokens?)?\s+(?:do\s+)?i\s+have/i,
  ],
  create_process: [
    /(?:create|launch|deploy|make)\s+(?:a\s+)?(\w+)\s+(?:contract|process)/i,
    /new\s+(\w+)\s+(?:contract|process)/i,
    /spawn\s+(?:a\s+)?(\w+)\s+process/i,
  ],
  create_token: [
    /(?:launch|create|deploy)\s+(?:a\s+)?token\s+(?:called\s+)?(\w+)/i,
    /make\s+(?:a\s+)?token\s+(?:named\s+)?(\w+)/i,
    /new\s+token\s+(\w+)/i,
  ],
  custom_message: [
    /send\s+(?:message|msg)\s+to\s+(?:process\s+)?([A-Za-z0-9_-]+)\s+with\s+action\s+(\w+)/i,
    /message\s+([A-Za-z0-9_-]+)\s+(?:with\s+)?action[:\s]+(\w+)/i,
    /call\s+([A-Za-z0-9_-]+)\s+(?:with\s+)?(\w+)/i,
  ],
  eval_code: [
    /(?:evaluate|eval|run|execute)\s+(?:this\s+)?(?:lua\s+)?code/i,
    /run\s+lua[:\s]+/i,
  ],
  query_state: [
    /(?:what|show|get)\s+(?:is\s+)?(?:the\s+)?(?:current\s+)?state/i,
    /check\s+status/i,
    /info\s+(?:about\s+)?([A-Za-z0-9_-]+)/i,
  ],
  transfer: [
    /send\s+(\w+)\s+(\d+(?:\.\d+)?)\s*(\w+)?/i, // "send alice 10 AO"
    /transfer\s+(\d+(?:\.\d+)?)\s*(\w+)?\s+to\s+(\w+)/i, // "transfer 10 AO to alice"
    /give\s+(\w+)\s+(\d+(?:\.\d+)?)\s*(\w+)?/i, // "give alice 10 tokens"
  ],
} as const;

// Common token symbols and their variations
const TOKEN_SYMBOLS = {
  ao: ["ao", "aos"],
  ar: ["ar", "arweave"],
  flow: ["flow"],
  test: ["test", "testing"],
} as const;

// Process type patterns
const PROCESS_TYPE_PATTERNS = {
  marketplace: /market|trade|exchange|shop/i,
  registry: /registry|directory|list/i,
  token: /token|currency|coin/i,
  voting: /voting|governance|dao|poll/i,
} as const;

// Validation utilities
const isValidProcessId = (processId: string): boolean =>
  /^[A-Za-z0-9_-]{43}$/.test(processId);

const isValidAmount = (amount: string): boolean =>
  /^\d+(?:\.\d+)?$/.test(amount) && parseFloat(amount) > 0;

const isValidTokenSymbol = (symbol: string): boolean =>
  /^[A-Z]{2,10}$/.test(symbol.toUpperCase());

export interface NLProcessorService {
  /**
   * Extract parameters from prompt based on intent type
   */
  extractParameters: (
    prompt: string,
    intentType: IntentType,
  ) => Promise<MessageParams>;

  /**
   * Suggest alternative interpretations for ambiguous prompts
   */
  getAlternativeIntents: (prompt: string) => Promise<MessageIntent[]>;

  /**
   * Parse natural language prompt into structured intent
   */
  parseIntent: (
    prompt: string,
    context?: NLProcessingContext,
  ) => Promise<MessageIntent>;

  /**
   * Process complete natural language request
   */
  processRequest: (
    prompt: string,
    context?: NLProcessingContext,
  ) => Promise<NLProcessingResult>;

  /**
   * Determine if request requires new process creation
   */
  requiresProcessCreation: (intent: MessageIntent) => boolean;

  /**
   * Validate extracted parameters
   */
  validateParameters: (
    params: MessageParams,
    intentType: IntentType,
  ) => NLProcessingError[];
}

class NLProcessorServiceImpl implements NLProcessorService {
  async extractParameters(
    prompt: string,
    intentType: IntentType,
  ): Promise<MessageParams> {
    const params: MessageParams = {};
    const normalizedPrompt = prompt.trim();

    switch (intentType) {
      case "balance":
        params.token = this.extractToken(normalizedPrompt) || "AO";
        break;

      case "create_process":
        params.processName = this.extractProcessName(normalizedPrompt);
        params.description = this.extractDescription(normalizedPrompt);
        break;

      case "create_token":
        params.tokenName = this.extractTokenName(normalizedPrompt);
        params.tokenSymbol = this.extractTokenSymbol(normalizedPrompt);
        params.tokenDenomination = this.extractDenomination(normalizedPrompt);
        break;

      case "custom_message":
        params.processId = this.extractProcessId(normalizedPrompt);
        params.action = this.extractAction(normalizedPrompt);
        params.customTags = this.extractCustomTags(normalizedPrompt);
        params.data = this.extractData(normalizedPrompt);
        break;

      case "eval_code":
        params.luaCode = this.extractLuaCode(normalizedPrompt);
        break;

      case "query_state":
        params.processId = this.extractProcessId(normalizedPrompt);
        params.queryType = this.extractQueryType(normalizedPrompt);
        break;

      case "transfer":
        params.recipient = this.extractRecipient(normalizedPrompt);
        params.amount = this.extractAmount(normalizedPrompt);
        params.token = this.extractToken(normalizedPrompt) || "AO";
        break;
    }

    return params;
  }

  async getAlternativeIntents(prompt: string): Promise<MessageIntent[]> {
    const alternatives: MessageIntent[] = [];

    // Generate alternative interpretations by trying different patterns
    const intentTypes: IntentType[] = [
      "transfer",
      "balance",
      "create_token",
      "create_process",
      "custom_message",
    ];

    for (const type of intentTypes) {
      try {
        const params = await this.extractParameters(prompt, type);
        const hasValidParams = this.hasMinimumValidParams(params, type);

        if (hasValidParams) {
          alternatives.push({
            confidence: "low",
            extractedParams: params,
            originalPrompt: prompt,
            processType: this.determineProcessType(type, params),
            requiresProcessCreation: this.determineProcessCreationNeed(
              type,
              params,
            ),
            type,
          });
        }
      } catch {
        // Skip if extraction fails
      }
    }

    return alternatives;
  }

  async parseIntent(
    prompt: string,
    context?: NLProcessingContext,
  ): Promise<MessageIntent> {
    const normalizedPrompt = prompt.trim().toLowerCase();

    // Try to match against known patterns
    for (const [type, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedPrompt)) {
          const confidence = this.calculateConfidence(
            normalizedPrompt,
            pattern,
          );
          const extractedParams = await this.extractParameters(
            prompt,
            type as IntentType,
          );

          return {
            confidence,
            extractedParams,
            originalPrompt: prompt,
            processType: this.determineProcessType(
              type as IntentType,
              extractedParams,
            ),
            requiresProcessCreation: this.determineProcessCreationNeed(
              type as IntentType,
              extractedParams,
            ),
            type: type as IntentType,
          };
        }
      }
    }

    // Fallback to unknown intent
    return {
      confidence: "low",
      extractedParams: {},
      originalPrompt: prompt,
      requiresProcessCreation: false,
      type: "unknown",
    };
  }

  async processRequest(
    prompt: string,
    context?: NLProcessingContext,
  ): Promise<NLProcessingResult> {
    const intent = await this.parseIntent(prompt, context);
    const errors = this.validateParameters(intent.extractedParams, intent.type);
    const suggestions = this.generateSuggestions(intent, errors);

    let alternativeIntents: MessageIntent[] = [];
    if (intent.confidence === "low" || intent.type === "unknown") {
      alternativeIntents = await this.getAlternativeIntents(prompt);
    }

    return {
      alternativeIntents:
        alternativeIntents.length > 0 ? alternativeIntents : undefined,
      errors,
      intent,
      suggestions,
    };
  }

  requiresProcessCreation(intent: MessageIntent): boolean {
    return intent.requiresProcessCreation;
  }

  validateParameters(
    params: MessageParams,
    intentType: IntentType,
  ): NLProcessingError[] {
    const errors: NLProcessingError[] = [];

    switch (intentType) {
      case "create_token":
        if (!params.tokenName) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "tokenName",
            message: "Token name is required",
            suggestion: "Please specify the token name",
          });
        }
        if (params.tokenSymbol && !isValidTokenSymbol(params.tokenSymbol)) {
          errors.push({
            code: "INVALID_PARAM_FORMAT",
            field: "tokenSymbol",
            message: "Invalid token symbol format",
            suggestion: "Token symbol should be 2-10 uppercase letters",
          });
        }
        break;

      case "custom_message":
        if (!params.processId) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "processId",
            message: "Process ID is required",
            suggestion: "Please specify the target process ID",
          });
        } else if (!isValidProcessId(params.processId)) {
          errors.push({
            code: "INVALID_PARAM_FORMAT",
            field: "processId",
            message: "Invalid process ID format",
            suggestion:
              "Process ID should be 43 characters of letters, numbers, - or _",
          });
        }
        if (!params.action) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "action",
            message: "Action is required",
            suggestion: "Please specify the action to perform",
          });
        }
        break;

      case "eval_code":
        if (!params.luaCode) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "luaCode",
            message: "Lua code is required",
            suggestion: "Please provide the Lua code to evaluate",
          });
        }
        break;

      case "transfer":
        if (!params.recipient) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "recipient",
            message: "Recipient is required for transfer",
            suggestion: "Please specify who to send tokens to",
          });
        }
        if (!params.amount) {
          errors.push({
            code: "MISSING_REQUIRED_PARAM",
            field: "amount",
            message: "Amount is required for transfer",
            suggestion: "Please specify how many tokens to send",
          });
        } else if (!isValidAmount(params.amount)) {
          errors.push({
            code: "INVALID_PARAM_FORMAT",
            field: "amount",
            message: "Invalid amount format",
            suggestion: "Amount must be a positive number",
          });
        }
        break;
    }

    return errors;
  }

  // Private helper methods
  private calculateConfidence(
    prompt: string,
    pattern: RegExp,
  ): ConfidenceLevel {
    const match = prompt.match(pattern);
    if (!match) return "low";

    // Higher confidence for more specific matches
    const specificity = match.length - 1; // Number of capture groups
    if (specificity >= 3) return "high";
    if (specificity >= 2) return "medium";
    return "low";
  }

  private determineProcessCreationNeed(
    type: IntentType,
    params: MessageParams,
  ): boolean {
    switch (type) {
      case "create_process":
      case "create_token":
        return true;
      case "eval_code":
        return !params.processId; // Create new process if no target specified
      default:
        return false;
    }
  }

  private determineProcessType(
    type: IntentType,
    params: MessageParams,
  ): ProcessType | undefined {
    switch (type) {
      case "create_process":
        if (params.processName) {
          for (const [processType, pattern] of Object.entries(
            PROCESS_TYPE_PATTERNS,
          )) {
            if (pattern.test(params.processName)) {
              return processType as ProcessType;
            }
          }
        }
        return "custom";
      case "create_token":
        return "token";
      case "eval_code":
        return "basic";
      default:
        return undefined;
    }
  }

  private extractAction(prompt: string): string | undefined {
    const patterns = [
      /action\s+(\w+)/i,
      /with\s+(\w+)/i,
      /call\s+\w+\s+(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractAmount(prompt: string): string | undefined {
    const match = prompt.match(/(\d+(?:\.\d+)?)/);
    return match ? match[1] : undefined;
  }

  private extractCustomTags(
    prompt: string,
  ): Record<string, string> | undefined {
    const tags: Record<string, string> = {};
    const tagPattern = /(\w+):\s*([^,\s]+)/g;
    let match;

    while ((match = tagPattern.exec(prompt)) !== null) {
      tags[match[1]] = match[2];
    }

    return Object.keys(tags).length > 0 ? tags : undefined;
  }

  private extractData(prompt: string): string | undefined {
    const match = prompt.match(/data[:\s]+(.+)/i);
    return match ? match[1].trim() : undefined;
  }

  private extractDenomination(prompt: string): number | undefined {
    const match = prompt.match(/(?:denomination|decimals?)\s+(\d+)/i);
    return match ? parseInt(match[1]) : undefined;
  }

  private extractDescription(prompt: string): string | undefined {
    const match = prompt.match(/(?:description|desc)[:\s]+(.+)/i);
    return match ? match[1].trim() : undefined;
  }

  private extractLuaCode(prompt: string): string | undefined {
    // Look for code blocks or inline code
    const patterns = [
      /```(?:lua)?\s*([\s\S]*?)\s*```/i,
      /`([^`]+)`/,
      /code[:\s]+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return match[1].trim();
    }
    return undefined;
  }

  private extractProcessId(prompt: string): string | undefined {
    const patterns = [
      /process\s+([A-Za-z0-9_-]{43})/i,
      /to\s+([A-Za-z0-9_-]{43})/i,
      /([A-Za-z0-9_-]{43})/,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && isValidProcessId(match[1])) {
        return match[1];
      }
    }
    return undefined;
  }

  private extractProcessName(prompt: string): string | undefined {
    const match = prompt.match(
      /(?:create|launch|deploy|make)\s+(?:a\s+)?(\w+(?:\s+\w+)*)\s+(?:contract|process)/i,
    );
    return match ? match[1] : undefined;
  }

  private extractQueryType(prompt: string): string | undefined {
    const patterns = [
      /(?:get|show|check)\s+(\w+)/i,
      /what(?:'s|is)\s+(?:the\s+)?(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return match[1];
    }
    return "status"; // Default query type
  }

  private extractRecipient(prompt: string): string | undefined {
    const patterns = [/send\s+(\w+)/i, /to\s+(\w+)/i, /give\s+(\w+)/i];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractToken(prompt: string): string | undefined {
    const upperPrompt = prompt.toUpperCase();

    for (const [symbol, variations] of Object.entries(TOKEN_SYMBOLS)) {
      for (const variation of variations) {
        if (upperPrompt.includes(variation.toUpperCase())) {
          return symbol.toUpperCase();
        }
      }
    }

    // Look for token symbols (2-10 uppercase letters)
    const match = prompt.match(/\b([A-Z]{2,10})\b/);
    if (match && isValidTokenSymbol(match[1])) {
      return match[1];
    }

    return undefined;
  }

  private extractTokenName(prompt: string): string | undefined {
    const patterns = [
      /(?:launch|create|deploy)\s+(?:a\s+)?token\s+(?:called|named)\s+(\w+)/i, // "launch token called Flow"
      /(?:token|currency)\s+(?:called|named)\s+(\w+)/i,
      /(?:launch|create|deploy)\s+(?:a\s+)?token\s+(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match) return match[1];
    }
    return undefined;
  }

  private extractTokenSymbol(prompt: string): string | undefined {
    const token = this.extractToken(prompt);
    if (token) return token;

    // Try to extract from token name
    const tokenName = this.extractTokenName(prompt);
    if (tokenName) {
      return tokenName.substring(0, 4).toUpperCase();
    }

    return undefined;
  }

  private generateSuggestions(
    intent: MessageIntent,
    errors: NLProcessingError[],
  ): string[] {
    const suggestions: string[] = [];

    if (intent.type === "unknown") {
      suggestions.push(
        "Try rephrasing your request with clearer action words like 'send', 'create', 'launch', or 'get'",
        "Examples: 'send alice 10 AO', 'launch token called Flow', 'get my balance'",
      );
    }

    if (errors.length > 0) {
      suggestions.push("Please fix the following issues:");
      suggestions.push(...errors.map((e) => `- ${e.message}: ${e.suggestion}`));
    }

    if (intent.confidence === "low") {
      suggestions.push(
        "Your request was unclear. Consider being more specific about:",
      );
      switch (intent.type) {
        case "create_token":
          suggestions.push("- Token name", "- Token symbol (optional)");
          break;
        case "custom_message":
          suggestions.push("- Target process ID", "- Action to perform");
          break;
        case "transfer":
          suggestions.push(
            "- Who to send to",
            "- How much to send",
            "- Which token",
          );
          break;
      }
    }

    return suggestions;
  }

  private hasMinimumValidParams(
    params: MessageParams,
    type: IntentType,
  ): boolean {
    switch (type) {
      case "create_token":
        return !!params.tokenName;
      case "custom_message":
        return !!(params.processId || params.action);
      case "eval_code":
        return !!params.luaCode;
      case "transfer":
        return !!(params.recipient || params.amount);
      default:
        return true;
    }
  }
}

// Export singleton instance
export const nlProcessorService: NLProcessorService =
  new NLProcessorServiceImpl();
