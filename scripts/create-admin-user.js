const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('=== CREATING ADMIN USER ===\n');

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ltwander@gmail.com' }
    });

    if (existingUser) {
      console.log('Admin user already exists, updating admin role...');
      
      const updatedUser = await prisma.user.update({
        where: { email: 'ltwander@gmail.com' },
        data: { isAdmin: true }
      });

      console.log('✅ Admin role updated for:');
      console.log(`   - Name: ${updatedUser.name}`);
      console.log(`   - Email: ${updatedUser.email}`);
      console.log(`   - Admin: ${updatedUser.isAdmin}`);
    } else {
      console.log('Creating new admin user...');
      
      // Hash the default password
      const hashedPassword = await bcrypt.hash('Welcome2025!', 12);
      
      // Create the admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'ltwander@gmail.com',
          name: 'Leah Wander',
          password: hashedPassword,
          isAdmin: true,
          isActive: true
        }
      });

      console.log('✅ Admin user created:');
      console.log(`   - Name: ${adminUser.name}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Admin: ${adminUser.isAdmin}`);
      console.log(`   - Default password: Welcome2025!`);
    }

    // Show all admin users
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
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 