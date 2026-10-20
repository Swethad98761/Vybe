"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { relativeTime } from "@/lib/format";
import { isAround, previewOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { Person } from "@/components/niji/person";
import { Raised } from "@/components/niji/chrome";
import { VybeProfile } from "@/components/screens/vybe-profile";

export function VybeChatPane({
  pick,
  onPick,
}: {
  pick: boolean;
  onPick: (open: boolean) => void;
}) {
  const router = useRouter();
  const { state, me, userById, openVybeChat } = useStore();
  const [profileOf, setProfileOf] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      state.conversations
        .filter((c) => c.lane === "vybe" && !c.ghost)
        .sort((a, b) => (b.messages.at(-1)?.createdAt ?? "").localeCompare(a.messages.at(-1)?.createdAt ?? "")),
    [state.conversations],
  );
  const people = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
      {rows.length === 0 ? (
        <p className="px-2 py-16 text-center text-[13px] text-[#9B9AA0]">
          Vybe chats live here. Share a post, or start one — regular Chat stays clear.
        </p>
      ) : (
        rows.map((c) => {
          const peerId = c.participantIds.find((id) => id !== me.id) ?? "";
          const peer = userById(peerId);
          const last = c.messages.at(-1);
          const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);
          return (
            <div key={c.id} className="mb-2.5">
              <Raised className="px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="shrink-0"
                    aria-label={`${peer?.name ?? "Friend"} vybe profile`}
                    onClick={() => {
                      if (peer) setProfileOf(peer.id);
                    }}
                  >
                    <Person user={peer} size="sm" place="chat" around={around} vybeOn={state.vybeEnabled} />
                  </button>
                  <Link href={`/chat/${c.id}`} className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-[15px] font-medium text-[#17171A]">{peer?.name ?? "Vybe"}</p>
                      <span className="text-[11px] text-[#9B9AA0]">{last ? relativeTime(last.createdAt) : ""}</span>
                    </div>
                    <p className="truncate text-[13px] text-[#65656B]">{previewOf(last)}</p>
                  </Link>
                </div>
              </Raised>
            </div>
          );
        })
      )}

      {profileOf ? <VybeProfile userId={profileOf} onClose={() => setProfileOf(null)} /> : null}

      {pick ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={() => onPick(false)}>
          <div
            className="absolute inset-x-0 bottom-0 max-h-[70%] overflow-y-auto rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Vybe chat</p>
            <div className="mt-4 space-y-2">
              {people.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    const id = openVybeChat(u.id);
                    onPick(false);
                    router.push(`/chat/${id}`);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left"
                >
                  <Person user={u} size="sm" />
                  <span className="text-[15px]">{u.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
