"use client";

import { useEffect } from "react";

/** Web cannot block an OS screenshot. Print Screen still tells the paper. */
export function usePaperCapture(on: boolean, onAttempt: (kind: "screenshot" | "record") => void) {
  useEffect(() => {
    if (!on) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen" || event.code === "PrintScreen") onAttempt("screenshot");
    };
    const onSignal = () => onAttempt("screenshot");
    const onCopy = (event: ClipboardEvent) => {
      const root = event.target;
      if (!(root instanceof Node)) return;
      if (document.getElementById("niji-guarded-paper")?.contains(root)) {
        event.preventDefault();
        onAttempt("screenshot");
      }
    };
    window.addEventListener("keyup", onKey);
    window.addEventListener("niji-paper-capture", onSignal);
    document.addEventListener("copy", onCopy, true);
    return () => {
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("niji-paper-capture", onSignal);
      document.removeEventListener("copy", onCopy, true);
    };
  }, [on, onAttempt]);
}
