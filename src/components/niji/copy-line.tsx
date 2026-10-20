"use client";

import { useRef, useState } from "react";

export function CopyLine({
  text,
  allow,
  children,
}: {
  text: string;
  allow: boolean;
  children: React.ReactNode;
}) {
  const [hint, setHint] = useState("");
  const hold = useRef<number | null>(null);

  async function copy() {
    if (!allow || !text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setHint("Copied");
    window.setTimeout(() => setHint(""), 1400);
  }

  function arm() {
    if (!allow) return;
    hold.current = window.setTimeout(() => {
      void copy();
    }, 480);
  }

  function clear() {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = null;
  }

  return (
    <span
      className={allow ? "select-text" : "select-none"}
      onDoubleClick={() => void copy()}
      onPointerDown={arm}
      onPointerUp={clear}
      onPointerCancel={clear}
      onPointerLeave={clear}
    >
      {children}
      {hint ? <span className="mt-1 block text-[10px] opacity-55">{hint}</span> : null}
    </span>
  );
}
