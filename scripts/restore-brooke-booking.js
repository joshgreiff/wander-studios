const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function restoreBrookeBooking() {
  try {
    console.log('=== RESTORING BROOKE HALL AUGUST 13TH BOOKING ===\n');

    // Find the August 16th class (the one Brooke booked for)
    const august16Class = await prisma.class.findFirst({
      where: {
        date: {
          gte: new Date('2025-08-16T00:00:00.000Z'),
          lt: new Date('2025-08-17T00:00:00.000Z')
        }
      }
    });

    if (!august16Class) {
      console.log('❌ August 16th class not found');
      return;
    }

    console.log(`📅 Found August 16th class: ${august16Class.description} at ${august16Class.time}`);

    // Check if Brooke already has a booking for this class
    const existingBooking = await prisma.booking.findFirst({
      where: {
        classId: august16Class.id,
        OR: [
          { email: 'brookeleeh9@gmail.com' },
          { email: 'brookeleeh9@icloud.com' },
          { name: 'Brooke Hall' }
        ]
      }
    });

    if (existingBooking) {
      console.log(`⚠️  Brooke already has a booking for this class:`);
      console.log(`   ${existingBooking.name} (${existingBooking.email})`);
      console.log(`   Paid: ${existingBooking.paid}`);
      return;
    }

    // Create the restored booking
    const restoredBooking = await prisma.booking.create({
      data: {
        classId: august16Class.id,
        name: 'Brooke Hall',
        email: 'brookeleeh9@icloud.com', // Use the email from the Square receipt
        phone: '+15136016328', // From the Square receipt
        waiverName: 'Brooke Hall',
        waiverAgreed: true,
        paid: true, // This was a legitimate paid booking
        createdAt: new Date('2025-08-13T23:20:00.000Z') // Original booking time
      }
    });

    console.log(`✅ Restored Brooke's August 13th booking:`);
    console.log(`   Name: ${restoredBooking.name}`);
    console.log(`   Email: ${restoredBooking.email}`);
    console.log(`   Phone: ${restoredBooking.phone}`);
    console.log(`   Class: August 16th at ${august16Class.time}`);
    console.log(`   Paid: ${restoredBooking.paid}`);
    console.log(`   Original booking time: ${restoredBooking.createdAt.toLocaleString()}`);

    // Check Brooke's current package status
    const brookePackage = await prisma.packageBooking.findFirst({
      where: {
        customerEmail: 'brookeleeh9@gmail.com'
      },
      include: {
        package: true
      }
    });

    if (brookePackage) {
      console.log(`\n📦 Brooke's package status:`);
      console.log(`   Package: ${brookePackage.package.name}`);
      console.log(`   Classes used: ${brookePackage.classesUsed}`);
      console.log(`   Classes remaining: ${brookePackage.classesRemaining}`);
      console.log(`   Expires: ${new Date(brookePackage.expiresAt).toLocaleDateString()}`);
      console.log(`   Paid: ${brookePackage.paid}`);
    }

    console.log(`\n🎉 Brooke's booking has been restored!`);
    console.log(`- Her August 13th paid booking is now in the system`);
    console.log(`- She can still use her package for future bookings`);

  } catch (error) {
    console.error('Error restoring Brooke booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreBrookeBooking(); 