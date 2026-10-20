export function relativeTime(iso: string, now = Date.now()): string {
  const delta = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function compact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 100_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${Math.round(n / 1000)}k`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function uid(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function detectLanguage(text: string): string | undefined {
  const ranges: [RegExp, string][] = [
    [/[\u0C00-\u0C7F]/, "Telugu"],
    [/[\u0900-\u097F]/, "Hindi"],
    [/[\u0B80-\u0BFF]/, "Tamil"],
    [/[\u0D00-\u0D7F]/, "Malayalam"],
    [/[\u0C80-\u0CFF]/, "Kannada"],
    [/[\u0A80-\u0AFF]/, "Gujarati"],
    [/[\u0A00-\u0A7F]/, "Punjabi"],
  ];
  for (const [re, name] of ranges) {
    if (re.test(text)) return name;
  }
  return undefined;
}
