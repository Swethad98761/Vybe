"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

let fired = false;
const KEY = "niji-incoming-demo";

export function IncomingDemo() {
  const { authed, state, receiveCall, openChatWith } = useStore();

  useEffect(() => {
    if (!authed || fired || state.call) return;
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => {
      if (fired) return;
      fired = true;
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {
        /* private mode */
      }
      const conversationId = openChatWith("priya");
      receiveCall("priya", "voice", conversationId);
    }, 3600);
    return () => window.clearTimeout(t);
  }, [authed, state.call, receiveCall, openChatWith]);

  return null;
}
