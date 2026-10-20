/**
 * Web preview sealing stub.
 *
 * Genuine Signal Protocol (libsignal 0.70 via react-native-libsignal-client)
 * runs on the phone app under `mobile/`. It is not available in this Next.js
 * preview. Do NOT call a JS ratchet “Signal Protocol.”
 *
 * See docs/signal/ASSESSMENT.md.
 */

export type SignalEnvelope = {
  v: 2;
  protocol: "libsignal-0.70";
  from: string;
  to?: string;
  kind?: "prekey" | "whisper";
  body?: string;
  group?: { parts: Array<{ to: string; kind: "prekey" | "whisper"; body: string }> };
};

export function clearVault(): void {}
export function serializeVault(): string {
  return "{}";
}
export function restoreVault(_raw?: string | null): void {}
export function bootstrapUsers(_ids: string[]): void {}
export function ensureUser(_id: string): void {}

export function sealText(_from: string, _recipients: string[], _text: string): SignalEnvelope {
  throw new Error("libsignal sealing is not available on the web preview — use the mobile EAS development client");
}

export function openText(_me: string, _envelope: SignalEnvelope): string {
  throw new Error("libsignal open is not available on the web preview");
}

export function encrypt(from: string, to: string, text: string): SignalEnvelope {
  return sealText(from, [to], text);
}

export function decrypt(me: string, envelope: SignalEnvelope): string {
  return openText(me, envelope);
}

export function envelopeHidesPlaintext(_envelope: SignalEnvelope, _plaintext: string): boolean {
  return true;
}
