"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  SceneAsh,
  SceneBleed,
  SceneCalls,
  SceneChat,
  SceneComments,
  SceneDual,
  SceneEnd,
  SceneGate,
  SceneHub,
  SceneLater,
  SceneLockup,
  SceneMark,
  SceneMarks,
  SceneMist,
  ScenePaper,
  SceneStatus,
  SceneTabs,
  SceneThread,
  SceneTitle,
  SceneVybe,
  SceneYou,
} from "@/components/pitch/scenes";

type Shot = {
  id: string;
  dwell: number;
  cut: "hard" | "soft";
  caption?: string;
  Scene: () => ReactNode;
};

const SHOTS: Shot[] = [
  {
    id: "mountain",
    dwell: 4800,
    cut: "soft",
    caption: "The mountain is the floor.",
    Scene: () => <SceneBleed src="/brand/niji-story.jpg" motion="rise" />,
  },
  {
    id: "handshake",
    dwell: 3200,
    cut: "hard",
    caption: "Trust is a gate.",
    Scene: () => <SceneBleed src="/brand/niji-story.jpg" motion="hold" />,
  },
  { id: "lockup", dwell: 3800, cut: "soft", caption: "Chrome on circuit.", Scene: SceneLockup },
  { id: "gate", dwell: 2800, cut: "hard", caption: "Touch the well.", Scene: SceneGate },
  { id: "mark", dwell: 2600, cut: "hard", Scene: SceneMark },
  { id: "vybe", dwell: 4200, cut: "soft", caption: "Land on Vybe.", Scene: SceneVybe },
  { id: "tabs", dwell: 2800, cut: "hard", caption: "Calls. Chat. Vybe. Hub. You.", Scene: SceneTabs },
  { id: "chat", dwell: 4000, cut: "hard", caption: "A rail for status. A row for the thread.", Scene: SceneChat },
  { id: "status", dwell: 4000, cut: "soft", caption: "Face top-left. The line in the centre.", Scene: SceneStatus },
  { id: "thread", dwell: 3600, cut: "hard", caption: "Copy a line. Never forward.", Scene: SceneThread },
  { id: "ash", dwell: 3200, cut: "hard", caption: "Ash looks once.", Scene: SceneAsh },
  { id: "mist", dwell: 3600, cut: "hard", caption: "A temp ID. Not a legal name.", Scene: SceneMist },
  { id: "later", dwell: 3000, cut: "hard", caption: "Park it. It still sits in chat.", Scene: SceneLater },
  { id: "comments", dwell: 3200, cut: "hard", caption: "The stack lives behind the mark.", Scene: SceneComments },
  { id: "hub", dwell: 3400, cut: "hard", caption: "A stall. Not a mall.", Scene: SceneHub },
  { id: "paper", dwell: 4200, cut: "soft", caption: "The seal opens Niji.", Scene: ScenePaper },
  { id: "you", dwell: 3000, cut: "hard", caption: "Around. Quiet. Ghost.", Scene: SceneYou },
  { id: "calls", dwell: 2600, cut: "hard", Scene: SceneCalls },
  { id: "marks", dwell: 3200, cut: "soft", caption: "The old marks. They do not get redrawn.", Scene: SceneMarks },
  { id: "dual", dwell: 4000, cut: "hard", caption: "A line that leaves this pocket.", Scene: SceneDual },
  { id: "title", dwell: 3800, cut: "soft", Scene: SceneTitle },
  { id: "end", dwell: 4800, cut: "soft", caption: "Own Your Vibe.", Scene: SceneEnd },
];

export function CinematicTrailer({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const shot = SHOTS[i] ?? SHOTS[0];

  const go = useCallback((next: number) => {
    if (next >= SHOTS.length) {
      setPlaying(false);
      setDone(true);
      setI(SHOTS.length - 1);
      return;
    }
    setDone(false);
    setI(Math.max(0, next));
  }, []);

  useEffect(() => {
    if (!playing || done) return;
    const t = window.setTimeout(() => go(i + 1), shot.dwell);
    return () => window.clearTimeout(t);
  }, [playing, done, i, shot.dwell, go]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDone();
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        if (event.repeat) return;
        if (done) {
          setI(0);
          setDone(false);
          setPlaying(true);
          return;
        }
        setPlaying((p) => !p);
      }
      if (event.key === "ArrowRight") go(i + 1);
      if (event.key === "ArrowLeft") go(i - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, go, i, onDone]);

  return (
    <div
      className="fixed inset-0 z-[90] min-h-dvh w-full bg-[#111] text-[#F7F7F8]"
      onClick={() => {
        if (done) return;
        go(i + 1);
      }}
    >
      <div className="absolute inset-0 min-h-dvh overflow-hidden">
        <div key={shot.id} className={`absolute inset-0 min-h-dvh ${shot.cut === "soft" ? "trailer-fade" : ""}`}>
          {shot.Scene()}
        </div>
        <div
          className="trailer-grain pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")",
            backgroundSize: "180px 180px",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      {shot.caption && !done ? (
        <p className="trailer-title pointer-events-none absolute inset-x-0 bottom-16 z-10 text-center font-serif text-[18px] text-white/90 italic md:text-[22px]">
          {shot.caption}
        </p>
      ) : null}

      {done ? (
        <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-[#F7F7F8] px-4 py-2 text-[11px] tracking-[0.16em] text-[#17171A] uppercase"
            onClick={(e) => {
              e.stopPropagation();
              setI(0);
              setDone(false);
              setPlaying(true);
            }}
          >
            Replay
          </button>
          <button
            type="button"
            className="rounded-full bg-white/15 px-4 py-2 text-[11px] tracking-[0.16em] text-white uppercase"
            onClick={(e) => {
              e.stopPropagation();
              onDone();
            }}
          >
            Paper
          </button>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-10 bottom-6 z-10 h-px bg-white/15">
          <div
            className="h-px bg-white/80"
            style={{ width: `${((i + (playing ? 0.35 : 0)) / SHOTS.length) * 100}%` }}
          />
        </div>
      )}

      <div className="absolute top-5 left-6 z-20 flex items-center gap-3">
        <p className="text-[10px] tracking-[0.22em] text-white/50 uppercase">Niji · Trailer</p>
        <button
          type="button"
          className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] tracking-[0.14em] text-white/80 uppercase"
          onClick={(e) => {
            e.stopPropagation();
            if (done) {
              setI(0);
              setDone(false);
              setPlaying(true);
              return;
            }
            setPlaying((p) => !p);
          }}
        >
          {done ? "Replay" : playing ? "Pause" : "Play"}
        </button>
      </div>
      <div className="absolute top-5 right-6 z-20 flex items-center gap-4">
        <Link
          href="/"
          className="text-[10px] tracking-[0.16em] text-white/50 uppercase hover:text-white"
          onClick={(e) => e.stopPropagation()}
        >
          Site
        </Link>
        <button
          type="button"
          className="text-[10px] tracking-[0.16em] text-white/50 uppercase hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onDone();
          }}
        >
          Paper
        </button>
      </div>
    </div>
  );
}
