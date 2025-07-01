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
import {
  VIP01Filter,
  VIP01FilterOptions,
  VIP01FilterResult,
} from "./models/VIP01Filter.js";
import { read, send } from "./process.js";
import { processVIP01Results } from "./utils/vip01Processing.js";

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
  data?: string,
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
    await send(signer, hub, tags, data || null);
  } catch {
    // Silent error handling for events
  }
};

export const info = async (processId: string): Promise<any> => {
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
): Promise<any[]> => {
  let events: any[] = [];
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

/**
 * Enhanced fetchEvents with VIP-01 compliant result processing
 */
export const fetchEventsVIP01 = async (
  processId: string,
  filter: VIP01Filter,
  options: VIP01FilterOptions = {},
): Promise<VIP01FilterResult> => {
  try {
    const filtersJson = JSON.stringify([filter]);
    const message = FetchEvents(filtersJson);
    const result = await read(processId, message);

    let events: any[] = [];
    if (result) {
      const json = JSON.parse(result.Data);
      events = Array.isArray(json) ? json : [];
    }

    // Apply VIP-01 compliant result processing
    return processVIP01Results(events, filter, {
      enableClientLimiting: true,
      enableSorting: true,
      includeMetadata: true,
      ...options,
    });
  } catch {
    // Return empty result with error metadata
    return {
      events: [],
      hasMore: false,
      totalCount: 0,
    };
  }
};

export const register = async (
  signer: JWKInterface,
  processId: string,
  spec: any,
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
): Promise<any[]> => {
  let events: any[] = [];
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
): Promise<any> => {
  let events: any[] = [];
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
