"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/dal";

function readPlanFields(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const mealCount = Number(formData.get("mealCount"));
  const priceGbpStr = String(formData.get("priceGbp") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  const isActive = formData.get("isActive") === "on";

  if (!label || !Number.isFinite(mealCount) || mealCount < 1) {
    throw new Error("Label and a valid meal count are required.");
  }
  const priceGbp = Math.round(Number(priceGbpStr) * 100);
  if (!Number.isFinite(priceGbp) || priceGbp < 0) {
    throw new Error("A valid price is required.");
  }

  return { label, mealCount, priceGbp, sortOrder, isActive };
}

export async function createPlan(formData: FormData) {
  await requireAdminSession();
  const data = readPlanFields(formData);
  await prisma.plan.create({ data });
  revalidatePath("/admin/plans");
  revalidatePath("/");
  redirect("/admin/plans");
}

export async function updatePlan(planId: string, formData: FormData) {
  await requireAdminSession();
  const data = readPlanFields(formData);
  await prisma.plan.update({ where: { id: planId }, data });
  revalidatePath("/admin/plans");
  revalidatePath("/");
  redirect("/admin/plans");
}

export async function togglePlanActive(planId: string, isActive: boolean) {
  await requireAdminSession();
  await prisma.plan.update({ where: { id: planId }, data: { isActive } });
  revalidatePath("/admin/plans");
  revalidatePath("/");
}
