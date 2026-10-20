import { useEffect, useRef } from "react";
import { AppState, Modal } from "react-native";
import { SealGate } from "@/components/seal-gate";
import { useStore } from "@/lib/store";

/** Locks Niji when this phone sleeps. Face / four digits open it. */
export function AppLockHost() {
  const { state, setLock } = useStore();
  const hideAt = useRef<number | null>(null);

  useEffect(() => {
    if (!state.appLock) return;
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") {
        hideAt.current = Date.now();
        return;
      }
      const slept = hideAt.current ? Date.now() - hideAt.current : 0;
      hideAt.current = null;
      if (slept > 1200) setLock(true);
    });
    return () => sub.remove();
  }, [state.appLock, setLock]);

  if (!state.appLock || !state.locked) return null;

  return (
    <Modal visible animationType="fade" onRequestClose={() => {}}>
      <SealGate kind="app" mode="open" hash={state.sealPin} onClose={() => {}} onUnlock={() => setLock(false)} />
    </Modal>
  );
}
