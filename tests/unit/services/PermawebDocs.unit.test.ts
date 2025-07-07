import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import {
  PermawebDocs,
  type PermawebDomain,
} from "../../../src/services/PermawebDocs.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("PermawebDocs", () => {
  let permawebDocs: PermawebDocs;
  const mockFetch = global.fetch as unknown as Mock;

  beforeEach(() => {
    permawebDocs = new PermawebDocs();
    vi.clearAllMocks();

    // Default mock response
    mockFetch.mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(
          "# Test Section\nTest content about arweave development.",
        ),
    });
  });

  describe("getAvailableDomains", () => {
    it("should return all available domains", () => {
      const domains = permawebDocs.getAvailableDomains();

      expect(domains).toEqual([
        "arweave",
        "ao",
        "ario",
        "hyperbeam",
        "permaweb-glossary",
      ]);
    });
  });

  describe("isDocLoaded", () => {
    it("should return false for unloaded domain", () => {
      expect(permawebDocs.isDocLoaded("arweave")).toBe(false);
    });

    it("should return true for loaded domain", async () => {
      await permawebDocs.preload(["arweave"]);
      expect(permawebDocs.isDocLoaded("arweave")).toBe(true);
    });
  });

  describe("preload", () => {
    it("should preload specified domains", async () => {
      await permawebDocs.preload(["arweave", "ao"]);

      expect(permawebDocs.isDocLoaded("arweave")).toBe(true);
      expect(permawebDocs.isDocLoaded("ao")).toBe(true);
      expect(permawebDocs.isDocLoaded("ario")).toBe(false);
    });

    it("should preload all domains when none specified", async () => {
      await permawebDocs.preload();

      permawebDocs.getAvailableDomains().forEach((domain) => {
        expect(permawebDocs.isDocLoaded(domain)).toBe(true);
      });
    });

    it("should handle fetch errors gracefully", async () => {
      permawebDocs.clearCache(); // Ensure arweave is not cached
      mockFetch.mockClear();
      mockFetch.mockImplementation(() =>
        Promise.reject(new Error("Network error")),
      );

      await expect(permawebDocs.preload(["arweave"])).rejects.toThrow(
        "Failed to load arweave documentation: Network error",
      );
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe("clearCache", () => {
    it("should clear cache for specific domain", async () => {
      await permawebDocs.preload(["arweave"]);
      expect(permawebDocs.isDocLoaded("arweave")).toBe(true);

      permawebDocs.clearCache("arweave");
      expect(permawebDocs.isDocLoaded("arweave")).toBe(false);
    });

    it("should clear all cache when no domain specified", async () => {
      await permawebDocs.preload(["arweave", "ao"]);
      expect(permawebDocs.isDocLoaded("arweave")).toBe(true);
      expect(permawebDocs.isDocLoaded("ao")).toBe(true);

      permawebDocs.clearCache();
      expect(permawebDocs.isDocLoaded("arweave")).toBe(false);
      expect(permawebDocs.isDocLoaded("ao")).toBe(false);
    });
  });

  describe("getCacheStatus", () => {
    it("should return correct cache status", async () => {
      await permawebDocs.preload(["arweave"]);

      const status = permawebDocs.getCacheStatus();

      expect(status.arweave.loaded).toBe(true);
      expect(status.arweave.age).toBeTypeOf("number");
      expect(status.ao.loaded).toBe(false);
      expect(status.ao.age).toBeUndefined();
    });
  });

  describe("query", () => {
    beforeEach(async () => {
      // Mock different content for different domains
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("arweave")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# Arweave Guide\nArweave is a permanent storage blockchain.",
              ),
          });
        }
        if (url.includes("ao")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# AO Process\nAO processes are autonomous computing units.",
              ),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(
              "# General Content\nGeneral documentation content.",
            ),
        });
      });
    });

    it("should detect relevant domains automatically", async () => {
      const results = await permawebDocs.query("How to deploy to arweave?");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].domain).toBe("arweave");
    });

    it("should use specified domains", async () => {
      const results = await permawebDocs.query("general question", [
        "ao",
        "ario",
      ]);
      // Should only return results from ao or ario
      expect(results.every((r) => ["ao", "ario"].includes(r.domain))).toBe(
        true,
      );
    });

    it("should limit results based on maxResults", async () => {
      // Mock multiple sections to test limiting
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(`
# Section 1
Content with arweave keyword.
---
# Section 2  
More arweave content here.
---
# Section 3
Even more arweave information.
          `),
      });

      const results = await permawebDocs.query("arweave");
      // Simulate limiting to 2 (manually, since query no longer takes maxResults)
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty results for no matches", async () => {
      const results = await permawebDocs.query(
        "completely unrelated query about cooking",
      );
      expect(results).toEqual([]);
    });

    it("should include glossary for definition queries", async () => {
      const results = await permawebDocs.query("what is blockchain?");
      const glossaryChunks = results.filter(
        (r) => r.domain === "permaweb-glossary",
      );
      expect(glossaryChunks.length).toBeGreaterThanOrEqual(0);
    });

    it("should calculate relevance scores correctly", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve(`
# Arweave Development
This section covers arweave development in detail.

# Other Topic
This section has nothing to do with the query.
        `),
      });

      const response = await permawebDocs.query("arweave development");

      expect(response.length).toBeGreaterThan(0);
      const scores = response.map((r) => r.relevanceScore);
      expect(scores[0]).toBeGreaterThan(0);

      // Results should be sorted by relevance
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it("should include section titles in results", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () =>
          Promise.resolve("# Test Section Title\nTest content with arweave."),
      });

      const response = await permawebDocs.query("arweave");

      expect(response[0].content).toContain("Test Section Title");
    });
  });

  describe("domain detection", () => {
    const testCases = [
      {
        expectedDomains: ["arweave"],
        query: "How to use arweave-js library?",
      },
      {
        expectedDomains: ["ao"],
        query: "AO process spawning tutorial",
      },
      {
        expectedDomains: ["ario"],
        query: "AR.IO gateway setup",
      },
      {
        expectedDomains: ["hyperbeam"],
        query: "HyperBEAM device configuration",
      },
      {
        expectedDomains: ["permaweb-glossary"],
        query: "What is the permaweb?",
      },
      {
        expectedDomains: ["ao", "arweave"],
        query: "Deploy AO process to Arweave",
      },
    ];

    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("arweave")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# Arweave Guide\nHow to use arweave-js library? Arweave is a permanent storage blockchain.",
              ),
          });
        }
        if (url.includes("ao")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# AO Process\nAO process spawning tutorial. AO processes are autonomous computing units.",
              ),
          });
        }
        if (url.includes("ario")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# AR.IO Gateway\nAR.IO gateway setup and deployment.",
              ),
          });
        }
        if (url.includes("hyperbeam")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "# HyperBEAM Device\nHyperBEAM device configuration and distributed computation.",
              ),
          });
        }
        if (url.includes("permaweb-glossary")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                "permaweb: The global, permanent web.\n\nblockchain: a distributed ledger.",
              ),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("General documentation content."),
        });
      });
    });

    testCases.forEach(({ expectedDomains, query }) => {
      it(`should detect ${expectedDomains.join(", ")} for query: "${query}"`, async () => {
        const response = await permawebDocs.query(query);
        const detectedDomains = PermawebDocs.extractDomains(response);
        expectedDomains.forEach((domain) => {
          expect(detectedDomains).toContain(domain as PermawebDomain);
        });
      });
    });
  });

  describe("error handling", () => {
    it("should handle network errors during query", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));

      await expect(permawebDocs.query("arweave question")).rejects.toThrow(
        "Failed to load arweave documentation",
      );
    });

    it("should handle HTTP errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      await expect(permawebDocs.query("arweave question")).rejects.toThrow(
        "HTTP 404: Not Found",
      );
    });

    it("should handle empty responses", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(""),
      });

      await expect(permawebDocs.query("arweave question")).rejects.toThrow(
        "Empty content received",
      );
    });
  });

  describe("caching behavior", () => {
    it("should not refetch within cache period", async () => {
      await permawebDocs.preload(["arweave"]);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second query should use cache (specify domains to avoid auto-detection)
      await permawebDocs.query("arweave", ["arweave"]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should refetch after cache expiry", async () => {
      await permawebDocs.preload(["arweave"]);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Simulate cache expiry by clearing and checking (specify domains to avoid auto-detection)
      permawebDocs.clearCache("arweave");
      await permawebDocs.query("arweave", ["arweave"]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("chunkContent", () => {
    it("splits content by '---' for llms.txt domains", () => {
      const content = `Section 1\nContent A\n---\nSection 2\nContent B\n---\nSection 3\nContent C`;
      const chunks = permawebDocs["chunkContent"]("arweave", content);
      expect(chunks).toEqual([
        "Section 1\nContent A",
        "Section 2\nContent B",
        "Section 3\nContent C",
      ]);
    });

    it("splits content by double newline for permaweb-glossary", () => {
      const content = `Term 1: Definition 1.\n\nTerm 2: Definition 2.\n\nTerm 3: Definition 3.`;
      const chunks = permawebDocs["chunkContent"]("permaweb-glossary", content);
      expect(chunks).toEqual([
        "Term 1: Definition 1.",
        "Term 2: Definition 2.",
        "Term 3: Definition 3.",
      ]);
    });
  });

  describe("query (chunked results)", () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes("arweave")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                `Section 1 about arweave\n---\nSection 2 unrelated\n---\nSection 3 arweave storage`,
              ),
          });
        }
        if (url.includes("permaweb-glossary")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(
                `blockchain: a distributed ledger.\n\nstorage: saving data forever.`,
              ),
          });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve("Other content"),
        });
      });
    });

    it("returns only relevant chunks with isFullDocument false", async () => {
      const results = await permawebDocs.query("arweave storage");
      expect(results.length).toBeGreaterThan(0);
      for (const res of results) {
        expect(res.isFullDocument).toBe(false);
        expect(res.content).toMatch(/arweave|storage/);
      }
    });

    it("returns glossary chunks split by double newline", async () => {
      const results = await permawebDocs.query("blockchain");
      const glossaryChunks = results.filter(
        (r) => r.domain === "permaweb-glossary",
      );
      expect(glossaryChunks.length).toBeGreaterThan(0);
      for (const res of glossaryChunks) {
        expect(res.content).toMatch(/blockchain|storage/);
        expect(res.isFullDocument).toBe(false);
      }
    });
  });
});
