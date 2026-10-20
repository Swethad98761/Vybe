import type { Conversation, Message } from "./types";
import { givenName } from "./vybe-stats";

/** Ash, a seal, Mist, or stills turned off — this paper notices a capture. */
export function paperGuardsCapture(
  convo: Pick<Conversation, "disappear" | "sealed" | "ghost" | "keepStills" | "lane">,
) {
  if (convo.lane === "hub") return false;
  if (convo.disappear === "view-once") return true;
  if (convo.sealed) return true;
  if (convo.ghost) return true;
  if (convo.keepStills === false) return true;
  return false;
}

/** Copy a line. Never on Ash, a seal, or Mist — that is a forward by another name. */
export function paperAllowsCopy(
  convo: Pick<Conversation, "disappear" | "sealed" | "ghost">,
) {
  return convo.disappear !== "view-once" && !convo.sealed && !convo.ghost;
}

export function copyableText(message: Pick<Message, "kind" | "text" | "file">) {
  if (message.kind === "call" || message.kind === "notice" || message.kind === "voice") return "";
  if (message.file) return message.file.name;
  return message.text.trim();
}

export function captureNoticeLine(opts: {
  mine: boolean;
  name?: string;
  kind?: Message["notice"];
}) {
  if (opts.mine) {
    return opts.kind === "record" ? "This paper hid from a recording." : "This paper noticed a capture.";
  }
  const who = givenName(opts.name) || "Someone";
  return opts.kind === "record" ? `${who} tried to record this paper.` : `${who} tried to capture this paper.`;
}
