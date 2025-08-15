const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBrookeIcloud() {
  try {
    console.log('=== CHECKING BROOKE ICLOUD BOOKING ===\n');

    // Check for any bookings with icloud.com email
    const icloudBookings = await prisma.booking.findMany({
      where: {
        email: {
          contains: 'icloud.com'
        }
      },
      include: {
        class: true
      }
    });

    console.log(`📧 Bookings with icloud.com emails (${icloudBookings.length}):`);
    icloudBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- ${booking.name} (${booking.email})`);
      console.log(`  Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log('');
    });

    // Check for any Brooke bookings with any email
    const allBrookeBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { name: { contains: 'Brooke' } },
          { email: { contains: 'brooke' } }
        ]
      },
      include: {
        class: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`🔍 All Brooke bookings (any email/name variation):`);
    allBrookeBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- ${booking.name} (${booking.email})`);
      console.log(`  Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log('');
    });

    // Check if there are any deleted bookings in the database (they might still be there)
    console.log(`\n📊 Current total bookings in database: ${allBrookeBookings.length}`);

  } catch (error) {
    console.error('Error checking Brooke icloud booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrookeIcloud(); 