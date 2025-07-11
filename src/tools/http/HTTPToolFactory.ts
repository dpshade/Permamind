import { BaseToolFactory, ToolCommand, ToolContext } from "../core/index.js";
import { HTTPCommand } from "./HTTPCommand.js";

export class HTTPToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [HTTPCommand];
  }
}