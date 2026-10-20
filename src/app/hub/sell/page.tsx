"use client";

import { Suspense } from "react";
import { SellScreen } from "@/components/screens/hub-screen";

export default function SellPage() {
  return (
    <Suspense fallback={<div className="flex-1 bg-paper" />}>
      <SellScreen />
    </Suspense>
  );
}
