import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconBack } from "@/components/icons";
import { Paper } from "@/components/surface";
import { cleanMistToken } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export default function OpenMist() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, meetVeil } = useStore();
  const [miss, setMiss] = useState(false);
  const id = cleanMistToken(token ?? "");

  useEffect(() => {
    if (!ready || !id) return;
    const convo = meetVeil(id);
    if (convo) {
      router.replace(`/chat/${convo}`);
      return;
    }
    setMiss(true);
  }, [ready, id, meetVeil, router]);

  return (
    <Paper>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => router.replace("/chat")} hitSlop={12}>
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18, marginLeft: 8 }]}>Mist</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{id}</Text>
        <Text style={[t.soft, { marginTop: 8, textAlign: "center" }]}>
          {miss ? "This mist isn’t live on this phone." : "Opening this name…"}
        </Text>
      </View>
    </Paper>
  );
}
