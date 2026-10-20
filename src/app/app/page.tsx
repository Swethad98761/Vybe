"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StageApp } from "@/components/web/stage-app";
import { useStore } from "@/lib/store";

export default function WebAppPage() {
  const { ready, authed } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authed) router.replace("/login");
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return <div className="bg-paper min-h-dvh" />;
  }

  return <StageApp />;
}
