const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixClassDates() {
  try {
    console.log('=== FIXING CLASS DATES ===\n');
    
    const classes = await prisma.class.findMany({
      where: {
        archived: false
      },
      select: {
        id: true,
        date: true,
        time: true,
        description: true
      }
    });
    
    console.log(`Found ${classes.length} active classes to fix:\n`);
    
    for (const classItem of classes) {
      console.log(`Fixing class ID ${classItem.id}: ${classItem.description}`);
      
      // The current date is stored as UTC midnight, but we want it to be the correct local date
      // We need to adjust it so it shows the correct day in the local timezone
      const currentDate = new Date(classItem.date);
      console.log(`  - Current date: ${currentDate.toISOString()}`);
      console.log(`  - Current display: ${currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
      
      // Add 12 hours to ensure it stays in the correct day in local timezone
      const fixedDate = new Date(currentDate.getTime() + 12 * 60 * 60 * 1000);
      console.log(`  - Fixed date: ${fixedDate.toISOString()}`);
      console.log(`  - Fixed display: ${fixedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`);
      
      // Update the class with the fixed date
      await prisma.class.update({
        where: { id: classItem.id },
        data: { date: fixedDate }
      });
      
      console.log(`  ✅ Updated class date\n`);
    }
    
    console.log('All class dates have been fixed!');
    
  } catch (error) {
    console.error('Error fixing class dates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClassDates(); 