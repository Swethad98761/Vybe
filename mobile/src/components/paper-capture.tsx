import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

/** Block a capture where the OS allows. A screenshot that still lands tells the paper. */
export function usePaperCapture(on: boolean, onAttempt: (kind: "screenshot" | "record") => void) {
  useEffect(() => {
    if (!on) return;
    ScreenCapture.requestPermissionsAsync().catch(() => {});
    ScreenCapture.preventScreenCaptureAsync("niji-thread").catch(() => {});
    ScreenCapture.enableAppSwitcherProtectionAsync(0.55).catch(() => {});
    const sub = ScreenCapture.addScreenshotListener(() => onAttempt("screenshot"));
    return () => {
      sub.remove();
      ScreenCapture.allowScreenCaptureAsync("niji-thread").catch(() => {});
      ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
    };
  }, [on, onAttempt]);
}
