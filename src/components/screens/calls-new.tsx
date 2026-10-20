"use client";

import { useMemo, useState } from "react";
import { Person } from "@/components/niji/person";
import { Groove, IconHit, Raised } from "@/components/niji/chrome";
import { IconCalls, IconVideo } from "@/components/niji/icons";
import { useStore } from "@/lib/store";
import { useAppNav } from "@/components/web/use-app-nav";

export function CallsNew() {
  const { state, me, openChatWith, startCall } = useStore();
  const appNav = useAppNav();
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (u) => u.name.toLowerCase().includes(needle) || u.nijiId.toLowerCase().includes(needle),
    );
  }, [state.users, me.id, q]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-paper">
      <header className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => appNav.toCalls()}
          className="text-[22px] leading-none text-[#65656B]"
          aria-label="Back to Calls"
        >
          ‹
        </button>
        <h1 className="text-[21px] font-semibold tracking-tight text-[#17171A]">Call</h1>
      </header>
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
        {people.map((person) => (
          <Raised key={person.id} className="mb-2.5 px-3.5 py-3">
            <div className="flex items-center gap-3">
              <Person user={person} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-[#17171A]">{person.name}</p>
                <p className="truncate text-[13px] text-[#65656B]">
                  {person.online ? "Active now" : person.nijiId}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Voice ${person.name}`}
                onClick={() => startCall(person.id, "voice", openChatWith(person.id))}
              >
                <IconHit>
                  <IconCalls className="size-4" />
                </IconHit>
              </button>
              <button
                type="button"
                aria-label={`Video ${person.name}`}
                onClick={() => startCall(person.id, "video", openChatWith(person.id))}
              >
                <IconHit>
                  <IconVideo className="size-4" />
                </IconHit>
              </button>
            </div>
          </Raised>
        ))}
      </div>
    </div>
  );
}
