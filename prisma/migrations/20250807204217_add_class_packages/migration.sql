-- CreateTable
CREATE TABLE "ClassPackage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "classCount" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageBooking" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "waiverName" TEXT NOT NULL,
    "waiverAgreed" BOOLEAN NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waiverId" INTEGER,

    CONSTRAINT "PackageBooking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "ClassPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageBooking" ADD CONSTRAINT "PackageBooking_waiverId_fkey" FOREIGN KEY ("waiverId") REFERENCES "Waiver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
