import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import { JWKInterface } from "arweave/node/lib/wallet.js";

import {
  AOS_MODULE,
  CU_URL,
  GATEWAY_URL,
  MU_URL,
  SCHEDULER,
} from "./constants.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const { dryrun, message, result, spawn } = connect({
  CU_URL: CU_URL(),
  GATEWAY_URL: GATEWAY_URL(),
  MODE: "legacy",
  MU_URL: MU_URL(),
});

export async function send(
  signer: JWKInterface,
  processId: string,
  tags: { name: string; value: string }[],
  data: null | string,
) {
  const _message = {
    data: "",
    process: processId,
    scheduler: SCHEDULER(),
    signer: createDataItemSigner(signer),
    tags: tags,
  };
  if (data) _message.data = data;
  const messageId = await message(_message);
  return await readMessage(messageId, processId);
}

export const read = async (
  processId: string,
  tags: { name: string; value: string }[],
) => {
  const result = await dryrun({
    CU_URL: CU_URL(),
    GATEWAY_URL: GATEWAY_URL(),
    MU_URL: MU_URL(),
    process: processId,
    scheduler: SCHEDULER(),
    tags: tags,
  });

  if (result.Messages) {
    const message = result.Messages.pop();
    return message;
  }
};

export const createProcess = async (signer: JWKInterface) => {
  const processId = await spawn({
    module: AOS_MODULE(),
    scheduler: SCHEDULER(),
    signer: createDataItemSigner(signer),
  });
  await sleep(3000);
  return processId;
};

export interface TokenDeploymentConfig {
  denomination?: number;
  description?: string;
  logo?: string;
  name: string;
  ticker: string;
  totalSupply?: string;
}

export const createTokenProcess = async (
  signer: JWKInterface,
  config: TokenDeploymentConfig,
) => {
  try {
    // Step 1: Create basic AO process (same as hub creation)
    const processId = await spawn({
      module: AOS_MODULE(),
      scheduler: SCHEDULER(),
      signer: createDataItemSigner(signer),
    });

    // Validate processId
    if (!processId || typeof processId !== "string" || processId.length < 20) {
      throw new Error(`Invalid processId returned from spawn: ${processId}`);
    }

    // Step 2: Wait for process initialization (same as hub creation)
    await sleep(3000);

    // Step 3: Send complete token module in one go (hub pattern)
    const { createTokenLuaModule } = await import("./services/token_lua.js");
    const tokenModule = createTokenLuaModule(config);

    try {
      await send(
        signer,
        processId,
        [{ name: "Action", value: "Eval" }],
        tokenModule,
      );
    } catch (moduleError) {
      throw new Error(
        `Token module installation failed: ${moduleError instanceof Error ? moduleError.message : String(moduleError)}`,
      );
    }

    // Step 4: Brief wait for handlers to register (minimal, like hub)
    await sleep(1000);

    return processId;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    throw new Error(
      `createTokenProcess failed: ${errorMessage}${errorStack ? "\nStack: " + errorStack : ""}`,
    );
  }
};

const readMessage = async (messageId: string, processId: string) => {
  const { Error } = await result({
    message: messageId,
    process: processId,
  });
  if (Error !== undefined) {
    throw Error;
  }
};
