/*
  Warnings:

  - You are about to drop the column `milestone_id` on the `FundingRequest` table. All the data in the column will be lost.
  - You are about to drop the `_FundingRequestToInvoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `invoice_id` to the `FundingRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FundingRequest" DROP CONSTRAINT "FundingRequest_milestone_id_fkey";

-- DropForeignKey
ALTER TABLE "_FundingRequestToInvoice" DROP CONSTRAINT "_FundingRequestToInvoice_A_fkey";

-- DropForeignKey
ALTER TABLE "_FundingRequestToInvoice" DROP CONSTRAINT "_FundingRequestToInvoice_B_fkey";

-- AlterTable
ALTER TABLE "FundingRequest" DROP COLUMN "milestone_id",
ADD COLUMN     "invoice_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "_FundingRequestToInvoice";

-- AddForeignKey
ALTER TABLE "FundingRequest" ADD CONSTRAINT "FundingRequest_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
