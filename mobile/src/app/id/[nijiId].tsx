import { Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconBack } from "@/components/icons";
import { Paper } from "@/components/surface";
import { VybeProfile } from "@/components/vybe-profile";
import { cleanNijiId, userByNijiId } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export default function OpenNijiProfileScreen() {
  const { nijiId: raw } = useLocalSearchParams<{ nijiId: string }>();
  const nijiId = cleanNijiId(raw ?? "");
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const user = userByNijiId(state.users, nijiId);
  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  if (!user) {
    return (
      <Paper>
        <View
          style={{
            paddingTop: insets.top + 8,
            paddingHorizontal: 14,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Pressable onPress={close} hitSlop={12} accessibilityLabel="Back">
            <IconBack size={24} />
          </Pressable>
          <Text style={[t.title, { fontSize: 18 }]}>Niji</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink, textAlign: "center" }}>
            {nijiId || "Niji"}
          </Text>
          <Text style={[t.soft, { marginTop: 8, textAlign: "center" }]}>This Niji isn’t on this phone yet.</Text>
        </View>
      </Paper>
    );
  }

  return <VybeProfile userId={user.id} onClose={close} />;
}
