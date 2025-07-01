#!/usr/bin/env node

import dotenv from "dotenv";
import { getKeyFromMnemonic } from "./dist/mnemonic.js";
import { event } from "./dist/relay.js";
import { ProcessHub } from "./dist/constants.js";
import fs from "fs";

dotenv.config();

async function republishHello() {
  try {
    console.log("🚀 Republishing Hello Process with new seed phrase...");

    // Use the same seed phrase as Claude Desktop
    const seedPhrase =
      "gaze worry birth scale ten lady wink brain switch fringe punch announce";
    const keyPair = await getKeyFromMnemonic(seedPhrase);

    // Read the hello process content
    const processMarkdown = fs.readFileSync(
      "./hello-process-integration.md",
      "utf8",
    );

    // Create tags for VIP-11 process integration (content goes in data field)
    const tags = [
      { name: "Kind", value: "11" },
      { name: "title", value: "Hello Process" },
      {
        name: "description",
        value:
          "A simple greeting process that sends personalized hello messages",
      },
      { name: "version", value: "1.0.0" },
      { name: "category", value: "demo" },
    ];

    console.log("Publishing to ProcessHub:", ProcessHub());
    console.log("Process title: Hello Process");
    console.log("Category: demo");
    console.log("Data field: markdown content");

    // Publish to ProcessHub with data in the data field (VIP-11 compliant)
    await event(keyPair, ProcessHub(), tags, processMarkdown);

    console.log("✅ Hello Process republished successfully!");
    console.log(
      '🔍 You can now search for it using "load hello" in Claude Desktop',
    );
  } catch (error) {
    console.error("❌ Error republishing:", error);
  }
}

republishHello().catch(console.error);
