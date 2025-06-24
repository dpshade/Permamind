import { FastMCP } from "fastmcp";
import { z } from "zod";
import { memoryService } from "./services/memory.js";
import { generateMnemonic, getKeyFromMnemonic } from "./mnemonic.js"
import Arweave from 'arweave';
import { JWKInterface } from "arweave/node/lib/wallet.js";
import { Tag } from "./models/Tag.js";
import { hubRegistryService } from "./services/registry.js";
import { HUB_REGISTRY_ID } from "./constants.js";
import { ProfileCreateData } from "./models/Profile.js";
import dotenv from 'dotenv';

let keyPair: JWKInterface;
let publicKey: string;
let hubId: string;

dotenv.config();

async function init() {
  const arweave = Arweave.init({});
  if (process.env.SEED_PHRASE) {
    keyPair = await getKeyFromMnemonic(process.env.SEED_PHRASE)
  } else {
    keyPair = await arweave.wallets.generate()
  }
  publicKey = await arweave.wallets.jwkToAddress(keyPair)
  try {
    let zone = await hubRegistryService.getZoneById(HUB_REGISTRY_ID(), publicKey)
    hubId = zone.spec.processId
  } catch (e) {
    if (e == "TypeError: Cannot read properties of undefined (reading 'processId')") {
      let profile: ProfileCreateData = {
        userName: "",
        displayName: "",
        description: "",
        thumbnail: "",
        coverImage: "",
        bot: true,
        website: ""
      }
      hubId = await hubRegistryService.create(keyPair, profile)
    }
  }
}

const server = new FastMCP({
  name: "Addition",
  version: "1.0.0",
});

// Tool to add a memory
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Add Memory",
  },
  description: `Add a new memory to permamind. This tool stores converstation as memories. Store every converstation.
  The memory will be indexed for semantic search and can be retrieved later using natural language queries. when possible use the known public key of the other party for the p arg`,
  execute: async (args) => {
    let kind: Tag = {
      name: "Kind",
      value: "10"
    }
    let content: Tag = {
      name: "Content",
      value: args.content
    }
    let role: Tag = {
      name: "r",
      value: args.role
    }
    let p: Tag = {
      name: "p",
      value: args.p
    }
    let tags: Tag[] = [kind, content, role, p]
    try {
      await memoryService.createEvent(keyPair, hubId, tags)
      return 'Added Memory'
    } catch (e) {
      return String(e)
    }
  },
  name: "addMemory",
  parameters: z.object({
    content: z.string().describe("The content of the memory"),
    role: z.string().describe("The role of the author of the memory"),
    p: z.string().describe("The public key of the other party in the memory"),
  }),
});

// Tool to get all memories for a conversation
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get All Memories For a Conversation",
  },
  description: `Retrieve all stored Memories from the hubId for the given p arg. Call this tool when you need 
    complete context of all previously stored Memories for the given p arg.
    Results are returned in JSON format with metadata.`,
  execute: async (args) => {
    let memories = await memoryService.fetchByUser(hubId, args.user)
    return JSON.stringify(memories);
  },
  name: "getAllMemoriesForConversation",
  parameters: z.object({
    user: z.string().describe("The public key of the other party in the memory"),
  }),
});

server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get All Memories",
  },
  description: `Retrieve all stored Memories for the hubId. Call this tool when you need 
    complete context of all previously stored Memories.
    Results are returned in JSON format with metadata.`,
  execute: async (args) => {
    let memories = await memoryService.fetch(hubId)
    return JSON.stringify(memories);
  },
  name: "getAllMemories",
  parameters: z.object({}),
});

// Tool to get public key
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get Server Info",
  },
  description: "gets the public key hubId for the server",
  parameters: z.object({}), // Empty object
  execute: async (args) => {
    let response = {
      publicKey: publicKey,
      hubId: hubId
    }
    return JSON.stringify(response);
  },
  name: "getServerInfo"
});

// Tool to search memories
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Search Memories",
  },
  description: "Retrieve all stored Memories for the hubId by keywords or content. Call this tool when you need to search for memories based on a keyword or content",
  execute: async (args) => {
    let memories = await memoryService.search(hubId, args.search)
    return JSON.stringify(memories);
  },
  name: "searchMemories",
  parameters: z.object({
    search: z.string().describe("keyword or content"),
  }),
});

/*server.addResource({
  async load() {
    return {
      text: "Example log content",
    };
  },
  mimeType: "text/plain",
  name: "Application Logs",
  uri: "file:///logs/app.log",
});

server.addPrompt({
  
  arguments: [
    {
      description: "Git diff or description of changes",
      name: "changes",
      required: true,
    },
  ],
  description: "Generate a Git commit message",
  load: async (args) => {
    return `Generate a concise but descriptive commit message for these changes:\n\n${args.changes}`;
  },
  name: "git-commit",
});*/

init().then((value) => {
  server.start({
    transportType: "stdio",
  })
})
