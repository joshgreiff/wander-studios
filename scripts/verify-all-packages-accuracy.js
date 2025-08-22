const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllPackagesAccuracy() {
  try {
    console.log('=== VERIFYING ALL PACKAGES ACCURACY ===\n');
    
    // Get all package bookings
    const allPackages = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true,
        packageRedemptions: {
          include: {
            class: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📦 Total package bookings: ${allPackages.length}\n`);
    
    // Verify each package
    allPackages.forEach((pkg, index) => {
      console.log(`=== PACKAGE ${index + 1}: ${pkg.customerName} ===`);
      console.log(`Package: ${pkg.package.name} - $${pkg.package.price}`);
      console.log(`Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`Paid: ${pkg.paid}`);
      console.log(`Classes Used: ${pkg.classesUsed}`);
      console.log(`Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`Total Classes: ${pkg.package.classCount}`);
      console.log(`Package Redemptions: ${pkg.packageRedemptions.length}`);
      
      // Verify the math
      const expectedRemaining = pkg.package.classCount - pkg.classesUsed;
      const actualRemaining = pkg.classesRemaining;
      const isAccurate = expectedRemaining === actualRemaining;
      
      console.log(`Expected remaining: ${expectedRemaining}`);
      console.log(`Actual remaining: ${actualRemaining}`);
      console.log(`✅ Accurate: ${isAccurate}`);
      
      if (!isAccurate) {
        console.log(`❌ DISCREPANCY FOUND! Expected: ${expectedRemaining}, Actual: ${actualRemaining}`);
      }
      
      // Show redemption details
      if (pkg.packageRedemptions.length > 0) {
        console.log('\nPackage Redemptions:');
        pkg.packageRedemptions.forEach(redemption => {
          const classDate = new Date(redemption.class.date).toLocaleDateString();
          console.log(`  - ${classDate} at ${redemption.class.time} - ${redemption.class.description}`);
          console.log(`    Redeemed: ${new Date(redemption.redeemedAt).toLocaleString()}`);
        });
      }
      
      console.log('');
    });
    
    // Check bookings table for package usage tracking
    console.log('=== CHECKING BOOKINGS TABLE FOR PACKAGE TRACKING ===\n');
    
    // Get all bookings that might be package redemptions
    const allBookings = await prisma.booking.findMany({
      include: {
        class: true,
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📅 Total bookings: ${allBookings.length}`);
    
    // Check if bookings have any package-related fields
    const sampleBooking = allBookings[0];
    if (sampleBooking) {
      console.log('\nSample booking fields:');
      console.log(`  ID: ${sampleBooking.id}`);
      console.log(`  Name: ${sampleBooking.name}`);
      console.log(`  Email: ${sampleBooking.email}`);
      console.log(`  Paid: ${sampleBooking.paid}`);
      console.log(`  User ID: ${sampleBooking.userId}`);
      console.log(`  Class ID: ${sampleBooking.classId}`);
      console.log(`  Created: ${new Date(sampleBooking.createdAt).toLocaleString()}`);
    }
    
    // Check for bookings that might be package redemptions
    console.log('\n=== IDENTIFYING PACKAGE REDEMPTIONS IN BOOKINGS ===');
    
    // Get all package redemptions
    const allRedemptions = await prisma.packageRedemption.findMany({
      include: {
        packageBooking: {
          include: { user: true }
        },
        class: true
      },
      orderBy: { redeemedAt: 'asc' }
    });
    
    console.log(`🎫 Total package redemptions: ${allRedemptions.length}`);
    
    if (allRedemptions.length > 0) {
      console.log('\nPackage Redemptions:');
      allRedemptions.forEach(redemption => {
        const classDate = new Date(redemption.class.date).toLocaleDateString();
        console.log(`  - ${redemption.packageBooking.user.name}: ${classDate} at ${redemption.class.time}`);
        console.log(`    Class: ${redemption.class.description}`);
        console.log(`    Redeemed: ${new Date(redemption.redeemedAt).toLocaleString()}`);
        console.log(`    Package: ${redemption.packageBooking.package.name}`);
      });
    }
    
    // Cross-reference bookings with package redemptions
    console.log('\n=== CROSS-REFERENCING BOOKINGS WITH PACKAGE REDEMPTIONS ===');
    
    let packageBookingsFound = 0;
    let individualBookingsFound = 0;
    
    allBookings.forEach(booking => {
      // Check if this booking has a corresponding package redemption
      const matchingRedemption = allRedemptions.find(r => 
        r.classId === booking.classId && 
        r.packageBooking.customerEmail === booking.email
      );
      
      if (matchingRedemption) {
        packageBookingsFound++;
        console.log(`✅ ${booking.name} (${booking.email}): Package redemption`);
        console.log(`   Class: ${new Date(booking.class.date).toLocaleDateString()} at ${booking.class.time}`);
        console.log(`   Package: ${matchingRedemption.packageBooking.package.name}`);
      } else {
        individualBookingsFound++;
        // Only show a few individual bookings to avoid spam
        if (individualBookingsFound <= 5) {
          console.log(`💳 ${booking.name} (${booking.email}): Individual payment`);
          console.log(`   Class: ${new Date(booking.class.date).toLocaleDateString()} at ${booking.class.time}`);
        }
      }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`Package redemptions: ${packageBookingsFound}`);
    console.log(`Individual payments: ${individualBookingsFound}`);
    
    // Check for any discrepancies
    console.log('\n=== CHECKING FOR DISCREPANCIES ===');
    
    allPackages.forEach(pkg => {
      const redemptionCount = pkg.packageRedemptions.length;
      const classesUsed = pkg.classesUsed;
      
      if (redemptionCount !== classesUsed) {
        console.log(`❌ DISCREPANCY for ${pkg.customerName}:`);
        console.log(`   Redemptions in database: ${redemptionCount}`);
        console.log(`   Classes used field: ${classesUsed}`);
      }
    });
    
    // Check if we need to add package tracking to bookings
    console.log('\n=== PACKAGE TRACKING RECOMMENDATIONS ===');
    
    console.log('Current system:');
    console.log('✅ Package redemptions are tracked in PackageRedemption table');
    console.log('✅ Bookings table has user ID to link to packages');
    console.log('❌ No direct field in bookings table to mark package usage');
    
    console.log('\nRecommendations:');
    console.log('1. Add a "packageBookingId" field to bookings table');
    console.log('2. Or add a "isPackageRedemption" boolean field');
    console.log('3. This would make it easier to identify package bookings');
    
  } catch (error) {
    console.error('Error verifying packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllPackagesAccuracy(); 