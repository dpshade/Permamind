import { z } from "zod";

import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface QueryTokenInfoArgs {
  processId: string;
}

export class QueryTokenInfoCommand extends ToolCommand<
  QueryTokenInfoArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description:
      "Query detailed token information from a deployed token process.",
    name: "queryTokenInfo",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Query Token Info",
  };

  protected parametersSchema = z.object({
    processId: z.string().describe("The AO process ID of the deployed token"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(
    _args: QueryTokenInfoArgs,
    _context: ToolContext,
  ): Promise<string> {
    // Implementation would be moved from server.ts
    void _args; // Explicitly mark as unused
    void _context; // Explicitly mark as unused
    throw new Error(
      "QueryTokenInfoCommand implementation pending migration from server.ts",
    );
  }
}
