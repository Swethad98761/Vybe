"use client";

import { useState } from "react";
import { Chip, Groove, Raised } from "@/components/niji/chrome";
import { MoodWash, StatusPaperRail, moodInk } from "@/components/niji/moods";
import { Person } from "@/components/niji/person";
import { STATUS_TTLS } from "@/lib/presence";
import { useStore } from "@/lib/store";
import type { StatusPaperId } from "@/lib/tokens";
import type { StatusAudience, StatusTtl } from "@/lib/types";

const STILLS = [
  "/media/posts/night-city.jpg",
  "/media/posts/coffee.jpg",
  "/media/posts/road.jpg",
  "/media/posts/concert.jpg",
];

export type StatusDraft = {
  text?: string;
  image?: string;
  resharedFrom?: string;
  resharedFromAuthorId?: string;
};

export function StatusCompose({
  onClose,
  lane = "chat",
  draft,
}: {
  onClose: () => void;
  lane?: "chat" | "vybe";
  draft?: StatusDraft;
}) {
  const { addStatus, state, me, userById } = useStore();
  const [text, setText] = useState(draft?.text ?? "");
  const [image, setImage] = useState<string | undefined>(draft?.image);
  const [postId, setPostId] = useState<string>();
  const [ttl, setTtl] = useState<StatusTtl>("1d");
  const [audience, setAudience] = useState<StatusAudience>("public");
  const [reshareable, setReshareable] = useState(false);
  const [mood, setMood] = useState<StatusPaperId>("plain");
  const mine = state.posts.filter((p) => p.authorId === me.id && !p.archived);
  const from = draft?.resharedFromAuthorId ? userById(draft.resharedFromAuthorId) : undefined;
  const vybe = lane === "vybe";

  return (
    <div className="fixed inset-0 z-[80] bg-black/30 md:left-1/2 md:w-[430px] md:-translate-x-1/2" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 flex max-h-[92%] flex-col overflow-hidden rounded-t-[28px] bg-[#F7F7F8]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <button type="button" onClick={onClose} className="px-1 text-[15px] text-[#65656B]">
            Cancel
          </button>
          <p className="text-[11px] tracking-caps uppercase text-neutral-400">
            {from ? "Reshare" : vybe ? "Vybe status" : "Your status"}
          </p>
          <span className="w-14" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
          <p className="text-center text-[12px] text-[#9B9AA0]">
            {from
              ? `From ${from.name}. It lands on your rail, then it fades.`
              : vybe
                ? "Lives on the story rail. Public or friends. Then it fades."
                : "Lives in chat. Friends see it on your photo, then it fades. A vybe can ride along."}
          </p>
          <Groove className="mt-4 py-3">
            <textarea
              value={text}
              maxLength={140}
              onChange={(e) => setText(e.target.value)}
              placeholder="A line, if you want one"
              className="h-20 w-full resize-none bg-transparent text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
            />
          </Groove>
          {!image ? (
            <>
              <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">Paper</p>
              <p className="mt-1 text-[12px] text-[#9B9AA0]">Face top-left. The line sits in the middle.</p>
              <div className="mt-2">
                <StatusPaperRail value={mood} onChange={setMood} />
              </div>
            </>
          ) : null}
          <div className="relative mt-3 h-40 overflow-hidden rounded-[18px] bg-[#EBEBEC]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
            ) : (
              <MoodWash id={mood} />
            )}
            {image ? <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" /> : null}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <Person user={me} size="sm" around={false} />
            </div>
            <p
              className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center font-serif text-[20px] leading-snug"
              style={{ color: image ? "#fff" : moodInk(mood) }}
            >
              {text.trim() || "Your line sits here."}
            </p>
          </div>
          {vybe ? (
            <>
              <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">Who sees it</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setAudience("public")}>
                  <Chip on={audience === "public"}>Public</Chip>
                </button>
                <button type="button" onClick={() => setAudience("friends")}>
                  <Chip on={audience === "friends"}>Friends</Chip>
                </button>
              </div>
              <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">Reshare</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setReshareable(false)}>
                  <Chip on={!reshareable}>Keep it here</Chip>
                </button>
                <button type="button" onClick={() => setReshareable(true)}>
                  <Chip on={reshareable}>Others can reshare</Chip>
                </button>
              </div>
            </>
          ) : null}
          <p className="mt-4 text-[10px] tracking-caps uppercase text-neutral-400">Lasts</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STATUS_TTLS.map((t) => (
              <button key={t.id} type="button" onClick={() => setTtl(t.id)}>
                <Chip on={ttl === t.id}>{t.label}</Chip>
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] tracking-caps uppercase text-neutral-400">Still</p>
            <div className="flex items-center gap-3">
              <label className="text-[12px] text-[#17171A]">
                From gallery
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") setImage(reader.result);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
              {image ? (
                <button type="button" className="text-[12px] text-[#9B9AA0]" onClick={() => setImage(undefined)}>
                  Clear still
                </button>
              ) : null}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {STILLS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setImage(src)}
                className={`overflow-hidden rounded-lg ${image === src ? "ring-2 ring-[#17171A]" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-square object-cover" />
              </button>
            ))}
          </div>
          {!vybe && mine.length ? (
            <div className="mt-4">
              <p className="text-[10px] tracking-caps uppercase text-neutral-400">A vybe</p>
              <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
                {mine.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPostId((id) => (id === p.id ? undefined : p.id))}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg ${
                      postId === p.id ? "ring-2 ring-[#17171A]" : ""
                    }`}
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center bg-[#EFEFF1] px-1 text-[10px] text-[#65656B]">
                        Vybe
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            disabled={!text.trim() && !image && !postId}
            onClick={() => {
              const picked = postId ? mine.find((p) => p.id === postId) : undefined;
              addStatus({
                text: text.trim() || undefined,
                image: image || picked?.image,
                mood,
                ttl,
                lane,
                audience: vybe ? audience : undefined,
                reshareable: vybe ? reshareable : undefined,
                resharedFrom: draft?.resharedFrom,
                resharedFromAuthorId: draft?.resharedFromAuthorId,
              });
              onClose();
            }}
            className="mt-5 mb-2 w-full disabled:opacity-30"
          >
            <Raised className="flex h-12 items-center justify-center text-[13px] font-semibold tracking-[0.16em] text-[#17171A] uppercase">
              Put it up
            </Raised>
          </button>
        </div>
      </div>
    </div>
  );
}
