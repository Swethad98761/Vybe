export type KeyPairHex = {
  priv: string;
  pub: string;
};

export type PreKeyHex = KeyPairHex & { id: number };

export type SignedPreKeyHex = PreKeyHex & { signature: string };

export type PublicPreKeyBundle = {
  userId: string;
  identityKey: string;
  signingKey: string;
  signedPreKey: { id: number; publicKey: string; signature: string };
  oneTimePreKey?: { id: number; publicKey: string };
};

export type SignalHeader = {
  dh: string;
  n: number;
  pn: number;
};

export type SignalPrekeyHeader = {
  identity: string;
  ephemeral: string;
  usedOpkId?: number;
  signedPreKeyId: number;
};

export type SignalPart = {
  to: string;
  ciphertext: string;
  header: SignalHeader;
  prekey?: SignalPrekeyHeader;
};

export type SignalEnvelope = {
  v: 1;
  from: string;
  to?: string;
  ciphertext?: string;
  header?: SignalHeader;
  prekey?: SignalPrekeyHeader;
  group?: { parts: SignalPart[] };
};

export type SessionState = {
  rk: string;
  cks: string | null;
  ckr: string | null;
  dhSend: KeyPairHex;
  dhRecv: string | null;
  ns: number;
  nr: number;
  pn: number;
  skipped: Record<string, string>;
};

export type AccountState = {
  identity: KeyPairHex;
  signing: KeyPairHex;
  signedPreKey: SignedPreKeyHex;
  oneTime: PreKeyHex[];
  nextPreKeyId: number;
};

export type SignalVault = {
  v: 1;
  users: Record<string, AccountState>;
  sessions: Record<string, SessionState>;
};
