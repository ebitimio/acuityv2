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
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
    shortcut: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Acuity",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f9" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Sets data-theme before paint to avoid a flash of the wrong theme.
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem("acuity:theme");
    var resolved = stored;
    if (!resolved || resolved === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.dataset.theme = resolved;
  } catch (e) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="overflow-x-hidden text-[var(--text-1)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
