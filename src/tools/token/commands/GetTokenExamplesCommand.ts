import { z } from "zod";

import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface GetTokenExamplesArgs {
  strategy?: "basic" | "cascade" | "double_mint" | "simple";
}

export class GetTokenExamplesCommand extends ToolCommand<
  GetTokenExamplesArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description:
      "Get example token configurations for different strategies (basic, cascade, double_mint, simple).",
    name: "getTokenExamples",
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

  async execute(_args: GetTokenExamplesArgs): Promise<string> {
    // Implementation would be moved from server.ts
    throw new Error(
      "GetTokenExamplesCommand implementation pending migration from server.ts",
    );
  }
}
