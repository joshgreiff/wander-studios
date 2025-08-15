const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBrookeBookings() {
  try {
    console.log('=== CHECKING BROOKE HALL BOOKINGS ===\n');

    // Get Brooke's package purchase time
    const brookePackage = await prisma.packageBooking.findFirst({
      where: {
        customerEmail: 'brookeleeh9@gmail.com'
      },
      include: {
        package: true
      }
    });

    if (brookePackage) {
      const packageTime = new Date(brookePackage.createdAt);
      console.log(`📦 Brooke's package purchase: ${packageTime.toLocaleString()}`);
      console.log(`   Package: ${brookePackage.package.name} - $${brookePackage.package.price}`);
      console.log(`   Paid: ${brookePackage.paid ? 'Yes' : 'No'}`);
      console.log('');
    }

    // Get all of Brooke's bookings
    const brookeBookings = await prisma.booking.findMany({
      where: {
        email: 'brookeleeh9@gmail.com'
      },
      include: {
        class: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📋 Brooke's booking history (${brookeBookings.length} bookings):`);
    brookeBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log(`  Name: ${booking.name}`);
      console.log(`  Email: ${booking.email}`);
      console.log('');
    });

    // Check if there were any bookings around August 13th
    const august13Start = new Date('2025-08-13T00:00:00.000Z');
    const august13End = new Date('2025-08-13T23:59:59.999Z');
    
    const august13Bookings = brookeBookings.filter(booking => {
      const bookingTime = new Date(booking.createdAt);
      return bookingTime >= august13Start && bookingTime <= august13End;
    });

    console.log(`📅 Brooke's bookings on August 13, 2025 (${august13Bookings.length}):`);
    august13Bookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log('');
    });

    // Check if Brooke's email might be different
    const allBrookeBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { email: 'brookeleeh9@gmail.com' },
          { email: 'brookeleeh9@icloud.com' },
          { name: { contains: 'Brooke' } }
        ]
      },
      include: {
        class: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`🔍 All bookings for Brooke (any email/name variation):`);
    allBrookeBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingTime = new Date(booking.createdAt);
      console.log(`- ${booking.name} (${booking.email})`);
      console.log(`  Class: ${classDate} at ${booking.class.time}`);
      console.log(`  Booked: ${bookingTime.toLocaleString()}`);
      console.log(`  Paid: ${booking.paid}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking Brooke bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBrookeBookings(); 