import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { arweaveGraphQLService } from "../../../services/ArweaveGraphQLService.js";
import type { AOProcessQuery, SortOrder } from "../../../models/ArweaveGraphQL.js";

export class QueryAOProcessMessagesCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "queryAOProcessMessages",
    description: `Query AO (Autonomous Objects) process messages and interactions. 
    Filter by process IDs, message references, actions, and other AO-specific parameters. 
    Useful for tracking process communications and state changes.
    
    DISPLAY FORMAT: When presenting AO process messages, use this consistent format:
    
    For individual messages:
    Message: abc123...def789
    Time: 2024-01-01 12:00:00 UTC (Block #1234567)
    From: ProcessA...123 → To: ProcessB...456
    Size: 1.2 MB (application/json)
    App: AO-Process (ALWAYS include if found in tags)
    Action: Transfer (ALWAYS include if found in tags)
    Reference: msg_ref_123
    
    For message lists:
    Found X AO messages:
    1. abc123...def789 | 2024-01-01 12:00 UTC | ProcessA...123 → ProcessB...456 | Action: Transfer
    2. def456...ghi012 | 2024-01-01 11:30 UTC | ProcessA...123 → ProcessC...789 | Action: Mint
    
    REQUIREMENTS:
    - Truncate transaction and process IDs to first 6 + last 6 characters
    - Use timestampFormatted field for human-readable time
    - ALWAYS show App and Action if found in transaction tags
    - Show process communication flow (From → To)
    - Include message references when available`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query AO Process Messages",
  };

  protected parametersSchema = z.object({
    action: z
      .string()
      .optional()
      .describe("Filter by action type (e.g., 'Transfer', 'Mint')"),
    after: z.string().optional().describe("Cursor for pagination"),
    first: z
      .number()
      .min(1)
      .max(100)
      .optional()
      .describe("Number of results to return (max 100, default 10)"),
    fromProcessId: z
      .string()
      .optional()
      .describe("Filter by sender process ID"),
    msgRefs: z
      .array(z.string())
      .optional()
      .describe("Array of message reference IDs"),
    sort: z
      .enum([
        "HEIGHT_ASC",
        "HEIGHT_DESC",
        "INGESTED_AT_ASC",
        "INGESTED_AT_DESC",
      ])
      .optional()
      .describe("Sort order (default: INGESTED_AT_DESC)"),
    toProcessId: z
      .string()
      .optional()
      .describe("Filter by recipient process ID"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: any): Promise<any> {
    try {
      const query: AOProcessQuery = {
        first: args.first || 10,
        sort: (args.sort as SortOrder) || "INGESTED_AT_DESC",
      };

      if (args.fromProcessId) {
        query.fromProcessId = args.fromProcessId;
      }

      if (args.toProcessId) {
        query.toProcessId = args.toProcessId;
      }

      if (args.msgRefs) {
        query.msgRefs = args.msgRefs;
      }

      if (args.action) {
        query.action = args.action;
      }

      if (args.after) {
        query.after = args.after;
      }

      const result = await arweaveGraphQLService.queryAOProcessMessages(query);

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
        error: `Failed to query AO process messages: ${error instanceof Error ? error.message : "Unknown error"}`,
        query: args,
        success: false,
      });
    }
  }
