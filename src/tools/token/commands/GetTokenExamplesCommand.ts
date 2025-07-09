import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

export class GetTokenExamplesCommand extends ToolCommand<any, any> {
  protected metadata: ToolMetadata = {
    name: "getTokenExamples",
    description: "Get example token configurations for different strategies (basic, cascade, double_mint, simple).",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Examples",
  };

  protected parametersSchema = z.object({
    strategy: z
      .enum(["basic", "cascade", "double_mint", "simple"])
      .optional()
      .describe("Specific strategy to get example for (optional)"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: any): Promise<any> {
    // Implementation would be moved from server.ts
    throw new Error("GetTokenExamplesCommand implementation pending migration from server.ts");
  }
}