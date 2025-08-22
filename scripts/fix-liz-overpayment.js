const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixLizOverpayment() {
  try {
    console.log('=== FIXING LIZ\'S OVERPAYMENT ===\n');
    
    // Find Liz's user account
    const liz = await prisma.user.findFirst({
      where: { email: 'liz.comella@gmail.com' }
    });
    
    if (!liz) {
      console.log('❌ Liz Comella user account not found');
      return;
    }
    
    console.log(`✅ Found Liz: ${liz.name} (${liz.email})\n`);
    
    // Find Liz's package
    const lizPackage = await prisma.packageBooking.findFirst({
      where: { userId: liz.id },
      include: { package: true }
    });
    
    if (!lizPackage) {
      console.log('❌ No package found for Liz');
      return;
    }
    
    console.log(`📦 Liz's Package:`);
    console.log(`   Package: ${lizPackage.package.name}`);
    console.log(`   Created: ${new Date(lizPackage.createdAt).toLocaleString()}`);
    console.log(`   Paid: ${lizPackage.paid}`);
    console.log(`   Classes Used: ${lizPackage.classesUsed}`);
    console.log(`   Classes Remaining: ${lizPackage.classesRemaining}`);
    console.log('');
    
    // Find Liz's individual class booking that should be refunded
    const individualBookings = await prisma.booking.findMany({
      where: {
        userId: liz.id,
        createdAt: {
          gte: lizPackage.createdAt // Bookings after package creation
        }
      },
      include: { class: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📅 Individual class bookings after package creation: ${individualBookings.length}`);
    
    if (individualBookings.length === 0) {
      console.log('✅ No individual class bookings found - no refund needed');
      return;
    }
    
    individualBookings.forEach(booking => {
      const classDate = new Date(booking.class.date).toLocaleDateString();
      console.log(`   - ${classDate} at ${booking.class.time} - ${booking.class.description}`);
      console.log(`     Booked: ${new Date(booking.createdAt).toLocaleString()}`);
      console.log(`     Paid: ${booking.paid}`);
      console.log(`     Booking ID: ${booking.id}`);
    });
    
    console.log('\n=== REFUND RECOMMENDATIONS ===');
    
    // Check if these bookings could have used the package instead
    individualBookings.forEach(booking => {
      const classDate = new Date(booking.class.date);
      const packageExpiry = new Date(lizPackage.expiresAt);
      
      if (classDate <= packageExpiry && lizPackage.classesRemaining > 0) {
        console.log(`✅ ${booking.class.description} (${classDate.toLocaleDateString()}) - REFUND RECOMMENDED`);
        console.log(`   This class could have used Liz's package (${lizPackage.classesRemaining} classes remaining)`);
        console.log(`   Package expires: ${packageExpiry.toLocaleDateString()}`);
        console.log(`   Individual class payment: ~$10-14 (depending on pricing)`);
      } else {
        console.log(`❌ ${booking.class.description} (${classDate.toLocaleDateString()}) - No refund needed`);
        if (classDate > packageExpiry) {
          console.log(`   Class is after package expiry date`);
        } else if (lizPackage.classesRemaining <= 0) {
          console.log(`   No classes remaining in package`);
        }
      }
    });
    
    // Calculate total refund amount
    const refundableBookings = individualBookings.filter(booking => {
      const classDate = new Date(booking.class.date);
      const packageExpiry = new Date(lizPackage.expiresAt);
      return classDate <= packageExpiry && lizPackage.classesRemaining > 0;
    });
    
    const totalRefundAmount = refundableBookings.length * 10; // Assuming $10 per class
    
    console.log(`\n💰 Total refund amount: $${totalRefundAmount} (${refundableBookings.length} classes)`);
    
    // Provide next steps
    console.log('\n=== NEXT STEPS ===');
    console.log('1. Process refund through Square for the individual class payment');
    console.log('2. Mark the individual class booking as refunded in the database');
    console.log('3. Ensure Liz\'s package works properly for future bookings');
    console.log('4. Fix the package redemption system to prevent this issue');
    
    // Show how to process the refund
    console.log('\n=== REFUND PROCESS ===');
    console.log('To process the refund:');
    console.log('1. Go to Square Dashboard');
    console.log('2. Find the payment for Liz\'s individual class booking');
    console.log('3. Process a refund for the full amount');
    console.log('4. Update the booking record to reflect the refund');
    
  } catch (error) {
    console.error('Error fixing Liz\'s overpayment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLizOverpayment(); 