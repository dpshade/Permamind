import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata, CommonSchemas } from "../../core/index.js";
import { resolveToken } from "../utils/TokenResolver.js";

interface BurnTokensArgs {
  confirmed?: boolean;
  processId: string;
  quantity: string;
  rawAmount?: boolean;
}

export class BurnTokensCommand extends ToolCommand<BurnTokensArgs, any> {
  protected metadata: ToolMetadata = {
    name: "burnTokens",
    description: "Destroy tokens from your account. Supports token names/tickers from registry.",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Burn Tokens",
  };

  protected parametersSchema = z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    quantity: CommonSchemas.quantity.describe(
      "Amount of tokens to burn (will be converted based on token denomination unless rawAmount is true)"
    ),
    rawAmount: z
      .boolean()
      .optional()
      .describe(
        "Set to true to burn exact amount without denomination conversion"
      ),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: BurnTokensArgs): Promise<any> {
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

      // First check current balance
      const balanceResult = await read(processId, [
        { name: "Action", value: "Balance" },
        { name: "Target", value: this.context.publicKey },
      ]);

      // Then attempt burn
      const tags = [
        { name: "Action", value: "Burn" },
        { name: "Quantity", value: actualQuantity },
      ];

      const result = await send(this.context.keyPair, processId, tags, null);

      return JSON.stringify({
        balance: balanceResult?.Data ? JSON.parse(balanceResult.Data) : null,
        burn: {
          actualQuantity,
          processId,
          quantity: args.quantity,
        },
        message: `Burn initiated: ${args.quantity} tokens destroyed`,
        result,
        success: true,
      });
    } catch (error) {
      throw new Error(`Failed to burn tokens: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
