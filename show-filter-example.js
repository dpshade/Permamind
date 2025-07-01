#!/usr/bin/env node

import { createVIP01Filter } from "./dist/models/VIP01Filter.js";

console.log('🔍 VIP-01 Filter Examples for "hello" search\n');

// Example 1: Basic hello search
const helloFilter = createVIP01Filter({
  kinds: ["11"],
  search: "hello",
  limit: 50,
});

console.log('📋 Example 1: Basic "hello" search');
console.log("Filter object:");
console.log(JSON.stringify(helloFilter, null, 2));
console.log("\nJSON sent to ProcessHub:");
console.log(JSON.stringify([helloFilter]));
console.log("\n" + "=".repeat(60) + "\n");

// Example 2: Category + search
const categoryFilter = createVIP01Filter({
  kinds: ["11"],
  tags: { category: ["demo"] },
  limit: 50,
});

console.log('📋 Example 2: Category "demo" search');
console.log("Filter object:");
console.log(JSON.stringify(categoryFilter, null, 2));
console.log("\nJSON sent to ProcessHub:");
console.log(JSON.stringify([categoryFilter]));
console.log("\n" + "=".repeat(60) + "\n");

// Example 3: Advanced search with multiple parameters
const advancedFilter = createVIP01Filter({
  kinds: ["11"],
  authors: ["abc123...xyz789"],
  search: "hello",
  since: 1672531200, // Jan 1, 2023
  until: 1704067200, // Jan 1, 2024
  tags: { category: ["demo"], version: ["1.0.0"] },
  limit: 25,
});

console.log("📋 Example 3: Advanced search with all VIP-01 parameters");
console.log("Filter object:");
console.log(JSON.stringify(advancedFilter, null, 2));
console.log("\nJSON sent to ProcessHub:");
console.log(JSON.stringify([advancedFilter]));
console.log("\n" + "=".repeat(60) + "\n");

// Example 4: Before VIP-01 (old format)
const oldFormat = [
  { kinds: ["11"] },
  { search: "hello" },
  { tags: { category: ["demo"] } },
];

console.log(
  "📋 Example 4: OLD FORMAT (before VIP-01) - Multiple filter objects",
);
console.log("Filter array:");
console.log(JSON.stringify(oldFormat, null, 2));
console.log("\nJSON sent to ProcessHub:");
console.log(JSON.stringify(oldFormat));
console.log("\n❌ Problems with old format:");
console.log("- Multiple separate filter objects");
console.log("- Less efficient for hub processing");
console.log("- No single optimization point");
console.log("- Harder to apply index optimizations");
console.log("\n" + "=".repeat(60) + "\n");

console.log("✅ VIP-01 Benefits:");
console.log("- Single consolidated filter object");
console.log("- Ready for index-based optimizations");
console.log("- Supports all parameters (authors, since, until, limit)");
console.log("- Client-side result processing (sorting, limiting)");
console.log("- Enhanced metadata (totalCount, hasMore)");
