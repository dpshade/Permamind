import { z } from "zod";

import { Tag } from "../../../models/Tag.js";
import { hubService } from "../../../services/hub.js";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";

interface AddMemoryArgs {
  content: string;
  p: string;
  role: string;
}

export class AddMemoryCommand extends ToolCommand<AddMemoryArgs, any> {
  protected metadata: ToolMetadata = {
    description: "Add a memory to the hub",
    name: "addMemory",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Add Memory",
  };

  protected parametersSchema = z.object({
    content: z.string().describe("The content of the memory"),
    p: z.string().describe("The public key of the other party in the memory"),
    role: z.string().describe("The role of the author of the memory"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: AddMemoryArgs): Promise<any> {
    const kind: Tag = {
      name: "Kind",
      value: "10",
    };
    const content: Tag = {
      name: "Content",
      value: args.content,
    };
    const role: Tag = {
      name: "r",
      value: args.role,
    };
    const p: Tag = {
      name: "p",
      value: args.p,
    };
    const tags: Tag[] = [kind, content, role, p];

    try {
      const result = await hubService.createEvent(
        this.context.keyPair,
        this.context.hubId,
        tags,
      );
      return JSON.stringify(result);
    } catch (error) {
      throw new Error(
        `Failed to add memory: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
