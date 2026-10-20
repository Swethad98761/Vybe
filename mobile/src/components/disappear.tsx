import { View } from "react-native";
import { IconClock, IconEye, IconLock, IconWeek } from "@/components/icons";
import type { Disappear } from "@/lib/types";
import { c } from "@/theme";

const labels: Record<Disappear, string> = {
  off: "Encrypted",
  "view-once": "Encrypted. Disappears after they open it.",
  "24h": "Encrypted. Disappears in 24 hours.",
  "7d": "Encrypted. Disappears in 7 days.",
};

export function DisappearMarks({
  mode,
  size = 13,
  color = c.inkFaint,
}: {
  mode: Disappear;
  size?: number;
  color?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={labels[mode]}
      style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
    >
      <IconLock size={size} color={color} />
      {mode === "view-once" ? <IconEye size={size} color={color} /> : null}
      {mode === "24h" ? <IconClock size={size} color={color} /> : null}
      {mode === "7d" ? <IconWeek size={size} color={color} /> : null}
    </View>
  );
}
