"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SLIDES, type Slide } from "@/components/pitch/slides";
import { CinematicTrailer } from "@/components/pitch/trailer";

export function PitchDeck() {
  const params = useSearchParams();
  const startPlay = params.get("play") === "1";
  const exporting = params.get("export") === "1";
  const start = Number(params.get("s") ?? "0");
  const [i, setI] = useState(Number.isFinite(start) ? Math.max(0, Math.min(SLIDES.length - 1, start)) : 0);
  const [film, setFilm] = useState(startPlay && !exporting);
  const slide = SLIDES[i] ?? SLIDES[0];

  const go = useCallback((next: number) => {
    setI(Math.max(0, Math.min(SLIDES.length - 1, next)));
  }, []);

  useEffect(() => {
    const n = Number(params.get("s") ?? "");
    if (Number.isFinite(n) && params.has("s")) {
      setI(Math.max(0, Math.min(SLIDES.length - 1, n)));
    }
  }, [params]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (film) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(i + 1);
      }
      if (event.key === "ArrowLeft") go(i - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [film, go, i]);

  return (
    <div
      className="invest-root bg-[#EBEBEC] relative min-h-dvh overflow-hidden text-[#17171A]"
      onClick={(event) => {
        if (exporting || film) return;
        const mid = window.innerWidth / 2;
        if (event.clientX > mid) go(i + 1);
        else go(i - 1);
      }}
    >
      {film ? <CinematicTrailer onDone={() => setFilm(false)} /> : null}
      <SlideView slide={slide} exporting={exporting} />

      {!exporting ? (
        <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-6 pb-5 pt-16 md:px-10">
          <p className="max-w-xl font-serif text-[17px] leading-snug text-[#17171A] italic md:text-[19px]">
            {slide.caption}
          </p>
          <div className="pointer-events-auto flex items-center gap-3">
            <span className="text-[11px] tracking-[0.18em] text-[#9B9AA0] uppercase">
              {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFilm(true);
              }}
              className="rounded-full bg-[#17171A] px-3.5 py-1.5 text-[11px] tracking-[0.14em] text-[#F7F7F8] uppercase"
            >
              Play trailer
            </button>
          </div>
        </footer>
      ) : (
        <p className="pointer-events-none absolute inset-x-0 bottom-6 z-20 px-10 font-serif text-[16px] text-[#17171A] italic">
          {slide.caption}
        </p>
      )}

      <div className="pointer-events-none absolute inset-x-6 top-0 z-20 flex items-center justify-between pt-5 md:inset-x-10">
        {exporting ? (
          <p className="flex items-center gap-2.5 text-[10px] tracking-[0.22em] text-[#9B9AA0] uppercase">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/blades-mark.png" alt="" className="h-5 w-5 object-contain" />
            Niji · Confidential
          </p>
        ) : (
          <Link
            href="/"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto flex items-center gap-2.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/blades-mark.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-serif text-[18px] tracking-tight text-[#17171A]">Niji</span>
          </Link>
        )}
        <div className="pointer-events-auto flex items-center gap-5">
          {exporting ? (
            <span className="text-[10px] tracking-[0.18em] text-[#9B9AA0] uppercase">
              {String(i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          ) : (
            <>
              <a
                href="/Niji-Investor-Deck.pdf"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] tracking-[0.16em] text-[#8A8A90] uppercase hover:text-[#17171A]"
              >
                PDF
              </a>
              <Link
                href="/"
                onClick={(e) => e.stopPropagation()}
                className="text-[11px] tracking-[0.16em] text-[#8A8A90] uppercase hover:text-[#17171A]"
              >
                Site
              </Link>
              <div className="flex gap-1">
                {SLIDES.map((s, n) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      go(n);
                    }}
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: n === i ? 18 : 6,
                      background: n === i ? "#17171A" : "#C8C8CC",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <p className="mt-6 flex gap-3 text-[14px] leading-6 text-[#17171A]">
      <span className="mt-1.5 inline-block h-8 w-0.5 shrink-0 bg-[#FF9933]" />
      <span>{text}</span>
    </p>
  );
}

function SlideView({ slide, exporting }: { slide: Slide; exporting: boolean }) {
  if (slide.kind === "cover") {
    return (
      <div className="grid min-h-dvh md:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-24 md:px-14 lg:px-16">
          {slide.kicker ? (
            <p className="text-[11px] tracking-[0.22em] text-[#9B9AA0] uppercase">{slide.kicker}</p>
          ) : null}
          <h1 className="mt-4 font-serif text-[64px] leading-[0.92] text-[#17171A] md:text-[80px]">{slide.title}</h1>
          {slide.italic ? (
            <p className="mt-3 font-serif text-[28px] text-[#65656B] italic md:text-[32px]">{slide.italic}</p>
          ) : null}
          {slide.body ? (
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#65656B]">{slide.body}</p>
          ) : null}
          {slide.points ? (
            <ul className="mt-8 space-y-2.5">
              {slide.points.map((p) => (
                <li key={p} className="flex gap-3 text-[14px] leading-6 text-[#17171A]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#FF9933]" />
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="relative min-h-[42vh] overflow-hidden md:min-h-dvh">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        </div>
      </div>
    );
  }

  if (slide.kind === "split") {
    return (
      <div className="mx-auto grid min-h-dvh max-w-[1280px] items-center gap-10 px-8 py-20 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:px-12 lg:gap-16">
        <div>
          <Kicker>{slide.kicker}</Kicker>
          <h1 className="mt-3 font-serif text-[36px] leading-[1.06] text-[#17171A] md:text-[46px]">{slide.title}</h1>
          {slide.italic ? (
            <p className="mt-3 font-serif text-[22px] text-[#65656B] italic md:text-[26px]">{slide.italic}</p>
          ) : null}
          {slide.body ? <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#65656B]">{slide.body}</p> : null}
          {slide.points ? (
            <ul className="mt-5 max-w-xl space-y-2.5">
              {slide.points.map((p) => (
                <li key={p} className="text-[14px] leading-6 text-[#17171A]">
                  {p}
                </li>
              ))}
            </ul>
          ) : null}
          {slide.columns ? (
            <div className="mt-8 space-y-4">
              {slide.columns.map((c) => (
                <div key={c.kicker} className="border-t border-black/[0.08] pt-4">
                  <p className="text-[11px] tracking-[0.18em] text-[#9B9AA0] uppercase">{c.kicker}</p>
                  <p className="mt-2 text-[14px] leading-6 text-[#65656B]">{c.body}</p>
                </div>
              ))}
            </div>
          ) : null}
          {slide.quote ? <Quote text={slide.quote} /> : null}
        </div>
        {slide.image ? (
          <div className={`overflow-hidden ${exporting ? "" : ""}`}>
            <div className="overflow-hidden rounded-[28px] bg-[#F4F4F5] shadow-[0_28px_70px_rgba(23,23,26,0.08)] ring-1 ring-black/[0.04]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt=""
                className={`h-full w-full ${slide.imageFit ?? "object-cover"} ${slide.imageObject ?? "object-top"}`}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.kind === "metrics") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[1100px] flex-col justify-center px-8 py-24 md:px-12">
        <Kicker>{slide.kicker}</Kicker>
        <h1 className="mt-3 max-w-3xl font-serif text-[36px] leading-[1.08] text-[#17171A] md:text-[48px]">
          {slide.title}
        </h1>
        {slide.body ? <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#65656B]">{slide.body}</p> : null}
        {slide.metrics ? (
          <div className="mt-14 grid gap-10 border-t border-black/[0.08] pt-10 sm:grid-cols-3">
            {slide.metrics.map((m) => (
              <div key={m.value}>
                <p className="font-serif text-[42px] leading-none text-[#17171A] md:text-[48px]">{m.value}</p>
                <p className="mt-3 text-[13px] leading-5 text-[#17171A]">{m.label}</p>
                {m.source ? <p className="mt-2 text-[11px] tracking-wide text-[#9B9AA0]">{m.source}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.kind === "columns") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[1100px] flex-col justify-center px-8 py-24 md:px-12">
        <Kicker>{slide.kicker}</Kicker>
        <h1 className="mt-3 max-w-3xl font-serif text-[36px] leading-[1.08] text-[#17171A] md:text-[48px]">
          {slide.title}
        </h1>
        {slide.body ? <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#65656B]">{slide.body}</p> : null}
        {slide.columns ? (
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {slide.columns.map((c) => (
              <div key={c.kicker}>
                <p className="font-serif text-[28px] text-[#17171A]">{c.kicker}</p>
                <p className="mt-3 text-[15px] font-medium text-[#17171A]">{c.title}</p>
                <p className="mt-2 text-[14px] leading-6 text-[#65656B]">{c.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (slide.kind === "ask") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[1100px] flex-col justify-center px-8 py-24 md:px-12">
        <Kicker>{slide.kicker}</Kicker>
        <h1 className="mt-3 max-w-4xl font-serif text-[36px] leading-[1.08] text-[#17171A] md:text-[48px]">
          {slide.title}
        </h1>
        {slide.body ? <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#65656B]">{slide.body}</p> : null}
        {slide.columns ? (
          <div className="mt-10 grid gap-12 border-t border-black/[0.08] pt-8 md:grid-cols-2">
            {slide.columns.map((c) => (
              <div key={c.kicker}>
                <p className="text-[11px] tracking-[0.18em] text-[#9B9AA0] uppercase">{c.kicker}</p>
                <p className="mt-3 text-[15px] leading-7 text-[#17171A]">{c.body}</p>
              </div>
            ))}
          </div>
        ) : null}
        {slide.points ? (
          <ol className="mt-10 space-y-3">
            {slide.points.map((p, n) => (
              <li key={p} className="flex gap-4 text-[15px] leading-6 text-[#17171A]">
                <span className="w-6 shrink-0 text-[13px] tracking-[0.08em] text-[#9B9AA0]">
                  {String(n + 1).padStart(2, "0")}
                </span>
                {p}
              </li>
            ))}
          </ol>
        ) : null}
        {slide.italic ? (
          <p className="mt-10 font-serif text-[22px] text-[#17171A] italic md:text-[26px]">{slide.italic}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-6 pt-16 pb-28 md:px-12">
      <Kicker>{slide.kicker}</Kicker>
      <h1 className="mt-3 font-serif text-[40px] leading-[1.05] text-[#17171A] md:text-[52px]">{slide.title}</h1>
      {slide.italic ? (
        <p className="mt-3 font-serif text-[24px] text-[#65656B] italic md:text-[28px]">{slide.italic}</p>
      ) : null}
      {slide.body ? <p className="mt-5 max-w-2xl text-[16px] leading-7 text-[#65656B]">{slide.body}</p> : null}
      {slide.points ? (
        <ul className="mt-5 max-w-2xl space-y-3">
          {slide.points.map((p) => (
            <li key={p} className="text-[15px] leading-6 text-[#17171A]">
              {p}
            </li>
          ))}
        </ul>
      ) : null}
      {slide.rows ? (
        <div className="mt-6 overflow-hidden rounded-[22px] bg-[#F7F7F8]">
          {slide.rows.map((row) => (
            <div
              key={row.left}
              className="grid gap-3 border-b border-black/5 px-5 py-3.5 last:border-b-0 md:grid-cols-2"
            >
              <p className="text-[13px] text-[#9B9AA0]">{row.left}</p>
              <p className="text-[14px] text-[#17171A]">{row.right}</p>
            </div>
          ))}
        </div>
      ) : null}
      {slide.marks ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {slide.marks.map((m) => (
            <div key={m.name} className="rounded-[20px] bg-[#F7F7F8] px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center text-[#17171A]">
                  <m.Icon className="size-7" />
                </span>
                <div>
                  <p className="text-[15px] font-medium">{m.name}</p>
                  <p className="text-[11px] tracking-wide text-[#9B9AA0] uppercase">{m.where}</p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-5 text-[#65656B]">{m.meaning}</p>
            </div>
          ))}
        </div>
      ) : null}
      {slide.quote ? <Quote text={slide.quote} /> : null}
    </div>
  );
}

function Kicker({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-[11px] tracking-[0.22em] text-[#9B9AA0] uppercase">{children}</p>;
}
