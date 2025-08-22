const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLizComella() {
  try {
    console.log('=== CHECKING LIZ COMELLA ===\n');
    
    // Check if Liz has a user account
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'liz.comella@gmail.com' },
          { name: { contains: 'Liz Comella', mode: 'insensitive' } }
        ]
      }
    });
    
    if (user) {
      console.log('✅ Found user account:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
      
      // Check her bookings
      const bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: { class: true },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`📅 Bookings (${bookings.length}):`);
      bookings.forEach(booking => {
        const classDate = new Date(booking.class.date).toLocaleDateString();
        console.log(`   - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
        console.log(`     Paid: ${booking.paid}, Created: ${new Date(booking.createdAt).toLocaleString()}`);
      });
      console.log('');
      
      // Check her package bookings
      const packageBookings = await prisma.packageBooking.findMany({
        where: { userId: user.id },
        include: { package: true },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log(`🎫 Package Bookings (${packageBookings.length}):`);
      packageBookings.forEach(pkg => {
        console.log(`   - ${pkg.package.name} (${pkg.classesRemaining} remaining, expires ${new Date(pkg.expiresAt).toLocaleDateString()})`);
        console.log(`     Paid: ${pkg.paid}, Created: ${new Date(pkg.createdAt).toLocaleString()}`);
      });
      console.log('');
      
      // Check package redemptions
      const redemptions = await prisma.packageRedemption.findMany({
        where: {
          packageBooking: { userId: user.id }
        },
        include: {
          packageBooking: { include: { package: true } },
          class: true
        },
        orderBy: { redeemedAt: 'desc' }
      });
      
      console.log(`🎫 Package Redemptions (${redemptions.length}):`);
      redemptions.forEach(redemption => {
        const classDate = new Date(redemption.class.date).toLocaleDateString();
        console.log(`   - ${classDate} at ${redemption.class.time} - ${redemption.class.description}`);
        console.log(`     Package: ${redemption.packageBooking.package.name}`);
        console.log(`     Redeemed: ${new Date(redemption.redeemedAt).toLocaleString()}`);
      });
      
    } else {
      console.log('❌ No user account found for Liz Comella');
      
      // Check for any bookings with her email
      const bookings = await prisma.booking.findMany({
        where: { email: 'liz.comella@gmail.com' },
        include: { class: true },
        orderBy: { createdAt: 'desc' }
      });
      
      if (bookings.length > 0) {
        console.log(`\n📅 Found ${bookings.length} bookings with her email:`);
        bookings.forEach(booking => {
          const classDate = new Date(booking.class.date).toLocaleDateString();
          console.log(`   - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
          console.log(`     Name: ${booking.name}, Paid: ${booking.paid}`);
          console.log(`     Created: ${new Date(booking.createdAt).toLocaleString()}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLizComella(); 