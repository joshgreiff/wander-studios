const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPackageRedemption() {
  try {
    console.log('=== TESTING PACKAGE REDEMPTION SYSTEM ===\n');
    
    // Get all packages with available classes
    const availablePackages = await prisma.packageBooking.findMany({
      where: {
        paid: true,
        classesRemaining: {
          gt: 0
        },
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true,
        package: true
      }
    });
    
    console.log(`📦 Available packages: ${availablePackages.length}`);
    
    availablePackages.forEach(pkg => {
      console.log(`  - ${pkg.user.name}: ${pkg.classesRemaining} classes remaining`);
    });
    
    console.log('');
    
    // Get upcoming classes
    const upcomingClasses = await prisma.class.findMany({
      where: {
        archived: false,
        date: {
          gt: new Date()
        }
      },
      orderBy: {
        date: 'asc'
      },
      take: 3
    });
    
    console.log(`📅 Upcoming classes: ${upcomingClasses.length}`);
    
    upcomingClasses.forEach(cls => {
      const classDate = new Date(cls.date).toLocaleDateString();
      console.log(`  - ${classDate} at ${cls.time} - ${cls.description}`);
    });
    
    console.log('');
    
    // Test the package redemption API
    if (availablePackages.length > 0 && upcomingClasses.length > 0) {
      const testPackage = availablePackages[0];
      const testClass = upcomingClasses[0];
      
      console.log('🧪 Testing package redemption API...');
      console.log(`Package: ${testPackage.user.name} - ${testPackage.classesRemaining} classes remaining`);
      console.log(`Class: ${new Date(testClass.date).toLocaleDateString()} at ${testClass.time} - ${testClass.description}`);
      
      // Simulate the API call
      const redemptionData = {
        packageBookingId: testPackage.id,
        classId: testClass.id,
        userId: testPackage.userId,
        customerName: testPackage.customerName,
        customerEmail: testPackage.customerEmail,
        phone: testPackage.customerPhone,
        waiverName: testPackage.waiverName,
        waiverAgreed: testPackage.waiverAgreed
      };
      
      console.log('\nRedemption data:');
      console.log(JSON.stringify(redemptionData, null, 2));
      
      console.log('\n✅ API call simulation complete');
      console.log('Note: This is a simulation - no actual redemption was performed');
    }
    
    // Check current package redemption records
    console.log('\n=== CURRENT PACKAGE REDEMPTIONS ===');
    
    const currentRedemptions = await prisma.packageRedemption.findMany({
      include: {
        packageBooking: {
          include: { user: true, package: true }
        },
        class: true
      },
      orderBy: { redeemedAt: 'desc' }
    });
    
    console.log(`Total redemptions: ${currentRedemptions.length}`);
    
    currentRedemptions.forEach(redemption => {
      const classDate = new Date(redemption.class.date).toLocaleDateString();
      console.log(`  - ${redemption.packageBooking.user.name}: ${classDate} at ${redemption.class.time}`);
      console.log(`    Class: ${redemption.class.description}`);
      console.log(`    Package: ${redemption.packageBooking.package.name}`);
      console.log(`    Redeemed: ${new Date(redemption.redeemedAt).toLocaleString()}`);
    });
    
    // Check bookings with package links
    console.log('\n=== BOOKINGS WITH PACKAGE LINKS ===');
    
    const packageBookings = await prisma.booking.findMany({
      where: { packageBookingId: { not: null } },
      include: {
        packageBooking: {
          include: { user: true, package: true }
        },
        class: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Package bookings: ${packageBookings.length}`);
    
    packageBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      console.log(`  - ${booking.packageBooking.user.name}: ${classDate} at ${booking.class.time}`);
      console.log(`    Package: ${booking.packageBooking.package.name}`);
      console.log(`    Package Booking ID: ${booking.packageBookingId}`);
    });
    
    // Check individual bookings
    console.log('\n=== INDIVIDUAL BOOKINGS ===');
    
    const individualBookings = await prisma.booking.findMany({
      where: { packageBookingId: null },
      include: {
        class: true,
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`Individual bookings (showing first 5): ${individualBookings.length}`);
    
    individualBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const userName = booking.user ? booking.user.name : booking.name;
      console.log(`  - ${userName}: ${classDate} at ${booking.class.time}`);
      console.log(`    Class: ${booking.class.description}`);
      console.log(`    Paid: ${booking.paid}`);
    });
    
    console.log('\n✅ Package redemption system test complete!');
    
  } catch (error) {
    console.error('Error testing package redemption:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPackageRedemption(); 