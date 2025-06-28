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
  } catch {
    // Silent error handling for evaluation process
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
  } catch {
    // Silent error handling for events
  }
};

export const info = async (processId: string): Promise<unknown> => {
  const message = Info();
  const result = await read(processId, message);
  if (result) {
    const json = JSON.parse(result.Data);
    return json;
  } else {
    throw new Error("Not Found");
  }
};

export const fetchEvents = async (
  processId: string,
  filters: string,
): Promise<unknown[]> => {
  let events: unknown[] = [];
  try {
    const message = FetchEvents(filters);
    const result = await read(processId, message);

    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch {
    // Silent error handling for fetch events
  }
  return events;
};

export const register = async (
  signer: JWKInterface,
  processId: string,
  spec: unknown,
): Promise<void> => {
  try {
    const message = Register();
    await send(signer, processId, message, JSON.stringify(spec));
  } catch {
    // Silent error handling for register
  }
};

export const getZones = async (
  processId: string,
  filters: string,
  page: number,
  limit: number,
): Promise<unknown[]> => {
  let events: unknown[] = [];
  try {
    const message = GetZones(filters, page.toString(), limit.toString());
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch {
    // Silent error handling for get zones
  }
  return events;
};

export const getZone = async (
  processId: string,
  zoneId: string,
): Promise<unknown> => {
  let events: unknown[] = [];
  try {
    const message = GetZoneById(zoneId);
    const result = await read(processId, message);
    if (result) {
      const json = JSON.parse(result.Data);
      events = json;
    }
  } catch {
    // Silent error handling for get zone
  }
  return events;
};
