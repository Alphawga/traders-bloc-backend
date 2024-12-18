-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "assigned_admin_id" TEXT;

-- CreateIndex
CREATE INDEX "Invoice_assigned_admin_id_idx" ON "Invoice"("assigned_admin_id");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
