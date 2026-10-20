import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { MOODS, MOOD_PICK, STATUS_PAPERS, type MoodId, type StatusPaperId } from "@/lib/tokens";
import { c } from "@/theme";

function Glyph({ id, color }: { id: MoodId; color: string }) {
  const p = { stroke: color, strokeWidth: 1.45, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "rain":
      return <Path d="M9 5.2 7.4 11.2M12 4.6 10.2 12M15 5.4 13.6 11.4M8.6 15.2c0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4c0-2.2-3.4-5.2-3.4-5.2s-3.4 3-3.4 5.2Z" {...p} />;
    case "nights":
      return <Path d="M14.6 6.4A6.2 6.2 0 1 0 17 14.8 5 5 0 0 1 14.6 6.4Z" {...p} />;
    case "sunrise":
      return <Path d="M5 16.4h14M7.4 13.2A5.6 5.6 0 0 1 16.6 13M12 7.2v2.4M5.8 10.4l1.6 1.4M18.2 10.4 16.6 11.8" {...p} />;
    case "nature":
      return <Path d="M12 19V9.2M12 9.2c-3.2.2-5.4 2.4-5.6 5.4 3.2.2 5.4-2.2 5.6-5.4Zm0 0c3.2.2 5.4 2.4 5.6 5.4-3.2.2-5.4-2.2-5.6-5.4Z" {...p} />;
    case "fire":
      return <Path d="M12 19c3.2 0 5-2.2 5-5.2 0-3.2-2.4-5-2.4-7.4C13.2 8.6 12 11 12 11s-1-2-2.8-3.2C9.2 10.4 7 12.4 7 13.8 7 16.8 8.8 19 12 19Z" {...p} />;
    case "bloom":
      return <Path d="M12 12 9.2 6.8 12 9l2.8-2.2L12 12Zm0 0 5.2-2.8L15 12l2.2 2.8L12 12Zm0 0 2.8 5.2L12 15l-2.8 2.2L12 12Zm0 0L6.8 14.8 9 12 6.8 9.2 12 12Z" {...p} />;
    case "ocean":
      return <Path d="M4.6 11.2c1.8 1.6 3.6 1.6 5.4 0s3.6-1.6 5.4 0 3.6 1.6 4.6 0M4.6 15.4c1.8 1.6 3.6 1.6 5.4 0s3.6-1.6 5.4 0 3.6 1.6 4.6 0" {...p} />;
    case "moon":
      return <Circle cx="12" cy="12" r="6.2" {...p} />;
    default:
      return <Path d="M12 5.2 13 10.6 18.4 11.6 13 12.6 12 18 11 12.6 5.6 11.6 11 10.6Z" {...p} />;
  }
}

export function MoodMark({ id, size = 16, color = c.ink }: { id: MoodId; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Glyph id={id} color={color} />
    </Svg>
  );
}

export function moodLabel(id?: MoodId) {
  return MOODS.find((m) => m.id === id)?.label;
}

const WASH: Record<string, { from: string; to: string; ink: string }> = {
  rain: { from: "#D5DCE4", to: "#E9EDEF", ink: "#2E3844" },
  nights: { from: "#2B2D36", to: "#3E404A", ink: "#F3F0E8" },
  sunrise: { from: "#F0D2B8", to: "#F7EDE4", ink: "#4A3428" },
  nature: { from: "#D5E0D4", to: "#E8EEE6", ink: "#2C3A30" },
  fire: { from: "#E6C4AE", to: "#F3E3D8", ink: "#4A2E22" },
  bloom: { from: "#E6D2D8", to: "#F4EBEA", ink: "#3C2C32" },
  ocean: { from: "#C6D6DA", to: "#E3EBEB", ink: "#22343A" },
  moon: { from: "#D3D2DC", to: "#EBEAF0", ink: "#2A2836" },
  energy: { from: "#E4D0B8", to: "#F3E8DA", ink: "#3A2E22" },
  love: { from: "#E8D0D0", to: "#F5EAEA", ink: "#3A2A2A" },
  creative: { from: "#DDD6CE", to: "#EFEBE6", ink: "#332C26" },
  magic: { from: "#D8D4E4", to: "#EDEAF2", ink: "#2E2A3A" },
};

export function moodInk(id?: MoodId | StatusPaperId) {
  if (!id || id === "plain") return c.ink;
  return WASH[id]?.ink ?? c.ink;
}

function Atmosphere({ id }: { id: MoodId }) {
  switch (id) {
    case "rain":
      return <View style={{ position: "absolute", left: 0, right: 0, top: 0, height: "58%", backgroundColor: "#B7C3D0", opacity: 0.42 }} />;
    case "nights":
      return <View style={{ position: "absolute", right: 28, top: 32, width: 72, height: 72, borderRadius: 36, backgroundColor: "#F3F0E8", opacity: 0.25 }} />;
    case "sunrise":
      return <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "46%", backgroundColor: "#E8B48A", opacity: 0.4 }} />;
    case "nature":
      return <View style={{ position: "absolute", left: "31%", top: 0, width: "38%", height: "100%", backgroundColor: "#8FA88C", opacity: 0.22 }} />;
    case "fire":
      return <View style={{ position: "absolute", left: -28, bottom: -36, width: 160, height: 160, borderRadius: 80, backgroundColor: "#D08960", opacity: 0.32 }} />;
    case "bloom":
      return (
        <>
          <View style={{ position: "absolute", left: "16%", top: "20%", width: 64, height: 64, borderRadius: 32, backgroundColor: "#C98996", opacity: 0.2 }} />
          <View style={{ position: "absolute", right: "14%", top: "38%", width: 40, height: 40, borderRadius: 20, backgroundColor: "#C98996", opacity: 0.16 }} />
        </>
      );
    case "ocean":
      return <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "38%", backgroundColor: "#7FA8B0", opacity: 0.38 }} />;
    case "moon":
      return <View style={{ position: "absolute", right: 24, top: 28, width: 56, height: 56, borderRadius: 28, backgroundColor: "#2A2836", opacity: 0.18 }} />;
    default:
      return null;
  }
}

export function MoodWash({ id }: { id?: MoodId | StatusPaperId }) {
  if (!id || id === "plain" || !WASH[id]) return null;
  const wash = WASH[id];
  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: wash.to,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55%",
          backgroundColor: wash.from,
          opacity: 0.85,
        }}
      />
      <Atmosphere id={id} />
      <View style={{ position: "absolute", right: -10, bottom: -12, opacity: 0.12 }}>
        <MoodMark id={id} size={112} color={wash.ink} />
      </View>
    </View>
  );
}

export function StatusPaperRail({
  value,
  onChange,
}: {
  value: StatusPaperId;
  onChange: (id: StatusPaperId) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {STATUS_PAPERS.map((paper) => {
        const on = value === paper.id;
        const color = on ? c.card : c.inkSoft;
        return (
          <Pressable
            key={paper.id}
            onPress={() => onChange(paper.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: on ? c.ink : c.paperDeep,
            }}
          >
            {paper.id !== "plain" ? <MoodMark id={paper.id} size={14} color={color} /> : null}
            <Text style={{ fontSize: 12, color }}>{paper.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function MoodRail({
  value,
  onChange,
}: {
  value?: MoodId;
  onChange: (id: MoodId) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {MOOD_PICK.map((id) => {
        const on = value === id;
        const color = on ? c.card : c.inkSoft;
        return (
          <Pressable
            key={id}
            onPress={() => onChange(id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: on ? c.ink : c.paperDeep,
            }}
          >
            <MoodMark id={id} size={14} color={color} />
            <Text style={{ fontSize: 12, color }}>{moodLabel(id)}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
