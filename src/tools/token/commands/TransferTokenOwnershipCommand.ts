import { z } from "zod";
import { ToolCommand, ToolContext, ToolMetadata } from "../../core/index.js";
import { resolveToken, resolveAddress } from "../utils/TokenResolver.js";

interface TransferTokenOwnershipArgs {
  confirmed?: boolean;
  processId: string;
  newOwner: string;
}

export class TransferTokenOwnershipCommand extends ToolCommand<TransferTokenOwnershipArgs, any> {
  protected metadata: ToolMetadata = {
    name: "transferTokenOwnership",
    description: "Transfer token ownership to another address (current owner only). Supports token names/tickers and contact names from registry.",
    openWorldHint: false,
    readOnlyHint: false,
    title: "Transfer Token Ownership",
  };

  protected parametersSchema = z.object({
    confirmed: z
      .boolean()
      .optional()
      .describe("Set to true to confirm resolved token/address"),
    processId: z.string().describe("The AO token process ID, name, or ticker"),
    newOwner: z.string().describe("Address or contact name of the new owner"),
  });

  constructor(private context: ToolContext) {
    super();
  }

  async execute(args: TransferTokenOwnershipArgs): Promise<any> {
    try {
      // Dynamic import to avoid circular dependencies
      const { send } = await import("../../../process.js");

      // Resolve token processId if needed
      const tokenResolution = await resolveToken(args.processId, this.context.hubId);
      if (!tokenResolution.resolved) {
        return JSON.stringify({
          error: "Token resolution failed",
          message: tokenResolution.verificationMessage,
          success: false,
          suggestion: "Use saveTokenMapping to register this token or provide a valid processId",
        });
      }

      if (tokenResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction: "Add 'confirmed: true' to your request to proceed with this token",
          message: tokenResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedToken: tokenResolution.value,
          success: false,
        });
      }

      const processId = tokenResolution.value!;

      // Resolve new owner address if needed
      const addressResolution = await resolveAddress(args.newOwner, this.context.hubId);
      if (!addressResolution.resolved) {
        return JSON.stringify({
          error: "New owner address resolution failed",
          message: addressResolution.verificationMessage,
          success: false,
          suggestion: "Use saveAddressMapping to register this contact or provide a valid address",
        });
      }

      if (addressResolution.requiresVerification && !args.confirmed) {
        return JSON.stringify({
          instruction: "Add 'confirmed: true' to your request to proceed with this new owner",
          message: addressResolution.verificationMessage,
          requiresConfirmation: true,
          resolvedNewOwner: addressResolution.value,
          success: false,
        });
      }

      const newOwner = addressResolution.value!;

      // Transfer ownership
      const tags = [
        { name: "Action", value: "Transfer-Ownership" },
        { name: "NewOwner", value: newOwner },
      ];

      const result = await send(this.context.keyPair, processId, tags, null);

      return JSON.stringify({
        message: `Ownership transfer initiated to ${args.newOwner}`,
        ownership: {
          newOwner,
          processId,
        },
        result,
        success: true,
      });
    } catch (error) {
      throw new Error(`Failed to transfer token ownership: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}