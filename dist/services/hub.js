import { event, fetchEvents } from "../relay.js";
//search
const service = () => {
    return {
        createEvent: async (signer, hubId, tags, data) => {
            try {
                await event(signer, hubId, tags, data);
            }
            catch {
                // Silent error handling for memory creation
            }
        },
        fetch: async (hubId) => {
            const events = [];
            const filter = {
                kinds: ["10"],
                limit: 100, // Default limit as per VIP-01
            };
            let _filters = JSON.stringify([filter]);
            try {
                const _events = await fetchEvents(hubId, _filters);
                for (let i = 0; i < _events.length; i++) {
                    //@ts-ignore
                    if (_events[i].Content) {
                        events.push(_events[i]);
                    }
                }
            }
            catch {
                return [filter];
            }
            return events;
        },
        fetchByUser: async (hubId, user) => {
            const events = [];
            const filter = {
                kinds: ["10"],
                limit: 100, // Default limit as per VIP-01
            };
            const filter2 = {
                tags: { p: [user] },
            };
            try {
                let _filters = JSON.stringify([filter, filter2]);
                const _events = await fetchEvents(hubId, _filters);
                for (let i = 0; i < _events.length; i++) {
                    //@ts-ignore
                    if (_events[i].Content) {
                        events.push(_events[i]);
                    }
                }
            }
            catch {
                return [filter, filter2];
            }
            return events;
        },
        get: async (hubId, id) => {
            const filter = {
                ids: [id],
                kinds: ["10"],
                limit: 1, // Only need one result for get operation
            };
            let _filters = JSON.stringify([filter]);
            const _events = await fetchEvents(hubId, _filters);
            if (_events.length == 0)
                throw "Not Found";
            return _events[0];
        },
        search: async (hubId, value, kind) => {
            const events = [];
            const filter = {
                kinds: [kind],
                limit: 100, // Default limit as per VIP-01
                search: value
            };
            let _filters = JSON.stringify([filter]);
            try {
                return await fetchEvents(hubId, _filters);
            }
            catch (e) {
                return [filter];
            }
        },
        publishProcessIntegration: async (signer, hubId, tags, processMarkdown) => {
            try {
                await event(signer, hubId, tags, processMarkdown);
            }
            catch {
                // Silent error handling for process integration publishing
            }
        },
        loadProcessIntegrations: async (hubId, query, limit) => {
            let baseFilter = {
                kinds: ["11"],
                limit: limit || 50,
            };
            let filters = [];
            try {
                // Build VIP-01 compliant filter parameters
                // Parse query for specific filters
                const queryLower = query?.toLowerCase() || "";
                // Check if query looks like a process ID (long alphanumeric string)
                if (queryLower.length > 20 && /^[a-zA-Z0-9_-]+$/.test(queryLower)) {
                    let filter = {
                        tags: { process_id: [query] },
                    };
                    filters.push(filter);
                }
                // Check for category keywords
                else if (queryLower.includes("defi") ||
                    queryLower.includes("token") ||
                    queryLower.includes("swap")) {
                    let filter = {
                        tags: { category: ["defi"] },
                    };
                    filters.push(filter);
                }
                else if (queryLower.includes("nft") || queryLower.includes("marketplace")) {
                    let filter = {
                        tags: { category: ["nft"] },
                    };
                    filters.push(filter);
                }
                else if (queryLower.includes("dao") ||
                    queryLower.includes("governance") ||
                    queryLower.includes("vote")) {
                    let filter = {
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
                let _filters = JSON.stringify(filters);
                const _events = await fetchEvents(hubId, _filters);
                return _events;
            }
            catch {
                // Silent error handling for loading process integrations
                return filters;
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
