const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function mergeMadelynMady() {
  try {
    console.log('=== MERGING MADELYN AND MADY GIBSON ===\n');

    // Find both users
    const madelyn = await prisma.user.findFirst({
      where: { name: 'Madelyn Gibson' }
    });

    const mady = await prisma.user.findFirst({
      where: { name: 'Mady Gibson' }
    });

    if (!madelyn || !mady) {
      console.log('❌ Could not find both users');
      return;
    }

    console.log('Found users:');
    console.log(`- Madelyn Gibson: ${madelyn.email} (ID: ${madelyn.id})`);
    console.log(`- Mady Gibson: ${mady.email} (ID: ${mady.id})`);

    // Update Madelyn's bookings to point to Mady's user account
    console.log('\nUpdating Madelyn\'s bookings to point to Mady\'s account...');
    
    const updatedBookings = await prisma.booking.updateMany({
      where: { userId: madelyn.id },
      data: { userId: mady.id }
    });

    console.log(`✅ Updated ${updatedBookings.count} bookings`);

    // Delete Madelyn's user account
    console.log('\nDeleting Madelyn\'s user account...');
    await prisma.user.delete({
      where: { id: madelyn.id }
    });

    console.log('✅ Deleted Madelyn\'s account');

    // Show final result
    console.log('\n=== FINAL RESULT ===');
    const finalUsers = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    
    finalUsers.forEach(user => {
      const isExample = user.email.includes('example.com');
      console.log(`${user.name}: ${user.email}${isExample ? ' (EXAMPLE.COM)' : ' (REAL)'}`);
    });

    console.log(`\nTotal users: ${finalUsers.length}`);
    console.log('✅ Madelyn and Mady Gibson successfully merged!');

  } catch (error) {
    console.error('Error merging users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
mergeMadelynMady(); 