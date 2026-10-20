"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sealUnlocked, unlockSeal } from "@/lib/seal";
import { SealGate } from "@/components/screens/seal-gate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { ChatProfile } from "@/components/screens/chat-profile";
import { VybePostDetail, VybeProfile } from "@/components/screens/vybe-profile";
import { Groove, IconHit } from "@/components/niji/chrome";
import { CopyLine } from "@/components/niji/copy-line";
import { usePaperCapture } from "@/components/niji/paper-capture";
import { IconCalls, IconMic, IconSend, IconVideo } from "@/components/niji/icons";
import { liveLeft, mapsHref } from "@/lib/place";
import { clockTime, formatDuration } from "@/lib/format";
import { mistFace } from "@/lib/ghost";
import { captureNoticeLine, copyableText, paperAllowsCopy, paperGuardsCapture } from "@/lib/paper-guard";
import { isAround, isMeChat, threadPeerId } from "@/lib/presence";
import { useAppNav } from "@/components/web/use-app-nav";
import type { Post } from "@/lib/types";

export function ChatThread({ id }: { id: string }) {
  const router = useRouter();
  const appNav = useAppNav();
  const {
    state,
    userById,
    me,
    sendMessage,
    sendVoice,
    sendLocation,
    messageSeller,
    sendOrder,
    payStall,
    markRead,
    startCall,
    setDisappear,
    setThread,
    clearPaper,
    leaveGroup,
    noticeCapture,
  } = useStore();
  const convo = state.conversations.find((c) => c.id === id);
  const [text, setText] = useState("");
  const [settings, setSettings] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [recError, setRecError] = useState("");
  const [openVybe, setOpenVybe] = useState<string | null>(null);
  const [vybeProfile, setVybeProfile] = useState(false);
  const [kbPad, setKbPad] = useState(0);
  const [opened, setOpened] = useState(() => !id || sealUnlocked(id));
  const end = useRef<HTMLDivElement>(null);
  const rec = useRef<{
    media: MediaRecorder;
    chunks: Blob[];
    started: number;
    timer: number;
  } | null>(null);

  const unread = convo?.unread ?? 0;
  useEffect(() => {
    if (convo?.sealed && !sealUnlocked(id) && !opened) return;
    markRead(id);
  }, [id, unread, markRead, convo?.sealed, opened]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [convo?.messages.length]);

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

  async function startRec() {
    setRecError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const media = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      media.ondataavailable = (ev) => {
        if (ev.data.size) chunks.push(ev.data);
      };
      media.start();
      const timer = window.setInterval(() => setRecSec((s) => s + 1), 1000);
      rec.current = { media, chunks, started: Date.now(), timer };
      setRecording(true);
      setRecSec(0);
    } catch {
      setRecError("Mic needs permission to send a voice.");
    }
  }

  function stopRec() {
    const session = rec.current;
    rec.current = null;
    setRecording(false);
    if (!session || !convo) return;
    window.clearInterval(session.timer);
    const durationSec = Math.max(1, Math.round((Date.now() - session.started) / 1000));
    session.media.onstop = () => {
      session.media.stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(session.chunks, { type: session.media.mimeType || "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => {
        sendVoice(convo.id, typeof reader.result === "string" ? reader.result : undefined, durationSec);
      };
      reader.readAsDataURL(blob);
    };
    if (session.media.state !== "inactive") session.media.stop();
    else session.media.stream.getTracks().forEach((t) => t.stop());
  }

  function sendLine() {
    if (!convo || recording || !text.trim()) return;
    sendMessage(convo.id, text.trim());
    setText("");
  }

  const convoId = convo?.id;
  const guards = convo ? paperGuardsCapture(convo) : false;
  const canCopy = convo ? paperAllowsCopy(convo) : false;
  const onCapture = useCallback(
    (kind: "screenshot" | "record") => {
      if (convoId) noticeCapture(convoId, kind);
    },
    [noticeCapture, convoId],
  );
  usePaperCapture(Boolean(convoId && guards && opened), onCapture);

  if (!convo) {
    return (
      <div className="flex flex-1 items-center justify-center bg-paper p-8 text-center text-sm text-[#9B9AA0]">
        This chat is gone.{" "}
        <button type="button" className="underline" onClick={() => appNav.toChatList()}>
          Back
        </button>
      </div>
    );
  }

  if (convo.sealed && !opened && !sealUnlocked(convo.id)) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-paper">
        <SealGate
          mode="open"
          hash={convo.sealPin ?? state.sealPin}
          onClose={() => appNav.toChatList()}
          onUnlock={() => {
            unlockSeal(convo.id);
            setOpened(true);
          }}
        />
      </div>
    );
  }

  const notes = isMeChat(convo, me.id);
  const peerId = threadPeerId(convo, me.id);
  const peer = userById(peerId);
  const alias = state.ghostAliases.find((a) => a.id === convo.ghostAliasId);
  const title = convo.ghost
    ? alias
      ? mistFace(alias.token)
      : peer?.nijiId || peer?.name || "Mist"
    : notes
      ? "Me"
      : convo.name ?? peer?.name ?? "Chat";
  const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => appNav.toChatList()}
          className="px-1 text-[22px] leading-none text-[#65656B]"
          aria-label="Back"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => {
            if (convo.lane === "vybe") {
              setVybeProfile(true);
              return;
            }
            setSettings(true);
          }}
          className="shrink-0"
          aria-label={title}
        >
          {convo.isGroup ? (
            <div className="flex size-9 items-center justify-center rounded-full bg-[#E1E1E3] text-base ring-1 ring-black/5">
              {convo.emoji ?? "👥"}
            </div>
          ) : (
            <Person user={peer} size="sm" place="chat" around={around} vybeOn={state.vybeEnabled} />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (convo.lane === "vybe") setVybeProfile(true);
            else setSettings(true);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-medium text-[#17171A]">{title}</p>
            <p className="text-[11px] text-[#9B9AA0]">
              {convo.lane === "hub"
                ? "Stall"
                : convo.isGroup
                  ? `${convo.participantIds.length} people`
                  : notes
                  ? "Pocket"
                  : around
                    ? "Active now"
                    : "\u00a0"}
            </p>
          </div>
        </button>
        {peer && !notes && !convo.isGroup && convo.lane !== "vybe" && convo.lane !== "hub" ? (
          <>
            <button type="button" aria-label="Voice" onClick={() => startCall(peer.id, "voice", convo.id)}>
              <IconHit>
                <IconCalls className="size-4" />
              </IconHit>
            </button>
            <button type="button" aria-label="Video" onClick={() => startCall(peer.id, "video", convo.id)}>
              <IconHit>
                <IconVideo className="size-4" />
              </IconHit>
            </button>
          </>
        ) : null}
      </header>
      <div
        id={guards ? "niji-guarded-paper" : undefined}
        className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-3 py-3"
        onCopy={
          guards
            ? (event) => {
                event.preventDefault();
                onCapture("screenshot");
              }
            : undefined
        }
      >
        {convo.messages.map((m) => {
          const mine = m.senderId === me.id;
          if (m.kind === "notice") {
            return (
              <p key={m.id} className="my-3 text-center text-[11px] text-[#9B9AA0]">
                {captureNoticeLine({ mine, name: userById(m.senderId)?.name, kind: m.notice })}
              </p>
            );
          }
          if (m.kind === "call") {
            return (
              <p key={m.id} className="my-3 text-center text-[11px] text-[#9B9AA0]">
                {m.text}
                {m.call?.durationSec ? ` · ${formatDuration(m.call.durationSec)}` : ""}
              </p>
            );
          }
          if (m.kind === "vybe") {
            const post = state.posts.find((p) => p.id === m.postId);
            return (
              <div key={m.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
                <VybeShareCard
                  post={post}
                  fallbackText={m.text}
                  fallbackImage={m.image}
                  onOpen={() => {
                    if (post) setOpenVybe(post.id);
                  }}
                />
              </div>
            );
          }
          if (m.kind === "shop") {
            const shop = state.shops.find((s) => s.id === m.shopId);
            return (
              <div key={m.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
                <Link
                  href={shop ? `/hub/${shop.id}` : "/hub"}
                  className="max-w-[78%] overflow-hidden rounded-[18px] bg-[#F7F7F8]"
                  style={{ boxShadow: "0 4px 10px rgba(25,25,34,0.07)" }}
                >
                  {m.image || shop?.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.image || shop?.cover} alt="" className="h-28 w-full object-cover" />
                  ) : null}
                  <div className="px-3.5 py-2.5">
                    <p className="text-[11px] text-[#9B9AA0]">Hub</p>
                    <p className="text-[14px] font-medium text-[#17171A]">{shop?.name || m.text}</p>
                    <p className="mt-0.5 text-[12px] text-[#65656B]">
                      {shop ? `${shop.area || shop.city} · ${shop.rating} ★` : "Open this stall"}
                    </p>
                  </div>
                </Link>
              </div>
            );
          }
          return (
            <div key={m.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-3.5 py-2 text-[14px] leading-5 ${
                  mine
                    ? "rounded-[18px] rounded-br-md bg-[#17171A] text-[#F7F7F8]"
                    : "rounded-[18px] rounded-bl-md bg-[#F7F7F8] text-[#17171A]"
                }`}
                style={
                  mine
                    ? undefined
                    : {
                        borderTop: "1px solid rgba(255,255,255,0.92)",
                        boxShadow: "0 4px 10px rgba(25,25,34,0.07)",
                      }
                }
              >
                {m.kind === "product" || m.kind === "order" ? (
                  <p className="mb-1 text-[11px] opacity-70">Hub</p>
                ) : null}
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt="" className="mb-2 max-h-48 w-full rounded-[12px] object-cover" />
                ) : null}
                {m.kind === "location" && m.lat != null && m.lng != null ? (
                  <CopyLine text={copyableText(m)} allow={canCopy}>
                    <a
                      href={mapsHref(m.lat, m.lng)}
                      target="_blank"
                      rel="noreferrer"
                      className={`mb-1 block text-[14px] ${mine ? "text-[#F7F7F8]" : "text-[#17171A]"}`}
                    >
                      <span className="font-medium">{m.liveUntil && liveLeft(m.liveUntil) ? "Live place" : "Place"}</span>
                      <span className="mt-0.5 block text-[12px] opacity-70">
                        {m.text}
                        {m.liveUntil && liveLeft(m.liveUntil) ? ` · ${liveLeft(m.liveUntil)}` : ""}
                      </span>
                    </a>
                  </CopyLine>
                ) : m.kind === "voice" ? (
                  <VoiceBubble url={m.audioUrl} sec={m.durationSec ?? 1} mine={mine} />
                ) : m.file ? (
                  <CopyLine text={copyableText(m)} allow={canCopy}>
                    <p>
                      {m.file.name}
                      <span className={`ml-2 text-[11px] ${mine ? "text-white/50" : "text-[#9B9AA0]"}`}>{m.file.size}</span>
                    </p>
                  </CopyLine>
                ) : (
                  <CopyLine text={copyableText(m)} allow={canCopy}>
                    {m.text}
                  </CopyLine>
                )}
                <p className={`mt-1 text-[10px] ${mine ? "text-white/50" : "text-[#9B9AA0]"}`}>
                  {clockTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {convo.lane === "hub" && convo.shopId ? (
        <div className="flex gap-2 px-3 pt-1">
          <HubChip
            label="Enquire"
            onClick={() => {
              const product = state.products.find((p) => p.shopId === convo.shopId);
              if (product) messageSeller(product);
              else sendMessage(convo.id, "Is this stall open?");
            }}
          />
          <HubChip
            label="Order"
            onClick={() => {
              const cid = sendOrder(convo.shopId!);
              if (!cid) sendMessage(convo.id, "I'd like to place an order.");
            }}
          />
          <HubChip label="Pay" onClick={() => payStall(convo.id)} />
        </div>
      ) : null}
      <form
        className="flex items-end gap-2 px-3 pt-2.5"
        style={{ paddingBottom: kbPad > 0 ? 10 : 10, marginBottom: kbPad }}
        onSubmit={(e) => {
          e.preventDefault();
          sendLine();
        }}
      >
        <Groove className="flex flex-1 items-center">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
              e.preventDefault();
              sendLine();
            }}
            rows={1}
            enterKeyHint="send"
            placeholder={recording ? `Recording ${formatDuration(recSec)}` : "Message"}
            className="max-h-24 min-h-11 w-full flex-1 resize-none bg-transparent py-2.5 text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            disabled={recording}
          />
        </Groove>
        {text.trim() ? (
          <button type="submit" aria-label="Send">
            <IconHit>
              <IconSend className="size-4" />
            </IconHit>
          </button>
        ) : (
          <button
            type="button"
            aria-label={recording ? "Send voice" : "Record voice"}
            onPointerDown={startRec}
            onPointerUp={stopRec}
            onPointerCancel={stopRec}
            className={recording ? "text-[#17171A]" : "text-[#9B9AA0]"}
          >
            <span className="grid size-9 place-items-center">
              <IconMic className="size-5" />
            </span>
          </button>
        )}
      </form>
      {recError ? <p className="px-4 pb-2 text-center text-[11px] text-[#9B9AA0]">{recError}</p> : null}

      {settings ? (
        <ChatProfile
          title={title}
          peer={convo.isGroup ? undefined : peer}
          isGroup={convo.isGroup}
          emoji={convo.emoji}
          meId={me.id}
          members={convo.participantIds
            .map((pid) => userById(pid))
            .filter((u): u is NonNullable<typeof u> => Boolean(u))}
          convo={convo}
          onChange={(mode) => setDisappear(convo.id, mode)}
          onThread={(patch) => setThread(convo.id, patch)}
          onClear={(part) => clearPaper(convo.id, part)}
          onClose={() => setSettings(false)}
          onSharePlace={(point) => sendLocation(convo.id, point)}
          onLeave={
            convo.isGroup
              ? () => {
                  leaveGroup(convo.id);
                  appNav.toChatList();
                }
              : undefined
          }
        />
      ) : null}
      {vybeProfile && peer ? <VybeProfile userId={peer.id} onClose={() => setVybeProfile(false)} /> : null}
      {openVybe ? <VybePostDetail postId={openVybe} onClose={() => setOpenVybe(null)} /> : null}
    </div>
  );
}

function VybeShareCard({
  post,
  fallbackText,
  fallbackImage,
  onOpen,
}: {
  post?: Post;
  fallbackText: string;
  fallbackImage?: string;
  onOpen: () => void;
}) {
  const { userById } = useStore();
  const author = post ? userById(post.authorId) : undefined;
  const image = post?.image ?? fallbackImage;
  const caption = post?.text ?? fallbackText;
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!post}
      className="w-[72%] overflow-hidden rounded-[18px] bg-[#F7F7F8] text-left"
      style={{ boxShadow: "0 4px 10px rgba(25,25,34,0.07)", borderTop: "1px solid rgba(255,255,255,0.92)" }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="aspect-[4/5] w-full object-cover" />
      ) : (
        <div className="flex min-h-28 items-end px-3.5 py-3">
          <p className="line-clamp-3 text-[15px] text-[#17171A]">{caption || "This vybe faded."}</p>
        </div>
      )}
      <div className="px-3.5 py-2.5">
        <p className="truncate text-[13px] font-medium text-[#17171A]">{author?.name ?? "Vybe"}</p>
        {image ? (
          <p className="mt-0.5 line-clamp-2 text-[12px] text-[#65656B]">{caption}</p>
        ) : null}
        <p className="mt-1.5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">
          {post ? "Vybe" : "This vybe faded"}
        </p>
      </div>
    </button>
  );
}

function HubChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-[#EFEFF1] px-3 py-1.5 text-[12px] text-[#17171A]"
    >
      {label}
    </button>
  );
}

function VoiceBubble({ url, sec, mine }: { url?: string; sec: number; mine: boolean }) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className="flex items-center gap-2"
      onClick={() => {
        if (!url) return;
        if (!audio.current) audio.current = new Audio(url);
        if (on) {
          audio.current.pause();
          setOn(false);
        } else {
          void audio.current.play();
          setOn(true);
          audio.current.onended = () => setOn(false);
        }
      }}
    >
      <span className={`text-[13px] ${mine ? "text-white" : "text-[#17171A]"}`}>{on ? "Pause" : "Play"}</span>
      <span className={`h-1 w-16 rounded-full ${mine ? "bg-white/35" : "bg-[#17171A]/20"}`}>
        <span className={`block h-1 w-1/2 rounded-full ${mine ? "bg-white" : "bg-[#17171A]"}`} />
      </span>
      <span className={`text-[11px] ${mine ? "text-white/60" : "text-[#9B9AA0]"}`}>{formatDuration(sec)}</span>
    </button>
  );
}
