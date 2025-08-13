/*
  Warnings:

  - Added the required column `expiresAt` to the `PackageBooking` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `PackageBooking` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PackageBooking" DROP CONSTRAINT "PackageBooking_userId_fkey";

-- AlterTable
ALTER TABLE "ClassPackage" ADD COLUMN     "expiresInDays" INTEGER NOT NULL DEFAULT 90;

-- AlterTable
ALTER TABLE "PackageBooking" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
