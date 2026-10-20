"use client";

import { cn } from "@/lib/utils";
import { RING_SILVER, RING_SILVER_GLOW, RING_STROKE, ringPad, ringPair, type RingPlace } from "@/lib/ring";
import type { User } from "@/lib/types";

const PHOTO = { xs: 28, sm: 36, md: 44, lg: 64 } as const;

function Rings({
  size,
  hold,
  fade,
}: {
  size: number;
  hold: string | null;
  fade: string | null;
}) {
  if (!hold && !fade) return null;
  const pad = ringPad(Boolean(hold), Boolean(fade));
  const box = size + pad;
  const mid = box / 2;
  const r = (box - RING_STROKE) / 2 - 0.2;
  const dual = Boolean(hold && fade);
  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={box}
      height={box}
      viewBox={`0 0 ${box} ${box}`}
      aria-hidden
    >
      {hold ? (
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={hold}
          strokeWidth={RING_STROKE}
          vectorEffect="non-scaling-stroke"
          className={dual ? "niji-ring-soft-a" : undefined}
          style={hold === RING_SILVER ? { filter: RING_SILVER_GLOW } : undefined}
        />
      ) : null}
      {fade ? (
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={fade}
          strokeWidth={RING_STROKE}
          vectorEffect="non-scaling-stroke"
          className="niji-ring-soft-b"
          style={fade === RING_SILVER ? { filter: RING_SILVER_GLOW } : undefined}
        />
      ) : null}
    </svg>
  );
}

export function Person({
  user,
  size = "md",
  className,
  around,
  pulse,
  vybeOn = true,
  story,
  place,
}: {
  user?: Pick<User, "name" | "emoji" | "photo" | "online" | "verified"> | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  around?: boolean;
  pulse?: boolean;
  seen?: boolean;
  vybeOn?: boolean;
  story?: boolean;
  place?: RingPlace;
}) {
  const dim =
    size === "xs"
      ? "size-7 text-[11px]"
      : size === "sm"
        ? "size-9 text-base"
        : size === "lg"
          ? "size-16 text-2xl"
          : "size-11 text-lg";
  const px = PHOTO[size];
  const live =
    around !== undefined ? around : place === "vybe" ? Boolean(user?.online) : false;
  const { hold, fade } = ringPair({
    place: story ? "story" : place,
    around: live,
    pulse: Boolean(pulse),
    verified: Boolean(user?.verified),
    vybeOn,
  });
  const pad = ringPad(Boolean(hold), Boolean(fade));
  const box = px + pad;
  if (!user) return <div className={cn("rounded-full bg-neutral-100", dim, className)} />;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: box, height: box }}>
      <Rings size={px} hold={hold} fade={fade} />
      <div
        className={cn(
          "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-[#F7F4EA]",
          dim,
        )}
      >
        {user.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photo} alt="" className="size-full object-cover" />
        ) : (
          <span>{user.emoji}</span>
        )}
      </div>
    </div>
  );
}
