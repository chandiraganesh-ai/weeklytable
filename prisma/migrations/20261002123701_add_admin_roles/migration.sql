-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('owner', 'kitchen', 'delivery');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'owner';
