"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { AdminRole } from "@/generated/prisma/enums";

const VALID_ROLES = new Set(Object.values(AdminRole));

async function countActiveOwners(excludingId?: string) {
  return prisma.adminUser.count({
    where: {
      role: "owner",
      isActive: true,
      ...(excludingId ? { id: { not: excludingId } } : {}),
    },
  });
}

export async function createAdminUser(formData: FormData) {
  await requireRole(["owner"]);

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (!VALID_ROLES.has(role as AdminRole)) {
    throw new Error(`"${role}" is not a valid role.`);
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    throw new Error("An admin user with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({
    data: { email, passwordHash, role: role as AdminRole },
  });

  revalidatePath("/admin/users");
}

// Deactivating an admin ends their access immediately (requireAdminSession
// re-reads isActive on every request) without deleting their history.
export async function setAdminUserActive(adminId: string, isActive: boolean) {
  const session = await requireRole(["owner"]);

  if (!isActive) {
    if (adminId === session.adminId) {
      throw new Error("You can't deactivate your own account.");
    }
    const target = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { role: true },
    });
    if (target?.role === "owner" && (await countActiveOwners(adminId)) === 0) {
      throw new Error("Can't deactivate the last active owner.");
    }
  }

  await prisma.adminUser.update({ where: { id: adminId }, data: { isActive } });
  revalidatePath("/admin/users");
}

export async function updateAdminUserRole(adminId: string, role: string) {
  await requireRole(["owner"]);

  if (!VALID_ROLES.has(role as AdminRole)) {
    throw new Error(`"${role}" is not a valid role.`);
  }

  if (role !== "owner") {
    const target = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { role: true, isActive: true },
    });
    if (
      target?.role === "owner" &&
      target.isActive &&
      (await countActiveOwners(adminId)) === 0
    ) {
      throw new Error("Can't remove the last active owner's owner role.");
    }
  }

  await prisma.adminUser.update({
    where: { id: adminId },
    data: { role: role as AdminRole },
  });
  revalidatePath("/admin/users");
}
