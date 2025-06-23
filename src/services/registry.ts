import { evalProcess, event, getZone, getZones, register } from "../relay.js";
import type { Zone } from "../models/Zone.js";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import { ProfileCreateData } from "../models/Profile.js";
import { createProcess } from "../process.js";
import { Tag } from "../models/Tag.js";
import { luaModule } from "./hub_lua.js";
import { HUB_REGISTRY_ID } from "../constants.js";

export interface HubRegistryService {
    getZoneById: (processId: string, owner: string) => Promise<Zone>;
    register: (signer: JWKInterface, processId: string, spec: any) => Promise<void>;
    create: (signer: JWKInterface, profileData: ProfileCreateData) => Promise<string>;
}

const service = (): HubRegistryService => {
    return {
        register: async (signer: JWKInterface, processId: string, spec: any): Promise<void> => {
            register(signer, processId, spec)
        },
        getZoneById: async (processId: string, owner: string): Promise<Zone> => {
            try {
                console.log("getting zone")
                let zone = await getZone(processId, owner)
                console.log("got zone")
                return zone
            } catch (e) {
                throw (e)
            }
        },
        create: async (signer: JWKInterface, profileData: ProfileCreateData): Promise<string> => {
            try {
                const processId = await createProcess(signer);
                console.log(processId)
                await evaluateHub(signer, processId)
                //console.log("ProfileId", processId);
                const hubSpec = {
                    type: "hub",
                    kinds: ["0", "1", "7", "6", "3", "2"],
                    description: "Social message hub",
                    version: "1.0.0",
                    processId: processId,
                    profile: profileData
                };
                await hubRegistryService.register(signer, HUB_REGISTRY_ID(), hubSpec);
                await createProfile(signer, processId, profileData)
                //console.log("*** Hub ID ***", processId);
                //console.log("*** Profile ID ***", processId);
                return processId;
            } catch (error) {
                console.log("Failed to register profile:", error);
                throw (error)
            }
        },
    };
};

async function evaluateHub(signer: JWKInterface, processId: string) {
    try {
        await evalProcess(signer, luaModule, processId);
    } catch (e) {
        console.log(e)
    }
}

async function createProfile(signer: JWKInterface, hubId: string, profileData: ProfileCreateData) {
    try {
        let tags: Array<Tag> = [];
        // Prepare the content for the event
        const content = JSON.stringify(profileData);

        const kindTag: Tag = {
            name: "Kind",
            value: "0",
        };

        const contentTag: Tag = {
            name: "Content",
            value: content,
        };
        tags.push(kindTag);
        tags.push(contentTag);
        await event(signer, hubId, tags)
    } catch (err) {
        console.log(err)
    }
}

export const hubRegistryService = service();