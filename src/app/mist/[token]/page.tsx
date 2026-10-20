import type { Metadata } from "next";
import { OpenMist } from "@/components/screens/open-niji-link";
import { cleanMistToken } from "@/lib/niji-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const id = cleanMistToken(token);
  return {
    title: `${id} · Mist · Niji`,
    description: `Open this mist name on Niji.`,
  };
}

export default async function MistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <OpenMist token={cleanMistToken(token)} />;
}
