"use client";

import type { ReactNode } from "react";
import { Person } from "@/components/niji/person";
import { Groove, Raised } from "@/components/niji/chrome";
import { MoodWash, moodInk } from "@/components/niji/moods";
import { NijiSeal } from "@/components/niji/niji-seal";
import {
  IconAccount,
  IconBell,
  IconCalls,
  IconChat,
  IconComment,
  IconExplore,
  IconHome,
  IconHub,
  IconHubChat,
  IconLater,
  IconMist,
  IconPlus,
  IconRipple,
  IconStar,
  IconVybe,
  IconVybeChat,
  Namaskaram,
} from "@/components/niji/icons";
type FaceUser = { name: string; emoji: string; photo: string; online: boolean; verified: boolean };

const PRIYA: FaceUser = {
  name: "Priya Sharma",
  emoji: "😊",
  photo: "/media/avatars/priya.jpg",
  online: true,
  verified: true,
};

const ME: FaceUser = {
  name: "Aditya Kumar",
  emoji: "🙂",
  photo: "/media/avatars/aiden.jpg",
  online: true,
  verified: false,
};

const ANANYA: FaceUser = {
  name: "Ananya Reddy",
  emoji: "🌸",
  photo: "/media/avatars/maya.jpg",
  online: true,
  verified: false,
};

const RAHUL: FaceUser = {
  name: "Rahul Kumar",
  emoji: "😎",
  photo: "/media/avatars/jordan.jpg",
  online: false,
  verified: true,
};

const DIYA: FaceUser = {
  name: "Diya Nair",
  emoji: "🌙",
  photo: "/media/avatars/hana.jpg",
  online: true,
  verified: false,
};

function Face({ user, size = "sm", story, pulse, around }: { user: FaceUser; size?: "sm" | "md"; story?: boolean; pulse?: boolean; around?: boolean }) {
  return <Person user={user} size={size} story={story} pulse={pulse} around={around} place={story ? undefined : "chat"} />;
}

export function Phone({
  children,
  push,
  dark,
}: {
  children: ReactNode;
  push?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={`trailer-phone-in relative ${push ? "trailer-phone-push" : ""}`}>
      <div
        className="relative overflow-hidden rounded-[42px]"
        style={{
          width: 292,
          height: 600,
          background: dark ? "#111" : "#EBEBEC",
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.18), 0 0 0 9px #17171A, 0 40px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div className="absolute top-2.5 left-1/2 z-20 h-5 w-[88px] -translate-x-1/2 rounded-full bg-[#17171A]" />
        <div className="absolute inset-0 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function Tabs({ active }: { active: "calls" | "chat" | "vybe" | "hub" | "you" }) {
  const items = [
    { id: "calls", Icon: IconCalls },
    { id: "chat", Icon: IconChat },
    { id: "vybe", Icon: IconVybe },
    { id: "hub", Icon: IconHub },
    { id: "you", Icon: IconAccount },
  ] as const;
  return (
    <nav className="grid grid-cols-5 bg-paper">
      {items.map(({ id, Icon }) => (
        <span
          key={id}
          className={`relative grid place-items-center py-2.5 ${id === active ? "text-[#17171A]" : "text-[#BFBEC3]"}`}
        >
          <Icon className="size-6" />
          {id === "chat" && active !== "chat" ? (
            <span className="absolute top-2 right-4 size-1.5 rounded-full bg-[#FF9933]" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}

function ChatChrome({ active }: { active: "trusted" | "hub" | "mist" | "later" }) {
  const items = [
    { id: "trusted", Icon: IconChat },
    { id: "hub", Icon: IconHubChat },
    { id: "mist", Icon: IconMist },
    { id: "later", Icon: IconLater },
  ] as const;
  return (
    <header className="grid grid-cols-5 items-center px-1 pt-8 pb-1">
      <span className="grid place-items-center py-2 text-[#17171A]">
        <IconPlus className="size-6" />
      </span>
      {items.map(({ id, Icon }) => (
        <span key={id} className={`grid place-items-center py-2 ${id === active ? "text-[#17171A]" : "text-[#BFBEC3]"}`}>
          <Icon className="size-6" />
        </span>
      ))}
    </header>
  );
}

function Row({ user, title, line, bold, around }: { user?: FaceUser; title: string; line: string; bold?: boolean; around?: boolean }) {
  return (
    <Raised className="mb-2 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        {user ? <Face user={user} around={around} /> : <span className="grid size-9 place-items-center rounded-full bg-[#E1E1E3] text-sm">🌊</span>}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[14px] ${bold ? "font-bold" : "font-medium"} text-[#17171A]`}>{title}</p>
          <p className={`truncate text-[12px] ${bold ? "font-medium text-[#17171A]" : "text-[#65656B]"}`}>{line}</p>
        </div>
      </div>
    </Raised>
  );
}

export function SceneBleed({ src, motion }: { src: string; motion: "rise" | "hold" | "mark" }) {
  const cls = motion === "rise" ? "trailer-kb-rise" : motion === "mark" ? "trailer-kb-mark" : "trailer-kb-hold";
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className={`absolute top-0 left-1/2 w-auto max-w-none -translate-x-1/2 ${cls}`} style={{ height: "118%" }} />
    </div>
  );
}

export function SceneLockup() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/niji-hold.jpg" alt="Niji" className="trailer-kb-hold absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function SceneGate() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/niji-gate.jpg" alt="" className="trailer-kb-hold absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function SceneMark() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/niji-mark.jpg" alt="" className="trailer-kb-mark absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function SceneVybe() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone push>
        <div className="flex h-full flex-col bg-paper">
          <header className="flex items-center px-2 pt-8 pb-1">
            <span className="grid w-10 place-items-center py-2">
              <IconPlus className="size-6" />
            </span>
            <div className="grid min-w-0 flex-1 grid-cols-4 text-[#BFBEC3]">
              <span className="grid place-items-center py-2 text-[#17171A]">
                <IconHome className="size-6" />
              </span>
              <span className="grid place-items-center py-2">
                <IconExplore className="size-6" />
              </span>
              <span className="grid place-items-center py-2">
                <IconVybeChat className="size-6" />
              </span>
              <span className="grid place-items-center py-2">
                <IconAccount className="size-6" />
              </span>
            </div>
            <span className="relative grid w-10 place-items-center py-2">
              <IconBell className="size-6" />
              <span className="absolute top-2 right-1.5 size-1.5 rounded-full bg-[#FF9933]" />
            </span>
          </header>
          <div className="min-h-0 flex-1 overflow-hidden px-3.5">
            <div className="mb-3 flex gap-3 pt-1">
              <div className="flex w-11 flex-col items-center">
                <span className="relative">
                  <Face user={ME} story />
                  <span className="absolute right-0 bottom-0 grid size-3.5 place-items-center rounded-full bg-[#17171A] text-[8px] text-white">
                    +
                  </span>
                </span>
                <span className="mt-1 text-[9px] text-[#9B9AA0]">You</span>
              </div>
              {[PRIYA, ANANYA, RAHUL].map((u) => (
                <div key={u.name} className="flex w-11 flex-col items-center">
                  <Face user={u} story pulse={u === PRIYA} />
                  <span className="mt-1 truncate text-[9px] text-[#9B9AA0]">{u.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>
            <Raised className="overflow-hidden px-3 py-3">
              <div className="mb-2.5 flex items-center gap-2.5">
                <Face user={PRIYA} />
                <div>
                  <p className="flex items-center gap-1 text-[13px] font-medium">
                    Priya Sharma
                    <Namaskaram className="size-3.5 text-[#C0C0C4]" />
                  </p>
                  <p className="text-[10px] text-[#9B9AA0]">Mumbai · 40m</p>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/posts/night-city.jpg" alt="" className="aspect-[4/5] w-full rounded-[14px] object-cover" />
              <p className="mt-2 text-[13px] leading-5 text-[#65656B]">First rain. Marine Drive is a river.</p>
              <div className="mt-2.5 flex items-center gap-4 text-[#9B9AA0]">
                <IconStar className="size-5" />
                <IconComment heavy className="size-5 text-[#17171A]" />
                <IconRipple className="size-5" />
              </div>
            </Raised>
          </div>
          <Tabs active="vybe" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneTabs() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone push>
        <div className="flex h-full flex-col justify-end bg-paper">
          <div className="flex-1" />
          <Tabs active="vybe" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneChat() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <ChatChrome active="trusted" />
          <div className="min-h-0 flex-1 overflow-hidden px-3.5">
            <div className="mb-2 flex gap-2.5 overflow-hidden pt-1">
              <div className="flex w-11 shrink-0 flex-col items-center">
                <span className="relative">
                  <Face user={ME} story />
                  <span className="absolute right-0 bottom-0 grid size-3.5 place-items-center rounded-full bg-[#17171A] text-[8px] text-white">
                    +
                  </span>
                </span>
                <span className="mt-1 text-[9px] text-[#9B9AA0]">You</span>
              </div>
              <div className="flex w-11 shrink-0 flex-col items-center">
                <Face user={RAHUL} story pulse />
                <span className="mt-1 text-[9px] text-[#9B9AA0]">Rahul</span>
              </div>
              <div className="flex w-11 shrink-0 flex-col items-center">
                <Face user={ANANYA} story pulse />
                <span className="mt-1 text-[9px] text-[#9B9AA0]">Ananya</span>
              </div>
              <div className="flex w-11 shrink-0 flex-col items-center">
                <Face user={DIYA} story />
                <span className="mt-1 text-[9px] text-[#9B9AA0]">Diya</span>
              </div>
            </div>
            <Row user={ME} title="Me" line="Pocket" />
            <Row user={PRIYA} title="Priya Sharma" line="In Bandra till late." around bold />
            <Row user={RAHUL} title="Rahul Kumar" line="Sent you a reel." bold />
            <Row user={ANANYA} title="Ananya Reddy" line="Active now" around />
          </div>
          <Tabs active="chat" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneStatus() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#EBEBEC]">
      <MoodWash id="energy" />
      <div className="absolute top-16 left-8 z-10 flex items-center gap-3">
        <Face user={ME} />
        <p className="text-[15px] font-medium" style={{ color: moodInk("energy") }}>
          You
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-12">
        <p className="max-w-lg text-center font-serif text-[40px] leading-tight md:text-[52px]" style={{ color: moodInk("energy") }}>
          In Bandra till late. Ping if you&apos;re close.
        </p>
      </div>
    </div>
  );
}

export function SceneThread() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <header className="flex items-center gap-2 px-3 pt-8 pb-2">
            <span className="text-[20px] text-[#65656B]">‹</span>
            <Face user={PRIYA} around />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium">Priya Sharma</p>
              <p className="text-[11px] text-[#9B9AA0]">Active now</p>
            </div>
          </header>
          <div className="min-h-0 flex-1 space-y-2 px-3.5 pt-4">
            <div className="mr-10 rounded-[18px] bg-[#F7F7F8] px-3.5 py-2.5 text-[14px] leading-5">First rain. Come out.</div>
            <div className="ml-10 rounded-[18px] bg-[#17171A] px-3.5 py-2.5 text-[14px] leading-5 text-[#F7F7F8]">
              On the way. No forwards.
            </div>
            <div className="mr-10 rounded-[18px] bg-[#F7F7F8] px-3.5 py-2.5 text-[14px] leading-5">Copied. Paste it yourself.</div>
          </div>
          <div className="px-3 pb-3">
            <Groove className="flex h-11 items-center">
              <p className="text-[14px] text-[#BFBEC3]">Message</p>
            </Groove>
          </div>
        </div>
      </Phone>
    </div>
  );
}

export function SceneAsh() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone dark>
        <div className="flex h-full flex-col justify-end bg-[#111] p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/posts/concert.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="relative z-10 pb-6">
            <p className="text-[11px] tracking-[0.2em] text-white/60 uppercase">Ash</p>
            <p className="mt-2 font-serif text-[28px] leading-snug text-white">Look once. Then it is gone.</p>
            <p className="mt-3 text-[13px] text-white/70">This paper noticed a capture.</p>
          </div>
        </div>
      </Phone>
    </div>
  );
}

export function SceneMist() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <ChatChrome active="mist" />
          <div className="px-4 pt-3">
            <p className="text-center text-[11px] tracking-[0.18em] text-[#9B9AA0] uppercase">A name that fades</p>
            <Raised className="mt-4 px-4 py-5">
              <p className="text-center font-serif text-[28px] text-[#17171A]">priya-482</p>
              <p className="mt-1 text-center text-[12px] text-[#65656B]">Preferred first. A number we add. Not a legal name.</p>
              <div className="mx-auto mt-4 w-fit scale-75">
                <NijiSeal value="niji:///mist/priya-482" size={180} />
              </div>
            </Raised>
          </div>
          <div className="flex-1" />
          <Tabs active="chat" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneLater() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <ChatChrome active="later" />
          <div className="px-3.5 pt-3">
            <Raised className="px-3.5 py-3">
              <p className="text-[11px] tracking-[0.16em] text-[#9B9AA0] uppercase">Parked</p>
              <p className="mt-2 text-[15px] text-[#17171A]">Tell her the table is at 9.</p>
              <p className="mt-1 text-[12px] text-[#65656B]">Leaves tonight · then sits in that chat.</p>
            </Raised>
            <Raised className="mt-2 px-3.5 py-3">
              <p className="text-[11px] tracking-[0.16em] text-[#9B9AA0] uppercase">Sent · in chat</p>
              <p className="mt-2 text-[15px] text-[#17171A]">The still from last monsoon.</p>
            </Raised>
          </div>
          <div className="flex-1" />
          <Tabs active="chat" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneComments() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="relative flex h-full flex-col bg-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/posts/night-city.jpg" alt="" className="h-[46%] w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] px-4 pt-4 pb-5">
            <p className="text-center text-[11px] tracking-[0.18em] text-[#9B9AA0] uppercase">Comments</p>
            <p className="mt-3 text-[14px] leading-5">
              <span className="font-medium">Ananya Reddy</span> This is incredible.
            </p>
            <div className="mt-2 space-y-2 border-l border-black/10 pl-3">
              <p className="text-[14px] leading-5">
                <span className="font-medium">Rahul Kumar</span> Totally agree.
              </p>
              <p className="text-[14px] leading-5">
                <span className="font-medium">Diya Nair</span> First rain of the year.
              </p>
            </div>
            <Groove className="mt-4 flex h-10 items-center">
              <p className="text-[13px] text-[#BFBEC3]">Add a comment...</p>
            </Groove>
          </div>
        </div>
      </Phone>
    </div>
  );
}

export function SceneHub() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <header className="flex items-center justify-between px-4 pt-8 pb-2">
            <p className="text-[18px] font-semibold">Hub</p>
            <IconPlus className="size-6" />
          </header>
          <div className="px-3.5">
            <Raised className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/posts/food.jpg" alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="px-3.5 py-3">
                <p className="text-[15px] font-medium">Sunday Tiffin</p>
                <p className="text-[12px] text-[#65656B]">Bandra · papers on the stall · not a mall</p>
              </div>
            </Raised>
            <Raised className="mt-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/posts/workshop.jpg" alt="" className="aspect-[16/9] w-full object-cover" />
              <div className="px-3.5 py-3">
                <p className="text-[15px] font-medium">Kala Studio</p>
                <p className="text-[12px] text-[#65656B]">Rank from visits. Not an ad bid.</p>
              </div>
            </Raised>
          </div>
          <div className="flex-1" />
          <Tabs active="hub" />
        </div>
      </Phone>
    </div>
  );
}

export function ScenePaper() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/niji-story.jpg"
        alt=""
        className="trailer-kb-rise absolute top-0 left-1/2 w-auto max-w-none -translate-x-1/2"
        style={{ height: "118%" }}
      />
      <div className="absolute inset-x-0 bottom-16 flex justify-center px-8">
        <div
          className="w-full max-w-sm rounded-[24px] px-5 py-6"
          style={{
            background: "rgba(235,235,236,0.5)",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <p className="text-center text-[12px] text-[#65656B]">A seal that finds Aditya.</p>
          <div className="mx-auto mt-3 w-fit">
            <NijiSeal value="niji:///id/njadit3241" size={180} />
          </div>
          <p className="mt-3 text-center text-[15px] font-medium tracking-wide text-[#17171A]">njadit3241</p>
        </div>
      </div>
    </div>
  );
}

export function SceneYou() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper px-4 pt-10">
          <div className="flex flex-col items-center">
            <Face user={ME} size="md" />
            <p className="mt-3 text-[18px] font-semibold">Aditya Kumar</p>
            <p className="text-[13px] text-[#65656B]">njadit3241</p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { id: "Around", on: true },
              { id: "Quiet", on: false },
              { id: "Ghost", on: false },
            ].map((p) => (
              <div
                key={p.id}
                className={`rounded-2xl py-3 text-center text-[13px] ${p.on ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#F7F7F8] text-[#65656B]"}`}
              >
                {p.id}
              </div>
            ))}
          </div>
          <Raised className="mt-4 px-4 py-3">
            <p className="text-[14px] text-[#17171A]">Share Niji paper</p>
            <p className="text-[12px] text-[#65656B]">The mountain. The seal. The invite.</p>
          </Raised>
          <div className="flex-1" />
          <Tabs active="you" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneCalls() {
  return (
    <div className="flex h-full items-center justify-center">
      <Phone>
        <div className="flex h-full flex-col bg-paper">
          <header className="px-4 pt-8 pb-3">
            <p className="text-[18px] font-semibold">Calls</p>
          </header>
          <div className="px-3.5">
            <Raised className="mb-2 px-3 py-3">
              <div className="flex items-center gap-3">
                <Face user={PRIYA} around />
                <div className="flex-1">
                  <p className="text-[14px] font-medium">Priya Sharma</p>
                  <p className="text-[12px] text-[#65656B]">Video · 4m</p>
                </div>
                <IconCalls className="size-5 text-[#9B9AA0]" />
              </div>
            </Raised>
            <Raised className="px-3 py-3">
              <div className="flex items-center gap-3">
                <Face user={RAHUL} />
                <div className="flex-1">
                  <p className="text-[14px] font-medium">Rahul Kumar</p>
                  <p className="text-[12px] text-[#65656B]">Voice · missed</p>
                </div>
                <IconCalls className="size-5 text-[#9B9AA0]" />
              </div>
            </Raised>
          </div>
          <div className="flex-1" />
          <Tabs active="calls" />
        </div>
      </Phone>
    </div>
  );
}

export function SceneMarks() {
  const marks = [
    { Icon: IconCalls, name: "Calls" },
    { Icon: IconChat, name: "Chat" },
    { Icon: IconVybe, name: "Vybe" },
    { Icon: IconHub, name: "Hub" },
    { Icon: IconMist, name: "Mist" },
    { Icon: IconLater, name: "Later" },
    { Icon: IconHome, name: "Feed" },
    { Icon: IconExplore, name: "Explore" },
    { Icon: Namaskaram, name: "Namaskaram" },
  ];
  return (
    <div className="flex h-full items-center justify-center bg-paper px-8">
      <div className="grid w-full max-w-lg grid-cols-3 gap-5">
        {marks.map(({ Icon, name }) => (
          <div key={name} className="flex flex-col items-center gap-2">
            <span className="grid size-16 place-items-center rounded-[22px] bg-[#F7F7F8] text-[#17171A] shadow-[0_4px_10px_rgba(25,25,34,0.07)]">
              <Icon className="size-8" />
            </span>
            <p className="text-[11px] tracking-[0.14em] text-[#9B9AA0] uppercase">{name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SceneDual() {
  return (
    <div className="flex h-full items-center justify-center gap-6 px-6">
      <div className="origin-bottom scale-[0.78] md:scale-90">
        <Phone>
          <div className="flex h-full flex-col bg-paper">
            <header className="flex items-center gap-2 px-3 pt-8 pb-2">
              <Face user={ME} />
              <p className="text-[15px] font-medium">Aditya</p>
            </header>
            <div className="flex-1 px-3.5 pt-8">
              <div className="ml-8 rounded-[18px] bg-[#17171A] px-3.5 py-2.5 text-[14px] text-[#F7F7F8]">On the way.</div>
            </div>
          </div>
        </Phone>
      </div>
      <div className="origin-bottom scale-[0.78] md:scale-90">
        <Phone>
          <div className="flex h-full flex-col bg-paper">
            <header className="flex items-center gap-2 px-3 pt-8 pb-2">
              <Face user={PRIYA} around />
              <p className="text-[15px] font-medium">Priya</p>
            </header>
            <div className="flex-1 px-3.5 pt-8">
              <div className="mr-8 rounded-[18px] bg-[#F7F7F8] px-3.5 py-2.5 text-[14px]">On the way.</div>
            </div>
          </div>
        </Phone>
      </div>
    </div>
  );
}

export function SceneTitle() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-paper">
      <p className="trailer-title text-[11px] tracking-[0.28em] text-[#9B9AA0] uppercase">Niji</p>
      <p className="trailer-title mt-4 font-serif text-[48px] leading-none text-[#17171A] italic md:text-[72px]">Own Your Vibe.</p>
    </div>
  );
}

export function SceneEnd() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/niji-hold.jpg" alt="Niji" className="trailer-kb-hold absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
