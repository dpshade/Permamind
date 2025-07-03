import { beforeEach, describe, expect, it } from "vitest";

import {
  type EncryptionResult,
  encryptionService,
} from "../../../src/services/EncryptionService.js";

describe("EncryptionService", () => {
  // Test seed phrase (12 words)
  const testSeedPhrase =
    "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

  // Test data
  const testData = "This is sensitive memory content that should be encrypted";
  const testMemoryId = "test-memory-123";

  beforeEach(() => {
    // Reset any state if needed
  });

  describe("encrypt", () => {
    it("should encrypt data successfully", async () => {
      const result = await encryptionService.encrypt(testData, testSeedPhrase);

      expect(result).toBeDefined();
      expect(result.encryptedData).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();
      expect(result.version).toBe("1.0");

      // Verify base64 encoding
      expect(() => atob(result.encryptedData)).not.toThrow();
      expect(() => atob(result.iv)).not.toThrow();
      expect(() => atob(result.authTag)).not.toThrow();
    });

    it("should produce different IV for each encryption", async () => {
      const result1 = await encryptionService.encrypt(testData, testSeedPhrase);
      const result2 = await encryptionService.encrypt(testData, testSeedPhrase);

      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.encryptedData).not.toBe(result2.encryptedData);
    });

    it("should produce consistent encryption for same memory ID", async () => {
      // Note: This tests deterministic salt generation, but IV is still random
      const result1 = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
        testMemoryId,
      );
      const result2 = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
        testMemoryId,
      );

      // IVs should still be different (security requirement)
      expect(result1.iv).not.toBe(result2.iv);

      // But both should be decryptable with same parameters
      const decrypted1 = await encryptionService.decrypt(
        result1,
        testSeedPhrase,
        testMemoryId,
      );
      const decrypted2 = await encryptionService.decrypt(
        result2,
        testSeedPhrase,
        testMemoryId,
      );

      expect(decrypted1).toBe(testData);
      expect(decrypted2).toBe(testData);
    });

    it("should handle empty string", async () => {
      const result = await encryptionService.encrypt("", testSeedPhrase);
      const decrypted = await encryptionService.decrypt(result, testSeedPhrase);

      expect(decrypted).toBe("");
    });

    it("should handle unicode characters", async () => {
      const unicodeData =
        "🔐 Encrypted memory with émojis and ñoñó characters 中文";
      const result = await encryptionService.encrypt(
        unicodeData,
        testSeedPhrase,
      );
      const decrypted = await encryptionService.decrypt(result, testSeedPhrase);

      expect(decrypted).toBe(unicodeData);
    });

    it("should handle large data", async () => {
      const largeData = "x".repeat(10000); // 10KB of data
      const result = await encryptionService.encrypt(largeData, testSeedPhrase);
      const decrypted = await encryptionService.decrypt(result, testSeedPhrase);

      expect(decrypted).toBe(largeData);
    });

    it("should handle non-standard seed phrase", async () => {
      // BIP39 libraries are often permissive, so test that we can still encrypt/decrypt
      const nonStandardSeedPhrase = "not a valid seed phrase";

      const encrypted = await encryptionService.encrypt(
        testData,
        nonStandardSeedPhrase,
      );
      const decrypted = await encryptionService.decrypt(
        encrypted,
        nonStandardSeedPhrase,
      );

      expect(decrypted).toBe(testData);
      expect(encrypted.version).toBe("1.0");
    });
  });

  describe("decrypt", () => {
    it("should decrypt data successfully", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );
      const decrypted = await encryptionService.decrypt(
        encrypted,
        testSeedPhrase,
      );

      expect(decrypted).toBe(testData);
    });

    it("should decrypt with memory ID", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
        testMemoryId,
      );
      const decrypted = await encryptionService.decrypt(
        encrypted,
        testSeedPhrase,
        testMemoryId,
      );

      expect(decrypted).toBe(testData);
    });

    it("should fail with wrong seed phrase", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );
      const wrongSeedPhrase =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

      await expect(
        encryptionService.decrypt(encrypted, wrongSeedPhrase),
      ).rejects.toThrow("Decryption failed");
    });

    it("should fail with wrong memory ID", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
        testMemoryId,
      );
      const wrongMemoryId = "wrong-memory-id";

      await expect(
        encryptionService.decrypt(encrypted, testSeedPhrase, wrongMemoryId),
      ).rejects.toThrow("Decryption failed");
    });

    it("should fail with tampered encrypted data", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );

      // Tamper with encrypted data
      const tamperedResult: EncryptionResult = {
        ...encrypted,
        encryptedData: "dGFtcGVyZWRkYXRh", // "tampereddata" in base64
      };

      await expect(
        encryptionService.decrypt(tamperedResult, testSeedPhrase),
      ).rejects.toThrow("Decryption failed");
    });

    it("should fail with tampered auth tag", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );

      // Tamper with auth tag
      const tamperedResult: EncryptionResult = {
        ...encrypted,
        authTag: "dGFtcGVyZWRhdXRodGFn", // "tamperedauthtag" in base64
      };

      await expect(
        encryptionService.decrypt(tamperedResult, testSeedPhrase),
      ).rejects.toThrow("Decryption failed");
    });

    it("should fail with wrong version", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );

      // Change version
      const wrongVersionResult: EncryptionResult = {
        ...encrypted,
        version: "2.0",
      };

      await expect(
        encryptionService.decrypt(wrongVersionResult, testSeedPhrase),
      ).rejects.toThrow("Unsupported encryption version: 2.0");
    });

    it("should fail with invalid base64 data", async () => {
      const invalidResult: EncryptionResult = {
        authTag: "validBase64==",
        encryptedData: "invalid-base64-!@#$%",
        iv: "validBase64==",
        version: "1.0",
      };

      await expect(
        encryptionService.decrypt(invalidResult, testSeedPhrase),
      ).rejects.toThrow("Decryption failed");
    });
  });

  describe("getEncryptionMetadata", () => {
    it("should return correct metadata", () => {
      const metadata = encryptionService.getEncryptionMetadata();

      expect(metadata.algorithm).toBe("AES-GCM");
      expect(metadata.keyDerivation).toBe("PBKDF2-SHA256");
      expect(metadata.version).toBe("1.0");
    });
  });

  describe("isEncrypted", () => {
    it("should detect encrypted data", async () => {
      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );
      const encryptedString = JSON.stringify(encrypted);

      expect(encryptionService.isEncrypted(encryptedString)).toBe(true);
    });

    it("should detect unencrypted data", () => {
      expect(encryptionService.isEncrypted(testData)).toBe(false);
      expect(encryptionService.isEncrypted("plain text")).toBe(false);
      expect(encryptionService.isEncrypted("")).toBe(false);
    });

    it("should handle invalid JSON", () => {
      expect(encryptionService.isEncrypted("{invalid json")).toBe(false);
      expect(encryptionService.isEncrypted("not json at all")).toBe(false);
    });

    it("should handle JSON without encryption fields", () => {
      const regularJson = JSON.stringify({
        content: "some content",
        timestamp: "2024-01-01",
      });

      expect(encryptionService.isEncrypted(regularJson)).toBe(false);
    });

    it("should handle partial encryption fields", () => {
      const partialJson = JSON.stringify({
        encryptedData: "data",
        iv: "iv",
        // Missing authTag and version
      });

      expect(encryptionService.isEncrypted(partialJson)).toBe(false);
    });
  });

  describe("round-trip encryption", () => {
    it("should maintain data integrity through multiple round trips", async () => {
      let data = testData;

      // Encrypt and decrypt 5 times
      for (let i = 0; i < 5; i++) {
        const encrypted = await encryptionService.encrypt(data, testSeedPhrase);
        data = await encryptionService.decrypt(encrypted, testSeedPhrase);
      }

      expect(data).toBe(testData);
    });

    it("should work with different seed phrases", async () => {
      const seedPhrase1 =
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      const seedPhrase2 =
        "legal winner thank year wave sausage worth useful legal winner thank yellow";

      const encrypted1 = await encryptionService.encrypt(testData, seedPhrase1);
      const encrypted2 = await encryptionService.encrypt(testData, seedPhrase2);

      // Should decrypt correctly with respective seed phrases
      const decrypted1 = await encryptionService.decrypt(
        encrypted1,
        seedPhrase1,
      );
      const decrypted2 = await encryptionService.decrypt(
        encrypted2,
        seedPhrase2,
      );

      expect(decrypted1).toBe(testData);
      expect(decrypted2).toBe(testData);

      // Should fail with wrong seed phrases
      await expect(
        encryptionService.decrypt(encrypted1, seedPhrase2),
      ).rejects.toThrow("Decryption failed");
      await expect(
        encryptionService.decrypt(encrypted2, seedPhrase1),
      ).rejects.toThrow("Decryption failed");
    });
  });

  describe("performance", () => {
    it("should encrypt and decrypt within reasonable time", async () => {
      const startTime = Date.now();

      const encrypted = await encryptionService.encrypt(
        testData,
        testSeedPhrase,
      );
      const decrypted = await encryptionService.decrypt(
        encrypted,
        testSeedPhrase,
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(decrypted).toBe(testData);
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });
});
