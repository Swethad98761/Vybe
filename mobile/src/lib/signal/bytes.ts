import "../crypto-polyfill";
import {
  bytesToHex,
  concatBytes,
  hexToBytes,
  randomBytes,
  utf8ToBytes,
} from "@noble/hashes/utils.js";

export { bytesToHex, concatBytes, hexToBytes, randomBytes, utf8ToBytes };

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function u32be(n: number): Uint8Array {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, n >>> 0);
  return out;
}
