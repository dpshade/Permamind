import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateMnemonic, getKeyFromMnemonic, validateMnemonic, pkcs8ToJwk } from "../../../src/mnemonic.js";

describe("Mnemonic Generation and Key Derivation", () => {
  describe("generateMnemonic", () => {
    it("should generate a valid 12-word mnemonic", async () => {
      const mnemonic = await generateMnemonic();
      
      expect(typeof mnemonic).toBe("string");
      expect(mnemonic.trim().split(/\s+/)).toHaveLength(12);
      
      // Validate the generated mnemonic
      const isValid = await validateMnemonic(mnemonic);
      expect(isValid).toBe(true);
    });

    it("should generate different mnemonics on multiple calls", async () => {
      const mnemonic1 = await generateMnemonic();
      const mnemonic2 = await generateMnemonic();
      
      expect(mnemonic1).not.toBe(mnemonic2);
    });

    it("should generate mnemonics with valid BIP39 words", async () => {
      const mnemonic = await generateMnemonic();
      const words = mnemonic.split(" ");
      
      // Each word should be a valid BIP39 word (basic check for format)
      words.forEach(word => {
        expect(word).toMatch(/^[a-z]+$/); // Only lowercase letters
        expect(word.length).toBeGreaterThan(2); // Reasonable word length
      });
    });

    it("should be fast (under 100ms)", async () => {
      const start = Date.now();
      await generateMnemonic();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(100);
    });
  });

  describe("validateMnemonic", () => {
    it("should validate a correctly generated mnemonic", async () => {
      const mnemonic = await generateMnemonic();
      const isValid = await validateMnemonic(mnemonic);
      
      expect(isValid).toBe(true);
    });

    it("should reject invalid mnemonics", async () => {
      const invalidMnemonics = [
        "invalid word count",
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon invalid",
        "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon", // 13 words
        "",
        "   ",
      ];

      for (const invalid of invalidMnemonics) {
        const isValid = await validateMnemonic(invalid);
        expect(isValid).toBe(false);
      }
    });

    it("should handle malformed input gracefully", async () => {
      const malformedInputs = [
        "word1  word2   word3", // Multiple spaces
        "word1\nword2\tword3", // Different whitespace
        "UPPERCASE words should fail",
      ];

      for (const malformed of malformedInputs) {
        const isValid = await validateMnemonic(malformed);
        expect(isValid).toBe(false);
      }
    });
  });

  describe("getKeyFromMnemonic", () => {
    it("should derive consistent keys from the same mnemonic", async () => {
      const mnemonic = await generateMnemonic();
      
      const key1 = await getKeyFromMnemonic(mnemonic);
      const key2 = await getKeyFromMnemonic(mnemonic);
      
      expect(key1).toEqual(key2);
    }, 60000);

    it("should generate different keys from different mnemonics", async () => {
      const mnemonic1 = await generateMnemonic();
      const mnemonic2 = await generateMnemonic();
      
      const key1 = await getKeyFromMnemonic(mnemonic1);
      const key2 = await getKeyFromMnemonic(mnemonic2);
      
      expect(key1).not.toEqual(key2);
    }, 60000);

    it("should generate valid JWK format", async () => {
      const mnemonic = await generateMnemonic();
      const jwk = await getKeyFromMnemonic(mnemonic);
      
      // Check JWK structure
      expect(jwk).toHaveProperty("kty", "RSA");
      expect(jwk).toHaveProperty("n"); // modulus
      expect(jwk).toHaveProperty("e"); // public exponent
      expect(jwk).toHaveProperty("d"); // private exponent
      expect(jwk).toHaveProperty("p"); // first prime factor
      expect(jwk).toHaveProperty("q"); // second prime factor
      expect(jwk).toHaveProperty("dp"); // first factor CRT exponent
      expect(jwk).toHaveProperty("dq"); // second factor CRT exponent
      expect(jwk).toHaveProperty("qi"); // first CRT coefficient
    }, 60000);

    it("should generate 4096-bit RSA keys", async () => {
      const mnemonic = await generateMnemonic();
      const jwk = await getKeyFromMnemonic(mnemonic);
      
      // Check that the modulus 'n' is approximately 4096 bits
      // Base64 encoded 4096-bit number should be around 683-684 characters
      const modulusLength = jwk.n!.length;
      expect(modulusLength).toBeGreaterThan(680);
      expect(modulusLength).toBeLessThan(690);
    }, 60000);

    it("should reject invalid mnemonics", async () => {
      const invalidMnemonic = "invalid mnemonic phrase here";
      
      await expect(getKeyFromMnemonic(invalidMnemonic))
        .rejects.toThrow();
    }, 60000);
  });

  describe("pkcs8ToJwk", () => {
    it("should convert PKCS8 to valid JWK format", async () => {
      const mnemonic = await generateMnemonic();
      
      // This will internally use pkcs8ToJwk
      const jwk = await getKeyFromMnemonic(mnemonic);
      
      expect(jwk.kty).toBe("RSA");
      expect(typeof jwk.n).toBe("string");
      expect(typeof jwk.e).toBe("string");
      expect(typeof jwk.d).toBe("string");
    }, 60000);
  });

  describe("Regression Tests", () => {
    it("should maintain compatibility with existing mnemonics", async () => {
      // Test with a known valid mnemonic to ensure backwards compatibility
      const knownMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      
      const isValid = await validateMnemonic(knownMnemonic);
      expect(isValid).toBe(true);
      
      // Should be able to derive a key without throwing
      const jwk = await getKeyFromMnemonic(knownMnemonic);
      expect(jwk).toHaveProperty("kty", "RSA");
    }, 60000);

    it("should maintain deterministic key derivation", async () => {
      const testMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
      
      const jwk1 = await getKeyFromMnemonic(testMnemonic);
      const jwk2 = await getKeyFromMnemonic(testMnemonic);
      
      // Same mnemonic should always produce the same key
      expect(jwk1.n).toBe(jwk2.n);
      expect(jwk1.d).toBe(jwk2.d);
    }, 60000);

    it("should handle edge cases in mnemonic validation", async () => {
      const edgeCases = [
        null,
        undefined,
        123,
        {},
        [],
        "   abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about   ", // Extra whitespace
      ];

      for (const edgeCase of edgeCases) {
        try {
          // @ts-expect-error: Testing with invalid types intentionally
          const isValid = await validateMnemonic(edgeCase);
          expect(isValid).toBe(false);
        } catch (error) {
          // Should handle gracefully, not throw unhandled errors
          expect(error).toBeDefined();
        }
      }
    });

    it("should generate mnemonics that work with Arweave wallet operations", async () => {
      const mnemonic = await generateMnemonic();
      const jwk = await getKeyFromMnemonic(mnemonic);
      
      // Verify JWK can be used for crypto operations
      expect(jwk.kty).toBe("RSA");
      expect(jwk.n).toBeDefined();
      expect(jwk.e).toBeDefined();
      expect(jwk.d).toBeDefined();
      
      // Ensure all required JWK fields are present for Arweave compatibility
      const requiredFields = ["kty", "n", "e", "d", "p", "q", "dp", "dq", "qi"];
      requiredFields.forEach(field => {
        expect(jwk).toHaveProperty(field);
        expect(jwk[field as keyof typeof jwk]).toBeDefined();
      });
    }, 60000);
  });

  describe("Performance Tests", () => {
    it("should generate mnemonics quickly", async () => {
      const iterations = 10;
      const start = Date.now();
      
      const promises = Array(iterations).fill(0).map(() => generateMnemonic());
      await Promise.all(promises);
      
      const duration = Date.now() - start;
      const avgDuration = duration / iterations;
      
      // Should average under 50ms per generation
      expect(avgDuration).toBeLessThan(50);
    });

    it("should derive keys in reasonable time", async () => {
      const mnemonic = await generateMnemonic();
      
      const start = Date.now();
      await getKeyFromMnemonic(mnemonic);
      const duration = Date.now() - start;
      
      // Key derivation can take longer but should be under 60 seconds
      expect(duration).toBeLessThan(60000);
    }, 60000);
  });
});