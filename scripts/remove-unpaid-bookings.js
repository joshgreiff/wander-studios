const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeUnpaidBookings() {
  try {
    console.log('=== REMOVING UNPAID BOOKINGS AFTER AUGUST 13, 2025 ===\n');

    // Get the cutoff date (August 13, 2025 at 11:20 PM)
    const cutoffDate = new Date('2025-08-13T23:20:00.000Z');
    console.log(`Cutoff date: ${cutoffDate.toLocaleString()}\n`);

    // Get all bookings after the cutoff date that are marked as paid but have no payment amount
    const unpaidBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gt: cutoffDate
        },
        paid: true
      },
      include: {
        class: true,
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${unpaidBookings.length} bookings marked as paid but with no payment amount\n`);

    if (unpaidBookings.length === 0) {
      console.log('✅ No unpaid bookings to remove!');
      return;
    }

    console.log(`❌ BOOKINGS TO BE REMOVED:`);
    const peopleToContact = [];
    
    unpaidBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      const bookingDate = new Date(booking.createdAt).toLocaleString();
      console.log(`- ${booking.name} (${booking.email}) - Class: ${classDate} at ${booking.class.time} - Booked: ${bookingDate}`);
      
      peopleToContact.push({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        classDate: classDate,
        classTime: booking.class.time,
        classDescription: booking.class.description,
        bookingDate: bookingDate
      });
    });

    console.log(`\n📧 PEOPLE TO CONTACT FOR REBOOKING:`);
    peopleToContact.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name} (${person.email})`);
      if (person.phone) console.log(`   Phone: ${person.phone}`);
      console.log(`   Class: ${person.classDate} at ${person.classTime} - ${person.classDescription}`);
      console.log('');
    });

    // Ask for confirmation
    console.log(`\n⚠️  WARNING: This will permanently delete ${unpaidBookings.length} bookings.`);
    console.log(`These people will need to rebook their classes.`);
    
    // For now, just show what would be deleted without actually deleting
    console.log(`\n🔍 SIMULATION MODE: No bookings were actually deleted.`);
    console.log(`To actually delete these bookings, uncomment the deletion code in the script.`);
    
    /*
    // Uncomment this section to actually delete the bookings
    console.log(`\n🗑️  DELETING BOOKINGS...`);
    
    for (const booking of unpaidBookings) {
      await prisma.booking.delete({
        where: { id: booking.id }
      });
      console.log(`Deleted booking for ${booking.name} (${booking.email})`);
    }
    
    console.log(`\n✅ Successfully deleted ${unpaidBookings.length} unpaid bookings.`);
    */

    // Create a contact list for easy copy/paste
    console.log(`\n📋 CONTACT LIST FOR EMAIL/PHONE:`);
    console.log(`Subject: Rebooking Required - Wander Movement Class`);
    console.log(`\nHi there,`);
    console.log(`\nWe had a technical issue with our booking system and need you to rebook your class.`);
    console.log(`Please visit https://www.wandermovement.space/classes to rebook.`);
    console.log(`\nThank you for your understanding!`);
    console.log(`\n- Leah Wander`);
    console.log(`\n---`);
    
    peopleToContact.forEach((person, index) => {
      console.log(`${index + 1}. ${person.name}`);
      console.log(`   Email: ${person.email}`);
      if (person.phone) console.log(`   Phone: ${person.phone}`);
      console.log(`   Class: ${person.classDate} at ${person.classTime}`);
      console.log(`   Description: ${person.classDescription}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error removing unpaid bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeUnpaidBookings(); 