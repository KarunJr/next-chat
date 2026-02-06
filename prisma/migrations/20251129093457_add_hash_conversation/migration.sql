/*
  Warnings:

  - A unique constraint covering the columns `[hashId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,hashId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "hashId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_hashId_key" ON "Conversation"("hashId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_name_hashId_key" ON "Conversation"("name", "hashId");
