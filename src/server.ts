import { FastMCP } from "fastmcp";
import { z } from "zod";
import { memoryService } from "./services/memory.js";
import { generateMnemonic, getKeyFromMnemonic } from "./mnemonic.js"
import Arweave from 'arweave';
import { JWKInterface } from "arweave/node/lib/wallet.js";
import { Tag } from "./models/Tag.js";
import { hubRegistryService } from "./services/registry.js";
import { HUB_REGISTRY_ID } from "./constants.js";

let keyPair: JWKInterface;
let publicKey: string;
let hubId: string;

async function init() {
  console.log("initiating")
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
    console.log("ready")
  } catch (e) {
    console.log(e)
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
  description: "Adds a new memory to the conversation store",
  execute: async (args) => {
    let content: Tag = {
      name: "Content",
      value: args.content
    }
    let role: Tag = {
      name: "Role",
      value: args.role
    }
    let p: Tag = {
      name: "p",
      value: args.p
    }
    let tags: Tag[] = [content, role, p]
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
    title: "Get All Memories",
  },
  description: "Retrieves all memories for a given conversation",
  execute: async (args) => {
    let memories = await memoryService.fetchByUser(hubId, args.user)
    return String(memories);
  },
  name: "getAllMemories",
  parameters: z.object({
    user: z.string().describe("The public key of the other party in the memory"),
  }),
});

// Tool to get public key
server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Get Public Key",
  },
  description: "gets the public key for the server",
  parameters: z.object({}), // Empty object
  execute: async (args) => {
    return publicKey;
  },
  name: "getPublicKey"
});

// Tool to search memories
/*server.addTool({
  annotations: {
    openWorldHint: false, // This tool doesn't interact with external systems
    readOnlyHint: true, // This tool doesn't modify anything
    title: "Search Memories",
  },
  description: "Searches memories by keywords or content for a conversation",
  execute: async (args) => {
    return String(add(args.a, args.b));
  },
  name: "searchMemories",
  parameters: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
  }),
});*/

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

server.start({
  transportType: "stdio",
}).then(async (value) => {
  await init()
});
