"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { NijiPaper } from "@/components/niji/niji-paper";
import { Person } from "@/components/niji/person";
import { IconPen, IconQr } from "@/components/niji/icons";
import { SealGate } from "@/components/screens/seal-gate";
import { isAround, presenceOf } from "@/lib/presence";
import { useShellOverlay } from "@/components/web/shell-overlay";
import type { PresenceMode } from "@/lib/types";

const PRESENCE: { id: PresenceMode; label: string; hint: string }[] = [
  { id: "around", label: "Around", hint: "Ring on. People can see you here." },
  { id: "quiet", label: "Quiet", hint: "No ring. Still in chats." },
  { id: "ghost", label: "Ghost", hint: "No ring. Hide last seen and receipts." },
];

export function AccountScreen() {
  const { me, state, setPresence, setVybe, setHub, claimNijiId, logout, setSealPin, setAppLock } = useStore();
  const mode = presenceOf(state);
  const [draftId, setDraftId] = useState(me.nijiId);
  const [idNote, setIdNote] = useState("");
  const [editingId, setEditingId] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [deskCode] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const [sealGate, setSealGate] = useState<"set" | "change-open" | "change-set" | "lock-set" | null>(null);
  const [paper, setPaper] = useState(false);
  const overlay = useShellOverlay("z-50");
  const overlayDim = useShellOverlay("z-50 bg-black/30");

  return (
    <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-5 pt-3 pb-4">
      <div className="flex items-center gap-3">
        <Person
          user={me}
          size="md"
          around={isAround(me, me.id, state.hideOnline, state.ghostMode)}
          vybeOn={state.vybeEnabled}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-medium">{me.name}</p>
          <p className="truncate text-[13px] text-neutral-400">{me.nijiId}</p>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            {mode === "around" ? "Around" : mode === "quiet" ? "Quiet" : "Ghost"}
            {me.phone ? ` · ${me.phone}` : ""}
          </p>
        </div>
        <button
          type="button"
          aria-label="Open QR"
          onClick={() => setPaper(true)}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EFEFF1] text-[#17171A]"
        >
          <IconQr className="size-4" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 px-4 py-3">
        <p className="text-[10px] tracking-caps uppercase text-neutral-400">Niji ID</p>
        {editingId ? (
          <>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={draftId}
                onChange={(e) => {
                  setDraftId(e.target.value.replace(/\s/g, "").slice(0, 24));
                  setIdNote("");
                }}
                autoCapitalize="none"
                autoCorrect="off"
                autoFocus
                className="h-10 flex-1 rounded-xl bg-[#EFEFF1] px-3 text-[15px] text-[#17171A] outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const result = claimNijiId(draftId);
                  if (result.ok) {
                    setDraftId(result.id);
                    setIdNote("Saved.");
                    setEditingId(false);
                  } else {
                    setIdNote(result.reason === "taken" ? "That ID is taken." : "Letters, numbers, dots or _ · 3–24.");
                  }
                }}
                className="h-10 rounded-xl bg-[#17171A] px-3 text-[13px] text-[#F7F7F8]"
              >
                Save
              </button>
            </div>
            <button
              type="button"
              className="mt-2 text-[12px] text-[#9B9AA0]"
              onClick={() => {
                setDraftId(me.nijiId);
                setEditingId(false);
                setIdNote("");
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <p className="truncate text-[15px] font-medium text-[#17171A]">{me.nijiId}</p>
            <button
              type="button"
              aria-label="Edit Niji ID"
              onClick={() => {
                setDraftId(me.nijiId);
                setEditingId(true);
                setIdNote("");
              }}
              className="grid size-8 place-items-center rounded-full bg-[#EFEFF1] text-[#17171A]"
            >
              <IconPen className="size-3.5" />
            </button>
          </div>
        )}
        <p className="mt-1.5 text-[12px] text-[#9B9AA0]">
          {idNote || "Your public name. Tap the pen to change it if that ID is free."}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-100 px-4 py-3">
        <p className="text-[14px]">Vybe tab</p>
        <Switch on={state.vybeEnabled} onChange={setVybe} />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-neutral-100 px-4 py-3">
        <div>
          <p className="text-[14px]">Hub tab</p>
          <p className="text-[12px] text-[#9B9AA0]">Store and local shops. Off hides the tab.</p>
        </div>
        <Switch on={state.hubEnabled} onChange={setHub} />
      </div>

      <Link
        href="/hub/sell"
        className="mt-3 block rounded-2xl bg-[#F7F4EA] px-4 py-3 text-[14px]"
      >
        List your business on Hub
        <span className="mt-0.5 block text-[12px] text-neutral-500">₹499 / month · zero commission</span>
      </Link>

      <Section title="Presence">
        <div className="flex gap-2 px-3 py-3">
          {PRESENCE.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPresence(p.id)}
              className={`flex-1 rounded-2xl px-2 py-2 text-[13px] ${
                mode === p.id ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1] text-[#65656B]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="px-4 pb-3 text-[12px] text-[#9B9AA0]">{PRESENCE.find((p) => p.id === mode)?.hint}</p>
      </Section>
      <Section title="Seal">
        <button
          type="button"
          onClick={() => setSealGate(state.sealPin ? "change-open" : "set")}
          className="w-full text-left"
        >
          <div className="flex items-center justify-between px-4 py-3 text-[14px]">
            <span>
              Seal code
              <span className="mt-0.5 block text-[12px] text-[#9B9AA0]">
                Your usual code. A chat can still take its own.
              </span>
            </span>
            <span className="text-[#9B9AA0]">{state.sealPin ? "Change" : "Set"}</span>
          </div>
        </button>
      </Section>
      <Section title="This phone">
        <div className="flex items-center justify-between px-4 py-3 text-[14px]">
          <span>
            Lock this phone
            <span className="mt-0.5 block text-[12px] text-[#9B9AA0]">
              Face, thumb, or your seal code when Niji sleeps.
            </span>
          </span>
          <Switch
            on={Boolean(state.appLock)}
            onChange={(on) => {
              if (on && !state.sealPin) {
                setSealGate("lock-set");
                return;
              }
              setAppLock(on);
            }}
          />
        </div>
        <button type="button" onClick={() => setDeskOpen(true)} className="w-full text-left">
          <Row label="Link a computer" />
        </button>
      </Section>
      <Section title="Features">
        <Row label="Homies" extra={<span className="text-neutral-400">5</span>} soon />
      </Section>
      {deskOpen ? (
        <div className={overlayDim} onClick={() => setDeskOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F7F7F8] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-[11px] tracking-caps uppercase text-neutral-400">Link a computer</p>
            <p className="mt-2 text-center text-[13px] text-[#65656B]">
              This phone stays the home. A computer can type this code later — pairing ships in a later slice.
            </p>
            <p className="mt-5 text-center font-mono text-[28px] tracking-[0.28em] text-[#17171A]">{deskCode}</p>
            <p className="mt-2 text-center text-[12px] text-[#9B9AA0]">Refreshes when you open this again.</p>
            <button type="button" onClick={() => setDeskOpen(false)} className="mt-5 w-full rounded-2xl bg-[#17171A] py-3 text-[14px] text-[#F7F7F8]">
              Done
            </button>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={logout}
        className="mt-8 mb-8 w-full py-3 text-[14px] text-neutral-400"
      >
        Sign out
      </button>
      {sealGate ? (
        <div className={overlay}>
          <SealGate
            key={sealGate}
            kind={sealGate === "lock-set" ? "app" : "chat"}
            mode={sealGate === "change-open" ? "open" : "set"}
            hash={state.sealPin}
            onClose={() => setSealGate(null)}
            onSet={(pin) => {
              setSealPin(pin);
              if (sealGate === "lock-set") setAppLock(true);
              setSealGate(null);
            }}
            onUnlock={() => {
              if (sealGate === "change-open") setSealGate("change-set");
            }}
          />
        </div>
      ) : null}
      {paper ? <NijiPaper nijiId={me.nijiId} name={me.name} onClose={() => setPaper(false)} /> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <p className="mb-2 text-[10px] tracking-caps uppercase text-neutral-400">{title}</p>
      <div className="overflow-hidden rounded-2xl bg-neutral-50">{children}</div>
    </div>
  );
}

function Row({
  label,
  extra,
  href,
  soon,
}: {
  label: string;
  extra?: React.ReactNode;
  href?: string;
  soon?: boolean;
}) {
  const inner = (
    <div className="flex items-center justify-between px-4 py-3 text-[14px]">
      <span>
        {label}
        {soon ? <span className="ml-2 text-[11px] text-neutral-400">soon</span> : null}
      </span>
      {extra ?? <span className="text-neutral-300">›</span>}
    </div>
  );
  if (href) return <div>{inner}</div>;
  return inner;
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`h-6 w-10 rounded-full ${on ? "bg-neutral-900" : "bg-neutral-300"}`}
    >
      <span className={`block size-5 rounded-full bg-white transition ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}
