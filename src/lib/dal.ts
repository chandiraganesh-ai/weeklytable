import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME, type SessionPayload } from "@/lib/session";

// The authoritative session check — called from every admin Server Action
// and Route Handler, not just relied on via Proxy's optimistic redirect
// (see src/proxy.ts). Memoized per-request so calling it repeatedly in one
// render/action pass is free.
export const requireAdminSession = cache(
  async (): Promise<SessionPayload> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      redirect("/admin/login");
    }

    return session;
  },
);
