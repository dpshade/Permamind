import { FastMCP } from "fastmcp";
import { z } from "zod";
import { add } from "./add.js";
import { generateMnemonic, getKeyFromMnemonic } from "./mnemonic.js"
import Arweave from 'arweave';

// Since v1.5.1 you're now able to call the init function for the web version without options. The current URL path will be used by default. This is recommended when running from a gateway.
const arweave = Arweave.init({});

let seed = process.env.SEED_PHRASE

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
    //let phrase = await generateMnemonic()
    let keyPair = await getKeyFromMnemonic("just liquid true rely reward chest illegal clump time estate frozen prefer")
    let publicKey = await arweave.wallets.jwkToAddress(keyPair)
    return publicKey;
  },
  name: "addMemory",
  parameters: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
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
    return String(add(args.a, args.b));
  },
  name: "getAllMemories",
  parameters: z.object({
    a: z.number().describe("The first number"),
    b: z.number().describe("The second number"),
  }),
});

// Tool to search memories
server.addTool({
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

server.start({
  transportType: "stdio",
});
