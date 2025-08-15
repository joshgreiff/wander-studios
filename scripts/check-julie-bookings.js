const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkJulieBookings() {
  try {
    console.log('=== CHECKING JULIE WANDER BOOKINGS ===\n');

    // Get Julie's package purchase time
    const juliePackage = await prisma.packageBooking.findFirst({
      where: {
        customerEmail: 'jwander97@gmail.com'
      },
      include: {
        package: true
      }
    });

    if (juliePackage) {
      const packageTime = new Date(juliePackage.createdAt);
      console.log(`📦 Julie's package purchase: ${packageTime.toLocaleString()}`);
      console.log(`   Package: ${juliePackage.package.name} - $${juliePackage.package.price}`);
      console.log(`   Paid: ${juliePackage.paid ? 'Yes' : 'No'}`);
      console.log('');
    }

    // Get all of Julie's current bookings
    const julieBookings = await prisma.booking.findMany({
      where: {
        email: 'jwander97@gmail.com'
      },
      include: {
        class: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Julie's current booking history (${julieBookings.length} bookings):`);
    julieBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log(`  Name: ${booking.name}`);
      console.log(`  Email: ${booking.email}`);
      console.log('');
    });

    // Check what Julie's deleted bookings were
    console.log(`🗑️  Julie's deleted bookings (from our reset):`);
    console.log(`1. Class: 8/24/2025 at 10:00 - Booked: 8/14/2025, 8:03:00 PM`);
    console.log(`2. Class: 8/30/2025 at 09:45 - Booked: 8/14/2025, 8:03:32 PM`);
    console.log('');

    // Check if Julie had any legitimate payments around those dates
    console.log(`💳 Julie's payment timeline:`);
    console.log(`- Package purchased: August 15, 2025 at 2:18:04 PM`);
    console.log(`- First booking deleted: August 14, 2025 at 8:03:00 PM (BEFORE package purchase)`);
    console.log(`- Second booking deleted: August 14, 2025 at 8:03:32 PM (BEFORE package purchase)`);
    console.log('');

    console.log(`🔍 Analysis:`);
    console.log(`- Julie's bookings were made on August 14th`);
    console.log(`- Her package was purchased on August 15th`);
    console.log(`- The bookings were made BEFORE the package purchase`);
    console.log(`- This suggests she may have paid individually for those classes`);
    console.log(`- But we don't have payment records for them`);
    console.log('');

    console.log(`📧 Recommendation:`);
    console.log(`- Julie should contact you to clarify if she paid for those classes`);
    console.log(`- If she did pay, we should restore those bookings`);
    console.log(`- If she didn't pay, she can use her package to rebook`);

  } catch (error) {
    console.error('Error checking Julie bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJulieBookings(); 