import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "react-native";
import { c, type as t } from "@/theme";

export function ScreenHeader({
  title,
  meta,
  left,
  center,
  right,
}: {
  title?: string;
  meta?: string;
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + (title ? 14 : 10), paddingHorizontal: center ? 12 : 22, paddingBottom: title ? 14 : 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", minHeight: 28, gap: 8 }}>
        {left}
        <View style={{ flex: 1, minWidth: 0 }}>
          {center ?? (title ? <Text style={t.title}>{title}</Text> : null)}
        </View>
        {right}
      </View>
      {meta ? <Text style={[t.meta, { marginTop: 6, color: c.inkFaint }]}>{meta}</Text> : null}
    </View>
  );
}
