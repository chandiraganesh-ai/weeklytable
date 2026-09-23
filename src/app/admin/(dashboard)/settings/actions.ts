"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/dal";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function updateCutoffConfig(formData: FormData) {
  await requireAdminSession();
  const leadDays = Number(formData.get("leadDays"));
  const cutoffTime = String(formData.get("cutoffTime") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();

  if (!Number.isFinite(leadDays) || leadDays < 1) {
    throw new Error("Lead days must be a positive number.");
  }
  if (!TIME_RE.test(cutoffTime)) {
    throw new Error("Cutoff time must be in HH:MM (24h) format.");
  }
  if (!timezone) {
    throw new Error("Timezone is required.");
  }

  await prisma.cutoffConfig.upsert({
    where: { id: "default" },
    update: { leadDays, cutoffTime, timezone },
    create: { id: "default", leadDays, cutoffTime, timezone },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
