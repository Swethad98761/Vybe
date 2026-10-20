export const GOLD = "#C9A84C";
export const GOLD_LIGHT = "#FFF8E1";
export const GOLD_BORDER = "#E8D5A3";
export const INK = "#1A1A1A";
export const SAFFRON = "#FF9933";
export const INDIA_GREEN = "#138808";
export const WELCOME_BG = "#1A1208";
export const CALL_BG = "#1A1A2E";

export const MOODS = [
  { id: "rain", label: "Rain" },
  { id: "nature", label: "Still" },
  { id: "nights", label: "Night" },
  { id: "sunrise", label: "First light" },
  { id: "ocean", label: "Tide" },
  { id: "creative", label: "Make" },
  { id: "fire", label: "Heat" },
  { id: "moon", label: "Moon" },
  { id: "magic", label: "Spark" },
  { id: "bloom", label: "Bloom" },
  { id: "energy", label: "Rush" },
  { id: "love", label: "Warm" },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

/** Moods offered when composing or browsing explore. */
export const MOOD_PICK: MoodId[] = ["rain", "nights", "sunrise", "nature", "fire", "bloom", "ocean", "moon"];

/** Text-status papers. Plain is the paper itself. The rest are moods. */
export const STATUS_PAPERS = [
  { id: "plain", label: "Plain" },
  { id: "energy", label: "Joyful" },
  { id: "love", label: "Warm" },
  { id: "nights", label: "Night" },
  { id: "sunrise", label: "First light" },
  { id: "bloom", label: "Bloom" },
  { id: "ocean", label: "Tide" },
  { id: "fire", label: "Heat" },
  { id: "rain", label: "Rain" },
  { id: "nature", label: "Still" },
] as const;

export type StatusPaperId = (typeof STATUS_PAPERS)[number]["id"];

export const TRAVELS = [
  { id: "hold", label: "Hold", hint: "Stays on your paper." },
  { id: "pass", label: "Pass", hint: "Hand it to people you pick." },
  { id: "fade", label: "Fade", hint: "A day on the feed, then ash." },
] as const;

export function travelMeta(travel?: "hold" | "pass" | "fade") {
  if (travel === "pass") return { audience: "homies" as const, expiry: "forever" as const };
  if (travel === "fade") return { audience: "followers" as const, expiry: "24h" as const };
  return { audience: "everyone" as const, expiry: "forever" as const };
}

export const SHOP_CATEGORIES = [
  { id: "all", label: "All", emoji: "✦" },
  { id: "food", label: "Food", emoji: "🍛" },
  { id: "fashion", label: "Fashion", emoji: "👗" },
  { id: "beauty", label: "Beauty", emoji: "✨" },
  { id: "electronics", label: "Electronics", emoji: "🔌" },
  { id: "home", label: "Home", emoji: "🏡" },
  { id: "arts", label: "Arts", emoji: "🎨" },
] as const;

/** How a stall’s menu is cut — like a real counter, not one flat list. */
export const MENU_SECTIONS: Record<string, string[]> = {
  food: ["Starters", "Mains", "Sides", "Drinks", "Sweets"],
  fashion: ["New", "Ready to wear", "Made to order"],
  beauty: ["Face", "Hair", "Body"],
  electronics: ["Devices", "Cables", "Parts"],
  home: ["Kitchen", "Rooms", "Soft"],
  arts: ["Prints", "Wear", "Commission"],
};

export function menuSectionsFor(category: string) {
  return MENU_SECTIONS[category] ?? ["Menu"];
}

export function groupMenu<T extends { section?: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.section?.trim() || "Menu";
    const list = map.get(key);
    if (list) list.push(item);
    else map.set(key, [item]);
  }
  return map;
}

export function orderedMenu<T extends { section?: string }>(items: T[], category?: string) {
  const grouped = groupMenu(items);
  const preferred = category ? menuSectionsFor(category) : [];
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const key of preferred) {
    if (grouped.has(key) && !seen.has(key)) {
      keys.push(key);
      seen.add(key);
    }
  }
  for (const key of grouped.keys()) {
    if (!seen.has(key)) {
      keys.push(key);
      seen.add(key);
    }
  }
  return keys.map((key) => ({ key, items: grouped.get(key) ?? [] }));
}

export function stallSections(category: string, items: { section?: string }[], extra: string[] = []) {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const key of [...menuSectionsFor(category), ...extra, ...items.map((i) => i.section?.trim() || "")]) {
    if (!key || seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  return keys;
}

/** Papers a real stall would put on the wall. */
export const STALL_PAPERS: Record<string, { id: string; label: string }[]> = {
  food: [
    { id: "fssai", label: "FSSAI" },
    { id: "gst", label: "GST" },
    { id: "shop", label: "Shop licence" },
  ],
  fashion: [
    { id: "gst", label: "GST" },
    { id: "msme", label: "MSME" },
  ],
  beauty: [
    { id: "gst", label: "GST" },
    { id: "cosmet", label: "Cosmetic licence" },
  ],
  electronics: [
    { id: "gst", label: "GST" },
    { id: "shop", label: "Shop licence" },
  ],
  home: [
    { id: "gst", label: "GST" },
    { id: "msme", label: "MSME" },
  ],
  arts: [
    { id: "gst", label: "GST" },
    { id: "msme", label: "MSME" },
  ],
};

export function papersFor(category: string) {
  return STALL_PAPERS[category] ?? [
    { id: "gst", label: "GST" },
    { id: "shop", label: "Shop licence" },
  ];
}

export function paperLabels(ids: string[] | undefined, category: string) {
  const known = papersFor(category);
  return (ids ?? [])
    .map((id) => known.find((p) => p.id === id)?.label ?? id)
    .filter(Boolean);
}
