"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "story" | "lockup" | "fade";

const STORY_MS = 2000;
const LOCKUP_MIN_MS = 180;
const LOCKUP_AUTO_MS = 1500;
const TAP_DEBOUNCE_MS = 280;
const FADE_MS = 200;

export function CinematicIntro({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("story");
  const lastTap = useRef(0);
  const lockupAt = useRef(0);
  const phaseRef = useRef<Phase>("story");

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (phase !== "story") return;
    const t = window.setTimeout(() => {
      lockupAt.current = Date.now();
      setPhase("lockup");
    }, STORY_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "lockup") return;
    if (!lockupAt.current) lockupAt.current = Date.now();
    const t = window.setTimeout(() => setPhase("fade"), LOCKUP_AUTO_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => onDone(), FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase, onDone]);

  function goNext() {
    const now = Date.now();
    if (now - lastTap.current < TAP_DEBOUNCE_MS) return;
    lastTap.current = now;
    if (phaseRef.current === "story") {
      lockupAt.current = Date.now();
      setPhase("lockup");
      return;
    }
    if (phaseRef.current === "lockup") {
      if (now < lockupAt.current + LOCKUP_MIN_MS) return;
      setPhase("fade");
    }
  }

  return (
    <div
      className="bg-paper fixed inset-0 z-50 overflow-hidden select-none"
      style={{ touchAction: "manipulation" }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        goNext();
      }}
      role="presentation"
    >
      {phase === "story" && (
        <div className="bg-paper pointer-events-none absolute inset-0 overflow-hidden">
          {/* Flush to the top; scale past the viewport so mountain soles sit
              on the floor and the empty paper under the range is cropped. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/niji-story.jpg"
            alt=""
            className="absolute top-0 left-1/2 w-auto max-w-none -translate-x-1/2 object-cover object-top"
            style={{ height: "105.485%" }}
          />
        </div>
      )}

      {(phase === "lockup" || phase === "fade") && (
        <div
          className={`bg-paper pointer-events-none absolute inset-0 overflow-hidden ${
            phase === "fade" ? "animate-lockup-out" : ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/niji-hold.jpg"
            alt="Niji"
            className="animate-lockup-open absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
