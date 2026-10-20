import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Niji — Trailer",
  description: "Own Your Vibe. A cinematic launch cut from the Niji UI.",
};

export default function TrailerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
