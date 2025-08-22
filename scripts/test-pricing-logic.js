const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pricing logic (copied from the updated code)
function getClassPriceForDate(classDate) {
  // Normalize the date to start of day in UTC for consistent comparison
  const normalizedDate = new Date(Date.UTC(classDate.getFullYear(), classDate.getMonth(), classDate.getDate()));
  const august31 = new Date(Date.UTC(2025, 7, 31)); // August 31, 2025 (month is 0-indexed)
  return normalizedDate <= august31 ? 10 : 14; // $10 on or before Aug 31, $14 after
}

function getCurrentIndividualClassPrice() {
  const now = new Date();
  return getClassPriceForDate(now);
}

async function testPricingLogic() {
  try {
    console.log('=== TESTING PRICING LOGIC ===\n');
    
    // Test current date pricing
    const now = new Date();
    const currentPrice = getCurrentIndividualClassPrice();
    console.log(`💰 Current date (${now.toLocaleDateString()}): $${currentPrice}`);
    
    // Test specific dates - create dates consistently
    const testDates = [
      new Date('2025-08-15'), // August 15th - should be $10
      new Date('2025-08-31'), // August 31st - should be $10
      new Date('2025-09-01'), // September 1st - should be $14
      new Date('2025-09-15'), // September 15th - should be $14
    ];
    
    console.log('\n📅 Test dates:');
    testDates.forEach(date => {
      const price = getClassPriceForDate(date);
      console.log(`  ${date.toLocaleDateString()}: $${price}`);
    });
    
    // Test with actual classes in the database
    console.log('\n🎯 Actual classes in database:');
    
    const classes = await prisma.class.findMany({
      where: {
        archived: false
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    classes.forEach(cls => {
      const classDate = new Date(cls.date);
      const price = getClassPriceForDate(classDate);
      const dateStr = classDate.toLocaleDateString();
      const timeStr = cls.time;
      console.log(`  ${dateStr} at ${timeStr}: $${price} - ${cls.description}`);
    });
    
    // Check if there are any classes that would have different pricing
    const augustClasses = classes.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate <= new Date('2025-08-31');
    });
    
    const septemberClasses = classes.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate > new Date('2025-08-31');
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`  August classes (≤ Aug 31): ${augustClasses.length} classes at $10 each`);
    console.log(`  September classes (> Aug 31): ${septemberClasses.length} classes at $14 each`);
    
    if (septemberClasses.length > 0) {
      console.log('\n🔍 September classes (new pricing):');
      septemberClasses.forEach(cls => {
        const classDate = new Date(cls.date);
        console.log(`  - ${classDate.toLocaleDateString()} at ${cls.time}: ${cls.description}`);
      });
    }
    
    // Test edge case: August 31st at different times
    console.log('\n⏰ Edge case testing (August 31st):');
    const august31Morning = new Date('2025-08-31T10:00:00');
    const august31Evening = new Date('2025-08-31T23:59:59');
    const september1Morning = new Date('2025-09-01T00:00:00');
    
    console.log(`  August 31st 10:00 AM: $${getClassPriceForDate(august31Morning)}`);
    console.log(`  August 31st 11:59 PM: $${getClassPriceForDate(august31Evening)}`);
    console.log(`  September 1st 12:00 AM: $${getClassPriceForDate(september1Morning)}`);
    
    // Test the actual pricing logic from the utils
    console.log('\n🔧 Testing actual pricing logic:');
    const testAug31 = new Date('2025-08-31');
    const testSep1 = new Date('2025-09-01');
    
    console.log(`  August 31st date object: ${testAug31.toISOString()}`);
    console.log(`  September 1st date object: ${testSep1.toISOString()}`);
    console.log(`  August 31st <= August 31st: ${testAug31 <= testAug31}`);
    console.log(`  September 1st <= August 31st: ${testSep1 <= testAug31}`);
    
    // Test with actual database date format
    console.log('\n🗄️ Testing with database date format:');
    const dbAugust31 = new Date('2025-08-31T00:00:00.000Z');
    const dbSeptember1 = new Date('2025-09-01T00:00:00.000Z');
    
    console.log(`  DB August 31st: ${dbAugust31.toISOString()} - $${getClassPriceForDate(dbAugust31)}`);
    console.log(`  DB September 1st: ${dbSeptember1.toISOString()} - $${getClassPriceForDate(dbSeptember1)}`);
    
    // Test the actual comparison logic
    const normalizedAug31 = new Date(Date.UTC(dbAugust31.getFullYear(), dbAugust31.getMonth(), dbAugust31.getDate()));
    const normalizedSep1 = new Date(Date.UTC(dbSeptember1.getFullYear(), dbSeptember1.getMonth(), dbSeptember1.getDate()));
    const refAug31 = new Date(Date.UTC(2025, 7, 31));
    
    console.log(`  Normalized Aug 31: ${normalizedAug31.toISOString()}`);
    console.log(`  Normalized Sep 1: ${normalizedSep1.toISOString()}`);
    console.log(`  August 31 reference: ${refAug31.toISOString()}`);
    console.log(`  Aug 31 <= Aug 31: ${normalizedAug31 <= refAug31}`);
    console.log(`  Sep 1 <= Aug 31: ${normalizedSep1 <= refAug31}`);
    
    console.log('\n✅ Pricing logic test complete!');
    
  } catch (error) {
    console.error('Error testing pricing logic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPricingLogic(); 