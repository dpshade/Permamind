import { mnemonicToSeed } from "bip39-web-crypto";
import { webcrypto } from "crypto";

// Use Node.js webcrypto as crypto in the global scope
const crypto = globalThis.crypto || webcrypto;

// Type declarations for Node.js environment
declare global {
  interface CryptoKey {
    algorithm: KeyAlgorithm;
    extractable: boolean;
    type: KeyType;
    usages: KeyUsage[];
  }

  type KeyAlgorithm = {
    name: string;
  };

  type KeyType = "private" | "public" | "secret";

  type KeyUsage =
    | "decrypt"
    | "deriveBits"
    | "deriveKey"
    | "encrypt"
    | "sign"
    | "unwrapKey"
    | "verify"
    | "wrapKey";
}

/**
 * Encryption service for securing AI memory content using AES-256-GCM
 * Derives encryption keys from the user's seed phrase for deterministic encryption
 */

export interface EncryptionMetadata {
  algorithm: string;
  keyDerivation: string;
  version: string;
}

export interface EncryptionResult {
  authTag: string; // Base64 encoded authentication tag
  encryptedData: string; // Base64 encoded encrypted data
  iv: string; // Base64 encoded initialization vector
  version: string; // Encryption version for future compatibility
}

export interface EncryptionService {
  decrypt: (
    encryptedResult: EncryptionResult,
    seedPhrase: string,
    memoryId?: string,
  ) => Promise<string>;
  encrypt: (
    data: string,
    seedPhrase: string,
    memoryId?: string,
  ) => Promise<EncryptionResult>;
  getEncryptionMetadata: () => EncryptionMetadata;
  isEncrypted: (data: string) => boolean;
}

// Constants for encryption configuration
const ENCRYPTION_VERSION = "1.0";
const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256; // bits
const IV_LENGTH = 12; // bytes (96 bits for GCM)
const TAG_LENGTH = 16; // bytes (128 bits)
const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 32; // bytes

/**
 * Converts array buffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts base64 string to array buffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Derives an AES-256-GCM encryption key from seed phrase using PBKDF2
 */
async function deriveEncryptionKey(
  seedPhrase: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  // Convert seed phrase to seed buffer using BIP39
  const seedBuffer = await mnemonicToSeed(seedPhrase);

  // Import the seed as key material for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    seedBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  // Derive AES-GCM key using PBKDF2
  const encryptionKey = await crypto.subtle.deriveKey(
    {
      hash: "SHA-256",
      iterations: PBKDF2_ITERATIONS,
      name: "PBKDF2",
      salt: salt,
    },
    keyMaterial,
    {
      length: KEY_LENGTH,
      name: "AES-GCM",
    },
    false, // Not extractable for security
    ["encrypt", "decrypt"],
  );

  return encryptionKey;
}

/**
 * Derives a deterministic salt from memory ID for consistent encryption
 */
async function deriveSalt(memoryId?: string): Promise<Uint8Array> {
  const saltSource = memoryId || "default-memory-salt";
  const encoder = new TextEncoder();
  const data = encoder.encode(saltSource);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hashBuffer).slice(0, SALT_LENGTH);
}

/**
 * Creates the encryption service instance
 */
const service = (): EncryptionService => {
  return {
    decrypt: async (
      encryptedResult: EncryptionResult,
      seedPhrase: string,
      memoryId?: string,
    ): Promise<string> => {
      try {
        // Check version compatibility
        if (encryptedResult.version !== ENCRYPTION_VERSION) {
          throw new Error(
            `Unsupported encryption version: ${encryptedResult.version}`,
          );
        }

        // Derive salt and encryption key (same as encryption)
        const salt = await deriveSalt(memoryId);
        const key = await deriveEncryptionKey(seedPhrase, salt);

        // Convert base64 data back to array buffers
        const encryptedData = base64ToArrayBuffer(
          encryptedResult.encryptedData,
        );
        const iv = base64ToArrayBuffer(encryptedResult.iv);
        const authTag = base64ToArrayBuffer(encryptedResult.authTag);

        // Combine encrypted data and auth tag for AES-GCM
        const encryptedWithTag = new Uint8Array(
          encryptedData.byteLength + authTag.byteLength,
        );
        encryptedWithTag.set(new Uint8Array(encryptedData), 0);
        encryptedWithTag.set(new Uint8Array(authTag), encryptedData.byteLength);

        // Perform AES-GCM decryption
        const decryptedBuffer = await crypto.subtle.decrypt(
          {
            iv: iv,
            name: "AES-GCM",
            tagLength: TAG_LENGTH * 8,
          },
          key,
          encryptedWithTag,
        );

        // Convert decrypted bytes back to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
      } catch (error) {
        throw new Error(
          `Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },

    encrypt: async (
      data: string,
      seedPhrase: string,
      memoryId?: string,
    ): Promise<EncryptionResult> => {
      try {
        // Derive salt and encryption key
        const salt = await deriveSalt(memoryId);
        const key = await deriveEncryptionKey(seedPhrase, salt);

        // Generate random IV for this encryption
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

        // Convert data to bytes
        const encoder = new TextEncoder();
        const dataBytes = encoder.encode(data);

        // Perform AES-GCM encryption
        const encryptedBuffer = await crypto.subtle.encrypt(
          {
            iv: iv,
            name: "AES-GCM",
            tagLength: TAG_LENGTH * 8, // Convert bytes to bits
          },
          key,
          dataBytes,
        );

        // Split encrypted data and auth tag
        const encryptedData = encryptedBuffer.slice(0, -TAG_LENGTH);
        const authTag = encryptedBuffer.slice(-TAG_LENGTH);

        return {
          authTag: arrayBufferToBase64(authTag),
          encryptedData: arrayBufferToBase64(encryptedData),
          iv: arrayBufferToBase64(iv.buffer),
          version: ENCRYPTION_VERSION,
        };
      } catch (error) {
        throw new Error(
          `Encryption failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    },

    getEncryptionMetadata: (): EncryptionMetadata => {
      return {
        algorithm: ALGORITHM,
        keyDerivation: "PBKDF2-SHA256",
        version: ENCRYPTION_VERSION,
      };
    },

    isEncrypted: (data: string): boolean => {
      try {
        // Try to parse as JSON to see if it contains encryption fields
        const parsed = JSON.parse(data);
        return (
          typeof parsed === "object" &&
          parsed !== null &&
          "encryptedData" in parsed &&
          "iv" in parsed &&
          "authTag" in parsed &&
          "version" in parsed
        );
      } catch {
        // If it's not valid JSON, it's not an encrypted structure
        return false;
      }
    },
  };
};

export const encryptionService = service();
