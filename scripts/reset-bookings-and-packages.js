const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetBookingsAndPackages() {
  try {
    console.log('=== RESETTING BOOKINGS AFTER AUGUST 13, 2025 ===\n');

    // Get the cutoff date (August 13, 2025 at 11:20 PM)
    const cutoffDate = new Date('2025-08-13T23:20:00.000Z');
    console.log(`Cutoff date: ${cutoffDate.toLocaleString()}\n`);

    // Get current state
    const allBookings = await prisma.booking.findMany();
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gt: cutoffDate
        }
      },
      include: {
        class: true
      }
    });
    const allPackages = await prisma.packageBooking.findMany({
      include: {
        package: true
      }
    });
    const allRedemptions = await prisma.packageRedemption.findMany();

    console.log(`📊 CURRENT STATE:`);
    console.log(`- Total bookings: ${allBookings.length}`);
    console.log(`- Bookings after August 13: ${recentBookings.length}`);
    console.log(`- Total package purchases: ${allPackages.length}`);
    console.log(`- Total package redemptions: ${allRedemptions.length}\n`);

    // Show package users who need to be marked as paid
    const unpaidPackages = allPackages.filter(pkg => !pkg.paid);
    console.log(`📦 PACKAGE USERS TO MARK AS PAID (${unpaidPackages.length}):`);
    unpaidPackages.forEach(pkg => {
      console.log(`- ${pkg.customerName} (${pkg.customerEmail}) - ${pkg.package.name}`);
    });

    if (unpaidPackages.length > 0) {
      console.log(`\n✅ MARKING PACKAGES AS PAID...`);
      
      for (const pkg of unpaidPackages) {
        await prisma.packageBooking.update({
          where: { id: pkg.id },
          data: { paid: true }
        });
        console.log(`✓ Marked ${pkg.customerName}'s package as paid`);
      }
    }

    // Show recent bookings that will be deleted
    console.log(`\n🗑️  RECENT BOOKINGS TO BE DELETED (${recentBookings.length}):`);
    recentBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingDate = new Date(booking.createdAt).toLocaleString();
      console.log(`- ${booking.name} (${booking.email}) - Class: ${classDate} at ${booking.class.time} - Booked: ${bookingDate}`);
    });

    // Delete only recent bookings
    if (recentBookings.length > 0) {
      console.log(`\n🗑️  DELETING RECENT BOOKINGS...`);
      await prisma.booking.deleteMany({
        where: {
          createdAt: {
            gt: cutoffDate
          }
        }
      });
      console.log(`✓ Deleted ${recentBookings.length} recent bookings`);
    } else {
      console.log(`\n✅ No recent bookings to delete`);
    }

    // Delete all package redemptions (since we're clearing recent bookings)
    console.log(`\n🗑️  DELETING ALL PACKAGE REDEMPTIONS...`);
    await prisma.packageRedemption.deleteMany();
    console.log(`✓ Deleted ${allRedemptions.length} package redemptions`);

    // Reset package usage
    console.log(`\n🔄 RESETTING PACKAGE USAGE...`);
    await prisma.packageBooking.updateMany({
      data: {
        classesUsed: 0,
        classesRemaining: 4 // Assuming 4-class packages
      }
    });
    console.log(`✓ Reset all packages to 0 used, 4 remaining`);

    // Final state
    const finalBookings = await prisma.booking.findMany();
    const finalPackages = await prisma.packageBooking.findMany({
      include: {
        package: true
      }
    });
    const finalRedemptions = await prisma.packageRedemption.findMany();

    console.log(`\n📊 FINAL STATE:`);
    console.log(`- Total bookings: ${finalBookings.length}`);
    console.log(`- Total package purchases: ${finalPackages.length}`);
    console.log(`- Total package redemptions: ${finalRedemptions.length}`);

    // Show package users who can now book
    const paidPackages = finalPackages.filter(pkg => pkg.paid);
    console.log(`\n✅ PACKAGE USERS READY TO BOOK (${paidPackages.length}):`);
    paidPackages.forEach(pkg => {
      const expiryDate = new Date(pkg.expiresAt).toLocaleDateString();
      console.log(`- ${pkg.customerName} (${pkg.customerEmail})`);
      console.log(`  Package: ${pkg.package.name} - ${pkg.classesRemaining} classes remaining`);
      console.log(`  Expires: ${expiryDate}`);
      console.log('');
    });

    console.log(`\n🎉 RESET COMPLETE!`);
    console.log(`- Recent bookings (after August 13) have been cleared`);
    console.log(`- All package users are marked as paid`);
    console.log(`- All packages have been reset to 4 classes remaining`);
    console.log(`- Package users can now book classes using their packages`);

  } catch (error) {
    console.error('Error resetting bookings and packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetBookingsAndPackages(); 