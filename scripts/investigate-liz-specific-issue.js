const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateLizSpecificIssue() {
  try {
    console.log('=== INVESTIGATING LIZ\'S SPECIFIC ISSUE ===\n');
    
    // Get all package bookings to compare
    const allPackages = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📦 Total package bookings: ${allPackages.length}\n`);
    
    // Find Liz's package
    const lizPackage = allPackages.find(pkg => pkg.customerEmail === 'liz.comella@gmail.com');
    
    if (!lizPackage) {
      console.log('❌ Liz\'s package not found');
      return;
    }
    
    console.log('=== LIZ\'S PACKAGE DETAILS ===');
    console.log(`Customer: ${lizPackage.customerName} (${lizPackage.customerEmail})`);
    console.log(`Package: ${lizPackage.package.name} - $${lizPackage.package.price}`);
    console.log(`Created: ${new Date(lizPackage.createdAt).toLocaleString()}`);
    console.log(`Paid: ${lizPackage.paid}`);
    console.log(`Payment ID: ${lizPackage.paymentId || 'None'}`);
    console.log(`Classes Used: ${lizPackage.classesUsed}`);
    console.log(`Classes Remaining: ${lizPackage.classesRemaining}`);
    console.log(`Expires: ${new Date(lizPackage.expiresAt).toLocaleDateString()}`);
    console.log('');
    
    // Compare with other packages
    console.log('=== COMPARISON WITH OTHER PACKAGES ===');
    
    allPackages.forEach((pkg, index) => {
      const isLiz = pkg.customerEmail === 'liz.comella@gmail.com';
      const marker = isLiz ? '👤 LIZ' : '   ';
      console.log(`${marker} ${index + 1}. ${pkg.customerName}:`);
      console.log(`     Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`     Paid: ${pkg.paid}`);
      console.log(`     Payment ID: ${pkg.paymentId || 'None'}`);
      console.log(`     Classes Used: ${pkg.classesUsed}`);
      console.log(`     Classes Remaining: ${pkg.classesRemaining}`);
      console.log('');
    });
    
    // Check timing patterns
    console.log('=== TIMING ANALYSIS ===');
    
    const creationTimes = allPackages.map(pkg => ({
      name: pkg.customerName,
      time: new Date(pkg.createdAt),
      timestamp: pkg.createdAt.getTime()
    }));
    
    console.log('Package creation timeline:');
    creationTimes.forEach((pkg, index) => {
      const isLiz = pkg.name === 'Liz Comella';
      const marker = isLiz ? '👤' : '  ';
      console.log(`${marker} ${index + 1}. ${pkg.name}: ${pkg.time.toLocaleString()}`);
    });
    
    // Check if there's a pattern in the timing
    const timeDifferences = [];
    for (let i = 1; i < creationTimes.length; i++) {
      const diff = creationTimes[i].timestamp - creationTimes[i-1].timestamp;
      const minutes = Math.round(diff / (1000 * 60));
      timeDifferences.push({
        from: creationTimes[i-1].name,
        to: creationTimes[i].name,
        minutes: minutes,
        hours: Math.round(minutes / 60)
      });
    }
    
    console.log('\nTime differences between package creations:');
    timeDifferences.forEach(diff => {
      const isLizInvolved = diff.to === 'Liz Comella' || diff.from === 'Liz Comella';
      const marker = isLizInvolved ? '👤' : '  ';
      console.log(`${marker} ${diff.from} → ${diff.to}: ${diff.minutes} minutes (${diff.hours} hours)`);
    });
    
    // Check if there's a system change or issue around Liz's purchase time
    console.log('\n=== SYSTEM STATE ANALYSIS ===');
    
    // Check if there were any other activities around Liz's purchase time
    const lizPurchaseTime = lizPackage.createdAt;
    const beforeLiz = new Date(lizPurchaseTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours before
    const afterLiz = new Date(lizPurchaseTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours after
    
    console.log(`Liz's purchase time: ${lizPurchaseTime.toLocaleString()}`);
    console.log(`Analysis window: ${beforeLiz.toLocaleString()} to ${afterLiz.toLocaleString()}`);
    
    // Check for any other bookings or activities in this time window
    const activitiesInWindow = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: beforeLiz,
          lte: afterLiz
        }
      },
      include: { class: true },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`\nOther activities in 24-hour window around Liz's purchase: ${activitiesInWindow.length}`);
    
    if (activitiesInWindow.length > 0) {
      console.log('\nActivities:');
      activitiesInWindow.forEach(activity => {
        const isLiz = activity.email === 'liz.comella@gmail.com';
        const marker = isLiz ? '👤' : '  ';
        const classDate = new Date(activity.class.date).toLocaleDateString();
        console.log(`${marker} ${activity.name}: ${classDate} at ${activity.class.time} - ${activity.class.description}`);
        console.log(`     Booked: ${new Date(activity.createdAt).toLocaleString()}`);
        console.log(`     Paid: ${activity.paid}`);
      });
    }
    
    // Check if there's a pattern suggesting a system issue
    console.log('\n=== POTENTIAL SYSTEM ISSUES ===');
    
    // Check if Liz was the first to use the actual payment flow
    const packagesBeforeLiz = allPackages.filter(pkg => pkg.createdAt < lizPurchaseTime);
    const packagesAfterLiz = allPackages.filter(pkg => pkg.createdAt > lizPurchaseTime);
    
    console.log(`Packages before Liz: ${packagesBeforeLiz.length}`);
    console.log(`Packages after Liz: ${packagesAfterLiz.length}`);
    
    if (packagesBeforeLiz.length > 0 && packagesAfterLiz.length === 0) {
      console.log('👤 Liz was the most recent package purchaser - this might be significant');
    }
    
    // Check if there's a pattern in the payment IDs
    const packagesWithPaymentIds = allPackages.filter(pkg => pkg.paymentId);
    const packagesWithoutPaymentIds = allPackages.filter(pkg => !pkg.paymentId);
    
    console.log(`\nPackages with payment IDs: ${packagesWithPaymentIds.length}`);
    console.log(`Packages without payment IDs: ${packagesWithoutPaymentIds.length}`);
    
    if (packagesWithoutPaymentIds.length === allPackages.length) {
      console.log('🔧 ALL packages lack payment IDs - suggests payment system was never working');
    }
    
    // Check if Liz's package was created differently
    console.log('\n=== LIZ\'S PACKAGE CREATION METHOD ===');
    
    const lizPackageData = {
      paid: lizPackage.paid,
      paymentId: lizPackage.paymentId,
      classesUsed: lizPackage.classesUsed,
      classesRemaining: lizPackage.classesRemaining,
      updatedAt: lizPackage.updatedAt
    };
    
    const otherPackagesData = allPackages
      .filter(pkg => pkg.customerEmail !== 'liz.comella@gmail.com')
      .map(pkg => ({
        name: pkg.customerName,
        paid: pkg.paid,
        paymentId: pkg.paymentId,
        classesUsed: pkg.classesUsed,
        classesRemaining: pkg.classesRemaining,
        updatedAt: pkg.updatedAt
      }));
    
    console.log('Liz\'s package data:');
    console.log(`  Paid: ${lizPackageData.paid}`);
    console.log(`  Payment ID: ${lizPackageData.paymentId || 'None'}`);
    console.log(`  Classes Used: ${lizPackageData.classesUsed}`);
    console.log(`  Classes Remaining: ${lizPackageData.classesRemaining}`);
    console.log(`  Updated: ${lizPackageData.updatedAt ? new Date(lizPackageData.updatedAt).toLocaleString() : 'Never'}`);
    
    console.log('\nOther packages data:');
    otherPackagesData.forEach(pkg => {
      console.log(`  ${pkg.name}:`);
      console.log(`    Paid: ${pkg.paid}`);
      console.log(`    Payment ID: ${pkg.paymentId || 'None'}`);
      console.log(`    Classes Used: ${pkg.classesUsed}`);
      console.log(`    Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`    Updated: ${pkg.updatedAt ? new Date(pkg.updatedAt).toLocaleString() : 'Never'}`);
    });
    
    // Check if there's a difference in creation method
    const allSameStructure = allPackages.every(pkg => 
      pkg.paid === true && 
      pkg.paymentId === null && 
      (!pkg.updatedAt || pkg.updatedAt <= pkg.createdAt)
    );
    
    console.log(`\nAll packages have same structure: ${allSameStructure}`);
    
    if (allSameStructure) {
      console.log('🔧 This suggests ALL packages were created the same way (manually or through a different method)');
      console.log('   Liz\'s issue might not be related to the payment system, but to a different problem');
    }
    
  } catch (error) {
    console.error('Error investigating Liz\'s issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateLizSpecificIssue(); 