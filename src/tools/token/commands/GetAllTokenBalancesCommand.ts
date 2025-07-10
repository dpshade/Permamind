import { z } from "zod";

import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { resolveToken } from "../utils/TokenResolver.js";

interface GetAllTokenBalancesArgs {
  confirmed?: boolean;
  processId: string;
}

export class GetAllTokenBalancesCommand extends ToolCommand<
  GetAllTokenBalancesArgs,
  string
> {
  protected metadata: ToolMetadata = {
    description:
      "Get all token balances in the contract. Supports token names/tickers from registry.",
    name: "getAllTokenBalances",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get All Token Balances",
  };

  protected parametersSchema = z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: GetAllTokenBalancesArgs): Promise<string> {
    try {
      const { read } = await import("../../../process.js");

      const tokenResolution = await resolveToken(
        args.processId,
        this.context.hubId,
      );
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction: "Add 'confirmed: true' to your request to proceed",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          success: false,
        });
      }

      const processId = tokenResolution.value!;
      const tags = [{ name: "Action", value: "Balances" }];
      const result = await read(processId, tags);

      return JSON.stringify({
        balances: result?.Data ? JSON.parse(result.Data) : null,
        success: true,
      });
    } catch (error) {
      throw new Error(
        `Failed to get all token balances: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
