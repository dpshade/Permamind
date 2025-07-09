import { BaseToolFactory, ToolContext, ToolCommand } from "../core/index.js";
import { SaveTokenMappingCommand } from "./commands/SaveTokenMappingCommand.js";
import { ListTokensCommand } from "./commands/ListTokensCommand.js";
import { TransferTokensCommand } from "./commands/TransferTokensCommand.js";
import { MintTokensCommand } from "./commands/MintTokensCommand.js";
import { BurnTokensCommand } from "./commands/BurnTokensCommand.js";
import { TransferTokenOwnershipCommand } from "./commands/TransferTokenOwnershipCommand.js";
import { GetTokenBalanceCommand } from "./commands/GetTokenBalanceCommand.js";
import { GetAllTokenBalancesCommand } from "./commands/GetAllTokenBalancesCommand.js";
import { GetTokenInfoCommand } from "./commands/GetTokenInfoCommand.js";
import { GetTokenNameCommand } from "./commands/GetTokenNameCommand.js";
import { CreateConfigurableTokenCommand } from "./commands/CreateConfigurableTokenCommand.js";
import { ValidateTokenConfigurationCommand } from "./commands/ValidateTokenConfigurationCommand.js";
import { CreateSimpleTokenCommand } from "./commands/CreateSimpleTokenCommand.js";
import { GenerateTokenLuaCommand } from "./commands/GenerateTokenLuaCommand.js";
import { GetTokenExamplesCommand } from "./commands/GetTokenExamplesCommand.js";
import { QueryTokenInfoCommand } from "./commands/QueryTokenInfoCommand.js";

export class TokenToolFactory extends BaseToolFactory {
  protected getToolClasses(): Array<new (context: ToolContext) => ToolCommand> {
    return [
      SaveTokenMappingCommand,
      ListTokensCommand,
      TransferTokensCommand,
      MintTokensCommand,
      BurnTokensCommand,
      TransferTokenOwnershipCommand,
      GetTokenBalanceCommand,
      GetAllTokenBalancesCommand,
      GetTokenInfoCommand,
      GetTokenNameCommand,
      CreateConfigurableTokenCommand,
      ValidateTokenConfigurationCommand,
      CreateSimpleTokenCommand,
      GenerateTokenLuaCommand,
      GetTokenExamplesCommand,
      QueryTokenInfoCommand,
    ];
  }
}