import { JWKInterface } from "arweave/node/lib/wallet.js";

import { Tag } from "../models/Tag.js";
import { event, fetchEvents } from "../relay.js";

export interface HubService {
  createEvent: (
    signer: JWKInterface,
    hubId: string,
    tags: Tag[],
    data?: string,
  ) => Promise<Record<string, unknown>[]>;
  fetch: (hubId: string) => Promise<Array<Record<string, unknown>>>;
  fetchByUser: (
    hubId: string,
    user: string,
  ) => Promise<Array<Record<string, unknown>>>;
  get: (hubId: string, id: string) => Promise<Record<string, unknown>>;
  loadProcessIntegrations: (
    hubId: string,
    query?: string,
    limit?: number,
  ) => Promise<Array<Record<string, unknown>>>;
  publishProcessIntegration: (
    signer: JWKInterface,
    hubId: string,
    tags: Tag[],
    processMarkdown: string,
  ) => Promise<void>;
  search: (
    hubId: string,
    value: string,
    kind: string,
  ) => Promise<Array<Record<string, unknown>>>;
}
//search
const service = (): HubService => {
  return {
    createEvent: async (
      signer: JWKInterface,
      hubId: string,
      tags: Tag[],
      data?: string,
    ): Promise<Record<string, unknown>[]> => {
      try {
        await event(signer, hubId, tags, data);
        return tags;
      } catch {
        return tags;
      }
    },
    fetch: async (hubId: string): Promise<Array<Record<string, unknown>>> => {
      const filter = {
        kinds: ["10"],
        limit: 100, // Default limit as per VIP-01
      };
      const _filters = JSON.stringify([filter]);
      try {
        return await fetchEvents(hubId, _filters);
      } catch {
        return [filter];
      }
    },
    fetchByUser: async (
      hubId: string,
      user: string,
    ): Promise<Array<Record<string, unknown>>> => {
      const filter = {
        kinds: ["10"],
        limit: 100, // Default limit as per VIP-01
      };
      const filter2 = {
        tags: { p: [user] },
      };
      try {
        const _filters = JSON.stringify([filter, filter2]);
        return await fetchEvents(hubId, _filters);
      } catch {
        return [filter, filter2];
      }
    },
    get: async (
      hubId: string,
      id: string,
    ): Promise<Record<string, unknown>> => {
      const filter = {
        ids: [id],
        kinds: ["10"],
        limit: 1, // Only need one result for get operation
      };
      const _filters = JSON.stringify([filter]);
      const _events = await fetchEvents(hubId, _filters);
      if (_events.length == 0) throw "Not Found";
      return _events[0];
    },
    loadProcessIntegrations: async (
      hubId: string,
      query?: string,
      limit?: number,
    ): Promise<Array<Record<string, unknown>>> => {
      const baseFilter: Record<string, unknown> = {
        kinds: ["11"],
        limit: limit || 50,
      };
      const filters: Record<string, unknown>[] = [];
      try {
        // Build VIP-01 compliant filter parameters

        // Parse query for specific filters
        const queryLower = query?.toLowerCase() || "";

        // Check if query looks like a process ID (long alphanumeric string)
        if (queryLower.length > 20 && /^[a-zA-Z0-9_-]+$/.test(queryLower)) {
          const filter = {
            tags: { process_id: [query] },
          };
          filters.push(filter);
        }
        // Check for category keywords
        else if (
          queryLower.includes("defi") ||
          queryLower.includes("token") ||
          queryLower.includes("swap")
        ) {
          const filter = {
            tags: { category: ["defi"] },
          };
          filters.push(filter);
        } else if (
          queryLower.includes("nft") ||
          queryLower.includes("marketplace")
        ) {
          const filter = {
            tags: { category: ["nft"] },
          };
          filters.push(filter);
        } else if (
          queryLower.includes("dao") ||
          queryLower.includes("governance") ||
          queryLower.includes("vote")
        ) {
          const filter = {
            tags: { category: ["governance"] },
          };
          filters.push(filter);
        }
        // General search if provided
        else if (query) {
          baseFilter.search = query;
          filters.push(baseFilter);
        }

        // Create VIP-01 compliant filter and use enhanced fetchEventsVIP01
        const _filters = JSON.stringify(filters);
        const _events = await fetchEvents(hubId, _filters);
        return _events;
      } catch {
        // Silent error handling for loading process integrations
        return filters;
      }
    },
    publishProcessIntegration: async (
      signer: JWKInterface,
      hubId: string,
      tags: Tag[],
      processMarkdown: string,
    ): Promise<void> => {
      try {
        await event(signer, hubId, tags, processMarkdown);
      } catch {
        // Silent error handling for process integration publishing
      }
    },
    search: async (
      hubId: string,
      value: string,
      kind: string,
    ): Promise<Array<Record<string, unknown>>> => {
      const filter = {
        kinds: [kind],
        limit: 100, // Default limit as per VIP-01
        search: value,
      };
      const _filters = JSON.stringify([filter]);

      try {
        return await fetchEvents(hubId, _filters);
      } catch {
        // Error fetching events - silent for MCP compatibility
        return [filter];
      }
    },
  };
};

/*function memoryFactory(event: Record<string, unknown>): Memory {
  const memory: Memory = {
    content: event.Content as string,
    id: event.Id as string,
    p: event.p as string,
    role: event.r as string,
    timestamp: event.Timestamp as string,
  };
  return memory;
}*/

export const hubService = service();
