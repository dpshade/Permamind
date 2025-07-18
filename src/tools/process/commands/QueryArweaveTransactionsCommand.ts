import { z } from "zod";

import {
  SortOrder,
  TagOperator,
  TransactionQuery,
} from "../../../models/ArweaveGraphQL.js";
import { arweaveGraphQLService } from "../../../services/ArweaveGraphQLService.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface QueryArweaveTransactionsArgs {
  after?: string;
  blockHeight?: { max?: number; min?: number };
  bundledIn?: string;
  dataSize?: { max?: number; min?: number };
  fee?: { max?: number; min?: number };
  first?: number;
  ids?: string[];
  ingestedAt?: { max?: number; min?: number };
  last?: number;
  owners?: string[];
  recipients?: string[];
  sort?: SortOrder;
  sortOrder?: SortOrder;
  tags?: Array<{ name: string; op?: TagOperator; values: string[] }>;
}

export class QueryArweaveTransactionsCommand extends ToolCommand<
  QueryArweaveTransactionsArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description: `Query Arweave transactions using GraphQL with comprehensive filtering options. 
    Supports filtering by owners, recipients, tags, blocks, and more. Uses Goldsky primary endpoint 
    with arweave.net fallback. Includes pagination support for large result sets.
    
    DISPLAY FORMAT: When presenting results, use this consistent format:
    
    For individual transactions:
    Transaction: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    Owner: 7oqF5r...LbpfT7 → Recipient: 9pGvfZ...MnkL2x
    Size: 1.2 MB (application/json)
    App: PublicSquare (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Fee: 0.001 AR
    
    For transaction lists:
    Found X transactions:
    1. abc123...def789 | 2024-01-01 12:00 UTC | 1.2 MB | App: PublicSquare | Action: Transfer
    2. def456...ghi012 | 2024-01-01 11:30 UTC | 0.8 MB | App: ArDrive | Action: Upload
    
    REQUIREMENTS:
    - Truncate transaction IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Show data size in human-readable format (MB, KB)
    - Use clean markdown formatting for clarity`,
    name: "queryArweaveTransactions",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Arweave Transactions",
  };

  protected parametersSchema = z.object({
    after: z.string().optional().describe("Cursor for pagination"),
    blockHeight: z
      .object({
        max: z.number().optional().describe("Maximum block height"),
        min: z.number().optional().describe("Minimum block height"),
      })
      .optional()
      .describe("Block height filter"),
    bundledIn: z
      .string()
      .optional()
      .describe("Filter by bundle transaction ID"),
    dataSize: z
      .object({
        max: z.number().optional().describe("Maximum data size"),
        min: z.number().optional().describe("Minimum data size"),
      })
      .optional()
      .describe("Data size filter"),
    fee: z
      .object({
        max: z.number().optional().describe("Maximum fee"),
        min: z.number().optional().describe("Minimum fee"),
      })
      .optional()
      .describe("Fee filter"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    ids: z
      .array(z.string())
      .optional()
      .describe("Array of transaction IDs to query"),
    ingestedAt: z
      .object({
        max: z.number().optional().describe("Maximum ingested timestamp"),
        min: z.number().optional().describe("Minimum ingested timestamp"),
      })
      .optional()
      .describe("Ingested at filter"),
    last: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return from the end"),
    owners: z
      .array(z.string())
      .optional()
      .describe("Array of owner wallet addresses"),
    recipients: z
      .array(z.string())
      .optional()
      .describe("Array of recipient wallet addresses"),
    sort: z
      .nativeEnum(SortOrder)
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
    sortOrder: z
      .nativeEnum(SortOrder)
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
    tags: z
      .array(
        z.object({
          name: z.string().describe("Tag name"),
          op: z
            .nativeEnum(TagOperator)
            .optional()
            .describe("Tag operator (default: EQ)"),
          values: z.array(z.string()).describe("Array of tag values to match"),
        }),
      )
      .optional()
      .describe("Array of tag filters"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: QueryArweaveTransactionsArgs): Promise<string> {
    try {
      const query: TransactionQuery = {
        first: args.first || 10,
        sort: (args.sort as SortOrder) || "HEIGHT_DESC",
      };

      if (args.ids) {
        query.ids = args.ids;
      }

      if (args.owners) {
        query.owners = args.owners;
      }

      if (args.recipients) {
        query.recipients = args.recipients;
      }

      if (args.tags) {
        query.tags = args.tags.map((tag) => ({
          name: tag.name,
          op: (tag.op as TagOperator) || "EQ",
          values: tag.values,
        }));
      }

      if (args.blockHeight) {
        query.block = {
          max: args.blockHeight.max,
          min: args.blockHeight.min,
        };
      }

      if (args.ingestedAt) {
        query.ingested_at = {
          max: args.ingestedAt.max,
          min: args.ingestedAt.min,
        };
      }

      if (args.after) {
        query.after = args.after;
      }

      const result = await arweaveGraphQLService.queryTransactions(query);

      return JSON.stringify({
        query: args,
        result: {
          count: result.transactions.length,
          pageInfo: result.pageInfo,
          transactions: result.transactions,
        },
        success: true,
      });
    } catch (error) {
      return JSON.stringify({
        error: `Failed to query transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  }
}
