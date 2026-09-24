-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('stripe', 'cash');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'stripe',
ALTER COLUMN "stripeCheckoutSessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "fulfilled" BOOLEAN NOT NULL DEFAULT false;
