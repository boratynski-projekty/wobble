import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Geometryczny grotesk zgodnie z briefem designerskim (DESIGN-PROMPT.md).
// Jeden krój dla całej aplikacji — do podmiany, jeśli designer wskaże inny.
const sans = Outfit({
  variable: "--font-sans-app",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Wobble",
  description:
    "Planner dzienny dla tych, którzy odkładają na później. Twoje zadania to klocki w chwiejnej wieży.",
  applicationName: "Wobble",
};

export const viewport: Viewport = {
  // Wieża jest głównym obiektem ekranu — blokujemy zoom, żeby gesty na klockach
  // nie kolidowały z pinch-zoomem przeglądarki.
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1614" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
