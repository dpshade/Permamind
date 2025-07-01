import { JWKInterface } from "arweave/node/lib/wallet.js";

import type { Zone } from "../models/Zone.js";

import { HUB_REGISTRY_ID } from "../constants.js";
import { ProfileCreateData } from "../models/Profile.js";
import { Tag } from "../models/Tag.js";
import { createProcess } from "../process.js";
import { evalProcess, event, getZone, register } from "../relay.js";
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
    spec: unknown,
  ) => Promise<void>;
}

const service = (): HubRegistryService => {
  return {
    create: async (
      signer: JWKInterface,
      profileData: ProfileCreateData,
    ): Promise<string> => {
      const processId = await createProcess(signer);
      await evaluateHub(signer, processId);
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
      return processId;
    },
    getZoneById: async (processId: string, owner: string): Promise<Zone> => {
      const zone = await getZone(processId, owner);
      return zone as Zone;
    },
    register: async (
      signer: JWKInterface,
      processId: string,
      spec: unknown,
    ): Promise<void> => {
      register(signer, processId, spec as Record<string, unknown>);
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
  } catch {
    // Silent error handling for profile creation
  }
}

async function evaluateHub(signer: JWKInterface, processId: string) {
  await evalProcess(signer, luaModule, processId);
}

export const hubRegistryService = service();
