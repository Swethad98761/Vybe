import { useEffect } from "react";
import { useStore } from "@/lib/store";

let fired = false;

export function IncomingDemo() {
  const { authed, state, receiveCall, openChatWith } = useStore();

  useEffect(() => {
    if (!authed || fired || state.call) return;
    const t = setTimeout(() => {
      if (fired) return;
      fired = true;
      const conversationId = openChatWith("priya");
      receiveCall("priya", "voice", conversationId);
    }, 3600);
    return () => clearTimeout(t);
  }, [authed, state.call, receiveCall, openChatWith]);

  return null;
}
