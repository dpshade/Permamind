import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { QueryPermawebDocsCommand } from "./commands/QueryPermawebDocsCommand.js";
import { ManagePermawebDocsCacheCommand } from "./commands/ManagePermawebDocsCacheCommand.js";
import { DeployPermawebDirectoryCommand } from "./commands/DeployPermawebDirectoryCommand.js";
import { CheckPermawebDeployPrerequisitesCommand } from "./commands/CheckPermawebDeployPrerequisitesCommand.js";

export class DocumentationToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      QueryPermawebDocsCommand,
      ManagePermawebDocsCacheCommand,
      DeployPermawebDirectoryCommand,
      CheckPermawebDeployPrerequisitesCommand,
    ];
  }
