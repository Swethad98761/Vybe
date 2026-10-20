"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ChatPane =
  | { kind: "list" }
  | { kind: "thread"; id: string }
  | { kind: "new" }
  | { kind: "new-group" };

export type HubPane =
  | { kind: "list" }
  | { kind: "shop"; id: string }
  | { kind: "sell"; shopId: string };

export type CallsPane = { kind: "list" } | { kind: "new" };

type WebNavValue = {
  chat: ChatPane;
  hub: HubPane;
  calls: CallsPane;
  openChat: (id: string) => void;
  closeChat: () => void;
  openChatNew: () => void;
  openChatNewGroup: () => void;
  openHubShop: (id: string) => void;
  openHubSell: (shopId?: string) => void;
  closeHub: () => void;
  openCalls: () => void;
  openCallsNew: () => void;
};

const WebNavContext = createContext<WebNavValue | null>(null);

export function WebNavProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState<ChatPane>({ kind: "list" });
  const [hub, setHub] = useState<HubPane>({ kind: "list" });
  const [calls, setCalls] = useState<CallsPane>({ kind: "list" });

  const openChat = useCallback((id: string) => setChat({ kind: "thread", id }), []);
  const closeChat = useCallback(() => setChat({ kind: "list" }), []);
  const openChatNew = useCallback(() => setChat({ kind: "new" }), []);
  const openChatNewGroup = useCallback(() => setChat({ kind: "new-group" }), []);
  const openHubShop = useCallback((id: string) => setHub({ kind: "shop", id }), []);
  const openHubSell = useCallback((shopId = "new") => setHub({ kind: "sell", shopId }), []);
  const closeHub = useCallback(() => setHub({ kind: "list" }), []);
  const openCalls = useCallback(() => setCalls({ kind: "list" }), []);
  const openCallsNew = useCallback(() => setCalls({ kind: "new" }), []);

  const value = useMemo(
    () => ({
      chat,
      hub,
      calls,
      openChat,
      closeChat,
      openChatNew,
      openChatNewGroup,
      openHubShop,
      openHubSell,
      closeHub,
      openCalls,
      openCallsNew,
    }),
    [
      chat,
      hub,
      calls,
      openChat,
      closeChat,
      openChatNew,
      openChatNewGroup,
      openHubShop,
      openHubSell,
      closeHub,
      openCalls,
      openCallsNew,
    ],
  );

  return <WebNavContext.Provider value={value}>{children}</WebNavContext.Provider>;
}

/** Non-null only inside the desktop web app shell. */
export function useWebNav() {
  return useContext(WebNavContext);
}
