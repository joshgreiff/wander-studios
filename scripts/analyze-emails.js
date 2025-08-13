const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeEmails() {
  try {
    // Get all bookings with email info
    const bookings = await prisma.booking.findMany({
      select: {
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        class: {
          select: {
            date: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('=== ALL BOOKINGS WITH EMAILS ===\n');
    
    // Group by name to see all emails for each person
    const peopleMap = new Map();
    
    bookings.forEach(booking => {
      const existing = peopleMap.get(booking.name) || [];
      existing.push({
        email: booking.email,
        phone: booking.phone,
        createdAt: booking.createdAt,
        classDate: booking.class.date,
        classDescription: booking.class.description
      });
      peopleMap.set(booking.name, existing);
    });

    // Display each person's booking history
    peopleMap.forEach((bookings, name) => {
      console.log(`\n--- ${name} ---`);
      bookings.forEach((booking, index) => {
        const date = new Date(booking.createdAt).toLocaleDateString();
        const classDate = new Date(booking.classDate).toLocaleDateString();
        console.log(`${index + 1}. Email: ${booking.email}`);
        console.log(`   Phone: ${booking.phone || 'N/A'}`);
        console.log(`   Booked: ${date}`);
        console.log(`   Class: ${classDate} - ${booking.classDescription}`);
        console.log(`   Is Example.com: ${booking.email.includes('example.com')}`);
        console.log('');
      });
    });

    // Summary
    console.log('\n=== SUMMARY ===');
    const uniqueEmails = [...new Set(bookings.map(b => b.email))];
    const realEmails = uniqueEmails.filter(email => !email.includes('example.com'));
    const testEmails = uniqueEmails.filter(email => email.includes('example.com'));
    
    console.log(`Total unique emails: ${uniqueEmails.length}`);
    console.log(`Real emails: ${realEmails.length}`);
    console.log(`Test emails (example.com): ${testEmails.length}`);
    
    console.log('\nReal emails:');
    realEmails.forEach(email => console.log(`- ${email}`));
    
    console.log('\nTest emails:');
    testEmails.forEach(email => console.log(`- ${email}`));

  } catch (error) {
    console.error('Error analyzing emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
analyzeEmails(); 