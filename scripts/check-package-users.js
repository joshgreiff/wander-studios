const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPackageUsers() {
  try {
    console.log('=== CHECKING PACKAGE USERS ===\n');

    // Get all package bookings
    const packageBookings = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${packageBookings.length} package purchases\n`);

    if (packageBookings.length === 0) {
      console.log('No package purchases found.');
      return;
    }

    console.log(`📦 PACKAGE PURCHASES:`);
    packageBookings.forEach(pkg => {
      const purchaseDate = new Date(pkg.createdAt).toLocaleString();
      const expiryDate = new Date(pkg.expiresAt).toLocaleDateString();
      console.log(`- ${pkg.customerName} (${pkg.customerEmail})`);
      console.log(`  Package: ${pkg.package.name} - $${pkg.package.price}`);
      console.log(`  Classes Used: ${pkg.classesUsed}/${pkg.package.classCount}`);
      console.log(`  Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`  Expires: ${expiryDate}`);
      console.log(`  Purchase Date: ${purchaseDate}`);
      console.log(`  Paid: ${pkg.paid ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check package redemptions
    const redemptions = await prisma.packageRedemption.findMany({
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

    console.log(`🎫 PACKAGE REDEMPTIONS (${redemptions.length}):`);
    if (redemptions.length > 0) {
      redemptions.forEach(redemption => {
        const classDate = new Date(redemption.class.date).toLocaleDateString();
        const redemptionDate = new Date(redemption.redeemedAt).toLocaleString();
        console.log(`- ${redemption.packageBooking.customerName} (${redemption.packageBooking.customerEmail})`);
        console.log(`  Class: ${classDate} at ${redemption.class.time} - ${redemption.class.description}`);
        console.log(`  Redeemed: ${redemptionDate}`);
        console.log('');
      });
    } else {
      console.log('No package redemptions found.');
    }

    // Summary
    const paidPackages = packageBookings.filter(pkg => pkg.paid);
    const unpaidPackages = packageBookings.filter(pkg => !pkg.paid);
    
    console.log(`📊 SUMMARY:`);
    console.log(`- Total package purchases: ${packageBookings.length}`);
    console.log(`- Paid packages: ${paidPackages.length}`);
    console.log(`- Unpaid packages: ${unpaidPackages.length}`);
    console.log(`- Total redemptions: ${redemptions.length}`);

  } catch (error) {
    console.error('Error checking package users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackageUsers(); 