/*
  Warnings:

  - A unique constraint covering the columns `[hashId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,hashId]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "hashId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_hashId_key" ON "Conversation"("hashId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_name_hashId_key" ON "Conversation"("name", "hashId");
