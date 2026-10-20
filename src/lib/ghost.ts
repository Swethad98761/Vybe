import type { GhostAlias, GhostTtl } from "./types";

export const GHOST_TTLS: { id: GhostTtl; label: string; ms: number }[] = [
  { id: "1h", label: "1 hour", ms: 3_600_000 },
  { id: "6h", label: "6 hours", ms: 6 * 3_600_000 },
  { id: "1d", label: "1 day", ms: 24 * 3_600_000 },
  { id: "3d", label: "3 days", ms: 3 * 24 * 3_600_000 },
  { id: "7d", label: "1 week", ms: 7 * 24 * 3_600_000 },
];

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function cleanCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatCode(raw: string) {
  const t = cleanCode(raw).slice(0, 8);
  if (t.length <= 4) return t;
  return `${t.slice(0, 4)}-${t.slice(4)}`;
}

export function mintGhostToken() {
  let s = "";
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return formatCode(s);
}

/** Preferred first/last, stripped to letters. */
export function slugMistName(first: string, last = "") {
  const parts = [first, last]
    .map((s) => s.trim().toLowerCase().replace(/[^a-z]/g, "").slice(0, 14))
    .filter(Boolean);
  return parts.join("-") || "mist";
}

export function splitGivenName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}

/** A name they chose, plus a number we add so it isn't someone else's. */
export function mintMistId(first: string, last: string, taken: Iterable<string>) {
  const have = new Set([...taken].map((t) => t.toLowerCase()));
  const base = slugMistName(first, last);
  for (let i = 0; i < 80; i++) {
    const n = 100 + Math.floor(Math.random() * 900);
    const token = `${base}-${n}`;
    if (!have.has(token) && !have.has(cleanVeil(token))) return token;
  }
  return `${base}-${String(Date.now()).slice(-4)}`;
}

export function isLegacyMist(token: string) {
  const named = token.trim().toLowerCase();
  if (/[a-z].*-\d+$/.test(named)) return false;
  const compact = token.replace(/-/g, "");
  return compact.length === 8 && /^[A-Z0-9]+$/i.test(compact);
}

/** What the other person sees — Priya 482, not 7K2Q-M4NR. */
export function mistFace(token: string) {
  if (isLegacyMist(token)) return formatCode(token);
  const parts = cleanVeil(token).split("-").filter(Boolean);
  const num = parts.at(-1);
  if (num && /^\d+$/.test(num)) {
    const names = parts.slice(0, -1).map((p) => p.charAt(0).toUpperCase() + p.slice(1));
    if (names.length) return `${names.join(" ")} ${num}`;
  }
  return token;
}

export function ghostExpiresAt(ttl: GhostTtl) {
  const found = GHOST_TTLS.find((t) => t.id === ttl) ?? GHOST_TTLS[GHOST_TTLS.length - 1];
  return new Date(Date.now() + found.ms).toISOString();
}

export function isAliasLive(alias: GhostAlias, now = Date.now()) {
  return !alias.revoked && new Date(alias.expiresAt).getTime() > now;
}

export type AliasTone = "live" | "waning" | "closed";

const WANING_MS = 6 * 3_600_000;

export function aliasTone(alias: GhostAlias, now = Date.now()): AliasTone {
  if (alias.revoked || new Date(alias.expiresAt).getTime() <= now) return "closed";
  if (new Date(alias.expiresAt).getTime() - now <= WANING_MS) return "waning";
  return "live";
}

export const ALIAS_TONE = {
  live: "#138808",
  waning: "#E39B2D",
  closed: "#C0392B",
} as const;

export function remainingLabel(iso: string, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "faded";
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) return `${minutes}m left`;
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) return `${hours}h left`;
  const days = Math.ceil(hours / 24);
  return `${days}d left`;
}

export function whenLabel(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function defaultSendAt() {
  return new Date(Date.now() + 3_600_000).toISOString();
}

export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string) {
  const t = new Date(value);
  if (Number.isNaN(t.getTime())) return new Date(Date.now() + 3_600_000).toISOString();
  return t.toISOString();
}

export function cleanVeil(raw: string) {
  const named = raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (/[a-z]/.test(named)) return named;
  return cleanCode(raw);
}
