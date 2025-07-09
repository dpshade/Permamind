import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { arweaveGraphQLService } from "../../../services/ArweaveGraphQLService.js";

export class GetTransactionDetailsCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "getTransactionDetails",
    description: `Get detailed information for a specific Arweave transaction by ID. 
    Returns comprehensive transaction data including tags, block information, 
    data size, and bundle information if applicable.
    
    DISPLAY FORMAT: When presenting transaction details, use this comprehensive format:
    
    Transaction Details: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    Tags: Show important tags like App-Name, Action, Content-Type
    Parent: parent123...def789 (if applicable)
    
    REQUIREMENTS:
    - Truncate transaction IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Display all relevant tags in a readable format
    - Show parent transaction if available
    - Include comprehensive transaction metadata`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Transaction Details",
  };

  protected parametersSchema = z.object({
    transactionId: z.string().describe("The Arweave transaction ID to query"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: any): Promise<any> {
    try {
      const transaction = await arweaveGraphQLService.getTransactionData(
        args.transactionId,
      );

      if (!transaction) {
        return JSON.stringify({
          error: `Transaction not found: ${args.transactionId}`,
          success: false,
          transactionId: args.transactionId,
        });
      }

      return JSON.stringify({
        success: true,
        transaction: transaction,
        transactionId: args.transactionId,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to get transaction details: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
        transactionId: args.transactionId,
      });
    }
  }
}