//@ts-ignore
import { send, read } from "./process.js";
//@ts-ignore
import { Eval, FetchEvents, GetZones, GetZoneById, Register, Info, UpdateProfile, Transfer, QueryFee } from "./messageFactory.js";
import type { Tag } from "./models/Tag.js";
import { JWKInterface } from "arweave/node/lib/wallet.js";

export const evalProcess = async (signer:JWKInterface, data: string, processId: string) => {
  //await walletService.connectWallet();
  try {
    const tags = Eval();
    // @ts-ignore
    await send(signer,processId, tags, data);
    ;
  } catch (e) {
  }
};

export const event = async (signer:JWKInterface, hub: string, tags: Array<Tag>) => {
  const actionTag: Tag = {
    name: "Action",
    value: "Event",
  };
  let idTag: Tag = {
    name: "Original-Id",
    value: "",
  };
  tags.push(actionTag);
  tags.push(idTag);
  try {
    // @ts-ignore
    let result = await send(signer,hub, tags, null);
    ;
  } catch (e) {
  }
};

export const info = async (processId: string): Promise<any> => {
  try {
    // @ts-ignore
    let message = Info();
    let result = await read(processId, message);
    //
    if (result) {
      let json = JSON.parse(result.Data);
      return json;
    } else {
      throw ("Not Found")
    }
  } catch (e) {
    throw e;
  }
};

export const fetchEvents = async (processId: string, filters: string): Promise<any[]> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    let message = FetchEvents(filters);
    //console.log(message)
    //console.log(processId)
    let result = await read(processId, message);

    if (result) {
      let json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};

export const register = async (signer:JWKInterface, processId: string, spec: any): Promise<void> => {
  try {
    // @ts-ignore
    let message = Register();
    await send(signer, processId, message, JSON.stringify(spec));

  } catch (e) {
  }
};

export const getZones = async (processId: string, filters: string, page: Number, limit: Number): Promise<any[]> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    let message = GetZones(filters, page.toString(), limit.toString());
    let result = await read(processId, message);
    if (result) {
      let json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};

export const getZone = async (processId: string, zoneId: string): Promise<any> => {
  let events: any[] = [];
  try {
    // @ts-ignore
    let message = GetZoneById(zoneId);
    let result = await read(processId, message);
    if (result) {
      let json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    //throw e;
  }
  return events;
};