import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconBack } from "@/components/icons";
import { Paper } from "@/components/surface";
import { cleanNijiId, userByNijiId } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export default function OpenChatWith() {
  const { nijiId } = useLocalSearchParams<{ nijiId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, state, openChatWith } = useStore();
  const [miss, setMiss] = useState(false);
  const id = cleanNijiId(nijiId ?? "");

  useEffect(() => {
    if (!ready || !id) return;
    const user = userByNijiId(state.users, id);
    if (!user) {
      setMiss(true);
      return;
    }
    const convo = openChatWith(user.id);
    router.replace(`/chat/${convo}`);
  }, [ready, id, state.users, openChatWith, router]);

  return (
    <Paper>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={() => router.replace("/chat")} hitSlop={12}>
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18, marginLeft: 8 }]}>Chat</Text>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{id}</Text>
        <Text style={[t.soft, { marginTop: 8, textAlign: "center" }]}>
          {miss ? "This Niji isn’t on this phone yet." : "Opening chat…"}
        </Text>
      </View>
    </Paper>
  );
}
