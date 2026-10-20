import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { MoodWash, StatusPaperRail, moodInk } from "@/components/moods";
import { Card, Groove, Paper } from "@/components/surface";
import { STATUS_TTLS } from "@/lib/presence";
import { pic } from "@/lib/media";
import { useStore } from "@/lib/store";
import type { StatusPaperId } from "@/lib/tokens";
import type { StatusAudience, StatusTtl } from "@/lib/types";
import { c, type as t } from "@/theme";

const STILLS = [
  "/media/posts/night-city.jpg",
  "/media/posts/coffee.jpg",
  "/media/posts/road.jpg",
  "/media/posts/concert.jpg",
];

export type StatusDraft = {
  text?: string;
  image?: string;
  resharedFrom?: string;
  resharedFromAuthorId?: string;
};

function StatusChip({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginRight: 8, marginBottom: 8 }}>
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 16,
          backgroundColor: on ? c.ink : c.paperDeep,
        }}
      >
        <Text style={{ color: on ? c.card : c.inkSoft, fontSize: 13 }}>{label}</Text>
      </View>
    </Pressable>
  );
}

export function StatusCompose({
  onClose,
  lane = "chat",
  draft,
}: {
  onClose: () => void;
  lane?: "chat" | "vybe";
  draft?: StatusDraft;
}) {
  const insets = useSafeAreaInsets();
  const { addStatus, state, me, userById } = useStore();
  const [text, setText] = useState(draft?.text ?? "");
  const [image, setImage] = useState<string | undefined>(draft?.image);
  const [postId, setPostId] = useState<string>();
  const [ttl, setTtl] = useState<StatusTtl>("1d");
  const [audience, setAudience] = useState<StatusAudience>("public");
  const [reshareable, setReshareable] = useState(false);
  const [mood, setMood] = useState<StatusPaperId>("plain");
  const mine = state.posts.filter((p) => p.authorId === me.id && !p.archived);
  const from = draft?.resharedFromAuthorId ? userById(draft.resharedFromAuthorId) : undefined;
  const vybe = lane === "vybe";
  const ready = Boolean(text.trim() || image || postId);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <Paper>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View
            style={{
              paddingTop: insets.top + 8,
              paddingHorizontal: 16,
              paddingBottom: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ fontSize: 15, color: c.inkSoft }}>Cancel</Text>
            </Pressable>
            <Text style={[t.caps, { flex: 1, textAlign: "center" }]}>
              {from ? "Reshare" : vybe ? "Vybe status" : "Your status"}
            </Text>
            <View style={{ width: 56 }} />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 28 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[t.meta, { textAlign: "center" }]}>
              {from
                ? `From ${from.name}. It lands on your rail, then it fades.`
                : vybe
                  ? "Lives on the story rail. Public or friends. Then it fades."
                  : "Lives in chat. Friends see it on your photo, then it fades. A vybe can ride along."}
            </Text>
            <Groove style={{ marginTop: 16, paddingHorizontal: 14, paddingVertical: 10, minHeight: 88 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="A line, if you want one"
                placeholderTextColor={c.inkGhost}
                multiline
                style={{ fontSize: 16, color: c.ink, minHeight: 68 }}
              />
            </Groove>
            {!image ? (
              <>
                <Text style={[t.caps, { marginTop: 18, marginBottom: 6 }]}>Paper</Text>
                <Text style={t.meta}>Face top-left. The line sits in the middle.</Text>
                <View style={{ marginTop: 10 }}>
                  <StatusPaperRail value={mood} onChange={setMood} />
                </View>
              </>
            ) : null}
            <View
              style={{
                marginTop: 12,
                height: 160,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#EBEBEC",
              }}
            >
              {image ? (
                <Image source={pic(image) ?? { uri: image }} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <MoodWash id={mood} />
              )}
              {image ? (
                <View
                  pointerEvents="none"
                  style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, backgroundColor: "rgba(0,0,0,0.22)" }}
                />
              ) : null}
              <View style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
                <Avatar user={me} size={28} around={false} />
              </View>
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  top: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    lineHeight: 26,
                    textAlign: "center",
                    color: image ? "#fff" : moodInk(mood),
                    fontFamily: "serif",
                  }}
                >
                  {text.trim() || "Your line sits here."}
                </Text>
              </View>
            </View>
            {vybe ? (
              <>
                <Text style={[t.caps, { marginTop: 18, marginBottom: 8 }]}>Who sees it</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <StatusChip on={audience === "public"} label="Public" onPress={() => setAudience("public")} />
                  <StatusChip on={audience === "friends"} label="Friends" onPress={() => setAudience("friends")} />
                </View>
                <Text style={[t.caps, { marginTop: 18, marginBottom: 8 }]}>Reshare</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  <StatusChip on={!reshareable} label="Keep it here" onPress={() => setReshareable(false)} />
                  <StatusChip on={reshareable} label="Others can reshare" onPress={() => setReshareable(true)} />
                </View>
              </>
            ) : null}
            <Text style={[t.caps, { marginTop: 18, marginBottom: 8 }]}>Lasts</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {STATUS_TTLS.map((item) => (
                <StatusChip key={item.id} on={ttl === item.id} label={item.label} onPress={() => setTtl(item.id)} />
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
              <Text style={[t.caps, { flex: 1 }]}>Still</Text>
              <Pressable
                onPress={async () => {
                  try {
                    const ImagePicker = await import("expo-image-picker");
                    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (!perm.granted) return;
                    const result = await ImagePicker.launchImageLibraryAsync({
                      mediaTypes: ["images"],
                      quality: 0.72,
                      base64: true,
                    });
                    const asset = result.assets?.[0];
                    if (result.canceled || !asset) return;
                    if (asset.base64) setImage(`data:image/jpeg;base64,${asset.base64}`);
                    else if (asset.uri) setImage(asset.uri);
                  } catch {
                    /* Expo Go without the module — prestills still work */
                  }
                }}
              >
                <Text style={[t.meta, { color: c.ink, marginRight: 12 }]}>From gallery</Text>
              </Pressable>
              {image ? (
                <Pressable onPress={() => setImage(undefined)}>
                  <Text style={[t.meta, { color: c.inkSoft }]}>Clear still</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {STILLS.map((src) => {
                const srcImg = pic(src);
                return (
                  <Pressable key={src} onPress={() => setImage(src)} style={{ flex: 1 }}>
                    {srcImg ? (
                      <Image
                        source={srcImg}
                        style={{
                          width: "100%",
                          aspectRatio: 1,
                          borderRadius: 10,
                          borderWidth: image === src ? 2 : 0,
                          borderColor: c.ink,
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          aspectRatio: 1,
                          borderRadius: 10,
                          backgroundColor: c.paperDeep,
                          borderWidth: image === src ? 2 : 0,
                          borderColor: c.ink,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
            {!vybe && mine.length ? (
              <>
                <Text style={[t.caps, { marginTop: 18, marginBottom: 8 }]}>A vybe</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {mine.map((p) => {
                    const srcImg = pic(p.image);
                    const on = postId === p.id;
                    return (
                      <Pressable key={p.id} onPress={() => setPostId(on ? undefined : p.id)}>
                        {srcImg ? (
                          <Image
                            source={srcImg}
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 10,
                              borderWidth: on ? 2 : 0,
                              borderColor: c.ink,
                            }}
                          />
                        ) : (
                          <View
                            style={{
                              width: 64,
                              height: 64,
                              borderRadius: 10,
                              backgroundColor: c.paperDeep,
                              borderWidth: on ? 2 : 0,
                              borderColor: c.ink,
                            }}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </>
            ) : null}
            <Pressable
              onPress={() => {
                if (!ready) return;
                addStatus({
                  text: text.trim() || undefined,
                  image: image || (postId ? mine.find((p) => p.id === postId)?.image : undefined),
                  mood,
                  ttl,
                  lane,
                  audience: vybe ? audience : undefined,
                  reshareable: vybe ? reshareable : undefined,
                  resharedFrom: draft?.resharedFrom,
                  resharedFromAuthorId: draft?.resharedFromAuthorId,
                });
                onClose();
              }}
              style={{ marginTop: 22, opacity: ready ? 1 : 0.35 }}
            >
              <Card depth={2} radius={16} style={{ height: 48, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", letterSpacing: 2, color: c.ink }}>PUT IT UP</Text>
              </Card>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Paper>
    </Modal>
  );
}
