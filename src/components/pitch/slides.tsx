import type { ComponentType } from "react";
import {
  IconAccount,
  IconBell,
  IconCalls,
  IconChat,
  IconExplore,
  IconHome,
  IconHub,
  IconHubChat,
  IconLater,
  IconMist,
  IconVybe,
  IconVybeChat,
} from "@/components/niji/icons";

export type Mark = {
  Icon: ComponentType<{ className?: string }>;
  name: string;
  where: string;
  meaning: string;
};

export type Slide = {
  id: string;
  dwell: number;
  kind: "cover" | "split" | "paper" | "metrics" | "columns" | "ask";
  image?: string;
  imageFit?: string;
  imageObject?: string;
  kicker?: string;
  title: string;
  italic?: string;
  body?: string;
  points?: string[];
  marks?: Mark[];
  rows?: { left: string; right: string }[];
  metrics?: { value: string; label: string; source?: string }[];
  columns?: { kicker: string; title: string; body: string }[];
  quote?: string;
  caption: string;
};

export const SLIDES: Slide[] = [
  {
    id: "cover",
    dwell: 4800,
    kind: "cover",
    image: "/brand/niji-hold.jpg",
    kicker: "Confidential · Seed · Built in India",
    title: "Niji",
    italic: "Own Your Vibe.",
    body: "A privacy-first social operating system — sealed messaging, time-bound media, and trusted local commerce — designed for the next generation of Indian users.",
    points: [
      "End-to-end cryptography on device",
      "Identity you control — invite, not exposure",
      "One product surface: chat, status, stalls",
    ],
    caption: "",
  },
  {
    id: "why",
    dwell: 5600,
    kind: "metrics",
    kicker: "01 · Why now",
    title: "India’s digital generation deserves a product built for confidentiality.",
    body: "After eleven years building and living in the United States, the founder’s conviction is simple: US platforms dominate the global social stack, while privacy and security remain secondary to growth. India is ready for an Indian product that treats confidentiality as the default — not a marketing badge.",
    metrics: [
      { value: "958M", label: "Active internet users in India (2025)", source: "IAMAI–Kantar Internet in India 2025" },
      { value: "969M", label: "Internet subscribers (Mar 2025)", source: "TRAI Yearly Performance Indicators 2024–25" },
      { value: "588M", label: "Short-video consumers — 61% of AIU", source: "IAMAI–Kantar 2025" },
    ],
    caption: "The market is ready. The default stack is not private.",
  },
  {
    id: "art",
    dwell: 6400,
    kind: "split",
    image: "/brand/niji-story.jpg",
    kicker: "02 · The story image",
    title: "One poster. The whole product.",
    points: [
      "Top — a wire globe and speech. The world arrives as a chat, not a broadcast.",
      "Centre — a chrome handshake. Trust is a gate, not a follower count.",
      "Left — encryption as texture. The stance is in the art. The UI never says Encrypted.",
      "Right — Vybe: a still, a face, a reel of film. Expression without a forever feed.",
      "Low — commerce as stalls, coin, craft. Hub is culture, not a mall.",
      "Floor — a real mountain. The launch story plants the globe at the top and the mountain on the floor.",
    ],
    caption: "Art and interface are the same sheet of paper.",
  },
  {
    id: "mark",
    dwell: 5600,
    kind: "split",
    image: "/brand/niji-mark.jpg",
    kicker: "03 · Namaskaram",
    title: "The logo is a welcome.",
    italic: "Namaskaram — the Indian culture of greeting.",
    body: "Namaskaram is how India receives a guest: a bow of respect, the first thing you offer before any conversation. We chose it as the Niji mark because the product is an invitation — into a sealed room, onto a still, onto a paper you share. The chrome form is that greeting made visible.",
    quote: "The brand is a namaste. The product is the room you are welcomed into.",
    caption: "A greeting first. A product second.",
  },
  {
    id: "lockup-read",
    dwell: 5200,
    kind: "split",
    image: "/brand/niji-hold.jpg",
    kicker: "04 · First impression",
    title: "From install, the brand is the product.",
    body: "The word is machined chrome on a white circuit — encryption as texture, not a padlock ribbon. Three lights sit on the letters: saffron, paper, India green. A pulse, not a flag stamp.",
    points: [
      "The fingerprint gate is the door. Sign up lights saffron; login lights green — no labels, no clutter.",
      "Story artwork and interface share the same paper, so the brand never feels bolted on.",
    ],
    quote: "Investors are buying a finished visual system, not a theme pack.",
    caption: "The brand does the speaking. The chrome in the UI stays a hairline.",
  },
  {
    id: "namaskaram-paper",
    dwell: 5200,
    kind: "split",
    image: "/invest/07-paper.png",
    kicker: "05 · The invite",
    title: "The portrait is presence. The seal is the invitation.",
    body: "The same chrome that greets you on first open becomes the seal on the paper you share. A lasting Niji ID, a Mist alias, or a Hub stall — one circuit, one welcome.",
    quote: "Distribution starts as a shareable paper that actually opens Niji.",
    caption: "First open and share paper are the same greeting.",
  },
  {
    id: "not-copy",
    dwell: 6200,
    kind: "paper",
    kicker: "06 · Category",
    title: "Same jobs. Different refusals.",
    rows: [
      { left: "WhatsApp — everyone, including family", right: "Niji Trusted — the thread they are not on" },
      { left: "Instagram — perform, stay, For You", right: "Vybe — Hold / Pass / Fade. No streak. No public like-count" },
      { left: "Signal — homework, US chrome, lock icons", right: "The crypto runs. The UI never says Encrypted" },
      { left: "Snap — camera as home, US teen graph", right: "A still on paper. An Indian material. Invite, not a public lens" },
      { left: "BeReal — one brittle ping", right: "Ash, Mist, Around — a room you can keep" },
      { left: "Forwarded many times", right: "Copy a line. Never forward. Pass, if ever, is one person" },
    ],
    caption: "Copycats add a skin. Niji removes the machine that made the copy.",
  },
  {
    id: "tabs",
    dwell: 6400,
    kind: "paper",
    kicker: "07 · Product surface",
    title: "Chat · Calls · Vybe · Hub · You",
    body: "Five rooms on one paper. The desk opens on Chat. Vybe remains the expressive centre. Hub may be hidden from You.",
    marks: [
      {
        Icon: IconChat,
        name: "Chat",
        where: "Sealed messages",
        meaning: "Trusted threads, Mist aliases, Later, Hub enquiries — copy allowed, never forward.",
      },
      {
        Icon: IconCalls,
        name: "Calls",
        where: "Voice and video",
        meaning: "The same peer graph as chat. History lives beside the thread, not in a separate product.",
      },
      {
        Icon: IconVybe,
        name: "Vybe",
        where: "Expression",
        meaning: "Hold, Pass, or Fade. A still with an expiry contract — not a forever public grid.",
      },
      {
        Icon: IconHub,
        name: "Hub",
        where: "Trusted stalls",
        meaning: "Local commerce inside the chat graph. Optional. Hide it from You.",
      },
      {
        Icon: IconAccount,
        name: "You",
        where: "Identity",
        meaning: "Niji ID, presence, lock, and the paper you share. Not a settings junk drawer.",
      },
    ],
    caption: "Five rooms. One paper. Chat carries the seal. Vybe carries the still.",
  },
  {
    id: "chat-inner",
    dwell: 6000,
    kind: "paper",
    kicker: "08 · Inside Chat",
    title: "Trusted · Hub chat · Mist · Later",
    marks: [
      {
        Icon: IconChat,
        name: "Trusted",
        where: "Default",
        meaning: "People you chose. Bold name when unread. No pip beside the name.",
      },
      {
        Icon: IconHubChat,
        name: "Hub chat",
        where: "Commerce",
        meaning: "Enquiries, orders, pay — on the same sealed surface as friends.",
      },
      {
        Icon: IconMist,
        name: "Mist",
        where: "Temporary identity",
        meaning: "A name with a timer. Share a code, not a face. When time ends, it fades.",
      },
      {
        Icon: IconLater,
        name: "Later",
        where: "Scheduled",
        meaning: "Park a line for a future moment. When it leaves, it still sits in the thread.",
      },
    ],
    caption: "Search is a swipe down. The + opens a thread.",
  },
  {
    id: "vybe-inner",
    dwell: 6000,
    kind: "paper",
    kicker: "09 · Inside Vybe",
    title: "Feed · Explore · Notes · Vybe chat · You",
    marks: [
      {
        Icon: IconHome,
        name: "Feed",
        where: "Home",
        meaning: "Your stills, in time. Hold, Pass, or Fade — not a forever public grid.",
      },
      {
        Icon: IconExplore,
        name: "Explore",
        where: "After trust",
        meaning: "Opens only after a trusted graph is real. Not a For You of strangers.",
      },
      {
        Icon: IconBell,
        name: "Notes",
        where: "Signal",
        meaning: "A spark, not a bell. Saffron when a note is unread.",
      },
      {
        Icon: IconVybeChat,
        name: "Vybe chat",
        where: "The still",
        meaning: "Chat that belongs to the still, not the phone book. No call buttons.",
      },
      {
        Icon: IconAccount,
        name: "Account",
        where: "Identity",
        meaning: "Your vybe, the mountain paper, the Niji ID.",
      },
    ],
    caption: "Header + is a Vybe post. The face on the rail is a status. Two different doors.",
  },
  {
    id: "honour",
    dwell: 5200,
    kind: "split",
    image: "/invest/13-silver-ring.png",
    imageFit: "object-contain",
    imageObject: "object-center",
    kicker: "10 · Respect",
    title: "On a profile, honour is a silver ring.",
    body: "Respect on Vybe sits as a silver ring on the profile — quiet metal, never a blue tick, never a public score.",
    points: [
      "Silver ring on the Vybe profile — looked at with respect, never a verification tick.",
      "Star on a still — a like that is not a public score.",
      "Ripple is the share itself. No toast. No streak.",
      "Comment: light if empty, heavier if someone wrote. Same mark, more ink.",
    ],
    caption: "Weight is the interface. Colour is almost never.",
  },
  {
    id: "protocol",
    dwell: 5600,
    kind: "split",
    image: "/invest/14-seal-lock.png",
    kicker: "11 · Protocol",
    title: "Genuine Signal Protocol. Quiet by design.",
    body: "libsignal runs on device. The server holds public bundles only. Private keys never leave the phone. Until a second device answers in production, capital funds the remaining wire — not another redesign.",
    points: [
      "Copy a line. Never forward. Pass, if ever, is one person.",
      "Mist is a temporary name. Seal is a four-digit lock on a thread.",
      "Ash is view-once. Sundown clears by evening. A moon keeps a lunar cycle.",
      "Two status rails: Chat intimacy and Vybe performance never share a tab.",
    ],
    quote: "We implement confidentiality. We do not costume it.",
    caption: "Privacy you can stand behind. The glass can still see. We say so.",
  },
  {
    id: "vybe-hub",
    dwell: 5600,
    kind: "split",
    image: "/invest/15-hold-fade.png",
    kicker: "12 · Expression and commerce",
    title: "Expression without a permanent public stage.",
    body: "Users keep a room, not a feed. Hold keeps a still private. Pass hands it to people you pick — one path, not a forward chain. Fade lives on the feed for a day, then ashes.",
    points: [
      "Chat status and Vybe status stay in separate lanes so intimacy and performance never collide.",
      "Hub stalls inherit the chat trust model. Enquiries land in Hub chat. Rank is real feedback — not an advertising bid.",
      "Hub is not the launch sentence. Hide the room. Invite sellers you already chat with.",
    ],
    quote: "Retention through a room people keep — not through an extractive feed.",
    caption: "Three products in one house. Chat and Vybe open the door.",
  },
  {
    id: "gtm",
    dwell: 5600,
    kind: "columns",
    kicker: "13 · Go-to-market",
    title: "Win one trusted graph. Then the next campus.",
    body: "Growth is invite-led: Niji ID, mountain QR, and Mist. We expand through cohorts that already know each other — campuses, creator circles, stall hosts — before any public stranger discovery.",
    columns: [
      {
        kicker: "01",
        title: "Beachhead",
        body: "One city or campus cohort. QR and Mist as the only invite mechanics.",
      },
      {
        kicker: "02",
        title: "Expansion",
        body: "Adjacent campuses and creators already inside the trust graph.",
      },
      {
        kicker: "03",
        title: "Category",
        body: "Private social OS — messaging, status, trusted commerce — as one product.",
      },
    ],
    caption: "Invite first. Discover never, until the graph is real.",
  },
  {
    id: "ask",
    dwell: 6400,
    kind: "ask",
    kicker: "14 · The ask",
    title: "We are raising seed to build India’s privacy-first social OS.",
    body: "This round funds outcomes — not polish. Capital puts sealed messaging in production hands, makes Niji installable nationwide, and grows the first trusted graphs across campuses.",
    columns: [
      {
        kicker: "With this round",
        title: "",
        body: "Ship sealed chat between real devices. Publish installable Niji so niji:// opens from Camera and share sheets. Land the first invite cohort, then the next campus.",
      },
      {
        kicker: "Then we scale",
        title: "",
        body: "Safety primitives people trust: block, report, leave. Real voice and video on the same graph. Hub as invite-led stalls — not a stranger mall.",
      },
    ],
    points: [
      "Production sealed messaging and calls between real phones",
      "App Store / Play distribution with working niji:// invites",
      "First campus cohorts live — then city-by-city expansion",
      "A confidentiality standard Indian users can actually adopt",
    ],
    italic: "Join us in building the social room India has never had.",
    caption: "Until a second phone answers, polish is rehearsal.",
  },
];
