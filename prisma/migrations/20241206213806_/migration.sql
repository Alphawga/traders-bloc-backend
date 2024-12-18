/*
  Warnings:

  - You are about to drop the column `resource_id` on the `permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[action,module]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "permissions_resource_id_action_module_key";

-- AlterTable
ALTER TABLE "permissions" DROP COLUMN "resource_id";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_action_module_key" ON "permissions"("action", "module");
