import { z } from "zod";

import { BlockQuery, SortOrder } from "../../../models/ArweaveGraphQL.js";
import { arweaveGraphQLService } from "../../../services/ArweaveGraphQLService.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface QueryBlockInfoArgs {
  after?: string;
  blockId?: string;
  first?: number;
  heightRange?: { max?: number; min?: number };
  ids?: string[];
  last?: number;
  sort?: SortOrder;
  sortOrder?: SortOrder;
}

export class QueryBlockInfoCommand extends ToolCommand<
  QueryBlockInfoArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description: `Query Arweave block information with filtering by height ranges or specific block IDs. 
    Includes pagination support for querying multiple blocks efficiently.
    
    DISPLAY FORMAT: When presenting block information, use this consistent format:
    
    For individual blocks:
    Block: block123...def789
    Time: 2024-01-01 12:00:00 UTC
    Height: #1234567
    Previous: prev123...abc456
    
    For block lists:
    Found X blocks:
    1. block123...def789 | 2024-01-01 12:00 UTC | Height: #1234567
    2. block456...ghi012 | 2024-01-01 11:30 UTC | Height: #1234566
    
    REQUIREMENTS:
    - Truncate block IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - Always show block height prominently
    - Show previous block relationship when available
    - Use clean markdown formatting for clarity`,
    name: "queryBlockInfo",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Block Information",
  };

  protected parametersSchema = z.object({
    after: z.string().optional().describe("Cursor for pagination"),
    blockId: z
      .string()
      .optional()
      .describe("Specific block ID to query (for single block)"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    heightRange: z
      .object({
        max: z.number().optional().describe("Maximum block height"),
        min: z.number().optional().describe("Minimum block height"),
      })
      .optional()
      .describe("Block height range filter"),
    ids: z
      .array(z.string())
      .optional()
      .describe("Array of block IDs to query (for multiple blocks)"),
    last: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return from the end"),
    sort: z
      .nativeEnum(SortOrder)
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
    sortOrder: z
      .nativeEnum(SortOrder)
      .optional()
      .describe("Sort order (default: HEIGHT_DESC)"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: QueryBlockInfoArgs): Promise<string> {
    try {
      if (args.blockId) {
        // Single block query
        const block = await arweaveGraphQLService.getBlockData(args.blockId);

        if (!block) {
          return JSON.stringify({
            blockId: args.blockId,
            error: `Block not found: ${args.blockId}`,
            success: false,
          });
        }

        return JSON.stringify({
          block: block,
          blockId: args.blockId,
          success: true,
        });
      } else {
        // Multiple blocks query
        const query: BlockQuery = {
          first: args.first || 10,
          sort: (args.sort as SortOrder) || "HEIGHT_DESC",
        };

        if (args.ids) {
          query.ids = args.ids;
        }

        if (args.heightRange) {
          query.height = {
            max: args.heightRange.max,
            min: args.heightRange.min,
          };
        }

        if (args.after) {
          query.after = args.after;
        }

        const result = await arweaveGraphQLService.queryBlocks(query);

        return JSON.stringify({
          query: args,
          result: {
            blocks: result.blocks,
            count: result.blocks.length,
            pageInfo: result.pageInfo,
          },
          success: true,
        });
      }
    } catch (error) {
      return JSON.stringify({
        error: `Failed to query block information: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  }
}
