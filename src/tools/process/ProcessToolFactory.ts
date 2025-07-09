import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { ExecuteProcessActionCommand } from "./commands/ExecuteProcessActionCommand.js";
import { ExecuteSmartProcessActionCommand } from "./commands/ExecuteSmartProcessActionCommand.js";
import { QueryArweaveTransactionsCommand } from "./commands/QueryArweaveTransactionsCommand.js";
import { QueryAOProcessMessagesCommand } from "./commands/QueryAOProcessMessagesCommand.js";
import { GetTransactionDetailsCommand } from "./commands/GetTransactionDetailsCommand.js";
import { QueryBlockInfoCommand } from "./commands/QueryBlockInfoCommand.js";
import { ExecuteGraphQLQueryCommand } from "./commands/ExecuteGraphQLQueryCommand.js";

export class ProcessToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      ExecuteProcessActionCommand,
      ExecuteSmartProcessActionCommand,
      QueryArweaveTransactionsCommand,
      QueryAOProcessMessagesCommand,
      GetTransactionDetailsCommand,
      QueryBlockInfoCommand,
      ExecuteGraphQLQueryCommand,
    ];
  }
}