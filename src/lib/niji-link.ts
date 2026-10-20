import type { User } from "./types";

export function cleanNijiId(raw: string) {
  const trimmed = raw.replace(/^@/, "").trim();
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function cleanMistToken(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function cleanShopId(raw: string) {
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/** Custom scheme the installed app opens. Three slashes keep the path as `/id/:id`. */
export function nijiAppProfileUri(nijiId: string) {
  return `niji:///id/${cleanNijiId(nijiId)}`;
}

export function nijiProfilePath(nijiId: string) {
  return `/id/${encodeURIComponent(cleanNijiId(nijiId))}`;
}

export function nijiWebProfileUri(origin: string, nijiId: string) {
  return `${origin.replace(/\/$/, "")}${nijiProfilePath(nijiId)}`;
}

/** QR payload — Camera / a scan opens this Niji. */
export function nijiPaperUri(nijiId: string) {
  return nijiAppProfileUri(nijiId);
}

export function nijiMistUri(token: string) {
  return `niji:///mist/${cleanMistToken(token)}`;
}

export function nijiMistPath(token: string) {
  return `/mist/${encodeURIComponent(cleanMistToken(token))}`;
}

export function nijiWebMistUri(origin: string, token: string) {
  return `${origin.replace(/\/$/, "")}${nijiMistPath(token)}`;
}

export function nijiChatUri(nijiId: string) {
  return `niji:///chat/${cleanNijiId(nijiId)}`;
}

export function nijiChatPath(nijiId: string) {
  return `/chat/with/${encodeURIComponent(cleanNijiId(nijiId))}`;
}

export function nijiWebChatUri(origin: string, nijiId: string) {
  return `${origin.replace(/\/$/, "")}${nijiChatPath(nijiId)}`;
}

export function nijiHubUri(shopId: string) {
  return `niji:///hub/${encodeURIComponent(cleanShopId(shopId))}`;
}

export function nijiHubPath(shopId: string) {
  return `/hub/${encodeURIComponent(cleanShopId(shopId))}`;
}

export function nijiWebHubUri(origin: string, shopId: string) {
  return `${origin.replace(/\/$/, "")}${nijiHubPath(shopId)}`;
}

export function nijiShareText(nijiId: string, webUri?: string) {
  const id = cleanNijiId(nijiId);
  const dest = webUri || nijiAppProfileUri(id);
  return `Open ${id} on Niji\n${dest}`;
}

export function nijiMistShareText(token: string, face: string, webUri?: string) {
  const dest = webUri || nijiMistUri(token);
  return `Open ${face} on Niji Mist\n${dest}`;
}

export function nijiChatShareText(nijiId: string, name: string, webUri?: string) {
  const dest = webUri || nijiChatUri(nijiId);
  return `Chat with ${name} on Niji\n${dest}`;
}

export function nijiHubShareText(shopId: string, name: string, webUri?: string) {
  const dest = webUri || nijiHubUri(shopId);
  return `Open ${name} on Niji Hub\n${dest}`;
}

export type NijiLink =
  | { kind: "profile"; id: string }
  | { kind: "mist"; token: string }
  | { kind: "chat"; id: string }
  | { kind: "hub"; id: string };

export function parseNijiProfileId(input?: string | null): string | null {
  const link = parseNijiLink(input);
  return link?.kind === "profile" ? link.id : null;
}

export function parseNijiLink(input?: string | null): NijiLink | null {
  if (!input) return null;
  const raw = input.trim();
  if (!raw) return null;

  const legacy = raw.match(/^niji:id:(.+)$/i);
  if (legacy) return { kind: "profile", id: cleanNijiId(legacy[1]) };

  const expo = raw.match(/\/--(\/(?:id|mist|m|chat|hub)\/[^?#]+)/i);
  if (expo) {
    const fromExpo = linkFromPath(expo[1]);
    if (fromExpo) return fromExpo;
  }

  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
    const url = hasScheme ? new URL(raw) : new URL(raw, "https://niji.local");
    if (url.protocol === "niji:") {
      const parts = [url.hostname, ...url.pathname.split("/")].filter(Boolean);
      const parsed = linkFromParts(parts);
      if (parsed) return parsed;
    }
    const fromPath = linkFromPath(url.pathname);
    if (fromPath) return fromPath;
    const mist = url.searchParams.get("mist");
    if (mist) return { kind: "mist", token: cleanMistToken(mist) };
    const hub = url.searchParams.get("hub") || url.searchParams.get("shop");
    if (hub) return { kind: "hub", id: cleanShopId(hub) };
    const chat = url.searchParams.get("chat");
    if (chat) return { kind: "chat", id: cleanNijiId(chat) };
    const q = url.searchParams.get("id") || url.searchParams.get("niji");
    if (q) return { kind: "profile", id: cleanNijiId(q) };
  } catch {
    /* not a URL */
  }

  return linkFromPath(raw.startsWith("/") ? raw : `/${raw}`);
}

function linkFromPath(pathname: string): NijiLink | null {
  const parts = pathname.split("/").filter(Boolean);
  return linkFromParts(parts);
}

function linkFromParts(parts: string[]): NijiLink | null {
  if (parts[0] === "id" && parts[1]) return { kind: "profile", id: cleanNijiId(parts[1]) };
  if ((parts[0] === "mist" || parts[0] === "m") && parts[1]) {
    return { kind: "mist", token: cleanMistToken(parts[1]) };
  }
  if (parts[0] === "chat" && parts[1] === "with" && parts[2]) {
    return { kind: "chat", id: cleanNijiId(parts[2]) };
  }
  if (parts[0] === "chat" && parts[1] && parts[1] !== "new" && parts[1] !== "new-group") {
    return { kind: "chat", id: cleanNijiId(parts[1]) };
  }
  if (parts[0] === "hub" && parts[1] && parts[1] !== "sell") {
    return { kind: "hub", id: cleanShopId(parts[1]) };
  }
  return null;
}

export function userByNijiId(users: User[], nijiId: string) {
  const id = cleanNijiId(nijiId).toLowerCase();
  return users.find((user) => cleanNijiId(user.nijiId).toLowerCase() === id) ?? null;
}
