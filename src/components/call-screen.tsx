"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Camera, CameraOff, Mic, MicOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDuration } from "@/lib/format";
import { IconCalls, IconFlip, IconPhoneHang, IconSpeaker } from "@/components/niji/icons";
import { useShellOverlay } from "@/components/web/shell-overlay";
import type { User } from "@/lib/types";

const padShadow = {
  borderTop: "1px solid rgba(255,255,255,0.92)",
  boxShadow: "0 8px 18px rgba(25,25,34,0.08)",
} as const;

function CallFace({ user, ringing }: { user: User; ringing?: boolean }) {
  return (
    <div className="relative">
      <div className="absolute inset-[-22px] animate-breathe rounded-full border border-[#17171A]/10" />
      {ringing ? (
        <div className="absolute inset-[-40px] animate-breathe rounded-full border border-[#17171A]/[0.06]" />
      ) : null}
      <div
        className="relative grid size-[168px] place-items-center rounded-full bg-[#F7F7F8]"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.96)",
          boxShadow: "0 14px 30px rgba(25,25,34,0.10)",
        }}
      >
        <div className="flex size-[132px] items-center justify-center overflow-hidden rounded-full bg-[#E1E1E3] text-4xl ring-1 ring-black/5">
          {user.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.photo} alt="" className="size-full object-cover" />
          ) : (
            <span>{user.emoji}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Pad({
  children,
  onClick,
  label,
  tone = "paper",
}: {
  children: ReactNode;
  onClick: () => void;
  label?: string;
  tone?: "paper" | "danger" | "ok";
}) {
  const fill =
    tone === "danger" ? "bg-[#D94040] text-white" : tone === "ok" ? "bg-[#2A8A50] text-white" : "bg-[#F7F7F8] text-[#17171A]";
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span
        className={`grid size-16 place-items-center rounded-full ${fill}`}
        style={
          tone === "paper"
            ? padShadow
            : {
                boxShadow:
                  tone === "danger"
                    ? "0 10px 18px rgba(217,64,64,0.28)"
                    : "0 10px 18px rgba(42,138,80,0.24)",
              }
        }
      >
        {children}
      </span>
      {label ? <span className="text-[12px] text-[#65656B]">{label}</span> : null}
    </button>
  );
}

export function CallScreen() {
  const { state, me, userById, patchCall, endCall, acceptCall, declineCall } = useStore();
  const call = state.call;
  const peer = call ? userById(call.peerId) : undefined;
  const [elapsed, setElapsed] = useState(0);
  const overlay = useShellOverlay("z-50 flex flex-col bg-paper text-[#17171A]");

  useEffect(() => {
    setElapsed(0);
  }, [call?.peerId, call?.status]);

  useEffect(() => {
    if (!call || call.status !== "connecting") return;
    const t = window.setTimeout(() => {
      patchCall({ status: "connected", startedAt: Date.now() });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [call, patchCall]);

  useEffect(() => {
    if (!call || call.status !== "connected") return;
    const started = call.startedAt ?? Date.now();
    const i = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    }, 1000);
    return () => window.clearInterval(i);
  }, [call]);

  if (!call || !peer) return null;

  const incoming = call.status === "incoming";
  const kind = call.mode === "video" ? "Video" : "Voice";
  const statusLabel = incoming
    ? "Incoming"
    : call.status === "connecting"
      ? "Connecting…"
      : formatDuration(elapsed);

  return (
    <div className={overlay}>
      <div className="flex items-center justify-between px-5 pt-6">
        <span className="text-[10px] tracking-caps text-[#9B9AA0] uppercase">{kind}</span>
        <span className="font-mono text-xs text-[#65656B]">
          {call.status === "connected" ? "" : statusLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {call.mode === "video" && !call.cameraOff && !incoming ? (
          <div className="relative w-full max-w-[300px] overflow-hidden rounded-[28px] bg-[#17171A]">
            <div className="relative aspect-[3/4]">
              {peer.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={peer.photo} alt="" className="absolute inset-0 size-full object-cover opacity-80" />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-5xl">{peer.emoji}</div>
              )}
              <div className="absolute right-3 bottom-3">
                <div
                  className="relative h-28 w-20 overflow-hidden rounded-2xl bg-[#2A2A2E] ring-1 ring-white/40"
                  style={{ transform: call.facingFront === false ? "scaleX(-1)" : undefined }}
                >
                  {me.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={me.photo} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xl">{me.emoji}</div>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Flip camera"
                  onClick={() => patchCall({ facingFront: call.facingFront === false })}
                  className="absolute -top-2 -left-2 grid size-9 place-items-center rounded-full bg-[#F7F7F8] text-[#17171A] shadow-[0_6px_14px_rgba(25,25,34,0.18)]"
                >
                  <IconFlip className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <CallFace user={peer} ringing={incoming || call.status === "connecting"} />
        )}
        <h2 className="mt-7 text-[26px] font-semibold tracking-tight">{peer.name}</h2>
        <p className="mt-1.5 text-[14px] text-[#65656B]">{kind} call</p>
        {call.status === "connected" ? (
          <p className="mt-2 font-mono text-[15px] text-[#9B9AA0]">{formatDuration(elapsed)}</p>
        ) : null}
      </div>
      {incoming ? (
        <div className="flex items-center justify-center gap-16 px-6 pb-14">
          <Pad tone="danger" label="Decline" onClick={() => declineCall()}>
            <IconPhoneHang className="size-6" />
          </Pad>
          <Pad tone="ok" label="Accept" onClick={() => acceptCall()}>
            <IconCalls className="size-6" />
          </Pad>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-5 px-6 pb-12">
          <Pad label={call.muted ? "Muted" : "Mute"} onClick={() => patchCall({ muted: !call.muted })}>
            {call.muted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
          </Pad>
          <Pad label={call.speaker ? "Speaker" : "Earpiece"} onClick={() => patchCall({ speaker: !call.speaker })}>
            <IconSpeaker className="size-5" />
          </Pad>
          {call.mode === "video" ? (
            <Pad label={call.cameraOff ? "Camera off" : "Camera"} onClick={() => patchCall({ cameraOff: !call.cameraOff })}>
              {call.cameraOff ? <CameraOff className="size-5" /> : <Camera className="size-5" />}
            </Pad>
          ) : null}
          <Pad tone="danger" label="End" onClick={() => endCall(elapsed)}>
            <IconPhoneHang className="size-5" />
          </Pad>
        </div>
      )}
    </div>
  );
}
