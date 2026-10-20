import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";

const open = new Set<string>();

export function hashSealPin(pin: string) {
  return bytesToHex(sha256(utf8ToBytes(`niji-seal:${pin}`)));
}

export function pinMatches(pin: string, hash?: string) {
  return Boolean(hash) && hashSealPin(pin) === hash;
}

export function sealUnlocked(id: string) {
  return open.has(id);
}

export function unlockSeal(id: string) {
  open.add(id);
}

export function lockSeal(id: string) {
  open.delete(id);
}
