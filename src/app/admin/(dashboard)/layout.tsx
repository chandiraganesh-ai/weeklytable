import Link from "next/link";
import LogoutButton from "@/components/admin/LogoutButton";
import { requireAdminSession } from "@/lib/dal";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative check — see src/proxy.ts for the optimistic redirect and
  // src/lib/dal.ts for why both exist.
  const session = await requireAdminSession();

  const navLinks = [
    ...(session.role !== "delivery"
      ? [{ href: "/admin/orders", label: "Orders" }]
      : []),
    { href: "/admin/orders/upcoming", label: "Upcoming deliveries" },
    ...(session.role === "owner"
      ? [
          { href: "/admin/dishes", label: "Dishes" },
          { href: "/admin/plans", label: "Plans" },
          { href: "/admin/settings", label: "Settings" },
          { href: "/admin/users", label: "Admin users" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 print:hidden">
        <nav className="flex gap-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-neutral-700 hover:text-neutral-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span>
            {session.email} <span className="text-neutral-400">({session.role})</span>
          </span>
          <LogoutButton />
        </div>
      </header>
      <main className="p-6 print:p-0">{children}</main>
    </div>
  );
}
