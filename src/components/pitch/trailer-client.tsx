"use client";

import { Component, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CinematicTrailer } from "@/components/pitch/trailer";

class TrailerGate extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { err: error.message || "The cut stalled." };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#111] px-6 text-center text-[#F7F7F8]">
          <p className="font-serif text-[28px] italic">Own Your Vibe.</p>
          <p className="mt-3 text-[13px] text-white/60">{this.state.err}</p>
          <a href="/trailer" className="mt-6 text-[11px] tracking-[0.16em] uppercase text-white/80">
            Reload trailer
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

export function TrailerClient() {
  const router = useRouter();
  return (
    <TrailerGate>
      <CinematicTrailer onDone={() => router.push("/pitch")} />
    </TrailerGate>
  );
}
