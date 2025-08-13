/*
  Warnings:

  - You are about to drop the column `classId` on the `PackageBooking` table. All the data in the column will be lost.
  - You are about to drop the column `redeemed` on the `PackageBooking` table. All the data in the column will be lost.
  - You are about to drop the column `redeemedAt` on the `PackageBooking` table. All the data in the column will be lost.
  - Added the required column `classesRemaining` to the `PackageBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PackageBooking" DROP CONSTRAINT "PackageBooking_classId_fkey";

-- AlterTable
ALTER TABLE "PackageBooking" DROP COLUMN "classId",
DROP COLUMN "redeemed",
DROP COLUMN "redeemedAt",
ADD COLUMN     "classesRemaining" INTEGER NOT NULL,
ADD COLUMN     "classesUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PackageRedemption" (
    "id" SERIAL NOT NULL,
    "packageBookingId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageRedemption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageRedemption" ADD CONSTRAINT "PackageRedemption_packageBookingId_fkey" FOREIGN KEY ("packageBookingId") REFERENCES "PackageBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageRedemption" ADD CONSTRAINT "PackageRedemption_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
