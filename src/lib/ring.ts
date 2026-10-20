/** Green = around. Orange = unseen status on the story rail. Silver = Namaskaram, Vybe only. */
export const RING_GREEN = "#2F7A4A";
export const RING_ORANGE = "#E07020";
/** Cool metal with a neon edge — not paper-white. */
export const RING_SILVER = "#C2D4E8";
export const RING_SILVER_EDGE = "#7A8FA8";
export const RING_WHITE = "rgba(255,255,255,0.96)";
export const RING_STROKE = 1.2;
export const RING_SOFT_MS = 3400;
export const RING_SILVER_GLOW =
  "drop-shadow(0 0 2.8px #8EC8FF) drop-shadow(0 0 0.5px #5A738C)";

export type RingPlace = "chat" | "vybe" | "story";
export type StatusLane = "chat" | "vybe";

export function ringPair(opts: {
  place?: RingPlace;
  around?: boolean;
  pulse?: boolean;
  verified?: boolean;
  vybeOn?: boolean;
}): { hold: string | null; fade: string | null; chrome: boolean } {
  const live = Boolean(opts.around) && opts.vybeOn !== false;
  if (opts.place === "story") {
    if (opts.pulse) return { hold: RING_ORANGE, fade: null, chrome: false };
    return { hold: null, fade: null, chrome: false };
  }
  if (opts.place === "vybe") {
    if (live && opts.verified) return { hold: RING_GREEN, fade: RING_SILVER, chrome: true };
    if (live) return { hold: RING_GREEN, fade: null, chrome: false };
    if (opts.verified) return { hold: RING_SILVER, fade: null, chrome: true };
    return { hold: null, fade: null, chrome: false };
  }
  if (live) return { hold: RING_GREEN, fade: null, chrome: false };
  return { hold: null, fade: null, chrome: false };
}

export function ringPad(hold: boolean, fade: boolean) {
  if (hold || fade) return 4;
  return 0;
}
