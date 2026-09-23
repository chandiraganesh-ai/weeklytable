"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/dal";

function readDishFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const dietaryTagRaw = String(formData.get("dietaryTag") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!name || !category || !description || !imageUrl) {
    throw new Error("Name, category, description, and image URL are required.");
  }

  return {
    name,
    category,
    dietaryTag: dietaryTagRaw === "" ? null : dietaryTagRaw,
    description,
    imageUrl,
    isActive,
  };
}

export async function createDish(formData: FormData) {
  await requireAdminSession();
  const data = readDishFields(formData);
  await prisma.dish.create({ data });
  revalidatePath("/admin/dishes");
  revalidatePath("/");
  redirect("/admin/dishes");
}

export async function updateDish(dishId: string, formData: FormData) {
  await requireAdminSession();
  const data = readDishFields(formData);
  await prisma.dish.update({ where: { id: dishId }, data });
  revalidatePath("/admin/dishes");
  revalidatePath("/");
  redirect("/admin/dishes");
}

export async function toggleDishActive(dishId: string, isActive: boolean) {
  await requireAdminSession();
  await prisma.dish.update({ where: { id: dishId }, data: { isActive } });
  revalidatePath("/admin/dishes");
  revalidatePath("/");
}
