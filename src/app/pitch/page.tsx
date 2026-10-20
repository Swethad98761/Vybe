import { Suspense } from "react";
import type { Metadata } from "next";
import { PitchDeck } from "@/components/pitch/deck";

export const metadata: Metadata = {
  title: "Niji — Investor pitch",
  description: "Own Your Vibe. Sealed messaging, time-bound media, trusted local commerce.",
};

export default function PitchPage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-dvh" />}>
      <PitchDeck />
    </Suspense>
  );
}
