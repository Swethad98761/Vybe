import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { type Href, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconBack, IconUserPlus } from "@/components/icons";
import { Groove, Paper } from "@/components/surface";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export default function NewChatScreen() {
  const { state, me, openChatWith } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(needle) ||
        u.nijiId.toLowerCase().includes(needle),
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
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Back to Chat">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18, flex: 1 }]}>Chat</Text>
      </View>
      <View style={{ paddingHorizontal: 18, marginBottom: 8 }}>
        <Groove style={{ height: 44, justifyContent: "center", paddingHorizontal: 16, borderRadius: 16 }}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search people"
            placeholderTextColor={c.inkGhost}
            style={{ fontSize: 15, color: c.ink }}
          />
        </Groove>
      </View>
      <FlatList
        data={people}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 26 }}
        ListHeaderComponent={
          <Pressable
            onPress={() => router.push("/chat/new-group" as Href)}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
            accessibilityLabel="New group"
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: c.paperDeep,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconUserPlus size={22} color={c.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>New group</Text>
              <Text style={t.soft}>Three or more, one thread.</Text>
            </View>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              const id = openChatWith(item.id);
              router.replace(`/chat/${id}`);
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
          >
            <Avatar user={item} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{item.name}</Text>
              <Text style={t.soft}>{item.nijiId}</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={[t.soft, { textAlign: "center", marginTop: 40 }]}>No one matches that name.</Text>
        }
      />
    </Paper>
  );
}
