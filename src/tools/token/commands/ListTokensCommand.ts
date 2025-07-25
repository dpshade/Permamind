import { z } from "zod";

import { fetchEvents } from "../../../relay.js";
import { MEMORY_KINDS } from "../../../services/AIMemoryService.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

export class ListTokensCommand extends ToolCommand<
  Record<string, never>,
  string
> {
  protected metadata: ToolMetadata = {
    description: "List all saved token mappings from the registry",
    name: "listTokens",
    openWorldHint: false,
    readOnlyHint: true,
    title: "List Saved Tokens",
  };

  protected parametersSchema = z.object({});

  constructor(private context: ToolContext) {
    super();
  }

  async execute(): Promise<string> {
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
