import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { c } from "@/theme";

type P = { size?: number; color?: string; fill?: boolean };

const base = (size: number) => ({ width: size, height: size, viewBox: "0 0 24 24" });

/** Stacked valley — old Niji Loop / Vybe tab mark. */
export function IconVybe({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4 5 L12 19 L20 5"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.5 5 L12 15.5 L17.5 5"
        stroke={color}
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <Path
        d="M9 5 L12 11.5 L15 5"
        stroke={color}
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.28"
      />
    </Svg>
  );
}

/** Two overlapping bubbles with dots — old Niji Chat tab. */
export function IconChat({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M9 10h10a1 1 0 011 1v5a1 1 0 01-1 1h-2l-2 2v-2H9a1 1 0 01-1-1v-5a1 1 0 011-1z"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M5 7h8a1 1 0 011 1v4a1 1 0 01-1 1H8l-2 2v-2H5a1 1 0 01-1-1V8a1 1 0 011-1z"
        stroke={color}
        strokeWidth="1.4"
        fill={c.paper}
        strokeLinejoin="round"
      />
      <Circle cx="7" cy="10" r="0.8" fill={color} />
      <Circle cx="9.5" cy="10" r="0.8" fill={color} />
      <Circle cx="12" cy="10" r="0.8" fill={color} />
    </Svg>
  );
}

export function IconCalls({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Same clean handset as accept, rotated down — decline / end. */
export function IconPhoneHang({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <G transform="rotate(135 12 12)">
        <Path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}

export function IconSearch({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx="11" cy="11" r="6.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M15.8 15.8 20 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** House — Vybe feed. Same stroke as the other tabs. */
export function IconHome({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4.4 11.2 12 4.6l7.6 6.6"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M6.4 10.6v8.8h11.2v-8.8" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

/** Compass — Vybe explore. */
export function IconExplore({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="8.1" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M14.7 9.3 10.6 10.6 9.3 14.7 13.4 13.4Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Concentric rings — Vybe chat. Distinct from regular Chat bubbles. */
export function IconVybeChat({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="12" r="1.7" fill={color} />
      <Circle cx="12" cy="12" r="5.1" stroke={color} strokeWidth="1.5" fill="none" opacity={0.7} />
      <Circle cx="12" cy="12" r="8.2" stroke={color} strokeWidth="1.5" fill="none" opacity={0.35} />
    </Svg>
  );
}

/** Four-point spark — notes. */
export function IconBell({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 3.1 13.15 10.85 20.9 12 13.15 13.15 12 20.9 10.85 13.15 3.1 12 10.85 10.85Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Stall awning that talks — Hub chat. One mark, not a house, crate, tag, or ₹. */
export function IconHubChat({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4.4 9 6.3 6.2 8.2 9 10.1 6.2 12 9 13.9 6.2 15.8 9 17.7 6.2 19.6 9v7.3H13.1L9.4 20V16.3H4.4Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Hexagon + centre dot — old Niji Hub tab. */
export function IconHub({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 3L19.5 7.5V16.5L12 21L4.5 16.5V7.5L12 3Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="2.5" fill={color} opacity={0.7} />
      <Line x1="12" y1="9.5" x2="12" y2="3" stroke={color} strokeWidth="0.8" opacity={0.5} />
      <Line x1="12" y1="14.5" x2="12" y2="21" stroke={color} strokeWidth="0.8" opacity={0.5} />
    </Svg>
  );
}

export function IconAccount({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Circle cx="12" cy="8.5" r="3.5" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconLock({ size = 14, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="6" y="11" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

export function IconEye({ size = 14, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.6 12S7 6.8 12 6.8 20.4 12 20.4 12 17 17.2 12 17.2 3.6 12 3.6 12Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Circle cx="12" cy="12" r="2.2" stroke={color} strokeWidth="1.5" fill="none" />
    </Svg>
  );
}

export function IconClock({ size = 14, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="7.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M12 8.2V12l2.6 2" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function IconWeek({ size = 14, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4.5" y="6" width="15" height="13.5" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M8 4.5V8M16 4.5V8M4.5 10.5h15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconStar({ size = 22, color = c.inkSoft, fill = false }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.6l2.5 5.3 5.7.7-4.2 4 1.1 5.7-5.1-2.9-5.1 2.9 1.1-5.7-4.2-4 5.7-.7Z"
        stroke={color}
        strokeWidth="1.5"
        fill={fill ? color : "none"}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconRipple({ size = 22, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="12" r="5.4" stroke={color} strokeWidth="1.2" fill="none" opacity="0.65" />
      <Circle cx="12" cy="12" r="8.8" stroke={color} strokeWidth="1.2" fill="none" opacity="0.32" />
    </Svg>
  );
}

/** Chat bubble. Heavier outer stroke when someone wrote. */
export function IconComment({ size = 22, color = c.inkSoft, heavy }: P & { heavy?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5.2 6.2h13.6a1.6 1.6 0 0 1 1.6 1.6v7.2a1.6 1.6 0 0 1-1.6 1.6H11l-3.2 2.6v-2.6H5.2A1.6 1.6 0 0 1 3.6 15V7.8A1.6 1.6 0 0 1 5.2 6.2Z"
        stroke={color}
        strokeWidth={heavy ? 2.25 : 1.5}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconVideo({ size = 20, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="6.6" width="12.5" height="10.8" rx="2.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path d="M15.5 11l5-2.6v7.2l-5-2.6Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconPlus({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 5.2v13.6M5.2 12h13.6"
        stroke={color}
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconForward({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.5 5.5 16 12l-6.5 6.5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconPin({ size = 14, color = c.inkFaint }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9.2 4.8h5.6l.8 5.2 2.2 2.2v1.4H6.2v-1.4l2.2-2.2.8-5.2Z"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
      <Path d="M12 13.6V19" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function IconBack({ size = 24, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M14.5 5.5 8 12l6.5 6.5"
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconSend({ size = 20, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 12 20 5l-5.2 14-3.1-5.6Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

/** Finder marks — opens the mountain paper / Niji ID share. */
export function IconQr({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="13.3" y="3.5" width="7.2" height="7.2" rx="1.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="3.5" y="13.3" width="7.2" height="7.2" rx="1.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Rect x="5.7" y="5.7" width="2.8" height="2.8" fill={color} />
      <Rect x="15.5" y="5.7" width="2.8" height="2.8" fill={color} />
      <Rect x="5.7" y="15.5" width="2.8" height="2.8" fill={color} />
      <Path
        d="M13.3 13.3h3.2v3.2h-3.2zM18.2 13.3h2.3v2.3M13.3 18.2h2.3v2.3M17.4 17.4h3.1v3.1h-3.1z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Keyboard enter / return — open a comment stack. */
export function IconKeyboard({ size = 18, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.6" y="5" width="16.8" height="14" rx="2.4" stroke={color} strokeWidth="1.5" />
      <Path
        d="M15.6 9.4v3.2H9.1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M11.1 10.4 8.6 12.6 11.1 14.8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconUserPlus({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="10" cy="8.2" r="3.2" stroke={color} strokeWidth="1.5" fill="none" />
      <Path
        d="M4.6 18.6c.7-3 2.9-4.6 5.4-4.6s4.7 1.6 5.4 4.6"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M18.2 7.4v6.2M15.1 10.5h6.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function IconEnter({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M10 7.2V5.7A1.7 1.7 0 0 1 11.7 4h6.6A1.7 1.7 0 0 1 20 5.7v12.6a1.7 1.7 0 0 1-1.7 1.7h-6.6A1.7 1.7 0 0 1 10 18.3v-1.5"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M4 12h10.2M11.2 8.6 14.8 12l-3.6 3.4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMic({ size = 22, color = c.ink, muted = false }: P & { muted?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.6a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0v-6a3 3 0 0 0-3-3Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M6.8 11.2a5.2 5.2 0 0 0 10.4 0M12 16.4V20"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {muted ? (
        <Path d="M5 5.5 19 19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}

export function IconSpeaker({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.8 9.2h3.4L12 5.2v13.6l-4.8-4H3.8A1.2 1.2 0 0 1 2.6 13.6V10.4A1.2 1.2 0 0 1 3.8 9.2Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M15.6 9.2a3.6 3.6 0 0 1 0 5.6M18.2 6.8a7 7 0 0 1 0 10.4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconCamera({ size = 22, color = c.ink, off = false }: P & { off?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.8 8.2A1.6 1.6 0 0 1 5.4 6.6h8.4A1.6 1.6 0 0 1 15.4 8.2v7.6a1.6 1.6 0 0 1-1.6 1.6H5.4A1.6 1.6 0 0 1 3.8 15.8Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Path d="M15.4 10.6 20.2 8v8l-4.8-2.6" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {off ? <Path d="M4.4 5 19.6 19.4" stroke={color} strokeWidth="1.5" strokeLinecap="round" /> : null}
    </Svg>
  );
}

export function IconPhoneOff({ size = 22, color = c.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M4.2 4.2 19.8 19.8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

/** Four-point spark from the brand artwork. */
export function IconSpark({ size = 18, color = c.inkSoft }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2.4 13.8 10 21.6 12 13.8 14 12 21.6 10.2 14 2.4 12 10.2 10Z"
        fill={color}
      />
    </Svg>
  );
}

/** Unsigned wax — Chat Mist. A seal with no mark; the name already left. */
export function IconMist({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M16.85 8.1A5.85 5.85 0 1 1 15.15 6.55"
        stroke={color}
        strokeWidth="1.55"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M16.35 7.15 17.85 5.55" stroke={color} strokeWidth="1.35" fill="none" strokeLinecap="round" opacity="0.8" />
      <Path d="M18.25 5.15 19.45 3.9" stroke={color} strokeWidth="1.15" fill="none" strokeLinecap="round" opacity="0.38" />
      <Path d="M19.7 3.55 20.45 2.8" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.16" />
    </Svg>
  );
}

/** Paper map pin — share a place from a chat profile. */
export function IconPlace({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M12 18.8s-4.8-4.4-4.8-7.8a4.8 4.8 0 1 1 9.6 0c0 3.4-4.8 7.8-4.8 7.8Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10.8" r="1.45" stroke={color} strokeWidth="1.35" fill="none" />
      <Path
        d="M5.4 20.2 8.2 18.8 12 20.4 15.8 18.8 18.6 20.2"
        stroke={color}
        strokeWidth="1.35"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconPen({ size = 22, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path d="M14.2 5.6 18.4 9.8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path
        d="M5.6 18.4 6.8 14.2 16.6 4.4c.8-.8 2-.8 2.8 0l.2.2c.8.8.8 2 0 2.8L9.8 17.2 5.6 18.4Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconGhost({ size = 24, color = c.ink }: P) {
  return <IconMist size={size} color={color} />;
}

export function IconFlip({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M7.2 8.4A6.4 6.4 0 0 1 18 10.6"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M16.6 7.6 18.2 10.6 15 11.4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.8 15.6A6.4 6.4 0 0 1 6 13.4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M7.4 16.4 5.8 13.4 9 12.6"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconStill({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M4.2 6.2h15.6a2 2 0 0 1 2 2v7.6a2 2 0 0 1-2 2H4.2a2 2 0 0 1-2-2V8.2a2 2 0 0 1 2-2Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Circle cx="9" cy="10.4" r="1.3" stroke={color} strokeWidth="1.4" fill="none" />
      <Path
        d="M4.8 15.4 9.2 12.2 13 14.6 16.2 11.8 19.4 15.2"
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconPath({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path d="M10.4 13.6 13.6 10.4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path
        d="M8.6 15.4c-1.2-1.2-1.2-3.2 0-4.4l2.2-2.2c1.2-1.2 3.2-1.2 4.4 0"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M15.4 8.6c1.2 1.2 1.2 3.2 0 4.4l-2.2 2.2c-1.2 1.2-3.2 1.2-4.4 0"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconLeaf({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M18.6 6.2c-5.2-.4-10.4 2.2-11.8 7.4-.8 3 1.2 5.8 4.2 6.2 5.2.6 10-3.2 10.4-8.4.1-1.4-.2-2.8-.8-4"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M8.4 17.2c2.4-3.2 5.6-5.6 9.4-7.2"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Folded paper waiting to leave — Chat later / scheduled drafts. */
export function IconLater({ size = 24, color = c.ink }: P) {
  return (
    <Svg {...base(size)}>
      <Path
        d="M6.2 5.4h8.4L18 9.2v9.2a1.6 1.6 0 0 1-1.6 1.6H6.2A1.6 1.6 0 0 1 4.6 18.4V7A1.6 1.6 0 0 1 6.2 5.4Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <Path d="M14.6 5.6V9h3.2" stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <Path d="M8 13.2h5.4M8 16.2h3.4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** Two silver arcs — the Niji mark. Namaskaram on a person or a stall. */
export function Namaskaram({ size = 13 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityLabel="Namaskaram">
      <Defs>
        <LinearGradient id="nijiAg" x1="8" y1="1" x2="16" y2="23" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#F7F7F8" />
          <Stop offset="0.32" stopColor="#D4D4D8" />
          <Stop offset="0.58" stopColor="#9A9AA0" />
          <Stop offset="0.82" stopColor="#6E6E74" />
          <Stop offset="1" stopColor="#C4C4C8" />
        </LinearGradient>
      </Defs>
      <Path
        fill="url(#nijiAg)"
        d="M11.12 1.45C8.05 4.35 5.2 10.15 4.72 15.85 4.42 19.55 5.35 22.35 7.22 22.5c.52-1.2.82-4.55 1.55-8.85C9.55 8.4 10.42 3.55 11.12 1.45Z"
      />
      <Path
        fill="url(#nijiAg)"
        d="M12.88 1.45c3.07 2.9 5.92 8.7 6.4 14.4.3 3.7-.63 6.5-2.5 6.65-.52-1.2-.82-4.55-1.55-8.85C14.45 8.4 13.58 3.55 12.88 1.45Z"
      />
    </Svg>
  );
}
