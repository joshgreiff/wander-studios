const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkClassDates() {
  try {
    console.log('=== CHECKING CLASS DATES ===\n');
    
    const classes = await prisma.class.findMany({
      where: {
        archived: false
      },
      select: {
        id: true,
        date: true,
        time: true,
        description: true
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    console.log(`Found ${classes.length} active classes:\n`);
    
    classes.forEach((classItem, index) => {
      console.log(`${index + 1}. ${classItem.description}`);
      console.log(`   - ID: ${classItem.id}`);
      console.log(`   - Date: ${classItem.date.toISOString()}`);
      console.log(`   - Current Display: ${classItem.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'America/New_York'
      })}`);
      console.log(`   - Correct Display: ${classItem.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
      console.log(`   - Time: ${classItem.time}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking class dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClassDates(); 