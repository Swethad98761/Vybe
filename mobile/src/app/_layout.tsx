import "@/lib/crypto-polyfill";
import { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import { type Href, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthFlow } from "@/components/auth";
import { CallScreen } from "@/components/call-screen";
import { CinematicIntro } from "@/components/intro";
import { IncomingDemo } from "@/components/incoming-demo";
import { AppLockHost } from "@/components/app-lock";
import { STAGE_H, STAGE_W, useStage } from "@/lib/frame";
import { parseNijiLink } from "@/lib/niji-link";
import { StoreProvider, useStore } from "@/lib/store";
import { c } from "@/theme";

SplashScreen.preventAutoHideAsync();

function useOpenSharedNiji() {
  const router = useRouter();
  const { ready, authed } = useStore();
  const pending = useRef<string | null>(null);
  const readyRef = useRef(ready);
  const authedRef = useRef(authed);
  readyRef.current = ready;
  authedRef.current = authed;

  useEffect(() => {
    function hrefOf(url: string | null) {
      const link = parseNijiLink(url);
      if (!link) return null;
      if (link.kind === "profile") return `/id/${encodeURIComponent(link.id)}`;
      if (link.kind === "mist") return `/mist/${encodeURIComponent(link.token)}`;
      if (link.kind === "chat") return `/chat/with/${encodeURIComponent(link.id)}`;
      if (link.kind === "hub") return `/hub/${encodeURIComponent(link.id)}`;
      return null;
    }
    function open(path: string) {
      if (readyRef.current && authedRef.current) {
        router.push(path as Href);
        return;
      }
      pending.current = path;
    }
    function take(url: string | null) {
      const path = hrefOf(url);
      if (path) open(path);
    }
    Linking.getInitialURL().then(take).catch(() => {});
    const sub = Linking.addEventListener("url", (event) => take(event.url));
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!ready || !authed || !pending.current) return;
    const path = pending.current;
    pending.current = null;
    router.push(path as Href);
  }, [ready, authed, router]);
}

function Gate() {
  const { ready, state, authed, welcomeDone } = useStore();
  useOpenSharedNiji();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.paper }} />;

  if (!state.seenWelcome && !authed) {
    return <CinematicIntro onDone={welcomeDone} />;
  }
  if (!authed) {
    return <AuthFlow />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.paper },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
      <IncomingDemo />
      {state.call ? <CallScreen /> : null}
      <AppLockHost />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.paper).catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.paper }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <StoreProvider>
          <PhoneStage>
            <Gate />
          </PhoneStage>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function PhoneStage({ children }: { children: React.ReactNode }) {
  const { framed } = useStage();
  if (Platform.OS !== "web" || !framed) return <>{children}</>;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121214",
      }}
    >
      <View
        style={{
          width: STAGE_W,
          height: STAGE_H,
          overflow: "hidden",
          borderRadius: 36,
          backgroundColor: c.paper,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </View>
    </View>
  );
}
