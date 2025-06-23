import { FastMCP } from "fastmcp";
import { z } from "zod";
import { add } from "./add.js";
import { getKeyFromMnemonic } from "./mnemonic.js"

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
    let keyPair = await getKeyFromMnemonic("time puzzle delay cement today draw safe sweet leisure sibling kite absorb")
    //let phrase = await generateMnemonic()
   
    return JSON.stringify(keyPair);
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
