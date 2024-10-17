/*
  Warnings:

  - Made the column `milestone_id` on table `FundingRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FundingRequest" DROP CONSTRAINT "FundingRequest_milestone_id_fkey";

-- AlterTable
ALTER TABLE "FundingRequest" ALTER COLUMN "milestone_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "Milestone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
