import type { SignalEnvelope } from "./signal";
import type { MoodId, StatusPaperId } from "./tokens";

export type Audience = "everyone" | "followers" | "homies";
export type Expiry = "forever" | "24h" | "7d";
/** How a still travels. Niji's move vs a public forever-feed. */
export type Travel = "hold" | "pass" | "fade";
export type Disappear = "off" | "view-once" | "24h" | "7d";
export type CallDirection = "incoming" | "outgoing" | "missed";
export type CallKind = "voice" | "video";
export type StatusTtl = "1h" | "6h" | "12h" | "1d";
/** Who can see a Vybe story. Chat status stays on the chat face. */
export type StatusAudience = "public" | "friends";
export type GhostTtl = "1h" | "6h" | "1d" | "3d" | "7d";
export type PresenceMode = "around" | "quiet" | "ghost";
export type ClaimNijiResult = { ok: true; id: string } | { ok: false; reason: "invalid" | "taken" };

export type PaperPart = "all" | "stills" | "paths" | "leaves";

export type GhostAlias = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  revoked?: boolean;
  note?: string;
};

export type ScheduledMessage = {
  id: string;
  peerId: string;
  conversationId?: string;
  text: string;
  sendAt: string;
  keepMemory?: boolean;
  sentAt?: string;
  status: "draft" | "sent" | "kept";
};

export type User = {
  id: string;
  name: string;
  handle: string;
  nijiId: string;
  bio: string;
  city: string;
  emoji: string;
  photo?: string;
  verified: boolean;
  papersLooked?: boolean;
  showNijiId?: boolean;
  postAs?: "name" | "nijiId";
  online: boolean;
  isHomie?: boolean;
  phone?: string;
};

export type Comment = {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
  replyTo?: string;
};

export type Post = {
  id: string;
  authorId: string;
  text: string;
  image?: string;
  mood?: MoodId;
  language?: string;
  location?: string;
  audience: Audience;
  expiry: Expiry;
  travel?: Travel;
  createdAt: string;
  likedBy: string[];
  comments: Comment[];
  archived?: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  kind: "text" | "product" | "call" | "order" | "vybe" | "voice" | "location" | "notice" | "shop";
  text: string;
  createdAt: string;
  sealed: boolean;
  /** How a capture was tried. Only on notice lines. */
  notice?: "screenshot" | "record";
  envelope?: SignalEnvelope;
  read: boolean;
  productId?: string;
  postId?: string;
  shopId?: string;
  image?: string;
  audioUrl?: string;
  durationSec?: number;
  file?: { name: string; size: string };
  call?: { mode: CallKind; durationSec?: number };
  lat?: number;
  lng?: number;
  liveUntil?: string;
};

export type ChatStatus = {
  id: string;
  authorId: string;
  text?: string;
  image?: string;
  /** Text-only paper. Ignored when a still is on. */
  mood?: StatusPaperId;
  lane?: "chat" | "vybe";
  postId?: string;
  audience?: StatusAudience;
  reshareable?: boolean;
  resharedFrom?: string;
  resharedFromAuthorId?: string;
  createdAt: string;
  expiresAt: string;
  viewedBy: string[];
};

export type Conversation = {
  id: string;
  participantIds: string[];
  name?: string;
  emoji?: string;
  isGroup?: boolean;
  isHomies?: boolean;
  pinned?: boolean;
  unread: number;
  disappear: Disappear;
  quiet?: boolean;
  keepStills?: boolean;
  ghost?: boolean;
  ghostAliasId?: string;
  lane?: "trusted" | "vybe" | "hub";
  shopId?: string;
  archived?: boolean;
  sealed?: boolean;
  /** Unique pin hash for this chat. Falls back to the You-tab seal code. */
  sealPin?: string;
  messages: Message[];
};

export type CallRecord = {
  id: string;
  peerId: string;
  kind: CallKind;
  direction: CallDirection;
  durationSec?: number;
  createdAt: string;
  hidden?: boolean;
};

export type Product = {
  id: string;
  shopId: string;
  name: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  section?: string;
  special?: boolean;
};

export type ShopPaperProof = {
  id: string;
  number?: string;
  expiresAt?: string;
};

export type ShopReview = {
  id: string;
  shopId: string;
  authorId: string;
  stars: number;
  body: string;
  at: number;
};

export type Shop = {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  city: string;
  area: string;
  description: string;
  cover: string;
  hours?: string;
  verified: boolean;
  papers?: string[];
  paperProofs?: ShopPaperProof[];
  rating: number;
  km: number;
  followerCount: number;
  visits?: number;
  blockCount?: number;
  reviewCount?: number;
};

export type CartItem = { productId: string; qty: number };

export type Order = {
  id: string;
  shopId: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: "sent" | "confirmed" | "shipped";
};

export type CallState = {
  peerId: string;
  conversationId?: string;
  mode: CallKind;
  direction: "incoming" | "outgoing";
  status: "incoming" | "connecting" | "connected";
  muted: boolean;
  cameraOff: boolean;
  speaker: boolean;
  facingFront?: boolean;
  startedAt?: number;
};

export type AppState = {
  version: 2;
  seenWelcome: boolean;
  locked: boolean;
  /** Lock this phone when it sleeps. Face, thumb, or the seal code opens it. */
  appLock?: boolean;
  ghostMode: boolean;
  hideOnline: boolean;
  vybeEnabled: boolean;
  hubEnabled: boolean;
  nijiClaimed?: boolean;
  sealPin?: string;
  meId: string;
  users: User[];
  conversations: Conversation[];
  posts: Post[];
  shops: Shop[];
  products: Product[];
  following: string[];
  followingShops: string[];
  cartByShop: Record<string, CartItem[]>;
  orders: Order[];
  calls: CallRecord[];
  call: CallState | null;
  notifications: { id: string; text: string; createdAt: string; read: boolean }[];
  statuses: ChatStatus[];
  ghostAliases: GhostAlias[];
  scheduled: ScheduledMessage[];
  shopReviews: ShopReview[];
  blockedShopIds: string[];
  reportedPostIds: string[];
};
