"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { AUTO_REPLIES, createSeed } from "./seed";
import { cleanVeil, ghostExpiresAt, isAliasLive, isLegacyMist, mintMistId, mistFace } from "./ghost";
import { parseNijiLink } from "./niji-link";
import { uid } from "./format";
import {
  profileFromUser,
  signOutNiji,
  type SessionProfile,
} from "./auth";
import { supabase } from "./supabase";
import {
  bootstrapUsers,
  clearVault,
  openText,
  sealText,
} from "./signal";
import { STATUS_TTLS, clearPaperMessages, isMeChat, liveStatuses, normalizeNijiId, presenceFlags, statusLaneKey, uniqueStatuses } from "./presence";
import type {
  AppState,
  CallState,
  ClaimNijiResult,
  Conversation,
  Disappear,
  GhostAlias,
  GhostTtl,
  Message,
  PaperPart,
  PresenceMode,
  Product,
  ScheduledMessage,
  Shop,
  ShopReview,
  StatusAudience,
  StatusTtl,
  User,
} from "./types";
import type { SignalEnvelope } from "./signal";

const STORAGE_KEY = "niji-state-v7";
/** Legacy JS-ratchet key — cleared; web preview does not run libsignal. */
const LEGACY_SIGNAL_KEY = "niji-signal-v1";
const PREVIEW_KEY = "niji-preview";
const WATCH_INTRO_KEY = "niji-watch-intro";

function loadSignal(userIds: string[]) {
  try {
    localStorage.removeItem(LEGACY_SIGNAL_KEY);
  } catch {
    /* private mode */
  }
  bootstrapUsers(userIds);
}

function sealOrPlain(from: string, recipients: string[], text: string): { text: string; envelope?: SignalEnvelope; sealed: boolean } {
  try {
    const envelope = sealText(from, recipients, text);
    return { text, envelope, sealed: true };
  } catch {
    // Web preview has no native libsignal — plaintext locally, not a fake Signal seal.
    return { text, sealed: false };
  }
}

function openOrFallback(me: string, envelope: SignalEnvelope | undefined, fallback: string): { text: string; sealed: boolean } {
  if (!envelope) return { text: fallback, sealed: false };
  try {
    return { text: openText(me, envelope), sealed: true };
  } catch {
    return { text: "Couldn't open this message", sealed: false };
  }
}

function normalizeState(raw: AppState): AppState {
  const seed = createSeed();
  const meId = raw.meId ?? seed.meId;
  const users = (raw.users ?? seed.users).map((u) => {
    const next = { ...u, handle: u.nijiId };
    if (u.id === meId && !u.papersLooked) next.verified = false;
    return next;
  });
  if (!users.some((u) => u.id === "mist")) {
    const mist = seed.users.find((u) => u.id === "mist");
    if (mist) users.push(mist);
  }
  const conversations: Conversation[] = (raw.conversations ?? seed.conversations).map((c) => ({
    ...c,
    keepStills: c.keepStills ?? true,
    quiet: c.quiet ?? false,
    ghost: c.ghost ?? false,
  }));
  const haveGhost = new Set(conversations.filter((c) => c.ghost).map((c) => c.id));
  for (const c of seed.conversations.filter((x) => x.ghost && !haveGhost.has(x.id))) {
    conversations.push({
      ...c,
      keepStills: c.keepStills ?? true,
      quiet: c.quiet ?? false,
      ghost: true,
    });
  }
  if (!conversations.some((c) => c.lane === "hub")) {
    for (const c of seed.conversations.filter((x) => x.lane === "hub")) {
      conversations.push({
        ...c,
        keepStills: c.keepStills ?? true,
        quiet: c.quiet ?? false,
      });
    }
  }
  if (!conversations.some((c) => isMeChat(c, meId))) {
    const pocket = seed.conversations.find((c) => isMeChat(c, meId));
    if (pocket) conversations.unshift({ ...pocket, keepStills: pocket.keepStills ?? true, quiet: pocket.quiet ?? false });
  }
  const posts = [...(raw.posts ?? seed.posts)];
  if (!posts.some((p) => p.authorId === meId)) {
    for (const p of seed.posts.filter((x) => x.authorId === meId)) {
      if (!posts.some((x) => x.id === p.id)) posts.unshift(p);
    }
  }
  const products = [...(raw.products ?? seed.products)].map((p) => {
    const seedP = seed.products.find((x) => x.id === p.id);
    if (!seedP) return p;
    return {
      ...p,
      section: p.section ?? seedP.section,
      special: p.special ?? seedP.special,
      image: p.image || seedP.image,
    };
  });
  for (const p of seed.products) {
    if (!products.some((x) => x.id === p.id)) products.push(p);
  }
  const shops = (raw.shops ?? seed.shops).map((s) => {
    const seedShop = seed.shops.find((x) => x.id === s.id);
    return {
      ...s,
      hours: s.hours ?? seedShop?.hours,
      papers: s.papers ?? seedShop?.papers,
      paperProofs: s.paperProofs ?? seedShop?.paperProofs,
      visits: s.visits ?? seedShop?.visits ?? 0,
      blockCount: s.blockCount ?? seedShop?.blockCount ?? 0,
      reviewCount: s.reviewCount ?? seedShop?.reviewCount,
    };
  });
  return {
    ...seed,
    ...raw,
    call: null,
    hideOnline: raw.hideOnline ?? false,
    hubEnabled: raw.hubEnabled ?? true,
    nijiClaimed: raw.nijiClaimed ?? false,
    appLock: Boolean(raw.appLock),
    locked: Boolean(raw.appLock),
    statuses: mergeLiveStatuses(raw.statuses, seed.statuses),
    following: [...new Set([...(raw.following ?? []), ...seed.following])],
    users,
    conversations,
    posts,
    shops,
    products,
    ghostAliases: mergeGhostAliases(raw.ghostAliases, seed.ghostAliases),
    scheduled: raw.scheduled ?? seed.scheduled,
    shopReviews: raw.shopReviews ?? seed.shopReviews,
    blockedShopIds: raw.blockedShopIds ?? [],
    reportedPostIds: raw.reportedPostIds ?? [],
  };
}

function flag(store: Storage, key: string) {
  try {
    return store.getItem(key) === "1";
  } catch {
    return false;
  }
}

/** Explicit preview / pitch entry only — never auto-auth in plain development. */
function shouldAutoPreview() {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("in") === "1") return true;
    if (flag(localStorage, PREVIEW_KEY)) return true;
    return false;
  } catch {
    return false;
  }
}

type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "WELCOME_DONE" }
  | { type: "LOGIN" }
  | { type: "LOCK"; on: boolean }
  | { type: "APP_LOCK"; on: boolean }
  | { type: "GHOST"; on: boolean }
  | { type: "HIDE_ONLINE"; on: boolean }
  | { type: "VYBE_ON"; on: boolean }
  | { type: "HUB_ON"; on: boolean }
  | { type: "SET_PRESENCE"; mode: PresenceMode }
  | { type: "PATCH_ME"; patch: Partial<Pick<User, "name" | "bio" | "city" | "nijiId" | "handle" | "phone" | "verified" | "papersLooked" | "showNijiId" | "postAs">> }
  | { type: "CLAIM_NIJI_ID"; nijiId: string }
  | { type: "RESET" }
  | { type: "SEND_MESSAGE"; conversationId: string; text: string; productId?: string; postId?: string; shopId?: string; messageId: string; envelope?: SignalEnvelope; sealed?: boolean; kind?: Message["kind"]; audioUrl?: string; durationSec?: number; image?: string; file?: Message["file"]; lat?: number; lng?: number; liveUntil?: string }
  | { type: "SET_THREAD"; conversationId: string; quiet?: boolean; keepStills?: boolean; pinned?: boolean; archived?: boolean; sealed?: boolean; sealPin?: string }
  | { type: "SET_SEAL_PIN"; pin: string }
  | { type: "DROP_CONVERSATION"; conversationId: string }
  | { type: "CLEAR_PAPER"; conversationId: string; part?: PaperPart }
  | { type: "ADD_STATUS"; status: AppState["statuses"][number] }
  | { type: "VIEW_STATUS"; statusId: string; viewerId: string }
  | { type: "SEAL_MESSAGE"; conversationId: string; messageId: string }
  | { type: "RECEIVE_MESSAGE"; conversationId: string; message: Message }
  | { type: "MARK_READ"; conversationId: string }
  | { type: "ENSURE_CONVERSATION"; userId: string; conversationId: string; ghost?: boolean; ghostAliasId?: string; lane?: "trusted" | "vybe" | "hub"; shopId?: string; name?: string }
  | { type: "DROP_POST"; postId: string }
  | { type: "SET_POST"; postId: string; archived?: boolean }
  | { type: "ADD_USER"; user: User }
  | { type: "MINT_GHOST"; alias: GhostAlias }
  | { type: "REVOKE_GHOST"; id: string }
  | { type: "UPSERT_SCHEDULED"; item: ScheduledMessage }
  | { type: "CANCEL_SCHEDULED"; id: string }
  | { type: "RESOLVE_SCHEDULED"; id: string; conversationId: string }
  | { type: "CREATE_GROUP"; conversationId: string; memberIds: string[]; name: string; emoji: string }
  | { type: "SET_DISAPPEAR"; conversationId: string; disappear: Disappear }
  | { type: "NOTICE_CAPTURE"; conversationId: string; kind: "screenshot" | "record"; messageId: string }
  | { type: "START_CALL"; peerId: string; conversationId?: string; mode: "voice" | "video" }
  | { type: "RECEIVE_CALL"; peerId: string; conversationId?: string; mode: "voice" | "video" }
  | { type: "ACCEPT_CALL" }
  | { type: "DECLINE_CALL" }
  | { type: "PATCH_CALL"; patch: Partial<CallState> }
  | { type: "END_CALL"; durationSec: number }
  | { type: "LEAVE_GROUP"; conversationId: string }
  | { type: "TOGGLE_LIKE"; postId: string }
  | { type: "ADD_COMMENT"; postId: string; text: string; replyTo?: string }
  | { type: "ADD_POST"; id?: string; text: string; image?: string; mood?: AppState["posts"][number]["mood"]; travel?: AppState["posts"][number]["travel"]; audience: AppState["posts"][number]["audience"]; expiry: AppState["posts"][number]["expiry"]; language?: string }
  | { type: "SAVE_STALL"; shop: Shop; products: Product[]; inbox?: boolean }
  | { type: "DROP_STALL"; shopId: string }
  | { type: "HIDE_CALL"; id: string }
  | { type: "UNHIDE_CALL"; id: string }
  | { type: "DROP_CALL"; id: string }
  | { type: "REPORT_POST"; postId: string }
  | { type: "FOLLOW"; userId: string }
  | { type: "FOLLOW_SHOP"; shopId: string }
  | { type: "VISIT_SHOP"; shopId: string }
  | { type: "REVIEW_SHOP"; shopId: string; stars: number; body: string }
  | { type: "BLOCK_SHOP"; shopId: string }
  | { type: "ADD_CART"; shopId: string; productId: string }
  | { type: "SET_QTY"; shopId: string; productId: string; qty: number }
  | { type: "SEND_ORDER"; shopId: string }
  | { type: "READ_NOTES" };

function peerOf(convo: Conversation, meId: string) {
  return convo.participantIds.find((id) => id !== meId) ?? convo.participantIds[0];
}

function mergeGhostAliases(raw: AppState["ghostAliases"] | undefined, seed: AppState["ghostAliases"]) {
  const byId = new Map((raw ?? []).map((a) => [a.id, a] as const));
  for (const s of seed) {
    const have = byId.get(s.id);
    if (!have) byId.set(s.id, s);
    else if (isLegacyMist(have.token) && !isLegacyMist(s.token)) byId.set(s.id, { ...have, token: s.token });
  }
  return [...byId.values()];
}

function mergeLiveStatuses(raw: AppState["statuses"] | undefined, seed: AppState["statuses"]) {
  const incoming = raw?.length ? raw : seed;
  const live = incoming
    .filter((s) => liveStatuses([s]).length)
    .map((s) => {
      const seeded = seed.find((x) => x.id === s.id);
      return { ...s, lane: s.lane ?? seeded?.lane ?? "chat" };
    });
  const ids = new Set(live.map((s) => s.id));
  const lanes = new Set(live.map((s) => statusLaneKey(s)));
  const extras = seed.filter((s) => !ids.has(s.id) && !lanes.has(statusLaneKey(s)));
  const next = uniqueStatuses([...live, ...extras]);
  return next.length ? next : seed;
}

function hubOf(state: AppState, shopId: string) {
  return state.conversations.find((c) => c.lane === "hub" && c.shopId === shopId);
}

function convoIdForCall(state: AppState, conversationId?: string, peerId?: string) {
  if (conversationId && state.conversations.some((c) => c.id === conversationId)) {
    return conversationId;
  }
  if (!peerId) return undefined;
  return state.conversations.find((c) => !c.isGroup && c.participantIds.includes(peerId))?.id;
}

function reducer(state: AppState, action: Action): AppState {
  const me = state.meId;
  switch (action.type) {
    case "HYDRATE":
      return action.payload.version === 2 ? normalizeState(action.payload) : state;
    case "WELCOME_DONE":
      return { ...state, seenWelcome: true };
    case "LOGIN":
      return { ...state, seenWelcome: true, locked: Boolean(state.appLock) };
    case "LOCK":
      return { ...state, locked: action.on };
    case "APP_LOCK":
      return { ...state, appLock: action.on, locked: action.on };
    case "GHOST":
      return { ...state, ghostMode: action.on };
    case "HIDE_ONLINE":
      return { ...state, hideOnline: action.on };
    case "VYBE_ON":
      return { ...state, vybeEnabled: action.on };
    case "HUB_ON":
      return { ...state, hubEnabled: action.on };
    case "SET_PRESENCE":
      return { ...state, ...presenceFlags(action.mode) };
    case "PATCH_ME":
      return {
        ...state,
        users: state.users.map((u) => (u.id === me ? { ...u, ...action.patch } : u)),
      };
    case "CLAIM_NIJI_ID": {
      const taken = state.users.some(
        (u) =>
          u.id !== me &&
          (u.nijiId.toLowerCase() === action.nijiId || u.handle.toLowerCase() === action.nijiId),
      );
      if (taken) return state;
      return {
        ...state,
        nijiClaimed: true,
        users: state.users.map((u) =>
          u.id === me ? { ...u, nijiId: action.nijiId, handle: action.nijiId } : u,
        ),
      };
    }
    case "RESET":
      return createSeed();
    case "ENSURE_CONVERSATION": {
      if (state.conversations.some((c) => c.id === action.conversationId)) return state;
      return {
        ...state,
        conversations: [
          {
            id: action.conversationId,
            participantIds: [me, action.userId],
            unread: 0,
            disappear: "off",
            ghost: action.ghost,
            ghostAliasId: action.ghostAliasId,
            lane: action.lane,
            shopId: action.shopId,
            name: action.name,
            messages: [],
          },
          ...state.conversations,
        ],
      };
    }
    case "ADD_USER": {
      if (state.users.some((u) => u.id === action.user.id)) return state;
      return { ...state, users: [...state.users, action.user] };
    }
    case "MINT_GHOST":
      return { ...state, ghostAliases: [action.alias, ...state.ghostAliases] };
    case "REVOKE_GHOST":
      return {
        ...state,
        ghostAliases: state.ghostAliases.map((a) =>
          a.id === action.id ? { ...a, revoked: true } : a,
        ),
      };
    case "UPSERT_SCHEDULED": {
      const exists = state.scheduled.some((s) => s.id === action.item.id);
      return {
        ...state,
        scheduled: exists
          ? state.scheduled.map((s) => (s.id === action.item.id ? action.item : s))
          : [action.item, ...state.scheduled],
      };
    }
    case "CANCEL_SCHEDULED":
      return { ...state, scheduled: state.scheduled.filter((s) => s.id !== action.id) };
    case "RESOLVE_SCHEDULED": {
      const now = new Date().toISOString();
      return {
        ...state,
        scheduled: state.scheduled.map((s) => {
          if (s.id !== action.id) return s;
          return {
            ...s,
            status: s.keepMemory ? ("kept" as const) : ("sent" as const),
            sentAt: now,
            conversationId: action.conversationId,
          };
        }),
      };
    }
    case "CREATE_GROUP": {
      if (state.conversations.some((c) => c.id === action.conversationId)) return state;
      return {
        ...state,
        conversations: [
          {
            id: action.conversationId,
            participantIds: [me, ...action.memberIds.filter((id) => id !== me)],
            name: action.name,
            emoji: action.emoji,
            isGroup: true,
            unread: 0,
            disappear: "off",
            messages: [],
          },
          ...state.conversations,
        ],
      };
    }
    case "SEND_MESSAGE": {
      const message: Message = {
        id: action.messageId,
        senderId: me,
        kind: action.kind ?? (action.productId ? "product" : "text"),
        text: action.text,
        createdAt: new Date().toISOString(),
        sealed: action.sealed ?? Boolean(action.envelope),
        envelope: action.envelope,
        read: true,
        productId: action.productId,
        postId: action.postId,
        shopId: action.shopId,
        audioUrl: action.audioUrl,
        durationSec: action.durationSec,
        image: action.image,
        file: action.file,
        lat: action.lat,
        lng: action.lng,
        liveUntil: action.liveUntil,
      };
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, message], unread: 0 }
            : c,
        ),
      };
    }
    case "SEAL_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, sealed: true } : m,
                ),
              }
            : c,
        ),
      };
    case "RECEIVE_MESSAGE":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: [...c.messages, action.message], unread: c.unread + 1 }
            : c,
        ),
      };
    case "MARK_READ": {
      const target = state.conversations.find((c) => c.id === action.conversationId);
      if (!target) return state;
      const peerId = target.isGroup ? null : peerOf(target, me);
      const conversations =
        target.unread === 0
          ? state.conversations
          : state.conversations.map((c) =>
              c.id === action.conversationId ? { ...c, unread: 0 } : c,
            );
      const unseen = Boolean(
        peerId && state.statuses.some((s) => s.authorId === peerId && !s.viewedBy.includes(me)),
      );
      const statuses =
        unseen && peerId
          ? state.statuses.map((s) =>
              s.authorId === peerId && !s.viewedBy.includes(me)
                ? { ...s, viewedBy: [...s.viewedBy, me] }
                : s,
            )
          : state.statuses;
      if (conversations === state.conversations && !unseen) return state;
      return { ...state, conversations, statuses };
    }
    case "SET_DISAPPEAR":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, disappear: action.disappear } : c,
        ),
      };
    case "NOTICE_CAPTURE": {
      const convo = state.conversations.find((c) => c.id === action.conversationId);
      if (!convo) return state;
      const last = convo.messages.at(-1);
      if (
        last?.kind === "notice" &&
        Date.now() - new Date(last.createdAt).getTime() < 8000
      ) {
        return state;
      }
      const message: Message = {
        id: action.messageId,
        senderId: me,
        kind: "notice",
        notice: action.kind,
        text: action.kind === "record" ? "Tried to record this paper." : "Tried to capture this paper.",
        createdAt: new Date().toISOString(),
        sealed: true,
        read: true,
      };
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, messages: [...c.messages, message] } : c,
        ),
      };
    }
    case "START_CALL":
      return {
        ...state,
        call: {
          peerId: action.peerId,
          conversationId: action.conversationId,
          mode: action.mode,
          direction: "outgoing",
          status: "connecting",
          muted: false,
          cameraOff: action.mode === "voice",
          speaker: true,
          facingFront: true,
        },
      };
    case "RECEIVE_CALL":
      if (state.call) return state;
      return {
        ...state,
        call: {
          peerId: action.peerId,
          conversationId: action.conversationId,
          mode: action.mode,
          direction: "incoming",
          status: "incoming",
          muted: false,
          cameraOff: action.mode === "voice",
          speaker: true,
          facingFront: true,
        },
      };
    case "ACCEPT_CALL":
      if (!state.call || state.call.status !== "incoming") return state;
      return { ...state, call: { ...state.call, status: "connecting" } };
    case "DECLINE_CALL": {
      if (!state.call) return state;
      const call = state.call;
      const log: Message = {
        id: uid("call"),
        senderId: call.peerId,
        kind: "call",
        text: call.mode === "video" ? "Missed video call" : "Missed voice call",
        createdAt: new Date().toISOString(),
        sealed: true,
        read: true,
        call: { mode: call.mode },
      };
      return {
        ...state,
        call: null,
        calls: [
          {
            id: uid("hist"),
            peerId: call.peerId,
            kind: call.mode,
            direction: "missed",
            createdAt: new Date().toISOString(),
          },
          ...state.calls,
        ],
        conversations: (() => {
          const id = convoIdForCall(state, call.conversationId, call.peerId);
          return id
            ? state.conversations.map((c) =>
                c.id === id ? { ...c, messages: [...c.messages, log] } : c,
              )
            : state.conversations;
        })(),
      };
    }
    case "LEAVE_GROUP":
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.conversationId),
      };
    case "PATCH_CALL":
      if (!state.call) return state;
      return { ...state, call: { ...state.call, ...action.patch } };
    case "END_CALL": {
      if (!state.call) return state;
      const call = state.call;
      const missed = call.direction === "incoming" && !call.startedAt;
      const log: Message = {
        id: uid("call"),
        senderId: me,
        kind: "call",
        text: missed
          ? call.mode === "video"
            ? "Missed video call"
            : "Missed voice call"
          : call.mode === "video"
            ? "Video call ended"
            : "Voice call ended",
        createdAt: new Date().toISOString(),
        sealed: true,
        read: true,
        call: { mode: call.mode, durationSec: action.durationSec },
      };
      return {
        ...state,
        call: null,
        calls: [
          {
            id: uid("hist"),
            peerId: call.peerId,
            kind: call.mode,
            direction: missed ? "missed" : call.direction,
            durationSec: missed ? undefined : action.durationSec,
            createdAt: new Date().toISOString(),
          },
          ...state.calls,
        ],
        conversations: (() => {
          const id = convoIdForCall(state, call.conversationId, call.peerId);
          return id
            ? state.conversations.map((c) =>
                c.id === id ? { ...c, messages: [...c.messages, log] } : c,
              )
            : state.conversations;
        })(),
      };
    }
    case "TOGGLE_LIKE":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                likedBy: p.likedBy.includes(me)
                  ? p.likedBy.filter((id) => id !== me)
                  : [...p.likedBy, me],
              }
            : p,
        ),
      };
    case "ADD_COMMENT":
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: uid("cmt"),
                    authorId: me,
                    text: action.text,
                    createdAt: new Date().toISOString(),
                    replyTo: action.replyTo,
                  },
                ],
              }
            : p,
        ),
      };
    case "ADD_POST":
      return {
        ...state,
        posts: [
          {
            id: action.id ?? uid("post"),
            authorId: me,
            text: action.text,
            image: action.image,
            mood: action.mood,
            travel: action.travel,
            language: action.language,
            audience: action.audience,
            expiry: action.expiry,
            createdAt: new Date().toISOString(),
            likedBy: [],
            comments: [],
          },
          ...state.posts,
        ],
      };
    case "SAVE_STALL": {
      const existed = state.shops.some((s) => s.id === action.shop.id);
      const shops = existed
        ? state.shops.map((s) => (s.id === action.shop.id ? action.shop : s))
        : [action.shop, ...state.shops];
      const products = [
        ...state.products.filter((p) => p.shopId !== action.shop.id),
        ...action.products,
      ];
      let conversations = state.conversations;
      if (!existed && !hubOf(state, action.shop.id)) {
        conversations = [
          {
            id: `c-shop-${action.shop.id}`,
            participantIds: [me, "priya"],
            name: action.shop.name,
            shopId: action.shop.id,
            lane: "hub",
            unread: 1,
            disappear: "off" as const,
            messages: [
              {
                id: uid("enq"),
                senderId: "priya",
                kind: "text",
                text: "About your stall — do you take a Monday box?",
                createdAt: new Date().toISOString(),
                sealed: true,
                read: false,
              },
            ],
          },
          ...conversations,
        ];
      } else if (existed) {
        conversations = conversations.map((c) =>
          c.shopId === action.shop.id ? { ...c, name: action.shop.name } : c,
        );
      }
      return { ...state, shops, products, conversations };
    }
    case "DROP_STALL": {
      const { shopId } = action;
      const { [shopId]: _drop, ...cartByShop } = state.cartByShop;
      return {
        ...state,
        shops: state.shops.filter((s) => s.id !== shopId),
        products: state.products.filter((p) => p.shopId !== shopId),
        followingShops: state.followingShops.filter((id) => id !== shopId),
        blockedShopIds: (state.blockedShopIds ?? []).filter((id) => id !== shopId),
        shopReviews: (state.shopReviews ?? []).filter((r) => r.shopId !== shopId),
        conversations: state.conversations.filter((c) => c.shopId !== shopId),
        cartByShop,
        orders: state.orders.filter((o) => o.shopId !== shopId),
      };
    }
    case "HIDE_CALL":
      return {
        ...state,
        calls: state.calls.map((c) => (c.id === action.id ? { ...c, hidden: true } : c)),
      };
    case "UNHIDE_CALL":
      return {
        ...state,
        calls: state.calls.map((c) => (c.id === action.id ? { ...c, hidden: false } : c)),
      };
    case "DROP_CALL":
      return { ...state, calls: state.calls.filter((c) => c.id !== action.id) };
    case "REPORT_POST":
      if ((state.reportedPostIds ?? []).includes(action.postId)) return state;
      return {
        ...state,
        reportedPostIds: [...(state.reportedPostIds ?? []), action.postId],
        notifications: [
          {
            id: uid("note"),
            text: "We have this report. They do not see that you sent it.",
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    case "DROP_POST":
      return { ...state, posts: state.posts.filter((p) => p.id !== action.postId) };
    case "SET_POST":
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.postId ? { ...p, archived: action.archived ?? p.archived } : p)),
      };
    case "FOLLOW":
      return {
        ...state,
        following: state.following.includes(action.userId)
          ? state.following.filter((id) => id !== action.userId)
          : [...state.following, action.userId],
      };
    case "FOLLOW_SHOP": {
      const on = state.followingShops.includes(action.shopId);
      return {
        ...state,
        followingShops: on
          ? state.followingShops.filter((id) => id !== action.shopId)
          : [...state.followingShops, action.shopId],
        shops: state.shops.map((s) =>
          s.id === action.shopId
            ? { ...s, followerCount: Math.max(0, (s.followerCount || 0) + (on ? -1 : 1)) }
            : s,
        ),
      };
    }
    case "VISIT_SHOP":
      return {
        ...state,
        shops: state.shops.map((s) =>
          s.id === action.shopId ? { ...s, visits: (s.visits ?? 0) + 1 } : s,
        ),
      };
    case "REVIEW_SHOP": {
      const stars = Math.min(5, Math.max(1, Math.round(action.stars)));
      const existing = (state.shopReviews ?? []).find(
        (r) => r.shopId === action.shopId && r.authorId === me,
      );
      const next: ShopReview = existing
        ? { ...existing, stars, body: action.body.trim(), at: Date.now() }
        : {
            id: uid("rev"),
            shopId: action.shopId,
            authorId: me,
            stars,
            body: action.body.trim(),
            at: Date.now(),
          };
      const shopReviews = existing
        ? (state.shopReviews ?? []).map((r) => (r.id === existing.id ? next : r))
        : [next, ...(state.shopReviews ?? [])];
      const forShop = shopReviews.filter((r) => r.shopId === action.shopId);
      const rating = Math.round((forShop.reduce((n, r) => n + r.stars, 0) / forShop.length) * 10) / 10;
      return {
        ...state,
        shopReviews,
        shops: state.shops.map((s) =>
          s.id === action.shopId ? { ...s, rating, reviewCount: forShop.length } : s,
        ),
      };
    }
    case "BLOCK_SHOP": {
      const on = (state.blockedShopIds ?? []).includes(action.shopId);
      return {
        ...state,
        blockedShopIds: on
          ? (state.blockedShopIds ?? []).filter((id) => id !== action.shopId)
          : [...(state.blockedShopIds ?? []), action.shopId],
        shops: state.shops.map((s) =>
          s.id === action.shopId
            ? { ...s, blockCount: Math.max(0, (s.blockCount ?? 0) + (on ? -1 : 1)) }
            : s,
        ),
      };
    }
    case "ADD_CART": {
      const cart = state.cartByShop[action.shopId] ?? [];
      const existing = cart.find((i) => i.productId === action.productId);
      const next = existing
        ? cart.map((i) => (i.productId === action.productId ? { ...i, qty: i.qty + 1 } : i))
        : [...cart, { productId: action.productId, qty: 1 }];
      return { ...state, cartByShop: { ...state.cartByShop, [action.shopId]: next } };
    }
    case "SET_QTY": {
      const cart = (state.cartByShop[action.shopId] ?? [])
        .map((i) => (i.productId === action.productId ? { ...i, qty: action.qty } : i))
        .filter((i) => i.qty > 0);
      return { ...state, cartByShop: { ...state.cartByShop, [action.shopId]: cart } };
    }
    case "SEND_ORDER": {
      const cart = state.cartByShop[action.shopId] ?? [];
      if (!cart.length) return state;
      const total = cart.reduce((sum, item) => {
        const p = state.products.find((x) => x.id === item.productId);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
      const shop = state.shops.find((s) => s.id === action.shopId);
      const ownerId = shop?.ownerId;
      let conversationId = shop ? hubOf(state, shop.id)?.id : undefined;
      const newId = conversationId ?? `c-shop-${action.shopId}`;
      const orderMsg: Message = {
        id: uid("ordmsg"),
        senderId: me,
        kind: "order",
        text: `Order · ${cart.length} item${cart.length > 1 ? "s" : ""} · ₹${total.toLocaleString("en-IN")}`,
        createdAt: new Date().toISOString(),
        sealed: true,
        read: true,
      };
      let conversations = state.conversations;
      if (!conversationId && ownerId) {
        conversations = [
          {
            id: newId,
            participantIds: [me, ownerId],
            name: shop?.name,
            shopId: action.shopId,
            lane: "hub",
            unread: 0,
            disappear: "off",
            messages: [orderMsg],
          },
          ...conversations,
        ];
        conversationId = newId;
      } else {
        conversations = conversations.map((c) =>
          c.id === conversationId ? { ...c, messages: [...c.messages, orderMsg], lane: "hub", shopId: action.shopId, name: c.name ?? shop?.name } : c,
        );
      }
      return {
        ...state,
        conversations,
        cartByShop: { ...state.cartByShop, [action.shopId]: [] },
        orders: [
          {
            id: uid("ord"),
            shopId: action.shopId,
            items: cart,
            total,
            createdAt: new Date().toISOString(),
            status: "sent",
          },
          ...state.orders,
        ],
      };
    }
    case "READ_NOTES":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };
    case "SET_THREAD": {
      let conversations = state.conversations.map((c) =>
        c.id === action.conversationId
          ? {
              ...c,
              quiet: action.quiet ?? c.quiet,
              keepStills: action.keepStills ?? c.keepStills,
              pinned: action.archived === true ? false : (action.pinned ?? c.pinned),
              archived: action.archived ?? c.archived,
              sealed: action.sealed ?? c.sealed,
              sealPin: action.sealPin !== undefined ? action.sealPin : c.sealPin,
            }
          : c,
      );
      if (action.pinned === true) {
        const pinned = conversations
          .filter((c) => c.pinned && !c.ghost && c.lane !== "vybe")
          .sort((a, b) =>
            (a.messages.at(-1)?.createdAt ?? "").localeCompare(b.messages.at(-1)?.createdAt ?? ""),
          );
        const pocket = pinned.filter((c) => isMeChat(c, state.meId));
        const others = pinned.filter((c) => !isMeChat(c, state.meId));
        const room = Math.max(0, 3 - pocket.length);
        if (others.length > room) {
          const drop = new Set(others.slice(0, others.length - room).map((c) => c.id));
          conversations = conversations.map((c) => (drop.has(c.id) ? { ...c, pinned: false } : c));
        }
      }
      return { ...state, conversations };
    }
    case "SET_SEAL_PIN":
      return { ...state, sealPin: action.pin };
    case "DROP_CONVERSATION": {
      const target = state.conversations.find((c) => c.id === action.conversationId);
      if (target && isMeChat(target, state.meId)) {
        return {
          ...state,
          conversations: state.conversations.map((c) =>
            c.id === action.conversationId ? { ...c, messages: [], unread: 0, archived: false } : c,
          ),
        };
      }
      return {
        ...state,
        conversations: state.conversations.filter((c) => c.id !== action.conversationId),
      };
    }
    case "CLEAR_PAPER":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? { ...c, messages: clearPaperMessages(c.messages, action.part ?? "all"), unread: 0 }
            : c,
        ),
      };
    case "ADD_STATUS":
      return {
        ...state,
        statuses: [action.status, ...state.statuses],
      };
    case "VIEW_STATUS": {
      const current = state.statuses.find((s) => s.id === action.statusId);
      if (!current || current.viewedBy.includes(action.viewerId)) return state;
      return {
        ...state,
        statuses: state.statuses.map((s) =>
          s.id === action.statusId ? { ...s, viewedBy: [...s.viewedBy, action.viewerId] } : s,
        ),
      };
    }
    default:
      return state;
  }
}

function overlayMe(base: User, session: SessionProfile | null, claimed?: boolean): User {
  const nijiId = claimed ? base.nijiId : session?.nijiId || base.nijiId;
  if (!session?.username && !session?.phone) return { ...base, handle: nijiId, nijiId };
  return {
    ...base,
    handle: nijiId,
    name: base.name || session.username || "",
    nijiId,
    phone: session.phone || base.phone,
  };
}

type Store = {
  state: AppState;
  ready: boolean;
  authed: boolean;
  me: AppState["users"][number];
  userById: (id: string) => AppState["users"][number] | undefined;
  welcomeDone: () => void;
  login: (profile?: SessionProfile) => void;
  logout: () => void;
  resetAll: () => void;
  setGhost: (on: boolean) => void;
  setHideOnline: (on: boolean) => void;
  setPresence: (mode: PresenceMode) => void;
  setVybe: (on: boolean) => void;
  setHub: (on: boolean) => void;
  setLock: (on: boolean) => void;
  setAppLock: (on: boolean) => void;
  updateMe: (patch: Partial<Pick<User, "name" | "bio" | "city" | "verified" | "papersLooked" | "showNijiId" | "postAs">>) => void;
  claimNijiId: (raw: string) => ClaimNijiResult;
  sendMessage: (conversationId: string, text: string, productId?: string) => void;
  sendVoice: (conversationId: string, audioUrl: string | undefined, durationSec: number) => void;
  sendLocation: (conversationId: string, point: { lat: number; lng: number; label?: string; liveMs?: number }) => void;
  openVybeChat: (userId: string) => string;
  setThread: (conversationId: string, patch: { quiet?: boolean; keepStills?: boolean; pinned?: boolean; archived?: boolean; sealed?: boolean; sealPin?: string }) => void;
  dropConversation: (conversationId: string) => void;
  setSealPin: (pin: string) => void;
  clearPaper: (conversationId: string, part?: PaperPart) => void;
  sharePost: (postId: string, userIds: string[]) => void;
  shareShop: (shopId: string, userIds: string[]) => void;
  visitShop: (shopId: string) => void;
  reviewShop: (shopId: string, stars: number, body: string) => void;
  toggleBlockShop: (shopId: string) => void;
  addStatus: (input: {
    text?: string;
    image?: string;
    mood?: import("./tokens").StatusPaperId;
    ttl: StatusTtl;
    lane?: "chat" | "vybe";
    postId?: string;
    audience?: StatusAudience;
    reshareable?: boolean;
    resharedFrom?: string;
    resharedFromAuthorId?: string;
  }) => void;
  viewStatus: (statusId: string) => void;
  markRead: (conversationId: string) => void;
  openChatWith: (userId: string, opts?: { ghost?: boolean; ghostAliasId?: string; lane?: "trusted" | "vybe" }) => string;
  mintGhost: (ttl: GhostTtl, note?: string, first?: string, last?: string) => GhostAlias;
  revokeGhost: (id: string) => void;
  meetVeil: (token: string) => string | null;
  saveScheduled: (item: Omit<ScheduledMessage, "status"> & { status?: ScheduledMessage["status"] }) => string;
  cancelScheduled: (id: string) => void;
  createGroup: (memberIds: string[], name: string, emoji: string) => string;
  setDisappear: (conversationId: string, disappear: Disappear) => void;
  noticeCapture: (conversationId: string, kind: "screenshot" | "record") => void;
  startCall: (peerId: string, mode: "voice" | "video", conversationId?: string) => void;
  receiveCall: (peerId: string, mode: "voice" | "video", conversationId?: string) => void;
  acceptCall: () => void;
  declineCall: () => void;
  patchCall: (patch: Partial<CallState>) => void;
  endCall: (durationSec: number) => void;
  leaveGroup: (conversationId: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string, replyTo?: string) => void;
  addPost: (input: {
    text: string;
    image?: string;
    mood?: AppState["posts"][number]["mood"];
    travel?: AppState["posts"][number]["travel"];
    audience: AppState["posts"][number]["audience"];
    expiry: AppState["posts"][number]["expiry"];
    language?: string;
  }) => string;
  saveStall: (shop: Shop, products: Product[]) => void;
  dropStall: (shopId: string) => void;
  hideCall: (id: string) => void;
  unhideCall: (id: string) => void;
  dropCall: (id: string) => void;
  reportPost: (postId: string) => void;
  dropPost: (postId: string) => void;
  archivePost: (postId: string, archived: boolean) => void;
  openHubChat: (shopId: string) => string;
  payStall: (conversationId: string) => void;
  toggleFollow: (userId: string) => void;
  toggleFollowShop: (shopId: string) => void;
  addCart: (shopId: string, productId: string) => void;
  setQty: (shopId: string, productId: string, qty: number) => void;
  sendOrder: (shopId: string) => string | undefined;
  messageSeller: (product: Product) => string;
  readNotes: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, createSeed);
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [session, setSession] = useState<SessionProfile | null>(null);

  useEffect(() => {
    let alive = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        if (parsed?.version === 2) dispatch({ type: "HYDRATE", payload: parsed as AppState });
        loadSignal((parsed?.users ?? createSeed().users).map((u) => u.id));
      } else {
        loadSignal(createSeed().users.map((u) => u.id));
      }
      if (shouldAutoPreview()) {
        setAuthed(true);
        dispatch({ type: "LOGIN" });
      }
    } catch {
      loadSignal(createSeed().users.map((u) => u.id));
    }
    setReady(true);

    const sessionWait = Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: null } }>((resolve) => {
        window.setTimeout(() => resolve({ data: { session: null } }), 2500);
      }),
    ]);
    void sessionWait.then(({ data }) => {
      if (!alive || !data.session?.user) return;
      setSession(profileFromUser(data.session.user));
      setAuthed(true);
      dispatch({ type: "LOGIN" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "INITIAL_SESSION") return;
      if (next?.user) {
        setSession(profileFromUser(next.user));
        setAuthed(true);
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setAuthed(false);
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, call: null, locked: false }));
  }, [state, ready]);

  const me = useMemo(
    () =>
      overlayMe(
        state.users.find((u) => u.id === state.meId) ?? state.users[0],
        session,
        state.nijiClaimed,
      ),
    [state.users, state.meId, session, state.nijiClaimed],
  );
  const userById = useCallback(
    (id: string) => state.users.find((u) => u.id === id),
    [state.users],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string, productId?: string) => {
      const messageId = uid("msg");
      const convo = state.conversations.find((c) => c.id === conversationId);
      const peer = convo ? peerOf(convo, state.meId) : "";
      const recipients = convo?.isGroup
        ? convo.participantIds.filter((id) => id !== state.meId)
        : peer
          ? [peer]
          : [];
      const sealed = recipients.length
        ? sealOrPlain(state.meId, recipients, text)
        : { text, sealed: false };
      dispatch({
        type: "SEND_MESSAGE",
        conversationId,
        text: sealed.text,
        productId,
        messageId,
        envelope: sealed.envelope,
        sealed: sealed.sealed,
      });
      if (sealed.envelope) {
        for (const id of recipients) {
          try {
            openText(id, sealed.envelope);
          } catch {
            /* already opened on this device */
          }
        }
      }
      const replies = AUTO_REPLIES[peer];
      if (replies?.length && !productId) {
        window.setTimeout(() => {
          const reply = replies[Math.floor(Math.random() * replies.length)];
          const outgoing = sealOrPlain(peer, [state.meId], reply);
          const opened = openOrFallback(state.meId, outgoing.envelope, reply);
          dispatch({
            type: "RECEIVE_MESSAGE",
            conversationId,
            message: {
              id: uid("msg"),
              senderId: peer,
              kind: "text",
              text: opened.text,
              createdAt: new Date().toISOString(),
              sealed: opened.sealed,
              envelope: outgoing.envelope,
              read: false,
            },
          });
        }, 1400 + Math.random() * 900);
      }
    },
    [state.conversations, state.meId],
  );

  const markRead = useCallback((id: string) => {
    dispatch({ type: "MARK_READ", conversationId: id });
  }, []);

  const flushScheduled = useCallback(() => {
    const due = state.scheduled.filter(
      (s) => s.status === "draft" && new Date(s.sendAt).getTime() <= Date.now(),
    );
    for (const item of due) {
      const existing = state.conversations.find(
        (c) =>
          c.id === item.conversationId ||
          (!c.isGroup && !c.ghost && c.lane !== "vybe" && c.participantIds.includes(item.peerId)),
      );
      const conversationId = existing?.id ?? `c-${item.peerId}-${uid("n")}`;
      if (!existing) {
        dispatch({ type: "ENSURE_CONVERSATION", userId: item.peerId, conversationId });
      }
      sendMessage(conversationId, item.text);
      dispatch({ type: "RESOLVE_SCHEDULED", id: item.id, conversationId });
    }
  }, [state.scheduled, state.conversations, sendMessage]);

  useEffect(() => {
    const t = window.setInterval(flushScheduled, 4000);
    flushScheduled();
    return () => window.clearInterval(t);
  }, [flushScheduled]);

  const welcomeDone = useCallback(() => {
    try {
      sessionStorage.removeItem(WATCH_INTRO_KEY);
    } catch {
      /* private mode */
    }
    dispatch({ type: "WELCOME_DONE" });
  }, []);

  const value = useMemo<Store>(() => {
    return {
      state,
      ready,
      authed,
      me,
      userById,
      welcomeDone,
      login: (profile) => {
        try {
          sessionStorage.removeItem(WATCH_INTRO_KEY);
        } catch {
          /* private mode */
        }
        if (profile) {
          setSession(profile);
          dispatch({
            type: "PATCH_ME",
            patch: {
              ...(profile.username ? { name: profile.username } : {}),
              ...(profile.phone ? { phone: profile.phone } : {}),
              ...(!state.nijiClaimed && profile.nijiId
                ? { nijiId: profile.nijiId, handle: profile.nijiId }
                : {}),
            },
          });
        }
        setAuthed(true);
        dispatch({ type: "LOGIN" });
      },
      logout: () => {
        try {
          localStorage.removeItem(PREVIEW_KEY);
        } catch {
          /* private mode */
        }
        void signOutNiji();
        setSession(null);
        setAuthed(false);
      },
      resetAll: () => {
        try {
          sessionStorage.setItem(WATCH_INTRO_KEY, "1");
          localStorage.removeItem(PREVIEW_KEY);
        } catch {
          /* private mode */
        }
        void signOutNiji();
        setSession(null);
        setAuthed(false);
        clearVault();
        try {
          localStorage.removeItem(LEGACY_SIGNAL_KEY);
        } catch {
          /* private mode */
        }
        dispatch({ type: "RESET" });
        loadSignal(createSeed().users.map((u) => u.id));
      },
      setGhost: (on) => dispatch({ type: "GHOST", on }),
      setHideOnline: (on) => dispatch({ type: "HIDE_ONLINE", on }),
      setPresence: (mode) => dispatch({ type: "SET_PRESENCE", mode }),
      setVybe: (on) => dispatch({ type: "VYBE_ON", on }),
      setHub: (on) => dispatch({ type: "HUB_ON", on }),
      setLock: (on) => dispatch({ type: "LOCK", on }),
      setAppLock: (on) => dispatch({ type: "APP_LOCK", on }),
      updateMe: (patch) => dispatch({ type: "PATCH_ME", patch }),
      claimNijiId: (raw) => {
        const id = normalizeNijiId(raw);
        if (!id) return { ok: false, reason: "invalid" };
        const taken = state.users.some(
          (u) =>
            u.id !== state.meId &&
            (u.nijiId.toLowerCase() === id || u.handle.toLowerCase() === id),
        );
        if (taken) return { ok: false, reason: "taken" };
        dispatch({ type: "CLAIM_NIJI_ID", nijiId: id });
        return { ok: true, id };
      },
      sendMessage,
      sendVoice: (conversationId, audioUrl, durationSec) => {
        dispatch({
          type: "SEND_MESSAGE",
          conversationId,
          text: "Voice",
          messageId: uid("msg"),
          kind: "voice",
          audioUrl,
          durationSec,
          sealed: true,
        });
      },
      setThread: (conversationId, patch) =>
        dispatch({ type: "SET_THREAD", conversationId, ...patch }),
      dropConversation: (conversationId) => dispatch({ type: "DROP_CONVERSATION", conversationId }),
      setSealPin: (pin) => dispatch({ type: "SET_SEAL_PIN", pin }),
      clearPaper: (conversationId, part) => dispatch({ type: "CLEAR_PAPER", conversationId, part }),
      sharePost: (postId, userIds) => {
        const post = state.posts.find((p) => p.id === postId);
        if (!post) return;
        for (const userId of userIds) {
          const existing = state.conversations.find(
            (c) =>
              !c.isGroup &&
              !c.ghost &&
              c.lane === "vybe" &&
              c.participantIds.includes(userId) &&
              c.participantIds.includes(state.meId),
          );
          const conversationId = existing?.id ?? `c-v-${userId}`;
          if (!existing) {
            dispatch({ type: "ENSURE_CONVERSATION", userId, conversationId, lane: "vybe" });
          }
          dispatch({
            type: "SEND_MESSAGE",
            conversationId,
            text: post.text || "Vybe",
            messageId: uid("msg"),
            kind: "vybe",
            postId: post.id,
            image: post.image,
            sealed: true,
          });
        }
      },
      shareShop: (shopId, userIds) => {
        const shop = state.shops.find((s) => s.id === shopId);
        if (!shop) return;
        for (const userId of userIds) {
          const existing = state.conversations.find(
            (c) =>
              !c.isGroup &&
              !c.ghost &&
              c.lane !== "vybe" &&
              c.lane !== "hub" &&
              c.participantIds.includes(userId) &&
              c.participantIds.includes(state.meId),
          );
          const conversationId = existing?.id ?? `c-${userId}`;
          if (!existing) {
            dispatch({ type: "ENSURE_CONVERSATION", userId, conversationId });
          }
          dispatch({
            type: "SEND_MESSAGE",
            conversationId,
            text: shop.name,
            messageId: uid("msg"),
            kind: "shop",
            shopId: shop.id,
            image: shop.cover,
            sealed: true,
          });
        }
      },
      sendLocation: (conversationId, point) => {
        dispatch({
          type: "SEND_MESSAGE",
          conversationId,
          text: point.label || "Here",
          messageId: uid("msg"),
          kind: "location",
          lat: point.lat,
          lng: point.lng,
          liveUntil: point.liveMs ? new Date(Date.now() + point.liveMs).toISOString() : undefined,
          sealed: true,
        });
      },
      openVybeChat: (userId) => {
        const existing = state.conversations.find(
          (c) =>
            !c.isGroup &&
            !c.ghost &&
            c.lane === "vybe" &&
            c.participantIds.includes(userId) &&
            c.participantIds.includes(state.meId),
        );
        if (existing) return existing.id;
        const conversationId = `c-v-${userId}`;
        dispatch({ type: "ENSURE_CONVERSATION", userId, conversationId, lane: "vybe" });
        return conversationId;
      },
      addStatus: (input) => {
        const ttl = STATUS_TTLS.find((t) => t.id === input.ttl) ?? STATUS_TTLS[0];
        const lane = input.lane ?? "chat";
        dispatch({
          type: "ADD_STATUS",
          status: {
            id: uid("st"),
            authorId: state.meId,
            text: input.text,
            image: input.image,
            mood: input.image ? undefined : (input.mood ?? "plain"),
            lane,
            postId: input.postId,
            audience: lane === "vybe" ? (input.audience ?? "public") : undefined,
            reshareable: lane === "vybe" ? Boolean(input.reshareable) : undefined,
            resharedFrom: input.resharedFrom,
            resharedFromAuthorId: input.resharedFromAuthorId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + ttl.ms).toISOString(),
            viewedBy: [state.meId],
          },
        });
      },
      viewStatus: (statusId) => dispatch({ type: "VIEW_STATUS", statusId, viewerId: state.meId }),
      markRead,
      openChatWith: (userId, opts) => {
        const ghost = Boolean(opts?.ghost);
        const existing = state.conversations.find(
          (c) =>
            !c.isGroup &&
            Boolean(c.ghost) === ghost &&
            c.participantIds.includes(userId) &&
            c.participantIds.includes(state.meId),
        );
        if (existing) return existing.id;
        const conversationId = `c-${ghost ? "g-" : ""}${userId}-${uid("n")}`;
        dispatch({
          type: "ENSURE_CONVERSATION",
          userId,
          conversationId,
          ghost,
          ghostAliasId: opts?.ghostAliasId,
        });
        return conversationId;
      },
      mintGhost: (ttl, note, first, last) => {
        const taken = [
          ...state.ghostAliases.map((a) => a.token),
          ...state.users.map((u) => u.nijiId),
        ];
        const token = mintMistId(first ?? "", last ?? "", taken);
        const alias: GhostAlias = {
          id: uid("ga"),
          token,
          createdAt: new Date().toISOString(),
          expiresAt: ghostExpiresAt(ttl),
          note: note?.trim() || undefined,
        };
        dispatch({ type: "MINT_GHOST", alias });
        return alias;
      },
      revokeGhost: (id) => dispatch({ type: "REVOKE_GHOST", id }),
      meetVeil: (raw) => {
        const link = parseNijiLink(raw);
        const token = link?.kind === "mist" ? link.token : cleanVeil(raw);
        if (token.length < 6) return null;
        const alias = state.ghostAliases.find((a) => cleanVeil(a.token) === token && isAliasLive(a));
        if (!alias) return null;
        const existing = state.conversations.find((c) => c.ghost && c.ghostAliasId === alias.id);
        if (existing) return existing.id;
        const face = mistFace(alias.token);
        const user: User = {
          id: `veil-${uid("u")}`,
          name: face,
          handle: alias.token,
          nijiId: alias.token,
          bio: "Opened with a mist name. It fades.",
          city: "",
          emoji: "·",
          verified: false,
          online: false,
        };
        const conversationId = `c-g-${user.id}`;
        dispatch({ type: "ADD_USER", user });
        dispatch({
          type: "ENSURE_CONVERSATION",
          userId: user.id,
          conversationId,
          ghost: true,
          ghostAliasId: alias.id,
        });
        return conversationId;
      },
      saveScheduled: (item) => {
        const next: ScheduledMessage = {
          id: item.id || uid("sch"),
          peerId: item.peerId,
          conversationId: item.conversationId,
          text: item.text.trim(),
          sendAt: item.sendAt,
          keepMemory: item.keepMemory,
          sentAt: item.sentAt,
          status: "draft",
        };
        dispatch({ type: "UPSERT_SCHEDULED", item: next });
        return next.id;
      },
      cancelScheduled: (id) => dispatch({ type: "CANCEL_SCHEDULED", id }),
      createGroup: (memberIds, name, emoji) => {
        const conversationId = `g-${uid("n")}`;
        dispatch({ type: "CREATE_GROUP", conversationId, memberIds, name, emoji });
        return conversationId;
      },
      setDisappear: (conversationId, disappear) =>
        dispatch({ type: "SET_DISAPPEAR", conversationId, disappear }),
      noticeCapture: (conversationId, kind) =>
        dispatch({ type: "NOTICE_CAPTURE", conversationId, kind, messageId: uid("cap") }),
      startCall: (peerId, mode, conversationId) =>
        dispatch({ type: "START_CALL", peerId, mode, conversationId }),
      receiveCall: (peerId, mode, conversationId) =>
        dispatch({ type: "RECEIVE_CALL", peerId, mode, conversationId }),
      acceptCall: () => dispatch({ type: "ACCEPT_CALL" }),
      declineCall: () => dispatch({ type: "DECLINE_CALL" }),
      patchCall: (patch) => dispatch({ type: "PATCH_CALL", patch }),
      endCall: (durationSec) => dispatch({ type: "END_CALL", durationSec }),
      leaveGroup: (conversationId) => dispatch({ type: "LEAVE_GROUP", conversationId }),
      toggleLike: (postId) => dispatch({ type: "TOGGLE_LIKE", postId }),
      addComment: (postId, text, replyTo) =>
        dispatch({ type: "ADD_COMMENT", postId, text, replyTo }),
      addPost: (input) => {
        const id = uid("post");
        dispatch({ type: "ADD_POST", id, ...input });
        return id;
      },
      saveStall: (shop, products) => dispatch({ type: "SAVE_STALL", shop, products }),
      dropStall: (shopId) => dispatch({ type: "DROP_STALL", shopId }),
      hideCall: (id) => dispatch({ type: "HIDE_CALL", id }),
      unhideCall: (id) => dispatch({ type: "UNHIDE_CALL", id }),
      dropCall: (id) => dispatch({ type: "DROP_CALL", id }),
      reportPost: (postId) => dispatch({ type: "REPORT_POST", postId }),
      dropPost: (postId) => dispatch({ type: "DROP_POST", postId }),
      archivePost: (postId, archived) => dispatch({ type: "SET_POST", postId, archived }),
      openHubChat: (shopId) => {
        const shop = state.shops.find((s) => s.id === shopId);
        if (!shop) return "/chat";
        const existing = hubOf(state, shopId);
        if (existing) return existing.id;
        const conversationId = `c-shop-${shopId}`;
        dispatch({
          type: "ENSURE_CONVERSATION",
          userId: shop.ownerId,
          conversationId,
          lane: "hub",
          shopId,
          name: shop.name,
        });
        return conversationId;
      },
      payStall: (conversationId) => {
        dispatch({
          type: "SEND_MESSAGE",
          conversationId,
          text: "Paid · UPI",
          messageId: uid("msg"),
          kind: "order",
          sealed: true,
        });
      },
      toggleFollow: (userId) => dispatch({ type: "FOLLOW", userId }),
      toggleFollowShop: (shopId) => dispatch({ type: "FOLLOW_SHOP", shopId }),
      visitShop: (shopId) => dispatch({ type: "VISIT_SHOP", shopId }),
      reviewShop: (shopId, stars, body) => dispatch({ type: "REVIEW_SHOP", shopId, stars, body }),
      toggleBlockShop: (shopId) => dispatch({ type: "BLOCK_SHOP", shopId }),
      addCart: (shopId, productId) => dispatch({ type: "ADD_CART", shopId, productId }),
      setQty: (shopId, productId, qty) => dispatch({ type: "SET_QTY", shopId, productId, qty }),
      sendOrder: (shopId) => {
        dispatch({ type: "SEND_ORDER", shopId });
        const shop = state.shops.find((s) => s.id === shopId);
        if (!shop) return undefined;
        return hubOf(state, shopId)?.id ?? `c-shop-${shopId}`;
      },
      messageSeller: (product) => {
        const shop = state.shops.find((s) => s.id === product.shopId);
        if (!shop) return "/chat";
        const existing = hubOf(state, shop.id);
        const id = existing?.id ?? `c-shop-${shop.id}`;
        if (!existing) {
          dispatch({
            type: "ENSURE_CONVERSATION",
            userId: shop.ownerId,
            conversationId: id,
            lane: "hub",
            shopId: shop.id,
            name: shop.name,
          });
        }
        sendMessage(id, `About ${product.name} — is this still available?`, product.id);
        return id;
      },
      readNotes: () => dispatch({ type: "READ_NOTES" }),
    };
  }, [state, ready, authed, me, userById, sendMessage, markRead, welcomeDone, session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
