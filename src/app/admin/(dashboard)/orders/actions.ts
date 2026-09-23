"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/dal";

const MANUAL_STATUSES = ["fulfilled", "cancelled"] as const;
type ManualStatus = (typeof MANUAL_STATUSES)[number];

function isManualStatus(value: string): value is ManualStatus {
  return (MANUAL_STATUSES as readonly string[]).includes(value);
}

// Payment status ("paid") is webhook-controlled and never set here —
// this only handles the real-world, human-decided statuses.
export async function setOrderStatus(orderId: string, status: string) {
  await requireAdminSession();
  if (!isManualStatus(status)) {
    throw new Error(`Cannot manually set status to "${status}".`);
  }
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
