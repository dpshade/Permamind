import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";

export class SystemToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      // System tools will be added here as they are identified and migrated
    ];
  }
