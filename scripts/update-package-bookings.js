const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePackageBookings() {
  try {
    console.log('=== UPDATING PACKAGE BOOKINGS ===\n');

    // Get all package bookings
    const packageBookings = await prisma.packageBooking.findMany({
      include: {
        package: true
      }
    });

    console.log(`Found ${packageBookings.length} package bookings to update.\n`);

    for (const packageBooking of packageBookings) {
      // Calculate remaining classes (total classes minus used classes)
      const classesRemaining = packageBooking.package.classCount - packageBooking.classesUsed;
      
      console.log(`Package Booking ID ${packageBooking.id}:`);
      console.log(`  - Package: ${packageBooking.package.name}`);
      console.log(`  - Classes Used: ${packageBooking.classesUsed}`);
      console.log(`  - Classes Remaining: ${classesRemaining}`);
      
      // Update the package booking
      await prisma.packageBooking.update({
        where: { id: packageBooking.id },
        data: {
          classesRemaining: classesRemaining
        }
      });
      
      console.log(`  ✅ Updated classesRemaining to ${classesRemaining}\n`);
    }

    console.log('All package bookings updated successfully!');

  } catch (error) {
    console.error('Error updating package bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePackageBookings(); 