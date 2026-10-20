import type { Metadata } from "next";
import { OpenChatWith } from "@/components/screens/open-niji-link";
import { cleanNijiId } from "@/lib/niji-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nijiId: string }>;
}): Promise<Metadata> {
  const { nijiId } = await params;
  const id = cleanNijiId(nijiId);
  return {
    title: `Chat · ${id} · Niji`,
    description: `Open a chat with ${id} on Niji.`,
  };
}

export default async function ChatWithPage({
  params,
}: {
  params: Promise<{ nijiId: string }>;
}) {
  const { nijiId } = await params;
  return <OpenChatWith nijiId={cleanNijiId(nijiId)} />;
}
