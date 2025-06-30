import { JWKInterface } from "arweave/node/lib/wallet.js";
import { send } from "../process.js";

/**
 * MarkdownWorkflowService - Intelligent service for parsing markdown workflows
 * and extracting AO message parameters from natural language requests.
 * 
 * This service enables AI to interpret human-readable workflow documentation
 * and construct complete AO messages from natural language input.
 */
export class MarkdownWorkflowService {
  constructor(private keyPair: JWKInterface) {}

  /**
   * Execute a natural language request against a markdown workflow
   */
  async executeWorkflowRequest(
    markdownWorkflow: string,
    userRequest: string,
    processId?: string
  ): Promise<{
    success: boolean;
    data?: any;
    rawResponse?: any;
    executionTime?: number;
    reasoningChain?: string[];
    error?: {
      code: string;
      message: string;
      details?: any;
    };
  }> {
    const startTime = Date.now();
    
    try {
      // Parse the workflow to extract process metadata
      const workflowInfo = this.parseWorkflowMetadata(markdownWorkflow);
      const targetProcessId = processId || workflowInfo.processId;
      
      if (!targetProcessId || targetProcessId === "YOUR_TOKEN_PROCESS_ID_HERE") {
        return {
          success: false,
          error: {
            code: "MISSING_PROCESS_ID",
            message: "Process ID not specified in workflow or parameters"
          },
          executionTime: Date.now() - startTime
        };
      }

      // Use AI reasoning to extract message components from workflow + request
      const messageComponents = await this.extractMessageComponents(
        markdownWorkflow,
        userRequest
      );

      if (!messageComponents.action) {
        return {
          success: false,
          error: {
            code: "CANNOT_PARSE_REQUEST",
            message: "Could not determine action from user request",
            details: { userRequest, reasoningChain: messageComponents.reasoningChain }
          },
          executionTime: Date.now() - startTime
        };
      }

      // Construct AO message tags
      const tags = this.constructAOMessage(messageComponents);

      // Send the message
      const rawResponse = await send(
        this.keyPair,
        targetProcessId,
        tags,
        messageComponents.data || null
      );

      // Format the response
      const formattedResponse = this.formatResponse(
        rawResponse,
        messageComponents.action,
        markdownWorkflow
      );

      return {
        success: true,
        data: formattedResponse,
        rawResponse,
        executionTime: Date.now() - startTime,
        reasoningChain: messageComponents.reasoningChain
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: "EXECUTION_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
          details: error
        },
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Parse workflow metadata from markdown
   */
  private parseWorkflowMetadata(markdownWorkflow: string): {
    processId?: string;
    name?: string;
    category?: string;
    decimals?: number;
  } {
    const metadata: any = {};
    
    // Extract process ID
    const processIdMatch = markdownWorkflow.match(/\*\*Process ID:\*\*\s*`([^`]+)`/);
    if (processIdMatch) {
      metadata.processId = processIdMatch[1];
    }

    // Extract name from title
    const nameMatch = markdownWorkflow.match(/^#\s+(.+)/m);
    if (nameMatch) {
      metadata.name = nameMatch[1];
    }

    // Extract category
    const categoryMatch = markdownWorkflow.match(/\*\*Category:\*\*\s*(\w+)/);
    if (categoryMatch) {
      metadata.category = categoryMatch[1];
    }

    // Extract decimals configuration
    const decimalsMatch = markdownWorkflow.match(/\*\*Decimals:\*\*\s*(\d+)/);
    if (decimalsMatch) {
      metadata.decimals = parseInt(decimalsMatch[1]);
    }

    return metadata;
  }

  /**
   * Use AI reasoning to extract message components from workflow + user request
   */
  private async extractMessageComponents(
    markdownWorkflow: string,
    userRequest: string
  ): Promise<{
    action?: string;
    parameters: Record<string, string>;
    data?: string;
    reasoningChain: string[];
  }> {
    const reasoningChain: string[] = [];
    const result = {
      action: undefined as string | undefined,
      parameters: {} as Record<string, string>,
      data: undefined as string | undefined,
      reasoningChain
    };

    // Step 1: Identify the action from user request
    reasoningChain.push(`Analyzing user request: "${userRequest}"`);
    
    const actionMapping = this.extractActionMapping(markdownWorkflow);
    const detectedAction = this.detectAction(userRequest, actionMapping);
    
    if (detectedAction) {
      result.action = detectedAction;
      reasoningChain.push(`Detected action: ${detectedAction}`);
    } else {
      reasoningChain.push("Could not detect action from user request");
      return result;
    }

    // Step 2: Extract parameters based on the action
    const actionSection = this.extractActionSection(markdownWorkflow, detectedAction);
    if (actionSection) {
      const parameters = this.extractParametersFromRequest(
        userRequest,
        actionSection,
        markdownWorkflow
      );
      
      result.parameters = parameters.params;
      reasoningChain.push(...parameters.reasoning);
    }

    return result;
  }

  /**
   * Extract action mapping from workflow documentation
   */
  private extractActionMapping(markdownWorkflow: string): Record<string, string[]> {
    const mapping: Record<string, string[]> = {};
    
    // Find all action sections
    const actionSections = markdownWorkflow.split(/^### /m).slice(1);
    
    for (const section of actionSections) {
      const lines = section.split('\n');
      const actionName = lines[0].trim();
      
      // Look for natural language examples
      const exampleSection = section.match(/\*\*Natural Language Examples:\*\*(.*?)(?=\*\*|$)/s);
      if (exampleSection) {
        const examples = exampleSection[1];
        const keywords = this.extractKeywordsFromExamples(examples);
        mapping[actionName] = keywords;
      }
    }
    
    return mapping;
  }

  /**
   * Extract keywords from natural language examples
   */
  private extractKeywordsFromExamples(examples: string): string[] {
    const keywords: string[] = [];
    
    // Extract quoted examples and find action keywords
    const quotedExamples = examples.match(/"([^"]+)"/g) || [];
    
    for (const example of quotedExamples) {
      const text = example.replace(/"/g, '').toLowerCase();
      
      // Extract action verbs
      const actionWords = text.match(/\b(transfer|send|move|check|balance|mint|create|burn|destroy|approve|allow|info|details|allowance)\b/g) || [];
      keywords.push(...actionWords);
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Detect action from user request using keyword matching
   */
  private detectAction(userRequest: string, actionMapping: Record<string, string[]>): string | undefined {
    const requestLower = userRequest.toLowerCase();
    
    for (const [action, keywords] of Object.entries(actionMapping)) {
      for (const keyword of keywords) {
        if (requestLower.includes(keyword)) {
          return action;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract the documentation section for a specific action
   */
  private extractActionSection(markdownWorkflow: string, action: string): string | undefined {
    const sections = markdownWorkflow.split(/^### /m);
    
    for (const section of sections) {
      if (section.trim().startsWith(action)) {
        return section;
      }
    }
    
    return undefined;
  }

  /**
   * Extract parameters from user request based on action documentation
   */
  private extractParametersFromRequest(
    userRequest: string,
    actionSection: string,
    fullWorkflow: string
  ): { params: Record<string, string>; reasoning: string[] } {
    const params: Record<string, string> = {};
    const reasoning: string[] = [];
    
    // Get workflow metadata for conversions
    const metadata = this.parseWorkflowMetadata(fullWorkflow);
    const decimals = metadata.decimals || 12;
    
    // Extract parameter mapping information from the action section
    const mappingSection = actionSection.match(/\*\*Parameter Mapping:\*\*(.*?)(?=\*\*|$)/s);
    if (!mappingSection) {
      reasoning.push("No parameter mapping found in action section");
      return { params, reasoning };
    }
    
    const mappingText = mappingSection[1];
    
    // Extract different types of parameters based on common patterns
    
    // 1. Extract recipient/target addresses
    const recipientPatterns = [
      /(?:to|for)\s+([a-zA-Z0-9]+)/i,
      /recipient\s*:?\s*([a-zA-Z0-9]+)/i,
      /(alice|bob|carol|dave|eve)/i,
      /([a-z0-9]{43})/i, // AO process ID pattern
      /([a-z0-9]{10,}\.{3})/i // Abbreviated address pattern
    ];
    
    for (const pattern of recipientPatterns) {
      const match = userRequest.match(pattern);
      if (match) {
        params.Recipient = match[1];
        params.Target = match[1];
        params.To = match[1];
        params.Spender = match[1];
        reasoning.push(`Extracted recipient/target: ${match[1]}`);
        break;
      }
    }

    // 2. Extract "from" addresses (for TransferFrom, Allowance)
    const fromPatterns = [
      /from\s+([a-zA-Z0-9]+)/i,
      /([a-zA-Z0-9]+)\s+to\s+/i
    ];
    
    for (const pattern of fromPatterns) {
      const match = userRequest.match(pattern);
      if (match) {
        params.From = match[1];
        params.Owner = match[1];
        reasoning.push(`Extracted from/owner address: ${match[1]}`);
        break;
      }
    }

    // 3. Extract token amounts and convert to smallest units
    const amountPatterns = [
      /(\d+(?:\.\d+)?)\s*tokens?/i,
      /(\d+(?:\.\d+)?)\s*(?:amount|quantity)/i,
      /^(\d+(?:\.\d+)?)$/i
    ];
    
    for (const pattern of amountPatterns) {
      const match = userRequest.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const smallestUnits = (amount * Math.pow(10, decimals)).toString();
        params.Quantity = smallestUnits;
        reasoning.push(`Extracted amount: ${amount} tokens = ${smallestUnits} smallest units`);
        break;
      }
    }

    return { params, reasoning };
  }

  /**
   * Construct AO message tags from extracted components
   */
  private constructAOMessage(components: {
    action?: string;
    parameters: Record<string, string>;
    data?: string;
  }): { name: string; value: string }[] {
    const tags: { name: string; value: string }[] = [];
    
    // Always add the Action tag first
    if (components.action) {
      tags.push({ name: "Action", value: components.action });
    }
    
    // Add parameter tags
    for (const [key, value] of Object.entries(components.parameters)) {
      if (value && value.trim()) {
        tags.push({ name: key, value: value.trim() });
      }
    }
    
    return tags;
  }

  /**
   * Format the response based on action type and expected patterns
   */
  private formatResponse(
    rawResponse: any,
    action: string,
    markdownWorkflow: string
  ): any {
    // For now, return the raw response
    // In the future, this could parse expected response patterns from the workflow
    if (rawResponse && typeof rawResponse === 'object' && rawResponse.Data) {
      try {
        // Try to parse JSON responses
        const parsed = JSON.parse(rawResponse.Data);
        return parsed;
      } catch {
        // Return raw data if not JSON
        return rawResponse.Data;
      }
    }
    
    return rawResponse;
  }

  /**
   * Get available actions from a markdown workflow
   */
  getAvailableActions(markdownWorkflow: string): string[] {
    const actions: string[] = [];
    const sections = markdownWorkflow.split(/^### /m).slice(1);
    
    for (const section of sections) {
      const actionName = section.split('\n')[0].trim();
      if (actionName && !actionName.includes('Configuration') && !actionName.includes('Notes')) {
        actions.push(actionName);
      }
    }
    
    return actions;
  }

  /**
   * Generate workflow documentation summary
   */
  generateWorkflowSummary(markdownWorkflow: string): string {
    const metadata = this.parseWorkflowMetadata(markdownWorkflow);
    const actions = this.getAvailableActions(markdownWorkflow);
    
    let summary = `# ${metadata.name || 'AO Workflow'}\n\n`;
    
    if (metadata.processId) {
      summary += `**Process ID:** ${metadata.processId}\n`;
    }
    if (metadata.category) {
      summary += `**Category:** ${metadata.category}\n`;
    }
    
    summary += `\n**Available Actions:** ${actions.join(', ')}\n\n`;
    summary += `This workflow supports natural language requests. You can use phrases like:\n`;
    
    // Extract example phrases from the workflow
    const exampleSection = markdownWorkflow.match(/\*\*Natural Language Examples:\*\*(.*?)(?=\*\*|---)/gs);
    if (exampleSection) {
      const examples = exampleSection[0].match(/"([^"]+)"/g) || [];
      for (const example of examples.slice(0, 5)) { // Show first 5 examples
        summary += `- ${example}\n`;
      }
    }
    
    return summary;
  }
}