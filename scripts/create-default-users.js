const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDefaultUsers() {
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

    // Filter out example.com emails and create a map to handle duplicates
    const validBookings = bookings.filter(booking => 
      !booking.email.includes('example.com') && 
      booking.email.includes('@') // Ensure it's a valid email
    );

    // Create a map to handle duplicate names - keep the most recent/real email
    const userMap = new Map();
    
    validBookings.forEach(booking => {
      const existing = userMap.get(booking.name);
      if (!existing || booking.email.includes('@gmail.com') || booking.email.includes('@yahoo.com') || booking.email.includes('@hotmail.com')) {
        // Prefer real email domains over example.com
        userMap.set(booking.name, booking);
      }
    });

    const uniqueUsers = Array.from(userMap.values());

    console.log(`Found ${bookings.length} total bookings`);
    console.log(`Filtered to ${uniqueUsers.length} valid users (removed example.com and duplicates)`);

    const defaultPassword = 'Welcome2025!'; // Default password for all users
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    let createdCount = 0;

    for (const booking of uniqueUsers) {
      try {
        // Create new user
        const user = await prisma.user.create({
          data: {
            email: booking.email.toLowerCase(),
            name: booking.name,
            phone: booking.phone || null,
            password: hashedPassword,
            isActive: true
          }
        });

        console.log(`Created user: ${user.email} (${user.name})`);
        createdCount++;

      } catch (error) {
        console.error(`Error creating user for ${booking.email}:`, error.message);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Created: ${createdCount} new users`);
    console.log(`Default password: ${defaultPassword}`);
    console.log('\nUsers should change their password on first login.');

  } catch (error) {
    console.error('Error creating default users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultUsers(); 