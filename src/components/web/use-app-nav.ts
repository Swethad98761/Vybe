"use client";

import { useRouter } from "next/navigation";
import { useWebNav } from "@/components/web/web-nav";

/** Routes inside the web app stay in-shell; otherwise use phone routes. */
export function useAppNav() {
  const web = useWebNav();
  const router = useRouter();

  return {
    inWebApp: Boolean(web),
    toChatList: () => {
      if (web) web.closeChat();
      else router.push("/chat");
    },
    toChat: (id: string) => {
      if (web) web.openChat(id);
      else router.push(`/chat/${id}`);
    },
    toChatNew: () => {
      if (web) web.openChatNew();
      else router.push("/chat/new");
    },
    toChatNewGroup: () => {
      if (web) web.openChatNewGroup();
      else router.push("/chat/new-group");
    },
    toHub: () => {
      if (web) web.closeHub();
      else router.push("/hub");
    },
    toHubShop: (id: string) => {
      if (web) web.openHubShop(id);
      else router.push(`/hub/${id}`);
    },
    toHubSell: (shopId = "new") => {
      if (web) web.openHubSell(shopId);
      else router.push(`/hub/sell?shop=${shopId}`);
    },
    toCalls: () => {
      if (web) web.openCalls();
      else router.push("/calls");
    },
    toCallsNew: () => {
      if (web) web.openCallsNew();
      else router.push("/calls/new");
    },
  };
}
