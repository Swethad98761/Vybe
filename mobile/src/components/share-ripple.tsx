import { useEffect, useRef, type ReactNode } from "react";
import { Animated, View } from "react-native";

/** Rings play on the share mark itself — same idea as a comment going bold. */
export function ShareRipple({
  play,
  onDone,
  children,
}: {
  play?: boolean;
  onDone?: () => void;
  children: ReactNode;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!play) return;
    a.setValue(0);
    Animated.timing(a, { toValue: 1, duration: 720, useNativeDriver: true }).start(() => onDone?.());
  }, [a, play, onDone]);

  return (
    <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
      {play
        ? [0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              pointerEvents="none"
              style={{
                position: "absolute",
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 1.6,
                borderColor: "#111114",
                opacity: a.interpolate({ inputRange: [0, 1], outputRange: [0.85 - i * 0.14, 0] }),
                transform: [
                  {
                    scale: a.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1.7 + i * 0.22],
                    }),
                  },
                ],
              }}
            />
          ))
        : null}
      {children}
    </View>
  );
}
