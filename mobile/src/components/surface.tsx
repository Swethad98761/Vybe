import { View, type ViewProps, type ViewStyle } from "react-native";
import { c, raised } from "@/theme";

/**
 * Paper base for every screen: one flat tone, edge to edge, no gradient.
 * Depth comes from the panels sitting on it, so brand artwork can butt straight
 * against this colour with no visible seam.
 */
export function Paper({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[{ flex: 1, backgroundColor: c.paper }, style]} {...rest}>
      {children}
    </View>
  );
}

export function Card({
  depth = 1,
  radius = 18,
  style,
  children,
  ...rest
}: ViewProps & { depth?: 1 | 2 | 3; radius?: number }) {
  return (
    <View style={[raised(depth), { borderRadius: radius }, style]} {...rest}>
      {children}
    </View>
  );
}

/** A groove pressed into the paper. Reads as machined, not as an outlined box. */
export function Groove({
  radius = 14,
  style,
  children,
  ...rest
}: ViewProps & { radius?: number }) {
  return (
    <View
      style={[
        {
          backgroundColor: c.paperDeep,
          borderRadius: radius,
          borderTopWidth: 1,
          borderTopColor: "rgba(23,23,26,0.08)",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.85)",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function Hairline({ style }: { style?: ViewStyle }) {
  return (
    <View style={[{ height: 1, backgroundColor: c.line }, style]}>
      <View style={{ height: 1, marginTop: 1, backgroundColor: "rgba(255,255,255,0.75)" }} />
    </View>
  );
}
