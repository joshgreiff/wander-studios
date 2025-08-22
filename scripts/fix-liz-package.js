const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLizPackage() {
  try {
    console.log('=== FIXING LIZ COMELLA\'S PACKAGE ===\n');
    
    // Find Liz's user account
    const user = await prisma.user.findFirst({
      where: { email: 'liz.comella@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ Liz Comella user account not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.name} (${user.email})`);
    
    // Find her unpaid package booking
    const packageBooking = await prisma.packageBooking.findFirst({
      where: {
        userId: user.id,
        paid: false
      },
      include: {
        package: true
      }
    });
    
    if (!packageBooking) {
      console.log('❌ No unpaid package booking found for Liz');
      return;
    }
    
    console.log(`📦 Found package: ${packageBooking.package.name}`);
    console.log(`   Created: ${new Date(packageBooking.createdAt).toLocaleString()}`);
    console.log(`   Classes remaining: ${packageBooking.classesRemaining}`);
    console.log(`   Expires: ${new Date(packageBooking.expiresAt).toLocaleDateString()}`);
    console.log(`   Current status: ${packageBooking.paid ? 'Paid' : 'Unpaid'}`);
    
    // Mark the package as paid
    await prisma.packageBooking.update({
      where: { id: packageBooking.id },
      data: { paid: true }
    });
    
    console.log('\n✅ Package marked as paid!');
    console.log('Liz can now use her package to book classes for free.');
    
    // Check if she has any recent individual class bookings that could be refunded
    const recentBookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: packageBooking.createdAt // Bookings after package purchase
        }
      },
      include: { class: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (recentBookings.length > 0) {
      console.log('\n📅 Recent individual class bookings (after package purchase):');
      recentBookings.forEach(booking => {
        const classDate = new Date(booking.class.date).toLocaleDateString();
        console.log(`   - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
        console.log(`     Paid: ${booking.paid}, Created: ${new Date(booking.createdAt).toLocaleString()}`);
      });
      console.log('\n💡 Consider refunding these individual class payments since Liz has a valid package.');
    }
    
  } catch (error) {
    console.error('Error fixing Liz\'s package:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLizPackage(); 