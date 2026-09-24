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

// The only other place an Order's status may become "paid" besides the
// Stripe webhook — strictly gated to cash-on-delivery orders so this can
// never be used to shortcut a real Stripe payment's verification.
export async function markOrderPaidCash(orderId: string) {
  await requireAdminSession();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentMethod: true, status: true },
  });
  if (!order) throw new Error("Order not found.");
  if (order.paymentMethod !== "cash") {
    throw new Error("Only cash-on-delivery orders can be marked paid manually.");
  }
  if (order.status !== "pending_payment") {
    throw new Error(`Cannot mark paid from status "${order.status}".`);
  }
  await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

// Per-meal fulfillment — deliberately independent of the order-level
// "fulfilled" status. No auto-derivation either direction.
export async function toggleOrderItemFulfilled(orderItemId: string, fulfilled: boolean) {
  await requireAdminSession();
  const item = await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { fulfilled },
    select: { orderId: true },
  });
  revalidatePath(`/admin/orders/${item.orderId}`);
  revalidatePath("/admin/orders");
}
