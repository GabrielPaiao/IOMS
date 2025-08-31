/*
  Warnings:

  - You are about to drop the column `owner` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `technology` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "owner",
DROP COLUMN "technology";

-- CreateTable
CREATE TABLE "application_key_users" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "application_key_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_key_users_applicationId_userId_key" ON "application_key_users"("applicationId", "userId");

-- AddForeignKey
ALTER TABLE "application_key_users" ADD CONSTRAINT "application_key_users_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_key_users" ADD CONSTRAINT "application_key_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
