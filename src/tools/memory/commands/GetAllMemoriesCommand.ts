import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { hubService } from "../../../services/hub.js";

export class GetAllMemoriesCommand extends ToolCommand<{}, any> {
  protected metadata: ToolMetadata = {
    name: "getAllMemories",
    description: `Retrieve all stored Memories for the hubId. Call this tool when you need 
      complete context of all previously stored Memories.
      Results are returned in JSON format with metadata.`,
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Memories",
  };

  protected parametersSchema = z.object({});

  constructor(private context: ToolContext) {
    super();
  }

  async execute(): Promise<any> {
    try {
      const memories = await hubService.fetch(this.context.hubId);
      return JSON.stringify(memories);
    } catch (error) {
      throw new Error(`Failed to get all memories: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
