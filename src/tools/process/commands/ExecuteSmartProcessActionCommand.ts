import { z } from "zod";

import { processCommunicationService } from "../../../services/ProcessCommunicationService.js";
import {
  CommonSchemas,
  ToolCommand,
  ToolContext,
  ToolMetadata,
} from "../../core/index.js";

interface ExecuteSmartProcessActionArgs {
  processId: string;
  processMarkdown?: string;
  request: string;
}

export class ExecuteSmartProcessActionCommand extends ToolCommand<
  ExecuteSmartProcessActionArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description: `Intelligent process execution that automatically detects process types and uses appropriate templates. Falls back to 
    traditional documentation-based approach if auto-detection fails. Supports token operations out of the box, with extensibility 
    for other process types (NFT, DAO, DeFi, etc.).`,
    name: "executeSmartProcessAction",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Execute Smart Process Action",
  };

  protected parametersSchema = z.object({
    processId: CommonSchemas.processId.describe(
      "The AO process ID to communicate with",
    ),
    processMarkdown: z
      .string()
      .optional()
      .describe(
        "Optional markdown documentation (will attempt auto-detection if not provided)",
      ),
    request: z
      .string()
      .describe("Natural language request describing what action to perform"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: ExecuteSmartProcessActionArgs): Promise<string> {
    try {
      const result = await processCommunicationService.executeSmartRequest(
        args.processId,
        args.request,
        this.context.keyPair,
        args.processMarkdown,
      );
      return JSON.stringify(result);
    } catch (error) {
      return JSON.stringify({
        error: `Smart process execution failed: ${error}`,
        success: false,
      });
    }
  }
}
