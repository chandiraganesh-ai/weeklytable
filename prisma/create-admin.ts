// One-off admin account creation — no public signup exists by design. Used
// to bootstrap the first owner account (the in-app /admin/users page,
// owner-only, handles everything after that).
// Usage: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... [ADMIN_ROLE=owner|kitchen|delivery] npx tsx prisma/create-admin.ts
// Re-running with the same email updates that admin's password (and role,
// if ADMIN_ROLE is set).

import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { AdminRole } from "../src/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const VALID_ROLES = new Set(Object.values(AdminRole));

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const role = process.env.ADMIN_ROLE ?? "owner";

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
    process.exit(1);
  }
  if (!VALID_ROLES.has(role as AdminRole)) {
    console.error(`ADMIN_ROLE must be one of: ${[...VALID_ROLES].join(", ")}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, role: role as AdminRole, isActive: true },
    create: { email, passwordHash, role: role as AdminRole },
  });

  console.log(`Admin user ready: ${admin.email} (${admin.role})`);
  await prisma.$disconnect();
}

main();
