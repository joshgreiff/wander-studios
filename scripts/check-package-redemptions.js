const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPackageRedemptions() {
  try {
    console.log('=== CHECKING PACKAGE REDEMPTIONS AFTER AUGUST 13, 2025 ===\n');

    // Get the cutoff date (August 13, 2025 at 11:20 PM)
    const cutoffDate = new Date('2025-08-13T23:20:00.000Z');
    console.log(`Cutoff date: ${cutoffDate.toLocaleString()}\n`);

    // Get all package redemptions after the cutoff date
    const recentRedemptions = await prisma.packageRedemption.findMany({
      where: {
        redeemedAt: {
          gt: cutoffDate
        }
      },
      include: {
        packageBooking: {
          include: {
            user: true,
            package: true
          }
        },
        class: true
      },
      orderBy: {
        redeemedAt: 'asc'
      }
    });

    console.log(`Found ${recentRedemptions.length} package redemptions after August 13, 2025\n`);

    if (recentRedemptions.length > 0) {
      console.log(`📦 PACKAGE REDEMPTIONS:`);
      recentRedemptions.forEach(redemption => {
        const classDate = new Date(redemption.class.date).toLocaleDateString();
        const redemptionDate = new Date(redemption.redeemedAt).toLocaleString();
        const user = redemption.packageBooking.user;
        console.log(`- ${user.name} (${user.email}) - Class: ${classDate} at ${redemption.class.time} - Redeemed: ${redemptionDate}`);
        console.log(`  Package: ${redemption.packageBooking.package.name} (${redemption.packageBooking.classesRemaining} classes remaining)`);
        console.log('');
      });
    } else {
      console.log(`No package redemptions found after August 13, 2025`);
    }

    // Also check recent bookings to see their payment method
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gt: cutoffDate
        }
      },
      include: {
        class: true,
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`\n💰 RECENT BOOKINGS PAYMENT ANALYSIS:`);
    recentBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingDate = new Date(booking.createdAt).toLocaleString();
      console.log(`- ${booking.name} (${booking.email}) - Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingDate}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log(`  Payment Amount: ${booking.paymentAmount || 'N/A'}`);
      console.log(`  User ID: ${booking.userId || 'None (not linked to user)'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking package redemptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackageRedemptions(); 