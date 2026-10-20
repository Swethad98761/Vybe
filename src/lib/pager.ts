"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export function useHorizontalPager(pageCount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const suppressClick = useRef(false);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    sl: number;
    axis: "h" | "v" | null;
  } | null>(null);

  const goTo = useCallback(
    (i: number, behavior: ScrollBehavior = "smooth") => {
      const next = Math.max(0, Math.min(pageCount - 1, i));
      indexRef.current = next;
      setIndex(next);
      const el = ref.current;
      if (el) el.scrollTo({ left: next * el.clientWidth, behavior });
    },
    [pageCount],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    if (e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    drag.current = {
      pointerId: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      sl: el.scrollLeft,
      axis: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el || d.pointerId !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      if (d.axis === "h") {
        el.setPointerCapture(e.pointerId);
        el.style.scrollSnapType = "none";
      }
    }
    if (d.axis === "h") {
      el.scrollLeft = d.sl - dx;
    }
  };

  const finish = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    if (!el) return;
    el.style.scrollSnapType = "";
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (d.axis !== "h") return;
    suppressClick.current = true;
    const dx = e.clientX - d.x;
    const w = el.clientWidth || 1;
    if (dx < -48) goTo(indexRef.current + 1);
    else if (dx > 48) goTo(indexRef.current - 1);
    else goTo(Math.round(el.scrollLeft / w));
  };

  const onScroll = () => {
    if (drag.current?.axis === "h") return;
    const el = ref.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const i = Math.round(el.scrollLeft / w);
    if (i !== indexRef.current) {
      indexRef.current = i;
      setIndex(i);
    }
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let lastW = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === lastW) return;
      lastW = el.clientWidth;
      el.scrollLeft = indexRef.current * el.clientWidth;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return {
    ref,
    index,
    goTo,
    onPointerDown,
    onPointerMove,
    onPointerUp: finish,
    onPointerCancel: finish,
    onScroll,
    onClickCapture,
  };
}
