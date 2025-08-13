const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setAdminUser() {
  try {
    console.log('=== SETTING ADMIN USER ===\n');

    // Set admin role for Leah Wander
    const adminUser = await prisma.user.update({
      where: { email: 'ltwander@gmail.com' },
      data: { isAdmin: true }
    });

    console.log('✅ Admin role set for:');
    console.log(`   - Name: ${adminUser.name}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Admin: ${adminUser.isAdmin}`);

    // Check if there are any other admin users
    const allAdmins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true
      }
    });

    console.log(`\n📊 Total admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name} (${admin.email})`);
    });

  } catch (error) {
    console.error('Error setting admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminUser(); 