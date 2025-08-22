const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseCreationMethod() {
  try {
    console.log('=== CHECKING DATABASE CREATION METHOD ===\n');
    
    // Check if there are any packages created with different default values
    const allPackages = await prisma.packageBooking.findMany({
      include: {
        user: true,
        package: true
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`📦 Total packages: ${allPackages.length}\n`);
    
    // Check for patterns in the data
    console.log('=== DATA PATTERNS ===');
    
    // Check if all packages have the same initial state
    const initialStates = allPackages.map(pkg => ({
      id: pkg.id,
      customerName: pkg.customerName,
      paid: pkg.paid,
      classesUsed: pkg.classesUsed,
      classesRemaining: pkg.classesRemaining,
      paymentId: pkg.paymentId,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt
    }));
    
    console.log('Package initial states:');
    initialStates.forEach(state => {
      console.log(`  ID ${state.id} (${state.customerName}):`);
      console.log(`    Paid: ${state.paid}`);
      console.log(`    Classes Used: ${state.classesUsed}`);
      console.log(`    Classes Remaining: ${state.classesRemaining}`);
      console.log(`    Payment ID: ${state.paymentId || 'None'}`);
      console.log(`    Created: ${new Date(state.createdAt).toLocaleString()}`);
      console.log(`    Updated: ${state.updatedAt ? new Date(state.updatedAt).toLocaleString() : 'Never'}`);
      console.log('');
    });
    
    // Check if there's a pattern suggesting manual database insertion
    console.log('=== MANUAL INSERTION ANALYSIS ===');
    
    // Check if packages were created in exact time intervals (suggesting manual insertion)
    const creationTimes = allPackages.map(pkg => new Date(pkg.createdAt).getTime());
    const timeIntervals = [];
    
    for (let i = 1; i < creationTimes.length; i++) {
      const interval = creationTimes[i] - creationTimes[i-1];
      timeIntervals.push(interval);
    }
    
    console.log('Time intervals between package creations (milliseconds):');
    timeIntervals.forEach((interval, index) => {
      const minutes = Math.round(interval / (1000 * 60));
      console.log(`  Between package ${index + 1} and ${index + 2}: ${interval}ms (${minutes} minutes)`);
    });
    
    // Check if there are any suspicious patterns
    const veryShortIntervals = timeIntervals.filter(interval => interval < 60000); // Less than 1 minute
    const veryLongIntervals = timeIntervals.filter(interval => interval > 24 * 60 * 60 * 1000); // More than 1 day
    
    console.log(`\nVery short intervals (< 1 minute): ${veryShortIntervals.length}`);
    console.log(`Very long intervals (> 1 day): ${veryLongIntervals.length}`);
    
    if (veryShortIntervals.length > 0) {
      console.log('  This suggests manual database insertion or script execution');
    }
    
    // Check if there are any packages created with different default values
    console.log('\n=== DEFAULT VALUE ANALYSIS ===');
    
    const packagesWithDefaultPaid = allPackages.filter(pkg => pkg.paid === true);
    const packagesWithDefaultUnpaid = allPackages.filter(pkg => pkg.paid === false);
    
    console.log(`Packages created with paid=true: ${packagesWithDefaultPaid.length}`);
    console.log(`Packages created with paid=false: ${packagesWithDefaultUnpaid.length}`);
    
    if (packagesWithDefaultPaid.length > 0) {
      console.log('\nPackages created as paid from start:');
      packagesWithDefaultPaid.forEach(pkg => {
        console.log(`  - ${pkg.customerName}: ${new Date(pkg.createdAt).toLocaleString()}`);
      });
    }
    
    // Check if there are any packages that were updated after creation
    const updatedPackages = allPackages.filter(pkg => pkg.updatedAt && pkg.updatedAt > pkg.createdAt);
    const neverUpdatedPackages = allPackages.filter(pkg => !pkg.updatedAt || pkg.updatedAt <= pkg.createdAt);
    
    console.log(`\nPackages updated after creation: ${updatedPackages.length}`);
    console.log(`Packages never updated: ${neverUpdatedPackages.length}`);
    
    if (neverUpdatedPackages.length > 0) {
      console.log('\nPackages never updated (suggesting manual creation):');
      neverUpdatedPackages.forEach(pkg => {
        console.log(`  - ${pkg.customerName}: Created ${new Date(pkg.createdAt).toLocaleString()}, Paid: ${pkg.paid}`);
      });
    }
    
    // Check for any database constraints or triggers that might affect this
    console.log('\n=== DATABASE ANALYSIS ===');
    
    // Check if the schema default is being overridden
    console.log('Schema default for paid field: false');
    console.log('Actual packages created as paid: ' + packagesWithDefaultPaid.length);
    
    if (packagesWithDefaultPaid.length > 0) {
      console.log('This suggests packages were created with explicit paid=true value');
    }
    
    // Check if there are any migration files that might have affected this
    console.log('\n=== MIGRATION ANALYSIS ===');
    console.log('Checking if any migrations might have affected package creation...');
    
    // Look for any patterns that suggest the packages were created through a different method
    const allHaveSamePattern = allPackages.every(pkg => 
      pkg.paid === true && 
      pkg.paymentId === null && 
      pkg.classesUsed === 0 &&
      (!pkg.updatedAt || pkg.updatedAt <= pkg.createdAt)
    );
    
    console.log(`All packages follow same pattern (paid=true, no payment ID, never updated): ${allHaveSamePattern}`);
    
    if (allHaveSamePattern) {
      console.log('This strongly suggests manual database insertion or a different creation method');
    }
    
  } catch (error) {
    console.error('Error checking database creation method:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseCreationMethod(); 