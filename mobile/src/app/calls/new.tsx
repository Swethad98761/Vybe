import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconBack, IconCalls, IconVideo } from "@/components/icons";
import { Groove, Paper } from "@/components/surface";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export default function NewCallScreen() {
  const { state, me, openChatWith, startCall } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id);
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (u) => u.name.toLowerCase().includes(needle) || u.nijiId.toLowerCase().includes(needle),
    );
  }, [state.users, me.id, q]);

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
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Back to Calls">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18 }]}>Call</Text>
      </View>
      <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
        <Groove style={{ height: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: 16 }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 15, color: c.ink }}
          />
        </Groove>
      </View>
      <FlatList
        data={people}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 26 }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
            <Avatar user={item} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{item.name}</Text>
              <Text style={t.soft}>{item.online ? "Active now" : item.nijiId}</Text>
            </View>
            <Pressable
              onPress={() => startCall(item.id, "voice", openChatWith(item.id))}
              hitSlop={8}
              accessibilityLabel={`Voice ${item.name}`}
            >
              <IconCalls size={20} color={c.ink} />
            </Pressable>
            <Pressable
              onPress={() => startCall(item.id, "video", openChatWith(item.id))}
              hitSlop={8}
              accessibilityLabel={`Video ${item.name}`}
            >
              <IconVideo size={20} color={c.ink} />
            </Pressable>
          </View>
        )}
      />
    </Paper>
  );
}
