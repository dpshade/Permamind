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
  name: string;
  ticker: string;
  denomination?: number;
  totalSupply?: string;
  logo?: string;
  description?: string;
}

export const createTokenProcess = async (
  signer: JWKInterface,
  config: TokenDeploymentConfig,
) => {
  const tags = [
    { name: "Name", value: config.name },
    { name: "Ticker", value: config.ticker },
    { name: "Denomination", value: (config.denomination || 12).toString() },
  ];

  if (config.totalSupply) {
    tags.push({ name: "Total-Supply", value: config.totalSupply });
  }

  if (config.logo) {
    tags.push({ name: "Logo", value: config.logo });
  }

  if (config.description) {
    tags.push({ name: "Description", value: config.description });
  }

  const processId = await spawn({
    module: AOS_MODULE(),
    scheduler: SCHEDULER(),
    signer: createDataItemSigner(signer),
    tags: tags,
  });

  await sleep(3000);
  return processId;
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
