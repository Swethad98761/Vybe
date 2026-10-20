"use client";

import { useMemo } from "react";
import { circuitQr } from "@/lib/niji-qr";

export function NijiSeal({ value, size = 220 }: { value: string; size?: number }) {
  const layout = useMemo(() => circuitQr(value, size), [value, size]);
  const { cell, pad, pads, traces, finders } = layout;

  return (
    <div className="relative overflow-hidden rounded-[28px]" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/niji-mark.jpg" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-[#F7F7F8]/58" />
      <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {finders.map((f, i) => {
          const x = pad + f.x * cell;
          const y = pad + f.y * cell;
          const box = cell * 7;
          return (
            <g key={i}>
              <rect x={x} y={y} width={box} height={box} rx={cell * 1.05} fill="#17171A" />
              <rect x={x + cell} y={y + cell} width={cell * 5} height={cell * 5} rx={cell * 0.65} fill="#F7F7F8" />
              <rect x={x + cell * 2} y={y + cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.4} fill="#17171A" />
            </g>
          );
        })}
        {traces ? <path d={traces} fill="#17171A" /> : null}
        {pads ? <path d={pads} fill="#17171A" /> : null}
      </svg>
    </div>
  );
}
