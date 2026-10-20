import { Platform, useWindowDimensions } from "react-native";

/** On a wide desktop preview the stage is a 390×844 phone, not the browser. */
export const STAGE_W = 390;
export const STAGE_H = 844;

export function useStage() {
  const win = useWindowDimensions();
  const framed = Platform.OS === "web" && win.width > 520;
  return {
    framed,
    width: framed ? STAGE_W : win.width,
    height: framed ? STAGE_H : win.height,
  };
}
