-- AlterTable
ALTER TABLE "CutoffConfig" ADD COLUMN     "deliveryWindowEnd" TEXT NOT NULL DEFAULT '22:00',
ADD COLUMN     "deliveryWindowStart" TEXT NOT NULL DEFAULT '16:00';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deliveryTime" TEXT;
