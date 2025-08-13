const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAllUsers() {
  try {
    // Delete all existing users first
    console.log('Deleting existing users...');
    await prisma.user.deleteMany({});
    console.log('Existing users deleted.');

    // Get all unique customers from existing bookings
    const bookings = await prisma.booking.findMany({
      select: {
        name: true,
        email: true,
        phone: true
      },
      distinct: ['email']
    });

    console.log(`Found ${bookings.length} total unique email addresses`);

    // Group by name to handle people with multiple emails
    const peopleMap = new Map();
    
    bookings.forEach(booking => {
      const existing = peopleMap.get(booking.name) || [];
      existing.push(booking);
      peopleMap.set(booking.name, existing);
    });

    console.log(`Found ${peopleMap.size} unique people who have booked classes`);

    const defaultPassword = 'Welcome2025!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    let createdCount = 0;
    let skippedCount = 0;

    for (const [name, emailBookings] of peopleMap) {
      try {
        // Find the best email for this person
        let bestEmail = null;
        let bestPhone = null;

        // First, try to find a real email (not example.com)
        const realEmail = emailBookings.find(booking => 
          !booking.email.includes('example.com') && 
          booking.email.includes('@')
        );

        if (realEmail) {
          bestEmail = realEmail.email;
          bestPhone = realEmail.phone;
        } else {
          // If no real email, use the example.com email but note it
          const exampleEmail = emailBookings.find(booking => booking.email.includes('example.com'));
          if (exampleEmail) {
            bestEmail = exampleEmail.email;
            bestPhone = exampleEmail.phone;
            console.log(`⚠️  Using example.com email for ${name}: ${bestEmail}`);
          }
        }

        if (!bestEmail) {
          console.log(`❌ No valid email found for ${name}`);
          continue;
        }

        // Check if user already exists (shouldn't since we deleted all)
        const existingUser = await prisma.user.findUnique({
          where: { email: bestEmail.toLowerCase() }
        });

        if (existingUser) {
          console.log(`User already exists: ${bestEmail}`);
          skippedCount++;
          continue;
        }

        // Create new user
        const user = await prisma.user.create({
          data: {
            email: bestEmail.toLowerCase(),
            name: name,
            phone: bestPhone || null,
            password: hashedPassword,
            isActive: true
          }
        });

        const emailType = bestEmail.includes('example.com') ? ' (EXAMPLE.COM)' : ' (REAL)';
        console.log(`✅ Created user: ${user.email} (${user.name})${emailType}`);
        createdCount++;

      } catch (error) {
        console.error(`Error creating user for ${name}:`, error.message);
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Created: ${createdCount} new users`);
    console.log(`Skipped: ${skippedCount} existing users`);
    console.log(`Default password: ${defaultPassword}`);
    console.log('\n=== ALL USERS CREATED ===');
    
    // List all created users
    const allUsers = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    
    allUsers.forEach(user => {
      const emailType = user.email.includes('example.com') ? ' (EXAMPLE.COM)' : ' (REAL)';
      console.log(`${user.name}: ${user.email}${emailType}`);
    });

    console.log('\nUsers with example.com emails will need to update their email address.');
    console.log('Users should change their password on first login.');

  } catch (error) {
    console.error('Error creating all users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAllUsers(); 