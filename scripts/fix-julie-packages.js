const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixJuliePackages() {
  try {
    console.log('=== FIXING JULIE WANDER\'S PACKAGE ISSUES ===\n');
    
    // Find Julie's user account
    const julie = await prisma.user.findFirst({
      where: { email: 'jwander97@gmail.com' }
    });
    
    if (!julie) {
      console.log('❌ Julie Wander user account not found');
      return;
    }
    
    console.log(`✅ Found Julie: ${julie.name} (${julie.email})\n`);
    
    // Get all of Julie's package bookings
    const juliePackages = await prisma.packageBooking.findMany({
      where: { userId: julie.id },
      include: { package: true },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📦 Julie has ${juliePackages.length} package bookings:\n`);
    
    juliePackages.forEach((pkg, index) => {
      console.log(`Package ${index + 1}:`);
      console.log(`   ID: ${pkg.id}`);
      console.log(`   Package: ${pkg.package.name}`);
      console.log(`   Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`   Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
      console.log(`   Paid: ${pkg.paid}`);
      console.log(`   Classes Used: ${pkg.classesUsed}`);
      console.log(`   Classes Remaining: ${pkg.classesRemaining}`);
      console.log(`   Payment ID: ${pkg.paymentId || 'None'}`);
      console.log('');
    });
    
    // Fix Issue 1: Mark the second package (9/1/2025) as paid
    const secondPackage = juliePackages[1]; // Index 1 is the second package
    if (secondPackage && !secondPackage.paid) {
      console.log('🔧 Fixing Issue 1: Marking second package as paid...');
      
      await prisma.packageBooking.update({
        where: { id: secondPackage.id },
        data: { paid: true }
      });
      
      console.log('✅ Second package marked as paid!');
    } else if (secondPackage && secondPackage.paid) {
      console.log('✅ Second package is already marked as paid');
    }
    
    // Fix Issue 2: Verify first package shows correct remaining classes
    const firstPackage = juliePackages[0]; // Index 0 is the first package
    if (firstPackage) {
      console.log('\n🔧 Checking Issue 2: Verifying first package remaining classes...');
      
      // Count actual package redemptions for this package
      const redemptions = await prisma.packageRedemption.count({
        where: { packageBookingId: firstPackage.id }
      });
      
      console.log(`   Package redemptions found: ${redemptions}`);
      console.log(`   Current classesUsed: ${firstPackage.classesUsed}`);
      console.log(`   Current classesRemaining: ${firstPackage.classesRemaining}`);
      
      if (redemptions !== firstPackage.classesUsed) {
        console.log('⚠️  Mismatch detected! Updating package counts...');
        
        await prisma.packageBooking.update({
          where: { id: firstPackage.id },
          data: {
            classesUsed: redemptions,
            classesRemaining: firstPackage.package.classCount - redemptions
          }
        });
        
        console.log('✅ Package counts updated to match actual redemptions!');
      } else {
        console.log('✅ Package counts are accurate');
      }
    }
    
    // Show final status
    console.log('\n=== FINAL STATUS ===');
    const updatedPackages = await prisma.packageBooking.findMany({
      where: { userId: julie.id },
      include: { package: true },
      orderBy: { createdAt: 'asc' }
    });
    
    updatedPackages.forEach((pkg, index) => {
      console.log(`Package ${index + 1}:`);
      console.log(`   Package: ${pkg.package.name}`);
      console.log(`   Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      console.log(`   Expires: ${new Date(pkg.expiresAt).toLocaleDateString()}`);
      console.log(`   Status: ${pkg.paid ? 'Paid' : 'Pending'}`);
      console.log(`   Classes Used: ${pkg.classesUsed}`);
      console.log(`   Classes Remaining: ${pkg.classesRemaining}`);
      console.log('');
    });
    
    console.log('🎉 Julie\'s package issues have been resolved!');
    
  } catch (error) {
    console.error('Error fixing Julie\'s packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixJuliePackages(); 