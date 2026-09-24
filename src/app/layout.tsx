import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
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
      <body className={`${newsreader.variable} ${jakarta.variable}`}>
        {children}
      </body>
    </html>
  );
}
