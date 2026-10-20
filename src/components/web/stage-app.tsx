"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChatList } from "@/components/screens/chat-list";
import { ChatThread } from "@/components/screens/chat-thread";
import { ChatNew } from "@/components/screens/chat-new";
import { ChatNewGroup } from "@/components/screens/chat-new-group";
import { CallsScreen } from "@/components/screens/calls-screen";
import { CallsNew } from "@/components/screens/calls-new";
import { VybeScreen } from "@/components/screens/vybe-screen";
import { HubScreen, ShopDetail, SellScreen } from "@/components/screens/hub-screen";
import { AccountScreen } from "@/components/screens/account-screen";
import { CallScreen } from "@/components/call-screen";
import { NijiSeal } from "@/components/niji/niji-seal";
import {
  IconAccount,
  IconCalls,
  IconChat,
  IconHub,
  IconVybe,
} from "@/components/niji/icons";
import { useStore } from "@/lib/store";
import { nijiPaperUri } from "@/lib/niji-link";
import { cn } from "@/lib/utils";
import {
  WebNavProvider,
  useWebNav,
  type ChatPane,
  type HubPane,
  type CallsPane,
} from "@/components/web/web-nav";

type Room = "chat" | "calls" | "vybe" | "hub" | "you";

const ROOMS: {
  id: Room;
  label: string;
  whisper: string;
  Icon: (p: { className?: string }) => ReactNode;
}[] = [
  { id: "chat", label: "Chat", whisper: "Sealed transport", Icon: IconChat },
  { id: "calls", label: "Calls", whisper: "Voice & video", Icon: IconCalls },
  { id: "vybe", label: "Vybe", whisper: "Ephemeral signal", Icon: IconVybe },
  { id: "hub", label: "Hub", whisper: "Trusted stalls", Icon: IconHub },
  { id: "you", label: "You", whisper: "Identity & seal", Icon: IconAccount },
];

/** Desktop desk: icon rail + working canvas. Phone: single stage. */
export function StageApp() {
  return (
    <WebNavProvider>
      <StageShell />
    </WebNavProvider>
  );
}

/** @deprecated alias — prefer StageApp */
export const TriptychApp = StageApp;

function StageShell() {
  const { state } = useStore();
  const nav = useWebNav()!;
  const rooms = ROOMS.filter(
    (r) => (r.id !== "vybe" || state.vybeEnabled) && (r.id !== "hub" || state.hubEnabled),
  );
  const [room, setRoom] = useState<Room>(state.vybeEnabled ? "vybe" : "chat");

  useEffect(() => {
    try {
      sessionStorage.setItem("niji-incoming-demo", "1");
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (room === "vybe" && !state.vybeEnabled) setRoom("chat");
    if (room === "hub" && !state.hubEnabled) setRoom("chat");
  }, [room, state.vybeEnabled, state.hubEnabled]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "1") setRoom("chat");
      if (e.key === "2") setRoom("calls");
      if (e.key === "3" && state.vybeEnabled) setRoom("vybe");
      if (e.key === "4" && state.hubEnabled) setRoom("hub");
      if (e.key === "5") setRoom("you");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.vybeEnabled, state.hubEnabled]);

  const threadId = nav.chat.kind === "thread" ? nav.chat.id : null;
  useEffect(() => {
    if (threadId) setRoom("chat");
  }, [threadId]);

  const active = rooms.find((r) => r.id === room) ?? rooms[0]!;

  return (
    <div className="relative flex h-dvh overflow-hidden text-[#17171A]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 20% 0%, #F7F7F8 0%, #EBEBEC 50%, #E2E2E4 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "url(/brand/niji-mark.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />

      {/* Desktop icon rail — icons only */}
      <aside className="relative z-20 hidden w-[72px] shrink-0 flex-col items-center py-5 md:flex">
        <Link
          href="/"
          aria-label="Niji home"
          className="mb-8 grid size-11 place-items-center bg-transparent"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/blades-mark.png" alt="" className="h-8 w-8 object-contain" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {rooms.map((r) => {
            const Icon = r.Icon;
            const on = room === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-label={r.label}
                title={r.label}
                onClick={() => setRoom(r.id)}
                className={cn(
                  "group relative grid size-11 place-items-center rounded-full transition-colors duration-500",
                  on ? "text-[#F7F7F8]" : "text-[#65656B] hover:text-[#17171A]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute rounded-full transition-colors duration-500",
                    r.id === "vybe" ? "size-6" : "size-7",
                    on ? "bg-[#17171A]" : "bg-transparent group-hover:bg-white/55",
                  )}
                />
                <Icon className={cn("relative z-10", r.id === "vybe" ? "size-3.5" : "size-5")} />
              </button>
            );
          })}
        </nav>
        <p className="mt-auto max-w-[56px] text-center text-[8px] leading-3 tracking-[0.1em] text-[#9B9AA0] uppercase">
          {active.whisper}
        </p>
      </aside>

      {/* Mobile top bar */}
      <div className="absolute inset-x-0 top-0 z-30 flex h-12 items-center justify-between px-4 md:hidden">
        <Link href="/" aria-label="Niji home" className="grid size-9 place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/blades-mark.png" alt="" className="h-7 w-7 object-contain" />
        </Link>
        <Link href="/" className="text-[11px] tracking-[0.14em] text-[#8A8A90] uppercase">
          Site
        </Link>
      </div>

      {/* Working canvas — fills laptop width */}
      <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col px-0 pb-0 pt-12 md:px-4 md:pt-4 md:pb-4">
        <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-[#EBEBEC] md:rounded-[28px] md:shadow-[0_28px_90px_rgba(23,23,26,0.10)] md:ring-1 md:ring-black/[0.05]">
          <RoomPanel active={room === "chat"}>
            <ChatDesk pane={nav.chat} />
          </RoomPanel>
          <RoomPanel active={room === "calls"}>
            <CallsDesk pane={nav.calls} />
          </RoomPanel>
          <RoomPanel active={room === "vybe"}>
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[720px] flex-col overflow-hidden">
              <VybeScreen />
            </div>
          </RoomPanel>
          <RoomPanel active={room === "hub"}>
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[980px] flex-col overflow-hidden">
              <HubPane pane={nav.hub} />
            </div>
          </RoomPanel>
          <RoomPanel active={room === "you"}>
            <YouDesk />
          </RoomPanel>

          {state.call ? <CallScreen /> : null}
        </div>
      </main>

      {/* Mobile room switch — icons only */}
      <nav className="relative z-20 flex shrink-0 justify-around border-t border-black/[0.05] bg-[#EBEBEC]/95 px-1 py-1.5 backdrop-blur md:hidden">
        {rooms.map((r) => {
          const Icon = r.Icon;
          const on = room === r.id;
          return (
            <button
              key={r.id}
              type="button"
              aria-label={r.label}
              onClick={() => setRoom(r.id)}
              className={cn(
                "flex flex-1 items-center justify-center py-2",
                on ? "text-[#17171A]" : "text-[#9B9AA0]",
              )}
            >
              <Icon className="size-6" />
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function RoomPanel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex min-h-0 flex-col overflow-hidden transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        active
          ? "z-10 translate-y-0 opacity-100"
          : "pointer-events-none z-0 translate-y-2 opacity-0",
      )}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function ChatDesk({ pane }: { pane: ChatPane }) {
  return (
    <div className="grid h-full min-h-0 w-full md:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
      <div
        className={cn(
          "min-h-0 flex-col overflow-hidden border-r border-black/[0.05]",
          pane.kind === "list" ? "flex" : "hidden md:flex",
        )}
      >
        <ChatList />
      </div>
      <div
        className={cn(
          "min-h-0 flex-col overflow-hidden",
          pane.kind === "list" ? "hidden md:flex" : "flex",
        )}
      >
        {pane.kind === "list" ? <ChatIdle /> : <ChatPane pane={pane} />}
      </div>
    </div>
  );
}

function ChatIdle() {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center bg-[#F4F4F5] px-10 text-center">
      <p className="font-serif text-[32px] text-[#17171A]">Sealed line</p>
      <p className="mt-3 max-w-sm text-[14px] leading-6 text-[#8A8A90]">
        Trusted threads, Mist lanes, and Hub enquiries — select a conversation to open
        encrypted transport. Voice and video ride the same peer graph.
      </p>
    </div>
  );
}

function ChatPane({ pane }: { pane: ChatPane }) {
  if (pane.kind === "thread") return <ChatThread id={pane.id} />;
  if (pane.kind === "new") return <ChatNew />;
  if (pane.kind === "new-group") return <ChatNewGroup />;
  return <ChatList />;
}

function CallsDesk({ pane }: { pane: CallsPane }) {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[720px] flex-col overflow-hidden">
      {pane.kind === "new" ? <CallsNew /> : <CallsScreen />}
    </div>
  );
}

function YouDesk() {
  const { me } = useStore();
  return (
    <div className="grid h-full min-h-0 w-full lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
      <div className="relative flex min-h-0 flex-col overflow-hidden border-r border-black/[0.05]">
        <div className="border-b border-black/[0.05] px-5 py-4">
          <p className="font-serif text-[24px]">You</p>
          <p className="mt-1 text-[13px] text-[#8A8A90]">
            Main account, presence, seal, and Namaskaram paper.
          </p>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <AccountScreen />
        </div>
      </div>
      <div className="relative hidden min-h-0 overflow-hidden bg-[#F4F4F5] lg:flex lg:flex-col lg:items-center lg:justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/niji-mark.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-multiply"
        />
        <div className="relative flex w-full max-w-[380px] flex-col items-center px-8 py-10 text-center">
          <p className="text-[11px] tracking-[0.22em] text-[#8A8A90] uppercase">Namaskaram</p>
          <p className="mt-2 font-serif text-[28px] text-[#17171A]">Welcome seal</p>
          <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#65656B]">
            The chrome arcs are Namaskaram — a positive greeting. On this paper they become the
            invite QR that opens your Niji ID.
          </p>
          <div className="mt-6 rounded-[28px] bg-white/70 p-4 shadow-[0_20px_50px_rgba(23,23,26,0.08)] ring-1 ring-black/[0.04]">
            <NijiSeal value={nijiPaperUri(me.nijiId)} size={240} />
          </div>
          <p className="mt-4 font-serif text-[22px] text-[#17171A]">{me.name}</p>
          <p className="mt-1 font-mono text-[13px] tracking-wide text-[#65656B]">{me.nijiId}</p>
          <p className="mt-3 text-[12px] text-[#8A8A90]">
            Tap the QR mark in your account header for the full share paper.
          </p>
        </div>
      </div>
    </div>
  );
}

function HubPane({ pane }: { pane: HubPane }) {
  if (pane.kind === "shop") return <ShopDetail id={pane.id} />;
  if (pane.kind === "sell") {
    return (
      <Suspense fallback={<div className="bg-paper min-h-0 flex-1" />}>
        <SellScreen shopId={pane.shopId} />
      </Suspense>
    );
  }
  return <HubScreen />;
}
