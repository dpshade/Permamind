import { JWKInterface } from "arweave/node/lib/wallet.js";

import type { Tag } from "./models/Tag.js";

import {
  Eval,
  FetchEvents,
  GetZoneById,
  GetZones,
  Info,
  Register,
} from "./messageFactory.js";
import { read, send } from "./process.js";

export const evalProcess = async (
  signer: JWKInterface,
  data: string,
  processId: string,
) => {
  try {
    const tags = Eval();
    await send(signer, processId, tags, data);
  } catch (e) {
    // Silent error handling
  }
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
    await send(signer, hub, tags, null);
  } catch (e) {
    // Silent error handling
  }
};

export const info = async (processId: string): Promise<any> => {
  try {
    const message = Info();
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      return json;
    } else {
      throw new Error("Not Found");
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
    const message = FetchEvents(filters);
    const result = await read(processId, message);

    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    // Silent error handling
  }
  return events;
};

export const register = async (
  signer: JWKInterface,
  processId: string,
  spec: any,
): Promise<void> => {
  try {
    const message = Register();
    await send(signer, processId, message, JSON.stringify(spec));
  } catch (e) {
    // Silent error handling
  }
};

export const getZones = async (
  processId: string,
  filters: string,
  page: number,
  limit: number,
): Promise<any[]> => {
  let events: any[] = [];
  try {
    const message = GetZones(filters, page.toString(), limit.toString());
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    // Silent error handling
  }
  return events;
};

export const getZone = async (
  processId: string,
  zoneId: string,
): Promise<any> => {
  let events: any[] = [];
  try {
    const message = GetZoneById(zoneId);
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch (e) {
    // Silent error handling
  }
  return events;
};
