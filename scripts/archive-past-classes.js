const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function archivePastClasses() {
  try {
    const now = new Date();
    
    // Find classes that have already passed their date/time
    const pastClasses = await prisma.class.findMany({
      where: {
        archived: false,
        OR: [
          {
            date: {
              lt: now // Date is before now
            }
          },
          {
            AND: [
              {
                date: {
                  equals: new Date(now.toISOString().split('T')[0]) // Date is today
                }
              },
              {
                time: {
                  lt: now.toTimeString().split(' ')[0] // Time has passed
                }
              }
            ]
          }
        ]
      }
    });

    if (pastClasses.length === 0) {
      console.log('No past classes to archive');
      return;
    }

    console.log(`Found ${pastClasses.length} past classes to archive:`);
    
    for (const classItem of pastClasses) {
      console.log(`- ${classItem.date} ${classItem.time}: ${classItem.description}`);
    }

    // Archive all past classes
    const result = await prisma.class.updateMany({
      where: {
        id: {
          in: pastClasses.map(c => c.id)
        }
      },
      data: {
        archived: true
      }
    });

    console.log(`Successfully archived ${result.count} classes`);
    
  } catch (error) {
    console.error('Error archiving past classes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
archivePastClasses(); 