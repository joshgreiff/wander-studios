const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSamplePackages() {
  try {
    // Create sample packages
    const packages = [
      {
        name: "5-Class Package",
        description: "Perfect for beginners - commit to 5 classes and save!",
        classCount: 5,
        price: 45.00,
        discount: 10,
        isActive: true
      },
      {
        name: "10-Class Package", 
        description: "Great value for regular practitioners",
        classCount: 10,
        price: 85.00,
        discount: 15,
        isActive: true
      },
      {
        name: "20-Class Package",
        description: "Best value for dedicated students",
        classCount: 20,
        price: 160.00,
        discount: 20,
        isActive: true
      }
    ];

    for (const packageData of packages) {
      const existingPackage = await prisma.classPackage.findFirst({
        where: { name: packageData.name }
      });

      if (!existingPackage) {
        const newPackage = await prisma.classPackage.create({
          data: packageData
        });
        console.log(`Created package: ${newPackage.name}`);
      } else {
        console.log(`Package already exists: ${packageData.name}`);
      }
    }

    console.log('Sample packages created successfully!');
  } catch (error) {
    console.error('Error creating sample packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSamplePackages(); 