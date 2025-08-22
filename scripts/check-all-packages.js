const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllPackages() {
  try {
    console.log('=== CHECKING ALL PACKAGE BOOKINGS ===\n');
    
    // Get all package bookings
    const packageBookings = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📦 Total package bookings: ${packageBookings.length}\n`);
    
    const paidPackages = packageBookings.filter(p => p.paid);
    const unpaidPackages = packageBookings.filter(p => !p.paid);
    
    console.log(`✅ Paid packages: ${paidPackages.length}`);
    console.log(`❌ Unpaid packages: ${unpaidPackages.length}\n`);
    
    if (paidPackages.length > 0) {
      console.log('=== PAID PACKAGES ===');
      paidPackages.forEach(pkg => {
        console.log(`- ${pkg.user.name} (${pkg.user.email})`);
        console.log(`  Package: ${pkg.package.name}`);
        console.log(`  Created: ${new Date(pkg.createdAt).toLocaleString()}`);
        console.log(`  Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
        console.log(`  Classes remaining: ${pkg.classesRemaining}`);
        console.log(`  Payment ID: ${pkg.paymentId || 'None'}`);
        console.log('');
      });
    }
    
    if (unpaidPackages.length > 0) {
      console.log('=== UNPAID PACKAGES ===');
      unpaidPackages.forEach(pkg => {
        console.log(`- ${pkg.user.name} (${pkg.user.email})`);
        console.log(`  Package: ${pkg.package.name}`);
        console.log(`  Created: ${new Date(pkg.createdAt).toLocaleString()}`);
        console.log(`  Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
        console.log(`  Classes remaining: ${pkg.classesRemaining}`);
        console.log(`  Payment ID: ${pkg.paymentId || 'None'}`);
        console.log('');
      });
    }
    
    // Check if there are any patterns
    console.log('=== ANALYSIS ===');
    
    // Check by date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const recentPackages = packageBookings.filter(p => p.createdAt >= oneWeekAgo);
    const olderPackages = packageBookings.filter(p => p.createdAt < oneWeekAgo);
    
    console.log(`Recent packages (last 7 days): ${recentPackages.length}`);
    console.log(`  Paid: ${recentPackages.filter(p => p.paid).length}`);
    console.log(`  Unpaid: ${recentPackages.filter(p => !p.paid).length}`);
    
    console.log(`Older packages (7+ days ago): ${olderPackages.length}`);
    console.log(`  Paid: ${olderPackages.filter(p => p.paid).length}`);
    console.log(`  Unpaid: ${olderPackages.filter(p => !p.paid).length}`);
    
    // Check if there's a manual payment process
    console.log('\n=== MANUAL PAYMENT CHECK ===');
    const manualPaidPackages = paidPackages.filter(p => !p.paymentId);
    if (manualPaidPackages.length > 0) {
      console.log(`Packages marked as paid without payment ID: ${manualPaidPackages.length}`);
      manualPaidPackages.forEach(pkg => {
        console.log(`- ${pkg.user.name}: ${new Date(pkg.createdAt).toLocaleDateString()}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllPackages(); 