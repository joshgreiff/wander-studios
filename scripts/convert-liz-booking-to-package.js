const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertLizBookingToPackage() {
  try {
    console.log('=== CONVERTING LIZ\'S BOOKING TO PACKAGE REDEMPTION ===\n');
    
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
    
    console.log(`📦 Liz's Package Before:`);
    console.log(`   Package: ${lizPackage.package.name}`);
    console.log(`   Classes Used: ${lizPackage.classesUsed}`);
    console.log(`   Classes Remaining: ${lizPackage.classesRemaining}`);
    console.log('');
    
    // Find the individual class booking that was refunded
    const individualBooking = await prisma.booking.findFirst({
      where: {
        userId: liz.id,
        id: 33 // Liz's individual class booking ID
      },
      include: { class: true }
    });
    
    if (!individualBooking) {
      console.log('❌ Individual class booking not found');
      return;
    }
    
    console.log(`📅 Individual Class Booking:`);
    console.log(`   Class: ${individualBooking.class.description}`);
    console.log(`   Date: ${new Date(individualBooking.class.date).toLocaleDateString()}`);
    console.log(`   Time: ${individualBooking.class.time}`);
    console.log(`   Booked: ${new Date(individualBooking.createdAt).toLocaleString()}`);
    console.log(`   Paid: ${individualBooking.paid}`);
    console.log('');
    
    // Check if this class is within package expiry
    const classDate = new Date(individualBooking.class.date);
    const packageExpiry = new Date(lizPackage.expiresAt);
    
    if (classDate > packageExpiry) {
      console.log('❌ Class is after package expiry date - cannot convert to package redemption');
      return;
    }
    
    if (lizPackage.classesRemaining <= 0) {
      console.log('❌ No classes remaining in package - cannot convert to package redemption');
      return;
    }
    
    console.log('✅ Class is eligible for package redemption');
    console.log('');
    
    // Check if there's already a package redemption for this class
    const existingRedemption = await prisma.packageRedemption.findFirst({
      where: {
        packageBookingId: lizPackage.id,
        classId: individualBooking.classId
      }
    });
    
    if (existingRedemption) {
      console.log('❌ Package redemption already exists for this class');
      return;
    }
    
    console.log('=== CONVERTING TO PACKAGE REDEMPTION ===');
    
    // Create package redemption record
    const packageRedemption = await prisma.packageRedemption.create({
      data: {
        packageBookingId: lizPackage.id,
        classId: individualBooking.classId
      }
    });
    
    console.log(`✅ Created package redemption record (ID: ${packageRedemption.id})`);
    
    // Update package booking to decrement remaining classes
    const updatedPackage = await prisma.packageBooking.update({
      where: { id: lizPackage.id },
      data: {
        classesUsed: lizPackage.classesUsed + 1,
        classesRemaining: lizPackage.classesRemaining - 1
      }
    });
    
    console.log(`✅ Updated package booking:`);
    console.log(`   Classes Used: ${updatedPackage.classesUsed}`);
    console.log(`   Classes Remaining: ${updatedPackage.classesRemaining}`);
    
    // Update the individual booking to reflect it's now a package redemption
    // Note: We keep the booking but mark it as using package
    const updatedBooking = await prisma.booking.update({
      where: { id: individualBooking.id },
      data: {
        paid: true, // Keep as paid since package covers it
        // Note: We could add a field to track this is a package redemption
      }
    });
    
    console.log(`✅ Updated individual booking to reflect package redemption`);
    
    console.log('\n=== SUMMARY ===');
    console.log('✅ Successfully converted Liz\'s individual class booking to package redemption');
    console.log(`📦 Package now has ${updatedPackage.classesRemaining} classes remaining`);
    console.log(`📅 Liz\'s booking for ${new Date(individualBooking.class.date).toLocaleDateString()} is still valid`);
    console.log(`💰 No additional payment needed - package covers the class`);
    
    console.log('\n=== WHAT HAPPENED ===');
    console.log('1. Liz\'s individual class payment was refunded through Square');
    console.log('2. Her package was charged 1 class for this booking');
    console.log('3. The booking remains valid - no need to rebook');
    console.log('4. Package redemption record was created to track usage');
    
  } catch (error) {
    console.error('Error converting Liz\'s booking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertLizBookingToPackage(); 