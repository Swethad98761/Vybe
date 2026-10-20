"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { relativeTime } from "@/lib/format";
import { useHorizontalPager } from "@/lib/pager";
import { chatStatusFaces, hasFreshPulse, hasPulse, isAround, isMeChat, threadPeerId, threadPreview } from "@/lib/presence";
import { givenName } from "@/lib/vybe-stats";
import { lockSeal, sealUnlocked, unlockSeal } from "@/lib/seal";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { Groove, Raised } from "@/components/niji/chrome";
import { IconChat, IconHubChat, IconLater, IconMist, IconPin, IconPlus } from "@/components/niji/icons";
import { GhostPane, LaterPane, ScheduleSheet } from "@/components/screens/chat-panes";
import { SealGate } from "@/components/screens/seal-gate";
import { StatusCompose } from "@/components/screens/status-compose";
import { StatusViewer } from "@/components/screens/status-viewer";
import { useAppNav } from "@/components/web/use-app-nav";
import type { Conversation, ScheduledMessage } from "@/lib/types";

const CHAT_TABS = [
  { id: "trusted", label: "Trusted chats", Icon: IconChat },
  { id: "hub", label: "Hub chat", Icon: IconHubChat },
  { id: "ghost", label: "Mist", Icon: IconMist },
  { id: "later", label: "Later", Icon: IconLater },
] as const;

type ChatTab = (typeof CHAT_TABS)[number]["id"];

export function ChatList() {
  const { state, userById, me, setThread, dropConversation, setSealPin } = useStore();
  const router = useRouter();
  const appNav = useAppNav();
  const pager = useHorizontalPager(CHAT_TABS.length);
  const tab: ChatTab = CHAT_TABS[pager.index]?.id ?? "trusted";
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusOf, setStatusOf] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [youPick, setYouPick] = useState(false);
  const [schedule, setSchedule] = useState<ScheduledMessage | null | undefined>(undefined);
  const [mintOpen, setMintOpen] = useState(false);
  const [menuOf, setMenuOf] = useState<string | null>(null);
  const [fadeOf, setFadeOf] = useState<string | null>(null);
  const [gate, setGate] = useState<{
    mode: "set" | "open";
    id: string;
    next?: "unseal" | "open" | "set-common" | "set-chat";
  } | null>(null);
  const [sealOf, setSealOf] = useState<string | null>(null);
  const pull = useRef<{ y: number; top: number } | null>(null);
  const hold = useRef<number | null>(null);

  const rows = useMemo(() => {
    const list = state.conversations
      .filter((c) => !c.ghost && c.lane !== "vybe" && c.lane !== "hub")
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const at = a.messages.at(-1)?.createdAt ?? "";
        const bt = b.messages.at(-1)?.createdAt ?? "";
        return bt.localeCompare(at);
      });
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((c) => {
      const notes = isMeChat(c, me.id);
      const peer = userById(threadPeerId(c, me.id));
      const name = notes ? "Me" : (c.name ?? peer?.name ?? "");
      const id = peer?.nijiId ?? "";
      return name.toLowerCase().includes(needle) || id.toLowerCase().includes(needle);
    });
  }, [state.conversations, q, userById, me.id]);

  const live = rows.filter((c) => !c.archived);
  const shelf = rows.filter((c) => c.archived);
  const hubRows = state.conversations
    .filter((c) => c.lane === "hub" && !c.ghost)
    .sort((a, b) => {
      const at = a.messages.at(-1)?.createdAt ?? "";
      const bt = b.messages.at(-1)?.createdAt ?? "";
      return bt.localeCompare(at);
    });

  const openMenu = (id: string) => {
    setFadeOf(null);
    setMenuOf((cur) => (cur === id ? null : id));
  };

  const openChat = (id: string, sealed?: boolean) => {
    if (sealed && !sealUnlocked(id)) {
      setGate({ mode: "open", id, next: "open" });
      return;
    }
    appNav.toChat(id);
  };

  const requestSeal = (id: string, sealed?: boolean) => {
    if (sealed) {
      setGate({ mode: "open", id, next: "unseal" });
      setMenuOf(null);
      setFadeOf(null);
      setSealOf(null);
      return;
    }
    if (!state.sealPin) {
      setGate({ mode: "set", id, next: "set-common" });
      setMenuOf(null);
      setSealOf(null);
      return;
    }
    setSealOf(id);
    setFadeOf(null);
  };

  const sealHash = (id: string) => {
    const convo = state.conversations.find((c) => c.id === id);
    return convo?.sealPin ?? state.sealPin;
  };

  const plusHref = tab === "trusted" ? "/chat/new" : tab === "hub" ? "/hub" : null;
  const onPlus = () => {
    if (tab === "trusted") appNav.toChatNew();
    else if (tab === "hub") appNav.toHub();
  };
  const floatingStatus = chatStatusFaces(me.id, state.users, state.statuses);
  const openYou = () => {
    if (hasPulse(me.id, state.statuses, "chat")) setYouPick(true);
    else setCompose(true);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
      <header className="grid grid-cols-5 items-center px-2 pt-3 pb-1">
        {plusHref ? (
          appNav.inWebApp ? (
            <button
              type="button"
              aria-label="New chat"
              className="grid place-items-center py-2.5 text-[#17171A]"
              onClick={onPlus}
            >
              <IconPlus className="size-6" />
            </button>
          ) : (
            <Link
              href={plusHref}
              aria-label="New chat"
              className="grid place-items-center py-2.5 text-[#17171A]"
            >
              <IconPlus className="size-6" />
            </Link>
          )
        ) : (
          <button
            type="button"
            aria-label={tab === "ghost" ? "Mint a name" : tab === "hub" ? "Open Hub" : "Park a message"}
            className="grid place-items-center py-2.5 text-[#17171A]"
            onClick={() => {
              if (tab === "later") setSchedule(null);
              else setMintOpen(true);
            }}
          >
            <IconPlus className="size-6" />
          </button>
        )}
        {CHAT_TABS.map(({ id, label, Icon }, i) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            onClick={() => pager.goTo(i)}
            className={`grid place-items-center py-2.5 ${
              tab === id ? "text-[#17171A]" : "text-[#BFBEC3]"
            }`}
          >
            <Icon className="size-6" />
          </button>
        ))}
      </header>

      <div
        ref={pager.ref}
        className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden no-scrollbar snap-x snap-mandatory"
        onPointerDown={pager.onPointerDown}
        onPointerMove={pager.onPointerMove}
        onPointerUp={pager.onPointerUp}
        onPointerCancel={pager.onPointerCancel}
        onScroll={pager.onScroll}
        onClickCapture={pager.onClickCapture}
      >
        <div className="flex h-full w-full min-w-full shrink-0 snap-start flex-col">
          <div
            className="flex min-h-0 flex-1 flex-col"
            onPointerDown={(e) => {
              const scroller = (e.currentTarget as HTMLElement).querySelector("[data-chat-list]");
              pull.current = {
                y: e.clientY,
                top: scroller instanceof HTMLElement ? scroller.scrollTop : 0,
              };
            }}
            onPointerUp={(e) => {
              if (!pull.current) return;
              const dy = e.clientY - pull.current.y;
              const fromTop = pull.current.top <= 8;
              pull.current = null;
              if (fromTop && dy > 48) setSearchOpen(true);
              if (dy < -48) {
                setSearchOpen(false);
                setQ("");
              }
            }}
          >
            {searchOpen ? (
              <div className="px-4 pb-2">
                <Groove className="flex items-center">
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search"
                    className="h-11 flex-1 bg-transparent text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
                  />
                  <button
                    type="button"
                    aria-label="Close search"
                    className="px-1 text-[13px] text-[#9B9AA0]"
                    onClick={() => {
                      setSearchOpen(false);
                      setQ("");
                    }}
                  >
                    Done
                  </button>
                </Groove>
              </div>
            ) : null}

            <div
              data-chat-list
              className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-2"
              onScroll={(e) => {
                if (searchOpen && e.currentTarget.scrollTop > 36) {
                  setSearchOpen(false);
                  setQ("");
                }
              }}
            >
              <div className="mb-1 flex items-start gap-3 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={openYou}
                  className="flex w-12 shrink-0 flex-col items-center"
                  aria-label="Your status"
                >
                  <span className="relative flex h-10 w-10 items-center justify-center">
                    <Person user={me} size="sm" story pulse={false} />
                    <span className="absolute right-0 bottom-0 grid size-3.5 place-items-center rounded-full bg-[#17171A] text-[9px] leading-none text-white">
                      +
                    </span>
                  </span>
                  <span className="mt-1 w-full truncate text-center text-[10px] text-[#9B9AA0]">You</span>
                </button>
                {floatingStatus.map((u) => {
                  const fresh = hasFreshPulse(u.id, state.statuses, me.id, "chat");
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setStatusOf(u.id)}
                      className="flex w-12 shrink-0 flex-col items-center"
                      aria-label={`${u.name} status`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center">
                        <Person user={u} size="sm" story pulse={fresh} />
                      </span>
                      <span className="mt-1 w-full truncate text-center text-[10px] text-[#9B9AA0]">
                        {givenName(u.name)}
                      </span>
                    </button>
                  );
                })}
              </div>
              {live.length === 0 && shelf.length === 0 ? (
                <p className="px-4 py-16 text-center text-sm text-[#9B9AA0]">
                  {q.trim() ? "No chats match that name." : "No trusted chats yet."}
                </p>
              ) : (
                <>
                  {live.map((c) => (
                    <ChatCard
                      key={c.id}
                      convo={c}
                      open={menuOf === c.id}
                      fading={fadeOf === c.id}
                      pickingSeal={sealOf === c.id}
                      onHold={() => openMenu(c.id)}
                      onOpen={() => openChat(c.id, c.sealed)}
                      onClose={() => {
                        setMenuOf(null);
                        setFadeOf(null);
                        setSealOf(null);
                      }}
                      holdRef={hold}
                      onShelf={() => {
                        setThread(c.id, { archived: true });
                        setMenuOf(null);
                        setFadeOf(null);
                        setSealOf(null);
                      }}
                      onFadeAsk={() => setFadeOf(c.id)}
                      onFadeKeep={() => setFadeOf(null)}
                      onFade={() => {
                        dropConversation(c.id);
                        setMenuOf(null);
                        setFadeOf(null);
                        setSealOf(null);
                      }}
                      onSeal={() => requestSeal(c.id, c.sealed)}
                      onSealCommon={() => {
                        setThread(c.id, { sealed: true });
                        lockSeal(c.id);
                        setMenuOf(null);
                        setSealOf(null);
                      }}
                      onSealNew={() => {
                        setGate({ mode: "set", id: c.id, next: "set-chat" });
                        setMenuOf(null);
                        setSealOf(null);
                      }}
                    />
                  ))}
                  {shelf.length ? (
                    <div className="mt-3">
                      <p className="px-1 pb-2 text-[11px] tracking-wide text-[#9B9AA0] uppercase">Shelf</p>
                      {shelf.map((c) => (
                        <ChatCard
                          key={c.id}
                          convo={c}
                          open={menuOf === c.id}
                          fading={fadeOf === c.id}
                          pickingSeal={sealOf === c.id}
                          onHold={() => openMenu(c.id)}
                          onOpen={() => openChat(c.id, c.sealed)}
                          onClose={() => {
                            setMenuOf(null);
                            setFadeOf(null);
                            setSealOf(null);
                          }}
                          holdRef={hold}
                          onShelf={() => {
                            setThread(c.id, { archived: false });
                            setMenuOf(null);
                            setFadeOf(null);
                            setSealOf(null);
                          }}
                          onFadeAsk={() => setFadeOf(c.id)}
                          onFadeKeep={() => setFadeOf(null)}
                          onFade={() => {
                            dropConversation(c.id);
                            setMenuOf(null);
                            setFadeOf(null);
                            setSealOf(null);
                          }}
                          onSeal={() => requestSeal(c.id, c.sealed)}
                          onSealCommon={() => {
                            setThread(c.id, { sealed: true });
                            lockSeal(c.id);
                            setMenuOf(null);
                            setSealOf(null);
                          }}
                          onSealNew={() => {
                            setGate({ mode: "set", id: c.id, next: "set-chat" });
                            setMenuOf(null);
                            setSealOf(null);
                          }}
                        />
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full w-full min-w-full shrink-0 snap-start flex-col overflow-y-auto no-scrollbar px-4 pb-4">
          {hubRows.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-[#9B9AA0]">
              Enquire from a stall on Hub. Those threads live here.
            </p>
          ) : (
            hubRows.map((c) => {
              const shop = state.shops.find((s) => s.id === c.shopId);
              const last = c.messages.at(-1);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => openChat(c.id, c.sealed)}
                  className="mb-2.5 block w-full text-left"
                >
                  <Raised className="px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      {shop?.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shop.cover} alt="" className="size-11 rounded-full object-cover bg-[#E1E1E3]" />
                      ) : (
                        <span className="grid size-11 place-items-center rounded-full bg-[#E1E1E3] text-[13px]">H</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-[15px] text-[#17171A] ${c.unread > 0 ? "font-bold" : "font-normal"}`}>{c.name ?? shop?.name ?? "Stall"}</p>
                        <p className={`truncate text-[13px] ${c.unread > 0 ? "font-medium text-[#17171A]" : "text-[#65656B]"}`}>{last?.text ?? "No messages yet."}</p>
                      </div>
                    </div>
                  </Raised>
                </button>
              );
            })
          )}
        </div>
        <div className="flex h-full w-full min-w-full shrink-0 snap-start flex-col">
          <GhostPane mintOpen={mintOpen} onMintOpen={() => setMintOpen(true)} onMintClose={() => setMintOpen(false)} />
        </div>
        <div className="flex h-full w-full min-w-full shrink-0 snap-start flex-col">
          <LaterPane onCompose={(draft) => setSchedule(draft ?? null)} />
        </div>
      </div>

      {statusOf ? <StatusViewer authorId={statusOf} lane="chat" onClose={() => setStatusOf(null)} /> : null}
      {compose ? <StatusCompose lane="chat" onClose={() => setCompose(false)} /> : null}
      {youPick ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setYouPick(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Your status</p>
            <button
              type="button"
              className="mt-4 w-full rounded-2xl bg-[#EFEFF1] py-3 text-[15px] text-[#17171A]"
              onClick={() => {
                setYouPick(false);
                setCompose(true);
              }}
            >
              Put up a status
            </button>
            <button
              type="button"
              className="mt-2 w-full rounded-2xl py-3 text-[15px] text-[#17171A]"
              onClick={() => {
                setYouPick(false);
                setStatusOf(me.id);
              }}
            >
              See yours
            </button>
          </div>
        </div>
      ) : null}
      {schedule !== undefined ? (
        <ScheduleSheet draft={schedule} onClose={() => setSchedule(undefined)} />
      ) : null}
      {gate ? (
        <SealGate
          mode={gate.mode}
          hash={sealHash(gate.id)}
          onClose={() => setGate(null)}
          onSet={(pin) => {
            if (gate.next === "set-chat") {
              setThread(gate.id, { sealed: true, sealPin: pin });
            } else {
              setSealPin(pin);
              setThread(gate.id, { sealed: true });
            }
            lockSeal(gate.id);
            setGate(null);
          }}
          onUnlock={() => {
            if (gate.next === "unseal") {
              setThread(gate.id, { sealed: false });
              lockSeal(gate.id);
              setGate(null);
              return;
            }
            unlockSeal(gate.id);
            const id = gate.id;
            setGate(null);
            appNav.toChat(id);
          }}
        />
      ) : null}
    </div>
  );
}

function PaperChip({
  children,
  onClick,
  ink,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ink?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        ink ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EBEBEC] text-[#17171A]"
      }`}
    >
      {children}
    </button>
  );
}

function ChatCard({
  convo,
  open,
  fading,
  pickingSeal,
  onHold,
  onOpen,
  onClose,
  holdRef,
  onShelf,
  onFadeAsk,
  onFadeKeep,
  onFade,
  onSeal,
  onSealCommon,
  onSealNew,
}: {
  convo: Conversation;
  open: boolean;
  fading: boolean;
  pickingSeal: boolean;
  onHold: () => void;
  onOpen: () => void;
  onClose: () => void;
  holdRef: { current: number | null };
  onShelf: () => void;
  onFadeAsk: () => void;
  onFadeKeep: () => void;
  onFade: () => void;
  onSeal: () => void;
  onSealCommon: () => void;
  onSealNew: () => void;
}) {
  const { state, userById, me } = useStore();
  const notes = isMeChat(convo, me.id);
  const peerId = threadPeerId(convo, me.id);
  const peer = userById(peerId);
  const last = convo.messages.at(-1);
  const title = notes ? "Me" : (convo.name ?? peer?.name ?? "Chat");
  const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);
  const unread = convo.unread > 0 && !convo.quiet && !convo.archived;

  const clearHold = () => {
    if (holdRef.current) {
      window.clearTimeout(holdRef.current);
      holdRef.current = null;
    }
  };

  const body = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-[15px] text-[#17171A]">
          {convo.pinned ? <IconPin className="size-3 shrink-0 text-[#9B9AA0]" /> : null}
          <span className={`truncate ${unread ? "font-bold" : "font-normal"}`}>{title}</span>
        </p>
        <span className="shrink-0 text-[11px] text-[#9B9AA0]">{last ? relativeTime(last.createdAt) : ""}</span>
      </div>
      <p className={`truncate text-[13px] ${unread ? "font-medium text-[#17171A]" : "text-[#65656B]"}`}>{threadPreview(convo)}</p>
      {open ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {fading ? (
            <>
              <span className="pr-1 text-[11px] text-[#65656B]">Fade this paper?</span>
              <PaperChip ink onClick={onFade}>
                Fade it
              </PaperChip>
              <PaperChip onClick={onFadeKeep}>Keep</PaperChip>
            </>
          ) : pickingSeal ? (
            <>
              <span className="pr-1 text-[11px] text-[#65656B]">Seal with</span>
              <PaperChip ink onClick={onSealCommon}>
                Your code
              </PaperChip>
              <PaperChip onClick={onSealNew}>A new code</PaperChip>
            </>
          ) : (
            <>
              <PaperChip onClick={onShelf}>{convo.archived ? "Unshelf" : "Shelf"}</PaperChip>
              <PaperChip onClick={onFadeAsk}>Fade</PaperChip>
              <PaperChip onClick={onSeal}>{convo.sealed ? "Unseal" : "Seal"}</PaperChip>
            </>
          )}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className="mb-2"
      onContextMenu={(e) => {
        e.preventDefault();
        onHold();
      }}
      onPointerDown={() => {
        clearHold();
        holdRef.current = window.setTimeout(onHold, 420);
      }}
      onPointerUp={clearHold}
      onPointerLeave={clearHold}
      onPointerCancel={clearHold}
    >
      <Raised className="px-3.5 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative shrink-0"
            onClick={onOpen}
            aria-label={title}
          >
            {convo.isGroup ? (
              <div className="flex size-11 items-center justify-center rounded-full bg-[#E1E1E3] text-lg ring-1 ring-black/5">
                {convo.emoji ?? "👥"}
              </div>
            ) : (
              <Person user={peer} place="chat" around={around} vybeOn={state.vybeEnabled} />
            )}
          </button>
          {open ? (
            <button type="button" className="min-w-0 flex-1 text-left" onClick={onClose}>
              {body}
            </button>
          ) : (
            <button type="button" className="min-w-0 flex-1 text-left" onClick={onOpen}>
              {body}
            </button>
          )}
        </div>
      </Raised>
    </div>
  );
}
