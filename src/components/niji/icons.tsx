/** Stacked valley — old Niji Loop / Vybe tab mark. */
export function IconVybe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4 5 L12 19 L20 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.5 5 L12 15.5 L17.5 5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M9 5 L12 11.5 L15 5"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.28"
      />
    </svg>
  );
}

/** Two overlapping bubbles with dots — old Niji Chat tab. */
export function IconChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9 10h10a1 1 0 011 1v5a1 1 0 01-1 1h-2l-2 2v-2H9a1 1 0 01-1-1v-5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M5 7h8a1 1 0 011 1v4a1 1 0 01-1 1H8l-2 2v-2H5a1 1 0 01-1-1V8a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="#EBEBEC"
      />
      <circle cx="7" cy="10" r="0.8" fill="currentColor" />
      <circle cx="9.5" cy="10" r="0.8" fill="currentColor" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function IconCalls({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Same clean handset as accept, rotated down — decline / end. */
export function IconPhoneHang({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <g transform="rotate(135 12 12)">
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function IconSpeaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M3.8 9.2h3.4L12 5.2v13.6l-4.8-4H3.8A1.2 1.2 0 0 1 2.6 13.6V10.4A1.2 1.2 0 0 1 3.8 9.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.6 9.2a3.6 3.6 0 0 1 0 5.6M18.2 6.8a7 7 0 0 1 0 10.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconSearch({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="11" cy="11" r="6.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.8 15.8 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** House — Vybe feed. Same stroke as the other tabs. */
export function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4.4 11.2 12 4.6l7.6 6.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 10.6v8.8h11.2v-8.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Compass — Vybe explore. */
export function IconExplore({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="8.1" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M14.7 9.3 10.6 10.6 9.3 14.7 13.4 13.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Concentric rings — Vybe chat. Distinct from regular Chat bubbles. */
export function IconVybeChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="5.1" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
    </svg>
  );
}

/** Four-point spark — notes. */
export function IconBell({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3.1 13.15 10.85 20.9 12 13.15 13.15 12 20.9 10.85 13.15 3.1 12 10.85 10.85Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Stall awning that talks — Hub chat. One mark, not a house, crate, tag, or ₹. */
export function IconHubChat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4.4 9 6.3 6.2 8.2 9 10.1 6.2 12 9 13.9 6.2 15.8 9 17.7 6.2 19.6 9v7.3H13.1L9.4 20V16.3H4.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Hexagon + centre dot — old Niji Hub tab. */
export function IconHub({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3L19.5 7.5V16.5L12 21L4.5 16.5V7.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.7" />
      <line x1="12" y1="9.5" x2="12" y2="3" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="12" y1="14.5" x2="12" y2="21" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

export function IconAccount({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconStar({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"}>
      <path
        d="M12 3.6 14.4 9l5.8.6-4.4 3.8 1.3 5.7L12 16.8 6.9 19.1l1.3-5.7L3.8 9.6 9.6 9 12 3.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Concentric share ripple — optical weight matched to star/comment (size-5). */
export function IconRipple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <circle cx="12" cy="12" r="7.4" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
    </svg>
  );
}

export function IconLock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="6" y="11" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M3.6 12S7 6.8 12 6.8 20.4 12 20.4 12 17 17.2 12 17.2 3.6 12 3.6 12Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8.2V12l2.6 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconWeek({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="4.5" y="6" width="15" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 4.5V8M16 4.5V8M4.5 10.5h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconUserPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <circle cx="10" cy="8.2" r="3.2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.6 18.6c.7-3 2.9-4.6 5.4-4.6s4.7 1.6 5.4 4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M18.2 7.4v6.2M15.1 10.5h6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M12 5.2v13.6M5.2 12h13.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconForward({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9.5 5.5 16 12l-6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconVideo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3" y="6.6" width="12.5" height="10.8" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15.5 11l5-2.6v7.2l-5-2.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M9.2 4.8h5.6l.8 5.2 2.2 2.2v1.4H6.2v-1.4l2.2-2.2.8-5.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 13.6V19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Unsigned wax — Chat Mist. A seal with no mark; the name already left. */
export function IconMist({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M16.85 8.1A5.85 5.85 0 1 1 15.15 6.55"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <path d="M16.35 7.15 17.85 5.55" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" opacity="0.8" />
      <path d="M18.25 5.15 19.45 3.9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.38" />
      <path d="M19.7 3.55 20.45 2.8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.16" />
    </svg>
  );
}

/** Paper map pin — share a place from a chat profile. */
export function IconPlace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 18.8s-4.8-4.4-4.8-7.8a4.8 4.8 0 1 1 9.6 0c0 3.4-4.8 7.8-4.8 7.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.8" r="1.45" stroke="currentColor" strokeWidth="1.35" />
      <path d="M5.4 20.2 8.2 18.8 12 20.4 15.8 18.8 18.6 20.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Keyboard enter / return — open a comment stack. */
export function IconKeyboard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="3.6" y="5" width="16.8" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15.6 9.4v3.2H9.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.1 10.4 8.6 12.6 11.1 14.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M14.2 5.6 18.4 9.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5.6 18.4 6.8 14.2 16.6 4.4c.8-.8 2-.8 2.8 0l.2.2c.8.8.8 2 0 2.8L9.8 17.2 5.6 18.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Small QR mark — opens the Namaskaram paper, not a seal on the page. */
export function IconQr({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M4.5 4.5h6v6h-6V4.5Zm1.5 1.5v3h3v-3H6ZM13.5 4.5h6v6h-6V4.5Zm1.5 1.5v3h3v-3h-3ZM4.5 13.5h6v6h-6v-6Zm1.5 1.5v3h3v-3H6Z"
        fill="currentColor"
      />
      <path
        d="M13.5 13.5h2.25v2.25H13.5V13.5Zm3.75 0H19.5v2.25h-2.25V13.5ZM13.5 17.25h2.25V19.5H13.5v-2.25Zm3.75 0H19.5V19.5h-2.25v-2.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Chat bubble. Same mark always — a heavier outer stroke when someone wrote. */
export function IconComment({ className, heavy }: { className?: string; heavy?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M5.2 6.2h13.6a1.6 1.6 0 0 1 1.6 1.6v7.2a1.6 1.6 0 0 1-1.6 1.6H11l-3.2 2.6v-2.6H5.2A1.6 1.6 0 0 1 3.6 15V7.8A1.6 1.6 0 0 1 5.2 6.2Z"
        stroke="currentColor"
        strokeWidth={heavy ? 2.25 : 1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGhost({ className }: { className?: string }) {
  return <IconMist className={className} />;
}

export function IconFlip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M7.2 8.4A6.4 6.4 0 0 1 18 10.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M16.6 7.6 18.2 10.6 15 11.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16.8 15.6A6.4 6.4 0 0 1 6 13.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M7.4 16.4 5.8 13.4 9 12.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStill({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="4.2" y="6.2" width="15.6" height="11.6" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="10.4" r="1.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.8 15.4 9.2 12.2 13 14.6 16.2 11.8 19.4 15.2" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M10.4 13.6 13.6 10.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M8.6 15.4c-1.2-1.2-1.2-3.2 0-4.4l2.2-2.2c1.2-1.2 3.2-1.2 4.4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.4 8.6c1.2 1.2 1.2 3.2 0 4.4l-2.2 2.2c-1.2 1.2-3.2 1.2-4.4 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLeaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M18.6 6.2c-5.2-.4-10.4 2.2-11.8 7.4-.8 3 1.2 5.8 4.2 6.2 5.2.6 10-3.2 10.4-8.4.1-1.4-.2-2.8-.8-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.4 17.2c2.4-3.2 5.6-5.6 9.4-7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Folded paper waiting to leave — Chat later / scheduled drafts. Not a clock. */
export function IconLater({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M6.2 5.4h8.4L18 9.2v9.2a1.6 1.6 0 0 1-1.6 1.6H6.2A1.6 1.6 0 0 1 4.6 18.4V7A1.6 1.6 0 0 1 6.2 5.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14.6 5.6V9h3.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 13.2h5.4M8 16.2h3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconMic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <rect x="9" y="3.8" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSend({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path d="M4.5 12 20 5l-5.2 14-3.1-5.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/** Two silver arcs — the Niji mark. Namaskaram on a person or a stall. */
export function Namaskaram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "inline-block h-[13px] w-[13px] shrink-0 align-[-2px]"}
      aria-label="Namaskaram"
      role="img"
    >
      <defs>
        <linearGradient id="nijiAg" x1="8" y1="1" x2="16" y2="23" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F7F7F8" />
          <stop offset="0.32" stopColor="#D4D4D8" />
          <stop offset="0.58" stopColor="#9A9AA0" />
          <stop offset="0.82" stopColor="#6E6E74" />
          <stop offset="1" stopColor="#C4C4C8" />
        </linearGradient>
      </defs>
      <path
        fill="url(#nijiAg)"
        d="M11.12 1.45C8.05 4.35 5.2 10.15 4.72 15.85 4.42 19.55 5.35 22.35 7.22 22.5c.52-1.2.82-4.55 1.55-8.85C9.55 8.4 10.42 3.55 11.12 1.45Z"
      />
      <path
        fill="url(#nijiAg)"
        d="M12.88 1.45c3.07 2.9 5.92 8.7 6.4 14.4.3 3.7-.63 6.5-2.5 6.65-.52-1.2-.82-4.55-1.55-8.85C14.45 8.4 13.58 3.55 12.88 1.45Z"
      />
    </svg>
  );
}
