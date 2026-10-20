"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Person } from "@/components/niji/person";
import { Groove, Raised } from "@/components/niji/chrome";
import { IconUserPlus } from "@/components/niji/icons";
import { useStore } from "@/lib/store";
import { useAppNav } from "@/components/web/use-app-nav";

export function ChatNew() {
  const { state, me, openChatWith } = useStore();
  const router = useRouter();
  const appNav = useAppNav();
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));
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
          onClick={() => appNav.toChatList()}
          className="text-[22px] leading-none text-[#65656B]"
          aria-label="Back to Chat"
        >
          ‹
        </button>
        <h1 className="text-[21px] font-semibold tracking-tight text-[#17171A]">Chat</h1>
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
        <button type="button" onClick={() => appNav.toChatNewGroup()} className="mb-2.5 block w-full text-left">
          <Raised className="px-3.5 py-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-[#EFEFF1] text-[#17171A]">
                <IconUserPlus className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-[#17171A]">New group</p>
                <p className="truncate text-[13px] text-[#65656B]">Three or more, one thread.</p>
              </div>
            </div>
          </Raised>
        </button>
        {people.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-[#9B9AA0]">No one matches that name.</p>
        ) : (
          people.map((person) => (
            <button
              key={person.id}
              type="button"
              onClick={() => {
                const id = openChatWith(person.id);
                appNav.toChat(id);
              }}
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
                </div>
              </Raised>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
