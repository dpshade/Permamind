import { HUB_REGISTRY_ID } from "../constants.js";
import { createProcess } from "../process.js";
import { evalProcess, event, getZone, register } from "../relay.js";
import { luaModule } from "./hub_lua.js";
const service = () => {
    return {
        create: async (signer, profileData) => {
            const processId = await createProcess(signer);
            await evaluateHub(signer, processId);
            //// console.log removed
            const hubSpec = {
                description: "Social message hub",
                kinds: ["0", "1", "7", "6", "3", "2"],
                processId: processId,
                profile: profileData,
                type: "hub",
                version: "1.0.0",
            };
            await hubRegistryService.register(signer, HUB_REGISTRY_ID(), hubSpec);
            await createProfile(signer, processId, profileData);
            //// console.log removed
            //// console.log removed
            return processId;
        },
        getZoneById: async (processId, owner) => {
            const zone = await getZone(processId, owner);
            return zone;
        },
        register: async (signer, processId, spec) => {
            register(signer, processId, spec);
        },
    };
};
async function createProfile(signer, hubId, profileData) {
    try {
        const tags = [];
        // Prepare the content for the event
        const content = JSON.stringify(profileData);
        const kindTag = {
            name: "Kind",
            value: "0",
        };
        const contentTag = {
            name: "Content",
            value: content,
        };
        tags.push(kindTag);
        tags.push(contentTag);
        await event(signer, hubId, tags);
    }
    catch {
        // Silent error handling for profile creation
    }
}
async function evaluateHub(signer, processId) {
    try {
        await evalProcess(signer, luaModule, processId);
    }
    catch {
        // Silent error handling for hub evaluation
    }
}
export const hubRegistryService = service();
