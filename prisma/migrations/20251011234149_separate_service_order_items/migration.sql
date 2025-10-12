-- AlterTable
ALTER TABLE "service_order_items" ALTER COLUMN "serviceOrderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "service_order_items_serviceOrderId_idx" ON "service_order_items"("serviceOrderId");
