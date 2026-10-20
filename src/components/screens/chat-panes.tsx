"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/format";
import {
  ALIAS_TONE,
  GHOST_TTLS,
  aliasTone,
  defaultSendAt,
  isAliasLive,
  mistFace,
  remainingLabel,
  slugMistName,
  splitGivenName,
  whenLabel,
} from "@/lib/ghost";
import { WhenPick } from "@/components/niji/when-pick";
import { NijiPaper } from "@/components/niji/niji-paper";
import { previewOf } from "@/lib/presence";
import { nijiMistShareText, nijiMistUri } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { Chip, Groove, Raised } from "@/components/niji/chrome";
import type { GhostAlias, GhostTtl, ScheduledMessage } from "@/lib/types";

export function GhostPane({
  mintOpen,
  onMintClose,
}: {
  mintOpen: boolean;
  onMintOpen?: () => void;
  onMintClose: () => void;
}) {
  const router = useRouter();
  const { state, me, userById, mintGhost, revokeGhost, meetVeil } = useStore();
  const [ttl, setTtl] = useState<GhostTtl>("1d");
  const [token, setToken] = useState("");
  const [note, setNote] = useState("");
  const given = splitGivenName(me.name);
  const [first, setFirst] = useState(given.first);
  const [last, setLast] = useState(given.last);
  const [copied, setCopied] = useState<string | null>(null);
  const [meetError, setMeetError] = useState("");
  const [namesOpen, setNamesOpen] = useState(false);
  const [minted, setMinted] = useState<GhostAlias | null>(null);
  const [showQr, setShowQr] = useState<GhostAlias | null>(null);
  const [kbPad, setKbPad] = useState(0);
  const pull = useRef<{ y: number; top: number } | null>(null);

  const { live, closed } = useMemo(() => {
    const all = state.conversations
      .filter((c) => c.ghost)
      .sort((a, b) => (b.messages.at(-1)?.createdAt ?? "").localeCompare(a.messages.at(-1)?.createdAt ?? ""));
    const live: typeof all = [];
    const closed: typeof all = [];
    for (const c of all) {
      const alias = state.ghostAliases.find((a) => a.id === c.ghostAliasId);
      const dead = c.archived || (alias ? !isAliasLive(alias) : false);
      (dead ? closed : live).push(c);
    }
    return { live, closed };
  }, [state.conversations, state.ghostAliases]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => setKbPad(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(value);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-4"
        onPointerDown={(e) => {
          e.stopPropagation();
          pull.current = { y: e.clientY, top: e.currentTarget.scrollTop };
        }}
        onPointerMove={(e) => e.stopPropagation()}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (!pull.current) return;
          const dy = e.clientY - pull.current.y;
          const fromTop = pull.current.top <= 40;
          pull.current = null;
          if (fromTop && dy > 28) setNamesOpen(true);
          if (dy < -36) setNamesOpen(false);
        }}
      >
        <div className="flex items-end justify-between gap-3 pt-4 pb-2">
          <p className="text-[11px] leading-5 text-[#9B9AA0]">
            A name that is not yours. Swipe down, or History, for faded ones.
          </p>
          <button
            type="button"
            onClick={() => setNamesOpen((open) => !open)}
            className="shrink-0 text-[13px] font-medium text-[#17171A]"
          >
            {namesOpen ? "Hide" : "History"}
          </button>
        </div>
        {namesOpen ? (
          <div className="mb-4">
            <p className="mb-2 px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">History</p>
            {state.ghostAliases.length === 0 && closed.length === 0 ? (
              <p className="px-2 py-6 text-center text-[13px] text-[#9B9AA0]">No faded names or chats yet.</p>
            ) : (
              <div className="space-y-2">
                {state.ghostAliases.map((alias) => {
                  const tone = aliasTone(alias);
                  const face = mistFace(alias.token);
                  return (
                    <Raised key={alias.id} className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ background: ALIAS_TONE[tone] }}
                          aria-label={tone}
                        />
                        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-[#17171A]">
                          {face}
                        </p>
                        <span className="text-[11px] text-[#9B9AA0]">
                          {tone === "closed" ? "Ended" : remainingLabel(alias.expiresAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-[13px] text-[#65656B]">
                        {alias.note?.trim() ? `${alias.note.trim()} · ` : ""}
                        {alias.token}
                      </p>
                      {tone !== "closed" ? (
                        <div className="mt-2 flex gap-4 text-[13px]">
                          <button type="button" className="text-[#17171A]" onClick={() => void copy(alias.token)}>
                            {copied === alias.token ? "Copied Niji ID" : "Copy Niji ID"}
                          </button>
                          <button type="button" className="text-[#17171A]" onClick={() => setShowQr(alias)}>
                            QR
                          </button>
                          <button type="button" className="text-[#9B9AA0]" onClick={() => revokeGhost(alias.id)}>
                            End now
                          </button>
                        </div>
                      ) : null}
                    </Raised>
                  );
                })}
                {closed.map((c) => {
                  const peerId = c.participantIds.find((id) => id !== me.id) ?? "";
                  const peer = userById(peerId);
                  const last = c.messages.at(-1);
                  const alias = state.ghostAliases.find((a) => a.id === c.ghostAliasId);
                  return (
                    <Raised key={c.id} className="px-3.5 py-3">
                      <Link href={`/chat/${c.id}`} className="flex items-center gap-3">
                        <Person user={peer} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[15px] tracking-wide text-[#17171A]">
                            {alias ? mistFace(alias.token) : peer?.name || "Mist"}
                          </p>
                          <p className="truncate text-[13px] text-[#9B9AA0]">
                            Closed · {previewOf(last)}
                          </p>
                        </div>
                      </Link>
                    </Raised>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        {live.length === 0 ? (
          <p className="px-2 py-16 text-center text-[13px] text-[#9B9AA0]">
            No live mist. Tap + for a name, or History for faded ones.
          </p>
        ) : (
          live.map((c) => {
            const peerId = c.participantIds.find((id) => id !== me.id) ?? "";
            const peer = userById(peerId);
            const last = c.messages.at(-1);
            const alias = state.ghostAliases.find((a) => a.id === c.ghostAliasId);
            const fadedVeil = alias ? !isAliasLive(alias) : false;
            return (
              <div key={c.id} className="mb-2.5">
                <Raised className="px-3.5 py-3">
                  <Link href={`/chat/${c.id}`} className="flex items-center gap-3">
                    <Person user={peer} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-[15px] tracking-wide text-[#17171A] ${c.unread > 0 ? "font-semibold" : "font-medium"}`}>
                          {alias ? mistFace(alias.token) : peer?.name || peer?.nijiId || "Mist"}
                        </p>
                        <span className="shrink-0 text-[11px] text-[#9B9AA0]">
                          {last ? relativeTime(last.createdAt) : ""}
                        </span>
                      </div>
                      {c.unread > 0 ? (
                        <p className="truncate text-[13px] font-medium text-[#17171A]">
                          {fadedVeil ? "This name faded. " : ""}
                          {previewOf(last)}
                        </p>
                      ) : (
                        <p className="truncate text-[13px] text-[#65656B]">
                          {fadedVeil ? "This name faded. " : ""}
                          {previewOf(last)}
                        </p>
                      )}
                    </div>
                  </Link>
                  {alias && !fadedVeil ? (
                    <button
                      type="button"
                      className="mt-2 text-[12px] text-[#65656B]"
                      onClick={() => setShowQr(alias)}
                    >
                      Share Niji ID
                    </button>
                  ) : null}
                </Raised>
              </div>
            );
          })
        )}
      </div>

      {mintOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onMintClose}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5"
            style={kbPad > 0 ? { bottom: kbPad, maxHeight: `calc(88% - ${Math.max(0, kbPad - 12)}px)` } : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Mist</p>
            <p className="mt-1 text-center text-[12px] text-[#9B9AA0]">
              A name they can say out loud. We add a number so it isn’t someone else’s.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {GHOST_TTLS.map((t) => (
                <button key={t.id} type="button" onClick={() => setTtl(t.id)}>
                  <Chip on={ttl === t.id}>{t.label}</Chip>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[10px] tracking-caps uppercase text-[#9B9AA0]">First name</p>
            <Groove className="mt-2 py-2">
              <input
                value={first}
                onChange={(e) => setFirst(e.target.value.slice(0, 18))}
                placeholder="Priya"
                className="h-11 w-full bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
            </Groove>
            <p className="mt-3 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Last name</p>
            <p className="mt-1 text-[12px] text-[#9B9AA0]">Optional. Only if you want it on this mist.</p>
            <Groove className="mt-2 py-2">
              <input
                value={last}
                onChange={(e) => setLast(e.target.value.slice(0, 18))}
                placeholder="Rao"
                className="h-11 w-full bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
            </Groove>
            <p className="mt-2 px-1 text-[12px] text-[#65656B]">
              They’ll see something like{" "}
              {slugMistName(first, last) === "mist"
                ? "Priya 482"
                : `${first.trim() || "Priya"}${last.trim() ? ` ${last.trim()}` : ""} 482`}
              . The number is ours.
            </p>
            <p className="mt-4 text-[10px] tracking-caps uppercase text-[#9B9AA0]">A note for you</p>
            <p className="mt-1 text-[12px] text-[#9B9AA0]">Only you see this. How you recollect who this was.</p>
            <Groove className="mt-2 py-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 60))}
                placeholder="Cafe table, stall guy…"
                className="h-11 w-full bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
            </Groove>
            <button
              type="button"
              disabled={!first.trim()}
              onClick={() => {
                const alias = mintGhost(ttl, note, first, last);
                void copy(alias.token);
                setNote("");
                onMintClose();
                setNamesOpen(true);
                setMinted(alias);
              }}
              className="mt-4 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] font-medium text-[#F7F7F8] disabled:opacity-30"
            >
              Make this name
            </button>

            <p className="mt-6 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Someone shared a name</p>
            <p className="mt-1 text-[12px] text-[#9B9AA0]">Enter it. A live name opens the chat.</p>
            <Groove className="mt-2 flex items-center">
              <input
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setMeetError("");
                }}
                placeholder="priya-482"
                autoCapitalize="none"
                className="h-11 flex-1 bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
              <button
                type="button"
                className="px-1 text-[13px] text-[#17171A]"
                onClick={() => {
                  const id = meetVeil(token);
                  if (!id) {
                    setMeetError("That name is not live.");
                    return;
                  }
                  setToken("");
                  onMintClose();
                  router.push(`/chat/${id}`);
                }}
              >
                Open chat
              </button>
            </Groove>
            {meetError ? <p className="mt-2 text-[12px] text-[#9B9AA0]">{meetError}</p> : null}
            <div className="h-4" />
          </div>
        </div>
      ) : null}

      {minted || showQr ? (
        <NijiPaper
          nijiId={(minted ?? showQr)!.token}
          name={mistFace((minted ?? showQr)!.token)}
          uri={nijiMistUri((minted ?? showQr)!.token)}
          kicker="A Namaskaram that is not yours. The other person only sees this name."
          shareText={nijiMistShareText((minted ?? showQr)!.token, mistFace((minted ?? showQr)!.token))}
          shareLabel="Share Niji ID"
          onClose={() => {
            setMinted(null);
            setShowQr(null);
          }}
        />
      ) : null}
    </div>
  );
}

export function LaterPane({ onCompose }: { onCompose: (draft?: ScheduledMessage) => void }) {
  const { state, userById, cancelScheduled } = useStore();
  const drafts = state.scheduled.filter((s) => s.status === "draft");
  const sent = state.scheduled.filter((s) => s.status === "sent");
  const memory = state.scheduled.filter((s) => s.status === "kept");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
      <p className="px-1 text-[13px] text-[#65656B]">
        Park what, when, and whom. When it leaves, it also sits in that chat. Keep it here as memory if you want both.
      </p>

      {drafts.length === 0 ? (
        <p className="px-2 py-10 text-center text-[13px] text-[#9B9AA0]">Nothing waiting.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {drafts.map((item) => {
            const peer = userById(item.peerId);
            return (
              <Raised key={item.id} className="px-4 py-3.5">
                <button type="button" className="w-full text-left" onClick={() => onCompose(item)}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[15px] font-medium text-[#17171A]">{peer?.name ?? "Someone"}</p>
                    <span className="shrink-0 text-[11px] text-[#9B9AA0]">{whenLabel(item.sendAt)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[#65656B]">{item.text}</p>
                </button>
                <div className="mt-2 flex gap-4 text-[13px]">
                  <button type="button" className="text-[#17171A]" onClick={() => onCompose(item)}>
                    Edit
                  </button>
                  <button type="button" className="text-[#9B9AA0]" onClick={() => cancelScheduled(item.id)}>
                    Drop
                  </button>
                </div>
              </Raised>
            );
          })}
        </div>
      )}

      {sent.length ? (
        <>
          <p className="mt-7 mb-2 px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Sent · in chat</p>
          <div className="space-y-2.5">
            {sent.map((item) => {
              const peer = userById(item.peerId);
              const href = item.conversationId ? `/chat/${item.conversationId}` : "/chat";
              return (
                <Raised key={item.id} className="px-4 py-3.5">
                  <Link href={href} className="block">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[15px] font-medium text-[#17171A]">{peer?.name ?? "Someone"}</p>
                      <span className="shrink-0 text-[11px] text-[#9B9AA0]">
                        {item.sentAt ? whenLabel(item.sentAt) : whenLabel(item.sendAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[#65656B]">{item.text}</p>
                    <p className="mt-2 text-[12px] text-[#17171A]">Open in chat</p>
                  </Link>
                </Raised>
              );
            })}
          </div>
        </>
      ) : null}

      {memory.length ? (
        <>
          <p className="mt-7 mb-2 px-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Memory</p>
          <div className="space-y-2.5">
            {memory.map((item) => {
              const peer = userById(item.peerId);
              return (
                <Raised key={item.id} className="px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[15px] text-[#17171A]">{peer?.name ?? "Someone"}</p>
                    <span className="shrink-0 text-[11px] text-[#9B9AA0]">
                      {item.sentAt ? whenLabel(item.sentAt) : whenLabel(item.sendAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[#65656B]">{item.text}</p>
                </Raised>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ScheduleSheet({
  draft,
  onClose,
}: {
  draft?: ScheduledMessage | null;
  onClose: () => void;
}) {
  const { state, me, saveScheduled } = useStore();
  const trusted = state.users.filter(
    (u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"),
  );

  const [peerId, setPeerId] = useState(draft?.peerId ?? trusted[0]?.id ?? "");
  const [text, setText] = useState(draft?.text ?? "");
  const [sendAt, setSendAt] = useState(draft?.sendAt ?? defaultSendAt());
  const [keep, setKeep] = useState(Boolean(draft?.keepMemory));

  return (
    <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 max-h-[88%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Later</p>
        <p className="mt-1 text-center text-[12px] text-[#9B9AA0]">What, when, and whom. Edit until it leaves.</p>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-neutral-400">Whom</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {trusted.map((u) => (
            <button key={u.id} type="button" onClick={() => setPeerId(u.id)}>
              <Chip on={peerId === u.id}>{u.name.split(" ")[0]}</Chip>
            </button>
          ))}
        </div>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-neutral-400">What</p>
        <Groove className="mt-2 py-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="The line you want to send later"
            className="h-24 w-full resize-none bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
          />
        </Groove>

        <p className="mt-5 text-[10px] tracking-caps uppercase text-neutral-400">When</p>
        <div className="mt-3">
          <WhenPick value={sendAt} onChange={setSendAt} />
        </div>

        <button
          type="button"
          onClick={() => setKeep((v) => !v)}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#EFEFF1] px-4 py-3"
        >
          <span className="text-[14px] text-[#17171A]">Keep as memory after it sends</span>
          <span className={`h-6 w-10 rounded-full ${keep ? "bg-[#17171A]" : "bg-[#C8C8CC]"}`}>
            <span className={`block size-5 rounded-full bg-white transition ${keep ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
        </button>

        <button
          type="button"
          disabled={!text.trim() || !peerId}
          onClick={() => {
            const convo = state.conversations.find(
              (c) => !c.isGroup && !c.ghost && c.participantIds.includes(peerId),
            );
            saveScheduled({
              id: draft?.id ?? "",
              peerId,
              conversationId: convo?.id,
              text,
              sendAt,
              keepMemory: keep,
            });
            onClose();
          }}
          className="mt-4 mb-4 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] font-medium text-[#F7F7F8] disabled:opacity-30"
        >
          Park it
        </button>
      </div>
    </div>
  );
}
