const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkRecentBookings() {
  try {
    console.log('=== CHECKING RECENT BOOKINGS ===\n');

    // Get bookings from the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: yesterday
        }
      },
      include: {
        class: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📅 Recent bookings (last 24 hours): ${recentBookings.length}\n`);

    if (recentBookings.length > 0) {
      recentBookings.forEach(booking => {
        const classDate = new Date(booking.class.date).toLocaleDateString();
        const bookingTime = new Date(booking.createdAt).toLocaleString();
        console.log(`- ${booking.name} (${booking.email})`);
        console.log(`  Class: ${classDate} at ${booking.class.time} - ${booking.class.description}`);
        console.log(`  Booked: ${bookingTime}`);
        console.log(`  Paid: ${booking.paid}`);
        console.log(`  Phone: ${booking.phone || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('No recent bookings found in the last 24 hours.');
    }

    // Check for any failed payments or issues
    console.log('🔍 Checking for potential issues...\n');

    // Check if there are any classes with bookings but no recent activity
    const classesWithBookings = await prisma.class.findMany({
      where: {
        archived: false,
        date: {
          gte: new Date()
        }
      },
      include: {
        bookings: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`📊 Upcoming classes with bookings:`);
    classesWithBookings.forEach(classItem => {
      const classDate = new Date(classItem.date).toLocaleDateString();
      const recentBookings = classItem.bookings.filter(b => 
        new Date(b.createdAt) >= yesterday
      );
      
      console.log(`- ${classDate} at ${classItem.time} - ${classItem.description}`);
      console.log(`  Total bookings: ${classItem.bookings.length}`);
      console.log(`  Recent bookings (24h): ${recentBookings.length}`);
      console.log(`  Capacity: ${classItem.capacity}`);
      console.log('');
    });

    // Check package redemptions
    const recentRedemptions = await prisma.packageRedemption.findMany({
      where: {
        redeemedAt: {
          gte: yesterday
        }
      },
      include: {
        packageBooking: {
          include: {
            user: true
          }
        },
        class: true
      },
      orderBy: {
        redeemedAt: 'desc'
      }
    });

    console.log(`🎫 Recent package redemptions (24h): ${recentRedemptions.length}`);
    if (recentRedemptions.length > 0) {
      recentRedemptions.forEach(redemption => {
        const classDate = new Date(redemption.class.date).toLocaleDateString();
        const redemptionTime = new Date(redemption.redeemedAt).toLocaleString();
        console.log(`- ${redemption.packageBooking.customerName} (${redemption.packageBooking.customerEmail})`);
        console.log(`  Class: ${classDate} at ${redemption.class.time}`);
        console.log(`  Redeemed: ${redemptionTime}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error checking recent bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentBookings(); 