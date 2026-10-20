"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasChatUnread } from "@/lib/presence";
import { useStore } from "@/lib/store";
import {
  IconAccount,
  IconCalls,
  IconChat,
  IconHub,
  IconVybe,
} from "@/components/niji/icons";
import { CallScreen } from "@/components/call-screen";
import { IncomingDemo } from "@/components/incoming-demo";

const tabs = [
  { href: "/calls", label: "Calls", icon: IconCalls, key: "calls" as const },
  { href: "/chat", label: "Chat", icon: IconChat, key: "chat" as const },
  { href: "/app", label: "Vybe", icon: IconVybe, key: "vybe" as const },
  { href: "/hub", label: "Hub", icon: IconHub, key: "hub" as const },
  { href: "/you", label: "You", icon: IconAccount, key: "you" as const },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state } = useStore();
  const chatUnread = hasChatUnread(state.conversations);
  const isThread = /^\/chat\/[^/]+$/.test(pathname);
  const hideTabs =
    isThread ||
    pathname === "/calls/new" ||
    pathname.startsWith("/id/") ||
    Boolean(state.call);
  const visibleTabs = tabs.filter(
    (t) => (t.key !== "vybe" || state.vybeEnabled) && (t.key !== "hub" || state.hubEnabled),
  );

  return (
    <div className="h-dvh bg-paper">
      <div className="mx-auto flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-paper">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-[env(safe-area-inset-top)]">
          {children}
        </div>
        {!hideTabs ? (
          <nav
            className="relative grid bg-paper"
            style={{
              gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)`,
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            {visibleTabs.map((tab) => {
              const active =
                tab.href === "/app"
                  ? pathname === "/app" || pathname.startsWith("/vybe")
                  : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 py-2.5 text-[9px] tracking-caps uppercase",
                    active ? "text-neutral-900" : "text-neutral-400",
                  )}
                >
                  <span className="relative">
                    <Icon className="size-6" />
                    {tab.key === "chat" && chatUnread ? (
                      <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#FF9933]" />
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </nav>
        ) : null}
      </div>
      <IncomingDemo />
      {state.call ? <CallScreen /> : null}
    </div>
  );
}
