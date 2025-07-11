import { BaseToolFactory, ToolCommand, ToolContext } from "../core/index.js";
// import { ExecuteGraphQLQueryCommand } from "./commands/ExecuteGraphQLQueryCommand.js";
import { ExecuteProcessActionCommand } from "./commands/ExecuteProcessActionCommand.js";
import { ExecuteSmartProcessActionCommand } from "./commands/ExecuteSmartProcessActionCommand.js";
import { GetTransactionDetailsCommand } from "./commands/GetTransactionDetailsCommand.js";
import { QueryAOProcessMessagesCommand } from "./commands/QueryAOProcessMessagesCommand.js";
import { QueryArweaveTransactionsCommand } from "./commands/QueryArweaveTransactionsCommand.js";
import { QueryBlockInfoCommand } from "./commands/QueryBlockInfoCommand.js";

export class ProcessToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      ExecuteProcessActionCommand,
      ExecuteSmartProcessActionCommand,
      QueryArweaveTransactionsCommand,
      QueryAOProcessMessagesCommand,
      GetTransactionDetailsCommand,
      QueryBlockInfoCommand,
      // ExecuteGraphQLQueryCommand, // Replaced by HTTP tool with GraphQL NLS capability
    ];
  }
}
