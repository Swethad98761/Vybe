import type { Metadata } from "next";
import { OpenNijiProfile } from "@/components/screens/open-niji-profile";
import { cleanNijiId } from "@/lib/niji-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ nijiId: string }>;
}): Promise<Metadata> {
  const { nijiId } = await params;
  const id = cleanNijiId(nijiId);
  return {
    title: `${id} · Niji`,
    description: `Open ${id} on Niji.`,
    openGraph: {
      title: id,
      description: "Open this Niji.",
      images: [{ url: "/brand/niji-story.jpg" }],
    },
  };
}

export default async function NijiIdPage({
  params,
}: {
  params: Promise<{ nijiId: string }>;
}) {
  const { nijiId } = await params;
  return <OpenNijiProfile nijiId={cleanNijiId(nijiId)} />;
}
