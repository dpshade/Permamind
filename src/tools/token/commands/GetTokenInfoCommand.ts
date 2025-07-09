import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { resolveToken } from "../utils/TokenResolver.js";

interface GetTokenInfoArgs {
  confirmed?: boolean;
  processId: string;
}

export class GetTokenInfoCommand extends ToolCommand<GetTokenInfoArgs, any> {
  protected metadata: ToolMetadata = {
    name: "getTokenInfo",
    description: "Get comprehensive token information including supply, denomination, and metadata. Supports token names/tickers from registry.",
    openWorldHint: false,
    readOnlyHint: true,
    title: "Get Token Info",
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

  async execute(args: GetTokenInfoArgs): Promise<any> {
    try {
      const { read } = await import("../../../process.js");

      const tokenResolution = await resolveToken(args.processId, this.context.hubId);
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
      const tags = [{ name: "Action", value: "Info" }];
      const result = await read(processId, tags);

      return JSON.stringify({
        info: result?.Data ? JSON.parse(result.Data) : null,
        processId,
        success: true,
      });
    } catch (error) {
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}