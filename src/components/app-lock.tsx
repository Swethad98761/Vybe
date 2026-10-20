"use client";

import { useEffect, useRef } from "react";
import { SealGate } from "@/components/screens/seal-gate";
import { useStore } from "@/lib/store";

/** Locks Niji when this phone sleeps. Face / four digits open it. */
export function AppLockHost() {
  const { state, setLock } = useStore();
  const hideAt = useRef<number | null>(null);

  useEffect(() => {
    if (!state.appLock) return;
    const onVis = () => {
      if (document.hidden) {
        hideAt.current = Date.now();
        return;
      }
      const slept = hideAt.current ? Date.now() - hideAt.current : 0;
      hideAt.current = null;
      if (slept > 1200) setLock(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [state.appLock, setLock]);

  if (!state.appLock || !state.locked) return null;

  return (
    <div className="fixed inset-0 z-[80] md:left-1/2 md:w-[430px] md:-translate-x-1/2">
      <SealGate
        kind="app"
        mode="open"
        hash={state.sealPin}
        onClose={() => {}}
        onUnlock={() => setLock(false)}
      />
    </div>
  );
}
