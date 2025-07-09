import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata, CommonSchemas } from "../../core/index.js";
import { resolveToken, resolveAddress } from "../utils/TokenResolver.js";

interface MintTokensArgs {
  confirmed?: boolean;
  processId: string;
  quantity: string;
  rawAmount?: boolean;
  recipient: string;
}

export class MintTokensCommand extends ToolCommand<MintTokensArgs, any> {
  protected metadata: ToolMetadata = {
    name: "mintTokens",
    description: "Create new tokens (owner only). Supports token names/tickers and contact names from registry.",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Mint Tokens",
  };

  protected parametersSchema = z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved tokens/addresses"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: CommonSchemas.quantity.describe(
      "Amount of tokens to mint (will be converted based on token denomination unless rawAmount is true)"
    ),
    rawAmount: z
      .boolean()
      .optional()
      .describe(
        "Set to true to mint exact amount without denomination conversion"
      ),
    recipient: z
      .string()
      .describe("Address or contact name to receive new tokens"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: MintTokensArgs): Promise<any> {
    try {
      // Dynamic import to avoid circular dependencies
      const { read, send } = await import("../../../process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId, this.context.hubId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Resolve recipient address if needed
      const addressResolution = await resolveAddress(args.recipient, this.context.hubId);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          error: "Recipient resolution failed",
          message: addressResolution.verificationMessage,
          success: false,
          suggestion:
            "Use saveAddressMapping to register this contact or provide a valid address",
        });
      }

      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction:
            "Add 'confirmed: true' to your request to proceed with this recipient",
          message: addressResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedRecipient: addressResolution.value,
          success: false,
        });
      }

      const recipient = addressResolution.value!;

      // Get token info to check denomination
      const tokenInfo = await read(processId, [
        { name: "Action", value: "Info" },
      ]);
      let denomination = 12; // Default denomination
      let actualQuantity = args.quantity;

      if (tokenInfo && tokenInfo.Data) {
        try {
          const info = JSON.parse(tokenInfo.Data);
          if (info.Denomination) {
            denomination = parseInt(info.Denomination);
          }
        } catch {
          // Use default denomination if parsing fails
        }
      }

      // Convert human-readable amount to token units based on denomination
      if (!args.quantity.includes(".") && !args.rawAmount) {
        // If it's a whole number and not marked as raw, apply denomination
        const numericQuantity = parseFloat(args.quantity);
        actualQuantity = (
          numericQuantity * Math.pow(10, denomination)
        ).toString();
      }

      // Attempt to mint tokens
      const tags = [
        { name: "Action", value: "Mint" },
        { name: "Recipient", value: recipient },
        { name: "Quantity", value: actualQuantity },
      ];

      const result = await send(this.context.keyPair, processId, tags, null);

      return JSON.stringify({
        message: `Mint initiated: ${args.quantity} tokens to ${args.recipient}`,
        mint: {
          actualQuantity,
          processId,
          quantity: args.quantity,
          recipient,
        },
        result,
        success: true,
      });
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}