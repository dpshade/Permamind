import { JWKInterface } from "arweave/node/lib/wallet.js";
import {
  validateMnemonic as bip39Validate,
  mnemonicToSeed,
  wordlists,
} from "bip39-web-crypto";
import {
  generateKeyPair,
  getKeyPairFromMnemonic,
  getKeyPairFromSeed,
} from "human-crypto-keys";

/**
 * Generate a 12 word mnemonic for an Arweave key
 * @returns {string} - a promise resolving to a 12 word mnemonic seed phrase
 */
export async function generateMnemonic() {
  const keys = await generateKeyPair(
    { id: "rsa", modulusLength: 4096 },
    { privateKeyFormat: "pkcs1-pem" },
  );
  return keys.mnemonic;
}

export async function getKeyFromMnemonic(mnemonic: string) {
  const seedBuffer = await mnemonicToSeed(mnemonic);
  const { privateKey } = await getKeyPairFromSeed(
    //@ts-ignore
    seedBuffer,
    {
      id: "rsa",
      modulusLength: 4096,
    },
    { privateKeyFormat: "pkcs8-der" },
  );
  const jwk = pkcs8ToJwk(privateKey as any);
  return jwk;
}

/**
 * Generates a JWK object representation of an Arweave key
 * @param mnemonic - a 12 word mnemonic represented as a string
 * @returns {object} - returns a Javascript object that conforms to the JWKInterface required by Arweave-js
 *
 * @example <caption>Generate an Arweave key and get its public address</caption>
 * let key = getKeyFromMnemonic('jewel cave spy act loyal solid night manual joy select mystery unhappy')
 * arweave.wallets.jwkToAddress(key)
 * //returns qe741op_rt-iwBazAqJipTc15X8INlDCoPz6S40RBdg
 *
 */

export async function pkcs8ToJwk(
  privateKey: Uint8Array,
): Promise<JWKInterface> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKey,
    { hash: "SHA-256", name: "RSA-PSS" },
    true,
    ["sign"],
  );
  const jwk = await crypto.subtle.exportKey("jwk", key);

  return {
    d: jwk.d,
    dp: jwk.dp,
    dq: jwk.dq,
    e: jwk.e!,
    kty: jwk.kty!,
    n: jwk.n!,
    p: jwk.p,
    q: jwk.q,
    qi: jwk.qi,
  };
}

/**
 * Validate a mnemonic seed phrase
 * @param mnemonic - a 12 word mnemonic represented as a string
 * @returns {Promise<boolean>} - true if the mnemonic is valid, false otherwise
 */
export async function validateMnemonic(mnemonic: string): Promise<boolean> {
  try {
    // Check if it's exactly 12 words
    const words = mnemonic.trim().split(/\s+/);
    if (words.length !== 12) {
      return false;
    }

    // Use bip39 validation
    const result = await bip39Validate(mnemonic, wordlists.english);
    return result;
  } catch (err) {
    return false;
  }
}
