import { createVIP01Filter } from "../models/VIP01Filter.js";
import { event, fetchEvents } from "../relay.js";
//search
const service = () => {
    return {
        createEvent: async (signer, hubId, tags) => {
            try {
                await event(signer, hubId, tags);
            }
            catch {
                // Silent error handling for memory creation
            }
        },
        fetch: async (hubId) => {
            const memories = [];
            try {
                const filter = createVIP01Filter({
                    kinds: ["10"],
                    limit: 100, // Default limit as per VIP-01
                });
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                for (let i = 0; i < events.length; i++) {
                    if (events[i] &&
                        typeof events[i] === "object" &&
                        events[i].Content) {
                        const memory = memoryFactory(events[i]);
                        memories.push(memory);
                    }
                }
            }
            catch {
                // Silent error handling for memory fetch
            }
            return memories;
        },
        fetchByUser: async (hubId, user) => {
            const memories = [];
            try {
                const filter = createVIP01Filter({
                    kinds: ["10"],
                    limit: 100, // Default limit as per VIP-01
                    tags: { p: [user] },
                });
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                for (let i = 0; i < events.length; i++) {
                    if (events[i] &&
                        typeof events[i] === "object" &&
                        events[i].Content) {
                        const memory = memoryFactory(events[i]);
                        memories.push(memory);
                    }
                }
            }
            catch {
                // Silent error handling for fetchByUser
            }
            return memories;
        },
        get: async (hub, id) => {
            const filter = createVIP01Filter({
                ids: [id],
                kinds: ["10"],
                limit: 1, // Only need one result for get operation
            });
            const _filters = JSON.stringify([filter]);
            const events = await fetchEvents(hub, _filters);
            if (events.length == 0)
                throw "Not Found";
            const memory = memoryFactory(events[0]);
            return memory;
        },
        search: async (hubId, value) => {
            const memories = [];
            try {
                const filter = createVIP01Filter({
                    kinds: ["10"],
                    limit: 100, // Default limit as per VIP-01
                    search: value,
                });
                const _filters = JSON.stringify([filter]);
                const events = await fetchEvents(hubId, _filters);
                for (let i = 0; i < events.length; i++) {
                    if (events[i] &&
                        typeof events[i] === "object" &&
                        events[i].Content) {
                        const memory = memoryFactory(events[i]);
                        memories.push(memory);
                    }
                }
            }
            catch {
                // Silent error handling for search
            }
            return memories;
        },
    };
};
function memoryFactory(event) {
    const memory = {
        content: event.Content,
        id: event.Id,
        p: event.p,
        role: event.r,
        timestamp: event.Timestamp,
    };
    return memory;
}
export const memoryService = service();
