import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acuity",
  description: "AI-driven personal wealth command center",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg" },
  appleWebApp: {
    capable: true,
    title: "Acuity",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#7a0e0e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${manrope.variable}`}>
      <body className="overflow-x-hidden text-[var(--text-1)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}