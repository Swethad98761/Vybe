import { chacha20poly1305 } from "@noble/ciphers/chacha.js";
import { ed25519, x25519 } from "@noble/curves/ed25519.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { concatBytes, randomBytes, utf8ToBytes } from "./bytes";

export function newX25519() {
  const priv = x25519.utils.randomSecretKey();
  return { priv, pub: x25519.getPublicKey(priv) };
}

export function newEd25519() {
  const priv = ed25519.utils.randomSecretKey();
  return { priv, pub: ed25519.getPublicKey(priv) };
}

export function dh(priv: Uint8Array, pub: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(priv, pub);
}

export function sign(priv: Uint8Array, message: Uint8Array): Uint8Array {
  return ed25519.sign(message, priv);
}

export function verify(pub: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
  return ed25519.verify(signature, message, pub);
}

export function kdf(ikm: Uint8Array, salt: Uint8Array, info: string, length: number): Uint8Array {
  return hkdf(sha256, ikm, salt, utf8ToBytes(info), length);
}

export function kdfRoot(rootKey: Uint8Array, dhOut: Uint8Array) {
  const okm = kdf(dhOut, rootKey, "NijiRK", 64);
  return { rk: okm.slice(0, 32), ck: okm.slice(32) };
}

export function kdfChain(chainKey: Uint8Array) {
  const okm = kdf(chainKey, new Uint8Array(32), "NijiCK", 64);
  return { ck: okm.slice(0, 32), mk: okm.slice(32) };
}

export function aeadSeal(messageKey: Uint8Array, plaintext: Uint8Array, ad: Uint8Array): Uint8Array {
  const nonce = kdf(messageKey, new Uint8Array(32), "NijiN", 12);
  return chacha20poly1305(messageKey, nonce, ad).encrypt(plaintext);
}

export function aeadOpen(messageKey: Uint8Array, ciphertext: Uint8Array, ad: Uint8Array): Uint8Array {
  const nonce = kdf(messageKey, new Uint8Array(32), "NijiN", 12);
  return chacha20poly1305(messageKey, nonce, ad).decrypt(ciphertext);
}

export function bindSpk(signingPriv: Uint8Array, spkPub: Uint8Array): Uint8Array {
  return sign(signingPriv, concatBytes(utf8ToBytes("NijiSPK"), spkPub));
}

export function checkSpk(signingPub: Uint8Array, spkPub: Uint8Array, signature: Uint8Array): boolean {
  return verify(signingPub, concatBytes(utf8ToBytes("NijiSPK"), spkPub), signature);
}

export { randomBytes };
