/**
 * Niji Signal facade — X3DH + Double Ratchet over X25519, HKDF-SHA256,
 * and ChaCha20-Poly1305 (noble, MIT).
 *
 * Public API is shaped like a libsignal-client wrapper:
 *   ensureUser / bootstrapUsers / sealText / openText
 *
 * This session could not clone agnyathaavasi/libsignal-client-verify
 * (the Origin token is not scoped for that repo). When that package is
 * attached, swap the implementations behind these exports. Do not put
 * lock / ENCRYPTED chrome in the UI — sealing stays under the hood.
 */

export { bootstrapUsers, clearVault, decrypt, encrypt, ensureUser, envelopeHidesPlaintext, openText, restoreVault, sealText, serializeVault } from "./account";
export type { SignalEnvelope } from "./types";
