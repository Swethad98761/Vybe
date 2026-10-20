"use client";

import { useEffect, type ReactNode } from "react";

/** Rings play on the share mark itself — same idea as a comment going bold. */
export function ShareRipple({
  play,
  onDone,
  children,
}: {
  play?: boolean;
  onDone?: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!play || !onDone) return;
    const t = window.setTimeout(onDone, 780);
    return () => window.clearTimeout(t);
  }, [play, onDone]);

  return (
    <span className="relative inline-flex items-center justify-center leading-none">
      {play ? (
        <svg className="pointer-events-none absolute -inset-2.5" viewBox="0 0 40 40" aria-hidden>
          <circle className="niji-share-ring" cx="20" cy="20" r="6" />
          <circle className="niji-share-ring niji-share-ring-2" cx="20" cy="20" r="6" />
          <circle className="niji-share-ring niji-share-ring-3" cx="20" cy="20" r="6" />
        </svg>
      ) : null}
      {children}
    </span>
  );
}
