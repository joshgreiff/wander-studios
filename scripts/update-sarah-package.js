const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateSarahPackage() {
  try {
    console.log('Looking for Sarah Graff\'s package...');
    
    // Find Sarah's most recent package
    const sarahPackage = await prisma.packageBooking.findFirst({
      where: { 
        customerName: { contains: 'Sarah Graff', mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!sarahPackage) {
      console.log('❌ No package found for Sarah Graff');
      return;
    }
    
    console.log('Found package:', {
      id: sarahPackage.id,
      customer: sarahPackage.customerName,
      classesUsed: sarahPackage.classesUsed,
      classesRemaining: sarahPackage.classesRemaining,
      paid: sarahPackage.paid
    });
    
    if (sarahPackage.classesRemaining <= 0) {
      console.log('❌ No classes remaining to deduct');
      return;
    }
    
    // Update the package to reflect that she used one class
    const updatedPackage = await prisma.packageBooking.update({
      where: { id: sarahPackage.id },
      data: {
        classesUsed: sarahPackage.classesUsed + 1,
        classesRemaining: sarahPackage.classesRemaining - 1
      }
    });
    
    console.log('✅ Updated Sarah\'s package:');
    console.log('Classes used:', sarahPackage.classesUsed, '->', updatedPackage.classesUsed);
    console.log('Classes remaining:', sarahPackage.classesRemaining, '->', updatedPackage.classesRemaining);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSarahPackage(); 