import { Eval, FetchEvents, GetZoneById, GetZones, Info, Register, } from "./messageFactory.js";
import { read, send } from "./process.js";
export const evalProcess = async (signer, data, processId) => {
    try {
        const tags = Eval();
        await send(signer, processId, tags, data);
    }
    catch {
        // Silent error handling for evaluation process
    }
};
export const event = async (signer, hub, tags) => {
    const actionTag = {
        name: "Action",
        value: "Event",
    };
    const idTag = {
        name: "Original-Id",
        value: "",
    };
    tags.push(actionTag);
    tags.push(idTag);
    try {
        await send(signer, hub, tags, null);
    }
    catch {
        // Silent error handling for events
    }
};
export const info = async (processId) => {
    const message = Info();
    const result = await read(processId, message);
    if (result) {
        const json = JSON.parse(result.Data);
        return json;
    }
    else {
        throw new Error("Not Found");
    }
};
export const fetchEvents = async (processId, filters) => {
    let events = [];
    try {
        const message = FetchEvents(filters);
        const result = await read(processId, message);
        if (result) {
            const json = JSON.parse(result.Data);
            events = json;
        }
    }
    catch {
        // Silent error handling for fetch events
    }
    return events;
};
export const register = async (signer, processId, spec) => {
    try {
        const message = Register();
        await send(signer, processId, message, JSON.stringify(spec));
    }
    catch {
        // Silent error handling for register
    }
};
export const getZones = async (processId, filters, page, limit) => {
    let events = [];
    try {
        const message = GetZones(filters, page.toString(), limit.toString());
        const result = await read(processId, message);
        if (result) {
            const json = JSON.parse(result.Data);
            events = json;
        }
    }
    catch {
        // Silent error handling for get zones
    }
    return events;
};
export const getZone = async (processId, zoneId) => {
    let events = [];
    try {
        const message = GetZoneById(zoneId);
        const result = await read(processId, message);
        if (result) {
            const json = JSON.parse(result.Data);
            events = json;
        }
    }
    catch {
        // Silent error handling for get zone
    }
    return events;
};
