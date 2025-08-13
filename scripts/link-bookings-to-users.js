const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function linkBookingsToUsers() {
  try {
    console.log('=== LINKING EXISTING BOOKINGS TO USER ACCOUNTS ===\n');

    // Get all bookings that don't have a userId
    const unlinkedBookings = await prisma.booking.findMany({
      where: {
        userId: null
      },
      include: {
        class: true
      }
    });

    console.log(`Found ${unlinkedBookings.length} bookings without user accounts`);

    let linkedCount = 0;
    let notFoundCount = 0;

    for (const booking of unlinkedBookings) {
      try {
        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: booking.email.toLowerCase() }
        });

        if (user) {
          // Link booking to user
          await prisma.booking.update({
            where: { id: booking.id },
            data: { userId: user.id }
          });

          console.log(`✅ Linked booking for ${booking.name} (${booking.email}) to user ${user.name}`);
          linkedCount++;
        } else {
          console.log(`❌ No user found for ${booking.name} (${booking.email})`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`Error linking booking ${booking.id}:`, error.message);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Linked: ${linkedCount} bookings`);
    console.log(`Not found: ${notFoundCount} bookings`);
    console.log(`Total processed: ${unlinkedBookings.length}`);

    if (notFoundCount > 0) {
      console.log('\nBookings without matching users:');
      for (const booking of unlinkedBookings) {
        const user = await prisma.user.findUnique({
          where: { email: booking.email.toLowerCase() }
        });
        if (!user) {
          console.log(`- ${booking.name}: ${booking.email}`);
        }
      }
    }

    // Show final stats
    console.log('\n=== FINAL STATS ===');
    const totalBookings = await prisma.booking.count();
    const linkedBookings = await prisma.booking.count({
      where: { userId: { not: null } }
    });
    const unlinkedBookingsFinal = await prisma.booking.count({
      where: { userId: null }
    });

    console.log(`Total bookings: ${totalBookings}`);
    console.log(`Linked to users: ${linkedBookings}`);
    console.log(`Still unlinked: ${unlinkedBookingsFinal}`);

  } catch (error) {
    console.error('Error linking bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
linkBookingsToUsers(); 