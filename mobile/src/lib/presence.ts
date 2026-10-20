import type { ChatStatus, Conversation, Message, PaperPart, PresenceMode, StatusTtl, User } from "./types";

export const STATUS_TTLS: { id: StatusTtl; label: string; ms: number }[] = [
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "6h", label: "6 hours", ms: 6 * 60 * 60 * 1000 },
  { id: "12h", label: "12 hours", ms: 12 * 60 * 60 * 1000 },
  { id: "1d", label: "1 day", ms: 24 * 60 * 60 * 1000 },
];

/** How long a status stays on screen. Longer life → a slightly longer look. */
export function statusViewMs(item: { createdAt: string; expiresAt: string }) {
  const life = new Date(item.expiresAt).getTime() - new Date(item.createdAt).getTime();
  if (life <= 2 * 60 * 60 * 1000) return 5000;
  if (life <= 8 * 60 * 60 * 1000) return 7000;
  if (life <= 14 * 60 * 60 * 1000) return 9000;
  return 12000;
}

export function nijiIdOf(user?: Pick<User, "nijiId"> | null) {
  return user?.nijiId ?? "";
}

export function liveStatuses(statuses: ChatStatus[], now = Date.now()) {
  return statuses.filter((s) => new Date(s.expiresAt).getTime() > now);
}

export function statusLaneKey(s: Pick<ChatStatus, "authorId" | "lane">) {
  return `${s.authorId}:${s.lane ?? "chat"}`;
}

export function canSeeVybeStatus(status: ChatStatus, viewerId: string, following: string[]) {
  if (statusLaneOf(status) === "chat") return false;
  if (status.authorId === viewerId) return true;
  if (!status.audience || status.audience === "public") return true;
  return following.includes(status.authorId);
}

export function canReshareStatus(status: ChatStatus, viewerId: string, following: string[]) {
  if (status.authorId === viewerId) return false;
  if (status.lane !== "vybe") return false;
  if (!status.reshareable) return false;
  return canSeeVybeStatus(status, viewerId, following);
}

/** People who opened this status, not counting the author. */
export function lookedBy(status: ChatStatus) {
  return status.viewedBy.filter((id) => id !== status.authorId);
}

export function lookedCopy(names: string[]) {
  if (names.length === 0) return "No looks yet.";
  if (names.length === 1) return `${names[0]} looked.`;
  if (names.length === 2) return `${names[0]} and ${names[1]} looked.`;
  return `${names[0]} and ${names.length - 1} others looked.`;
}

export function statusLaneOf(s: Pick<ChatStatus, "lane">) {
  return s.lane ?? "chat";
}

export function uniqueStatuses(list: ChatStatus[]) {
  const seen = new Set<string>();
  return list.filter((s) => {
    if (!s.id || seen.has(s.id)) return false;
    seen.add(s.id);
    return true;
  });
}

export function statusesFor(authorId: string, statuses: ChatStatus[], lane?: "chat" | "vybe") {
  return uniqueStatuses(
    liveStatuses(statuses).filter((s) => {
      if (s.authorId !== authorId) return false;
      if (!lane) return true;
      return statusLaneOf(s) === lane;
    }),
  );
}

export function visibleStatusesFor(
  authorId: string,
  statuses: ChatStatus[],
  lane: "chat" | "vybe" | undefined,
  viewerId: string,
  following: string[],
) {
  return statusesFor(authorId, statuses, lane).filter((s) => canSeeVybeStatus(s, viewerId, following));
}

/** Unseen status on this lane. Orange until you open it. */
export function hasFreshPulse(authorId: string, statuses: ChatStatus[], meId: string, lane?: "chat" | "vybe") {
  return statusesFor(authorId, statuses, lane).some((s) => !s.viewedBy.includes(meId));
}

export function hasPulse(authorId: string, statuses: ChatStatus[], lane?: "chat" | "vybe") {
  return statusesFor(authorId, statuses, lane).length > 0;
}

/** A chat with yourself — a pocket for stills, files, and lines. */
export function isMeChat(convo: Pick<Conversation, "participantIds" | "isGroup" | "ghost" | "lane">, meId: string) {
  if (convo.isGroup || convo.ghost || convo.lane === "hub" || convo.lane === "vybe") return false;
  return convo.participantIds.length === 1 && convo.participantIds[0] === meId;
}

export function threadPeerId(convo: Pick<Conversation, "participantIds" | "isGroup" | "ghost" | "lane">, meId: string) {
  if (isMeChat(convo, meId)) return meId;
  return convo.participantIds.find((id) => id !== meId) ?? "";
}

export { nijiPaperUri } from "./niji-link";

/** People with a live chat status, unseen first. The rail — not the chat faces. */
export function chatStatusFaces(meId: string, users: User[], statuses: ChatStatus[]) {
  const live = liveStatuses(statuses).filter(
    (s) => s.authorId !== meId && (!s.lane || s.lane === "chat"),
  );
  const unseen = new Set(live.filter((s) => !s.viewedBy.includes(meId)).map((s) => s.authorId));
  const ids = [...new Set(live.map((s) => s.authorId))];
  ids.sort((a, b) => Number(unseen.has(b)) - Number(unseen.has(a)));
  return ids.map((id) => users.find((u) => u.id === id)).filter((u): u is User => Boolean(u));
}

/** Live chat status from people you have not opened a 1:1 with. */
export function statusWithoutChat(
  meId: string,
  users: User[],
  conversations: Conversation[],
  statuses: ChatStatus[],
) {
  const direct = new Set<string>();
  for (const c of conversations) {
    if (c.isGroup || c.ghost || c.lane === "hub" || c.lane === "vybe") continue;
    if (c.participantIds.length !== 2 || !c.participantIds.includes(meId)) continue;
    const other = c.participantIds.find((id) => id !== meId);
    if (other) direct.add(other);
  }
  const ids = [
    ...new Set(
      liveStatuses(statuses)
        .filter((s) => s.authorId !== meId && (!s.lane || s.lane === "chat"))
        .map((s) => s.authorId),
    ),
  ];
  return ids
    .filter((id) => !direct.has(id))
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => Boolean(u));
}

export function presenceOf(state: { ghostMode: boolean; hideOnline: boolean }): PresenceMode {
  if (state.ghostMode) return "ghost";
  if (state.hideOnline) return "quiet";
  return "around";
}

export function presenceFlags(mode: PresenceMode): { hideOnline: boolean; ghostMode: boolean } {
  if (mode === "around") return { hideOnline: false, ghostMode: false };
  if (mode === "quiet") return { hideOnline: true, ghostMode: false };
  return { hideOnline: true, ghostMode: true };
}

export function normalizeNijiId(raw: string) {
  const t = raw.trim().toLowerCase().replace(/^@/, "");
  if (!/^[a-z][a-z0-9._]{2,23}$/.test(t)) return null;
  return t;
}

export function isAround(
  user: Pick<User, "id" | "online"> | undefined,
  meId: string,
  hideOnline: boolean,
  ghostMode: boolean,
) {
  if (!user?.online) return false;
  if (user.id === meId && (hideOnline || ghostMode)) return false;
  return true;
}

const LINK_RE = /https?:\/\/[^\s]+/gi;

export function linksIn(text: string) {
  return text.match(LINK_RE) ?? [];
}

export function previewOf(message?: Message) {
  if (!message) return "Say something private.";
  if (message.kind === "notice") return "This paper noticed a capture.";
  if (message.kind === "voice") return "Voice";
  if (message.kind === "location") return message.liveUntil ? "Live place" : "Place";
  if (message.kind === "vybe") return "Vybe";
  if (message.kind === "shop") return message.text || "Stall";
  if (message.image) return "Still";
  if (message.file) return message.file.name;
  return message.text;
}

export function threadPreview(convo: Conversation) {
  if (convo.sealed) return "Sealed";
  return previewOf(convo.messages.at(-1));
}

export function paperOf(convo: Conversation) {
  const stills: { id: string; src: string }[] = [];
  const paths: { id: string; href: string }[] = [];
  const leaves: { id: string; name: string; size: string }[] = [];
  for (const m of convo.messages) {
    if (m.image) stills.push({ id: m.id, src: m.image });
    for (const href of linksIn(m.text)) paths.push({ id: `${m.id}:${href}`, href });
    if (m.file) leaves.push({ id: m.id, name: m.file.name, size: m.file.size });
  }
  return { stills, paths, leaves };
}

export function hasChatUnread(conversations: Conversation[]) {
  return conversations.some(
    (c) => c.unread > 0 && !c.quiet && !c.ghost && !c.archived && c.lane !== "vybe",
  );
}

export function clearPaperMessages(messages: Message[], part: PaperPart): Message[] {
  if (part === "all") return [];
  return messages.flatMap((m) => {
    if (part === "stills") {
      const next = { ...m, image: undefined };
      if (!next.text && !next.file && !next.audioUrl && !next.productId) return [];
      return [next];
    }
    if (part === "leaves") {
      const next = { ...m, file: undefined };
      if (!next.text && !next.image && !next.audioUrl && !next.productId) return [];
      return [next];
    }
    const text = m.text.replace(LINK_RE, "").replace(/\s+/g, " ").trim();
    if (!text && !m.image && !m.file && !m.audioUrl && !m.productId) return [];
    return [{ ...m, text }];
  });
}
