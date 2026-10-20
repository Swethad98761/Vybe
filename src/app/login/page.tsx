"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginPanel } from "@/components/site/login-panel";
import { useStore } from "@/lib/store";

function LoginBody() {
  const { authed, ready, logout } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const fresh = params.get("fresh") === "1";
  const cleared = useRef(false);

  useEffect(() => {
    if (!ready || !fresh || cleared.current) return;
    cleared.current = true;
    logout();
    router.replace("/login");
  }, [ready, fresh, logout, router]);

  useEffect(() => {
    if (!ready) return;
    if (fresh || (cleared.current && params.get("fresh") === "1")) return;
    if (authed) router.replace("/app");
  }, [ready, authed, fresh, params, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#EBEBEC] text-[#17171A]">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/blades-mark.png"
            alt=""
            className="h-7 w-7 object-contain"
          />
          <span className="font-serif text-[20px] tracking-tight">Niji</span>
        </Link>
        <Link
          href="/"
          className="text-[11px] tracking-[0.14em] text-[#8A8A90] uppercase hover:text-[#17171A]"
        >
          Site
        </Link>
      </div>

      {/* True 50/50: brand lockup left, login right */}
      <div className="grid min-h-dvh md:grid-cols-2">
        <div className="relative hidden min-h-dvh overflow-hidden md:block">
          {/* Full-bleed lockup fills the left half; contain keeps blades + gems intact */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/niji-wordmark.jpg"
            alt="Niji Namaskaram mark with tricolor"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(235,235,236,0.15) 0%, transparent 28%, transparent 62%, rgba(235,235,236,0.72) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 z-[1] px-10 pb-10">
            <p className="font-serif text-[32px] leading-[1.05] text-[#17171A] lg:text-[36px]">
              Own Your Vibe.
            </p>
            <p className="mt-3 max-w-sm text-[14px] leading-6 text-[#65656B]">
              Sign in with your mobile number to enter the sealed client.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-dvh items-center justify-center border-l border-black/[0.04] bg-[#F2F2F3] px-5 py-24 md:px-10 lg:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 md:hidden"
            style={{
              backgroundImage: "url(/brand/niji-mark.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.14,
              mixBlendMode: "multiply",
            }}
          />
          <div className="relative z-10 w-full max-w-[400px]">
            <LoginPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#EBEBEC] text-[13px] text-[#8A8A90]">
          Loading…
        </div>
      }
    >
      <LoginBody />
    </Suspense>
  );
}
