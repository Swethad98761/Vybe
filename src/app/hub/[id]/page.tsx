"use client";

import { use } from "react";
import { ShopDetail } from "@/components/screens/hub-screen";

export default function ShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ShopDetail id={id} />;
}
