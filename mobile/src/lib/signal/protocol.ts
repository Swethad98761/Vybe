import {
  aeadOpen,
  aeadSeal,
  checkSpk,
  dh,
  kdf,
  kdfChain,
  kdfRoot,
  newX25519,
} from "./crypto";
import {
  bytesToHex,
  bytesToUtf8,
  concatBytes,
  hexToBytes,
  u32be,
  utf8ToBytes,
} from "./bytes";
import type {
  AccountState,
  PublicPreKeyBundle,
  SessionState,
  SignalHeader,
  SignalPrekeyHeader,
} from "./types";

const MAX_SKIP = 40;
const X3DH_INFO = "NijiX3DH";

function sessionKey(local: string, remote: string) {
  return `${local}:${remote}`;
}

function skipKey(dhPub: string, n: number) {
  return `${dhPub}:${n}`;
}

function headerBytes(header: SignalHeader): Uint8Array {
  return concatBytes(hexToBytes(header.dh), u32be(header.n), u32be(header.pn));
}

function x3dhSecret(parts: Uint8Array[]): Uint8Array {
  return kdf(concatBytes(...parts), new Uint8Array(32), X3DH_INFO, 32);
}

export function publishBundle(userId: string, account: AccountState): PublicPreKeyBundle {
  const opk = account.oneTime[0];
  return {
    userId,
    identityKey: account.identity.pub,
    signingKey: account.signing.pub,
    signedPreKey: {
      id: account.signedPreKey.id,
      publicKey: account.signedPreKey.pub,
      signature: account.signedPreKey.signature,
    },
    oneTimePreKey: opk ? { id: opk.id, publicKey: opk.pub } : undefined,
  };
}

function consumeOpk(account: AccountState, id?: number): Uint8Array | undefined {
  if (id == null) return undefined;
  const idx = account.oneTime.findIndex((k) => k.id === id);
  if (idx < 0) return undefined;
  const [used] = account.oneTime.splice(idx, 1);
  return hexToBytes(used.priv);
}

export function initiateSession(
  alice: AccountState,
  bob: PublicPreKeyBundle,
): { session: SessionState; prekey: SignalPrekeyHeader } {
  if (
    !checkSpk(
      hexToBytes(bob.signingKey),
      hexToBytes(bob.signedPreKey.publicKey),
      hexToBytes(bob.signedPreKey.signature),
    )
  ) {
    throw new Error("signed prekey failed verification");
  }

  const ek = newX25519();
  const ika = hexToBytes(alice.identity.priv);
  const spkb = hexToBytes(bob.signedPreKey.publicKey);
  const ikb = hexToBytes(bob.identityKey);

  const dhs = [dh(ika, spkb), dh(ek.priv, ikb), dh(ek.priv, spkb)];
  if (bob.oneTimePreKey) {
    dhs.push(dh(ek.priv, hexToBytes(bob.oneTimePreKey.publicKey)));
  }
  const sk = x3dhSecret(dhs);
  const ratchet = newX25519();
  const { rk, ck } = kdfRoot(sk, dh(ratchet.priv, spkb));

  return {
    session: {
      rk: bytesToHex(rk),
      cks: bytesToHex(ck),
      ckr: null,
      dhSend: { priv: bytesToHex(ratchet.priv), pub: bytesToHex(ratchet.pub) },
      dhRecv: bob.signedPreKey.publicKey,
      ns: 0,
      nr: 0,
      pn: 0,
      skipped: {},
    },
    prekey: {
      identity: alice.identity.pub,
      ephemeral: bytesToHex(ek.pub),
      usedOpkId: bob.oneTimePreKey?.id,
      signedPreKeyId: bob.signedPreKey.id,
    },
  };
}

export function acceptSession(
  bob: AccountState,
  prekey: SignalPrekeyHeader,
): SessionState {
  if (prekey.signedPreKeyId !== bob.signedPreKey.id) {
    throw new Error("unknown signed prekey");
  }
  const ika = hexToBytes(prekey.identity);
  const eka = hexToBytes(prekey.ephemeral);
  const ikb = hexToBytes(bob.identity.priv);
  const spkb = hexToBytes(bob.signedPreKey.priv);

  const dhs = [dh(spkb, ika), dh(ikb, eka), dh(spkb, eka)];
  const opk = consumeOpk(bob, prekey.usedOpkId);
  if (prekey.usedOpkId != null && !opk) {
    throw new Error("one-time prekey already used");
  }
  if (opk) dhs.push(dh(opk, eka));

  return {
    rk: bytesToHex(x3dhSecret(dhs)),
    cks: null,
    ckr: null,
    dhSend: { priv: bob.signedPreKey.priv, pub: bob.signedPreKey.pub },
    dhRecv: null,
    ns: 0,
    nr: 0,
    pn: 0,
    skipped: {},
  };
}

function skipMessageKeys(session: SessionState, until: number) {
  if (!session.ckr || !session.dhRecv) {
    if (until > 0 && !session.ckr) throw new Error("cannot skip on an empty chain");
    return;
  }
  if (until - session.nr > MAX_SKIP) throw new Error("too many skipped messages");
  let ckr = hexToBytes(session.ckr);
  while (session.nr < until) {
    const next = kdfChain(ckr);
    session.skipped[skipKey(session.dhRecv, session.nr)] = bytesToHex(next.mk);
    ckr = next.ck;
    session.nr += 1;
  }
  session.ckr = bytesToHex(ckr);
}

function dhRatchet(session: SessionState, theirDh: string) {
  session.pn = session.ns;
  session.ns = 0;
  session.nr = 0;
  session.dhRecv = theirDh;
  const recv = kdfRoot(hexToBytes(session.rk), dh(hexToBytes(session.dhSend.priv), hexToBytes(theirDh)));
  session.rk = bytesToHex(recv.rk);
  session.ckr = bytesToHex(recv.ck);
  const send = newX25519();
  session.dhSend = { priv: bytesToHex(send.priv), pub: bytesToHex(send.pub) };
  const next = kdfRoot(hexToBytes(session.rk), dh(send.priv, hexToBytes(theirDh)));
  session.rk = bytesToHex(next.rk);
  session.cks = bytesToHex(next.ck);
}

export function ratchetEncrypt(
  session: SessionState,
  plaintext: string,
): { header: SignalHeader; ciphertext: string } {
  if (!session.cks) throw new Error("sending chain is not ready");
  const next = kdfChain(hexToBytes(session.cks));
  session.cks = bytesToHex(next.ck);
  const header: SignalHeader = {
    dh: session.dhSend.pub,
    n: session.ns,
    pn: session.pn,
  };
  session.ns += 1;
  const ciphertext = aeadSeal(next.mk, utf8ToBytes(plaintext), headerBytes(header));
  return { header, ciphertext: bytesToHex(ciphertext) };
}

export function ratchetDecrypt(session: SessionState, header: SignalHeader, ciphertextHex: string): string {
  const skipped = session.skipped[skipKey(header.dh, header.n)];
  if (skipped) {
    delete session.skipped[skipKey(header.dh, header.n)];
    return bytesToUtf8(aeadOpen(hexToBytes(skipped), hexToBytes(ciphertextHex), headerBytes(header)));
  }

  if (header.dh !== session.dhRecv) {
    skipMessageKeys(session, header.pn);
    dhRatchet(session, header.dh);
  }
  skipMessageKeys(session, header.n);
  if (!session.ckr) throw new Error("receiving chain is not ready");
  const next = kdfChain(hexToBytes(session.ckr));
  session.ckr = bytesToHex(next.ck);
  session.nr += 1;
  return bytesToUtf8(aeadOpen(next.mk, hexToBytes(ciphertextHex), headerBytes(header)));
}

export { sessionKey };
