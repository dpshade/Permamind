import { JWKInterface } from "arweave/node/lib/wallet.js";

import { Memory } from "../models/Memory.js";
import { Tag } from "../models/Tag.js";
import { event, fetchEvents } from "../relay.js";

export interface MemoryService {
  createEvent: (
    signer: JWKInterface,
    hubId: string,
    tags: Tag[],
  ) => Promise<void>;
  fetch: (hubId: string) => Promise<Array<Memory>>;
  fetchByUser: (hubId: string, user: string) => Promise<Array<Memory>>;
  get: (hubId: string, id: string) => Promise<Memory>;
  search: (hubId: string, value: string) => Promise<Array<Memory>>;
}
//search
const service = (): MemoryService => {
  return {
    createEvent: async (
      signer: JWKInterface,
      hubId: string,
      tags: Tag[],
    ): Promise<void> => {
      try {
        await event(signer, hubId, tags);
      } catch {
        // Silent error handling for memory creation
      }
    },
    fetch: async (hubId: string): Promise<Array<Memory>> => {
      const memories: Array<Memory> = [];

      try {
        const filter = {
          kinds: ["10"],
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);
        for (let i = 0; i < events.length; i++) {
          //// console.log removed
          if (
            events[i] &&
            typeof events[i] === "object" &&
            (events[i] as Record<string, unknown>).Content
          ) {
            const memory = memoryFactory(events[i] as Record<string, unknown>);
            memories.push(memory);
          }
        }
      } catch {
        // Silent error handling for memory fetch
      }
      return memories;
    },
    fetchByUser: async (
      hubId: string,
      user: string,
    ): Promise<Array<Memory>> => {
      const memories: Array<Memory> = [];
      try {
        const filter = {
          kinds: ["10"],
        };
        const filter2 = {
          tags: { p: [user] },
        };
        const _filters = JSON.stringify([filter, filter2]);
        const events = await fetchEvents(hubId, _filters);
        for (let i = 0; i < events.length; i++) {
          //// console.log removed
          if (
            events[i] &&
            typeof events[i] === "object" &&
            (events[i] as Record<string, unknown>).Content
          ) {
            const memory = memoryFactory(events[i] as Record<string, unknown>);
            memories.push(memory);
          }
        }
      } catch {
        // Silent error handling for fetchByUser
      }
      return memories;
    },
    get: async (hub: string, id: string): Promise<Memory> => {
      const filter = {
        ids: [id],
        kinds: ["10"],
      };
      const _filters = JSON.stringify([filter]);
      const events = await fetchEvents(hub, _filters);
      if (events.length == 0) throw "Not Found";
      const memory = memoryFactory(events[0] as Record<string, unknown>);
      return memory;
    },
    search: async (hubId: string, value: string): Promise<Array<Memory>> => {
      const memories: Array<Memory> = [];

      try {
        const filter = {
          kinds: ["10"],
          search: value,
        };
        const _filters = JSON.stringify([filter]);
        const events = await fetchEvents(hubId, _filters);
        for (let i = 0; i < events.length; i++) {
          //// console.log removed
          if (
            events[i] &&
            typeof events[i] === "object" &&
            (events[i] as Record<string, unknown>).Content
          ) {
            const memory = memoryFactory(events[i] as Record<string, unknown>);
            memories.push(memory);
          }
        }
      } catch {
        // Silent error handling for search
      }
      return memories;
    },
  };
};

function memoryFactory(event: Record<string, unknown>): Memory {
  const memory: Memory = {
    content: event.Content as string,
    id: event.Id as string,
    p: event.p as string,
    role: event.r as string,
    timestamp: event.Timestamp as string,
  };
  return memory;
}

export const memoryService = service();
