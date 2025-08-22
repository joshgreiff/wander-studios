const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateBookingsWithPackageLinks() {
  try {
    console.log('=== UPDATING BOOKINGS WITH PACKAGE LINKS ===\n');
    
    // Get all package redemptions
    const redemptions = await prisma.packageRedemption.findMany({
      include: {
        packageBooking: {
          include: { user: true }
        },
        class: true
      }
    });
    
    console.log(`Found ${redemptions.length} package redemptions to process\n`);
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const redemption of redemptions) {
      console.log(`Processing redemption for ${redemption.packageBooking.user.name}:`);
      console.log(`  Class: ${redemption.class.description}`);
      console.log(`  Date: ${new Date(redemption.class.date).toLocaleDateString()}`);
      console.log(`  Package: ${redemption.packageBooking.package.name}`);
      
      // Find the corresponding booking
      const booking = await prisma.booking.findFirst({
        where: {
          classId: redemption.classId,
          email: redemption.packageBooking.customerEmail,
          userId: redemption.packageBooking.userId
        }
      });
      
      if (booking) {
        // Update the booking to link it to the package
        await prisma.booking.update({
          where: { id: booking.id },
          data: { packageBookingId: redemption.packageBookingId }
        });
        
        console.log(`  ✅ Updated booking ID ${booking.id} to link to package ${redemption.packageBookingId}`);
        updatedCount++;
      } else {
        console.log(`  ❌ No matching booking found for this redemption`);
        notFoundCount++;
      }
      
      console.log('');
    }
    
    console.log('=== SUMMARY ===');
    console.log(`✅ Updated: ${updatedCount} bookings`);
    console.log(`❌ Not found: ${notFoundCount} bookings`);
    console.log(`📊 Total processed: ${redemptions.length}`);
    
    // Verify the updates
    console.log('\n=== VERIFICATION ===');
    
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
      console.log(`    Class: ${booking.class.description}`);
      console.log(`    Package: ${booking.packageBooking.package.name}`);
    });
    
  } catch (error) {
    console.error('Error updating bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBookingsWithPackageLinks(); 