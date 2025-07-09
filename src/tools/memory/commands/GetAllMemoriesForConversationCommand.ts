import { z } from "zod";

import { hubService } from "../../../services/hub.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface GetAllMemoriesForConversationArgs {
  user: string;
}

export class GetAllMemoriesForConversationCommand extends ToolCommand<
  GetAllMemoriesForConversationArgs,
  any
> {
  protected metadata: ToolMetadata = {
    description: `Retrieve all stored Memories from the hubId for the given p arg. Call this tool when you need 
      complete context of all previously stored Memories for the given p arg.
      Results are returned in JSON format with metadata.`,
    name: "getAllMemoriesForConversation",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Memories For a Conversation",
  };

  protected parametersSchema = z.object({
    user: z
      .string()
      .describe("The public key of the other party in the memory"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: GetAllMemoriesForConversationArgs): Promise<any> {
    try {
      const memories = await hubService.fetchByUser(
        this.context.hubId,
        args.user,
      );
      return JSON.stringify(memories);
    } catch (error) {
      throw new Error(
        `Failed to get memories for conversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
