-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "admin_id" TEXT,
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "paid_at" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
