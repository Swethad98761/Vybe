"use client";

import { useState } from "react";
import { Person } from "@/components/niji/person";
import { Raised } from "@/components/niji/chrome";
import { NijiPaper } from "@/components/niji/niji-paper";
import { IconLeaf, IconPath, IconPlace, IconQr, IconStill } from "@/components/niji/icons";
import { paperGuardsCapture } from "@/lib/paper-guard";
import {
  nijiChatShareText,
  nijiChatUri,
  nijiHubShareText,
  nijiHubUri,
  nijiMistShareText,
  nijiMistUri,
} from "@/lib/niji-link";
import { nijiIdOf, paperOf } from "@/lib/presence";
import { readPlace, type PlacePoint } from "@/lib/place";
import { useStore } from "@/lib/store";
import { VANISH } from "@/lib/vanish";
import { mistFace } from "@/lib/ghost";
import type { Conversation, Disappear, PaperPart, User } from "@/lib/types";

export function ChatProfile({
  title,
  peer,
  isGroup,
  emoji,
  members,
  meId,
  convo,
  onChange,
  onThread,
  onClear,
  onClose,
  onLeave,
  onSharePlace,
}: {
  title: string;
  peer?: User;
  isGroup?: boolean;
  emoji?: string;
  members?: User[];
  meId?: string;
  convo: Conversation;
  onChange: (mode: Disappear) => void;
  onThread: (patch: { quiet?: boolean; keepStills?: boolean; pinned?: boolean }) => void;
  onClear: (part?: PaperPart) => void;
  onClose: () => void;
  onLeave?: () => void;
  onSharePlace?: (point: PlacePoint & { liveMs?: number }) => void;
}) {
  const count = members?.length ?? 0;
  const paper = paperOf(convo);
  const keepStills = convo.keepStills !== false;
  const [clearOpen, setClearOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeBusy, setPlaceBusy] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const { state } = useStore();
  const alias = state.ghostAliases.find((a) => a.id === convo.ghostAliasId);
  const qr =
    convo.ghost && alias
      ? {
          nijiId: alias.token,
          name: mistFace(alias.token),
          uri: nijiMistUri(alias.token),
          shareText: nijiMistShareText(alias.token, mistFace(alias.token)),
          kicker: "A Namaskaram that is not yours. The other person only sees this name.",
          shareLabel: "Share Niji ID",
        }
      : convo.shopId
        ? {
            nijiId: convo.shopId,
            name: convo.name || "Hub",
            uri: nijiHubUri(convo.shopId),
            shareText: nijiHubShareText(convo.shopId, convo.name || "Hub"),
            kicker: "A stall on the Namaskaram paper.",
            shareLabel: "Share stall",
          }
        : peer && !isGroup
          ? {
              nijiId: peer.nijiId,
              name: peer.name,
              uri: nijiChatUri(peer.nijiId),
              shareText: nijiChatShareText(peer.nijiId, peer.name),
              kicker: `A seal that finds ${peer.name.split(/\s+/)[0] || peer.name}.`,
              shareLabel: "Share Niji ID",
            }
          : null;

  return (
    <div className="bg-paper absolute inset-0 z-30 flex flex-col overflow-y-auto">
      <header className="flex items-center gap-2 px-3 py-3">
        <button type="button" onClick={onClose} className="px-1 text-xl text-neutral-500" aria-label="Back to chat">
          ‹
        </button>
        <p className="min-w-0 flex-1 text-[17px] font-medium">Profile</p>
        {qr ? (
          <button
            type="button"
            aria-label="Open QR"
            onClick={() => setPaperOpen(true)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EFEFF1] text-[#17171A]"
          >
            <IconQr className="size-4" />
          </button>
        ) : (
          <span className="w-9 shrink-0" />
        )}
      </header>

      <div className="flex flex-col items-center px-6 pt-2">
        {isGroup ? (
          <div className="flex size-16 items-center justify-center rounded-full bg-[#F7F4EA] text-2xl ring-1 ring-black/5">
            {emoji ?? "👥"}
          </div>
        ) : (
          <Person user={peer} size="lg" />
        )}
        <p className="mt-3 text-[20px] font-medium">{title}</p>
        {peer && !isGroup ? (
          <>
            <p className="mt-1 text-[13px] text-neutral-500">{nijiIdOf(peer)}</p>
            {peer.bio ? <p className="mt-3 text-center text-[14px] text-neutral-500">{peer.bio}</p> : null}
          </>
        ) : (
          <p className="mt-1 text-[13px] text-neutral-400">
            {count} {count === 1 ? "person" : "people"}
          </p>
        )}
      </div>

      {isGroup && members?.length ? (
        <div className="mt-8 px-5">
          <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">Members</p>
          <Raised className="overflow-hidden">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 last:border-b-0"
              >
                <Person user={member} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">
                    {member.id === meId ? `${member.name} (you)` : member.name}
                  </p>
                  <p className="truncate text-[12px] text-neutral-400">{nijiIdOf(member)}</p>
                </div>
              </div>
            ))}
          </Raised>
        </div>
      ) : null}

      {onSharePlace ? (
        <div className="mt-8 px-5">
          <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">Place</p>
          <button
            type="button"
            onClick={() => setPlaceOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl bg-[#F7F7F8] px-4 py-3.5 text-left"
          >
            <IconPlace className="size-5 text-[#17171A]" />
            <span>
              <span className="block text-[15px] text-[#17171A]">Share a place</span>
              <span className="text-[12px] text-neutral-400">Once, or live for a while</span>
            </span>
          </button>
        </div>
      ) : null}

      <div className="mt-8 px-5">
        <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">On this paper</p>
        <Raised className="flex items-center justify-around px-3 py-3.5">
          <span className="flex items-center gap-1.5 text-[#17171A]">
            <IconStill className="size-4 text-[#65656B]" />
            <span className="text-[15px] font-medium">{paper.stills.length}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#17171A]">
            <IconPath className="size-4 text-[#65656B]" />
            <span className="text-[15px] font-medium">{paper.paths.length}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[#17171A]">
            <IconLeaf className="size-4 text-[#65656B]" />
            <span className="text-[15px] font-medium">{paper.leaves.length}</span>
          </span>
        </Raised>
        {paper.stills.length ? (
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            {paper.stills.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.id} src={s.src} alt="" className="aspect-square rounded-lg object-cover" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 px-5">
        <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">How it fades</p>
        <div className="overflow-hidden rounded-2xl bg-[#F7F7F8]">
          {VANISH.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className="flex w-full items-center justify-between border-b border-neutral-100 px-4 py-3 text-left last:border-b-0"
            >
              <span>
                <span className="block text-[15px]">{m.label}</span>
                <span className="text-[12px] text-neutral-400">{m.hint}</span>
              </span>
              {convo.disappear === m.id ? <span className="text-neutral-900">✓</span> : null}
            </button>
          ))}
        </div>
        {paperGuardsCapture(convo) ? (
          <p className="mt-3 px-1 text-[12px] text-[#9B9AA0]">
            This paper hides from a recording and blocks a screenshot where the phone allows. A capture that still lands tells the other side.
          </p>
        ) : null}
      </div>

      <div className="mt-8 px-5">
        <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">On this phone</p>
        <div className="overflow-hidden rounded-2xl bg-[#F7F7F8]">
          <Row
            label="Pin"
            hint="Keep this chat at the top. Three pins at most."
            on={Boolean(convo.pinned)}
            onChange={(v) => onThread({ pinned: v })}
          />
          <Row
            label="Keep stills"
            hint="Save incoming photos on this device"
            on={keepStills}
            onChange={(v) => onThread({ keepStills: v })}
          />
          <Row
            label="Quiet"
            hint="Hide the unread mark for this thread"
            on={Boolean(convo.quiet)}
            onChange={(v) => onThread({ quiet: v })}
          />
        </div>
      </div>

      <div className="mt-8 px-5 pb-10">
        <p className="mb-2 text-[10px] tracking-caps text-neutral-400 uppercase">Edge</p>
        <button
          type="button"
          onClick={() => setClearOpen(true)}
          className="w-full rounded-2xl bg-[#F7F7F8] px-4 py-3.5 text-left text-[15px] text-[#17171A]"
        >
          Clear this paper
        </button>
        {onLeave ? (
          <button
            type="button"
            onClick={onLeave}
            className="mt-3 w-full rounded-2xl bg-[#F7F7F8] px-4 py-3.5 text-left text-[15px] text-[#C0392B]"
          >
            Leave group
          </button>
        ) : null}
      </div>

      {paperOpen && qr ? (
        <NijiPaper
          nijiId={qr.nijiId}
          name={qr.name}
          uri={qr.uri}
          shareText={qr.shareText}
          shareLabel={qr.shareLabel}
          kicker={qr.kicker}
          onClose={() => setPaperOpen(false)}
        />
      ) : null}

      {placeOpen && onSharePlace ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setPlaceOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Share a place</p>
            <p className="mt-1 text-center text-[12px] text-[#9B9AA0]">Send where you are. Live fades on its own.</p>
            {(
              [
                [undefined, "Send once"],
                [15 * 60_000, "Live · 15 minutes"],
                [60 * 60_000, "Live · 1 hour"],
              ] as const
            ).map(([liveMs, label]) => (
              <button
                key={label}
                type="button"
                disabled={placeBusy}
                className="mt-3 w-full rounded-2xl bg-white px-4 py-3.5 text-left text-[15px] text-[#17171A] disabled:opacity-40"
                onClick={() => {
                  setPlaceBusy(true);
                  void readPlace().then((point) => {
                    onSharePlace({ ...point, liveMs });
                    setPlaceBusy(false);
                    setPlaceOpen(false);
                    onClose();
                  });
                }}
              >
                {label}
              </button>
            ))}
            <button type="button" onClick={() => setPlaceOpen(false)} className="mt-3 w-full py-3 text-[14px] text-[#9B9AA0]">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {clearOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => setClearOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Clear this paper</p>
            <p className="mt-1 text-center text-[12px] text-[#9B9AA0]">Pick what fades. This stays on this phone.</p>
            <div className="mt-4 overflow-hidden rounded-2xl bg-white">
              {(
                [
                  ["all", "Clear everything", "Stills, paths, leaves — the whole paper"],
                  ["stills", "Clear stills", "Photos on this paper"],
                  ["paths", "Clear paths", "Links on this paper"],
                  ["leaves", "Clear leaves", "Files on this paper"],
                ] as const
              ).map(([part, label, hint], i) => (
                <button
                  key={part}
                  type="button"
                  onClick={() => {
                    onClear(part);
                    setClearOpen(false);
                  }}
                  className={`w-full px-4 py-3.5 text-left ${i ? "border-t border-neutral-100" : ""}`}
                >
                  <span className="block text-[15px] text-[#17171A]">{label}</span>
                  <span className="text-[12px] text-[#9B9AA0]">{hint}</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setClearOpen(false)} className="mt-3 w-full py-3 text-[14px] text-[#9B9AA0]">
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between border-b border-neutral-100 px-4 py-3 text-left last:border-b-0"
    >
      <span>
        <span className="block text-[15px]">{label}</span>
        <span className="text-[12px] text-neutral-400">{hint}</span>
      </span>
      <span className={`h-6 w-10 rounded-full ${on ? "bg-neutral-900" : "bg-neutral-300"}`}>
        <span className={`block size-5 rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
    </button>
  );
}
