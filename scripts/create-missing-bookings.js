const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingBookings() {
  try {
    console.log('=== CREATING MISSING BOOKINGS ===\n');

    // Find the August 16th class (ID: 2)
    const august16Class = await prisma.class.findUnique({
      where: {
        id: 2
      }
    });

    if (!august16Class) {
      console.log('❌ August 16th class not found!');
      return;
    }

    console.log(`📅 Found class: ${august16Class.date} at ${august16Class.time} - ${august16Class.description}\n`);

    // Check current bookings for this class
    const currentBookings = await prisma.booking.findMany({
      where: {
        classId: august16Class.id
      }
    });

    console.log(`📊 Current bookings: ${currentBookings.length}/${august16Class.capacity}\n`);

    // Create booking for Cori Snyder
    const coriBooking = await prisma.booking.create({
      data: {
        name: 'Cori Snyder',
        email: 'cnhinkle@yahoo.com',
        phone: '+16143270844',
        classId: august16Class.id,
        paid: true,
        waiverName: 'Cori Snyder',
        waiverAgreed: true
      }
    });

    console.log('✅ Created booking for Cori Snyder:');
    console.log(`   - Name: ${coriBooking.name}`);
    console.log(`   - Email: ${coriBooking.email}`);
    console.log(`   - Phone: ${coriBooking.phone}`);
    console.log(`   - Paid: ${coriBooking.paid}`);
    console.log(`   - Created: ${new Date(coriBooking.createdAt).toLocaleString()}\n`);

    // Create booking for Kirsten Bradley
    const kirstenBooking = await prisma.booking.create({
      data: {
        name: 'Kirsten Bradley',
        email: 'kirsten.bradley26@gmail.com',
        phone: '+16147837705',
        classId: august16Class.id,
        paid: true,
        waiverName: 'Kirsten Bradley',
        waiverAgreed: true
      }
    });

    console.log('✅ Created booking for Kirsten Bradley:');
    console.log(`   - Name: ${kirstenBooking.name}`);
    console.log(`   - Email: ${kirstenBooking.email}`);
    console.log(`   - Phone: ${kirstenBooking.phone}`);
    console.log(`   - Paid: ${kirstenBooking.paid}`);
    console.log(`   - Created: ${new Date(kirstenBooking.createdAt).toLocaleString()}\n`);

    // Check if these users exist and link bookings
    const coriUser = await prisma.user.findFirst({
      where: {
        email: 'cnhinkle@yahoo.com'
      }
    });

    const kirstenUser = await prisma.user.findFirst({
      where: {
        email: 'kirsten.bradley26@gmail.com'
      }
    });

    if (coriUser) {
      await prisma.booking.update({
        where: { id: coriBooking.id },
        data: { userId: coriUser.id }
      });
      console.log('🔗 Linked Cori\'s booking to existing user account');
    } else {
      console.log('⚠️  No existing user account found for Cori - booking not linked');
    }

    if (kirstenUser) {
      await prisma.booking.update({
        where: { id: kirstenBooking.id },
        data: { userId: kirstenUser.id }
      });
      console.log('🔗 Linked Kirsten\'s booking to existing user account');
    } else {
      console.log('⚠️  No existing user account found for Kirsten - booking not linked');
    }

    // Final count
    const finalBookings = await prisma.booking.findMany({
      where: {
        classId: august16Class.id
      }
    });

    console.log(`\n📊 Final booking count: ${finalBookings.length}/${august16Class.capacity}`);
    console.log(`🎯 Spots remaining: ${august16Class.capacity - finalBookings.length}`);

    if (finalBookings.length >= august16Class.capacity) {
      console.log('⚠️  Class is now FULL!');
    }

  } catch (error) {
    console.error('❌ Error creating bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingBookings(); 