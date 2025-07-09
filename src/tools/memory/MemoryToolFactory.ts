import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { AddMemoryCommand } from "./commands/AddMemoryCommand.js";
import { AddMemoryEnhancedCommand } from "./commands/AddMemoryEnhancedCommand.js";
import { AddMemoriesBatchCommand } from "./commands/AddMemoriesBatchCommand.js";
import { AddReasoningChainCommand } from "./commands/AddReasoningChainCommand.js";
import { GetAllMemoriesCommand } from "./commands/GetAllMemoriesCommand.js";
import { GetAllMemoriesForConversationCommand } from "./commands/GetAllMemoriesForConversationCommand.js";
import { GetMemoryAnalyticsCommand } from "./commands/GetMemoryAnalyticsCommand.js";
import { SearchMemoriesCommand } from "./commands/SearchMemoriesCommand.js";
import { SearchMemoriesAdvancedCommand } from "./commands/SearchMemoriesAdvancedCommand.js";
import { LinkMemoriesCommand } from "./commands/LinkMemoriesCommand.js";

export class MemoryToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      AddMemoryCommand,
      AddMemoryEnhancedCommand,
      AddMemoriesBatchCommand,
      AddReasoningChainCommand,
      GetAllMemoriesCommand,
      GetAllMemoriesForConversationCommand,
      GetMemoryAnalyticsCommand,
      SearchMemoriesCommand,
      SearchMemoriesAdvancedCommand,
      LinkMemoriesCommand,
    ];
  }
}