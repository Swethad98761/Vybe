"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { canReshareStatus, lookedBy, lookedCopy, statusesFor, statusViewMs, visibleStatusesFor } from "@/lib/presence";
import { MoodWash, moodInk } from "@/components/niji/moods";
import { Person } from "@/components/niji/person";
import type { ChatStatus } from "@/lib/types";
import { useShellOverlay } from "@/components/web/shell-overlay";

export function StatusViewer({
  authorId,
  lane,
  onClose,
  onReshare,
}: {
  authorId: string;
  lane?: "chat" | "vybe";
  onClose: () => void;
  onReshare?: (item: ChatStatus) => void;
}) {
  const { state, me, userById, viewStatus } = useStore();
  const items =
    lane === "vybe"
      ? visibleStatusesFor(authorId, state.statuses, lane, me.id, state.following)
      : statusesFor(authorId, state.statuses, lane);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [looks, setLooks] = useState(false);
  const author = userById(authorId);
  const item = items[i];
  const overlay = useShellOverlay("z-[70] bg-black text-white");
  const marked = useRef(new Set<string>());
  const gest = useRef<{ x: number; y: number; t: number } | null>(null);
  const dwell = item ? statusViewMs(item) : 8000;
  const mine = authorId === me.id;
  const looksIds = item ? lookedBy(item) : [];
  const lookNames = looksIds.map((id) => userById(id)?.name).filter((n): n is string => Boolean(n));
  const from = item?.resharedFromAuthorId ? userById(item.resharedFromAuthorId) : undefined;

  useEffect(() => {
    if (!item || mine || marked.current.has(item.id) || item.viewedBy.includes(me.id)) return;
    marked.current.add(item.id);
    viewStatus(item.id);
  }, [item, me.id, mine, viewStatus]);

  useEffect(() => {
    if (!item || paused || looks || mine) return;
    const t = window.setTimeout(() => {
      goNext();
    }, dwell);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, i, items.length, dwell, paused, looks, onClose]);

  function goNext() {
    if (i >= items.length - 1) onClose();
    else setI((n) => n + 1);
  }

  function goPrev() {
    if (i <= 0) onClose();
    else setI((n) => n - 1);
  }

  if (!item || !author) return null;
  const still = item.image;
  const line = item.text;
  const share = Boolean(onReshare && canReshareStatus(item, me.id, state.following));

  const finishGest = (e: React.PointerEvent) => {
    const g = gest.current;
    gest.current = null;
    setPaused(false);
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dt = Date.now() - g.t;
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    if (dt < 280 && Math.abs(dx) < 18 && Math.abs(dy) < 18) goNext();
  };

  return (
    <div className={overlay}>
      <div className="absolute inset-x-4 top-10 z-10 flex gap-1">
        {items.map((s, n) => (
          <span key={`${s.id}-${n}`} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <span
              className={`block h-full bg-white ${n < i ? "w-full" : n > i ? "w-0" : ""}`}
              style={
                n === i && !paused && !looks
                  ? { animation: `niji-status-fill ${dwell}ms linear forwards` }
                  : n === i
                    ? { width: "40%" }
                    : undefined
              }
            />
          </span>
        ))}
      </div>
      <style>{`@keyframes niji-status-fill { from { width: 0 } to { width: 100% } }`}</style>

      <button
        type="button"
        className="absolute inset-y-0 left-0 z-20 w-[16%]"
        aria-label="Previous"
        onClick={goPrev}
      />
      <button type="button" className="absolute inset-y-0 right-0 z-20 w-[16%]" aria-label="Next" onClick={goNext} />
      <button
        type="button"
        className="absolute inset-0 z-10"
        aria-label="Next status"
        onPointerDown={(e) => {
          gest.current = { x: e.clientX, y: e.clientY, t: Date.now() };
          setPaused(true);
        }}
        onPointerUp={finishGest}
        onPointerCancel={() => {
          gest.current = null;
          setPaused(false);
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        {still ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={still} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[#EBEBEC]">
            <MoodWash id={item.mood ?? "plain"} />
          </div>
        )}
        {still ? <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" /> : null}
        <div
          className="absolute top-16 left-5 z-20 flex items-center gap-2"
          style={{ color: still ? "#fff" : moodInk(item.mood ?? "plain") }}
        >
          <Person user={author} size="sm" around={false} />
          <div>
            <p className="text-sm">{mine ? "You" : author.name}</p>
            {from ? (
              <p className={`text-[11px] ${still ? "text-white/70" : "opacity-70"}`}>From {from.name}</p>
            ) : null}
          </div>
        </div>
        {line ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center px-8">
            <p
              className="max-w-[86%] text-center font-serif text-2xl leading-snug"
              style={{ color: still ? "#fff" : moodInk(item.mood ?? "plain") }}
            >
              {line}
            </p>
          </div>
        ) : null}
      </div>

      {mine || share ? (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 p-5 pt-0">
          {mine ? (
            <button
              type="button"
              className="rounded-full bg-white/15 px-4 py-2 text-[13px] text-white"
              aria-label="Looks"
              onClick={() => setLooks(true)}
            >
              {lookedCopy(lookNames)}
            </button>
          ) : (
            <span />
          )}
          {share ? (
            <button
              type="button"
              className="rounded-full bg-white/15 px-4 py-2 text-[13px] text-white"
              aria-label="Reshare"
              onClick={() => onReshare?.(item)}
            >
              Reshare
            </button>
          ) : null}
        </div>
      ) : null}

      {looks ? (
        <div
          className="absolute inset-0 z-40 bg-black/40"
          onClick={() => setLooks(false)}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-x-0 bottom-0 max-h-[70%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5 text-[#17171A]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Looks</p>
            <p className="mt-1 text-center text-[13px] text-[#65656B]">{lookedCopy(lookNames)}</p>
            {looksIds.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#9B9AA0]">Nobody has opened this yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {looksIds.map((id) => {
                  const u = userById(id);
                  if (!u) return null;
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <Person user={u} size="sm" around={false} />
                      <p className="text-[15px]">{u.name}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
