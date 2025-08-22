const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBookingsSimple() {
  try {
    console.log('=== UPDATING BOOKINGS WITH PACKAGE LINKS ===\n');
    
    // Get all package redemptions
    const redemptions = await prisma.packageRedemption.findMany({
      include: {
        packageBooking: true,
        class: true
      }
    });
    
    console.log(`Found ${redemptions.length} package redemptions\n`);
    
    for (const redemption of redemptions) {
      console.log(`Processing redemption ID ${redemption.id}:`);
      console.log(`  Class ID: ${redemption.classId}`);
      console.log(`  Package Booking ID: ${redemption.packageBookingId}`);
      
      // Find the corresponding booking
      const booking = await prisma.booking.findFirst({
        where: {
          classId: redemption.classId,
          userId: redemption.packageBooking.userId
        }
      });
      
      if (booking) {
        // Update the booking to link it to the package
        await prisma.booking.update({
          where: { id: booking.id },
          data: { packageBookingId: redemption.packageBookingId }
        });
        
        console.log(`  ✅ Updated booking ID ${booking.id}`);
      } else {
        console.log(`  ❌ No matching booking found`);
      }
      
      console.log('');
    }
    
    // Verify the updates
    console.log('=== VERIFICATION ===');
    
    const linkedBookings = await prisma.booking.findMany({
      where: { packageBookingId: { not: null } },
      include: {
        packageBooking: {
          include: { user: true, package: true }
        },
        class: true
      }
    });
    
    console.log(`Bookings now linked to packages: ${linkedBookings.length}`);
    
    linkedBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      console.log(`  - ${booking.packageBooking.user.name}: ${classDate} at ${booking.class.time}`);
      console.log(`    Package: ${booking.packageBooking.package.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingsSimple(); 