import { z } from "zod";

import { hubService } from "../../../services/hub.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

export class GetAllMemoriesCommand extends ToolCommand<
  Record<string, never>,
  string
> {
  protected metadata: ToolMetadata = {
    description: `Retrieve all stored Memories for the hubId. Call this tool when you need 
      complete context of all previously stored Memories.
      Results are returned in JSON format with metadata.`,
    name: "getAllMemories",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Memories",
  };

  protected parametersSchema = z.object({});

  constructor(private context: ToolContext) {
    super();
  }

  async execute(): Promise<string> {
    try {
      const memories = await hubService.fetch(this.context.hubId);
      return JSON.stringify(memories);
    } catch (error) {
      throw new Error(
        `Failed to get all memories: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
