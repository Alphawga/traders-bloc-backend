-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "can_create_invoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kyc_status" "KYCStatus" NOT NULL DEFAULT 'PENDING';
