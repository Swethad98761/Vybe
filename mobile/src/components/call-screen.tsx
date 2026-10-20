import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { pic } from "@/lib/media";
import {
  IconCamera,
  IconCalls,
  IconFlip,
  IconMic,
  IconPhoneHang,
  IconSpeaker,
} from "@/components/icons";
import { formatDuration } from "@/lib/format";
import { useStore } from "@/lib/store";
import { c, raised } from "@/theme";

function Pad({
  onPress,
  label,
  tone = "paper",
  children,
}: {
  onPress: () => void;
  label?: string;
  tone?: "paper" | "danger" | "ok";
  children: React.ReactNode;
}) {
  const bg = tone === "danger" ? "#D94040" : tone === "ok" ? "#2A8A50" : c.card;
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", gap: 8 }}>
      <View
        style={[
          tone === "paper" ? raised(2) : null,
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: bg,
            alignItems: "center",
            justifyContent: "center",
            ...(tone !== "paper"
              ? {
                  shadowColor: tone === "danger" ? "#D94040" : "#2A8A50",
                  shadowOpacity: 0.28,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 8 },
                }
              : null),
          },
        ]}
      >
        {children}
      </View>
      {label ? <Text style={{ fontSize: 12, color: c.inkSoft }}>{label}</Text> : null}
    </Pressable>
  );
}

export function CallScreen() {
  const { state, me, userById, patchCall, endCall, acceptCall, declineCall } = useStore();
  const insets = useSafeAreaInsets();
  const call = state.call;
  const peer = call ? userById(call.peerId) : undefined;
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    setElapsed(0);
  }, [call?.peerId, call?.status]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 1100, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!call || call.status !== "connecting") return;
    const t = setTimeout(() => {
      patchCall({ status: "connected", startedAt: Date.now() });
    }, 1500);
    return () => clearTimeout(t);
  }, [call, patchCall]);

  useEffect(() => {
    if (!call || call.status !== "connected") return;
    const started = call.startedAt ?? Date.now();
    const i = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    }, 1000);
    return () => clearInterval(i);
  }, [call]);

  if (!call || !peer) return null;

  const incoming = call.status === "incoming";
  const kind = call.mode === "video" ? "Video" : "Voice";
  const statusLabel = incoming
    ? "Incoming"
    : call.status === "connecting"
      ? "Connecting…"
      : formatDuration(elapsed);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 80,
        backgroundColor: c.paper,
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 28,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 22,
        }}
      >
        <Text style={[tCaps]}>{kind}</Text>
        <Text style={{ fontVariant: ["tabular-nums"], fontSize: 12, color: c.inkSoft }}>
          {call.status === "connected" ? "" : statusLabel}
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {call.mode === "video" && !call.cameraOff && !incoming ? (
          <View
            style={{
              width: "78%",
              maxWidth: 300,
              aspectRatio: 3 / 4,
              borderRadius: 28,
              overflow: "hidden",
              backgroundColor: "#17171A",
            }}
          >
            {pic(peer.photo) ? (
              <Image source={pic(peer.photo)!} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Avatar user={peer} size={88} />
              </View>
            )}
            <View style={{ position: "absolute", right: 12, bottom: 12 }}>
              <View
                style={{
                  width: 80,
                  height: 112,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: "#2A2A2E",
                  transform: [{ scaleX: call.facingFront === false ? -1 : 1 }],
                }}
              >
                {pic(me.photo) ? (
                  <Image source={pic(me.photo)!} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Avatar user={me} size={44} />
                  </View>
                )}
              </View>
              <Pressable
                accessibilityLabel="Flip camera"
                onPress={() => patchCall({ facingFront: call.facingFront === false })}
                style={{
                  position: "absolute",
                  top: -8,
                  left: -8,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: c.card,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFlip size={16} color={c.ink} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ width: 168, height: 168, alignItems: "center", justifyContent: "center" }}>
            <Animated.View
              style={{
                position: "absolute",
                width: 210,
                height: 210,
                borderRadius: 105,
                borderWidth: 1,
                borderColor: "rgba(23,23,26,0.10)",
                opacity: pulse,
                transform: [{ scale: pulse }],
              }}
            />
            <View
              style={[
                raised(3),
                {
                  width: 168,
                  height: 168,
                  borderRadius: 84,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <Avatar user={peer} size={132} />
            </View>
          </View>
        )}
        <Text style={{ marginTop: 26, fontSize: 26, fontWeight: "600", color: c.ink }}>
          {peer.name}
        </Text>
        <Text style={{ marginTop: 6, fontSize: 14, color: c.inkSoft }}>{kind} call</Text>
        {call.status === "connected" ? (
          <Text style={{ marginTop: 8, fontSize: 15, color: c.inkFaint, fontVariant: ["tabular-nums"] }}>
            {formatDuration(elapsed)}
          </Text>
        ) : null}
      </View>

      {incoming ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 56,
            paddingHorizontal: 24,
          }}
        >
          <Pad tone="danger" label="Decline" onPress={() => declineCall()}>
            <IconPhoneHang size={24} color="#fff" />
          </Pad>
          <Pad tone="ok" label="Accept" onPress={() => acceptCall()}>
            <IconCalls size={24} color="#fff" />
          </Pad>
        </View>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: call.mode === "video" ? 10 : 18,
            paddingHorizontal: 16,
          }}
        >
          <Pad label={call.muted ? "Muted" : "Mute"} onPress={() => patchCall({ muted: !call.muted })}>
            <IconMic size={22} color={c.ink} muted={call.muted} />
          </Pad>
          <Pad
            label={call.speaker ? "Speaker" : "Earpiece"}
            onPress={() => patchCall({ speaker: !call.speaker })}
          >
            <IconSpeaker size={22} color={c.ink} />
          </Pad>
          {call.mode === "video" ? (
            <Pad
              label={call.cameraOff ? "Camera off" : "Camera"}
              onPress={() => patchCall({ cameraOff: !call.cameraOff })}
            >
              <IconCamera size={22} color={c.ink} off={call.cameraOff} />
            </Pad>
          ) : null}
          <Pad tone="danger" label="End" onPress={() => endCall(elapsed)}>
            <IconPhoneHang size={22} color="#fff" />
          </Pad>
        </View>
      )}
    </View>
  );
}

const tCaps = {
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase" as const,
  color: c.inkFaint,
  fontWeight: "500" as const,
};
