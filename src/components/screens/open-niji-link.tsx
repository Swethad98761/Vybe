"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cleanNijiId, userByNijiId } from "@/lib/niji-link";
import { cleanVeil } from "@/lib/ghost";
import { useStore } from "@/lib/store";

export function OpenMist({ token }: { token: string }) {
  const router = useRouter();
  const { ready, meetVeil } = useStore();
  const [miss, setMiss] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const id = meetVeil(token);
    if (id) {
      router.replace(`/chat/${id}`);
      return;
    }
    setMiss(true);
  }, [ready, token, meetVeil, router]);

  return (
    <div className="flex h-full flex-col bg-paper">
      <header className="flex items-center gap-2 px-3 py-3">
        <button type="button" onClick={() => router.push("/chat")} className="px-1 text-xl text-neutral-500" aria-label="Back">
          ‹
        </button>
        <p className="text-[17px] font-medium">Mist</p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-[16px] font-medium text-[#17171A]">{cleanVeil(token) || token}</p>
        <p className="mt-2 text-[14px] text-[#65656B]">
          {miss ? "This mist isn’t live on this phone." : "Opening this name…"}
        </p>
      </div>
    </div>
  );
}

export function OpenChatWith({ nijiId }: { nijiId: string }) {
  const router = useRouter();
  const { ready, state, openChatWith } = useStore();
  const [miss, setMiss] = useState(false);
  const id = cleanNijiId(nijiId);

  useEffect(() => {
    if (!ready) return;
    const user = userByNijiId(state.users, id);
    if (!user) {
      setMiss(true);
      return;
    }
    const convo = openChatWith(user.id);
    router.replace(`/chat/${convo}`);
  }, [ready, id, state.users, openChatWith, router]);

  return (
    <div className="flex h-full flex-col bg-paper">
      <header className="flex items-center gap-2 px-3 py-3">
        <button type="button" onClick={() => router.push("/chat")} className="px-1 text-xl text-neutral-500" aria-label="Back">
          ‹
        </button>
        <p className="text-[17px] font-medium">Chat</p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <p className="text-[16px] font-medium text-[#17171A]">{id}</p>
        <p className="mt-2 text-[14px] text-[#65656B]">
          {miss ? "This Niji isn’t on this phone yet." : "Opening chat…"}
        </p>
      </div>
    </div>
  );
}
