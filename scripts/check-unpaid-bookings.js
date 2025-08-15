const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUnpaidBookings() {
  try {
    console.log('=== CHECKING UNPAID BOOKINGS AFTER AUGUST 13, 2025 ===\n');

    // Get the cutoff date (August 13, 2025 at 11:20 PM)
    const cutoffDate = new Date('2025-08-13T23:20:00.000Z');
    console.log(`Cutoff date: ${cutoffDate.toLocaleString()}\n`);

    // Get all bookings after the cutoff date
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gt: cutoffDate
        }
      },
      include: {
        class: true,
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${recentBookings.length} bookings after August 13, 2025\n`);

    // Separate paid vs unpaid bookings
    const paidBookings = recentBookings.filter(booking => booking.paid);
    const unpaidBookings = recentBookings.filter(booking => !booking.paid);

    console.log(`📊 SUMMARY:`);
    console.log(`- Total bookings after cutoff: ${recentBookings.length}`);
    console.log(`- Paid bookings: ${paidBookings.length}`);
    console.log(`- Unpaid bookings: ${unpaidBookings.length}\n`);

    if (paidBookings.length > 0) {
      console.log(`✅ PAID BOOKINGS (KEEP THESE):`);
      paidBookings.forEach(booking => {
        const classDate = new Date(booking.class.date).toLocaleDateString();
        const bookingDate = new Date(booking.createdAt).toLocaleString();
        console.log(`- ${booking.name} (${booking.email}) - Class: ${classDate} at ${booking.class.time} - Booked: ${bookingDate}`);
      });
      console.log('');
    }

    if (unpaidBookings.length > 0) {
      console.log(`❌ UNPAID BOOKINGS (NEED TO BE REMOVED):`);
      console.log(`\nPeople who need to rebook:`);
      
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

      console.log(`\n📧 CONTACT LIST FOR REBOOKING:`);
      console.log(`Total people to contact: ${peopleToContact.length}\n`);
      
      peopleToContact.forEach((person, index) => {
        console.log(`${index + 1}. ${person.name}`);
        console.log(`   Email: ${person.email}`);
        if (person.phone) console.log(`   Phone: ${person.phone}`);
        console.log(`   Class: ${person.classDate} at ${person.classTime} - ${person.classDescription}`);
        console.log(`   Original booking: ${person.bookingDate}`);
        console.log('');
      });

      // Group by email to avoid duplicates
      const uniquePeople = [];
      const seenEmails = new Set();
      
      peopleToContact.forEach(person => {
        if (!seenEmails.has(person.email)) {
          seenEmails.add(person.email);
          uniquePeople.push(person);
        }
      });

      console.log(`📋 UNIQUE PEOPLE TO CONTACT (${uniquePeople.length}):`);
      uniquePeople.forEach((person, index) => {
        console.log(`${index + 1}. ${person.name} (${person.email})`);
      });

      return {
        totalBookings: recentBookings.length,
        paidBookings: paidBookings.length,
        unpaidBookings: unpaidBookings.length,
        peopleToContact: uniquePeople
      };
    } else {
      console.log(`✅ No unpaid bookings found after August 13, 2025!`);
      return {
        totalBookings: recentBookings.length,
        paidBookings: paidBookings.length,
        unpaidBookings: 0,
        peopleToContact: []
      };
    }

  } catch (error) {
    console.error('Error checking bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUnpaidBookings(); 