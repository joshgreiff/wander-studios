const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPackagePaymentHistory() {
  try {
    console.log('=== CHECKING PACKAGE PAYMENT HISTORY ===\n');
    
    // Get all package bookings with their creation and update times
    const packageBookings = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📦 Package Booking Timeline:\n');
    
    packageBookings.forEach(pkg => {
      const createdTime = new Date(pkg.createdAt);
      const updatedTime = new Date(pkg.updatedAt);
      const timeDiff = updatedTime.getTime() - createdTime.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      console.log(`${pkg.customerName} (${pkg.customerEmail}):`);
      console.log(`  Package: ${pkg.package.name}`);
      console.log(`  Created: ${createdTime.toLocaleString()}`);
      console.log(`  Updated: ${updatedTime.toLocaleString()}`);
      console.log(`  Time between create/update: ${minutesDiff} minutes`);
      console.log(`  Paid: ${pkg.paid}`);
      console.log(`  Payment ID: ${pkg.paymentId || 'None'}`);
      console.log('');
    });
    
    // Check if there are any patterns in the timing
    console.log('=== TIMING ANALYSIS ===');
    
    const packagesWithQuickUpdates = packageBookings.filter(pkg => {
      const timeDiff = new Date(pkg.updatedAt).getTime() - new Date(pkg.createdAt).getTime();
      return timeDiff < 5 * 60 * 1000; // Less than 5 minutes
    });
    
    const packagesWithDelayedUpdates = packageBookings.filter(pkg => {
      const timeDiff = new Date(pkg.updatedAt).getTime() - new Date(pkg.createdAt).getTime();
      return timeDiff > 5 * 60 * 1000; // More than 5 minutes
    });
    
    console.log(`Packages updated within 5 minutes: ${packagesWithQuickUpdates.length}`);
    console.log(`Packages updated after 5 minutes: ${packagesWithDelayedUpdates.length}`);
    
    if (packagesWithDelayedUpdates.length > 0) {
      console.log('\nPackages with delayed updates:');
      packagesWithDelayedUpdates.forEach(pkg => {
        const timeDiff = new Date(pkg.updatedAt).getTime() - new Date(pkg.createdAt).getTime();
        const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60));
        console.log(`- ${pkg.customerName}: ${hoursDiff} hours later`);
      });
    }
    
    // Check if there might have been a manual script run
    console.log('\n=== CHECKING FOR MANUAL UPDATES ===');
    
    // Look for any packages that were updated today (after our fix)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const updatedToday = packageBookings.filter(pkg => 
      new Date(pkg.updatedAt) >= today
    );
    
    if (updatedToday.length > 0) {
      console.log('Packages updated today:');
      updatedToday.forEach(pkg => {
        console.log(`- ${pkg.customerName}: ${new Date(pkg.updatedAt).toLocaleString()}`);
      });
    } else {
      console.log('No packages updated today');
    }
    
    // Check if there's a pattern suggesting manual intervention
    const allUpdatedSameDay = packageBookings.every(pkg => {
      const createdDate = new Date(pkg.createdAt).toDateString();
      const updatedDate = new Date(pkg.updatedAt).toDateString();
      return createdDate === updatedDate;
    });
    
    console.log(`\nAll packages updated on same day as creation: ${allUpdatedSameDay}`);
    
    if (allUpdatedSameDay) {
      console.log('This suggests manual intervention or a script was run to mark packages as paid.');
    }
    
  } catch (error) {
    console.error('Error checking package history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackagePaymentHistory(); 