import { View, Text } from "react-native";
import { c } from "@/theme";

const gems = [c.saffron, "#FFFFFF", c.green];

/** Typeset niji: dotless stems with the tricolour set above them. */
export function Wordmark({ size = 18 }: { size?: number }) {
  const gem = Math.max(4, Math.round(size * 0.3));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
      <Text
        style={{
          fontSize: size,
          color: c.ink,
          fontWeight: "600",
          letterSpacing: -0.6,
        }}
      >
        n
      </Text>
      {gems.map((color, i) => (
        <View key={i} style={{ alignItems: "center" }}>
          <View
            style={{
              width: gem,
              height: gem,
              borderRadius: gem,
              backgroundColor: color,
              marginBottom: size * 0.08,
              borderWidth: color === "#FFFFFF" ? 1 : 0,
              borderColor: "rgba(23,23,26,0.16)",
            }}
          />
          <Text
            style={{
              fontSize: size,
              color: c.ink,
              fontWeight: "600",
              letterSpacing: -0.6,
              lineHeight: size * 1.15,
            }}
          >
            {i === 1 ? "ȷ" : "ı"}
          </Text>
        </View>
      ))}
    </View>
  );
}
