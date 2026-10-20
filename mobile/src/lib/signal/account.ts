import { bindSpk, newEd25519, newX25519 } from "./crypto";
import { bytesToHex } from "./bytes";
import {
  acceptSession,
  initiateSession,
  publishBundle,
  ratchetDecrypt,
  ratchetEncrypt,
  sessionKey,
} from "./protocol";
import type {
  AccountState,
  SignalEnvelope,
  SignalPart,
  SignalVault,
} from "./types";

const OPK_POOL = 8;

function emptyVault(): SignalVault {
  return { v: 1, users: {}, sessions: {} };
}

let vault: SignalVault = emptyVault();

export function serializeVault(): string {
  return JSON.stringify(vault);
}

export function restoreVault(raw: string | null | undefined): void {
  if (!raw) {
    vault = emptyVault();
    return;
  }
  try {
    const parsed = JSON.parse(raw) as SignalVault;
    vault = parsed?.v === 1 && parsed.users && parsed.sessions ? parsed : emptyVault();
  } catch {
    vault = emptyVault();
  }
}

export function clearVault(): void {
  vault = emptyVault();
}

export function getVault(): SignalVault {
  return vault;
}

function replenishOpks(account: AccountState) {
  while (account.oneTime.length < OPK_POOL) {
    const pair = newX25519();
    account.oneTime.push({
      id: account.nextPreKeyId++,
      priv: bytesToHex(pair.priv),
      pub: bytesToHex(pair.pub),
    });
  }
}

export function createAccount(): AccountState {
  const identity = newX25519();
  const signing = newEd25519();
  const spk = newX25519();
  const account: AccountState = {
    identity: { priv: bytesToHex(identity.priv), pub: bytesToHex(identity.pub) },
    signing: { priv: bytesToHex(signing.priv), pub: bytesToHex(signing.pub) },
    signedPreKey: {
      id: 1,
      priv: bytesToHex(spk.priv),
      pub: bytesToHex(spk.pub),
      signature: bytesToHex(bindSpk(signing.priv, spk.pub)),
    },
    oneTime: [],
    nextPreKeyId: 2,
  };
  replenishOpks(account);
  return account;
}

export function ensureUser(userId: string): AccountState {
  const existing = vault.users[userId];
  if (existing) {
    replenishOpks(existing);
    return existing;
  }
  const created = createAccount();
  vault.users[userId] = created;
  return created;
}

export function bootstrapUsers(userIds: string[]): void {
  for (const id of userIds) ensureUser(id);
}

function partToEnvelope(from: string, part: SignalPart, prekey?: SignalPart["prekey"]): SignalEnvelope {
  return {
    v: 1,
    from,
    to: part.to,
    ciphertext: part.ciphertext,
    header: part.header,
    prekey: part.prekey ?? prekey,
  };
}

export function encrypt(from: string, to: string, plaintext: string): SignalEnvelope {
  const alice = ensureUser(from);
  const bob = ensureUser(to);
  const key = sessionKey(from, to);
  let session = vault.sessions[key];
  let prekey: SignalPart["prekey"];

  if (!session) {
    const started = initiateSession(alice, publishBundle(to, bob));
    session = started.session;
    prekey = started.prekey;
    vault.sessions[key] = session;
  }

  const sealed = ratchetEncrypt(session, plaintext);
  return {
    v: 1,
    from,
    to,
    ciphertext: sealed.ciphertext,
    header: sealed.header,
    prekey,
  };
}

export function decrypt(me: string, envelope: SignalEnvelope): string {
  if (envelope.group) {
    const mine = envelope.group.parts.find((part) => part.to === me);
    if (!mine) {
      throw new Error(envelope.from === me ? "local-sender" : "not a recipient");
    }
    return decrypt(me, partToEnvelope(envelope.from, mine));
  }
  if (!envelope.to || !envelope.ciphertext || !envelope.header) {
    throw new Error("incomplete envelope");
  }
  if (envelope.to !== me) throw new Error("envelope is addressed elsewhere");

  const bob = ensureUser(me);
  const key = sessionKey(me, envelope.from);
  let session = vault.sessions[key];
  if (!session) {
    if (!envelope.prekey) throw new Error("missing prekey handshake");
    session = acceptSession(bob, envelope.prekey);
    vault.sessions[key] = session;
  }

  return ratchetDecrypt(session, envelope.header, envelope.ciphertext);
}

export function sealText(from: string, recipients: string[], plaintext: string): SignalEnvelope {
  const targets = recipients.filter((id) => id && id !== from);
  if (targets.length === 0) throw new Error("no recipients");
  if (targets.length === 1) return encrypt(from, targets[0], plaintext);
  return {
    v: 1,
    from,
    group: {
      parts: targets.map((to) => {
        const env = encrypt(from, to, plaintext);
        return {
          to,
          ciphertext: env.ciphertext!,
          header: env.header!,
          prekey: env.prekey,
        };
      }),
    },
  };
}

export function openText(me: string, envelope: SignalEnvelope): string {
  return decrypt(me, envelope);
}

export function envelopeHidesPlaintext(envelope: SignalEnvelope, plaintext: string): boolean {
  const blob = JSON.stringify(envelope).toLowerCase();
  if (blob.includes(plaintext.toLowerCase())) return false;
  const hex = Array.from(new TextEncoder().encode(plaintext), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  return !blob.includes(hex);
}
