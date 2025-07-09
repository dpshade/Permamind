import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { MEMORY_KINDS } from "../../../services/aiMemoryService.js";
import { fetchEvents } from "../../../relay.js";

export class ListTokensCommand extends ToolCommand<{}, any> {
  protected metadata: ToolMetadata = {
    name: "listTokens",
    description: "List all saved token mappings from the registry",
    openWorldHint: false,
    readOnlyHint: true,
    title: "List Saved Tokens",
  };

  protected parametersSchema = z.object({});

  constructor(private context: ToolContext) {
    super();
  }

  async execute(): Promise<any> {
    try {
      // Use dedicated kind for efficient filtering
      const filter = {
        kinds: [MEMORY_KINDS.TOKEN_MAPPING],
        //limit: 100
      };
      const _filters = JSON.stringify([filter]);
      const events = await fetchEvents(this.context.hubId, _filters);
      return JSON.stringify(events);
    } catch (error) {
      return JSON.stringify({
        error: `Failed to list tokens: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  }
}
