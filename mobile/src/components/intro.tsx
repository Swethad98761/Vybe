import { useEffect, useRef } from "react";
import { Animated, Easing, Image, Platform, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { useStage } from "@/lib/frame";
import { brand } from "@/lib/media";
import { c } from "@/theme";

const native = Platform.OS !== "web";

const STORY_MS = 2000;
const LOCKUP_MS = 1500;
const LOCKUP_MIN_MS = 180;
const ART_RATIO = 768 / 1376;
/** Mountain soles in the story art. Scale so that line hits the screen floor
 *  while the globe stays flush with the top — no paper bar above the art. */
const STORY_MOUNTAIN = 0.948;

type Phase = "story" | "lockup" | "done";

function coverSize(width: number, height: number) {
  const artWidth = Math.max(width, height * ART_RATIO);
  const artHeight = Math.max(height, artWidth / ART_RATIO);
  return { artWidth, artHeight };
}

function storySize(width: number, height: number) {
  const artHeight = height / STORY_MOUNTAIN;
  const artWidth = artHeight * ART_RATIO;
  if (artWidth >= width) return { artWidth, artHeight };
  return { artWidth: width, artHeight: width / ART_RATIO };
}

export function CinematicIntro({ onDone }: { onDone: () => void }) {
  const { width, height } = useStage();
  const { artWidth, artHeight } = coverSize(width, height);
  const story = storySize(width, height);

  const storyFade = useRef(new Animated.Value(1)).current;
  const lockFade = useRef(new Animated.Value(0)).current;
  const phase = useRef<Phase>("story");
  const lockupAt = useRef(0);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useRef(() => {});
  const toLockup = useRef(() => {});

  finish.current = () => {
    if (phase.current !== "lockup") return;
    if (Date.now() < lockupAt.current + LOCKUP_MIN_MS) return;
    phase.current = "done";
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    Animated.timing(lockFade, {
      toValue: 0,
      duration: 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: native,
    }).start(() => onDone());
  };

  toLockup.current = () => {
    if (phase.current !== "story") return;
    phase.current = "lockup";
    lockupAt.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});
    Animated.parallel([
      Animated.timing(storyFade, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: native,
      }),
      Animated.timing(lockFade, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: native,
      }),
    ]).start();
    dwellTimer.current = setTimeout(() => finish.current(), LOCKUP_MS);
  };

  useEffect(() => {
    const storyTimer = setTimeout(() => toLockup.current(), STORY_MS);
    return () => {
      clearTimeout(storyTimer);
      if (dwellTimer.current) clearTimeout(dwellTimer.current);
    };
  }, []);

  const lockupFrame = {
    position: "absolute" as const,
    top: (height - artHeight) / 2,
    left: (width - artWidth) / 2,
    width: artWidth,
    height: artHeight,
  };
  const storyFrame = {
    position: "absolute" as const,
    top: 0,
    left: (width - story.artWidth) / 2,
    width: story.artWidth,
    height: story.artHeight,
  };

  return (
    <Pressable
      style={{ flex: 1, backgroundColor: c.paper, overflow: "hidden" }}
      onPress={() => {
        if (phase.current === "story") toLockup.current();
        else if (phase.current === "lockup") finish.current();
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: storyFade }]}>
        <Image source={brand.story} style={storyFrame} resizeMode="cover" />
      </Animated.View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: lockFade,
            backgroundColor: c.paper,
            pointerEvents: "none",
          },
        ]}
      >
        <Image source={brand.lockup} style={lockupFrame} resizeMode="cover" />
      </Animated.View>
    </Pressable>
  );
}
