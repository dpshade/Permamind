import { event, fetchEvents, } from "../relay.js";
import { Memory } from "../models/Memory.js";
import { Tag } from "../models/Tag.js";
import { JWKInterface } from "arweave/node/lib/wallet.js";


export interface MemoryService {
    fetch: (hubId: string) => Promise<Array<Memory>>;
    fetchByUser: (hubId: string, user: string) => Promise<Array<Memory>>;
    get: (hubId: string, id: string) => Promise<Memory>;
    createEvent: (signer:JWKInterface, hubId: string, tags: Tag[]) => Promise<void>;
}

const service = (): MemoryService => {
    return {
        fetch: async (hubId: string): Promise<Array<Memory>> => {
            let memories: Array<Memory> = []

            try {
                const filter = {
                    kinds: ["10"],
                };
                const _filters = JSON.stringify([filter]);
                fetchEvents(hubId, _filters).then(async (events) => {
                    for (var i = 0; i < events.length; i++) {
                        //console.log(events[i])
                        if (events[i].Content) {
                            let memory = memoryFactory(events[i]);
                            memories.push(memory)
                        }
                    }
                });
            } catch (error) {
                throw (error)
            }
            return memories
        },
        fetchByUser: async (hubId: string, user: string): Promise<Array<Memory>> => {
            let memories: Array<Memory> = []

            try {
                const filter = {
                    kinds: ["10"],
                };
                const filter2 = {
                    p: [user],
                };
                const _filters = JSON.stringify([filter, filter2]);
                fetchEvents(hubId, _filters).then(async (events) => {
                    for (var i = 0; i < events.length; i++) {
                        //console.log(events[i])
                        if (events[i].Content) {
                            let memory = memoryFactory(events[i]);
                            memories.push(memory)
                        }
                    }
                });
            } catch (error) {
                throw (error)
            }
            return memories
        },
        get: async (hub: string, id: string): Promise<Memory> => {

            try {
                const filter = {
                    kinds: ["10"],
                    ids: [id]
                };
                const _filters = JSON.stringify([filter]);
                let events = await fetchEvents(hub, _filters);
                if (events.length == 0) throw ("Not Found")
                let memory = memoryFactory(events[0]);
                return memory
            } catch (error) {
                throw (error)
            }
        },
        createEvent: async (signer:JWKInterface, hubId: string, tags: Tag[]): Promise<void> => {
            try {
                await event(signer, hubId, tags);
            } catch (e) {
                console.log(e)
            }
        },
    };
};

function memoryFactory(event: any): Memory {
    let memory: Memory = {
        id: event.Id,
        timestamp: event.Timestamp,
        content: event.Content,
        role: event.r,
        p: event.p
    }
    return memory
}

export const memoryService = service();
