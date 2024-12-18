/*
  Warnings:

  - You are about to drop the column `cosigned_at` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `is_cosigned` on the `Milestone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "assigned_by_id" TEXT;

-- AlterTable
ALTER TABLE "Milestone" DROP COLUMN "cosigned_at",
DROP COLUMN "is_cosigned";

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
