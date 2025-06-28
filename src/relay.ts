import { JWKInterface } from "arweave/node/lib/wallet.js";

import type { Tag } from "./models/Tag.js";

//@ts-ignore
import {
  Eval,
  FetchEvents,
  GetZoneById,
  GetZones,
  Info,
  QueryFee,
  Register,
  Transfer,
  UpdateProfile,
} from "./messageFactory.js";
//@ts-ignore
import { read, send } from "./process.js";

export const evalProcess = async (
  signer: JWKInterface,
  data: string,
  processId: string,
) => {
  //await walletService.connectWallet();
  try {
    const tags = Eval();
    // @ts-ignore
    await send(signer, processId, tags, data);
  } catch (e) {}
};

export const event = async (
  signer: JWKInterface,
  hub: string,
  tags: Array<Tag>,
) => {
  const actionTag: Tag = {
    name: "Action",
    value: "Event",
  };
  const idTag: Tag = {
    name: "Original-Id",
    value: "",
  };
  tags.push(actionTag);
  tags.push(idTag);
  try {
    // @ts-ignore
    const result = await send(signer, hub, tags, null);
  } catch (e) {}
};

export const info = async (processId: string): Promise<any> => {
  try {
    // @ts-ignore
    const message = Info();
    const result = await read(processId, message);
    //
    if (result) {
      const json = JSON.parse(result.Data);
      return json;
    } else {
      throw "Not Found";
    }
  } catch (e) {
    throw e;
  }
};

export const fetchEvents = async (
  processId: string,
  filters: string,
): Promise<any[]> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    const message = FetchEvents(filters);
    //// console.log removed
    //// console.log removed
    const result = await read(processId, message);

    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};

export const register = async (
  signer: JWKInterface,
  processId: string,
  spec: any,
): Promise<void> => {
  try {
    // @ts-ignore
    const message = Register();
    await send(signer, processId, message, JSON.stringify(spec));
  } catch (e) {}
};

export const getZones = async (
  processId: string,
  filters: string,
  page: number,
  limit: number,
): Promise<any[]> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    const message = GetZones(filters, page.toString(), limit.toString());
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};

export const getZone = async (
  processId: string,
  zoneId: string,
): Promise<any> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    const message = GetZoneById(zoneId);
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};
