"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const STORY_BEATS = [
  {
    id: "namaskaram",
    label: "Namaskaram",
    title: "Greeting as identity protocol",
    body: "The chrome arcs are Namaskaram — a formal welcome. On Vybe they signal respect in silver. On the share paper they become the circuit seal that opens a live Niji payload.",
  },
  {
    id: "transfer",
    label: "Sealed transport",
    title: "Confidentiality as infrastructure",
    body: "End-to-end messaging and calling sit under the product surface. Private key material remains on-device; the interface never performs encryption as costume.",
  },
  {
    id: "vybe",
    label: "Ephemeral media",
    title: "Expression with an expiry contract",
    body: "Vybe encodes how a still may travel — Hold, Pass, or Fade — so performance does not default to a permanent public archive.",
  },
  {
    id: "hub",
    label: "Trusted commerce",
    title: "Local trade inside the same graph",
    body: "Hub stalls inherit the chat trust model. Enquiries remain on sealed rails instead of diverting into an open marketplace.",
  },
] as const;

/** Proud feature set — Chat → Vybe → Hub — with audience-friendly term explainers. */
const FEATURES = [
  {
    id: "mist",
    room: "Chat",
    title: "Mist",
    subtitle: "A temporary identity when you do not want your real name in the room.",
    plain:
      "Mint an alias with a countdown (for example priya-482). Share it on Namaskaram paper. When time ends, the name fades; History keeps the record. Others never see your permanent Niji ID unless you choose.",
    technical: "Mist alias with a hard TTL. Same Namaskaram share paper as a real Niji ID — different credential.",
    screen: "/invest/08-mist.png",
  },
  {
    id: "seal",
    room: "Chat",
    title: "Seal",
    subtitle: "A four-digit lock on a thread — quiet, not theatrical.",
    plain:
      "Lock a conversation behind a PIN you set. Open it when you need the paper; it stays closed to casual glances on a shared phone. No padlock badge performing “Encrypted.”",
    technical: "Shared or per-chat PIN. Unlock lives in session memory. Cryptography stays under the glass.",
    screen: "/invest/09-seal.png",
  },
  {
    id: "ash",
    room: "Chat",
    title: "Ash · Sundown · A moon",
    subtitle: "How long a message is allowed to live.",
    plain:
      "Ash is view-once — after they open it, the paper is gone. Sundown clears by evening. A moon keeps it for a lunar cycle. If someone captures Ash, Seal, or Mist content where the OS allows, the other side can receive a notice.",
    technical: "Vanish modes with capture-notice semantics. Copy allowed on open paper; never on Ash, seal, or Mist.",
    screen: "/invest/02-chat.png",
  },
  {
    id: "later",
    room: "Chat",
    title: "Later",
    subtitle: "Park a line for a future moment.",
    plain:
      "Write what you want to send, when, and to whom. When it leaves, it also sits in that chat — so the conversation stays complete. Optional Memory keeps a sent row for you.",
    technical: "Scheduled outbound with in-thread landing. No third-party reminder surface.",
    screen: "/invest/10-later.png",
  },
  {
    id: "calls",
    room: "Chat",
    title: "Calls",
    subtitle: "Voice and video on the same sealed graph.",
    plain:
      "Place a voice or video call from a trusted thread. Call history lives beside Chat — hide or delete from the Calls surface when you need a quieter book.",
    technical: "Same peer graph as messaging. Dedicated Calls room in the desk client.",
    screen: "/invest/04-calls.png",
  },
  {
    id: "travel",
    room: "Vybe",
    title: "Hold · Pass · Fade",
    subtitle: "Three ways a still is allowed to travel.",
    plain:
      "Hold keeps it on your paper — private. Pass hands it to people you pick — one path, not a forward chain. Fade puts it on the feed for a day, then it ashes. No streaks. No public like-count as status.",
    technical: "Travel contracts map to audience and expiry. Expression without a forever archive.",
    screen: "/invest/11-travel.png",
  },
  {
    id: "rails",
    room: "Chat · Vybe",
    title: "Two status rails",
    subtitle: "Chat intimacy and Vybe performance never mix.",
    plain:
      "A status you put up from Chat stays on Chat. A status from Vybe stays on Vybe. Tap + on your face to post — faces in a row open people, not status stacks.",
    technical: "Isolated presence lanes. Namaskaram on a Vybe face is silver respect — never a verify tick.",
    screen: "/invest/12-rails.png",
  },
  {
    id: "hub",
    room: "Hub",
    title: "Hub stalls",
    subtitle: "Local commerce inside the trust graph.",
    plain:
      "Browse and host stalls ranked by real feedback — not ads. Enquiries land in Hub chat on the same sealed surface. Share a stall with Namaskaram paper using your Niji shop ID.",
    technical: "Multi-stall hosting. Papers are operator-entered numbers with public-portal lookup — Niji does not scrape or certify.",
    screen: "/invest/05-hub.png",
  },
] as const;

export function MarketingSite() {
  const loginHref = "/login?fresh=1";
  const [scrolled, setScrolled] = useState(false);
  const [beat, setBeat] = useState(0);
  const [beatPaused, setBeatPaused] = useState(false);
  const [feature, setFeature] = useState(0);
  const [shownFeature, setShownFeature] = useState(0);
  const [copyOn, setCopyOn] = useState(true);
  const [featurePaused, setFeaturePaused] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const skipCopyFade = useRef(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (beatPaused) return;
    const t = window.setInterval(() => setBeat((b) => (b + 1) % STORY_BEATS.length), 5200);
    return () => window.clearInterval(t);
  }, [beatPaused]);

  useEffect(() => {
    if (featurePaused) return;
    const t = window.setInterval(() => {
      setShowTech(false);
      setFeature((f) => (f + 1) % FEATURES.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, [featurePaused]);

  useEffect(() => {
    if (skipCopyFade.current) {
      skipCopyFade.current = false;
      return;
    }
    setCopyOn(false);
    const t = window.setTimeout(() => {
      setShownFeature(feature);
      setCopyOn(true);
    }, 480);
    return () => window.clearTimeout(t);
  }, [feature]);

  const activeBeat = STORY_BEATS[beat]!;
  const activeFeature = FEATURES[feature]!;
  const copyFeature = FEATURES[shownFeature]!;

  return (
    <div className="site-root bg-[#EBEBEC] text-[#17171A]">
      <header
        className="fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter] duration-500"
        style={{
          background: scrolled ? "rgba(235,235,236,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
        }}
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/blades-mark.png"
              alt=""
              className="h-8 w-8 object-contain"
            />
            <span className="font-serif text-[22px] tracking-tight">Niji</span>
          </Link>
          <div className="flex items-center gap-5">
            <a
              href="#story"
              className="hidden text-[12px] tracking-[0.16em] text-[#8A8A90] uppercase md:inline"
            >
              Architecture
            </a>
            <a
              href="#features"
              className="hidden text-[12px] tracking-[0.16em] text-[#8A8A90] uppercase md:inline"
            >
              Product
            </a>
            <Link
              href="/invest"
              className="hidden text-[12px] tracking-[0.16em] text-[#8A8A90] uppercase sm:inline"
            >
              Investors
            </Link>
            <Link
              href={loginHref}
              className="rounded-full bg-[#17171A] px-4 py-2 text-[12px] font-medium tracking-[0.14em] text-[#F7F7F8] uppercase"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* 1 — HERO: full-bleed brand plane; Niji + tricolor framed center */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#EBEBEC]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/niji-hero-plane.jpg"
          alt=""
          aria-hidden
          className="site-zoom absolute inset-0 h-full w-full object-cover object-[62%_48%]"
        />
        {/* Soft veil so copy stays legible; mark + tricolor stay clear on the right */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(235,235,236,0.94) 0%, rgba(235,235,236,0.78) 30%, rgba(235,235,236,0.22) 52%, transparent 68%), linear-gradient(180deg, rgba(235,235,236,0.28) 0%, transparent 24%, transparent 70%, rgba(235,235,236,0.4) 100%)",
          }}
        />
        <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-6 pb-16 pt-28 md:justify-center md:px-10 md:pb-24 md:pt-20">
          <div className="max-w-lg">
            <p className="site-fade text-[12px] tracking-[0.32em] text-[#8A8A90] uppercase">
              niji.chat
            </p>
            <h1 className="site-rise mt-4 font-serif text-[72px] leading-[0.9] tracking-[-0.03em] md:text-[96px]">
              Niji
            </h1>
            <p className="site-rise mt-3 font-serif text-[28px] italic text-[#3A3A40] md:text-[34px]">
              Own Your Vibe.
            </p>
            <p className="site-fade mt-5 max-w-md text-[15px] leading-7 text-[#65656B] md:text-[16px]">
              A privacy-first social house — sealed messaging, time-bound media, and trusted local
              commerce. Confidentiality is the default, never a costume.
            </p>
            <div className="site-fade mt-8 flex flex-wrap gap-3" style={{ animationDelay: "100ms" }}>
              <Link
                href={loginHref}
                className="rounded-full bg-[#17171A] px-7 py-3.5 text-[13px] font-medium tracking-[0.14em] text-[#F7F7F8] uppercase"
              >
                Login
              </Link>
              <a
                href="#story"
                className="rounded-full bg-white/70 px-7 py-3.5 text-[13px] tracking-[0.14em] text-[#65656B] uppercase ring-1 ring-black/10 backdrop-blur"
              >
                System architecture
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2 — STORYBOARD: fixed left column height so art never jumps */}
      <section id="story" className="border-t border-black/[0.05] bg-[#F4F4F5]">
        <div className="mx-auto grid max-w-[1280px] items-start gap-10 px-5 py-16 md:grid-cols-[0.95fr_1.05fr] md:gap-14 md:px-8 md:py-20 lg:py-24">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-[#8A8A90] uppercase">
              System storyboard
            </p>
            <h2 className="mt-3 font-serif text-[36px] leading-[1.06] md:text-[48px]">
              Sealed messaging.
              <br />
              Time-bound media.
              <br />
              Trusted local commerce.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#65656B]">
              Namaskaram is how you invite someone in. From there: sealed messaging and calls, Vybe
              stills that expire on purpose, and Hub stalls that stay inside the same trusted network.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {STORY_BEATS.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBeat(i);
                    setBeatPaused(true);
                  }}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[10px] tracking-[0.14em] uppercase transition duration-500",
                    i === beat
                      ? "bg-[#17171A] text-[#F7F7F8]"
                      : "bg-white/80 text-[#65656B] ring-1 ring-black/5",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Reserved height = longest beat body, so the right art stays pinned */}
            <div className="mt-7 h-[11.5rem] md:h-[12.5rem]">
              <p className="text-[11px] tracking-[0.2em] text-[#8A8A90] uppercase">
                Spec {String(beat + 1).padStart(2, "0")}
              </p>
              <h3
                key={activeBeat.id + "-t"}
                className="site-rise mt-2 font-serif text-[26px] leading-[1.15] md:text-[30px]"
              >
                {activeBeat.title}
              </h3>
              <p
                key={activeBeat.id + "-b"}
                className="site-fade mt-3 max-w-md text-[15px] leading-7 text-[#65656B]"
              >
                {activeBeat.body}
              </p>
            </div>
            {beatPaused ? (
              <button
                type="button"
                onClick={() => setBeatPaused(false)}
                className="mt-2 text-[11px] tracking-[0.14em] text-[#8A8A90] uppercase underline-offset-4 hover:text-[#17171A] hover:underline"
              >
                Resume tour
              </button>
            ) : (
              <p className="mt-2 text-[11px] tracking-[0.14em] text-[#A0A0A6] uppercase">
                Auto tour · tap a beat to pause
              </p>
            )}
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[380px] overflow-hidden rounded-[28px] bg-[#EBEBEC] shadow-[0_28px_70px_rgba(23,23,26,0.1)] ring-1 ring-black/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/niji-story.jpg"
                alt="Niji system storyboard"
                className="h-auto w-full object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 — NAMASKARAM QR */}
      <section id="namaskaram" className="border-t border-black/[0.05] bg-[#EBEBEC]">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:px-8 md:py-28 lg:gap-16">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-[#8A8A90] uppercase">Namaskaram paper</p>
            <h2 className="mt-3 font-serif text-[36px] leading-[1.06] md:text-[48px]">
              The portrait is presence.
              <br />
              The seal is the invitation.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-7 text-[#65656B]">
              The same chrome that greets you on first open becomes the seal on the paper you share.
              Namaskaram is a formal welcome — two arcs. On the share paper they sit inside a circuit
              QR that opens a live invite: your Niji ID, a Mist alias, or a Hub stall.
            </p>
            <ul className="mt-8 space-y-4 text-[14px] leading-6 text-[#65656B]">
              <li className="border-t border-black/[0.06] pt-4">
                <span className="font-medium text-[#17171A]">Niji ID</span> — your lasting handle on
                You and Vybe. Share it when you want to be found as yourself.
              </li>
              <li className="border-t border-black/[0.06] pt-4">
                <span className="font-medium text-[#17171A]">Mist</span> — a temporary name on the
                same paper. When the timer ends, it fades.
              </li>
              <li className="border-t border-black/[0.06] pt-4">
                <span className="font-medium text-[#17171A]">Hub stall</span> — invite someone into a
                shop using your Niji shop ID, still on sealed rails.
              </li>
            </ul>
          </div>
          <div className="mx-auto flex w-full max-w-[560px] items-end justify-center gap-3 sm:gap-5 md:max-w-[580px]">
            <div className="w-[46%] max-w-[255px] shrink-0 origin-bottom -rotate-6">
              <PhoneFrame src="/brand/niji-hold.jpg" alt="Niji first-open welcome" />
            </div>
            <div className="relative z-10 w-[46%] max-w-[255px] shrink-0 origin-bottom rotate-[3deg]">
              <PhoneFrame src="/invest/07-paper.png" alt="Namaskaram QR paper" />
            </div>
          </div>
        </div>
      </section>

      {/* 4 — FEATURES: copy left, one phone fixed on the right */}
      <section id="features" className="border-t border-black/[0.05] bg-[#F4F4F5]">
        <div className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-24">
          <p className="text-[11px] tracking-[0.28em] text-[#8A8A90] uppercase">Product features</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[36px] leading-[1.06] md:text-[48px]">
            Protocols worth learning.
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#65656B]">
            Mist, Seal, Ash, Sundown, A moon, Hold, Pass, Fade — a vocabulary of precise control.
            Each protocol appears in the same phone. The tour proceeds unhurried.
          </p>

          <div className="mt-10 flex flex-wrap gap-2">
            {FEATURES.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFeature(i);
                  setShowTech(false);
                  setFeaturePaused(true);
                }}
                className={cn(
                  "rounded-full px-3.5 py-2 text-[10px] tracking-[0.12em] uppercase transition-[background-color,color,box-shadow] duration-700 ease-in-out",
                  i === feature
                    ? "bg-[#17171A] text-[#F7F7F8]"
                    : "bg-white/80 text-[#65656B] ring-1 ring-black/5",
                )}
              >
                {f.title.split("·")[0]!.trim()}
              </button>
            ))}
          </div>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[1fr_280px] lg:gap-16">
            <div>
              <div
                className={cn("min-h-[16.5rem] site-copyfade md:min-h-[18rem]", copyOn ? "opacity-100" : "opacity-0")}
              >
                <p className="text-[11px] tracking-[0.2em] text-[#8A8A90] uppercase">
                  {copyFeature.room}
                </p>
                <h3 className="mt-2 font-serif text-[34px] leading-[1.1] md:text-[42px]">
                  {copyFeature.title}
                </h3>
                <p className="mt-3 text-[17px] leading-7 text-[#3A3A40]">{copyFeature.subtitle}</p>
                <p className="mt-5 max-w-lg text-[15px] leading-7 text-[#65656B]">{copyFeature.plain}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowTech((v) => !v)}
                className="mt-6 text-[11px] tracking-[0.16em] text-[#8A8A90] uppercase underline-offset-4 hover:text-[#17171A] hover:underline"
              >
                {showTech ? "Hide specification" : "Specification"}
              </button>
              {showTech ? (
                <p className="mt-3 max-w-lg text-[13px] leading-6 text-[#8A8A90]">
                  {activeFeature.technical}
                </p>
              ) : null}

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  disabled={feature === 0}
                  onClick={() => {
                    setFeature((f) => Math.max(0, f - 1));
                    setShowTech(false);
                    setFeaturePaused(true);
                  }}
                  className="rounded-full px-4 py-2 text-[11px] tracking-[0.14em] uppercase ring-1 ring-black/10 disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={feature === FEATURES.length - 1}
                  onClick={() => {
                    setFeature((f) => Math.min(FEATURES.length - 1, f + 1));
                    setShowTech(false);
                    setFeaturePaused(true);
                  }}
                  className="rounded-full bg-[#17171A] px-4 py-2 text-[11px] tracking-[0.14em] text-[#F7F7F8] uppercase disabled:opacity-30"
                >
                  Next
                </button>
              </div>
              {featurePaused ? (
                <button
                  type="button"
                  onClick={() => setFeaturePaused(false)}
                  className="mt-4 text-[11px] tracking-[0.14em] text-[#8A8A90] uppercase underline-offset-4 hover:text-[#17171A] hover:underline"
                >
                  Resume tour
                </button>
              ) : (
                <p className="mt-4 text-[11px] tracking-[0.14em] text-[#A0A0A6] uppercase">
                  Touring · select a protocol to pause
                </p>
              )}
            </div>

            <div className="mx-auto w-full max-w-[280px] lg:sticky lg:top-24 lg:mx-0 lg:w-[280px]">
              <FeaturePhone index={feature} />
            </div>
          </div>
        </div>
      </section>

      {/* Glossary strip — restored */}
      <section className="border-t border-black/[0.05] bg-[#EBEBEC] px-5 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-[1280px]">
          <p className="text-[11px] tracking-[0.28em] text-[#8A8A90] uppercase">Glossary</p>
          <h2 className="mt-3 font-serif text-[32px] md:text-[40px]">A vocabulary of restraint.</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Mist", "A name with a timer. When time ends, it fades."],
              ["Seal", "A four-digit lock on a thread."],
              ["Ash", "View-once paper — gone after they open it."],
              ["Sundown", "Clears by the end of the day."],
              ["A moon", "Kept for a lunar cycle."],
              ["Hold", "A still that stays private on your paper."],
              ["Pass", "Handed only to people you pick."],
              ["Fade", "On the feed for a day, then ash."],
              ["Namaskaram", "The greeting — and the invite seal."],
            ].map(([term, line]) => (
              <div key={term} className="border-t border-black/[0.08] pt-5">
                <p className="text-[13px] font-medium tracking-[0.06em] text-[#17171A]">{term}</p>
                <p className="mt-2 text-[14px] leading-6 text-[#65656B]">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17171A] px-5 py-24 text-[#F7F7F8] md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="font-serif text-[40px] leading-[1.08] md:text-[52px]">
              The client is invitation-only.
            </p>
            <p className="mt-5 text-[15px] leading-7 text-white/55">
              Enter with your provisioned number. Chat, Calls, Vybe, Hub, and You — one sealed
              surface.
            </p>
          </div>
          <Link
            href={loginHref}
            className="inline-flex shrink-0 rounded-full bg-white px-8 py-3.5 text-[13px] font-medium tracking-[0.14em] text-[#17171A] uppercase"
          >
            Enter
          </Link>
        </div>
      </section>

      <footer className="border-t border-black/[0.06] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 text-[12px] tracking-[0.12em] text-[#8A8A90] uppercase">
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/blades-mark.png"
              alt=""
              className="h-5 w-5 object-contain"
            />
            Niji · Own Your Vibe
          </span>
          <div className="flex gap-5">
            <Link href="/login?fresh=1" className="hover:text-[#17171A]">
              Login
            </Link>
            <Link href="/invest" className="hover:text-[#17171A]">
              Investors
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PhoneChrome({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-[36px] p-[9px] shadow-[0_28px_70px_rgba(23,23,26,0.14)]"
      style={{
        background: "linear-gradient(160deg, #2A2A2E 0%, #17171A 50%, #0E0E10 100%)",
      }}
    >
      <div className="relative overflow-hidden rounded-[28px] bg-[#EBEBEC]">{children}</div>
    </div>
  );
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <PhoneChrome>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-[9/19.5] w-full object-cover object-top" />
    </PhoneChrome>
  );
}

function FeaturePhone({ index }: { index: number }) {
  return (
    <PhoneChrome>
      {/* In-flow sizer so the chrome keeps a phone width while screens crossfade. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={FEATURES[0]!.screen}
        alt=""
        aria-hidden
        className="aspect-[9/19.5] w-full opacity-0"
      />
      {FEATURES.map((f, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={f.id}
          src={f.screen}
          alt={i === index ? f.title : ""}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-top site-crossfade",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </PhoneChrome>
  );
}
