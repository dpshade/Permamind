import { JWKInterface } from "arweave/node/lib/wallet.js";

import type { Zone } from "../models/Zone.js";

import { HUB_REGISTRY_ID } from "../constants.js";
import { ProfileCreateData } from "../models/Profile.js";
import { Tag } from "../models/Tag.js";
import { createProcess } from "../process.js";
import { evalProcess, event, getZone, getZones, register } from "../relay.js";
import { luaModule } from "./hub_lua.js";

export interface HubRegistryService {
  create: (
    signer: JWKInterface,
    profileData: ProfileCreateData,
  ) => Promise<string>;
  getZoneById: (processId: string, owner: string) => Promise<Zone>;
  register: (
    signer: JWKInterface,
    processId: string,
    spec: any,
  ) => Promise<void>;
}

const service = (): HubRegistryService => {
  return {
    create: async (
      signer: JWKInterface,
      profileData: ProfileCreateData,
    ): Promise<string> => {
      try {
        const processId = await createProcess(signer);
        await evaluateHub(signer, processId);
        //console.log("ProfileId", processId);
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
        //console.log("*** Hub ID ***", processId);
        //console.log("*** Profile ID ***", processId);
        return processId;
      } catch (error) {
        throw error;
      }
    },
    getZoneById: async (processId: string, owner: string): Promise<Zone> => {
      try {
        const zone = await getZone(processId, owner);
        return zone;
      } catch (e) {
        throw e;
      }
    },
    register: async (
      signer: JWKInterface,
      processId: string,
      spec: any,
    ): Promise<void> => {
      register(signer, processId, spec);
    },
  };
};

async function createProfile(
  signer: JWKInterface,
  hubId: string,
  profileData: ProfileCreateData,
) {
  try {
    const tags: Array<Tag> = [];
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
    await event(signer, hubId, tags);
  } catch (err) {}
}

async function evaluateHub(signer: JWKInterface, processId: string) {
  try {
    await evalProcess(signer, luaModule, processId);
  } catch (e) {}
}

export const hubRegistryService = service();
