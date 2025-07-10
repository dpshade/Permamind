import { BaseToolFactory, ToolCommand, ToolContext } from "../core/index.js";
import { ListContactsCommand } from "./commands/ListContactsCommand.js";
import { SaveAddressMappingCommand } from "./commands/SaveAddressMappingCommand.js";

export class ContactToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [SaveAddressMappingCommand, ListContactsCommand];
  }
}
