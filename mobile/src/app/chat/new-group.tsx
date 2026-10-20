import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconBack, IconForward, IconPlus } from "@/components/icons";
import { Groove, Paper } from "@/components/surface";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

const GROUP_EMOJIS = ["🌊", "🔥", "⭐", "🎯", "💫", "🏆", "🎉", "🌈", "🚀", "💎", "🌸", "⚡", "🎨", "🌙", "🦋", "🎪"];

export default function NewGroupScreen() {
  const { state, me, createGroup } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌊");

  const people = useMemo(() => {
    const list = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (u) => u.name.toLowerCase().includes(needle) || u.nijiId.toLowerCase().includes(needle),
    );
  }, [state.users, me.id, q]);

  const chosen = state.users.filter((u) => selected.includes(u.id));
  const canNext = selected.length >= 2;
  const canCreate = name.trim().length > 0 && canNext;

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

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
        <Pressable
          onPress={() => (step === 1 ? router.back() : setStep(1))}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18, flex: 1 }]}>{step === 1 ? "People" : "Group"}</Text>
        {step === 1 ? (
          <Pressable disabled={!canNext} onPress={() => setStep(2)} hitSlop={10} accessibilityLabel="Next">
            <IconForward size={22} color={canNext ? c.ink : c.inkGhost} />
          </Pressable>
        ) : (
          <Pressable
            disabled={!canCreate}
            onPress={() => {
              const id = createGroup(selected, name.trim(), emoji);
              router.replace(`/chat/${id}`);
            }}
            hitSlop={10}
            accessibilityLabel="Create group"
          >
            <IconPlus size={22} color={canCreate ? c.ink : c.inkGhost} />
          </Pressable>
        )}
      </View>

      {step === 1 ? (
        <>
          {chosen.length > 0 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 18, paddingBottom: 8 }}>
              {chosen.map((person) => (
                <Pressable
                  key={person.id}
                  onPress={() => toggle(person.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    backgroundColor: c.paperDeep,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{person.emoji}</Text>
                  <Text style={{ fontSize: 12, color: c.ink }}>{person.name.split(" ")[0]}</Text>
                  <Text style={{ fontSize: 10, color: c.inkSoft }}>✕</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
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
          <Text style={[t.meta, { paddingHorizontal: 18, marginBottom: 6 }]}>Select at least two people</Text>
          <FlatList
            data={people}
            keyExtractor={(u) => u.id}
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 26 }}
            renderItem={({ item }) => {
              const on = selected.includes(item.id);
              return (
                <Pressable
                  onPress={() => toggle(item.id)}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
                >
                  <Avatar user={item} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{item.name}</Text>
                    <Text style={t.soft}>{item.online ? "Active now" : item.nijiId}</Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 1.5,
                      borderColor: on ? c.ink : c.inkGhost,
                      backgroundColor: on ? c.ink : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: c.card, fontSize: 11 }}>✓</Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      ) : (
        <View style={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 26 }}>
          <View style={{ alignItems: "center", paddingVertical: 28, gap: 16 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: c.paperDeep,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 36 }}>{emoji}</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Group name"
              placeholderTextColor={c.inkGhost}
              autoFocus
              style={{
                fontSize: 20,
                color: c.ink,
                textAlign: "center",
                width: "80%",
                borderBottomWidth: 1,
                borderBottomColor: c.line,
                paddingBottom: 8,
              }}
            />
          </View>
          <Text style={[t.meta, { marginBottom: 10 }]}>Choose icon</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {GROUP_EMOJIS.map((mark) => (
              <Pressable
                key={mark}
                onPress={() => setEmoji(mark)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: emoji === mark ? c.paperSunk : c.paperDeep,
                  borderWidth: emoji === mark ? 1.5 : 0,
                  borderColor: c.ink,
                }}
              >
                <Text style={{ fontSize: 22 }}>{mark}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[t.meta, { marginTop: 22, marginBottom: 10 }]}>{chosen.length} members</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
            {chosen.map((person) => (
              <View key={person.id} style={{ alignItems: "center", gap: 4, width: 56 }}>
                <Avatar user={person} size={40} />
                <Text style={[t.soft, { fontSize: 11 }]} numberOfLines={1}>
                  {person.name.split(" ")[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Paper>
  );
}
