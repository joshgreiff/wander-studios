const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupPackages() {
  try {
    console.log('=== CLEANING UP PACKAGES ===\n');
    
    // Delete all packages except the 4-class package
    const result = await prisma.classPackage.deleteMany({
      where: {
        NOT: {
          name: '4-Class Package'
        }
      }
    });
    
    console.log(`Deleted ${result.count} extra package(s).`);
    
    // Verify only the 4-class package remains
    const remainingPackages = await prisma.classPackage.findMany();
    console.log(`\nRemaining packages: ${remainingPackages.length}`);
    
    if (remainingPackages.length > 0) {
      const pkg = remainingPackages[0];
      console.log(`\n✅ ${pkg.name}`);
      console.log(`   - Price: $${pkg.price}`);
      console.log(`   - Classes: ${pkg.classCount}`);
      console.log(`   - Expires in: ${pkg.expiresInDays} days`);
      console.log(`   - Active: ${pkg.isActive}`);
    }
    
  } catch (error) {
    console.error('Error cleaning up packages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPackages(); 