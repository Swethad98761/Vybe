import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { pic } from "@/lib/media";
import { RING_SOFT_MS, RING_STROKE, ringPad, ringPair, type RingPlace } from "@/lib/ring";
import type { User } from "@/lib/types";
import { raised } from "@/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function Rings({
  size,
  hold,
  fade,
}: {
  size: number;
  hold: string | null;
  fade: string | null;
}) {
  const dual = Boolean(hold && fade);
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!dual) {
      breath.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: RING_SOFT_MS / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: RING_SOFT_MS / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [dual, breath]);

  if (!hold && !fade) return null;
  const pad = ringPad(Boolean(hold), Boolean(fade));
  const box = size + pad;
  const mid = box / 2;
  const r = (box - RING_STROKE) / 2 - 0.2;
  const aOp = dual ? breath.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }) : 1;
  const bOp = breath.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.92] });
  return (
    <Svg width={box} height={box} style={{ position: "absolute", left: 0, top: 0 }} pointerEvents="none">
      {hold ? (
        dual ? (
          <AnimatedCircle
            cx={mid}
            cy={mid}
            r={r}
            fill="none"
            stroke={hold}
            strokeWidth={RING_STROKE}
            opacity={aOp}
          />
        ) : (
          <Circle cx={mid} cy={mid} r={r} fill="none" stroke={hold} strokeWidth={RING_STROKE} />
        )
      ) : null}
      {fade ? (
        <AnimatedCircle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={fade}
          strokeWidth={RING_STROKE}
          opacity={bOp}
        />
      ) : null}
    </Svg>
  );
}

export function Avatar({
  user,
  size = 42,
  mark,
  around,
  pulse,
  vybeOn = true,
  story,
  place,
}: {
  user?: User;
  size?: number;
  mark?: string;
  around?: boolean;
  pulse?: boolean;
  seen?: boolean;
  vybeOn?: boolean;
  story?: boolean;
  place?: RingPlace;
}) {
  const source = pic(user?.photo);
  const live =
    around !== undefined ? around : place === "vybe" ? Boolean(user?.online) : false;
  const { hold, fade } = ringPair({
    place: story ? "story" : place,
    around: live,
    pulse: Boolean(pulse),
    verified: Boolean(user?.verified),
    vybeOn,
  });
  const pad = ringPad(Boolean(hold), Boolean(fade));
  const box = size + pad;
  return (
    <View
      style={{
        width: box,
        height: box,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Rings size={size} hold={hold} fade={fade} />
      <View
        style={[
          raised(1),
          {
            width: size,
            height: size,
            borderRadius: size,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        {source ? (
          <Image source={source} style={{ width: size, height: size }} />
        ) : (
          <Text style={{ fontSize: size * 0.4 }}>{user?.emoji ?? mark ?? "🙂"}</Text>
        )}
      </View>
    </View>
  );
}
