import { getZone, getZones, register } from "../relay.js";
import type { Zone } from "../models/Zone.js";
import { JWKInterface } from "arweave/node/lib/wallet.js";

export interface HubRegistryService {
    getZoneById: (processId: string, owner: string) => Promise<Zone>;
    register: (signer: JWKInterface, processId: string, spec: any) => Promise<void>;
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
    };
};

export const hubRegistryService = service();