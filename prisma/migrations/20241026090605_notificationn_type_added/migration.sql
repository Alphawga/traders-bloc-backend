/*
  Warnings:

  - Added the required column `type` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "type" "NotificationType" NOT NULL;
