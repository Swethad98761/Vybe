import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { Card, Groove } from "@/components/surface";
import { relativeTime } from "@/lib/format";
import {
  ALIAS_TONE,
  GHOST_TTLS,
  aliasTone,
  defaultSendAt,
  isAliasLive,
  mistFace,
  remainingLabel,
  slugMistName,
  splitGivenName,
  whenLabel,
} from "@/lib/ghost";
import { WhenPick } from "@/components/when-pick";
import { NijiPaper } from "@/components/niji-paper";
import { previewOf } from "@/lib/presence";
import { nijiMistShareText, nijiMistUri } from "@/lib/niji-link";
import { useStore } from "@/lib/store";
import type { GhostAlias, GhostTtl, ScheduledMessage } from "@/lib/types";
import { c, type as t } from "@/theme";

export function GhostPane({
  mintOpen,
  onMintClose,
}: {
  mintOpen: boolean;
  onMintOpen?: () => void;
  onMintClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, me, userById, mintGhost, revokeGhost, meetVeil } = useStore();
  const [ttl, setTtl] = useState<GhostTtl>("1d");
  const [token, setToken] = useState("");
  const [note, setNote] = useState("");
  const given = splitGivenName(me.name);
  const [first, setFirst] = useState(given.first);
  const [last, setLast] = useState(given.last);
  const [copied, setCopied] = useState<string | null>(null);
  const [meetError, setMeetError] = useState("");
  const [namesOpen, setNamesOpen] = useState(false);
  const [minted, setMinted] = useState<GhostAlias | null>(null);
  const [showQr, setShowQr] = useState<GhostAlias | null>(null);
  const startY = useRef(0);

  const { live, closed } = useMemo(() => {
    const all = state.conversations
      .filter((item) => item.ghost)
      .sort((a, b) => (b.messages.at(-1)?.createdAt ?? "").localeCompare(a.messages.at(-1)?.createdAt ?? ""));
    const live: typeof all = [];
    const closed: typeof all = [];
    for (const item of all) {
      const alias = state.ghostAliases.find((a) => a.id === item.ghostAliasId);
      const dead = item.archived || (alias ? !isAliasLive(alias) : false);
      (dead ? closed : live).push(item);
    }
    return { live, closed };
  }, [state.conversations, state.ghostAliases]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => setNamesOpen(true)}
            tintColor={c.inkSoft}
          />
        }
        onScrollBeginDrag={(e) => {
          startY.current = e.nativeEvent.contentOffset.y;
        }}
        onScrollEndDrag={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          if (startY.current <= 24 && y < startY.current - 12) setNamesOpen(true);
          if (y > startY.current + 28) setNamesOpen(false);
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={[t.meta, { flex: 1, lineHeight: 18 }]}>
            A name that is not yours. Swipe down, or History, for faded ones.
          </Text>
          <Pressable onPress={() => setNamesOpen((open) => !open)} hitSlop={8}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink }}>{namesOpen ? "Hide" : "History"}</Text>
          </Pressable>
        </View>
        {namesOpen ? (
          <View style={{ marginBottom: 16 }}>
            <Text style={[t.caps, { marginBottom: 8, marginLeft: 4 }]}>History</Text>
            {state.ghostAliases.length === 0 && closed.length === 0 ? (
              <Text style={[t.soft, { textAlign: "center", paddingVertical: 18 }]}>
                No faded names or chats yet.
              </Text>
            ) : (
              <>
                {state.ghostAliases.map((alias) => {
                  const tone = aliasTone(alias);
                  const face = mistFace(alias.token);
                  return (
                    <Card key={alias.id} depth={1} radius={18} style={{ padding: 14, marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 9,
                            backgroundColor: ALIAS_TONE[tone],
                          }}
                        />
                        <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: c.ink }} numberOfLines={1}>
                          {face}
                        </Text>
                        <Text style={t.meta}>{tone === "closed" ? "Ended" : remainingLabel(alias.expiresAt)}</Text>
                      </View>
                      <Text style={[t.soft, { marginTop: 6 }]}>
                        {alias.note?.trim() ? `${alias.note.trim()} · ` : ""}
                        {alias.token}
                      </Text>
                      {tone !== "closed" ? (
                        <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                          <Pressable
                            onPress={() => {
                              Share.share({ message: alias.token }).catch(() => {});
                              setCopied(alias.token);
                            }}
                          >
                            <Text style={{ fontSize: 13, color: c.ink }}>
                              {copied === alias.token ? "Shared temp ID" : "Share temp ID"}
                            </Text>
                          </Pressable>
                          <Pressable onPress={() => setShowQr(alias)}>
                            <Text style={{ fontSize: 13, color: c.ink }}>Share Niji ID</Text>
                          </Pressable>
                          <Pressable onPress={() => revokeGhost(alias.id)}>
                            <Text style={{ fontSize: 13, color: c.inkFaint }}>End now</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
                {closed.map((item) => {
                  const peerId = item.participantIds.find((id) => id !== me.id) ?? "";
                  const peer = userById(peerId);
                  const last = item.messages.at(-1);
                  const alias = state.ghostAliases.find((a) => a.id === item.ghostAliasId);
                  return (
                    <Pressable key={item.id} onPress={() => router.push(`/chat/${item.id}`)}>
                      <Card depth={1} radius={18} style={{ padding: 14, marginBottom: 8 }}>
                        <Text style={{ fontSize: 15, color: c.ink }}>
                          {alias ? mistFace(alias.token) : peer?.name || "Mist"}
                        </Text>
                        <Text style={[t.soft, { marginTop: 4 }]} numberOfLines={1}>
                          Closed · {previewOf(last)}
                        </Text>
                      </Card>
                    </Pressable>
                  );
                })}
              </>
            )}
          </View>
        ) : null}

        {live.length === 0 ? (
          <Text style={[t.soft, { textAlign: "center", paddingVertical: 40 }]}>
            No live mist. Tap + for a name, or History for faded ones.
          </Text>
        ) : (
          live.map((item) => {
            const peerId = item.participantIds.find((id) => id !== me.id) ?? "";
            const peer = userById(peerId);
            const last = item.messages.at(-1);
            const alias = state.ghostAliases.find((a) => a.id === item.ghostAliasId);
            const fadedVeil = alias ? !isAliasLive(alias) : false;
            return (
              <Card key={item.id} depth={1} radius={18} style={{ padding: 14, marginBottom: 10 }}>
                <Pressable onPress={() => router.push(`/chat/${item.id}`)}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Avatar user={peer} size={44} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                        <Text style={{ fontSize: 15, color: c.ink, flex: 1 }} numberOfLines={1}>
                          {alias ? mistFace(alias.token) : peer?.name || peer?.nijiId || "Mist"}
                        </Text>
                        <Text style={t.meta}>{last ? relativeTime(last.createdAt) : ""}</Text>
                      </View>
                      <Text style={[t.soft, { marginTop: 3 }]} numberOfLines={1}>
                        {fadedVeil ? "This name faded. " : ""}
                        {previewOf(last)}
                      </Text>
                    </View>
                  </View>
                </Pressable>
                {alias && !fadedVeil ? (
                  <Pressable onPress={() => setShowQr(alias)} hitSlop={8} style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 12, color: c.inkSoft }}>Share Niji ID</Text>
                  </Pressable>
                ) : null}
              </Card>
            );
          })
        )}
      </ScrollView>

      <Modal visible={mintOpen} transparent animationType="slide" onRequestClose={onMintClose}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={onMintClose} />
          <View
            style={{
              backgroundColor: c.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              maxHeight: "88%",
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: insets.bottom + 18,
            }}
          >
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={[t.caps, { textAlign: "center" }]}>Mist</Text>
              <Text style={[t.soft, { textAlign: "center", marginTop: 6 }]}>
                A name they can say out loud. We add a number so it isn’t someone else’s.
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {GHOST_TTLS.map((item) => {
                  const on = ttl === item.id;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setTtl(item.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: on ? c.ink : c.paperDeep,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: on ? c.card : c.inkSoft }}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[t.caps, { marginTop: 18 }]}>First name</Text>
              <Groove
                style={{
                  marginTop: 10,
                  height: 48,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  justifyContent: "center",
                }}
              >
                <TextInput
                  value={first}
                  onChangeText={(v) => setFirst(v.slice(0, 18))}
                  placeholder="Priya"
                  placeholderTextColor={c.inkGhost}
                  style={{ fontSize: 16, color: c.ink }}
                />
              </Groove>
              <Text style={[t.caps, { marginTop: 14 }]}>Last name</Text>
              <Text style={[t.meta, { marginTop: 4 }]}>Optional. Only if you want it on this mist.</Text>
              <Groove
                style={{
                  marginTop: 10,
                  height: 48,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  justifyContent: "center",
                }}
              >
                <TextInput
                  value={last}
                  onChangeText={(v) => setLast(v.slice(0, 18))}
                  placeholder="Rao"
                  placeholderTextColor={c.inkGhost}
                  style={{ fontSize: 16, color: c.ink }}
                />
              </Groove>
              <Text style={[t.soft, { marginTop: 8 }]}>
                They’ll see something like{" "}
                {slugMistName(first, last) === "mist"
                  ? "Priya 482"
                  : `${first.trim() || "Priya"}${last.trim() ? ` ${last.trim()}` : ""} 482`}
                . The number is ours.
              </Text>
              <Text style={[t.caps, { marginTop: 18 }]}>A note for you</Text>
              <Groove
                style={{
                  marginTop: 10,
                  height: 48,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  justifyContent: "center",
                }}
              >
                <TextInput
                  value={note}
                  onChangeText={(v) => setNote(v.slice(0, 60))}
                  placeholder="Cafe table, stall guy…"
                  placeholderTextColor={c.inkGhost}
                  style={{ fontSize: 16, color: c.ink }}
                />
              </Groove>
              <Pressable
                disabled={!first.trim()}
                onPress={() => {
                  const alias = mintGhost(ttl, note, first, last);
                  setCopied(alias.token);
                  setNote("");
                  setNamesOpen(true);
                  onMintClose();
                  setMinted(alias);
                }}
                style={{
                  marginTop: 16,
                  backgroundColor: c.ink,
                  borderRadius: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                  opacity: first.trim() ? 1 : 0.3,
                }}
              >
                <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Make this name</Text>
              </Pressable>
              <Text style={[t.caps, { marginTop: 22 }]}>Someone shared a name</Text>
              <Text style={[t.meta, { marginTop: 6 }]}>Enter it. A live name opens the chat.</Text>
              <Groove
                style={{
                  marginTop: 10,
                  height: 48,
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TextInput
                  value={token}
                  onChangeText={(v) => {
                    setToken(v);
                    setMeetError("");
                  }}
                  placeholder="priya-482"
                  placeholderTextColor={c.inkGhost}
                  autoCapitalize="none"
                  style={{ flex: 1, fontSize: 16, color: c.ink }}
                />
                <Pressable
                  onPress={() => {
                    const id = meetVeil(token);
                    if (!id) {
                      setMeetError("That name is not live.");
                      return;
                    }
                    setToken("");
                    onMintClose();
                    router.push(`/chat/${id}`);
                  }}
                >
                  <Text style={{ fontSize: 13, color: c.ink }}>Open chat</Text>
                </Pressable>
              </Groove>
              {meetError ? <Text style={[t.meta, { marginTop: 8 }]}>{meetError}</Text> : null}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {minted || showQr ? (
        <Modal
          visible
          animationType="fade"
          onRequestClose={() => {
            setMinted(null);
            setShowQr(null);
          }}
        >
          <NijiPaper
            nijiId={(minted ?? showQr)!.token}
            name={mistFace((minted ?? showQr)!.token)}
            uri={nijiMistUri((minted ?? showQr)!.token)}
            kicker="A mountain that is not yours. The other person only sees this name."
            shareText={nijiMistShareText((minted ?? showQr)!.token, mistFace((minted ?? showQr)!.token))}
            shareLabel="Share Niji ID"
            onClose={() => {
              setMinted(null);
              setShowQr(null);
            }}
          />
        </Modal>
      ) : null}
    </View>
  );
}

export function LaterPane({ onCompose }: { onCompose: (draft?: ScheduledMessage) => void }) {
  const router = useRouter();
  const { state, userById, cancelScheduled } = useStore();
  const drafts = state.scheduled.filter((s) => s.status === "draft");
  const sent = state.scheduled.filter((s) => s.status === "sent");
  const memory = state.scheduled.filter((s) => s.status === "kept");

  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
    >
      <Text style={[t.soft, { marginBottom: 14 }]}>
        Park what, when, and whom. When it leaves, it also sits in that chat. Keep it here as memory if you want both.
      </Text>
      {drafts.length === 0 ? (
        <Text style={[t.soft, { textAlign: "center", paddingVertical: 28 }]}>Nothing waiting.</Text>
      ) : (
        drafts.map((item) => {
          const peer = userById(item.peerId);
          return (
            <Card key={item.id} depth={1} radius={18} style={{ padding: 16, marginBottom: 10 }}>
              <Pressable onPress={() => onCompose(item)}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, flex: 1 }} numberOfLines={1}>
                    {peer?.name ?? "Someone"}
                  </Text>
                  <Text style={t.meta}>{whenLabel(item.sendAt)}</Text>
                </View>
                <Text style={[t.soft, { marginTop: 6 }]}>{item.text}</Text>
              </Pressable>
              <View style={{ flexDirection: "row", gap: 16, marginTop: 10 }}>
                <Pressable onPress={() => onCompose(item)}>
                  <Text style={{ fontSize: 13, color: c.ink }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => cancelScheduled(item.id)}>
                  <Text style={{ fontSize: 13, color: c.inkFaint }}>Drop</Text>
                </Pressable>
              </View>
            </Card>
          );
        })
      )}

      {sent.length ? (
        <>
          <Text style={[t.caps, { marginTop: 16, marginBottom: 8, marginLeft: 4 }]}>Sent · in chat</Text>
          {sent.map((item) => {
            const peer = userById(item.peerId);
            return (
              <Pressable
                key={item.id}
                onPress={() => item.conversationId && router.push(`/chat/${item.conversationId}`)}
              >
                <Card depth={1} radius={18} style={{ padding: 16, marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink, flex: 1 }} numberOfLines={1}>
                      {peer?.name ?? "Someone"}
                    </Text>
                    <Text style={t.meta}>{item.sentAt ? whenLabel(item.sentAt) : whenLabel(item.sendAt)}</Text>
                  </View>
                  <Text style={[t.soft, { marginTop: 6 }]}>{item.text}</Text>
                  <Text style={{ fontSize: 12, color: c.ink, marginTop: 8 }}>Open in chat</Text>
                </Card>
              </Pressable>
            );
          })}
        </>
      ) : null}

      {memory.length ? (
        <>
          <Text style={[t.caps, { marginTop: 16, marginBottom: 8, marginLeft: 4 }]}>Memory</Text>
          {memory.map((item) => {
            const peer = userById(item.peerId);
            return (
              <Card key={item.id} depth={1} radius={18} style={{ padding: 16, marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={{ fontSize: 15, color: c.ink, flex: 1 }} numberOfLines={1}>
                    {peer?.name ?? "Someone"}
                  </Text>
                  <Text style={t.meta}>{item.sentAt ? whenLabel(item.sentAt) : whenLabel(item.sendAt)}</Text>
                </View>
                <Text style={[t.soft, { marginTop: 6 }]}>{item.text}</Text>
              </Card>
            );
          })}
        </>
      ) : null}
    </ScrollView>
  );
}

export function ScheduleSheet({
  draft,
  onClose,
}: {
  draft?: ScheduledMessage | null;
  onClose: () => void;
}) {
  const { state, me, saveScheduled } = useStore();
  const trusted = state.users.filter(
    (u) => u.id !== me.id && u.id !== "mist" && !u.id.startsWith("veil-"),
  );
  const [peerId, setPeerId] = useState(draft?.peerId ?? trusted[0]?.id ?? "");
  const [text, setText] = useState(draft?.text ?? "");
  const [sendAt, setSendAt] = useState(draft?.sendAt ?? defaultSendAt());
  const [keep, setKeep] = useState(Boolean(draft?.keepMemory));

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        style={{
          backgroundColor: c.card,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 20,
          maxHeight: "88%",
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[t.caps, { textAlign: "center" }]}>Later</Text>
          <Text style={[t.meta, { textAlign: "center", marginTop: 6 }]}>
            What, when, and whom. Edit until it leaves.
          </Text>

          <Text style={[t.caps, { marginTop: 20 }]}>Whom</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {trusted.map((u) => {
              const on = peerId === u.id;
              return (
                <Pressable
                  key={u.id}
                  onPress={() => setPeerId(u.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 16,
                    backgroundColor: on ? c.ink : c.paperDeep,
                  }}
                >
                  <Text style={{ fontSize: 12, color: on ? c.card : c.inkSoft }}>{u.name.split(" ")[0]}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[t.caps, { marginTop: 20 }]}>What</Text>
          <Groove style={{ marginTop: 10, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="The line you want to send later"
              placeholderTextColor={c.inkGhost}
              multiline
              style={{ minHeight: 80, fontSize: 16, color: c.ink }}
            />
          </Groove>

          <Text style={[t.caps, { marginTop: 20 }]}>When</Text>
          <View style={{ marginTop: 10 }}>
            <WhenPick value={sendAt} onChange={setSendAt} />
          </View>

          <Pressable
            onPress={() => setKeep((v) => !v)}
            style={{
              marginTop: 18,
              backgroundColor: c.paperDeep,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ flex: 1, fontSize: 14, color: c.ink }}>Keep as memory after it sends</Text>
            <View
              style={{
                width: 40,
                height: 24,
                borderRadius: 12,
                backgroundColor: keep ? c.ink : "#C8C8CC",
                justifyContent: "center",
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  alignSelf: keep ? "flex-end" : "flex-start",
                }}
              />
            </View>
          </Pressable>

          <Pressable
            onPress={() => {
              if (!text.trim() || !peerId) return;
              const convo = state.conversations.find(
                (item) => !item.isGroup && !item.ghost && item.participantIds.includes(peerId),
              );
              saveScheduled({
                id: draft?.id ?? "",
                peerId,
                conversationId: convo?.id,
                text,
                sendAt,
                keepMemory: keep,
              });
              onClose();
            }}
            style={{
              marginTop: 16,
              marginBottom: 12,
              backgroundColor: !text.trim() || !peerId ? "#C8C8CC" : c.ink,
              borderRadius: 16,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Park it</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}
