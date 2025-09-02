const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPendingPackages() {
  try {
    console.log('=== CHECKING FOR PENDING PACKAGES ===\n');
    
    // Get all unpaid package bookings
    const unpaidPackages = await prisma.packageBooking.findMany({
      where: { paid: false },
      include: {
        user: true,
        package: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (unpaidPackages.length === 0) {
      console.log('✅ No pending packages found! All packages are marked as paid.');
      return;
    }
    
    console.log(`❌ Found ${unpaidPackages.length} pending package(s):\n`);
    
    unpaidPackages.forEach((pkg, index) => {
      console.log(`Pending Package ${index + 1}:`);
      console.log(`   Customer: ${pkg.customerName} (${pkg.customerEmail})`);
      console.log(`   Package: ${pkg.package.name} - $${pkg.package.price}`);
      console.log(`   Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`   Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
      console.log(`   Classes Used: ${pkg.classesUsed}`);
      console.log(`   Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`   Payment ID: ${pkg.paymentId || 'None'}`);
      console.log('');
    });
    
    // Check if any of these might be legitimate unpaid packages
    console.log('=== ANALYSIS ===');
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    unpaidPackages.forEach((pkg, index) => {
      const createdDate = new Date(pkg.createdAt);
      const isRecent = createdDate > oneWeekAgo;
      
      console.log(`Package ${index + 1} (${pkg.customerName}):`);
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   Is recent (< 1 week): ${isRecent ? 'Yes' : 'No'}`);
      
      if (isRecent) {
        console.log(`   ⚠️  This might be a legitimate pending payment`);
        console.log(`   💡 Check Square dashboard for payment status`);
      } else {
        console.log(`   ⚠️  This package is older and might need manual review`);
        console.log(`   💡 Consider marking as paid if payment was received`);
      }
      console.log('');
    });
    
    // Summary
    console.log('=== RECOMMENDATIONS ===');
    if (unpaidPackages.length > 0) {
      console.log('1. Check Square dashboard for recent payments');
      console.log('2. Verify if payments were received but not processed');
      console.log('3. Consider manually marking legitimate payments as paid');
      console.log('4. Review webhook configuration if payments are missing');
    }
    
  } catch (error) {
    console.error('Error checking pending packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingPackages(); 