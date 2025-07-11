import { describe, expect, it } from "vitest";

import type { Memory, MemoryMetadata } from "../../../src/models/Memory.js";

describe("Memory Model", () => {
  describe("Memory interface validation", () => {
    it("should validate complete Memory object", () => {
      const completeMemory: Memory = {
        content: "This is a test memory",
        id: "memory-123",
        importance: 0.8,
        metadata: {
          accessCount: 5,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: ["test", "memory", "validation"],
        },
        p: "user-public-key-456",
        role: "user",
      };

      expect(completeMemory.id).toBe("memory-123");
      expect(completeMemory.content).toBe("This is a test memory");
      expect(completeMemory.p).toBe("user-public-key-456");
      expect(completeMemory.role).toBe("user");
      expect(completeMemory.metadata.accessCount).toBe(5);
      expect(completeMemory.metadata.tags).toHaveLength(3);
      expect(completeMemory.importance).toBe(0.8);
    });

    it("should validate minimal Memory object", () => {
      const minimalMemory: Memory = {
        content: "Minimal memory",
        id: "memory-456",
        importance: 0.5,
        metadata: {
          accessCount: 0,
          lastAccessed: "2024-01-15T10:30:00Z",
          tags: [],
        },
        p: "user-key",
        role: "assistant",
      };

      expect(minimalMemory.id).toBe("memory-456");
      expect(minimalMemory.content).toBe("Minimal memory");
      expect(minimalMemory.role).toBe("assistant");
      expect(minimalMemory.metadata.tags).toHaveLength(0);
      expect(minimalMemory.importance).toBe(0.5);
    });

    it("should handle various role types", () => {
      const roles = ["user", "assistant", "system"] as const;

      roles.forEach((role) => {
        const memory: Memory = {
          content: `Memory for ${role}`,
          id: `memory-${role}`,
          importance: 0.6,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [role],
          },
          p: "test-key",
          role: role,
        };

        expect(memory.role).toBe(role);
        expect(memory.metadata.tags).toContain(role);
      });
    });
  });

  describe("MemoryMetadata interface validation", () => {
    it("should validate complete MemoryMetadata object", () => {
      const metadata: MemoryMetadata = {
        accessCount: 10,
        lastAccessed: "2024-01-15T10:30:00Z",
        tags: ["important", "workflow", "analysis"],
      };

      expect(metadata.accessCount).toBe(10);
      expect(metadata.lastAccessed).toBe("2024-01-15T10:30:00Z");
      expect(metadata.tags).toHaveLength(3);
      expect(metadata.tags).toContain("important");
      expect(metadata.tags).toContain("workflow");
      expect(metadata.tags).toContain("analysis");
    });

    it("should handle metadata with empty tags", () => {
      const metadata: MemoryMetadata = {
        accessCount: 0,
        lastAccessed: "2024-01-15T10:30:00Z",
        tags: [],
      };

      expect(metadata.tags).toHaveLength(0);
      expect(Array.isArray(metadata.tags)).toBe(true);
    });

    it("should handle metadata with single tag", () => {
      const metadata: MemoryMetadata = {
        accessCount: 1,
        lastAccessed: "2024-01-15T10:30:00Z",
        tags: ["single-tag"],
      };

      expect(metadata.tags).toHaveLength(1);
      expect(metadata.tags[0]).toBe("single-tag");
    });

    it("should handle high access count", () => {
      const metadata: MemoryMetadata = {
        accessCount: 9999,
        lastAccessed: "2024-01-15T10:30:00Z",
        tags: ["frequently-accessed"],
      };

      expect(metadata.accessCount).toBe(9999);
      expect(metadata.tags).toContain("frequently-accessed");
    });
  });

  describe("Memory importance validation", () => {
    it("should handle importance range 0-1", () => {
      const importanceValues = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];

      importanceValues.forEach((importance) => {
        const memory: Memory = {
          content: `Memory with importance ${importance}`,
          id: `memory-importance-${importance}`,
          importance: importance,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.importance).toBe(importance);
        expect(memory.importance).toBeGreaterThanOrEqual(0);
        expect(memory.importance).toBeLessThanOrEqual(1);
      });
    });

    it("should handle extreme importance values", () => {
      // Test boundary cases
      const extremeValues = [0, 1];

      extremeValues.forEach((importance) => {
        const memory: Memory = {
          content: `Extreme importance memory`,
          id: `memory-extreme-${importance}`,
          importance: importance,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.importance).toBe(importance);
      });
    });
  });

  describe("Memory content validation", () => {
    it("should handle various content types", () => {
      const contentTypes = [
        "Simple text memory",
        "Memory with numbers: 123, 456.78",
        "Memory with special chars: !@#$%^&*()",
        "Memory with unicode: 🧠💭✨",
        "Multi-line\nmemory\ncontent",
        "",
      ];

      contentTypes.forEach((content, index) => {
        const memory: Memory = {
          content: content,
          id: `memory-content-${index}`,
          importance: 0.5,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.content).toBe(content);
        expect(typeof memory.content).toBe("string");
      });
    });

    it("should handle long content", () => {
      const longContent = "Lorem ipsum ".repeat(1000);

      const memory: Memory = {
        content: longContent,
        id: "memory-long-content",
        importance: 0.7,
        metadata: {
          accessCount: 1,
          lastAccessed: new Date().toISOString(),
          tags: ["long-content"],
        },
        p: "test-key",
        role: "user",
      };

      expect(memory.content).toBe(longContent);
      expect(memory.content.length).toBeGreaterThan(10000);
      expect(memory.metadata.tags).toContain("long-content");
    });
  });

  describe("Memory ID validation", () => {
    it("should handle various ID formats", () => {
      const idFormats = [
        "simple-id",
        "id-with-numbers-123",
        "id_with_underscores",
        "id.with.dots",
        "VeryCamelCaseId",
        "id-with-UUID-abc123def456",
        "short",
        "very-long-id-with-many-parts-and-descriptive-names-for-testing",
      ];

      idFormats.forEach((id) => {
        const memory: Memory = {
          content: `Memory with ID: ${id}`,
          id: id,
          importance: 0.5,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.id).toBe(id);
        expect(typeof memory.id).toBe("string");
      });
    });
  });

  describe("Memory timestamp validation", () => {
    it("should handle valid ISO timestamps", () => {
      const validTimestamps = [
        "2024-01-15T10:30:00Z",
        "2024-01-15T10:30:00.000Z",
        "2024-12-31T23:59:59.999Z",
        "2000-01-01T00:00:00.000Z",
        new Date().toISOString(),
      ];

      validTimestamps.forEach((timestamp, index) => {
        const memory: Memory = {
          content: `Memory with timestamp`,
          id: `memory-timestamp-${index}`,
          importance: 0.5,
          metadata: {
            accessCount: 1,
            lastAccessed: timestamp,
            tags: [],
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.metadata.lastAccessed).toBe(timestamp);
        // Validate it's a valid date string (allow for normalization)
        expect(new Date(timestamp).toISOString()).toBeTruthy();
      });
    });
  });

  describe("Memory p (public key) validation", () => {
    it("should handle various public key formats", () => {
      const publicKeys = [
        "simple-key",
        "arweave-address-abc123def456ghi789",
        "very-long-public-key-with-many-characters-for-cryptographic-purposes",
        "key_with_underscores",
        "key-with-dashes",
        "KeyWithMixedCase123",
        "43CharacterArweaveAddressExample1234567890",
      ];

      publicKeys.forEach((p, index) => {
        const memory: Memory = {
          content: `Memory for public key`,
          id: `memory-key-${index}`,
          importance: 0.5,
          metadata: {
            accessCount: 1,
            lastAccessed: new Date().toISOString(),
            tags: [],
          },
          p: p,
          role: "user",
        };

        expect(memory.p).toBe(p);
        expect(typeof memory.p).toBe("string");
      });
    });
  });

  describe("Memory tags validation", () => {
    it("should handle various tag formats", () => {
      const tagSets = [
        [],
        ["single"],
        ["multiple", "tags", "here"],
        ["tag-with-dashes", "tag_with_underscores"],
        ["CamelCaseTag", "lowercase", "UPPERCASE"],
        ["tag1", "tag2", "tag3", "tag4", "tag5"],
        ["special!@#", "numbers123", "unicode🏷️"],
      ];

      tagSets.forEach((tags, index) => {
        const memory: Memory = {
          content: `Memory with ${tags.length} tags`,
          id: `memory-tags-${index}`,
          importance: 0.5,
          metadata: {
            accessCount: tags.length,
            lastAccessed: new Date().toISOString(),
            tags: tags,
          },
          p: "test-key",
          role: "user",
        };

        expect(memory.metadata.tags).toEqual(tags);
        expect(memory.metadata.tags).toHaveLength(tags.length);
        expect(Array.isArray(memory.metadata.tags)).toBe(true);
      });
    });
  });
});
