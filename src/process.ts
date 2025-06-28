// @ts-ignore
import { assign, connect, createDataItemSigner } from "@permaweb/aoconnect";
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

const { dryrun, message, monitor, result, results, spawn, unmonitor } =
  // @ts-ignore
  connect({
    CU_URL: CU_URL(),
    GATEWAY_URL: GATEWAY_URL(),
    MU_URL: MU_URL(),
  });

// @ts-ignore
export async function send(
  signer: JWKInterface,
  processId: string,
  tags: any[],
  data: null | string,
) {
  //// console.log removed
  //// console.log removed
  // The only 2 mandatory parameters here are process and signer
  // connect to the extension
  // @ts-ignore
  const _message = {
    data: "",

    /*
    The arweave TXID of the process, this will become the "target".
    This is the process the message is ultimately sent to.
*/
    process: processId,
    scheduler: SCHEDULER(),
    // A signer function used to build the message "signature"
    // @ts-ignore
    signer: createDataItemSigner(signer),
    // Tags that the process will use as input.
    tags: tags,
  };
  if (data) _message.data = data;
  const messageId = await message(_message);
  return await readMessage(messageId, processId);
  //return result
}

// @ts-ignore
export const read = async (processId, tags) => {
  //await sleep(300)
  //// console.log removed
  // The only 2 mandatory parameters here are process and signer
  // connect to the extension
  // @ts-ignore
  //// console.log removed
  //// console.log removed
  const result = await dryrun({
    CU_URL: CU_URL(),

    GATEWAY_URL: GATEWAY_URL(),
    MU_URL: MU_URL(),
    /*
    The arweave TXID of the process, this will become the "target".
    This is the process the message is ultimately sent to.
*/
    process: processId,
    scheduler: SCHEDULER(),
    // Tags that the process will use as input.
    tags: tags,
  });
  //// console.log removed
  if (result.Messages) {
    const message = result.Messages.pop();
    return message;
  }
  //return result
};

export const createProcess = async (signer: JWKInterface) => {
  const processId = await spawn({
    // The Arweave TXID of the ao Module
    module: AOS_MODULE(),
    scheduler: SCHEDULER(),
    // @ts-ignore
    signer: createDataItemSigner(signer),
  });
  await sleep(3000);
  return processId;
};

// @ts-ignore
const readMessage = async (messageId: string, processId: string) => {
  const { Error, Messages, Output, Spawns } = await result({
    // the arweave TXID of the message
    message: messageId,
    // the arweave TXID of the process
    process: processId,
  });
  if (Error == undefined) {
    //let message = Messages.pop();
    //let data = JSON.parse(message.Data);
  } else {
    throw Error;
  }
};
