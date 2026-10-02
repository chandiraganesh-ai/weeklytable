import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@/generated/prisma/enums";

export type AdminSession = {
  adminId: string;
  email: string;
  role: AdminRole;
};

// The authoritative check — called from every admin Server Action and
// Route Handler, not just relied on via Proxy's optimistic redirect (see
// src/proxy.ts). Proxy only verifies the JWT signature; this also reads
// the admin's CURRENT role/isActive from the database, so a role change
// or deactivation takes effect immediately rather than waiting for the
// (up to 7-day) session to expire. Memoized per-request so calling it
// repeatedly in one render/action pass is free.
export const requireAdminSession = cache(async (): Promise<AdminSession> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: session.adminId },
    select: { role: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  return { adminId: session.adminId, email: session.email, role: admin.role };
});

// Where to land a signed-in admin who isn't allowed on the page/action they
// just hit — always a page every role can reach, so this can never loop.
function fallbackPathForRole(role: AdminRole): string {
  return role === "delivery" ? "/admin/orders/upcoming" : "/admin/orders";
}

/**
 * Role-gated session check. Use in place of requireAdminSession() wherever
 * a page or Server Action should only be reachable by specific roles.
 */
export async function requireRole(allowed: AdminRole[]): Promise<AdminSession> {
  const session = await requireAdminSession();
  if (!allowed.includes(session.role)) {
    redirect(fallbackPathForRole(session.role));
  }
  return session;
}
