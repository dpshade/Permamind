import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { arweaveGraphQLService } from "../../../services/ArweaveGraphQLService.js";

export class ExecuteGraphQLQueryCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "executeGraphQLQuery",
    description: `Execute a custom GraphQL query against Arweave's GraphQL API. 
    Supports full GraphQL syntax with variables. Use this for advanced queries 
    not covered by the specialized tools. Includes automatic endpoint fallback.

    DISPLAY FORMAT: When presenting GraphQL results, use consistent formatting:
    
    For transactions in results:
    Transaction: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    
    For blocks in results:
    Block: #1234567 (abc123...def789)
    Time: 2024-01-01 12:00:00 UTC
    Previous: #1234566
    
    REQUIREMENTS:
    - Truncate long IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Present data in structured, readable format
    - Group related information logically`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Execute Custom GraphQL Query",
  };

  protected parametersSchema = z.object({
    query: z.string().describe("The GraphQL query string to execute"),
    variables: z
      .string()
      .optional()
      .describe("JSON string of GraphQL variables (optional)"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: any): Promise<any> {
    try {
      const variables = args.variables ? JSON.parse(args.variables) : undefined;
      const result = await arweaveGraphQLService.executeCustomQuery(
        args.query,
        variables,
      );

      if (result.errors && result.errors.length > 0) {
        return JSON.stringify({
          data: result.data,
          errors: result.errors,
          query: args.query,
          success: false,
          variables: variables,
        });
      }

      return JSON.stringify({
        data: result.data,
        query: args.query,
        success: true,
        variables: variables,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to execute GraphQL query: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args.query,
        success: false,
      });
    }
  }
