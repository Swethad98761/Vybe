"use client";

import { useRef, useState } from "react";
import { hashSealPin, pinMatches } from "@/lib/seal";

export function SealGate({
  mode,
  hash,
  kind = "chat",
  onClose,
  onSet,
  onUnlock,
}: {
  mode: "set" | "open";
  hash?: string;
  kind?: "chat" | "app";
  onClose: () => void;
  onSet?: (pinHash: string) => void;
  onUnlock?: () => void;
}) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const confirming = mode === "set" && first !== null;

  function submit(code: string) {
    if (mode === "set") {
      if (!first) {
        setFirst(code);
        setDigits(["", "", "", ""]);
        setError("");
        refs.current[0]?.focus();
        return;
      }
      if (code !== first) {
        setError("Those didn't match. Once more.");
        setFirst(null);
        setDigits(["", "", "", ""]);
        refs.current[0]?.focus();
        return;
      }
      onSet?.(hashSealPin(code));
      return;
    }
    if (!pinMatches(code, hash)) {
      setError("Not that code.");
      setDigits(["", "", "", ""]);
      refs.current[0]?.focus();
      return;
    }
    onUnlock?.();
  }

  function onDigit(i: number, raw: string) {
    const d = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < 3) refs.current[i + 1]?.focus();
    if (d && i === 3 && next.every(Boolean)) submit(next.join(""));
  }

  const app = kind === "app";

  return (
    <div className="bg-paper absolute inset-0 z-50 flex flex-col" onClick={app && mode === "open" ? undefined : onClose}>
      <div className="flex flex-1 flex-col items-center px-8 pt-24">
        <p className="text-[17px] font-medium text-[#17171A]">
          {mode === "open"
            ? app
              ? "This phone is locked"
              : "This paper is sealed"
            : confirming
              ? "Once more"
              : "A seal code"}
        </p>
        <p className="mt-2 text-center text-[13px] text-[#9B9AA0]">
          {mode === "open"
            ? app
              ? "Four digits to open Niji on this phone."
              : "Four digits to open it. Tap the paper to leave."
            : confirming
              ? "Same four digits."
              : app
                ? "Four digits. Face or thumb can open this phone after this."
                : "Four digits. Face or thumb can open it on the phone."}
        </p>
        <div className="mt-8 flex gap-3" onClick={(e) => e.stopPropagation()}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={(e) => onDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="h-12 w-10 border-b border-[#D7D7DA] bg-transparent text-center text-xl text-[#17171A] outline-none focus:border-[#17171A]"
            />
          ))}
        </div>
        {error ? <p className="mt-5 text-[13px] text-[#65656B]">{error}</p> : null}
      </div>
    </div>
  );
}
