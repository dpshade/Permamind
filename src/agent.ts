import { ChatOpenAI } from "@langchain/openai";
import { MCPAgent, MCPClient } from "mcp-use";
import "dotenv/config";

async function main() {
  // 1. Configure MCP servers
  const config = {
    mcpServers: {
      permamind: { args: ["dist/server.js"], command: "node" },
    },
  };
  const client = MCPClient.fromDict(config);

  // 2. Create LLM
  const llm = new ChatOpenAI({ modelName: "gpt-4o" });

  // 3. Instantiate agent
  //@ts-ignore

  //systemPrompt
  const agent = new MCPAgent({
    client,
    // @ts-expect-error - LangChain version compatibility issue
    llm,
    maxSteps: 20,
    systemPrompt:
      "add all new converstations to memory, your role is always system",
  });

  // 4. Run query
  const result = await agent.run(
    "did you add any memories using the MCP server and if so what are those memories",
  );
  console.log("Result:", result);
}

main().catch(console.error);
