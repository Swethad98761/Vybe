import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { type Href, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconCalls, IconPlus, IconVideo } from "@/components/icons";
import { Card, Paper } from "@/components/surface";
import { clockTime, formatDuration, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { CallRecord } from "@/lib/types";
import { c, type as t } from "@/theme";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "video", label: "Video" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

function describeCall(item: CallRecord) {
  const dir = item.direction === "missed" ? "Missed" : item.direction === "incoming" ? "Incoming" : "Outgoing";
  const kind = item.kind === "video" ? "video" : "voice";
  const bits = [`${dir} ${kind}`];
  if (item.durationSec) bits.push(formatDuration(item.durationSec));
  bits.push(clockTime(item.createdAt));
  bits.push(relativeTime(item.createdAt));
  return bits.join(" · ");
}

export default function CallsScreen() {
  const { state, userById, startCall, openChatWith, hideCall, unhideCall, dropCall } = useStore();
  const [menuOf, setMenuOf] = useState<CallRecord | null>(null);
  const [hiddenOpen, setHiddenOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pager = useRef<ScrollView>(null);
  const [page, setPage] = useState({ w: 0, h: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const visible = state.calls.filter((x) => !x.hidden);
  const hidden = state.calls.filter((x) => x.hidden);
  const last = visible.find((x) => x.direction !== "missed") ?? visible[0];
  const lastPeer = last ? userById(last.peerId) : undefined;

  const goTo = (id: Filter) => {
    setFilter(id);
    const i = FILTERS.findIndex((item) => item.id === id);
    if (page.w) pager.current?.scrollTo({ x: i * page.w, animated: true });
  };

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!page.w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / page.w);
    const next = FILTERS[i]?.id;
    if (next && next !== filter) setFilter(next);
  };

  return (
    <Paper>
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
          onPress={() => router.push("/calls/new" as Href)}
          hitSlop={8}
          accessibilityLabel="New call"
          style={{ width: 40, alignItems: "center", paddingVertical: 10 }}
        >
          <IconPlus size={23} color={c.ink} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {FILTERS.map(({ id, label }) => {
            const on = filter === id;
            return (
              <Pressable key={id} onPress={() => goTo(id)} style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: on ? "600" : "400", color: on ? c.ink : c.inkGhost }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ width: 40 }} />
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
            onMomentumScrollEnd={onMomentum}
          >
            {FILTERS.map((item) => (
              <View key={item.id} style={{ width: page.w, height: page.h }}>
                <CallLane
                  filter={item.id}
                  calls={visible}
                  hidden={hidden}
                  hiddenOpen={hiddenOpen}
                  onHiddenOpen={setHiddenOpen}
                  last={item.id === "all" ? last : undefined}
                  lastPeer={item.id === "all" ? lastPeer : undefined}
                  bottom={insets.bottom}
                  userById={userById}
                  onCall={(peerId, kind) => startCall(peerId, kind, openChatWith(peerId))}
                  onHold={setMenuOf}
                  onUnhide={unhideCall}
                />
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
      {menuOf ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.28)",
            justifyContent: "flex-end",
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={() => setMenuOf(null)} />
          <View
            style={{
              backgroundColor: c.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: insets.bottom + 18,
            }}
          >
            <Text style={[t.caps, { textAlign: "center" }]}>This call</Text>
            <Pressable
              onPress={() => {
                hideCall(menuOf.id);
                setHiddenOpen(true);
                setMenuOf(null);
              }}
              style={{ marginTop: 16, backgroundColor: c.paperDeep, borderRadius: 16, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: "center", fontSize: 14, color: c.ink }}>Hide</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                dropCall(menuOf.id);
                setMenuOf(null);
              }}
              style={{ marginTop: 8, paddingVertical: 12 }}
            >
              <Text style={{ textAlign: "center", fontSize: 14, color: c.danger }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Paper>
  );
}

function CallLane({
  filter,
  calls,
  hidden,
  hiddenOpen,
  onHiddenOpen,
  last,
  lastPeer,
  bottom,
  userById,
  onCall,
  onHold,
  onUnhide,
}: {
  filter: Filter;
  calls: CallRecord[];
  hidden: CallRecord[];
  hiddenOpen: boolean;
  onHiddenOpen: Dispatch<SetStateAction<boolean>>;
  last?: CallRecord;
  lastPeer?: ReturnType<ReturnType<typeof useStore>["userById"]>;
  bottom: number;
  userById: ReturnType<typeof useStore>["userById"];
  onCall: (peerId: string, kind: CallRecord["kind"]) => void;
  onHold: (item: CallRecord) => void;
  onUnhide: (id: string) => void;
}) {
  const startY = useRef(0);
  const rows = useMemo(() => {
    return calls.filter((item) => {
      if (filter === "missed") return item.direction === "missed";
      if (filter === "video") return item.kind === "video";
      return true;
    });
  }, [calls, filter]);

  const hiddenRows = useMemo(() => {
    return hidden.filter((item) => {
      if (filter === "missed") return item.direction === "missed";
      if (filter === "video") return item.kind === "video";
      return true;
    });
  }, [hidden, filter]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(x) => x.id}
      nestedScrollEnabled
      contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: bottom + 26 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => onHiddenOpen(true)} tintColor={c.inkSoft} />
      }
      onScrollBeginDrag={(e) => {
        startY.current = e.nativeEvent.contentOffset.y;
      }}
      onScrollEndDrag={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        if (startY.current <= 24 && y < startY.current - 12) onHiddenOpen(true);
        if (y > startY.current + 28) onHiddenOpen(false);
      }}
      ListHeaderComponent={
        <View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, paddingTop: 4, paddingBottom: 8 }}>
            <Text style={[t.meta, { flex: 1, lineHeight: 18 }]}>
              Long-press to hide. Swipe down, or Hidden, for what you tucked away.
            </Text>
            <Pressable onPress={() => onHiddenOpen((open) => !open)} hitSlop={8}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink }}>{hiddenOpen ? "Hide" : "Hidden"}</Text>
            </Pressable>
          </View>
          {hiddenOpen ? (
            <View style={{ marginBottom: 12 }}>
              <Text style={[t.caps, { marginBottom: 8, marginLeft: 4 }]}>Hidden</Text>
              {hiddenRows.length === 0 ? (
                <Text style={[t.soft, { textAlign: "center", paddingVertical: 18 }]}>No hidden calls.</Text>
              ) : (
                hiddenRows.map((item) => {
                  const peer = userById(item.peerId);
                  const missed = item.direction === "missed";
                  const incoming = item.direction === "incoming";
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => peer && onCall(peer.id, item.kind)}
                      onLongPress={() => onUnhide(item.id)}
                      delayLongPress={420}
                    >
                      <Card depth={1} radius={18} style={{ marginBottom: 10, padding: 14 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                          <Avatar user={peer} size={42} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: "600", color: missed ? c.danger : c.ink }}>
                              {peer?.name ?? "Unknown"}
                            </Text>
                            <Text style={[t.meta, incoming && !missed ? { color: c.green } : null]}>
                              Hidden · {describeCall(item)}
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })
              )}
            </View>
          ) : null}
          {filter === "all" && last && lastPeer ? (
            <Card depth={2} radius={20} style={{ padding: 16, marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar user={lastPeer} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={t.caps}>Last</Text>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink, marginTop: 2 }}>{lastPeer.name}</Text>
                  <Text style={t.meta}>{describeCall(last)}</Text>
                </View>
                <Pressable onPress={() => onCall(lastPeer.id, "voice")} hitSlop={8} accessibilityLabel="Voice">
                  <IconCalls size={20} color={c.ink} />
                </Pressable>
                <Pressable onPress={() => onCall(lastPeer.id, "video")} hitSlop={8} accessibilityLabel="Video">
                  <IconVideo size={20} color={c.ink} />
                </Pressable>
              </View>
            </Card>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[t.soft, { textAlign: "center", marginTop: 40 }]}>
          {filter === "missed" ? "No missed calls." : filter === "video" ? "No video calls yet." : "No calls yet."}
        </Text>
      }
      renderItem={({ item }) => {
        const peer = userById(item.peerId);
        const missed = item.direction === "missed";
        const incoming = item.direction === "incoming";
        return (
          <Pressable
            onPress={() => peer && onCall(peer.id, item.kind)}
            onLongPress={() => onHold(item)}
            delayLongPress={420}
          >
            <Card depth={1} radius={18} style={{ marginBottom: 10, padding: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Avatar user={peer} size={42} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: missed ? c.danger : c.ink }}>
                    {peer?.name ?? "Unknown"}
                  </Text>
                  <Text style={[t.meta, incoming && !missed ? { color: c.green } : null]}>{describeCall(item)}</Text>
                </View>
                <Card depth={1} radius={20} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
                  {item.kind === "video" ? <IconVideo size={16} color={c.ink} /> : <IconCalls size={16} color={c.ink} />}
                </Card>
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}
