const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJulieRedemptions() {
  try {
    console.log('=== CHECKING JULIE\'S PACKAGE REDEMPTIONS ===\n');
    
    // Find Julie's user account
    const julie = await prisma.user.findFirst({
      where: { email: 'jwander97@gmail.com' }
    });
    
    if (!julie) {
      console.log('❌ Julie Wander user account not found');
      return;
    }
    
    console.log(`✅ Found Julie: ${julie.name} (${julie.email})\n`);
    
    // Get Julie's package booking
    const juliePackage = await prisma.packageBooking.findFirst({
      where: { userId: julie.id },
      include: { package: true }
    });
    
    if (!juliePackage) {
      console.log('❌ No package found for Julie');
      return;
    }
    
    console.log(`📦 Julie's Package:`);
    console.log(`   Package: ${juliePackage.package.name}`);
    console.log(`   Created: ${new Date(juliePackage.createdAt).toLocaleString()}`);
    console.log(`   Paid: ${juliePackage.paid}`);
    console.log(`   Classes Used: ${juliePackage.classesUsed}`);
    console.log(`   Classes Remaining: ${juliePackage.classesRemaining}`);
    console.log('');
    
    // Get Julie's individual class bookings
    const julieBookings = await prisma.booking.findMany({
      where: { userId: julie.id },
      include: { class: true },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📅 Julie's Class Bookings (${julieBookings.length}):`);
    julieBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt).toLocaleString();
      console.log(`   - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
      console.log(`     Booked: ${bookingTime}`);
      console.log(`     Paid: ${booking.paid}`);
      console.log(`     Booking ID: ${booking.id}`);
      console.log('');
    });
    
    // Check if these bookings are linked to package redemptions
    const packageRedemptions = await prisma.packageRedemption.findMany({
      where: { packageBookingId: juliePackage.id },
      include: { class: true },
      orderBy: { redeemedAt: 'asc' }
    });
    
    console.log(`🎫 Package Redemptions (${packageRedemptions.length}):`);
    packageRedemptions.forEach(redemption => {
      const classDate = new Date(redemption.class.date).toLocaleDateString();
      const redemptionTime = new Date(redemption.redeemedAt).toLocaleString();
      console.log(`   - ${classDate} at ${redemption.class.time} - ${redemption.class.description}`);
      console.log(`     Redeemed: ${redemptionTime}`);
      console.log(`     Class ID: ${redemption.classId}`);
      console.log('');
    });
    
    // Cross-reference bookings with redemptions
    console.log('=== CROSS-REFERENCE ANALYSIS ===');
    
    julieBookings.forEach(booking => {
      const matchingRedemption = packageRedemptions.find(r => r.classId === booking.classId);
      const classDate = new Date(booking.class.date).toLocaleDateString();
      
      if (matchingRedemption) {
        console.log(`✅ ${classDate} - ${booking.class.description}: Package redemption confirmed`);
      } else {
        console.log(`❌ ${classDate} - ${booking.class.description}: No package redemption found`);
      }
    });
    
    // Check timing
    console.log('\n=== TIMING ANALYSIS ===');
    console.log(`Package created: ${new Date(juliePackage.createdAt).toLocaleString()}`);
    
    julieBookings.forEach(booking => {
      const bookingTime = new Date(booking.createdAt).toLocaleString();
      const isAfterPackage = booking.createdAt > juliePackage.createdAt;
      console.log(`Booking ${booking.id}: ${bookingTime} (${isAfterPackage ? 'AFTER' : 'BEFORE'} package creation)`);
    });
    
  } catch (error) {
    console.error('Error checking Julie\'s redemptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJulieRedemptions(); 