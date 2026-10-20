"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Person } from "@/components/niji/person";
import { Groove, IconHit, Raised } from "@/components/niji/chrome";
import { IconForward, IconPlus } from "@/components/niji/icons";
import { useStore } from "@/lib/store";
import { useAppNav } from "@/components/web/use-app-nav";

const GROUP_EMOJIS = ["🌊", "🔥", "⭐", "🎯", "💫", "🏆", "🎉", "🌈", "🚀", "💎", "🌸", "⚡", "🎨", "🌙", "🦋", "🎪"];

export function ChatNewGroup() {
  const { state, me, createGroup } = useStore();
  const router = useRouter();
  const appNav = useAppNav();
  const [step, setStep] = useState<1 | 2>(1);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌊");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (u) => u.name.toLowerCase().includes(needle) || u.nijiId.toLowerCase().includes(needle),
    );
  }, [state.users, me.id, q]);

  const chosen = state.users.filter((u) => selected.includes(u.id));
  const canNext = selected.length >= 2;
  const canCreate = name.trim().length > 0 && canNext;

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => appNav.toChatNew()}
              className="text-[22px] leading-none text-[#65656B]"
              aria-label="Back"
            >
              ‹
            </button>
          ) : (
            <button
              type="button"
              className="text-[22px] leading-none text-[#65656B]"
              onClick={() => setStep(1)}
              aria-label="Back"
            >
              ‹
            </button>
          )}
          <h1 className="text-[21px] font-semibold tracking-tight text-[#17171A]">
            {step === 1 ? "People" : "Group"}
          </h1>
        </div>
        {step === 1 ? (
          <button type="button" disabled={!canNext} onClick={() => setStep(2)} aria-label="Next">
            <IconHit disabled={!canNext}>
              <IconForward className="size-5" />
            </IconHit>
          </button>
        ) : (
          <button
            type="button"
            disabled={!canCreate}
            aria-label="Create group"
            onClick={() => {
              const id = createGroup(selected, name.trim(), emoji);
              appNav.toChat(id);
            }}
          >
            <IconHit disabled={!canCreate}>
              <IconPlus className="size-5" />
            </IconHit>
          </button>
        )}
      </header>

      {step === 1 ? (
        <>
          {chosen.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto px-5 pb-3 no-scrollbar">
              {chosen.map((person) => (
                <button key={person.id} type="button" onClick={() => toggle(person.id)} className="shrink-0">
                  <Person user={person} />
                </button>
              ))}
            </div>
          ) : null}
          <div className="px-5 pb-3">
            <Groove>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="h-11 w-full bg-transparent text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
            </Groove>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
            {people.map((person) => {
              const on = selected.includes(person.id);
              return (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => toggle(person.id)}
                  className="mb-2.5 block w-full text-left"
                >
                  <Raised className="px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      <Person user={person} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium text-[#17171A]">{person.name}</p>
                        <p className="truncate text-[13px] text-[#65656B]">
                          {person.online ? "Active now" : person.nijiId}
                        </p>
                      </div>
                      <span
                        className={`size-5 rounded-full ${
                          on ? "bg-[#17171A]" : "bg-transparent ring-1 ring-[#BFBEC3]"
                        }`}
                      />
                    </div>
                  </Raised>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto px-5 pb-8">
          <div className="flex flex-col items-center gap-5 py-8">
            <Raised className="grid size-20 place-items-center rounded-full text-4xl">{emoji}</Raised>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              autoFocus
              className="w-full bg-transparent py-2 text-center text-[22px] font-medium tracking-tight text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              style={{ borderBottom: "1px solid rgba(23,23,26,0.08)" }}
            />
          </div>
          <div className="grid grid-cols-8 gap-2">
            {GROUP_EMOJIS.map((mark) => (
              <button
                key={mark}
                type="button"
                onClick={() => setEmoji(mark)}
                className={`grid size-10 place-items-center rounded-full text-xl ${
                  emoji === mark ? "bg-[#D7D7DA] ring-1 ring-[#17171A]" : "bg-[#E1E1E3]"
                }`}
              >
                {mark}
              </button>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            {chosen.map((person) => (
              <Person key={person.id} user={person} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
