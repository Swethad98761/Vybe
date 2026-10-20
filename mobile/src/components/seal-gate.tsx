import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hashSealPin, pinMatches } from "@/lib/seal";
import { c, type as t } from "@/theme";

async function tryBiometric(prompt: string) {
  try {
    const LocalAuthentication = await import("expo-local-authentication");
    const has = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!has || !enrolled) return false;
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: "Use seal code",
      disableDeviceFallback: true,
    });
    return res.success;
  } catch {
    return false;
  }
}

export function SealGate({
  mode,
  hash,
  kind = "chat",
  onClose,
  onSet,
  onUnlock,
}: {
  mode: "set" | "open";
  hash?: string;
  kind?: "chat" | "app";
  onClose: () => void;
  onSet?: (pinHash: string) => void;
  onUnlock?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState("");
  const [first, setFirst] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [face, setFace] = useState(false);
  const confirming = mode === "set" && first !== null;
  const app = kind === "app";
  const bioPrompt = app ? "Open Niji" : "Open this paper";

  useEffect(() => {
    if (mode !== "open") return;
    let alive = true;
    void (async () => {
      const ok = await tryBiometric(bioPrompt);
      if (!alive) return;
      if (ok) onUnlock?.();
      else setFace(true);
    })();
    return () => {
      alive = false;
    };
    // Prompt Face / thumb once when the gate opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function submit(code: string) {
    if (mode === "set") {
      if (!first) {
        setFirst(code);
        setDigits("");
        setError("");
        return;
      }
      if (code !== first) {
        setError("Those didn't match. Once more.");
        setFirst(null);
        setDigits("");
        return;
      }
      onSet?.(hashSealPin(code));
      return;
    }
    if (!pinMatches(code, hash)) {
      setError("Not that code.");
      setDigits("");
      return;
    }
    onUnlock?.();
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top + 8 }}>
      <Pressable style={{ flex: 1 }} onPress={app && mode === "open" ? undefined : onClose}>
        <View style={{ alignItems: "center", paddingHorizontal: 28, paddingTop: 72 }} pointerEvents="box-none">
          <Text style={{ fontSize: 17, fontWeight: "600", color: c.ink }}>
            {mode === "open"
              ? app
                ? "This phone is locked"
                : "This paper is sealed"
              : confirming
                ? "Once more"
                : "A seal code"}
          </Text>
          <Text style={[t.soft, { textAlign: "center", marginTop: 8 }]}>
            {mode === "open"
              ? app
                ? "Face, thumb, or four digits."
                : "Face, thumb, or four digits. Tap the paper to leave."
              : confirming
                ? "Same four digits."
                : app
                  ? "Four digits. Face or thumb can open this phone after this."
                  : "Four digits. Face or thumb can open it after this."}
          </Text>
          <Pressable onPress={(e) => e.stopPropagation?.()}>
            <TextInput
              value={digits}
              onChangeText={(raw) => {
                const next = raw.replace(/\D/g, "").slice(0, 4);
                setDigits(next);
                if (next.length === 4) submit(next);
              }}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              autoFocus
              caretHidden
              style={{
                marginTop: 28,
                letterSpacing: 14,
                fontSize: 28,
                color: c.ink,
                textAlign: "center",
                minWidth: 160,
              }}
            />
          </Pressable>
          {error ? <Text style={[t.soft, { marginTop: 16 }]}>{error}</Text> : null}
          {mode === "open" && face ? (
            <Pressable
              onPress={() => {
                void tryBiometric(bioPrompt).then((ok) => {
                  if (ok) onUnlock?.();
                });
              }}
              style={{ marginTop: 22 }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink }}>Face or thumb</Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
