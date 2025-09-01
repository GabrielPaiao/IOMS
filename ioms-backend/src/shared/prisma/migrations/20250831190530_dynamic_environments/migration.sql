/*
  Warnings:

  - You are about to drop the column `action` on the `outage_history` table. All the data in the column will be lost.
  - Changed the type of `environment` on the `application_environments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `environment` on the `outage_environments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `environment` to the `outage_history` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "application_environments" DROP COLUMN "environment",
ADD COLUMN     "environment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "outage_environments" DROP COLUMN "environment",
ADD COLUMN     "environment" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "outage_history" DROP COLUMN "action",
ADD COLUMN     "environment" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Environment";

-- CreateIndex
CREATE UNIQUE INDEX "outage_environments_outageId_environment_key" ON "outage_environments"("outageId", "environment");
