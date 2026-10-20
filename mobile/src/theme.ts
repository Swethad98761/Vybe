import { Platform, type ViewStyle, type TextStyle } from "react-native";

/**
 * Niji reads as machined white, not flat white. Every surface is a warm off-white
 * with a lit top edge and a shadow underneath, the way the brand artwork is lit.
 */
export const c = {
  /**
   * The one paper tone. tools/level-paper.py lands the artwork's page on this exact
   * value, so art and interface are the same material with no brightness step at the
   * seam. Never pure white — the artwork never is.
   */
  paper: "#EBEBEC",
  paperDeep: "#E1E1E3",
  paperSunk: "#D7D7DA",
  card: "#F7F7F8",
  cardTop: "#FFFFFF",
  ink: "#17171A",
  inkSoft: "#65656B",
  inkFaint: "#9B9AA0",
  inkGhost: "#BFBEC3",
  line: "rgba(23,23,26,0.08)",
  lineSoft: "rgba(23,23,26,0.05)",
  lit: "rgba(255,255,255,0.92)",
  chromeLight: "#FFFFFF",
  chromeMid: "#CFCFD3",
  chromeDark: "#A6A6AB",
  saffron: "#FF9933",
  /** Brighter than the gem so a circuit can glow on paper. */
  saffronLit: "#FFB056",
  green: "#138808",
  greenLit: "#3DCC6E",
  danger: "#C0392B",
} as const;

export const chromeGradient = [c.chromeLight, c.chromeMid, "#F4F3F0", c.chromeDark] as const;

export const type = {
  caps: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: c.inkFaint,
    fontWeight: "500",
  } as TextStyle,
  title: { fontSize: 21, letterSpacing: -0.4, color: c.ink, fontWeight: "600" } as TextStyle,
  body: { fontSize: 15, lineHeight: 21, color: c.ink } as TextStyle,
  soft: { fontSize: 13, lineHeight: 18, color: c.inkSoft } as TextStyle,
  meta: { fontSize: 11, color: c.inkFaint } as TextStyle,
};

/** A panel sitting on the paper: lit along the top, shadow pooling below. */
export function raised(depth: 1 | 2 | 3 = 1): ViewStyle {
  const map = {
    1: { radius: 10, y: 4, opacity: 0.07, elevation: 2 },
    2: { radius: 18, y: 9, opacity: 0.1, elevation: 5 },
    3: { radius: 30, y: 16, opacity: 0.14, elevation: 10 },
  }[depth];
  return {
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.lit,
    ...Platform.select({
      ios: {
        shadowColor: "#191922",
        shadowOpacity: map.opacity,
        shadowRadius: map.radius,
        shadowOffset: { width: 0, height: map.y },
      },
      android: { elevation: map.elevation },
      default: {
        boxShadow: `0 ${map.y}px ${map.radius}px rgba(25,25,34,${map.opacity})`,
      },
    }),
  };
}

/** A groove pressed into the paper — used for fields and the encryption rail. */
export const sunk: ViewStyle = {
  backgroundColor: c.paperDeep,
  borderTopWidth: 1,
  borderTopColor: "rgba(23,23,26,0.07)",
  borderBottomWidth: 1,
  borderBottomColor: c.lit,
};

export const hairline: ViewStyle = {
  height: 1,
  backgroundColor: c.line,
};
