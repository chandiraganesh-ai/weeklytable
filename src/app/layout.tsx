import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Loaded globally so the CSS variables exist everywhere, but the
// font-family/color utilities themselves are only applied on the
// customer-facing page wrappers (see page.tsx, order-confirmed/page.tsx) —
// the admin panel intentionally keeps its existing plain styling.
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["500", "600"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Weekly Table",
  description: "Pre-order home-cooked meals for delivery, chosen by the week.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Decorative icons on the customer-facing pages only (see
            src/components/Icon.tsx) — loaded globally like the fonts above,
            inert unless a page actually references material-symbols-outlined. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${newsreader.variable} ${jakarta.variable}`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
