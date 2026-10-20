import type { Disappear } from "@/lib/types";
import { IconClock, IconEye, IconLock, IconWeek } from "@/components/niji/icons";

const labels: Record<Disappear, string> = {
  off: "Encrypted",
  "view-once": "Encrypted. Disappears after they open it.",
  "24h": "Encrypted. Disappears in 24 hours.",
  "7d": "Encrypted. Disappears in 7 days.",
};

export function DisappearMarks({
  mode,
  className = "size-3.5",
}: {
  mode: Disappear;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" title={labels[mode]} aria-label={labels[mode]}>
      <IconLock className={className} />
      {mode === "view-once" ? <IconEye className={className} /> : null}
      {mode === "24h" ? <IconClock className={className} /> : null}
      {mode === "7d" ? <IconWeek className={className} /> : null}
    </span>
  );
}
