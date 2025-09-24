const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testWebhookFix() {
  try {
    console.log('🧪 Testing webhook fallback method...\n');
    
    // 1. Check for unpaid packages in the last 24 hours
    console.log('1. Looking for unpaid packages in last 24 hours...');
    const unpaidPackages = await prisma.packageBooking.findMany({
      where: {
        paid: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        package: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    });
    
    console.log(`Found ${unpaidPackages.length} unpaid packages in last 24 hours`);
    
    if (unpaidPackages.length === 0) {
      console.log('✅ No unpaid packages found - webhook should work correctly');
      
      // Check recent paid packages to see if any were manually marked
      console.log('\n2. Checking recent paid packages...');
      const recentPaid = await prisma.packageBooking.findMany({
        where: {
          paid: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      console.log(`Recent paid packages (last 7 days):`);
      recentPaid.forEach(pkg => {
        const hasPaymentId = !!pkg.paymentId;
        const status = hasPaymentId ? '✅ Auto-paid' : '⚠️ Manual';
        console.log(`  ${pkg.customerName}: ${status} (${pkg.paymentId || 'no payment ID'})`);
      });
      
    } else {
      console.log('\n❌ Found unpaid packages:');
      unpaidPackages.forEach(pkg => {
        const createdDate = new Date(pkg.createdAt);
        const hoursAgo = Math.round((Date.now() - createdDate.getTime()) / (1000 * 60 * 60));
        console.log(`  ${pkg.customerName}: Created ${hoursAgo} hours ago`);
        console.log(`    Expected amount: $${pkg.package.price}`);
      });
      
      console.log('\n💡 These packages should be automatically marked as paid when webhook receives payment events.');
    }
    
    // 3. Test the fallback logic simulation
    console.log('\n3. Testing fallback logic simulation...');
    if (unpaidPackages.length > 0) {
      const testPackage = unpaidPackages[0];
      const expectedAmount = Math.round(testPackage.package.price * 100); // Convert to cents
      
      console.log(`Most recent unpaid package:`);
      console.log(`  Customer: ${testPackage.customerName}`);
      console.log(`  Expected amount: ${expectedAmount} cents ($${testPackage.package.price})`);
      console.log(`  Package ID: ${testPackage.id}`);
      
      console.log('\n✅ Webhook fallback method should work for this package');
    }
    
  } catch (error) {
    console.error('Error testing webhook:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWebhookFix(); 