import { MOODS, MOOD_PICK, STATUS_PAPERS, type MoodId, type StatusPaperId } from "@/lib/tokens";

function Glyph({ id }: { id: MoodId }) {
  switch (id) {
    case "rain":
      return (
        <path d="M9 5.2 7.4 11.2M12 4.6 10.2 12M15 5.4 13.6 11.4M8.6 15.2c0 1.9 1.5 3.4 3.4 3.4s3.4-1.5 3.4-3.4c0-2.2-3.4-5.2-3.4-5.2s-3.4 3-3.4 5.2Z" />
      );
    case "nights":
      return <path d="M14.6 6.4A6.2 6.2 0 1 0 17 14.8 5 5 0 0 1 14.6 6.4Z" />;
    case "sunrise":
      return <path d="M5 16.4h14M7.4 13.2A5.6 5.6 0 0 1 16.6 13M12 7.2v2.4M5.8 10.4l1.6 1.4M18.2 10.4 16.6 11.8" />;
    case "nature":
      return <path d="M12 19V9.2M12 9.2c-3.2.2-5.4 2.4-5.6 5.4 3.2.2 5.4-2.2 5.6-5.4Zm0 0c3.2.2 5.4 2.4 5.6 5.4-3.2.2-5.4-2.2-5.6-5.4Z" />;
    case "fire":
      return <path d="M12 19c3.2 0 5-2.2 5-5.2 0-3.2-2.4-5-2.4-7.4C13.2 8.6 12 11 12 11s-1-2-2.8-3.2C9.2 10.4 7 12.4 7 13.8 7 16.8 8.8 19 12 19Z" />;
    case "bloom":
      return <path d="M12 12 9.2 6.8 12 9l2.8-2.2L12 12Zm0 0 5.2-2.8L15 12l2.2 2.8L12 12Zm0 0 2.8 5.2L12 15l-2.8 2.2L12 12Zm0 0L6.8 14.8 9 12 6.8 9.2 12 12Z" />;
    case "ocean":
      return <path d="M4.6 11.2c1.8 1.6 3.6 1.6 5.4 0s3.6-1.6 5.4 0 3.6 1.6 4.6 0M4.6 15.4c1.8 1.6 3.6 1.6 5.4 0s3.6-1.6 5.4 0 3.6 1.6 4.6 0" />;
    case "moon":
      return <circle cx="12" cy="12" r="6.2" />;
    case "creative":
      return <path d="M6.4 7.2h11.2v9.6H6.4zM9 10.4h2.2M9 13.4h4.6" />;
    case "magic":
      return <path d="M12 5.2 13 10.6 18.4 11.6 13 12.6 12 18 11 12.6 5.6 11.6 11 10.6Z" />;
    case "energy":
      return <path d="M13.4 4.8 8.2 13h4.2l-1.8 6.2 6.4-8.8h-4Z" />;
    default:
      return <path d="M8.4 14.2c1.2-2.4 3.2-3.6 3.6-6.2.4 2.6 2.4 3.8 3.6 6.2.8 1.6-.2 3.6-2.2 3.8h-2.8c-2-.2-3-2.2-2.2-3.8Z" />;
  }
}

export function MoodMark({ id, className = "size-5" }: { id: MoodId; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <g stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round">
        <Glyph id={id} />
      </g>
    </svg>
  );
}

export function moodLabel(id?: MoodId) {
  return MOODS.find((m) => m.id === id)?.label;
}

const WASH: Record<MoodId, { from: string; to: string; ink: string }> = {
  rain: { from: "#D5DCE4", to: "#E9EDEF", ink: "#2E3844" },
  nights: { from: "#2B2D36", to: "#3E404A", ink: "#F3F0E8" },
  sunrise: { from: "#F0D2B8", to: "#F7EDE4", ink: "#4A3428" },
  nature: { from: "#D5E0D4", to: "#E8EEE6", ink: "#2C3A30" },
  fire: { from: "#E6C4AE", to: "#F3E3D8", ink: "#4A2E22" },
  bloom: { from: "#E6D2D8", to: "#F4EBEA", ink: "#3C2C32" },
  ocean: { from: "#C6D6DA", to: "#E3EBEB", ink: "#22343A" },
  moon: { from: "#D3D2DC", to: "#EBEAF0", ink: "#2A2836" },
  creative: { from: "#DDD6CE", to: "#EFEBE6", ink: "#332C26" },
  magic: { from: "#D8D4E4", to: "#EDEAF2", ink: "#2E2A3A" },
  energy: { from: "#E4D0B8", to: "#F3E8DA", ink: "#3A2E22" },
  love: { from: "#E8D0D0", to: "#F5EAEA", ink: "#3A2A2A" },
};

export function moodInk(id?: MoodId | StatusPaperId) {
  if (!id || id === "plain") return "#17171A";
  return WASH[id]?.ink ?? "#17171A";
}

function Atmosphere({ id, ink }: { id: MoodId; ink: string }) {
  switch (id) {
    case "rain":
      return (
        <>
          <div className="absolute inset-x-0 top-0 h-[58%] opacity-50" style={{ background: "linear-gradient(180deg, #B7C3D0 0%, transparent 100%)" }} />
          <div className="absolute inset-x-[10%] top-[22%] h-px opacity-20" style={{ background: ink }} />
          <div className="absolute inset-x-[18%] top-[32%] h-px opacity-12" style={{ background: ink }} />
        </>
      );
    case "nights":
      return <div className="absolute right-7 top-8 size-[4.5rem] rounded-full opacity-25" style={{ background: "#F3F0E8" }} />;
    case "sunrise":
      return <div className="absolute inset-x-0 bottom-0 h-[46%] opacity-55" style={{ background: "linear-gradient(0deg, #E8B48A 0%, transparent 100%)" }} />;
    case "nature":
      return <div className="absolute left-1/2 top-0 h-full w-[38%] -translate-x-1/2 opacity-25" style={{ background: "linear-gradient(180deg, #8FA88C 0%, transparent 80%)" }} />;
    case "fire":
      return <div className="absolute -left-8 -bottom-10 size-40 rounded-full opacity-35" style={{ background: "#D08960" }} />;
    case "bloom":
      return (
        <>
          <div className="absolute left-[18%] top-[22%] size-16 rounded-full opacity-20" style={{ background: "#C98996" }} />
          <div className="absolute right-[14%] top-[38%] size-10 rounded-full opacity-16" style={{ background: "#C98996" }} />
        </>
      );
    case "ocean":
      return <div className="absolute inset-x-0 bottom-0 h-[38%] opacity-45" style={{ background: "linear-gradient(0deg, #7FA8B0 0%, transparent 100%)" }} />;
    case "moon":
      return <div className="absolute right-6 top-7 size-14 rounded-full opacity-20" style={{ boxShadow: `inset -10px 0 0 ${ink}` }} />;
    default:
      return null;
  }
}

/** Paper field for a mood — a wash, not a filter and not rain-drops. */
export function MoodWash({ id, className = "" }: { id?: MoodId | StatusPaperId; className?: string }) {
  if (!id || id === "plain") return null;
  const wash = WASH[id];
  if (!wash) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(165deg, ${wash.from} 0%, ${wash.to} 72%)` }}
      />
      <Atmosphere id={id} ink={wash.ink} />
      <svg viewBox="0 0 24 24" className="absolute -right-3 -bottom-4 size-28 opacity-[0.12]" fill="none">
        <g stroke={wash.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <Glyph id={id} />
        </g>
      </svg>
    </div>
  );
}

export function StatusPaperRail({
  value,
  onChange,
}: {
  value: StatusPaperId;
  onChange: (id: StatusPaperId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {STATUS_PAPERS.map((paper) => {
        const on = value === paper.id;
        return (
          <button
            key={paper.id}
            type="button"
            onClick={() => onChange(paper.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ${
              on ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1]/80 text-[#65656B]"
            }`}
          >
            {paper.id !== "plain" ? <MoodMark id={paper.id} className="size-3.5" /> : null}
            {paper.label}
          </button>
        );
      })}
    </div>
  );
}

export function MoodRail({
  value,
  onChange,
}: {
  value?: MoodId;
  onChange: (id: MoodId) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {MOOD_PICK.map((id) => {
        const on = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ${
              on ? "bg-[#17171A] text-[#F7F7F8]" : "bg-[#EFEFF1]/80 text-[#65656B]"
            }`}
          >
            <MoodMark id={id} className="size-3.5" />
            {moodLabel(id)}
          </button>
        );
      })}
    </div>
  );
}
