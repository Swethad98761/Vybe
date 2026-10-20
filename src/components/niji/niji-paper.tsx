"use client";

import { useRef, useState } from "react";
import { toBlob } from "html-to-image";
import { NijiSeal } from "@/components/niji/niji-seal";
import { nijiPaperUri, nijiShareText, nijiWebProfileUri } from "@/lib/niji-link";
import { useShellOverlay } from "@/components/web/shell-overlay";

export function NijiPaper({
  nijiId,
  name,
  onClose,
  uri,
  shareText,
  shareLabel = "Share Niji ID",
  kicker,
  subtitle,
}: {
  nijiId: string;
  name: string;
  onClose: () => void;
  uri?: string;
  shareText?: string;
  shareLabel?: string;
  kicker?: string;
  subtitle?: string;
}) {
  const page = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const payload = uri || nijiPaperUri(nijiId);
  const first = name.trim().split(/\s+/)[0] || name;
  const overlay = useShellOverlay("z-[80] cursor-pointer");

  async function sharePage(e: React.MouseEvent) {
    e.stopPropagation();
    const node = page.current;
    if (!node || busy) return;
    setBusy(true);
    try {
      const blob = await toBlob(node, { pixelRatio: 2, cacheBust: true, backgroundColor: "#EBEBEC" });
      if (!blob) throw new Error("empty");
      const file = new File([blob], `${nijiId}.png`, { type: "image/png" });
      const web = nijiWebProfileUri(window.location.origin, nijiId);
      const text = shareText || nijiShareText(nijiId, web);
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file], text })) {
        await navigator.share({ files: [file], title: nijiId, text });
      } else if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: nijiId, text });
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${nijiId}.png`;
        a.click();
        window.setTimeout(() => URL.revokeObjectURL(href), 800);
      }
    } catch {
      /* share cancelled */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={overlay} onClick={onClose}>
      <div ref={page} className="absolute inset-0 overflow-hidden bg-paper">
        {/* Same frame as the launch story: globe at the top, storyboard floor on the floor. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/niji-story.jpg"
          alt=""
          className="absolute top-0 left-1/2 w-auto max-w-none -translate-x-1/2"
          style={{ height: "105.485%" }}
        />
        <div className="relative flex h-full flex-col justify-end p-5 pb-28">
          <div
            className="rounded-[24px] px-5 py-6"
            style={{
              background: "rgba(235,235,236,0.46)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              border: "1px solid rgba(255,255,255,0.22)",
            }}
          >
            <p className="text-center text-[12px] text-[#65656B]">{kicker || `A seal that finds ${first}.`}</p>
            <div className="mx-auto mt-4 w-fit">
              <NijiSeal value={payload} size={220} />
            </div>
            {subtitle ? (
              <p className="mt-3 text-center text-[15px] font-medium tracking-wide text-[#17171A]">{subtitle}</p>
            ) : null}
            <p className={`text-center tracking-wide text-[#17171A] ${subtitle ? "mt-1 text-[13px]" : "mt-3 text-[15px] font-medium"}`}>
              {nijiId}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-5 bottom-8">
        <button
          type="button"
          onClick={sharePage}
          className="w-full rounded-2xl bg-[rgba(235,235,236,0.55)] py-3 text-[14px] text-[#17171A] backdrop-blur-md"
        >
          {busy ? "Sharing" : shareLabel}
        </button>
      </div>
    </div>
  );
}
