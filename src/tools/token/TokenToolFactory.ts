import { BaseToolFactory, ToolCommand, ToolContext } from "../core/index.js";
import { BurnTokensCommand } from "./commands/BurnTokensCommand.js";
import { CreateConfigurableTokenCommand } from "./commands/CreateConfigurableTokenCommand.js";
import { CreateSimpleTokenCommand } from "./commands/CreateSimpleTokenCommand.js";
import { GenerateTokenLuaCommand } from "./commands/GenerateTokenLuaCommand.js";
import { GetAllTokenBalancesCommand } from "./commands/GetAllTokenBalancesCommand.js";
import { GetTokenBalanceCommand } from "./commands/GetTokenBalanceCommand.js";
import { GetTokenExamplesCommand } from "./commands/GetTokenExamplesCommand.js";
import { GetTokenInfoCommand } from "./commands/GetTokenInfoCommand.js";
import { GetTokenNameCommand } from "./commands/GetTokenNameCommand.js";
import { ListTokensCommand } from "./commands/ListTokensCommand.js";
import { MintTokensCommand } from "./commands/MintTokensCommand.js";
import { QueryTokenInfoCommand } from "./commands/QueryTokenInfoCommand.js";
import { SaveTokenMappingCommand } from "./commands/SaveTokenMappingCommand.js";
import { TransferTokenOwnershipCommand } from "./commands/TransferTokenOwnershipCommand.js";
import { TransferTokensCommand } from "./commands/TransferTokensCommand.js";
import { ValidateTokenConfigurationCommand } from "./commands/ValidateTokenConfigurationCommand.js";

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
