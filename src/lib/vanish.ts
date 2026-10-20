import type { Disappear } from "./types";

export const VANISH: { id: Disappear; label: string; hint: string }[] = [
  { id: "off", label: "Held", hint: "stays on the paper" },
  { id: "view-once", label: "Ash", hint: "gone after they look · a capture tells them" },
  { id: "24h", label: "Sundown", hint: "fades with the day" },
  { id: "7d", label: "A moon", hint: "a week, then it lifts" },
];
