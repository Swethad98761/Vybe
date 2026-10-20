"use client";

import { use } from "react";
import { ChatThread } from "@/components/screens/chat-thread";

export default function ChatIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ChatThread id={id} />;
}
