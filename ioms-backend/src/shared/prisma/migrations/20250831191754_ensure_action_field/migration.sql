/*
  Warnings:

  - You are about to drop the column `environment` on the `outage_history` table. All the data in the column will be lost.
  - Added the required column `action` to the `outage_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "outage_history" DROP COLUMN "environment",
ADD COLUMN     "action" TEXT NOT NULL;
