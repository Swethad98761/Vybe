"use client";

import { useMemo, useRef, useState } from "react";
import { clockTime, formatDuration, relativeTime } from "@/lib/format";
import { useHorizontalPager } from "@/lib/pager";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { IconHit, Raised } from "@/components/niji/chrome";
import { IconCalls, IconPlus, IconVideo } from "@/components/niji/icons";
import { useAppNav } from "@/components/web/use-app-nav";
import type { CallRecord } from "@/lib/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "video", label: "Video" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

function describeCall(c: CallRecord) {
  const dir = c.direction === "missed" ? "Missed" : c.direction === "incoming" ? "Incoming" : "Outgoing";
  const kind = c.kind === "video" ? "video" : "voice";
  const bits = [`${dir} ${kind}`];
  if (c.durationSec) bits.push(formatDuration(c.durationSec));
  bits.push(clockTime(c.createdAt));
  bits.push(relativeTime(c.createdAt));
  return bits.join(" · ");
}

function matchesFilter(c: CallRecord, filter: Filter) {
  if (filter === "missed") return c.direction === "missed";
  if (filter === "video") return c.kind === "video";
  return true;
}

export function CallsScreen() {
  const { state, userById, startCall, openChatWith, hideCall, unhideCall, dropCall } = useStore();
  const appNav = useAppNav();
  const [menuOf, setMenuOf] = useState<CallRecord | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const pager = useHorizontalPager(FILTERS.length);
  const filter: Filter = FILTERS[pager.index]?.id ?? "all";
  const visible = state.calls.filter((c) => !c.hidden);
  const last = visible.find((c) => c.direction !== "missed") ?? visible[0];
  const lastPeer = last ? userById(last.peerId) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center px-2 pt-3 pb-1">
        <button
          type="button"
          aria-label="New call"
          onClick={() => appNav.toCallsNew()}
          className="grid w-10 shrink-0 place-items-center py-2.5 text-[#17171A]"
        >
          <IconPlus className="size-6" />
        </button>
        <div className="grid min-w-0 flex-1 grid-cols-3">
          {FILTERS.map(({ id, label }, i) => (
            <button
              key={id}
              type="button"
              onClick={() => pager.goTo(i)}
              className={`py-2.5 text-center text-[13px] ${
                filter === id ? "font-semibold text-[#17171A]" : "text-[#BFBEC3]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="w-10 shrink-0" />
      </header>

      <div
        ref={pager.ref}
        onPointerDown={pager.onPointerDown}
        onPointerMove={pager.onPointerMove}
        onPointerUp={pager.onPointerUp}
        onPointerCancel={pager.onPointerCancel}
        onScroll={pager.onScroll}
        onClickCapture={pager.onClickCapture}
        className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden no-scrollbar"
      >
        {FILTERS.map((item) => (
          <CallLane
            key={item.id}
            filter={item.id}
            calls={state.calls}
            showHidden={showHidden}
            onShowHidden={setShowHidden}
            last={item.id === "all" ? last : undefined}
            lastPeer={item.id === "all" ? lastPeer : undefined}
            userById={userById}
            onCall={(peerId, kind) => startCall(peerId, kind, openChatWith(peerId))}
            onHold={(item) => setMenuOf(item)}
          />
        ))}
      </div>
      {menuOf ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setMenuOf(null)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">This call</p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[14px] text-[#17171A]"
              onClick={() => {
                if (menuOf.hidden) unhideCall(menuOf.id);
                else hideCall(menuOf.id);
                setMenuOf(null);
              }}
            >
              {menuOf.hidden ? "Unhide" : "Hide"}
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-2xl py-3 text-[14px] text-[#C0392B]"
              onClick={() => {
                dropCall(menuOf.id);
                setMenuOf(null);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CallLane({
  filter,
  calls,
  showHidden,
  onShowHidden,
  last,
  lastPeer,
  userById,
  onCall,
  onHold,
}: {
  filter: Filter;
  calls: CallRecord[];
  showHidden: boolean;
  onShowHidden: (open: boolean) => void;
  last?: CallRecord;
  lastPeer?: ReturnType<ReturnType<typeof useStore>["userById"]>;
  userById: ReturnType<typeof useStore>["userById"];
  onCall: (peerId: string, kind: CallRecord["kind"]) => void;
  onHold: (item: CallRecord) => void;
}) {
  const pull = useRef<{ y: number; top: number } | null>(null);
  const { visible, hidden } = useMemo(() => {
    const matched = calls.filter((c) => matchesFilter(c, filter));
    return {
      visible: matched.filter((c) => !c.hidden),
      hidden: matched.filter((c) => c.hidden),
    };
  }, [calls, filter]);

  return (
    <div
      className="min-h-0 w-full shrink-0 basis-full snap-start overflow-y-auto no-scrollbar px-4 pb-4"
      onPointerDown={(e) => {
        pull.current = { y: e.clientY, top: e.currentTarget.scrollTop };
      }}
      onPointerUp={(e) => {
        if (!pull.current) return;
        const dy = e.clientY - pull.current.y;
        const fromTop = pull.current.top <= 40;
        pull.current = null;
        if (fromTop && dy > 28) onShowHidden(true);
        if (dy < -36) onShowHidden(false);
      }}
      onPointerCancel={() => {
        pull.current = null;
      }}
    >
      {hidden.length > 0 || showHidden ? (
        <div className="flex items-end justify-between gap-3 pt-3 pb-2">
          <p className="text-[11px] leading-5 text-[#9B9AA0]">
            {showHidden ? "Hidden calls on this phone." : "Swipe down for hidden calls."}
          </p>
          <button
            type="button"
            onClick={() => onShowHidden(!showHidden)}
            className="shrink-0 text-[13px] font-medium text-[#17171A]"
          >
            {showHidden ? "Hide" : "Hidden"}
          </button>
        </div>
      ) : null}

      {showHidden ? (
        <div className="mb-3">
          {hidden.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#9B9AA0]">No hidden calls.</p>
          ) : (
            hidden.map((c) => (
              <CallRow key={c.id} item={c} userById={userById} onCall={onCall} onHold={onHold} />
            ))
          )}
        </div>
      ) : null}

      {filter === "all" && last && lastPeer ? (
        <div className="pb-3">
          <Raised className="px-4 py-4">
            <div className="flex items-center gap-3">
              <Person user={lastPeer} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-caps uppercase text-[#9B9AA0]">Last</p>
                <p className="truncate text-[16px] font-medium text-[#17171A]">{lastPeer.name}</p>
                <p className="text-[12px] text-[#65656B]">{describeCall(last)}</p>
              </div>
              <button type="button" aria-label="Voice" onClick={() => onCall(lastPeer.id, "voice")}>
                <IconHit>
                  <IconCalls className="size-4" />
                </IconHit>
              </button>
              <button type="button" aria-label="Video" onClick={() => onCall(lastPeer.id, "video")}>
                <IconHit>
                  <IconVideo className="size-4" />
                </IconHit>
              </button>
            </div>
          </Raised>
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="px-4 py-16 text-center text-sm text-[#9B9AA0]">
          {filter === "missed"
            ? "No missed calls."
            : filter === "video"
              ? "No video calls yet."
              : hidden.length
                ? "Swipe down for hidden calls."
                : "No calls yet."}
        </p>
      ) : (
        visible.map((c) => (
          <CallRow key={c.id} item={c} userById={userById} onCall={onCall} onHold={onHold} />
        ))
      )}
    </div>
  );
}

function CallRow({
  item,
  userById,
  onCall,
  onHold,
}: {
  item: CallRecord;
  userById: ReturnType<typeof useStore>["userById"];
  onCall: (peerId: string, kind: CallRecord["kind"]) => void;
  onHold: (item: CallRecord) => void;
}) {
  const peer = userById(item.peerId);
  if (!peer) return null;
  const missed = item.direction === "missed";
  const incoming = item.direction === "incoming";
  return (
    <button
      type="button"
      onClick={() => onCall(peer.id, item.kind)}
      onContextMenu={(e) => {
        e.preventDefault();
        onHold(item);
      }}
      onPointerDown={() => {
        const t = window.setTimeout(() => onHold(item), 420);
        const clear = () => window.clearTimeout(t);
        window.addEventListener("pointerup", clear, { once: true });
        window.addEventListener("pointercancel", clear, { once: true });
      }}
      className="mb-2.5 block w-full text-left"
    >
      <Raised className="px-3.5 py-3">
        <div className="flex items-center gap-3">
          <Person user={peer} />
          <div className="min-w-0 flex-1">
            <p className={`truncate text-[15px] font-medium ${missed ? "text-[#C0392B]" : "text-[#17171A]"}`}>
              {peer.name}
            </p>
            <p className={`text-[12px] ${incoming && !missed ? "text-[#2A8A50]" : "text-[#9B9AA0]"}`}>
              {describeCall(item)}
            </p>
          </div>
          <IconHit>
            {item.kind === "video" ? <IconVideo className="size-4" /> : <IconCalls className="size-4" />}
          </IconHit>
        </div>
      </Raised>
    </button>
  );
}
