import { z } from "zod";

import { processCommunicationService } from "../../../services/ProcessCommunicationService.js";
import {
  CommonSchemas,
  ToolCommand,
  ToolContext,
  ToolMetadata,
} from "../../core/index.js";

interface ExecuteProcessActionArgs {
  processId: string;
  processMarkdown: string;
  request: string;
}

export class ExecuteProcessActionCommand extends ToolCommand<
  ExecuteProcessActionArgs,
  any
> {
  protected metadata: ToolMetadata = {
    description: `Execute an action on any AO process using natural language. Process developers can provide a markdown description 
      of their process handlers, and you can interact with the process using natural language requests. The service will automatically 
      parse the process documentation, understand your request, format the appropriate AO message, and execute it.
      
      💡 TIP: For token operations, consider using 'executeTokenAction' or 'executeSmartProcessAction' which provide built-in 
      token templates and don't require manual documentation.`,
    name: "executeProcessAction",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Execute Process Action",
  };

  protected parametersSchema = z.object({
    processId: CommonSchemas.processId.describe(
      "The AO process ID to communicate with",
    ),
    processMarkdown: z
      .string()
      .describe(
        "Markdown documentation describing the process handlers and parameters",
      ),
    request: z
      .string()
      .describe("Natural language request describing what action to perform"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: ExecuteProcessActionArgs): Promise<any> {
    try {
      const result = await processCommunicationService.executeProcessRequest(
        args.processMarkdown,
        args.processId,
        args.request,
        this.context.keyPair,
      );
      return JSON.stringify(result);
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
