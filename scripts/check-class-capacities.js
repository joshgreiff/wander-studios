const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClassCapacities() {
  try {
    console.log('=== CHECKING CLASS CAPACITIES ===\n');

    const classes = await prisma.class.findMany({
      where: { archived: false },
      include: {
        bookings: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log(`Found ${classes.length} active classes:\n`);

    classes.forEach((classItem, index) => {
      console.log(`${index + 1}. ${classItem.description}`);
      console.log(`   - ID: ${classItem.id}`);
      console.log(`   - Date: ${classItem.date.toLocaleDateString()}`);
      console.log(`   - Time: ${classItem.time}`);
      console.log(`   - Capacity: ${classItem.capacity}`);
      console.log(`   - Current Bookings: ${classItem.bookings.length}`);
      console.log(`   - Available Spots: ${classItem.capacity - classItem.bookings.length}`);
      console.log(`   - Status: ${classItem.bookings.length >= classItem.capacity ? 'FULL' : 'Available'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking class capacities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClassCapacities(); 