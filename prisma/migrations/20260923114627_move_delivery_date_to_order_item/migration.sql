/*
  Warnings:

  - You are about to drop the column `deliveryDate` on the `Order` table. All the data in the column will be lost.
  - Added the required column `deliveryDate` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Order_deliveryDate_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deliveryDate";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "deliveryDate" DATE NOT NULL;

-- CreateIndex
CREATE INDEX "OrderItem_deliveryDate_idx" ON "OrderItem"("deliveryDate");
