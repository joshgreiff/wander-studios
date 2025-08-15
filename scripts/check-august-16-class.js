const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAugust16Class() {
  try {
    console.log('=== CHECKING AUGUST 16TH CLASS ===\n');

    // Get all classes to see the date format
    const allClasses = await prisma.class.findMany({
      where: {
        archived: false
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log('📅 All upcoming classes:');
    allClasses.forEach(classItem => {
      console.log(`- ${classItem.date} at ${classItem.time} - ${classItem.description} (ID: ${classItem.id})`);
    });

    // Look for August 16th specifically
    const august16Classes = allClasses.filter(c => {
      const classDate = new Date(c.date);
      return classDate.getMonth() === 7 && classDate.getDate() === 16; // August is month 7 (0-indexed)
    });

    console.log(`\n🎯 August 16th classes found: ${august16Classes.length}`);
    august16Classes.forEach(classItem => {
      console.log(`- ${classItem.date} at ${classItem.time} - ${classItem.description} (ID: ${classItem.id})`);
    });

  } catch (error) {
    console.error('❌ Error checking classes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAugust16Class(); 