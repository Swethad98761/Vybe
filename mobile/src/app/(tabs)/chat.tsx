import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { GhostPane, LaterPane, ScheduleSheet } from "@/components/chat-panes";
import { IconChat, IconHubChat, IconLater, IconMist, IconPin, IconPlus } from "@/components/icons";
import { StatusCompose } from "@/components/status-compose";
import { StatusViewer } from "@/components/status-viewer";
import { Card, Groove, Paper } from "@/components/surface";
import { relativeTime } from "@/lib/format";
import { pic } from "@/lib/media";
import { SealGate } from "@/components/seal-gate";
import { chatStatusFaces, hasFreshPulse, hasPulse, isAround, isMeChat, threadPeerId, threadPreview } from "@/lib/presence";
import { givenName } from "@/lib/vybe-stats";
import { lockSeal, sealUnlocked, unlockSeal } from "@/lib/seal";
import { useStore } from "@/lib/store";
import type { Conversation, ScheduledMessage } from "@/lib/types";
import { c, type as t } from "@/theme";

const CHAT_TABS = [
  { id: "trusted", label: "Trusted chats", Icon: IconChat },
  { id: "hub", label: "Hub chat", Icon: IconHubChat },
  { id: "ghost", label: "Mist", Icon: IconMist },
  { id: "later", label: "Later", Icon: IconLater },
] as const;

type ChatTab = (typeof CHAT_TABS)[number]["id"];

export default function ChatListScreen() {
  const { state, userById, me, setThread, dropConversation, setSealPin } = useStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pager = useRef<ScrollView>(null);
  const [tab, setTab] = useState<ChatTab>("trusted");
  const [page, setPage] = useState({ w: 0, h: 0 });
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [statusOf, setStatusOf] = useState<string | null>(null);
  const [compose, setCompose] = useState(false);
  const [youPick, setYouPick] = useState(false);
  const [schedule, setSchedule] = useState<ScheduledMessage | null | undefined>(undefined);
  const [mintOpen, setMintOpen] = useState(false);
  const [menuOf, setMenuOf] = useState<string | null>(null);
  const [fadeOf, setFadeOf] = useState<string | null>(null);
  const [gate, setGate] = useState<{
    mode: "set" | "open";
    id: string;
    next?: "unseal" | "open" | "set-common" | "set-chat";
  } | null>(null);
  const [sealOf, setSealOf] = useState<string | null>(null);
  const startY = useRef(0);

  const rows = useMemo(() => {
    const list = state.conversations
      .filter((item) => !item.ghost && item.lane !== "vybe" && item.lane !== "hub")
      .sort((a, b) => {
        if (Boolean(b.pinned) !== Boolean(a.pinned)) return a.pinned ? -1 : 1;
        const at = a.messages.at(-1)?.createdAt ?? "";
        const bt = b.messages.at(-1)?.createdAt ?? "";
        return +new Date(bt) - +new Date(at);
      });
    if (!q.trim()) return list;
    const needle = q.toLowerCase();
    return list.filter((item) => {
      const notes = isMeChat(item, me.id);
      const peer = userById(threadPeerId(item, me.id));
      const title = notes ? "Me" : (item.name ?? peer?.name ?? "");
      return title.toLowerCase().includes(needle) || (peer?.nijiId ?? "").toLowerCase().includes(needle);
    });
  }, [state.conversations, q, me.id, userById]);

  const hubRows = state.conversations
    .filter((item) => item.lane === "hub" && !item.ghost)
    .sort((a, b) => {
      const at = a.messages.at(-1)?.createdAt ?? "";
      const bt = b.messages.at(-1)?.createdAt ?? "";
      return +new Date(bt) - +new Date(at);
    });

  const openChat = (id: string, sealed?: boolean) => {
    if (sealed && !sealUnlocked(id)) {
      setGate({ mode: "open", id, next: "open" });
      return;
    }
    router.push(`/chat/${id}`);
  };

  const requestSeal = (id: string, sealed?: boolean) => {
    if (sealed) {
      setGate({ mode: "open", id, next: "unseal" });
      setMenuOf(null);
      setFadeOf(null);
      setSealOf(null);
      return;
    }
    if (!state.sealPin) {
      setGate({ mode: "set", id, next: "set-common" });
      setMenuOf(null);
      setSealOf(null);
      return;
    }
    setSealOf(id);
    setFadeOf(null);
  };

  const sealHash = (id: string) => {
    const convo = state.conversations.find((item) => item.id === id);
    return convo?.sealPin ?? state.sealPin;
  };

  const live = rows.filter((item) => !item.archived);
  const shelf = rows.filter((item) => item.archived);
  const floatingStatus = chatStatusFaces(me.id, state.users, state.statuses);
  const openYou = () => {
    if (hasPulse(me.id, state.statuses, "chat")) setYouPick(true);
    else setCompose(true);
  };

  const goTo = (id: ChatTab) => {
    setTab(id);
    const i = CHAT_TABS.findIndex((item) => item.id === id);
    if (page.w) pager.current?.scrollTo({ x: i * page.w, animated: true });
  };

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!page.w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / page.w);
    const next = CHAT_TABS[i]?.id;
    if (next && next !== tab) setTab(next);
  };

  return (
    <Paper style={{ position: "relative" }}>
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 6,
          paddingBottom: 4,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => {
            if (tab === "trusted") router.push("/chat/new");
            else if (tab === "hub") router.push("/hub");
            else if (tab === "later") setSchedule(null);
            else setMintOpen(true);
          }}
          hitSlop={8}
          accessibilityLabel={
            tab === "later" ? "Park a message" : tab === "ghost" ? "Mint a name" : tab === "hub" ? "Open Hub" : "New chat"
          }
          style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}
        >
          <IconPlus size={23} color={c.ink} />
        </Pressable>
        {CHAT_TABS.map(({ id, label, Icon }) => {
          const on = tab === id;
          return (
            <Pressable
              key={id}
              accessibilityLabel={label}
              onPress={() => goTo(id)}
              style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}
            >
              <Icon size={23} color={on ? c.ink : c.inkGhost} />
            </Pressable>
          );
        })}
      </View>

      <View
        style={{ flex: 1 }}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (width !== page.w || height !== page.h) setPage({ w: width, h: height });
        }}
      >
        {page.w > 0 ? (
          <ScrollView
            ref={pager}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onMomentumScrollEnd={onMomentum}
          >
            <View style={{ width: page.w, height: page.h }}>
              {searchOpen ? (
                <View style={{ paddingHorizontal: 18, paddingBottom: 8 }}>
                  <Groove
                    style={{
                      height: 44,
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      autoFocus
                      value={q}
                      onChangeText={setQ}
                      placeholder="Search"
                      placeholderTextColor={c.inkGhost}
                      style={{ flex: 1, fontSize: 15, color: c.ink }}
                    />
                    <Pressable
                      onPress={() => {
                        setSearchOpen(false);
                        setQ("");
                      }}
                      hitSlop={8}
                    >
                      <Text style={{ fontSize: 13, color: c.inkFaint }}>Done</Text>
                    </Pressable>
                  </Groove>
                </View>
              ) : null}

              <FlatList
                data={live}
                keyExtractor={(x) => x.id}
                nestedScrollEnabled
                contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 2, paddingBottom: insets.bottom + 12 }}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={(e) => {
                  startY.current = e.nativeEvent.contentOffset.y;
                }}
                onScrollEndDrag={(e) => {
                  const y = e.nativeEvent.contentOffset.y;
                  if (startY.current <= 4 && y < -24) setSearchOpen(true);
                  if (searchOpen && y > startY.current + 24) {
                    setSearchOpen(false);
                    setQ("");
                  }
                }}
                ListHeaderComponent={
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0, marginBottom: 4 }}
                    contentContainerStyle={{ gap: 12, paddingBottom: 0 }}
                  >
                    <Pressable onPress={openYou} accessibilityLabel="Your status" style={{ width: 48, alignItems: "center" }}>
                      <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                        <Avatar user={me} size={36} story pulse={false} />
                        <View
                          style={{
                            position: "absolute",
                            right: 0,
                            bottom: 0,
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: c.ink,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontSize: 10, lineHeight: 12 }}>+</Text>
                        </View>
                      </View>
                      <Text style={{ marginTop: 4, fontSize: 10, color: c.inkFaint }} numberOfLines={1}>
                        You
                      </Text>
                    </Pressable>
                    {floatingStatus.map((u) => {
                      const fresh = hasFreshPulse(u.id, state.statuses, me.id, "chat");
                      return (
                        <Pressable
                          key={u.id}
                          onPress={() => setStatusOf(u.id)}
                          accessibilityLabel={`${u.name} status`}
                          style={{ width: 48, alignItems: "center" }}
                        >
                          <View style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
                            <Avatar user={u} size={36} story pulse={fresh} />
                          </View>
                          <Text style={{ marginTop: 4, fontSize: 10, color: c.inkFaint }} numberOfLines={1}>
                            {givenName(u.name)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                }
                ListEmptyComponent={
                  live.length === 0 && shelf.length === 0 ? (
                    <Text style={[t.soft, { textAlign: "center", paddingVertical: 40 }]}>
                      {q.trim() ? "No chats match that name." : "No trusted chats yet."}
                    </Text>
                  ) : null
                }
                ListFooterComponent={
                  shelf.length ? (
                    <View style={{ marginTop: 8 }}>
                      <Text style={{ fontSize: 11, color: c.inkFaint, letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" }}>
                        Shelf
                      </Text>
                      {shelf.map((item) => (
                        <ChatCard
                          key={item.id}
                          convo={item}
                          open={menuOf === item.id}
                          fading={fadeOf === item.id}
                          onOpen={() => openChat(item.id, item.sealed)}
                          onHold={() => {
                            setFadeOf(null);
                            setMenuOf((cur) => (cur === item.id ? null : item.id));
                          }}
                          onClose={() => {
                            setMenuOf(null);
                            setFadeOf(null);
                          }}
                          onShelf={() => {
                            setThread(item.id, { archived: false });
                            setMenuOf(null);
                            setFadeOf(null);
                          }}
                          onFadeAsk={() => setFadeOf(item.id)}
                          onFadeKeep={() => setFadeOf(null)}
                          onFade={() => {
                            dropConversation(item.id);
                            setMenuOf(null);
                            setFadeOf(null);
                          }}
                          pickingSeal={sealOf === item.id}
                          onSeal={() => requestSeal(item.id, item.sealed)}
                          onSealCommon={() => {
                            setThread(item.id, { sealed: true });
                            lockSeal(item.id);
                            setMenuOf(null);
                            setSealOf(null);
                          }}
                          onSealNew={() => {
                            setGate({ mode: "set", id: item.id, next: "set-chat" });
                            setMenuOf(null);
                            setSealOf(null);
                          }}
                        />
                      ))}
                    </View>
                  ) : null
                }
                renderItem={({ item }) => (
                  <ChatCard
                    convo={item}
                    open={menuOf === item.id}
                    fading={fadeOf === item.id}
                    pickingSeal={sealOf === item.id}
                    onOpen={() => openChat(item.id, item.sealed)}
                    onHold={() => {
                      setFadeOf(null);
                      setMenuOf((cur) => (cur === item.id ? null : item.id));
                    }}
                    onClose={() => {
                      setMenuOf(null);
                      setFadeOf(null);
                    }}
                    onShelf={() => {
                      setThread(item.id, { archived: true });
                      setMenuOf(null);
                      setFadeOf(null);
                    }}
                    onFadeAsk={() => setFadeOf(item.id)}
                    onFadeKeep={() => setFadeOf(null)}
                    onFade={() => {
                      dropConversation(item.id);
                      setMenuOf(null);
                      setFadeOf(null);
                    }}
                    onSeal={() => requestSeal(item.id, item.sealed)}
                    onSealCommon={() => {
                      setThread(item.id, { sealed: true });
                      lockSeal(item.id);
                      setMenuOf(null);
                      setSealOf(null);
                    }}
                    onSealNew={() => {
                      setGate({ mode: "set", id: item.id, next: "set-chat" });
                      setMenuOf(null);
                      setSealOf(null);
                    }}
                  />
                )}
              />
            </View>

            <View style={{ width: page.w, height: page.h }}>
              <FlatList
                data={hubRows}
                keyExtractor={(x) => x.id}
                contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 12 }}
                ListEmptyComponent={
                  <Text style={[t.meta, { textAlign: "center", paddingTop: 64 }]}>
                    Enquire from a stall on Hub. Those threads live here.
                  </Text>
                }
                renderItem={({ item }) => {
                  const shop = state.shops.find((s) => s.id === item.shopId);
                  const last = item.messages.at(-1);
                  return (
                    <Pressable onPress={() => openChat(item.id, item.sealed)} style={{ marginBottom: 10 }}>
                      <Card depth={1} radius={18} style={{ padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 22, overflow: "hidden", backgroundColor: c.paperDeep }}>
                          {shop?.cover && pic(shop.cover) ? (
                            <Image source={pic(shop.cover)} style={{ width: 44, height: 44 }} />
                          ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, fontWeight: item.unread > 0 ? "700" : "600", color: c.ink }} numberOfLines={1}>
                            {item.name ?? shop?.name ?? "Stall"}
                          </Text>
                          <Text style={[t.meta, item.unread > 0 ? { color: c.ink, fontWeight: "600" } : null]} numberOfLines={1}>{last?.text ?? "No messages yet."}</Text>
                        </View>
                      </Card>
                    </Pressable>
                  );
                }}
              />
            </View>
            <View style={{ width: page.w, height: page.h }}>
              <GhostPane mintOpen={mintOpen} onMintOpen={() => setMintOpen(true)} onMintClose={() => setMintOpen(false)} />
            </View>
            <View style={{ width: page.w, height: page.h }}>
              <LaterPane onCompose={(draft) => setSchedule(draft ?? null)} />
            </View>
          </ScrollView>
        ) : null}
      </View>

      {gate ? (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 30 }}>
          <SealGate
            mode={gate.mode}
            hash={sealHash(gate.id)}
            onClose={() => setGate(null)}
            onSet={(pin) => {
              if (gate.next === "set-chat") {
                setThread(gate.id, { sealed: true, sealPin: pin });
              } else {
                setSealPin(pin);
                setThread(gate.id, { sealed: true });
              }
              lockSeal(gate.id);
              setGate(null);
            }}
            onUnlock={() => {
              if (gate.next === "unseal") {
                setThread(gate.id, { sealed: false });
                lockSeal(gate.id);
                setGate(null);
                return;
              }
              unlockSeal(gate.id);
              const id = gate.id;
              setGate(null);
              router.push(`/chat/${id}`);
            }}
          />
        </View>
      ) : null}
      {statusOf ? <StatusViewer authorId={statusOf} lane="chat" onClose={() => setStatusOf(null)} /> : null}
      {compose ? <StatusCompose lane="chat" onClose={() => setCompose(false)} /> : null}
      {youPick ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setYouPick(false)}>
          <Pressable style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }} onPress={() => setYouPick(false)}>
            <Pressable
              onPress={() => {}}
              style={{ backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: insets.bottom + 16 }}
            >
              <Text style={[t.caps, { textAlign: "center" }]}>Your status</Text>
              <Pressable
                onPress={() => {
                  setYouPick(false);
                  setCompose(true);
                }}
                style={{ marginTop: 16, backgroundColor: c.paperDeep, borderRadius: 16, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, color: c.ink }}>Put up a status</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setYouPick(false);
                  setStatusOf(me.id);
                }}
                style={{ marginTop: 8, paddingVertical: 12, alignItems: "center" }}
              >
                <Text style={{ fontSize: 15, color: c.ink }}>See yours</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
      {schedule !== undefined ? <ScheduleSheet draft={schedule} onClose={() => setSchedule(undefined)} /> : null}
    </Paper>
  );
}

function PaperChip({
  label,
  onPress,
  ink,
}: {
  label: string;
  onPress: () => void;
  ink?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: ink ? c.ink : c.paperDeep,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "600", color: ink ? c.card : c.ink }}>{label}</Text>
    </Pressable>
  );
}

function ChatCard({
  convo,
  open,
  fading,
  pickingSeal,
  onOpen,
  onHold,
  onClose,
  onShelf,
  onFadeAsk,
  onFadeKeep,
  onFade,
  onSeal,
  onSealCommon,
  onSealNew,
}: {
  convo: Conversation;
  open: boolean;
  fading: boolean;
  pickingSeal?: boolean;
  onOpen: () => void;
  onHold: () => void;
  onClose: () => void;
  onShelf: () => void;
  onFadeAsk: () => void;
  onFadeKeep: () => void;
  onFade: () => void;
  onSeal: () => void;
  onSealCommon?: () => void;
  onSealNew?: () => void;
}) {
  const { state, userById, me } = useStore();
  const notes = isMeChat(convo, me.id);
  const peerId = threadPeerId(convo, me.id);
  const peer = userById(peerId);
  const last = convo.messages.at(-1);
  const title = notes ? "Me" : (convo.name ?? peer?.name ?? "Chat");
  const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);
  const unread = convo.unread > 0 && !convo.quiet && !convo.archived;

  return (
    <Card depth={1} radius={18} style={{ marginBottom: 10, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable onPress={onOpen} accessibilityLabel={title}>
          {convo.isGroup ? (
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
              <Text style={{ fontSize: 20 }}>{convo.emoji ?? "👥"}</Text>
            </View>
          ) : (
            <Avatar user={peer} size={44} place="chat" around={around} vybeOn={state.vybeEnabled} />
          )}
        </Pressable>
        <Pressable
          onPress={() => (open ? onClose() : onOpen())}
          onLongPress={onHold}
          delayLongPress={420}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            {convo.pinned ? <IconPin size={12} color={c.inkFaint} /> : null}
            <Text style={{ fontSize: 15, fontWeight: unread ? "700" : "400", color: c.ink, flexShrink: 1 }} numberOfLines={1}>
              {title}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={t.meta}>{last ? relativeTime(last.createdAt) : ""}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginTop: 3 }}>
            <Text style={[t.soft, { flex: 1, color: unread ? c.ink : c.inkSoft, fontWeight: unread ? "600" : "400" }]} numberOfLines={1}>
              {threadPreview(convo)}
            </Text>
          </View>
          {open ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10 }}>
              {fading ? (
                <>
                  <Text style={{ fontSize: 11, color: c.inkSoft, marginRight: 2 }}>Fade this paper?</Text>
                  <PaperChip ink label="Fade it" onPress={onFade} />
                  <PaperChip label="Keep" onPress={onFadeKeep} />
                </>
              ) : pickingSeal ? (
                <>
                  <Text style={{ fontSize: 11, color: c.inkSoft, marginRight: 2 }}>Seal with</Text>
                  <PaperChip ink label="Your code" onPress={() => onSealCommon?.()} />
                  <PaperChip label="A new code" onPress={() => onSealNew?.()} />
                </>
              ) : (
                <>
                  <PaperChip label={convo.archived ? "Unshelf" : "Shelf"} onPress={onShelf} />
                  <PaperChip label="Fade" onPress={onFadeAsk} />
                  <PaperChip label={convo.sealed ? "Unseal" : "Seal"} onPress={onSeal} />
                </>
              )}
            </View>
          ) : null}
        </Pressable>
      </View>
    </Card>
  );
}
