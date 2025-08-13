const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createClassPackage() {
  try {
    console.log('=== CREATING CLASS PACKAGE ===\n');

    // Check if package already exists
    const existingPackage = await prisma.classPackage.findFirst({
      where: { name: '4-Class Package' }
    });

    if (existingPackage) {
      console.log('Package already exists:');
      console.log(`- Name: ${existingPackage.name}`);
      console.log(`- Price: $${existingPackage.price}`);
      console.log(`- Classes: ${existingPackage.classCount}`);
      console.log(`- Expires in: ${existingPackage.expiresInDays} days`);
      return;
    }

    // Create the 4-class package
    const packageData = {
      name: '4-Class Package',
      description: 'Perfect for regular attendees. Save money and commit to your practice!',
      classCount: 4,
      price: 40.00,
      expiresInDays: 90, // 3 months
      isActive: true
    };

    const newPackage = await prisma.classPackage.create({
      data: packageData
    });

    console.log('✅ Created class package:');
    console.log(`- Name: ${newPackage.name}`);
    console.log(`- Price: $${newPackage.price}`);
    console.log(`- Classes: ${newPackage.classCount}`);
    console.log(`- Expires in: ${newPackage.expiresInDays} days`);
    console.log(`- Description: ${newPackage.description}`);

  } catch (error) {
    console.error('Error creating class package:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createClassPackage(); 