const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentPackages() {
  try {
    console.log('Checking recent package bookings...');
    
    // Get packages from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentPackages = await prisma.packageBooking.findMany({
      where: { 
        createdAt: {
          gte: yesterday
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (recentPackages.length === 0) {
      console.log('✅ No recent packages found');
      return;
    }
    
    console.log(`Found ${recentPackages.length} recent packages:`);
    
    recentPackages.forEach(pkg => {
      const createdDate = new Date(pkg.createdAt);
      const now = new Date();
      const hoursAgo = Math.round((now - createdDate) / (1000 * 60 * 60));
      
      console.log(`\n📦 Package ID: ${pkg.id}`);
      console.log(`👤 Customer: ${pkg.customerName}`);
      console.log(`💳 Status: ${pkg.paid ? '✅ PAID' : '❌ PENDING'}`);
      console.log(`🕒 Created: ${hoursAgo} hours ago`);
      console.log(`🎯 Classes: ${pkg.classesUsed} used, ${pkg.classesRemaining} remaining`);
      console.log(`💰 Payment ID: ${pkg.paymentId || 'None'}`);
      
      if (!pkg.paid) {
        console.log('⚠️  This package is still pending - webhook may not be working');
      }
    });
    
    // Check if webhooks are working
    const pendingPackages = recentPackages.filter(pkg => !pkg.paid);
    if (pendingPackages.length > 0) {
      console.log(`\n⚠️  ${pendingPackages.length} packages are still pending payment`);
      console.log('This suggests the webhook system may not be working correctly');
    } else {
      console.log('\n✅ All recent packages are marked as paid - webhook system appears to be working');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentPackages(); 