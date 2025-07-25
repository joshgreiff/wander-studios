-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "waiverId" INTEGER;

-- CreateTable
CREATE TABLE "Waiver" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "emergencyContact" TEXT NOT NULL,
    "emergencyPhone" TEXT NOT NULL,
    "relationship" TEXT,
    "healthConditions" TEXT,
    "injuries" TEXT,
    "medications" TEXT,
    "isPregnant" BOOLEAN NOT NULL DEFAULT false,
    "pregnancyWeeks" INTEGER,
    "digitalSignature" TEXT NOT NULL,
    "waiverAgreed" BOOLEAN NOT NULL DEFAULT false,
    "healthInfoAgreed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waiver_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_waiverId_fkey" FOREIGN KEY ("waiverId") REFERENCES "Waiver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
