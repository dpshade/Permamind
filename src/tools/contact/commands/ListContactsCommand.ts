import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { MEMORY_KINDS } from "../../../services/aiMemoryService.js";
import { fetchEvents } from "../../../relay.js";

export class ListContactsCommand extends ToolCommand<{}, any> {
  protected metadata: ToolMetadata = {
    name: "listContacts",
    description: "List all saved contact mappings from the address book",
    openWorldHint: false,
    readOnlyHint: true,
    title: "List Saved Contacts",
  };

  protected parametersSchema = z.object({});

  constructor(private context: ToolContext) {
    super();
  }

  async execute(): Promise<any> {
    try {
      // Use dedicated kind for efficient filtering
      const filter = {
        kinds: [MEMORY_KINDS.CONTACT_MAPPING],
        //limit: 100
      };
      const _filters = JSON.stringify([filter]);
      const events = await fetchEvents(this.context.hubId, _filters);
      return JSON.stringify(events);
    } catch (error) {
      return JSON.stringify({
        error: `Failed to list contacts: ${error instanceof Error ? error.message : "Unknown error"}`,
        success: false,
      });
    }
  }
}
