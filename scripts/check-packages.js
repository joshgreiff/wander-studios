const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPackages() {
  try {
    console.log('=== CHECKING PACKAGES ===\n');
    
    const packages = await prisma.classPackage.findMany();
    
    if (packages.length === 0) {
      console.log('No packages found in database.');
    } else {
      console.log(`Found ${packages.length} package(s):`);
      packages.forEach((pkg, index) => {
        console.log(`\n${index + 1}. ${pkg.name}`);
        console.log(`   - Price: $${pkg.price}`);
        console.log(`   - Classes: ${pkg.classCount}`);
        console.log(`   - Expires in: ${pkg.expiresInDays} days`);
        console.log(`   - Active: ${pkg.isActive}`);
        console.log(`   - ID: ${pkg.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPackages(); 