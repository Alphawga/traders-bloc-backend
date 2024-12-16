-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "assigned_by_id" TEXT;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
