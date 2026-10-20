"use client";

import { cn } from "@/lib/utils";
import { useWebNav } from "@/components/web/web-nav";

/**
 * Phone shell centers overlays in a 430px column.
 * Desk shell fills the salon stage so QR / sheets are not floating mid-viewport.
 */
export function useShellOverlay(...extra: (string | false | null | undefined)[]) {
  const desk = Boolean(useWebNav());
  return cn(
    desk
      ? "absolute inset-0"
      : "fixed inset-0 md:left-1/2 md:w-[430px] md:-translate-x-1/2",
    ...extra,
  );
}

export function shellOverlayClass(desk: boolean, ...extra: (string | false | null | undefined)[]) {
  return cn(
    desk
      ? "absolute inset-0"
      : "fixed inset-0 md:left-1/2 md:w-[430px] md:-translate-x-1/2",
    ...extra,
  );
}
