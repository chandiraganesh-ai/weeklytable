import Link from "next/link";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/contact";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
];

// Shared chrome for every customer-facing page (Home, How It Works, Order,
// Contact, order confirmation) — the admin panel has its own separate
// layout under admin/(dashboard) and is untouched by this.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-espresso antialiased">
      <header className="sticky top-0 z-20 border-b border-card-border bg-cream/90 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/" className="font-serif text-lg font-medium text-espresso">
            Weekly Table
          </Link>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-espresso/70">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-terracotta">
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/order"
            className="rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-terracotta-dark hover:shadow-md"
          >
            Order now
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-card-border bg-cream-dim/40 px-6 py-8 text-sm text-espresso/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-serif text-base font-medium text-espresso">Weekly Table</p>
            <p>Home-cooked meals, delivered when you want them.</p>
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-end">
            <a href={SUPPORT_PHONE_TEL} className="transition hover:text-terracotta">
              {SUPPORT_PHONE_DISPLAY}
            </a>
            <p>&copy; {new Date().getFullYear()} Weekly Table</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
