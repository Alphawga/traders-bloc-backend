-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "assigned_to_id" TEXT,
ADD COLUMN     "second_level_co_sign_id" TEXT;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_second_level_co_sign_id_fkey" FOREIGN KEY ("second_level_co_sign_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
