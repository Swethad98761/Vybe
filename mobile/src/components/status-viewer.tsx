import { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { MoodWash, moodInk } from "@/components/moods";
import { canReshareStatus, lookedBy, lookedCopy, statusesFor, statusViewMs, visibleStatusesFor } from "@/lib/presence";
import { pic } from "@/lib/media";
import { useStore } from "@/lib/store";
import type { ChatStatus } from "@/lib/types";
import { c, type as t } from "@/theme";

export function StatusViewer({
  authorId,
  lane,
  onClose,
  onReshare,
}: {
  authorId: string;
  lane?: "chat" | "vybe";
  onClose: () => void;
  onReshare?: (item: ChatStatus) => void;
}) {
  const insets = useSafeAreaInsets();
  const { state, me, userById, viewStatus } = useStore();
  const items =
    lane === "vybe"
      ? visibleStatusesFor(authorId, state.statuses, lane, me.id, state.following)
      : statusesFor(authorId, state.statuses, lane);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [looks, setLooks] = useState(false);
  const author = userById(authorId);
  const item = items[i];
  const image = pic(item?.image);
  const line = item?.text;
  const marked = useRef(new Set<string>());
  const gest = useRef<{ x: number; y: number; t: number } | null>(null);
  const fill = useRef(new Animated.Value(0)).current;
  const dwell = item ? statusViewMs(item) : 6000;
  const mine = authorId === me.id;
  const looksIds = item ? lookedBy(item) : [];
  const lookNames = looksIds.map((id) => userById(id)?.name).filter((n): n is string => Boolean(n));
  const from = item?.resharedFromAuthorId ? userById(item.resharedFromAuthorId) : undefined;
  const share = Boolean(item && onReshare && canReshareStatus(item, me.id, state.following));

  function goNext() {
    if (i >= items.length - 1) onClose();
    else setI((n) => n + 1);
  }

  function goPrev() {
    if (i <= 0) onClose();
    else setI((n) => n - 1);
  }

  useEffect(() => {
    if (i > 0 && i >= items.length) setI(0);
  }, [i, items.length]);

  useEffect(() => {
    if (!item || mine || marked.current.has(item.id) || item.viewedBy.includes(me.id)) return;
    marked.current.add(item.id);
    viewStatus(item.id);
  }, [item, me.id, mine, viewStatus]);

  useEffect(() => {
    fill.setValue(0);
    if (!item || paused || looks || mine) return;
    const anim = Animated.timing(fill, { toValue: 1, duration: dwell, useNativeDriver: true });
    anim.start();
    const t = setTimeout(() => goNext(), dwell);
    return () => {
      anim.stop();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, i, items.length, dwell, paused, looks, onClose, fill]);

  if (!item || !author) return null;

  const endGest = (pageX: number, pageY: number) => {
    const g = gest.current;
    gest.current = null;
    setPaused(false);
    if (!g) return;
    const dx = pageX - g.x;
    const dy = pageY - g.y;
    const dt = Date.now() - g.t;
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }
    if (dt < 280 && Math.abs(dx) < 18 && Math.abs(dy) < 18) goNext();
  };

  return (
    <Modal visible animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: image ? "#111" : "#EBEBEC",
        }}
      >
        {image ? (
          <Image source={image} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <MoodWash id={item.mood ?? "plain"} />
        )}
        <View style={{ position: "absolute", top: insets.top + 10, left: 16, right: 16, flexDirection: "row", gap: 4, zIndex: 5 }}>
          {items.map((s, n) => (
            <View
              key={`${s.id}-${n}`}
              style={{ flex: 1, height: 2, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" }}
            >
              {n === i ? (
                <Animated.View
                  style={{
                    height: 2,
                    width: "100%",
                    backgroundColor: "#fff",
                    transformOrigin: "left center",
                    transform: [{ scaleX: fill }],
                  }}
                />
              ) : (
                <View style={{ height: 2, width: n < i ? "100%" : 0, backgroundColor: "#fff" }} />
              )}
            </View>
          ))}
        </View>
        <Pressable
          onPressIn={(e) => {
            const p = e.nativeEvent;
            gest.current = { x: p.pageX, y: p.pageY, t: Date.now() };
            setPaused(true);
          }}
          onPressOut={(e) => endGest(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        />
        <Pressable
          onPress={goPrev}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "16%", zIndex: 4 }}
        />
        <Pressable
          onPress={goNext}
          style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "16%", zIndex: 4 }}
        />
        {image ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 120,
              backgroundColor: "rgba(0,0,0,0.22)",
            }}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: insets.top + 36,
            left: 20,
            right: 20,
            zIndex: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Avatar user={author} size={32} around={false} />
          <View>
            <Text style={{ color: image ? "#fff" : moodInk(item.mood ?? "plain") }}>
              {mine ? "You" : author.name}
            </Text>
            {from ? (
              <Text style={{ color: image ? "rgba(255,255,255,0.7)" : moodInk(item.mood ?? "plain"), fontSize: 11, opacity: 0.7 }}>
                From {from.name}
              </Text>
            ) : null}
          </View>
        </View>
        {line ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 28,
              right: 28,
              top: 0,
              bottom: 0,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 6,
            }}
          >
            <Text
              style={{
                color: image ? "#fff" : moodInk(item.mood ?? "plain"),
                fontSize: 24,
                lineHeight: 30,
                textAlign: "center",
              }}
            >
              {line}
            </Text>
          </View>
        ) : null}
        {mine || share ? (
          <View
            style={{
              position: "absolute",
              left: 20,
              right: 20,
              bottom: insets.bottom + 16,
              zIndex: 8,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {mine ? (
              <Pressable
                accessibilityLabel="Looks"
                onPress={() => setLooks(true)}
                style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ color: "#fff", fontSize: 13 }}>{lookedCopy(lookNames)}</Text>
              </Pressable>
            ) : (
              <View />
            )}
            {share ? (
              <Pressable
                accessibilityLabel="Reshare"
                onPress={() => item && onReshare?.(item)}
                style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ color: "#fff", fontSize: 13 }}>Reshare</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        {looks ? (
          <Pressable
            onPress={() => setLooks(false)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 12,
              justifyContent: "flex-end",
            }}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: c.card,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                padding: 20,
                paddingBottom: insets.bottom + 16,
                maxHeight: "70%",
              }}
            >
              <Text style={[t.caps, { textAlign: "center" }]}>Looks</Text>
              <Text style={[t.meta, { textAlign: "center", marginTop: 4 }]}>{lookedCopy(lookNames)}</Text>
              <ScrollView style={{ marginTop: 16 }} showsVerticalScrollIndicator={false}>
                {looksIds.length === 0 ? (
                  <Text style={[t.meta, { textAlign: "center", paddingVertical: 28 }]}>Nobody has opened this yet.</Text>
                ) : (
                  looksIds.map((id) => {
                    const u = userById(id);
                    if (!u) return null;
                    return (
                      <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <Avatar user={u} size={36} around={false} />
                        <Text style={{ fontSize: 15, color: c.ink }}>{u.name}</Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </Pressable>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  );
}
