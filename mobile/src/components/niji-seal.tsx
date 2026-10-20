import { useMemo } from "react";
import { Image, View } from "react-native";
import Svg, { G, Path, Rect } from "react-native-svg";
import { circuitQr } from "@/lib/niji-qr";
import { brand } from "@/lib/media";
import { c } from "@/theme";

export function NijiSeal({ value, size = 220 }: { value: string; size?: number }) {
  const layout = useMemo(() => circuitQr(value, size), [value, size]);
  const { cell, pad, pads, traces, finders } = layout;

  return (
    <View style={{ width: size, height: size, borderRadius: 28, overflow: "hidden" }}>
      <Image source={brand.mark} style={{ position: "absolute", width: size, height: size }} resizeMode="cover" />
      <View style={{ position: "absolute", width: size, height: size, backgroundColor: "rgba(247,247,248,0.58)" }} />
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {finders.map((f, i) => {
          const x = pad + f.x * cell;
          const y = pad + f.y * cell;
          const box = cell * 7;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={box} height={box} rx={cell * 1.05} fill={c.ink} />
              <Rect x={x + cell} y={y + cell} width={cell * 5} height={cell * 5} rx={cell * 0.65} fill={c.card} />
              <Rect x={x + cell * 2} y={y + cell * 2} width={cell * 3} height={cell * 3} rx={cell * 0.4} fill={c.ink} />
            </G>
          );
        })}
        {traces ? <Path d={traces} fill={c.ink} /> : null}
        {pads ? <Path d={pads} fill={c.ink} /> : null}
      </Svg>
    </View>
  );
}
