const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Newsletter email list with real emails
const newsletterEmails = {
  'Kayley Covert': 'kayleyc@prodigy.net',
  'Sandhya Kannan': 'sandhya.kannan@icloud.com',
  'Lydia Steyn': 'lydiam.steyn@gmail.com',
  'Brooke Hall': 'brookeleeh9@gmail.com',
  'Julie Wander': 'jwander97@gmail.com',
  'Elizabeth Graff': 'elizabethgraff4@gmail.com',
  'Mady Gibson': 'madyg20@gmail.com',
  'Madelyn Gibson': 'madyg20@gmail.com', // Same person as Mady Gibson
  'Elina Greiff': 'elinagreiff@gmail.com',
  'Vidhya Kannan': 'vidhyakannan0321@gmail.com',
  'Liz Comella': 'liz.comella@gmail.com',
  'Cirrus Robinson': 'cirrus.robinson98@gmail.com'
};

async function updateEmailsFromNewsletter() {
  try {
    console.log('=== UPDATING EMAILS FROM NEWSLETTER LIST ===\n');

    // Get all current users
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('Current users:');
    users.forEach(user => {
      const isExample = user.email.includes('example.com');
      console.log(`${user.name}: ${user.email}${isExample ? ' (EXAMPLE.COM)' : ' (REAL)'}`);
    });

    console.log('\n=== UPDATING EXAMPLE.COM EMAILS ===\n');

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const user of users) {
      if (user.email.includes('example.com')) {
        const realEmail = newsletterEmails[user.name];
        
        if (realEmail) {
          try {
            // Check if the real email is already used by another user
            const existingUser = await prisma.user.findUnique({
              where: { email: realEmail.toLowerCase() }
            });

            if (existingUser) {
              console.log(`⚠️  ${user.name}: ${realEmail} already exists for ${existingUser.name}`);
              notFoundCount++;
              continue;
            }

            // Update the user's email
            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: { email: realEmail.toLowerCase() }
            });

            console.log(`✅ ${user.name}: ${user.email} → ${updatedUser.email}`);
            updatedCount++;

          } catch (error) {
            console.error(`❌ Error updating ${user.name}:`, error.message);
          }
        } else {
          console.log(`❌ ${user.name}: No matching email found in newsletter list`);
          notFoundCount++;
        }
      }
    }

    console.log('\n=== FINAL USER LIST ===\n');
    
    const finalUsers = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    
    finalUsers.forEach(user => {
      const isExample = user.email.includes('example.com');
      console.log(`${user.name}: ${user.email}${isExample ? ' (EXAMPLE.COM)' : ' (REAL)'}`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`Updated: ${updatedCount} users`);
    console.log(`Not found: ${notFoundCount} users`);
    console.log(`Total users: ${finalUsers.length}`);

    if (notFoundCount > 0) {
      console.log('\nUsers still with example.com emails:');
      finalUsers.forEach(user => {
        if (user.email.includes('example.com')) {
          console.log(`- ${user.name}: ${user.email}`);
        }
      });
    }

  } catch (error) {
    console.error('Error updating emails:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
updateEmailsFromNewsletter(); 