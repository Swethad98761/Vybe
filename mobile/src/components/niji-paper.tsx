import { useRef, useState } from "react";
import { Image, Platform, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { BlurView } from "expo-blur";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ViewShot, { type ViewShotRef } from "react-native-view-shot";
import { NijiSeal } from "@/components/niji-seal";
import { nijiPaperUri, nijiShareText } from "@/lib/niji-link";
import { brand } from "@/lib/media";
import { storyFrame } from "@/lib/story-art";
import { c, type as t } from "@/theme";

export function NijiPaper({
  nijiId,
  name,
  onClose,
  uri,
  shareText,
  shareLabel = "Share Niji ID",
  kicker,
  subtitle,
}: {
  nijiId: string;
  name: string;
  onClose: () => void;
  uri?: string;
  shareText?: string;
  shareLabel?: string;
  kicker?: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();
  const win = useWindowDimensions();
  const [box, setBox] = useState({ width: win.width, height: win.height });
  const shot = useRef<ViewShotRef>(null);
  const [busy, setBusy] = useState(false);
  const payload = uri || nijiPaperUri(nijiId);
  const text = shareText || nijiShareText(nijiId);
  const first = name.trim().split(/\s+/)[0] || name;
  const frame = storyFrame(box.width, box.height);

  async function sharePage() {
    if (busy) return;
    setBusy(true);
    try {
      const file = await shot.current?.capture?.();
      if (Platform.OS === "ios" && file) {
        await Share.share({ url: file, message: text });
        return;
      }
      if (file && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(file, { mimeType: "image/png", dialogTitle: nijiId, UTI: "public.png" });
        return;
      }
      await Share.share({ message: text, url: file });
    } catch {
      try {
        await Share.share({ message: text });
      } catch {
        /* cancelled */
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      onPress={onClose}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width && height && (width !== box.width || height !== box.height)) {
          setBox({ width, height });
        }
      }}
      style={[StyleSheet.absoluteFill, { backgroundColor: c.paper, overflow: "hidden" }]}
    >
      <ViewShot
        ref={shot}
        options={{ format: "png", quality: 1, result: "tmpfile" }}
        style={StyleSheet.absoluteFill}
      >
        <View collapsable={false} style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
          <Image source={brand.story} style={frame} resizeMode="cover" />
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: "flex-end",
                padding: 20,
                paddingBottom: insets.bottom + 88,
              },
            ]}
            pointerEvents="none"
          >
            <BlurView
              intensity={36}
              tint="light"
              style={{
                borderRadius: 24,
                overflow: "hidden",
                padding: 20,
                backgroundColor: "rgba(235,235,236,0.42)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.22)",
              }}
            >
              <Text style={[t.meta, { textAlign: "center" }]}>{kicker || `A seal that finds ${first}.`}</Text>
              <View style={{ alignSelf: "center", marginTop: 16 }}>
                <NijiSeal value={payload} size={220} />
              </View>
              {subtitle ? (
                <Text style={{ marginTop: 12, textAlign: "center", fontSize: 15, fontWeight: "600", color: c.ink }}>
                  {subtitle}
                </Text>
              ) : null}
              <Text
                style={{
                  marginTop: subtitle ? 4 : 12,
                  textAlign: "center",
                  fontSize: subtitle ? 13 : 15,
                  fontWeight: subtitle ? "400" : "600",
                  color: c.ink,
                }}
              >
                {nijiId}
              </Text>
            </BlurView>
          </View>
        </View>
      </ViewShot>
      <View
        pointerEvents="box-none"
        style={{ position: "absolute", left: 20, right: 20, bottom: insets.bottom + 24 }}
      >
        <Pressable
          onPress={sharePage}
          style={{
            backgroundColor: "rgba(235,235,236,0.55)",
            borderRadius: 16,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: c.ink }}>{busy ? "Sharing" : shareLabel}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
