import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconEnter, IconSpark, IconUserPlus } from "@/components/icons";
import { Card, Groove } from "@/components/surface";
import { useStage } from "@/lib/frame";
import { brand } from "@/lib/media";
import {
  friendlyAuthError,
  phoneAuthEnabled,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/auth";
import { useStore } from "@/lib/store";
import { c, type as t } from "@/theme";

const ART_RATIO = 768 / 1376;

type Mode = "up" | "in";
type Step = "phone" | "otp";

function layout(width: number, height: number) {
  const cx = width / 2;
  const cy = height * 0.51;
  const orb = Math.min(width, height) * 0.155;
  const nodeR = 22;
  // Level with the mark, 9 and 3 — same reach, no labels to throw the pair.
  const reach = orb + nodeR + 36;
  return {
    cx,
    cy,
    orb,
    nodeR,
    nodeY: cy,
    leftX: cx - reach,
    rightX: cx + reach,
    markFloor: cy + orb + 28,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={[t.caps, { marginBottom: 6 }]}>{label}</Text>
      <Groove style={{ paddingHorizontal: 16, height: 44, justifyContent: "center" }}>{children}</Groove>
    </View>
  );
}

const neon = {
  white: { glow: "rgba(255,255,255,0.95)", ring: "rgba(255,255,255,0.98)" },
  saffron: { glow: "rgba(255,153,51,0.95)", ring: "#FFB056" },
  green: { glow: "rgba(61,255,122,0.9)", ring: "#4DFF88" },
} as const;

/** Color stays off until the node is chosen — then a fine neon hairline. */
function NeonRing({
  size,
  lit,
  tone,
}: {
  size: number;
  lit: Animated.Value;
  tone: keyof typeof neon;
}) {
  const bloom = lit.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const ring = lit.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const ink = neon[tone] ?? neon.white;
  return (
    <View
      style={{
        position: "absolute",
        width: size + 22,
        height: size + 22,
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size + 18,
          height: size + 18,
          borderRadius: (size + 18) / 2,
          backgroundColor: ink.glow,
          opacity: bloom,
          ...Platform.select({
            default: { filter: "blur(7px)" },
            ios: {},
            android: {},
          }),
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: size + 6,
          height: size + 6,
          borderRadius: (size + 6) / 2,
          borderWidth: 1.6,
          borderColor: ink.ring,
          opacity: ring,
        }}
      />
    </View>
  );
}

function OptionNode({
  x,
  y,
  r,
  name,
  glow,
  live,
  opened,
  ready,
  tone,
  onPress,
  children,
}: {
  x: number;
  y: number;
  r: number;
  name: string;
  glow: Animated.Value;
  live: Animated.Value;
  opened: Animated.Value;
  ready: boolean;
  tone: keyof typeof neon;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const opacity = opened.interpolate({ inputRange: [0.28, 1], outputRange: [0, 1], extrapolate: "clamp" });
  const scale = opened.interpolate({ inputRange: [0.28, 1], outputRange: [0.72, 1], extrapolate: "clamp" });
  const faded = live.interpolate({ inputRange: [0, 1], outputRange: [0.38, 1] });
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        opacity,
        transform: [{ scale }],
        pointerEvents: ready ? "auto" : "none",
        zIndex: 30,
      }}
    >
      <Pressable accessibilityLabel={name} onPress={onPress} style={{ width: r * 2, height: r * 2 }}>
        <Animated.View style={{ opacity: faded, width: r * 2, height: r * 2, alignItems: "center", justifyContent: "center" }}>
          <NeonRing size={r * 2} lit={glow} tone={tone} />
          <View
            style={{
              width: r * 2,
              height: r * 2,
              borderRadius: r,
              backgroundColor: c.card,
              alignItems: "center",
              justifyContent: "center",
              borderTopWidth: 1,
              borderTopColor: c.lit,
              ...Platform.select({
                ios: {
                  shadowColor: "#191922",
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 3 },
                },
                android: { elevation: 2 },
                default: { boxShadow: "0 3px 8px rgba(25,25,34,0.1)" },
              }),
            }}
          >
            {children}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function AuthFlow() {
  const { login } = useStore();
  const insets = useSafeAreaInsets();
  const { width, height } = useStage();
  const geo = useMemo(() => layout(width, height), [width, height]);

  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneReady, setPhoneReady] = useState<boolean | null>(null);
  const codeRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const [kb, setKb] = useState(0);

  const openAnim = useRef(new Animated.Value(0)).current;
  const signupLive = useRef(new Animated.Value(1)).current;
  const loginLive = useRef(new Animated.Value(1)).current;
  const signupGlow = useRef(new Animated.Value(0)).current;
  const loginGlow = useRef(new Animated.Value(0)).current;
  const sheet = useRef(new Animated.Value(0)).current;

  const artWidth = Math.max(width, height * ART_RATIO);
  const artHeight = Math.max(height, artWidth / ART_RATIO);

  useEffect(() => {
    if (step === "otp") setTimeout(() => codeRef.current?.focus(), 220);
  }, [step]);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      setKb(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => {
      setKb(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    let alive = true;
    phoneAuthEnabled()
      .then((on) => {
        if (alive) setPhoneReady(on);
      })
      .catch(() => {
        if (alive) setPhoneReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  function popBranches() {
    if (opened) return;
    setOpened(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Animated.spring(openAnim, { toValue: 1, friction: 7, tension: 64, useNativeDriver: false }).start();
  }

  function choose(next: Mode) {
    if (!opened) return;
    setMode(next);
    setStep("phone");
    setError("");
    setCode("");
    Haptics.selectionAsync().catch(() => {});
    Animated.parallel([
      Animated.timing(signupLive, {
        toValue: next === "up" ? 1 : 0,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(loginLive, {
        toValue: next === "in" ? 1 : 0,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(signupGlow, {
        toValue: next === "up" ? 1 : 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(loginGlow, {
        toValue: next === "in" ? 1 : 0,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(sheet, { toValue: 1, friction: 8, tension: 58, useNativeDriver: Platform.OS !== "web" }),
    ]).start();
  }

  function restGate() {
    setMode(null);
    setStep("phone");
    setError("");
    Animated.parallel([
      Animated.timing(signupLive, { toValue: 1, duration: 360, useNativeDriver: false }),
      Animated.timing(loginLive, { toValue: 1, duration: 360, useNativeDriver: false }),
      Animated.timing(signupGlow, { toValue: 0, duration: 320, useNativeDriver: false }),
      Animated.timing(loginGlow, { toValue: 0, duration: 320, useNativeDriver: false }),
      Animated.timing(sheet, {
        toValue: 0,
        duration: 360,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start();
  }

  async function sendCode(nextPhone = phone) {
    setError("");
    if (mode === "up") {
      const handle = name.trim();
      if (handle.length < 3) {
        setError("Choose a username of at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
        setError("Use letters, numbers, dots or underscores.");
        return;
      }
    }
    if (nextPhone.replace(/\D/g, "").length < 10) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      const on = await phoneAuthEnabled();
      setPhoneReady(on);
      await sendPhoneOtp(nextPhone, mode === "up");
      setStep("otp");
      Haptics.selectionAsync().catch(() => {});
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(value = code) {
    if (value.replace(/\D/g, "").length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const profile = await verifyPhoneOtp(phone, value, mode === "up" ? name.trim() : undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      login(profile);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const bottomPad = Math.max(insets.bottom, 12) + 8;
  const sheetH = Math.max(248, height - geo.markFloor - bottomPad);
  const raisedTop =
    kb > 0 ? Math.max(insets.top + 10, height - kb - Math.min(sheetH, mode === "up" ? 420 : 340)) : geo.markFloor;
  const raisedH = kb > 0 ? Math.max(220, height - raisedTop - kb - 8) : sheetH;
  const sheetY = sheet.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetH + 40, 0],
  });

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <Image
        source={brand.gate}
        style={{
          position: "absolute",
          top: (height - artHeight) / 2,
          left: (width - artWidth) / 2,
          width: artWidth,
          height: artHeight,
        }}
        resizeMode="cover"
      />

      {mode ? (
        <Pressable
          accessibilityLabel="Close"
          onPress={restGate}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: 5 }}
        />
      ) : null}

      <Pressable
        accessibilityLabel="Enter Niji"
        onPress={() => {
          if (mode) restGate();
          else popBranches();
        }}
        style={{
          position: "absolute",
          left: geo.cx - geo.orb,
          top: geo.cy - geo.orb,
          width: geo.orb * 2,
          height: geo.orb * 2,
          borderRadius: geo.orb,
          zIndex: 30,
        }}
      />

      <OptionNode
        x={geo.leftX}
        y={geo.nodeY}
        r={geo.nodeR}
        name="Sign up"
        glow={signupGlow}
        live={signupLive}
        opened={openAnim}
        ready={opened}
        tone="saffron"
        onPress={() => choose("up")}
      >
        <IconUserPlus size={16} color={c.ink} />
      </OptionNode>

      <OptionNode
        x={geo.rightX}
        y={geo.nodeY}
        r={geo.nodeR}
        name="Login"
        glow={loginGlow}
        live={loginLive}
        opened={openAnim}
        ready={opened}
        tone="green"
        onPress={() => choose("in")}
      >
        <IconEnter size={16} color={c.ink} />
      </OptionNode>

      <Animated.View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: raisedTop,
          height: raisedH,
          transform: [{ translateY: sheetY }],
          pointerEvents: mode ? "auto" : "none",
          zIndex: 20,
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <Card
            depth={3}
            radius={28}
            style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14, justifyContent: "space-between" }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 4 }}
            >
            <View style={{ alignItems: "center", marginBottom: 10 }}>
              <IconSpark size={14} color={c.inkFaint} />
              <Text style={[t.caps, { marginTop: 6, color: c.inkSoft }]}>
                {mode === "up" ? "Create your account" : "Welcome back"}
              </Text>
            </View>

            {step === "phone" ? (
              <>
                {mode === "up" ? (
                  <Field label="Username">
                    <TextInput
                      value={name}
                      onChangeText={(v) => setName(v.replace(/\s/g, "").slice(0, 20))}
                      placeholder="create a username"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor={c.inkGhost}
                      style={{ fontSize: 16, color: c.ink }}
                    />
                  </Field>
                ) : (
                  <View style={{ height: 72 }} />
                )}
                <Field label="Phone number">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Text style={{ fontSize: 16, color: c.inkSoft }}>+91</Text>
                    <TextInput
                      ref={phoneRef}
                      value={phone}
                      onChangeText={(v) => {
                        const digits = v.replace(/\D/g, "").slice(0, 10);
                        setPhone(digits);
                        if (digits.length === 10) {
                          Keyboard.dismiss();
                          phoneRef.current?.blur();
                          if (mode === "in") void sendCode(digits);
                        }
                      }}
                      placeholder="Mobile number"
                      placeholderTextColor={c.inkGhost}
                      keyboardType="number-pad"
                      style={{ flex: 1, fontSize: 16, color: c.ink }}
                    />
                  </View>
                </Field>
                <Text style={[t.soft, error ? { color: c.danger } : null]}>
                  {error ||
                    (phoneReady === false
                      ? "Phone sign-in is still off in Supabase. Enable Phone under Authentication → Providers."
                      : "We'll text a one-time code. Your keys stay on this phone.")}
                </Text>
              </>
            ) : (
              <>
                <Text style={t.caps}>One-time code</Text>
                <Text style={[t.body, { marginTop: 6, color: c.inkSoft }]}>
                  Sent to +91 {phone.replace(/\D/g, "").replace(/(\d{5})(\d{5})/, "$1 $2")}
                </Text>
                <Pressable onPress={() => codeRef.current?.focus()} style={{ marginTop: 18 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    {Array.from({ length: 6 }, (_, i) => (
                      <Groove
                        key={i}
                        style={{
                          flex: 1,
                          height: 52,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 22, color: c.ink }}>{code[i] ? "•" : ""}</Text>
                      </Groove>
                    ))}
                  </View>
                  <TextInput
                    ref={codeRef}
                    value={code}
                    onChangeText={(v) => {
                      const digits = v.replace(/\D/g, "").slice(0, 6);
                      setCode(digits);
                      setError("");
                      if (digits.length === 6) {
                        Keyboard.dismiss();
                        verify(digits);
                      }
                    }}
                    keyboardType="number-pad"
                    caretHidden
                    style={{
                      position: "absolute",
                      opacity: 0,
                      height: 52,
                      width: "100%",
                    }}
                  />
                </Pressable>
                {error ? (
                  <Text style={[t.soft, { marginTop: 12, color: c.danger }]}>{error}</Text>
                ) : null}
                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Pressable onPress={() => setStep("phone")}>
                    <Text style={[t.soft, { color: c.inkFaint }]}>Wrong number?</Text>
                  </Pressable>
                  <Pressable onPress={() => void sendCode()} disabled={busy}>
                    <Text style={[t.soft, { color: c.inkFaint }]}>Send again</Text>
                  </Pressable>
                </View>
              </>
            )}

            </ScrollView>
            <Pressable
              onPress={() => (step === "phone" ? sendCode() : verify())}
              disabled={busy}
              style={{ marginTop: 12 }}
            >
              <Card depth={2} radius={28} style={{ height: 52, alignItems: "center", justifyContent: "center" }}>
                {busy ? (
                  <ActivityIndicator color={c.inkSoft} />
                ) : (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: c.ink, letterSpacing: 1.2 }}>
                    {step === "phone" ? (mode === "up" ? "CREATE ACCOUNT" : "CONTINUE") : "ENTER NIJI"}
                  </Text>
                )}
              </Card>
            </Pressable>
          </Card>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}
