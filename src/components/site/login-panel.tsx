"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  friendlyAuthError,
  phoneAuthEnabled,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/auth";
import { useStore } from "@/lib/store";

type Mode = "in" | "up";

const DEMO_PHONE = "9876543210";
const DEMO_OTP = "123456";

/** Luxury auth card — demo number works without SMS in this environment. */
export function LoginPanel() {
  const { login } = useStore();
  const [mode, setMode] = useState<Mode>("in");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneReady, setPhoneReady] = useState<boolean | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    let alive = true;
    phoneAuthEnabled()
      .then((on) => {
        if (alive) setPhoneReady(on);
      })
      .catch(() => {
        if (alive) setPhoneReady(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  const isDemo = phone.replace(/\D/g, "") === DEMO_PHONE;

  async function sendCode() {
    setError("");
    if (mode === "up") {
      const handle = name.trim();
      if (handle.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
        setError("Use letters, numbers, dots, or underscores.");
        return;
      }
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      if (isDemo) {
        setStep("otp");
        return;
      }
      const on = await phoneAuthEnabled();
      setPhoneReady(on);
      await sendPhoneOtp(phone, mode === "up");
      setStep("otp");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(code = otp.join("")) {
    if (code.length < 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isDemo && code === DEMO_OTP) {
        login({
          username: mode === "up" ? name.trim() || "niji" : "niji",
          phone: DEMO_PHONE,
          nijiId: "nijiuserid",
        });
        return;
      }
      if (isDemo && code !== DEMO_OTP) {
        setError("That code did not match. Demo code is 123456.");
        return;
      }
      const profile = await verifyPhoneOtp(phone, code, mode === "up" ? name.trim() : undefined);
      login(profile);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  function onOtp(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    setError("");
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (d && i === 5 && next.every(Boolean)) void verify(next.join(""));
  }

  return (
    <div className="w-full rounded-[28px] bg-[rgba(247,247,248,0.92)] p-7 shadow-[0_32px_90px_rgba(23,23,26,0.14)] ring-1 ring-black/[0.06] backdrop-blur-xl md:p-8">
      <div className="flex flex-col items-center text-center">
        <p className="font-serif text-[28px] tracking-tight text-[#17171A]">Niji</p>
        <p className="mt-1 text-[12px] tracking-[0.2em] text-[#8A8A90] uppercase">
          {mode === "in" ? "Secure sign-in" : "Create account"}
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-[#EBEBEC] p-1">
        <button
          type="button"
          onClick={() => {
            setMode("in");
            setStep("phone");
            setError("");
          }}
          className={`rounded-full py-2 text-[11px] tracking-[0.14em] uppercase transition ${
            mode === "in" ? "bg-[#17171A] text-[#F7F7F8]" : "text-[#65656B]"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("up");
            setStep("phone");
            setError("");
          }}
          className={`rounded-full py-2 text-[11px] tracking-[0.14em] uppercase transition ${
            mode === "up" ? "bg-[#17171A] text-[#F7F7F8]" : "text-[#65656B]"
          }`}
        >
          Register
        </button>
      </div>

      {step === "phone" ? (
        <div className="mt-6 space-y-4">
          {mode === "up" ? (
            <label className="block">
              <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8A8A90] uppercase">
                Username
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s/g, "").slice(0, 20))}
                placeholder="choose a handle"
                autoCapitalize="none"
                autoCorrect="off"
                className="h-12 w-full rounded-2xl bg-[#EBEBEC] px-4 text-[15px] text-[#17171A] outline-none ring-1 ring-black/[0.04] placeholder:text-[#BFBEC3]"
              />
            </label>
          ) : null}
          <label className="block">
            <span className="mb-2 block text-[10px] tracking-[0.16em] text-[#8A8A90] uppercase">
              Mobile number
            </span>
            <div className="flex h-12 items-center rounded-2xl bg-[#EBEBEC] px-4 ring-1 ring-black/[0.04]">
              <span className="mr-3 text-[15px] text-[#8A8A90]">+91</span>
              <input
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number"
                className="h-10 w-full bg-transparent text-[15px] text-[#17171A] outline-none placeholder:text-[#BFBEC3]"
              />
            </div>
          </label>
          <p className="text-[12px] leading-5 text-[#8A8A90]">
            Demo desk: use <span className="text-[#65656B]">9876543210</span>, then code{" "}
            <span className="text-[#65656B]">123456</span>.
          </p>
          {phoneReady === false && !isDemo ? (
            <p className="text-[12px] leading-5 text-[#8A8A90]">
              Phone OTP is unavailable here — use the demo number above.
            </p>
          ) : null}
          {error ? <p className="text-[13px] text-[#B42318]">{error}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void sendCode()}
            className="mt-2 w-full rounded-full bg-[#17171A] py-3.5 text-[12px] font-medium tracking-[0.16em] text-[#F7F7F8] uppercase disabled:opacity-60"
          >
            {busy ? "Sending…" : "Continue"}
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-center text-[13px] text-[#65656B]">
            Enter the 6-digit code sent to +91 {phone}
          </p>
          {isDemo ? (
            <p className="mt-2 text-center text-[12px] text-[#8A8A90]">Demo code: 123456</p>
          ) : null}
          <div className="mt-5 flex justify-center gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                inputMode="numeric"
                value={d}
                onChange={(e) => onOtp(i, e.target.value)}
                className="size-11 rounded-xl bg-[#EBEBEC] text-center font-mono text-[18px] text-[#17171A] outline-none ring-1 ring-black/[0.04]"
              />
            ))}
          </div>
          {error ? <p className="mt-3 text-center text-[13px] text-[#B42318]">{error}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={() => void verify()}
            className="mt-6 w-full rounded-full bg-[#17171A] py-3.5 text-[12px] font-medium tracking-[0.16em] text-[#F7F7F8] uppercase disabled:opacity-60"
          >
            {busy ? "Verifying…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setOtp(["", "", "", "", "", ""]);
              setError("");
            }}
            className="mt-3 w-full py-2 text-[11px] tracking-[0.14em] text-[#8A8A90] uppercase"
          >
            Back
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-[11px] leading-5 text-[#9B9AA0]">
        By continuing you access the sealed Niji client.{" "}
        <Link href="/" className="text-[#65656B] underline-offset-2 hover:underline">
          Return to site
        </Link>
      </p>
    </div>
  );
}
