import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { ChatProfile } from "@/components/chat-profile";
import { IconBack, IconCalls, IconMic, IconSend, IconVideo } from "@/components/icons";
import { liveLeft, mapsHref } from "@/lib/place";
import * as Linking from "expo-linking";
import { Card, Groove, Paper } from "@/components/surface";
import { VybePostDetail, VybeProfile } from "@/components/vybe-profile";
import { clockTime, formatDuration } from "@/lib/format";
import { pic } from "@/lib/media";
import { mistFace } from "@/lib/ghost";
import { usePaperCapture } from "@/components/paper-capture";
import { captureNoticeLine, copyableText, paperAllowsCopy, paperGuardsCapture } from "@/lib/paper-guard";
import { isAround, isMeChat, threadPeerId } from "@/lib/presence";
import { SealGate } from "@/components/seal-gate";
import { sealUnlocked, unlockSeal } from "@/lib/seal";
import { useStore } from "@/lib/store";
import type { Post } from "@/lib/types";
import { c, type as t } from "@/theme";

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    state,
    userById,
    me,
    sendMessage,
    sendVoice,
    sendLocation,
    messageSeller,
    sendOrder,
    payStall,
    markRead,
    setDisappear,
    setThread,
    clearPaper,
    startCall,
    leaveGroup,
    noticeCapture,
  } = useStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [openVybe, setOpenVybe] = useState<string | null>(null);
  const [vybeProfile, setVybeProfile] = useState(false);
  const list = useRef<FlatList>(null);
  const recAt = useRef<number | null>(null);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [kbOpen, setKbOpen] = useState(false);
  const [opened, setOpened] = useState(() => !id || sealUnlocked(id));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const convo = state.conversations.find((x) => x.id === id);
  const unread = convo?.unread ?? 0;
  const convoId = convo?.id;
  const guards = convo ? paperGuardsCapture(convo) : false;
  const canCopy = convo ? paperAllowsCopy(convo) : false;
  const onCapture = useCallback(
    (kind: "screenshot" | "record") => {
      if (convoId) noticeCapture(convoId, kind);
    },
    [noticeCapture, convoId],
  );
  usePaperCapture(Boolean(convoId && guards && opened), onCapture);

  useEffect(() => {
    if (!id) return;
    if (convo?.sealed && !sealUnlocked(id) && !opened) return;
    markRead(id);
  }, [id, unread, markRead, convo?.sealed, opened]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () =>
      setKbOpen(true),
    );
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () =>
      setKbOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  function beginVoice() {
    recAt.current = Date.now();
    setRecording(true);
    setRecSec(0);
    recTimer.current = setInterval(() => setRecSec((s) => s + 1), 1000);
  }

  function endVoice() {
    if (recTimer.current) clearInterval(recTimer.current);
    setRecording(false);
    if (!convo || !recAt.current) return;
    const durationSec = Math.max(1, Math.round((Date.now() - recAt.current) / 1000));
    recAt.current = null;
    sendVoice(convo.id, undefined, durationSec);
  }

  async function copyMsg(messageId: string, line: string) {
    if (!canCopy || !line) return;
    await Clipboard.setStringAsync(line);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId((cur) => (cur === messageId ? null : cur)), 1400);
  }

  if (!convo) {
    return (
      <Paper>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 30 }}>
          <Text style={t.body}>This chat is gone.</Text>
          <Pressable onPress={() => router.replace("/chat")} style={{ marginTop: 12 }}>
            <Text style={[t.soft, { color: c.ink, fontWeight: "600" }]}>Back to Chat</Text>
          </Pressable>
        </View>
      </Paper>
    );
  }

  if (convo.sealed && !opened && !sealUnlocked(convo.id)) {
    return (
      <SealGate
        mode="open"
        hash={convo.sealPin ?? state.sealPin}
        onClose={() => router.replace("/chat")}
        onUnlock={() => {
          unlockSeal(convo.id);
          setOpened(true);
        }}
      />
    );
  }

  const notes = isMeChat(convo, me.id);
  const peerId = threadPeerId(convo, me.id);
  const peer = userById(peerId);
  const alias = state.ghostAliases.find((a) => a.id === convo.ghostAliasId);
  const title = convo.ghost
    ? alias
      ? mistFace(alias.token)
      : peer?.nijiId || peer?.name || "Mist"
    : notes
      ? "Me"
      : convo.name ?? peer?.name ?? "Chat";
  const around = isAround(peer, me.id, state.hideOnline, state.ghostMode);

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
          backgroundColor: c.card,
          borderBottomWidth: 1,
          borderBottomColor: c.line,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={{ padding: 2 }}>
          <IconBack size={24} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (convo.lane === "vybe") {
              setVybeProfile(true);
              return;
            }
            setProfileOpen(true);
          }}
          accessibilityLabel={title}
        >
          {convo.isGroup ? (
            <Avatar mark={convo.emoji ?? "👥"} size={36} />
          ) : (
            <Avatar user={peer} size={36} place="chat" around={around} vybeOn={state.vybeEnabled} />
          )}
        </Pressable>
        <Pressable
          onPress={() => {
            if (convo.lane === "vybe") setVybeProfile(true);
            else setProfileOpen(true);
          }}
          style={{ flex: 1 }}
          accessibilityLabel={`Open ${title} profile`}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }} numberOfLines={1}>
            {title}
          </Text>
          <Text style={t.meta}>
            {convo.lane === "hub"
              ? "Stall"
              : convo.isGroup
                ? `${convo.participantIds.length} people`
                : notes
                  ? "Pocket"
                  : around
                    ? "Active now"
                    : " "}
          </Text>
        </Pressable>
        {peer && !notes && !convo.isGroup && convo.lane !== "vybe" && convo.lane !== "hub" ? (
          <>
            <Pressable
              hitSlop={10}
              style={{ padding: 6 }}
              onPress={() => startCall(peer.id, "voice", convo.id)}
              accessibilityLabel="Voice"
            >
              <IconCalls size={20} color={c.inkSoft} />
            </Pressable>
            <Pressable
              hitSlop={10}
              style={{ padding: 6 }}
              onPress={() => startCall(peer.id, "video", convo.id)}
              accessibilityLabel="Video"
            >
              <IconVideo size={20} color={c.inkSoft} />
            </Pressable>
          </>
        ) : null}
      </View>

      {profileOpen ? (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 }}>
          <ChatProfile
            title={title}
            peer={convo.isGroup ? undefined : peer}
            isGroup={convo.isGroup}
            emoji={convo.emoji}
            meId={me.id}
            members={convo.participantIds
              .map((pid) => userById(pid))
              .filter((u): u is NonNullable<typeof u> => Boolean(u))}
            convo={convo}
            onChange={(mode) => setDisappear(convo.id, mode)}
            onThread={(patch) => setThread(convo.id, patch)}
            onClear={(part) => clearPaper(convo.id, part)}
            onClose={() => setProfileOpen(false)}
            onSharePlace={(point) => sendLocation(convo.id, point)}
            onLeave={
              convo.isGroup
                ? () => {
                    leaveGroup(convo.id);
                    router.replace("/chat");
                  }
                : undefined
            }
          />
        </View>
      ) : null}

      {vybeProfile && peer ? (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 24 }}>
          <VybeProfile userId={peer.id} onClose={() => setVybeProfile(false)} />
        </View>
      ) : null}
      {openVybe ? (
        <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 26 }}>
          <VybePostDetail postId={openVybe} onClose={() => setOpenVybe(null)} />
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={list}
          data={convo.messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: m }) => {
            if (m.kind === "notice") {
              return (
                <Text style={[t.meta, { textAlign: "center", marginVertical: 14 }]}>
                  {captureNoticeLine({
                    mine: m.senderId === me.id,
                    name: userById(m.senderId)?.name,
                    kind: m.notice,
                  })}
                </Text>
              );
            }
            if (m.kind === "call") {
              return (
                <Text style={[t.meta, { textAlign: "center", marginVertical: 14 }]}>
                  {m.text}
                  {m.call?.durationSec ? ` · ${formatDuration(m.call.durationSec)}` : ""}
                </Text>
              );
            }
            const mine = m.senderId === me.id;
            if (m.kind === "shop") {
              const shop = state.shops.find((s) => s.id === m.shopId);
              const cover = pic(m.image || shop?.cover);
              return (
                <View
                  key={m.id}
                  style={{
                    flexDirection: "row",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    marginBottom: 9,
                  }}
                >
                  <Pressable
                    onPress={() => router.push(shop ? `/hub/${shop.id}` : "/hub")}
                    style={{
                      maxWidth: "80%",
                      backgroundColor: c.card,
                      borderRadius: 18,
                      overflow: "hidden",
                    }}
                  >
                    {cover ? (
                      <Image source={cover} style={{ width: 220, height: 110 }} resizeMode="cover" />
                    ) : null}
                    <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                      <Text style={t.meta}>Hub</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink }}>{shop?.name || m.text}</Text>
                      <Text style={[t.soft, { marginTop: 2 }]}>
                        {shop ? `${shop.area || shop.city} · ${shop.rating} ★` : "Open this stall"}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            }
            if (m.kind === "vybe") {
              const post = state.posts.find((p) => p.id === m.postId);
              return (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    marginBottom: 9,
                  }}
                >
                  <VybeShareCard
                    post={post}
                    fallbackText={m.text}
                    fallbackImage={m.image}
                    onOpen={() => {
                      if (post) setOpenVybe(post.id);
                    }}
                  />
                </View>
              );
            }
            const still = pic(m.image);
            const line = copyableText(m);
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  marginBottom: 9,
                }}
              >
                <Pressable
                  onLongPress={() => copyMsg(m.id, line)}
                  delayLongPress={420}
                  style={{ maxWidth: "80%" }}
                >
                  <Card
                    depth={1}
                    radius={17}
                    style={{
                      paddingHorizontal: 13,
                      paddingVertical: 9,
                      backgroundColor: mine ? c.ink : c.card,
                      borderTopColor: mine ? "rgba(255,255,255,0.14)" : c.lit,
                      borderBottomRightRadius: mine ? 5 : 17,
                      borderBottomLeftRadius: mine ? 17 : 5,
                    }}
                  >
                    {m.kind === "product" || m.kind === "order" ? (
                      <Text style={{ fontSize: 10, letterSpacing: 1.4, marginBottom: 4, color: mine ? "rgba(255,255,255,0.6)" : c.inkFaint }}>
                        HUB
                      </Text>
                    ) : null}
                    {still ? (
                      <Image source={still} style={{ width: 220, height: 140, borderRadius: 10, marginBottom: 8 }} resizeMode="cover" />
                    ) : null}
                    {m.kind === "location" && m.lat != null && m.lng != null ? (
                      <Pressable onPress={() => Linking.openURL(mapsHref(m.lat!, m.lng!))}>
                        <Text style={{ fontSize: 15, fontWeight: "600", color: mine ? "#F6F5F2" : c.ink }}>
                          {m.liveUntil && liveLeft(m.liveUntil) ? "Live place" : "Place"}
                        </Text>
                        <Text
                          selectable={canCopy}
                          style={{ fontSize: 12, marginTop: 3, color: mine ? "rgba(255,255,255,0.65)" : c.inkSoft }}
                        >
                          {m.text}
                          {m.liveUntil && liveLeft(m.liveUntil) ? ` · ${liveLeft(m.liveUntil)}` : ""}
                        </Text>
                      </Pressable>
                    ) : m.kind === "voice" ? (
                      <Text style={{ fontSize: 15, color: mine ? "#F6F5F2" : c.ink }}>
                        Voice · {formatDuration(m.durationSec ?? 1)}
                      </Text>
                    ) : m.file ? (
                      <Text selectable={canCopy} style={{ fontSize: 15, color: mine ? "#F6F5F2" : c.ink }}>
                        {m.file.name}  {m.file.size}
                      </Text>
                    ) : (
                      <Text
                        selectable={canCopy}
                        style={{ fontSize: 15, lineHeight: 21, color: mine ? "#F6F5F2" : c.ink }}
                      >
                        {m.text}
                      </Text>
                    )}
                    <Text style={{ fontSize: 10, marginTop: 5, color: mine ? "rgba(255,255,255,0.5)" : c.inkGhost }}>
                      {copiedId === m.id ? "Copied" : clockTime(m.createdAt)}
                    </Text>
                  </Card>
                </Pressable>
              </View>
            );
          }}
        />

        {convo.lane === "hub" && convo.shopId ? (
          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingTop: 8 }}>
            <Pressable
              onPress={() => {
                const product = state.products.find((p) => p.shopId === convo.shopId);
                if (product) messageSeller(product);
                else sendMessage(convo.id, "Is this stall open?");
              }}
              style={{ backgroundColor: c.paperDeep, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 12, color: c.ink }}>Enquire</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const cid = sendOrder(convo.shopId!);
                if (!cid) sendMessage(convo.id, "I'd like to place an order.");
              }}
              style={{ backgroundColor: c.paperDeep, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 12, color: c.ink }}>Order</Text>
            </Pressable>
            <Pressable
              onPress={() => payStall(convo.id)}
              style={{ backgroundColor: c.paperDeep, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
            >
              <Text style={{ fontSize: 12, color: c.ink }}>Pay</Text>
            </Pressable>
          </View>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
            paddingHorizontal: 14,
            paddingTop: 10,
            paddingBottom: kbOpen ? 10 : insets.bottom + 10,
            backgroundColor: c.card,
            borderTopWidth: 1,
            borderTopColor: c.line,
          }}
        >
          <Groove style={{ flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={recording ? `Recording ${formatDuration(recSec)}` : "Message"}
              placeholderTextColor={c.inkGhost}
              multiline
              returnKeyType="send"
              blurOnSubmit
              submitBehavior="submit"
              editable={!recording}
              onSubmitEditing={() => {
                if (!text.trim() || recording) return;
                sendMessage(convo.id, text.trim());
                setText("");
              }}
              style={{ fontSize: 15, color: c.ink, maxHeight: 96 }}
            />
          </Groove>
          {text.trim() ? (
            <Pressable
              onPress={() => {
                sendMessage(convo.id, text.trim());
                setText("");
              }}
            >
              <Card depth={2} radius={22} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <IconSend size={19} color={c.ink} />
              </Card>
            </Pressable>
          ) : (
            <Pressable onPressIn={beginVoice} onPressOut={endVoice} accessibilityLabel="Record voice">
              <Card
                depth={2}
                radius={22}
                style={{
                  width: 44,
                  height: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: recording ? c.ink : c.card,
                }}
              >
                <IconMic size={19} color={recording ? c.card : c.ink} />
              </Card>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Paper>
  );
}

function VybeShareCard({
  post,
  fallbackText,
  fallbackImage,
  onOpen,
}: {
  post?: Post;
  fallbackText: string;
  fallbackImage?: string;
  onOpen: () => void;
}) {
  const { userById } = useStore();
  const author = post ? userById(post.authorId) : undefined;
  const image = pic(post?.image ?? fallbackImage);
  const caption = post?.text ?? fallbackText;
  return (
    <Pressable
      onPress={onOpen}
      disabled={!post}
      style={{
        width: "72%",
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: c.card,
        borderTopColor: c.lit,
        borderTopWidth: 1,
      }}
    >
      {image ? (
        <Image source={image} style={{ width: "100%", aspectRatio: 4 / 5 }} resizeMode="cover" />
      ) : (
        <View style={{ minHeight: 108, justifyContent: "flex-end", paddingHorizontal: 14, paddingVertical: 12 }}>
          <Text numberOfLines={3} style={{ color: c.ink, fontSize: 15 }}>
            {caption || "This vybe faded."}
          </Text>
        </View>
      )}
      <View style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink }} numberOfLines={1}>
          {author?.name ?? "Vybe"}
        </Text>
        {image ? (
          <Text style={[t.soft, { marginTop: 2 }]} numberOfLines={2}>
            {caption}
          </Text>
        ) : null}
        <Text style={[t.caps, { marginTop: 8 }]}>{post ? "Vybe" : "This vybe faded"}</Text>
      </View>
    </Pressable>
  );
}
