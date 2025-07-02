import { JWKInterface } from "arweave/node/lib/wallet.js";
import { createProcess } from "../process.js";
import { evalProcess} from "../relay.js";


export interface TokenService {
  create: (
    signer: JWKInterface,
    tokenModule:string
  ) => Promise<string>;
}

const service = (): TokenService => {
  return {
    create: async (
      signer: JWKInterface,
      tokenModule:string
    ): Promise<string> => {
      const processId = await createProcess(signer);
      await evaluateToken(signer, processId,tokenModule);
      return processId;
    }
  };
};

async function evaluateToken(signer: JWKInterface, processId: string,tokenModule:string) {
  await evalProcess(signer, tokenModule, processId);
}

export const tokenService = service();
