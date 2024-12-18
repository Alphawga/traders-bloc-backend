/*
  Warnings:

  - You are about to drop the column `role` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AdminToPermission" DROP CONSTRAINT "_AdminToPermission_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToPermission" DROP CONSTRAINT "_AdminToPermission_B_fkey";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "role";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "_AdminToPermission";

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "permission_id" TEXT,
    "role_name" TEXT,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource_id" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "built_in" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "permission_role" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "role_name" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "permission_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "claims_active_type_role_name_idx" ON "claims"("active", "type", "role_name");

-- CreateIndex
CREATE UNIQUE INDEX "claims_user_id_role_name_key" ON "claims"("user_id", "role_name");

-- CreateIndex
CREATE UNIQUE INDEX "claims_user_id_permission_id_key" ON "claims"("user_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_id_action_module_key" ON "permissions"("resource_id", "action", "module");

-- CreateIndex
CREATE UNIQUE INDEX "permission_role_id_role_name_key" ON "permission_role"("id", "role_name");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_role" ADD CONSTRAINT "permission_role_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_role" ADD CONSTRAINT "permission_role_role_name_fkey" FOREIGN KEY ("role_name") REFERENCES "roles"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
