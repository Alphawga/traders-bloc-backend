/*
  Warnings:

  - You are about to drop the column `amount` on the `FundingRequest` table. All the data in the column will be lost.
  - Added the required column `requested_amount` to the `FundingRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `your_contribution` to the `FundingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FundingRequest" DROP COLUMN "amount",
ADD COLUMN     "requested_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "your_contribution" DOUBLE PRECISION NOT NULL;
