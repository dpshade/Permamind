import { BaseToolFactory, ToolCommand, ToolContext } from "../core/index.js";
import { CheckPermawebDeployPrerequisitesCommand } from "./commands/CheckPermawebDeployPrerequisitesCommand.js";
import { DeployPermawebDirectoryCommand } from "./commands/DeployPermawebDirectoryCommand.js";
import { ManagePermawebDocsCacheCommand } from "./commands/ManagePermawebDocsCacheCommand.js";
// import { QueryPermawebDocsCommand } from "./commands/QueryPermawebDocsCommand.js";

export class DocumentationToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      // QueryPermawebDocsCommand, // Replaced by HTTP tool with NLS capability
      ManagePermawebDocsCacheCommand,
      DeployPermawebDirectoryCommand,
      CheckPermawebDeployPrerequisitesCommand,
    ];
  }
}
