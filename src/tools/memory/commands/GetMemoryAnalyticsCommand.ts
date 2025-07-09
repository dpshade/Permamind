import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { aiMemoryService } from "../../../services/aiMemoryService.js";

interface GetMemoryAnalyticsArgs {
  p?: string;
}

export class GetMemoryAnalyticsCommand extends ToolCommand<GetMemoryAnalyticsArgs, any> {
  protected metadata: ToolMetadata = {
    name: "getMemoryAnalytics",
    description: `Get detailed analytics about memory usage, patterns, and insights. Provides metrics about 
      memory types, importance distributions, access patterns, and relationship networks.`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Memory Analytics",
  };

  protected parametersSchema = z.object({
    p: z
      .string()
      .optional()
      .describe("Public key to filter analytics for specific user (optional)"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: GetMemoryAnalyticsArgs): Promise<any> {
    try {
      const analytics = await aiMemoryService.getMemoryAnalytics(
        this.context.hubId,
        args.p
      );
      return JSON.stringify(analytics);
    } catch (error) {
      throw new Error(`Failed to get memory analytics: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
