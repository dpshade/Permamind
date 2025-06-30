import { JWKInterface } from "arweave/node/lib/wallet.js";
import { send } from "../process.js";
import {
  AOHandlerDefinition,
  AOMessageRequest,
  AOMessageResponse,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowValidationResult,
} from "../types/WorkflowDefinition.js";

/**
 * AOMessageService - Core service for constructing and sending AO messages
 * based on workflow definitions. This enables dynamic interaction with any
 * AO process without hardcoded tools.
 */
export class AOMessageService {
  constructor(private keyPair: JWKInterface) {}

  /**
   * Execute a message to an AO process based on workflow definition
   */
  async executeMessage(
    workflowDefinition: WorkflowDefinition,
    request: AOMessageRequest,
  ): Promise<AOMessageResponse> {
    const startTime = Date.now();

    try {
      // Validate the request against the workflow definition
      const validation = this.validateRequest(workflowDefinition, request);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: "VALIDATION_FAILED",
            message: "Request validation failed",
            details: validation.errors,
          },
          executionTime: Date.now() - startTime,
          metadata: {
            handler: request.handler,
            processId: request.processId,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Find the specified handler
      const handler = workflowDefinition.handlers.find(
        (h) => h.name === request.handler,
      );
      if (!handler) {
        return {
          success: false,
          error: {
            code: "HANDLER_NOT_FOUND",
            message: `Handler '${request.handler}' not found in workflow definition`,
          },
          executionTime: Date.now() - startTime,
          metadata: {
            handler: request.handler,
            processId: request.processId,
            timestamp: new Date().toISOString(),
          },
        };
      }

      // Construct the message based on handler schema
      const constructedMessage = this.constructMessage(handler, request);

      // Create execution context for debugging/logging
      const context: WorkflowExecutionContext = {
        workflowDefinition,
        selectedHandler: handler,
        userRequest: JSON.stringify(request.parameters),
        constructedMessage,
      };

      // Send the message using existing AO infrastructure
      const rawResponse = await send(
        this.keyPair,
        constructedMessage.processId,
        constructedMessage.tags,
        constructedMessage.data || null,
      );

      // Process the response based on handler's response patterns
      const processedResponse = this.processResponse(handler, rawResponse);

      return {
        success: true,
        data: processedResponse,
        rawResponse,
        executionTime: Date.now() - startTime,
        metadata: {
          handler: request.handler,
          processId: request.processId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error,
        },
        executionTime: Date.now() - startTime,
        metadata: {
          handler: request.handler,
          processId: request.processId,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  /**
   * Construct AO message tags and data based on handler schema and request parameters
   */
  private constructMessage(
    handler: AOHandlerDefinition,
    request: AOMessageRequest,
  ): {
    processId: string;
    tags: { name: string; value: string }[];
    data?: string;
  } {
    const tags: { name: string; value: string }[] = [];

    // Process each tag in the handler's message schema
    for (const tagSchema of handler.messageSchema.tags) {
      let value: string;

      if (tagSchema.name === "Action") {
        // Action tag is always the handler's action
        value = handler.messageSchema.action;
      } else {
        // Look for the tag value in request parameters
        const paramKey = this.findParameterKey(
          tagSchema.name,
          request.parameters,
        );
        if (paramKey && request.parameters[paramKey] !== undefined) {
          value = String(request.parameters[paramKey]);
        } else if (tagSchema.required) {
          throw new Error(
            `Required tag '${tagSchema.name}' not found in request parameters`,
          );
        } else {
          // Skip optional tags that aren't provided
          continue;
        }
      }

      tags.push({ name: tagSchema.name, value });
    }

    // Handle data field if specified in schema
    let data: string | undefined;
    if (handler.messageSchema.data) {
      if (request.data) {
        data = request.data;
      } else if (handler.messageSchema.data.required) {
        throw new Error("Required data field not provided in request");
      }
    }

    return {
      processId: request.processId,
      tags,
      data,
    };
  }

  /**
   * Find parameter key that matches tag name (case-insensitive, flexible matching)
   */
  private findParameterKey(
    tagName: string,
    parameters: Record<string, any>,
  ): string | undefined {
    // Direct match
    if (parameters[tagName] !== undefined) {
      return tagName;
    }

    // Case-insensitive match
    const lowerTagName = tagName.toLowerCase();
    for (const [key, value] of Object.entries(parameters)) {
      if (key.toLowerCase() === lowerTagName) {
        return key;
      }
    }

    // Common variations
    const variations = [
      tagName.replace(/[-_]/g, ""), // Remove dashes/underscores
      tagName.replace(/([A-Z])/g, "_$1").toLowerCase(), // camelCase to snake_case
      tagName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), // snake_case to camelCase
    ];

    for (const variation of variations) {
      if (parameters[variation] !== undefined) {
        return variation;
      }
    }

    return undefined;
  }

  /**
   * Process raw AO response based on handler's response patterns
   */
  private processResponse(handler: AOHandlerDefinition, rawResponse: any): any {
    // If no response patterns defined, return raw response
    if (!handler.responsePatterns || handler.responsePatterns.length === 0) {
      return rawResponse;
    }

    // Try to match response against each pattern
    for (const pattern of handler.responsePatterns) {
      if (this.matchesResponsePattern(pattern, rawResponse)) {
        return this.formatResponse(pattern, rawResponse);
      }
    }

    // If no patterns match, return raw response with warning
    return {
      _warning: "Response did not match any expected patterns",
      _rawResponse: rawResponse,
    };
  }

  /**
   * Check if response matches a given pattern
   */
  private matchesResponsePattern(pattern: any, response: any): boolean {
    // Simple pattern matching - can be enhanced based on actual response structures
    if (pattern.indicators.tags) {
      // Check if response has expected tags
      if (!response.Tags) return false;

      for (const tagPattern of pattern.indicators.tags) {
        const responseTag = response.Tags.find(
          (tag: any) => tag.name === tagPattern.name,
        );
        if (!responseTag || !tagPattern.values.includes(responseTag.value)) {
          return false;
        }
      }
    }

    if (pattern.indicators.errorCodes && response.Error) {
      return pattern.indicators.errorCodes.includes(response.Error);
    }

    return true;
  }

  /**
   * Format response according to pattern specification
   */
  private formatResponse(pattern: any, response: any): any {
    if (pattern.format.structured && pattern.format.dataType === "json") {
      try {
        if (response.Data) {
          return JSON.parse(response.Data);
        }
      } catch (error) {
        return {
          _parseError: "Failed to parse JSON response",
          _rawData: response.Data,
        };
      }
    }

    // For non-structured or other formats, return appropriate data
    return response.Data || response;
  }

  /**
   * Validate request against workflow definition
   */
  private validateRequest(
    workflowDefinition: WorkflowDefinition,
    request: AOMessageRequest,
  ): WorkflowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if handler exists
    const handler = workflowDefinition.handlers.find(
      (h) => h.name === request.handler,
    );
    if (!handler) {
      errors.push(`Handler '${request.handler}' not found`);
      suggestions.push(
        `Available handlers: ${workflowDefinition.handlers.map((h) => h.name).join(", ")}`,
      );
      return { valid: false, errors, warnings, suggestions };
    }

    // Check if process ID matches
    if (request.processId !== workflowDefinition.processId) {
      warnings.push(
        `Process ID mismatch: expected ${workflowDefinition.processId}, got ${request.processId}`,
      );
    }

    // Validate required parameters are present
    for (const tagSchema of handler.messageSchema.tags) {
      if (tagSchema.required && tagSchema.name !== "Action") {
        const paramKey = this.findParameterKey(
          tagSchema.name,
          request.parameters,
        );
        if (!paramKey || request.parameters[paramKey] === undefined) {
          errors.push(`Required parameter '${tagSchema.name}' is missing`);
          if (tagSchema.examples) {
            suggestions.push(
              `Examples for '${tagSchema.name}': ${tagSchema.examples.join(", ")}`,
            );
          }
        }
      }
    }

    // Check data requirements
    if (handler.messageSchema.data?.required && !request.data) {
      errors.push("Data field is required for this handler");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Get workflow capabilities and help information
   */
  getWorkflowInfo(workflowDefinition: WorkflowDefinition): {
    capabilities: string[];
    handlers: string[];
    documentation: string;
  } {
    return {
      capabilities: workflowDefinition.capabilities,
      handlers: workflowDefinition.handlers.map((h) => h.name),
      documentation: this.generateDocumentation(workflowDefinition),
    };
  }

  /**
   * Generate human-readable documentation for a workflow
   */
  private generateDocumentation(
    workflowDefinition: WorkflowDefinition,
  ): string {
    let doc = `# ${workflowDefinition.name}

`;
    doc += `${workflowDefinition.description}

`;
    doc += `**Process ID:** ${workflowDefinition.processId}
`;
    doc += `**Version:** ${workflowDefinition.version}
`;
    doc += `**Category:** ${workflowDefinition.category}
`;
    doc += `**Capabilities:** ${workflowDefinition.capabilities.join(", ")}

`;

    doc += `## Available Handlers

`;
    for (const handler of workflowDefinition.handlers) {
      doc += `### ${handler.name}
`;
      doc += `${handler.description}

`;
      doc += `**Required Parameters:**
`;
      for (const tag of handler.messageSchema.tags) {
        if (tag.required && tag.name !== "Action") {
          doc += `- ${tag.name}: ${tag.description || "No description"}
`;
          if (tag.examples) {
            doc += `  Examples: ${tag.examples.join(", ")}
`;
          }
        }
      }
      doc += `
`;
    }

    return doc;
  }
}
