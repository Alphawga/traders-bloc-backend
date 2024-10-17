/*
  Warnings:

  - A unique constraint covering the columns `[user_id,document_type]` on the table `KYCDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KYCDocument_user_id_document_type_key" ON "KYCDocument"("user_id", "document_type");
