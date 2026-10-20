import type { Metadata, Viewport } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { StoreProvider } from "@/lib/store";
import { NijiRoot } from "@/components/niji-root";
import "./globals.css";

const dm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Niji — Own Your Vibe",
  description:
    "A privacy-first social house — sealed messaging, time-bound media, and trusted local commerce.",
  icons: { icon: "/favicon.svg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Niji",
  },
};

export const viewport: Viewport = {
  themeColor: "#EBEBEC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${dm.variable} ${display.variable} ${jetbrains.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="bg-paper min-h-full text-foreground overscroll-none">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <TooltipProvider>
            <StoreProvider>
              <NijiRoot>{children}</NijiRoot>
              <Toaster theme="light" />
            </StoreProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
