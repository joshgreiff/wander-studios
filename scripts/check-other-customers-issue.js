const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOtherCustomersIssue() {
  try {
    console.log('=== CHECKING FOR OTHER CUSTOMERS WITH SAME ISSUE ===\n');
    
    // Check for any unpaid packages
    const unpaidPackages = await prisma.packageBooking.findMany({
      where: { paid: false },
      include: {
        user: true,
        package: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`❌ Unpaid packages found: ${unpaidPackages.length}\n`);
    
    if (unpaidPackages.length > 0) {
      console.log('=== UNPAID PACKAGES ===');
      unpaidPackages.forEach(pkg => {
        console.log(`- ${pkg.customerName} (${pkg.customerEmail})`);
        console.log(`  Package: ${pkg.package.name} - $${pkg.package.price}`);
        console.log(`  Created: ${new Date(pkg.createdAt).toLocaleString()}`);
        console.log(`  Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
        console.log(`  Classes remaining: ${pkg.classesRemaining}`);
        console.log(`  Payment ID: ${pkg.paymentId || 'None'}`);
        console.log('');
      });
    }
    
    // Check for customers who have packages but also paid for individual classes after package creation
    console.log('=== CHECKING FOR CUSTOMERS WHO PAID FOR INDIVIDUAL CLASSES ===\n');
    
    const allPackages = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      }
    });
    
    const customersWithIssues = [];
    
    for (const pkg of allPackages) {
      // Find individual class bookings by this customer after their package was created
      const individualBookings = await prisma.booking.findMany({
        where: {
          email: pkg.customerEmail,
          createdAt: {
            gte: pkg.createdAt // Bookings after package creation
          },
          userId: pkg.userId // Same user
        },
        include: { class: true },
        orderBy: { createdAt: 'desc' }
      });
      
      if (individualBookings.length > 0) {
        customersWithIssues.push({
          package: pkg,
          individualBookings: individualBookings
        });
      }
    }
    
    console.log(`Found ${customersWithIssues.length} customers who paid for individual classes after package creation:\n`);
    
    customersWithIssues.forEach(({ package: pkg, individualBookings }) => {
      console.log(`📦 ${pkg.customerName} (${pkg.customerEmail}):`);
      console.log(`   Package: ${pkg.package.name} - ${pkg.paid ? 'PAID' : 'UNPAID'}`);
      console.log(`   Package created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`   Classes remaining: ${pkg.classesRemaining}`);
      
      console.log(`   Individual class bookings (${individualBookings.length}):`);
      individualBookings.forEach(booking => {
        const classDate = new Date(booking.class.date).toLocaleDateString();
        console.log(`     - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
        console.log(`       Booked: ${new Date(booking.createdAt).toLocaleString()}`);
        console.log(`       Paid: ${booking.paid}`);
      });
      console.log('');
    });
    
    // Check for customers who might have been affected by the payment system issue
    console.log('=== CHECKING FOR POTENTIAL PAYMENT SYSTEM ISSUES ===\n');
    
    const recentPackages = await prisma.packageBooking.findMany({
      where: {
        createdAt: {
          gte: new Date('2025-08-15') // Packages created after Aug 15
        }
      },
      include: {
        user: true,
        package: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Recent packages (after Aug 15): ${recentPackages.length}`);
    
    const packagesWithoutPaymentIds = recentPackages.filter(pkg => !pkg.paymentId);
    const packagesWithPaymentIds = recentPackages.filter(pkg => pkg.paymentId);
    
    console.log(`  Packages without payment IDs: ${packagesWithoutPaymentIds.length}`);
    console.log(`  Packages with payment IDs: ${packagesWithPaymentIds.length}`);
    
    if (packagesWithoutPaymentIds.length > 0) {
      console.log('\nPackages without payment IDs (potential payment system issues):');
      packagesWithoutPaymentIds.forEach(pkg => {
        console.log(`  - ${pkg.customerName}: Created ${new Date(pkg.createdAt).toLocaleString()}, Paid: ${pkg.paid}`);
      });
    }
    
    // Summary and recommendations
    console.log('\n=== SUMMARY AND RECOMMENDATIONS ===');
    
    if (unpaidPackages.length > 0) {
      console.log(`❌ ${unpaidPackages.length} packages need to be marked as paid`);
      console.log('   Recommendation: Run fix script for these packages');
    }
    
    if (customersWithIssues.length > 0) {
      console.log(`⚠️  ${customersWithIssues.length} customers may have overpaid`);
      console.log('   Recommendation: Consider refunding individual class payments');
    }
    
    if (packagesWithoutPaymentIds.length > 0) {
      console.log(`🔧 ${packagesWithoutPaymentIds.length} packages show payment system issues`);
      console.log('   Recommendation: Fix the payment webhook system');
    }
    
  } catch (error) {
    console.error('Error checking for other customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOtherCustomersIssue(); 