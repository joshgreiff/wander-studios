const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function linkBookingsByName() {
  try {
    console.log('=== LINKING REMAINING BOOKINGS BY NAME ===\n');

    // Get all bookings that don't have a userId
    const unlinkedBookings = await prisma.booking.findMany({
      where: { userId: null },
      include: { class: true }
    });

    console.log(`Found ${unlinkedBookings.length} bookings without user accounts`);

    let linkedCount = 0;
    let notFoundCount = 0;

    for (const booking of unlinkedBookings) {
      try {
        // Find user by name (handle Madelyn/Mady case)
        let userName = booking.name;
        if (booking.name === 'Madelyn Gibson') {
          userName = 'Mady Gibson';
        }

        const user = await prisma.user.findFirst({
          where: { name: userName }
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

    // Show final stats
    const totalBookings = await prisma.booking.count();
    const linkedBookings = await prisma.booking.count({
      where: { userId: { not: null } }
    });
    const unlinkedBookingsFinal = await prisma.booking.count({
      where: { userId: null }
    });

    console.log(`\nTotal bookings: ${totalBookings}`);
    console.log(`Linked to users: ${linkedBookings}`);
    console.log(`Still unlinked: ${unlinkedBookingsFinal}`);

    if (unlinkedBookingsFinal === 0) {
      console.log('\n🎉 ALL BOOKINGS ARE NOW LINKED TO USER ACCOUNTS!');
    }

  } catch (error) {
    console.error('Error linking bookings by name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

linkBookingsByName(); 