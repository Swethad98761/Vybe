import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { c, type as t } from "@/theme";

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function daysIn(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function clockOf(d: Date) {
  const h24 = d.getHours();
  return {
    text: `${h24 % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}`,
    pm: h24 >= 12,
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

  const selected = cursor.y === d.getFullYear() && cursor.m === d.getMonth() ? d.getDate() : 0;
  const hour12 = d.getHours() % 12 || 12;

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} accessibilityLabel="Previous month">
          <Text style={{ fontSize: 18, color: c.inkSoft }}>‹</Text>
        </Pressable>
        <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>
          {MONTHS[cursor.m]} {cursor.y}
        </Text>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={10} accessibilityLabel="Next month">
          <Text style={{ fontSize: 18, color: c.inkSoft }}>›</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row" }}>
        {WEEK.map((w) => (
          <Text key={w} style={[t.caps, { flex: 1, textAlign: "center", fontSize: 9 }]}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, row) => (
        <View key={row} style={{ flexDirection: "row", marginTop: 4 }}>
          {cells.slice(row * 7, row * 7 + 7).map((day, i) => {
            const on = day === selected;
            return (
              <Pressable
                key={`${row}-${i}`}
                disabled={!day}
                onPress={() => {
                  if (!day) return;
                  const parsed = parseClock(typed) ?? { hour: hour12, minute: d.getMinutes() };
                  onChange(toIso(cursor.y, cursor.m, day, parsed.hour, parsed.minute, d.getHours() >= 12));
                }}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: on ? c.ink : "transparent",
                }}
              >
                <Text style={{ fontSize: 13, color: day ? (on ? c.card : c.ink) : "transparent" }}>{day ?? "·"}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <Text style={[t.caps, { marginTop: 16, marginBottom: 8 }]}>Time</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            backgroundColor: c.paperDeep,
            paddingHorizontal: 12,
            justifyContent: "center",
          }}
        >
          <TextInput
            accessibilityLabel="Time"
            value={typed}
            onChangeText={(v) => applyTime(v.replace(/[^\d:]/g, "").slice(0, 5), d.getHours() >= 12)}
            keyboardType="numbers-and-punctuation"
            placeholder="9:30"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 16, color: c.ink }}
          />
        </View>
        {(["AM", "PM"] as const).map((label) => {
          const pm = label === "PM";
          const on = (d.getHours() >= 12) === pm;
          return (
            <Pressable
              key={label}
              accessibilityLabel={label}
              onPress={() => applyTime(typed, pm)}
              style={{
                height: 44,
                paddingHorizontal: 12,
                borderRadius: 12,
                backgroundColor: on ? c.ink : c.paperDeep,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: on ? c.card : c.inkSoft }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
