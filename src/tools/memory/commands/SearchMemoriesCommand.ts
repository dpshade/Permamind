import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { hubService } from "../../../services/hub.js";

interface SearchMemoriesArgs {
  search: string;
}

export class SearchMemoriesCommand extends ToolCommand<SearchMemoriesArgs, any> {
  protected metadata: ToolMetadata = {
    name: "searchMemories",
    description: "Retrieve all stored Memories for the hubId by keywords or content. Automatically searches both user memories and comprehensive Permaweb ecosystem context documentation. Call this tool when you need to search for memories based on a keyword or content.",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Search Memories",
  };

  protected parametersSchema = z.object({
    search: z.string().describe("keyword or content"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: SearchMemoriesArgs): Promise<any> {
    try {
      const memories = await hubService.search(
        this.context.hubId,
        args.search,
        "10"
      );
      return JSON.stringify(memories);
    } catch (error) {
      throw new Error(`Failed to search memories: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
