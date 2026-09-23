import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { requireAdminSession } from "@/lib/dal";

const NAV_LINKS = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/dishes", label: "Dishes" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check — see src/proxy.ts for the optimistic redirect and
  // src/lib/dal.ts for why both exist.
  await requireAdminSession();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3">
        <nav className="flex gap-4 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-700 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
