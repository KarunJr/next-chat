/*
  Warnings:

  - You are about to drop the column `status` on the `Friendship` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "status",
ADD COLUMN     "stats" "FriendshipStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text';
