import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconBack, IconLeaf, IconPath, IconPlace, IconQr, IconStill } from "@/components/icons";
import { Card, Hairline, Paper } from "@/components/surface";
import { NijiPaper } from "@/components/niji-paper";
import { mistFace } from "@/lib/ghost";
import {
  nijiChatShareText,
  nijiChatUri,
  nijiHubShareText,
  nijiHubUri,
  nijiMistShareText,
  nijiMistUri,
} from "@/lib/niji-link";
import { paperGuardsCapture } from "@/lib/paper-guard";
import { nijiIdOf, paperOf } from "@/lib/presence";
import { useStore } from "@/lib/store";
import { readPlace, type PlacePoint } from "@/lib/place";
import { pic } from "@/lib/media";
import { VANISH } from "@/lib/vanish";
import type { Conversation, Disappear, PaperPart, User } from "@/lib/types";
import { c, type as t } from "@/theme";

export function ChatProfile({
  title,
  peer,
  isGroup,
  emoji,
  members,
  meId,
  convo,
  onChange,
  onThread,
  onClear,
  onClose,
  onLeave,
  onSharePlace,
}: {
  title: string;
  peer?: User;
  isGroup?: boolean;
  emoji?: string;
  members?: User[];
  meId?: string;
  convo: Conversation;
  onChange: (mode: Disappear) => void;
  onThread: (patch: { quiet?: boolean; keepStills?: boolean; pinned?: boolean }) => void;
  onClear: (part?: PaperPart) => void;
  onClose: () => void;
  onLeave?: () => void;
  onSharePlace?: (point: PlacePoint & { liveMs?: number }) => void;
}) {
  const insets = useSafeAreaInsets();
  const count = members?.length ?? 0;
  const paper = paperOf(convo);
  const keepStills = convo.keepStills !== false;
  const [clearOpen, setClearOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [placeBusy, setPlaceBusy] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const { state } = useStore();
  const alias = state.ghostAliases.find((a) => a.id === convo.ghostAliasId);
  const qr =
    convo.ghost && alias
      ? {
          id: alias.token,
          name: mistFace(alias.token),
          uri: nijiMistUri(alias.token),
          shareText: nijiMistShareText(alias.token, mistFace(alias.token)),
        }
      : convo.shopId
        ? {
            id: state.users.find((u) => u.id === meId)?.nijiId ?? peer?.nijiId ?? title,
            name: title,
            uri: nijiHubUri(convo.shopId),
            shareText: nijiHubShareText(convo.shopId, title),
          }
        : peer && !isGroup
          ? {
              id: peer.nijiId,
              name: peer.name,
              uri: nijiChatUri(peer.nijiId),
              shareText: nijiChatShareText(peer.nijiId, peer.name),
            }
          : null;

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
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Back to chat">
          <IconBack size={24} />
        </Pressable>
        <Text style={[t.title, { fontSize: 18, flex: 1 }]}>Profile</Text>
        {qr ? (
          <Pressable onPress={() => setPaperOpen(true)} hitSlop={10} accessibilityLabel="Share Niji ID">
            <IconQr size={22} color={c.ink} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 28 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", paddingHorizontal: 22, paddingTop: 8 }}>
          {isGroup ? <Avatar mark={emoji ?? "👥"} size={88} /> : <Avatar user={peer} size={88} />}
          <Text style={{ marginTop: 14, fontSize: 22, fontWeight: "600", color: c.ink }}>{title}</Text>
          {peer && !isGroup ? (
            <>
              <Text style={[t.soft, { marginTop: 6 }]}>{nijiIdOf(peer)}</Text>
              {peer.bio ? <Text style={[t.soft, { marginTop: 12, textAlign: "center" }]}>{peer.bio}</Text> : null}
            </>
          ) : (
            <Text style={[t.soft, { marginTop: 6 }]}>
              {count} {count === 1 ? "person" : "people"}
            </Text>
          )}
        </View>

        {isGroup && members?.length ? (
          <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
            <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>Members</Text>
            <Card depth={1} radius={18}>
              {members.map((member, i) => (
                <View key={member.id}>
                  {i > 0 ? <Hairline /> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 }}>
                    <Avatar user={member} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={t.body} numberOfLines={1}>
                        {member.id === meId ? `${member.name} (you)` : member.name}
                      </Text>
                      <Text style={[t.meta, { marginTop: 2 }]}>{nijiIdOf(member)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {onSharePlace ? (
          <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
            <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>Place</Text>
            <Pressable onPress={() => setPlaceOpen(true)}>
              <Card depth={1} radius={18} style={{ paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <IconPlace size={22} color={c.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, color: c.ink }}>Share a place</Text>
                  <Text style={[t.meta, { marginTop: 3 }]}>Once, or live for a while</Text>
                </View>
              </Card>
            </Pressable>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
          <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>On this paper</Text>
          <Card depth={1} radius={18} style={{ paddingVertical: 14, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <IconStill size={16} color={c.inkSoft} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{paper.stills.length}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <IconPath size={16} color={c.inkSoft} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{paper.paths.length}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <IconLeaf size={16} color={c.inkSoft} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: c.ink }}>{paper.leaves.length}</Text>
            </View>
          </Card>
          {paper.stills.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {paper.stills.map((s) => {
                const src = pic(s.src);
                return src ? (
                  <Image key={s.id} source={src} style={{ width: 72, height: 72, borderRadius: 10 }} />
                ) : null;
              })}
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
          <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>How it fades</Text>
          <Card depth={1} radius={18}>
            {VANISH.map((m, i) => (
              <View key={m.id}>
                {i > 0 ? <Hairline /> : null}
                <Pressable onPress={() => onChange(m.id)} style={{ paddingHorizontal: 16, paddingVertical: 13 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={t.body}>{m.label}</Text>
                      <Text style={[t.meta, { marginTop: 3 }]}>{m.hint}</Text>
                    </View>
                    {convo.disappear === m.id ? <Text style={{ color: c.ink, fontSize: 16 }}>✓</Text> : null}
                  </View>
                </Pressable>
              </View>
            ))}
          </Card>
          {paperGuardsCapture(convo) ? (
            <Text style={[t.meta, { marginTop: 12, marginHorizontal: 4 }]}>
              This paper hides from a recording and blocks a screenshot where the phone allows. A capture that still lands tells the other side.
            </Text>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
          <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>On this phone</Text>
          <Card depth={1} radius={18}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 }}>
              <View style={{ flex: 1 }}>
                <Text style={t.body}>Pin</Text>
                <Text style={[t.meta, { marginTop: 3 }]}>Keep this chat at the top. Three pins at most.</Text>
              </View>
              <Switch
                value={Boolean(convo.pinned)}
                onValueChange={(v) => onThread({ pinned: v })}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            </View>
            <Hairline />
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 }}>
              <View style={{ flex: 1 }}>
                <Text style={t.body}>Keep stills</Text>
                <Text style={[t.meta, { marginTop: 3 }]}>Save incoming photos on this device</Text>
              </View>
              <Switch
                value={keepStills}
                onValueChange={(v) => onThread({ keepStills: v })}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            </View>
            <Hairline />
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13 }}>
              <View style={{ flex: 1 }}>
                <Text style={t.body}>Quiet</Text>
                <Text style={[t.meta, { marginTop: 3 }]}>Hide the unread mark for this thread</Text>
              </View>
              <Switch
                value={Boolean(convo.quiet)}
                onValueChange={(v) => onThread({ quiet: v })}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 18, marginTop: 28 }}>
          <Text style={[t.caps, { marginBottom: 9, marginLeft: 4 }]}>Edge</Text>
          <Pressable onPress={() => setClearOpen(true)}>
            <Card depth={1} radius={18} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 15, color: c.ink }}>Clear this paper</Text>
            </Card>
          </Pressable>
          {onLeave ? (
            <Pressable onPress={onLeave} style={{ marginTop: 12 }}>
              <Card depth={1} radius={18} style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 15, color: c.danger }}>Leave group</Text>
              </Card>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
      {placeOpen && onSharePlace ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setPlaceOpen(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={() => setPlaceOpen(false)} />
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
              <Text style={[t.caps, { textAlign: "center" }]}>Share a place</Text>
              <Text style={[t.meta, { textAlign: "center", marginTop: 6 }]}>
                Send where you are. Live fades on its own.
              </Text>
              {(
                [
                  [undefined, "Send once"],
                  [15 * 60_000, "Live · 15 minutes"],
                  [60 * 60_000, "Live · 1 hour"],
                ] as const
              ).map(([liveMs, label]) => (
                <Pressable
                  key={label}
                  disabled={placeBusy}
                  onPress={() => {
                    setPlaceBusy(true);
                    void readPlace().then((point) => {
                      onSharePlace({ ...point, liveMs });
                      setPlaceBusy(false);
                      setPlaceOpen(false);
                      onClose();
                    });
                  }}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 15, color: c.ink }}>{label}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setPlaceOpen(false)} style={{ paddingVertical: 8, alignItems: "center" }}>
                <Text style={[t.meta, { color: c.inkSoft }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
      {clearOpen ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setClearOpen(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end" }}>
            <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.28)" }} onPress={() => setClearOpen(false)} />
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
              <Text style={[t.caps, { textAlign: "center" }]}>Clear this paper</Text>
              <Text style={[t.meta, { textAlign: "center", marginTop: 6 }]}>
                Pick what fades. This stays on this phone.
              </Text>
              {(
                [
                  ["all", "Clear everything", "Stills, paths, leaves — the whole paper"],
                  ["stills", "Clear stills", "Photos on this paper"],
                  ["paths", "Clear paths", "Links on this paper"],
                  ["leaves", "Clear leaves", "Files on this paper"],
                ] as const
              ).map(([part, label, hint]) => (
                <Pressable
                  key={part}
                  onPress={() => {
                    onClear(part);
                    setClearOpen(false);
                  }}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ fontSize: 15, color: c.ink }}>{label}</Text>
                  <Text style={[t.meta, { marginTop: 3 }]}>{hint}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setClearOpen(false)} style={{ paddingVertical: 10, alignItems: "center" }}>
                <Text style={[t.meta, { color: c.inkSoft }]}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
      {paperOpen && qr ? (
        <Modal visible animationType="fade" onRequestClose={() => setPaperOpen(false)}>
          <NijiPaper
            nijiId={qr.id}
            name={qr.name}
            uri={qr.uri}
            shareText={qr.shareText}
            shareLabel="Share Niji ID"
            onClose={() => setPaperOpen(false)}
          />
        </Modal>
      ) : null}
    </Paper>
  );
}
