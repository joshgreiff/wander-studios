-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "packageBookingId" INTEGER;
 
-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageBookingId_fkey" FOREIGN KEY ("packageBookingId") REFERENCES "PackageBooking"("id") ON DELETE SET NULL ON UPDATE CASCADE; 