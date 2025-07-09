import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { SaveAddressMappingCommand } from "./commands/SaveAddressMappingCommand.js";
import { ListContactsCommand } from "./commands/ListContactsCommand.js";

export class ContactToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      SaveAddressMappingCommand,
      ListContactsCommand,
    ];
  }
}
