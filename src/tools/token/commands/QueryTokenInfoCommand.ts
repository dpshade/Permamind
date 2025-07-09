import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

export class QueryTokenInfoCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "queryTokenInfo",
    description: "Query detailed token information from a deployed token process.",
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

  async execute(args: any): Promise<any> {
    // Implementation would be moved from server.ts
    throw new Error("QueryTokenInfoCommand implementation pending migration from server.ts");
  }
}
