/*
  Warnings:

  - You are about to drop the column `hashId` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Conversation_hashId_key";

-- DropIndex
DROP INDEX "Conversation_name_hashId_key";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "hashId";
