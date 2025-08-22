const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPackageCreationDetails() {
  try {
    console.log('=== CHECKING PACKAGE CREATION DETAILS ===\n');
    
    // Get all package bookings with detailed information
    const packageBookings = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📦 Total package bookings: ${packageBookings.length}\n`);
    
    packageBookings.forEach((pkg, index) => {
      console.log(`Package ${index + 1}:`);
      console.log(`  Customer: ${pkg.customerName} (${pkg.customerEmail})`);
      console.log(`  Package: ${pkg.package.name} - $${pkg.package.price}`);
      console.log(`  Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`  Updated: ${pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleString() : 'Never'}`);
      console.log(`  Paid: ${pkg.paid}`);
      console.log(`  Payment ID: ${pkg.paymentId || 'None'}`);
      console.log(`  Classes Used: ${pkg.classesUsed}`);
      console.log(`  Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`  Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
      console.log(`  User ID: ${pkg.userId}`);
      console.log(`  User Name: ${pkg.user.name}`);
      console.log('');
    });
    
    // Check if there's a pattern in the data
    console.log('=== PATTERN ANALYSIS ===');
    
    // Check if all packages have the same structure
    const allHaveSameStructure = packageBookings.every(pkg => 
      pkg.classesUsed === 0 && 
      pkg.classesRemaining === pkg.package.classCount &&
      pkg.paymentId === null
    );
    
    console.log(`All packages have same initial structure: ${allHaveSameStructure}`);
    
    // Check if there's a time pattern
    const creationTimes = packageBookings.map(pkg => new Date(pkg.createdAt));
    const timeDifferences = [];
    
    for (let i = 1; i < creationTimes.length; i++) {
      const diff = creationTimes[i].getTime() - creationTimes[i-1].getTime();
      timeDifferences.push(diff / (1000 * 60)); // Convert to minutes
    }
    
    if (timeDifferences.length > 0) {
      console.log('\nTime differences between package creations (minutes):');
      timeDifferences.forEach((diff, index) => {
        console.log(`  Between package ${index + 1} and ${index + 2}: ${Math.round(diff)} minutes`);
      });
    }
    
    // Check if there's a pattern in the paid status
    const paidPackages = packageBookings.filter(pkg => pkg.paid);
    const unpaidPackages = packageBookings.filter(pkg => !pkg.paid);
    
    console.log(`\nPaid packages: ${paidPackages.length}`);
    console.log(`Unpaid packages: ${unpaidPackages.length}`);
    
    if (paidPackages.length > 0) {
      console.log('\nPaid package details:');
      paidPackages.forEach(pkg => {
        console.log(`  - ${pkg.customerName}: Created ${new Date(pkg.createdAt).toLocaleString()}`);
      });
    }
    
    if (unpaidPackages.length > 0) {
      console.log('\nUnpaid package details:');
      unpaidPackages.forEach(pkg => {
        console.log(`  - ${pkg.customerName}: Created ${new Date(pkg.createdAt).toLocaleString()}`);
      });
    }
    
    // Check if there's a pattern suggesting manual intervention
    console.log('\n=== MANUAL INTERVENTION CHECK ===');
    
    // Check if packages were created in batches
    const creationDates = packageBookings.map(pkg => new Date(pkg.createdAt).toDateString());
    const uniqueDates = [...new Set(creationDates)];
    
    console.log(`Packages created on ${uniqueDates.length} different dates:`);
    uniqueDates.forEach(date => {
      const packagesOnDate = packageBookings.filter(pkg => 
        new Date(pkg.createdAt).toDateString() === date
      );
      console.log(`  ${date}: ${packagesOnDate.length} packages`);
    });
    
    // Check if there's a pattern in the user IDs or other fields
    const userIds = packageBookings.map(pkg => pkg.userId);
    const uniqueUserIds = [...new Set(userIds)];
    
    console.log(`\nPackages created by ${uniqueUserIds.length} different users:`);
    uniqueUserIds.forEach(userId => {
      const packagesByUser = packageBookings.filter(pkg => pkg.userId === userId);
      console.log(`  User ID ${userId}: ${packagesByUser.length} packages`);
    });
    
  } catch (error) {
    console.error('Error checking package details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackageCreationDetails(); 