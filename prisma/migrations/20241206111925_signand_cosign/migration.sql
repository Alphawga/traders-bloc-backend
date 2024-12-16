-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "cosigned_at" TIMESTAMP(3),
ADD COLUMN     "cosigned_by_id" TEXT,
ADD COLUMN     "is_cosigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "payment_approved_at" TIMESTAMP(3),
ADD COLUMN     "payment_approved_by_id" TEXT,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_cosigned_by_id_fkey" FOREIGN KEY ("cosigned_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_payment_approved_by_id_fkey" FOREIGN KEY ("payment_approved_by_id") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
