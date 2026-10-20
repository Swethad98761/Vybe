"use client";

import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { CinematicIntro } from "@/components/cinematic-intro";
import { AuthFlow } from "@/components/auth-flow";
import { AppFrame } from "@/components/app-frame";
import { AppLockHost } from "@/components/app-lock";

export function NijiRoot({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { ready, state, authed, welcomeDone } = useStore();

  if (
    path === "/" ||
    path?.startsWith("/pitch") ||
    path?.startsWith("/trailer") ||
    path?.startsWith("/invest") ||
    path?.startsWith("/login")
  ) {
    return <>{children}</>;
  }

  // Web desk: StageApp owns the chrome (icon rail + full canvas).
  // Never wrap /app in AppFrame's 480px phone preview.
  if (path === "/app" || path?.startsWith("/app/")) {
    if (!ready) {
      return <div className="bg-paper min-h-dvh" />;
    }
    return (
      <>
        {children}
        {authed ? <AppLockHost /> : null}
      </>
    );
  }

  if (!ready) {
    return <div className="bg-paper min-h-dvh" />;
  }

  if (!state.seenWelcome && !authed) {
    return <CinematicIntro onDone={welcomeDone} />;
  }

  if (!authed) {
    return <AuthFlow />;
  }

  return (
    <>
      <AppFrame>{children}</AppFrame>
      <AppLockHost />
    </>
  );
}
