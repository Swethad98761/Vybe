import { useState } from "react";
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { IconPen, IconQr } from "@/components/icons";
import { SealGate } from "@/components/seal-gate";
import { Card, Groove, Hairline, Paper } from "@/components/surface";
import { isAround, presenceOf } from "@/lib/presence";
import { NijiPaper } from "@/components/niji-paper";
import { useStore } from "@/lib/store";
import type { PresenceMode } from "@/lib/types";
import { c, type as t } from "@/theme";

const PRESENCE: { id: PresenceMode; label: string; hint: string }[] = [
  { id: "around", label: "Around", hint: "Ring on. People can see you here." },
  { id: "quiet", label: "Quiet", hint: "No ring. Still in chats." },
  { id: "ghost", label: "Ghost", hint: "No ring. Hide last seen and receipts." },
];

function Row({
  label,
  hint,
  right,
  soon,
}: {
  label: string;
  hint?: string;
  right?: React.ReactNode;
  soon?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={t.body}>{label}</Text>
        {hint ? <Text style={[t.meta, { marginTop: 3 }]}>{hint}</Text> : null}
      </View>
      {soon ? <Text style={[t.meta, { color: c.inkGhost }]}>Soon</Text> : right}
    </View>
  );
}

export default function YouScreen() {
  const { me, state, setPresence, setVybe, setHub, claimNijiId, logout, setSealPin, setAppLock } = useStore();
  const insets = useSafeAreaInsets();
  const mode = presenceOf(state);
  const [draftId, setDraftId] = useState(me.nijiId);
  const [idNote, setIdNote] = useState("");
  const [editingId, setEditingId] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [deskCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [sealGate, setSealGate] = useState<"set" | "change-open" | "change-set" | "lock-set" | null>(null);
  const [paper, setPaper] = useState(false);

  return (
    <Paper>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card depth={2} radius={18} style={{ padding: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar
              user={me}
              size={44}
              around={isAround(me, me.id, state.hideOnline, state.ghostMode)}
              vybeOn={state.vybeEnabled}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: c.ink }}>{me.name}</Text>
              <Text style={[t.meta, { marginTop: 2 }]}>
                {me.phone ? `${me.phone} · ` : ""}
                {state.following.length} following
              </Text>
            </View>
            <Pressable onPress={() => setPaper(true)} hitSlop={10} accessibilityLabel="Share Niji ID">
              <IconQr size={22} color={c.ink} />
            </Pressable>
          </View>
          <Hairline style={{ marginVertical: 12 }} />
          <Text style={t.caps}>Niji ID</Text>
          {editingId ? (
            <>
              <Groove
                style={{
                  marginTop: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 2,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <TextInput
                  value={draftId}
                  onChangeText={(v) => {
                    setDraftId(v.replace(/\s/g, "").slice(0, 24));
                    setIdNote("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  style={{ flex: 1, fontSize: 15, color: c.ink, letterSpacing: 0.6, paddingVertical: 8 }}
                />
                <Pressable
                  onPress={() => {
                    const result = claimNijiId(draftId);
                    if (result.ok) {
                      setDraftId(result.id);
                      setIdNote("Saved.");
                      setEditingId(false);
                    } else {
                      setIdNote(result.reason === "taken" ? "That ID is taken." : "Letters, numbers, dots or _ · 3–24.");
                    }
                  }}
                >
                  <Text style={{ fontSize: 13, color: c.ink }}>Save</Text>
                </Pressable>
              </Groove>
              <Pressable
                onPress={() => {
                  setDraftId(me.nijiId);
                  setEditingId(false);
                  setIdNote("");
                }}
                style={{ marginTop: 6 }}
              >
                <Text style={[t.meta, { color: c.inkSoft }]}>Cancel</Text>
              </Pressable>
            </>
          ) : (
            <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center" }}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: c.ink }}>{me.nijiId}</Text>
              <Pressable
                accessibilityLabel="Edit Niji ID"
                onPress={() => {
                  setDraftId(me.nijiId);
                  setEditingId(true);
                  setIdNote("");
                }}
                hitSlop={10}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: c.paperDeep,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconPen size={14} color={c.ink} />
              </Pressable>
            </View>
          )}
          <Text style={[t.meta, { marginTop: 6 }]}>
            {idNote || "Your public name. Tap the pen to change it if that ID is free."}
          </Text>
        </Card>

        <Text style={[t.caps, { marginTop: 26, marginBottom: 9, marginLeft: 4 }]}>Presence</Text>
        <Card depth={1} radius={18} style={{ padding: 12 }}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PRESENCE.map((p) => {
              const on = mode === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPresence(p.id)}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    paddingVertical: 10,
                    alignItems: "center",
                    backgroundColor: on ? c.ink : c.paperDeep,
                  }}
                >
                  <Text style={{ fontSize: 13, color: on ? c.card : c.inkSoft }}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[t.meta, { marginTop: 10, marginHorizontal: 4 }]}>
            {PRESENCE.find((p) => p.id === mode)?.hint}
          </Text>
        </Card>

        <Text style={[t.caps, { marginTop: 26, marginBottom: 9, marginLeft: 4 }]}>Tabs</Text>
        <Card depth={1} radius={18}>
          <Row
            label="Vybe tab"
            right={
              <Switch
                value={state.vybeEnabled}
                onValueChange={setVybe}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            }
          />
          <Hairline />
          <Row
            label="Hub tab"
            hint="Store and local shops. Off hides the tab."
            right={
              <Switch
                value={state.hubEnabled}
                onValueChange={setHub}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            }
          />
          <Hairline />
          <Row
            label="Lock this phone"
            hint="Face, thumb, or your seal code when Niji sleeps."
            right={
              <Switch
                value={Boolean(state.appLock)}
                onValueChange={(on) => {
                  if (on && !state.sealPin) {
                    setSealGate("lock-set");
                    return;
                  }
                  setAppLock(on);
                }}
                trackColor={{ true: c.ink, false: c.paperSunk }}
                thumbColor={c.card}
              />
            }
          />
        </Card>

        <Text style={[t.caps, { marginTop: 26, marginBottom: 9, marginLeft: 4 }]}>Seal</Text>
        <Card depth={1} radius={18}>
          <Pressable onPress={() => setSealGate(state.sealPin ? "change-open" : "set")}>
            <Row
              label="Seal code"
              hint="Your usual code. A chat can still take its own."
              right={<Text style={[t.meta, { color: c.inkSoft }]}>{state.sealPin ? "Change" : "Set"}</Text>}
            />
          </Pressable>
        </Card>

        <Text style={[t.caps, { marginTop: 26, marginBottom: 9, marginLeft: 4 }]}>This phone</Text>
        <Card depth={1} radius={18}>
          <Pressable onPress={() => setDeskOpen(true)}>
            <Row label="Link a computer" hint="Pair a desktop later. The code is ready now." />
          </Pressable>
        </Card>

        <Text style={[t.caps, { marginTop: 26, marginBottom: 9, marginLeft: 4 }]}>Features</Text>
        <Card depth={1} radius={18}>
          <Row label="Homies" hint="5 people see your closest vybes" />
        </Card>

        <Pressable onPress={logout} style={{ marginTop: 28, alignItems: "center" }}>
          <Text style={[t.body, { color: c.inkSoft }]}>Sign out</Text>
        </Pressable>

      </ScrollView>
      {deskOpen ? (
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
          <Pressable style={{ flex: 1 }} onPress={() => setDeskOpen(false)} />
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
            <Text style={[t.caps, { textAlign: "center" }]}>Link a computer</Text>
            <Text style={[t.meta, { textAlign: "center", marginTop: 8 }]}>
              This phone stays the home. A computer can type this code later — pairing ships in a later slice.
            </Text>
            <Text
              style={{
                marginTop: 22,
                textAlign: "center",
                fontSize: 28,
                letterSpacing: 8,
                color: c.ink,
                fontWeight: "600",
              }}
            >
              {deskCode}
            </Text>
            <Pressable
              onPress={() => setDeskOpen(false)}
              style={{
                marginTop: 20,
                backgroundColor: c.ink,
                borderRadius: 16,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: c.card, fontSize: 14, fontWeight: "600" }}>Done</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
      {paper ? (
        <Modal visible animationType="fade" onRequestClose={() => setPaper(false)}>
          <NijiPaper nijiId={me.nijiId} name={me.name} onClose={() => setPaper(false)} />
        </Modal>
      ) : null}
      {sealGate ? (
        <Modal visible animationType="fade" onRequestClose={() => setSealGate(null)}>
          <SealGate
            key={sealGate}
            kind={sealGate === "lock-set" ? "app" : "chat"}
            mode={sealGate === "change-open" ? "open" : "set"}
            hash={state.sealPin}
            onClose={() => setSealGate(null)}
            onSet={(pin) => {
              setSealPin(pin);
              if (sealGate === "lock-set") setAppLock(true);
              setSealGate(null);
            }}
            onUnlock={() => {
              if (sealGate === "change-open") setSealGate("change-set");
            }}
          />
        </Modal>
      ) : null}
    </Paper>
  );
}
