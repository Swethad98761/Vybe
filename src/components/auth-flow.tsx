"use client";

import { useEffect, useRef, useState } from "react";
import {
  friendlyAuthError,
  phoneAuthEnabled,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/lib/auth";
import { useStore } from "@/lib/store";

type Mode = "up" | "in";
type Step = "phone" | "otp";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[10px] tracking-caps text-neutral-400 uppercase">
        {label}
      </span>
      <span className="flex h-12 items-center rounded-2xl bg-[#e1e1e3] px-4 shadow-[inset_0_1px_0_rgba(23,23,26,0.08),0_1px_0_rgba(255,255,255,0.85)]">
        {children}
      </span>
    </label>
  );
}

export function AuthFlow() {
  const { login } = useStore();
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phoneReady, setPhoneReady] = useState<boolean | null>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [kbPad, setKbPad] = useState(0);

  useEffect(() => {
    if (step === "otp") otpRefs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => {
      setKbPad(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    };
    on();
    vv.addEventListener("resize", on);
    vv.addEventListener("scroll", on);
    return () => {
      vv.removeEventListener("resize", on);
      vv.removeEventListener("scroll", on);
    };
  }, []);

  function liftField(el: HTMLElement | null) {
    window.setTimeout(() => {
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  }

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

  function popBranches() {
    if (opened) return;
    setOpened(true);
  }

  function choose(next: Mode) {
    if (!opened) return;
    setMode(next);
    setStep("phone");
    setError("");
    setOtp(["", "", "", "", "", ""]);
  }

  function restGate() {
    setMode(null);
    setStep("phone");
    setError("");
  }

  async function sendCode(nextPhone = phone) {
    setError("");
    if (mode === "up") {
      const handle = name.trim();
      if (handle.length < 3) {
        setError("Choose a username of at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
        setError("Use letters, numbers, dots or underscores.");
        return;
      }
    }
    if (nextPhone.replace(/\D/g, "").length < 10) {
      setError("Enter a 10-digit mobile number.");
      return;
    }
    setBusy(true);
    try {
      const on = await phoneAuthEnabled();
      setPhoneReady(on);
      await sendPhoneOtp(nextPhone, mode === "up");
      setStep("otp");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function verify(code = otp.join("")) {
    if (code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    try {
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
    if (d && i === 5 && next.every(Boolean)) {
      void verify(next.join(""));
    }
  }

  return (
    <div className="bg-paper relative min-h-dvh overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/niji-gate.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      {mode ? (
        <button type="button" aria-label="Close" className="absolute inset-0 z-10" onClick={restGate} />
      ) : null}

      <button
        type="button"
        aria-label="Touch to enter Niji"
        onClick={() => (mode ? restGate() : popBranches())}
        className="absolute top-[51%] left-1/2 z-20 size-[31vw] max-h-[210px] max-w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />

      <button
        type="button"
        onClick={() => choose("up")}
        aria-label="Sign up"
        className={`gate-node gate-node-left gate-node-saffron ${opened ? "is-open" : ""} ${mode === "up" ? "is-hot" : ""} ${mode === "in" ? "is-ghost" : ""}`}
      >
        <span className="gate-node-halo" />
        <span className="gate-node-disc">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="10" cy="8.2" r="3.2" stroke="#17171A" strokeWidth="1.5" />
            <path
              d="M4.6 18.6c.7-3 2.9-4.6 5.4-4.6s4.7 1.6 5.4 4.6"
              stroke="#17171A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="M18.2 7.4v6.2M15.1 10.5h6.2" stroke="#17171A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      </button>

      <button
        type="button"
        onClick={() => choose("in")}
        aria-label="Login"
        className={`gate-node gate-node-right gate-node-green ${opened ? "is-open" : ""} ${mode === "in" ? "is-hot" : ""} ${mode === "up" ? "is-ghost" : ""}`}
      >
        <span className="gate-node-halo" />
        <span className="gate-node-disc">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M10 7.2V5.7A1.7 1.7 0 0 1 11.7 4h6.6A1.7 1.7 0 0 1 20 5.7v12.6a1.7 1.7 0 0 1-1.7 1.7h-6.6A1.7 1.7 0 0 1 10 18.3v-1.5"
              stroke="#17171A"
              strokeWidth="1.5"
            />
            <path
              d="M4 12h10.2M11.2 8.6 14.8 12l-3.6 3.4"
              stroke="#17171A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div
        className={`gate-sheet ${mode ? "is-up" : ""}`}
        style={
          kbPad > 0 && mode
            ? {
                top: 12,
                bottom: kbPad + 8,
                maxHeight: `calc(100dvh - ${kbPad + 20}px)`,
              }
            : undefined
        }
      >
        <div className="overflow-y-auto rounded-[28px] bg-[#f7f7f8] px-6 pt-5 pb-5 shadow-[0_16px_30px_rgba(25,25,34,0.14)]">
          <div className="mb-4 text-center">
            <span className="mx-auto mb-2 block size-2 rotate-45 bg-neutral-400" />
            <p className="text-[10px] tracking-caps text-neutral-500 uppercase">
              {mode === "up" ? "Create your account" : "Welcome back"}
            </p>
          </div>

          {step === "phone" ? (
            <>
              {mode === "up" ? (
                <Field label="Username">
                  <input
                    ref={nameRef}
                    value={name}
                    onFocus={() => liftField(nameRef.current)}
                    onChange={(e) => setName(e.target.value.replace(/\s/g, "").slice(0, 20))}
                    placeholder="create a username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="h-10 w-full bg-transparent text-[16px] outline-none placeholder:text-neutral-300"
                  />
                </Field>
              ) : (
                <div className="h-[72px]" />
              )}
              <Field label="Phone number">
                <span className="mr-3 text-[16px] text-neutral-500">+91</span>
                <input
                  ref={phoneRef}
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onFocus={() => liftField(phoneRef.current)}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(digits);
                    if (digits.length === 10) {
                      phoneRef.current?.blur();
                      if (mode === "in") void sendCode(digits);
                    }
                  }}
                  placeholder="Mobile number"
                  className="h-10 w-full bg-transparent text-[16px] outline-none placeholder:text-neutral-300"
                />
              </Field>
              <p className={`text-[13px] ${error ? "text-red-500" : "text-neutral-500"}`}>
                {error ||
                  (phoneReady === false
                    ? "Phone sign-in is still off in Supabase. Enable Phone under Authentication → Providers."
                    : "We'll text a one-time code. Your keys stay on this phone.")}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] tracking-caps text-neutral-400 uppercase">One-time code</p>
              <p className="mt-2 text-[15px] text-neutral-500">
                Sent to +91 {phone.replace(/\D/g, "").replace(/(\d{5})(\d{5})/, "$1 $2")}
              </p>
              <div className="mt-5 flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onOtp(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }}
                    className="h-12 w-10 border-b border-neutral-200 bg-transparent text-center text-xl outline-none focus:border-neutral-900"
                  />
                ))}
              </div>
              {error ? <p className="mt-4 text-[13px] text-red-500">{error}</p> : null}
              <div className="mt-4 flex items-center justify-between">
                <button type="button" onClick={() => setStep("phone")} className="text-[13px] text-neutral-400">
                  Wrong number?
                </button>
                <button
                  type="button"
                  onClick={() => void sendCode()}
                  disabled={busy}
                  className="text-[13px] text-neutral-400"
                >
                  Send again
                </button>
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => (step === "phone" ? void sendCode() : void verify())}
            disabled={busy}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-white text-[13px] font-semibold tracking-[0.16em] text-neutral-800 uppercase shadow-[0_8px_18px_rgba(25,25,34,0.1)]"
          >
            {busy ? (
              <span className="size-5 animate-spin-dashed rounded-full border border-dashed border-neutral-400" />
            ) : step === "phone" ? (
              mode === "up" ? (
                "Create account"
              ) : (
                "Continue"
              )
            ) : (
              "Enter Niji"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
