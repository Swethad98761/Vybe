import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { Card } from "@/components/surface";
import { VybeProfile } from "@/components/vybe-profile";
import { relativeTime } from "@/lib/format";
import { isAround, previewOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

export function VybeChatPane({
  pick,
  onPick,
}: {
  pick: boolean;
  onPick: (open: boolean) => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, userById, openVybeChat } = useStore();
  const [profileOf, setProfileOf] = useState<string | null>(null);
  const rows = useMemo(
    () =>
      state.conversations
        .filter((item) => item.lane === "vybe" && !item.ghost)
        .sort((a, b) => (b.messages.at(-1)?.createdAt ?? "").localeCompare(a.messages.at(-1)?.createdAt ?? "")),
    [state.conversations],
  );
  const people = state.users.filter((u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.length === 0 ? (
          <Text style={[t.soft, { textAlign: "center", paddingVertical: 40 }]}>
            Vybe chats live here. Share a post, or start one — regular Chat stays clear.
          </Text>
        ) : (
          rows.map((item) => {
            const peerId = item.participantIds.find((id) => id !== me.id) ?? "";
            const peer = userById(peerId);
            const last = item.messages.at(-1);
            const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);
            return (
              <Card key={item.id} depth={1} radius={18} style={{ padding: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Pressable
                    onPress={() => {
                      if (peer) setProfileOf(peer.id);
                    }}
                    accessibilityLabel={`${peer?.name ?? "Friend"} vybe profile`}
                  >
                    <Avatar user={peer} size={40} place="chat" around={around} vybeOn={state.vybeEnabled} />
                  </Pressable>
                  <Pressable onPress={() => router.push(`/chat/${item.id}`)} style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                      <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, flex: 1 }} numberOfLines={1}>
                        {peer?.name ?? "Vybe"}
                      </Text>
                      <Text style={t.meta}>{last ? relativeTime(last.createdAt) : ""}</Text>
                    </View>
                    <Text style={[t.soft, { marginTop: 3 }]} numberOfLines={1}>
                      {previewOf(last)}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
      {profileOf ? (
        <Modal visible animationType="slide" onRequestClose={() => setProfileOf(null)}>
          <VybeProfile userId={profileOf} onClose={() => setProfileOf(null)} />
        </Modal>
      ) : null}
      {pick ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,0.28)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => onPick(false)} />
          <View
            style={{
              backgroundColor: c.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: insets.bottom + 18,
              maxHeight: "70%",
            }}
          >
            <Text style={[t.caps, { textAlign: "center" }]}>Vybe chat</Text>
            <ScrollView style={{ marginTop: 12 }}>
              {people.map((u) => (
                <Pressable
                  key={u.id}
                  onPress={() => {
                    const id = openVybeChat(u.id);
                    onPick(false);
                    router.push(`/chat/${id}`);
                  }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}
                >
                  <Avatar user={u} size={40} />
                  <Text style={{ fontSize: 15, color: c.ink }}>{u.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}
