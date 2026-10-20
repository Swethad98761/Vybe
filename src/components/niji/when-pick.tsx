"use client";

import { useMemo, useState } from "react";

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function daysIn(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function clockOf(d: Date) {
  const h24 = d.getHours();
  const pm = h24 >= 12;
  const h12 = h24 % 12 || 12;
  return {
    text: `${h12}:${String(d.getMinutes()).padStart(2, "0")}`,
    pm,
  };
}

function parseClock(raw: string): { hour: number; minute: number } | null {
  const m = raw.trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] != null ? Number(m[2]) : 0;
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function toIso(year: number, month: number, day: number, hour12: number, minute: number, pm: boolean) {
  const n = new Date(year, month, Math.min(day, daysIn(year, month)));
  n.setHours((hour12 % 12) + (pm ? 12 : 0), minute, 0, 0);
  return n.toISOString();
}

export function WhenPick({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const d = new Date(value);
  const clock = clockOf(d);
  const [typed, setTyped] = useState(clock.text);
  const [cursor, setCursor] = useState({ y: d.getFullYear(), m: d.getMonth() });

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay();
    const dim = daysIn(cursor.y, cursor.m);
    const slots: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
    while (slots.length % 7) slots.push(null);
    return slots;
  }, [cursor.y, cursor.m]);

  const applyTime = (raw: string, pm: boolean) => {
    setTyped(raw);
    const parsed = parseClock(raw);
    if (!parsed) return;
    onChange(toIso(d.getFullYear(), d.getMonth(), d.getDate(), parsed.hour, parsed.minute, pm));
  };

  const shiftMonth = (delta: number) => {
    const n = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: n.getFullYear(), m: n.getMonth() });
  };

  const selected =
    cursor.y === d.getFullYear() && cursor.m === d.getMonth() ? d.getDate() : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="px-2 py-1 text-[15px] text-[#65656B]" onClick={() => shiftMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <p className="text-[14px] font-medium text-[#17171A]">
          {MONTHS[cursor.m]} {cursor.y}
        </p>
        <button type="button" className="px-2 py-1 text-[15px] text-[#65656B]" onClick={() => shiftMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEK.map((w) => (
          <span key={w} className="py-1 text-[10px] tracking-caps uppercase text-[#9B9AA0]">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          const on = day === selected;
          return (
            <button
              key={`${cursor.m}-${i}`}
              type="button"
              disabled={!day}
              aria-label={day ? `Day ${day}` : undefined}
              onClick={() => {
                if (!day) return;
                const parsed = parseClock(typed) ?? { hour: clockOf(d).pm ? d.getHours() % 12 || 12 : d.getHours() % 12 || 12, minute: d.getMinutes() };
                onChange(toIso(cursor.y, cursor.m, day, parsed.hour, parsed.minute, d.getHours() >= 12));
              }}
              className={`h-9 rounded-full text-[13px] ${
                day ? (on ? "bg-[#17171A] text-[#F7F7F8]" : "text-[#17171A]") : "text-transparent"
              }`}
            >
              {day ?? "·"}
            </button>
          );
        })}
      </div>

      <p className="mt-4 mb-1.5 text-[10px] tracking-caps uppercase text-[#9B9AA0]">Time</p>
      <div className="flex items-center gap-2">
        <input
          aria-label="Time"
          inputMode="numeric"
          value={typed}
          onChange={(e) => applyTime(e.target.value.replace(/[^\d:]/g, "").slice(0, 5), d.getHours() >= 12)}
          placeholder="9:30"
          className="h-11 min-w-0 flex-1 rounded-[12px] bg-[#EFEFF1] px-3 text-[16px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
        />
        {(["AM", "PM"] as const).map((label) => {
          const pm = label === "PM";
          const on = (d.getHours() >= 12) === pm;
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => applyTime(typed, pm)}
              className={`h-11 rounded-[12px] px-3 text-[13px] ${
                on ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1] text-[#65656B]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
