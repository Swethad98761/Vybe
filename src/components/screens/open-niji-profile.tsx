"use client";

import { useRouter } from "next/navigation";
import { userByNijiId } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { VybeProfile } from "@/components/screens/vybe-profile";

export function OpenNijiProfile({ nijiId }: { nijiId: string }) {
  const router = useRouter();
  const { state } = useStore();
  const user = userByNijiId(state.users, nijiId);
  const back = () => router.push("/vybe");

  if (!user) {
    return (
      <div className="flex h-full flex-col bg-paper">
        <header className="flex items-center gap-2 px-3 py-3">
          <button type="button" onClick={back} className="px-1 text-xl text-neutral-500" aria-label="Back">
            ‹
          </button>
          <p className="text-[17px] font-medium">Niji</p>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="text-[16px] font-medium text-[#17171A]">{nijiId}</p>
          <p className="mt-2 text-[14px] text-[#65656B]">This Niji isn’t on this phone yet.</p>
        </div>
      </div>
    );
  }

  return <VybeProfile userId={user.id} onClose={back} />;
}
