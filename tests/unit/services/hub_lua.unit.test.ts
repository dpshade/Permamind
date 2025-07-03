import { describe, expect, it } from "vitest";

import { luaModule } from "../../../src/services/hub_lua.js";

describe("Hub Lua Module", () => {
  describe("luaModule content", () => {
    it("should be defined and non-empty", () => {
      expect(luaModule).toBeDefined();
      expect(typeof luaModule).toBe("string");
      expect(luaModule.length).toBeGreaterThan(0);
    });

    it("should contain required Lua dependencies", () => {
      expect(luaModule).toContain("local json = require('json')");
      expect(luaModule).toContain("local bint = require('.bint')(256)");
      expect(luaModule).toContain('local utils = require(".utils")');
    });

    it("should define Kinds constants", () => {
      expect(luaModule).toContain("Kinds = {");
      expect(luaModule).toContain('PROFILE_UPDATE = "0"');
      expect(luaModule).toContain('NOTE = "1"');
      expect(luaModule).toContain('FOLLOW = "3"');
      expect(luaModule).toContain('REACTION = "7"');
    });

    it("should define State structure", () => {
      expect(luaModule).toContain("State = {");
      expect(luaModule).toContain("Events = Events or {}");
      expect(luaModule).toContain("Owner = Owner");
      expect(luaModule).toContain("Spec = {");
      expect(luaModule).toContain('type = "hub"');
      expect(luaModule).toContain('description = "Social message hub"');
      expect(luaModule).toContain('version = "0.1"');
      expect(luaModule).toContain("processId = ao.id");
    });

    it("should contain utility functions", () => {
      expect(luaModule).toContain(
        "local function slice(tbl, start_idx, end_idx)",
      );
      expect(luaModule).toContain("local function getTag(tags, key)");
      expect(luaModule).toContain(
        "local function addUniqueString(array, hashTable, str)",
      );
      expect(luaModule).toContain("local function getFollowList()");
    });

    it("should implement slice function correctly", () => {
      const sliceFunction = luaModule.match(
        /local function slice\(tbl, start_idx, end_idx\)(.*?)end/s,
      );
      expect(sliceFunction).toBeTruthy();
      expect(sliceFunction?.[1]).toContain("local new_table = {}");
      expect(sliceFunction?.[1]).toContain("table.move");
    });

    it("should implement getTag function correctly", () => {
      const getTagFunction = luaModule.match(
        /local function getTag\(tags, key\)(.*?)end/s,
      );
      expect(getTagFunction).toBeTruthy();
      expect(getTagFunction?.[1]).toContain("for _, tag in ipairs(tags or {})");
      expect(getTagFunction?.[1]).toContain("tag[1] == key");
      expect(getTagFunction?.[1]).toContain("tag[2]");
    });

    it("should implement addUniqueString function correctly", () => {
      const addUniqueStringFunction = luaModule.match(
        /local function addUniqueString\(array, hashTable, str\)(.*?)end/s,
      );
      expect(addUniqueStringFunction).toBeTruthy();
      expect(addUniqueStringFunction?.[1]).toContain(
        "if not hashTable[str] then",
      );
      expect(addUniqueStringFunction?.[1]).toContain("hashTable[str] = true");
      expect(addUniqueStringFunction?.[1]).toContain(
        "table.insert(array, str)",
      );
    });

    it("should implement getFollowList function correctly", () => {
      const getFollowListFunction = luaModule.match(
        /local function getFollowList\(\)(.*?)end/s,
      );
      expect(getFollowListFunction).toBeTruthy();
      expect(getFollowListFunction?.[1]).toContain(
        "for i = #State.Events, 1, -1 do",
      );
      expect(getFollowListFunction?.[1]).toContain(
        "if e.Kind == Kinds.FOLLOW and e.From == ao.id",
      );
      expect(getFollowListFunction?.[1]).toContain("return json.decode(e.p)");
    });

    it("should handle errors gracefully", () => {
      // Check that the module doesn't contain obvious syntax errors
      expect(luaModule).not.toContain("error(");
      expect(luaModule).not.toContain("assert(");

      // Check for proper Lua syntax patterns
      const functionCount = (luaModule.match(/local function/g) || []).length;
      const endCount = (luaModule.match(/\bend\b/g) || []).length;
      expect(endCount).toBeGreaterThanOrEqual(functionCount);
    });

    it("should be valid Lua syntax structure", () => {
      // Check for balanced braces
      const openBraces = (luaModule.match(/{/g) || []).length;
      const closeBraces = (luaModule.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);

      // Check for proper table definitions
      expect(luaModule).toContain("Kinds = {");
      expect(luaModule).toContain("State = {");
      expect(luaModule).toContain("Spec = {");
    });

    it("should include social media functionality", () => {
      expect(luaModule).toContain("PROFILE_UPDATE");
      expect(luaModule).toContain("NOTE");
      expect(luaModule).toContain("FOLLOW");
      expect(luaModule).toContain("REACTION");
    });

    it("should have proper modular structure", () => {
      // Should start with requires
      const moduleLines = luaModule.split("\n");
      const requireLines = moduleLines.filter((line) =>
        line.includes("require"),
      );
      expect(requireLines.length).toBeGreaterThan(0);

      // Should have proper exports/structure
      expect(luaModule).toContain("local");
      expect(luaModule).toContain("function");
    });
  });

  describe("module integration", () => {
    it("should be importable as a string", () => {
      expect(typeof luaModule).toBe("string");
      expect(luaModule.length).toBeGreaterThan(100);
    });

    it("should contain valid AO-compatible code", () => {
      expect(luaModule).toContain("ao.id");
      expect(luaModule).toContain("json");
      expect(luaModule).toContain("bint");
    });

    it("should be suitable for process evaluation", () => {
      // Should not contain any immediate execution code
      expect(luaModule).not.toContain("print(");
      expect(luaModule).not.toContain("io.write");

      // Should contain proper variable declarations
      expect(luaModule).toContain("local");
      expect(luaModule).toContain("State = {");
      expect(luaModule).toContain("Kinds = {");
    });
  });
});
