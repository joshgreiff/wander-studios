// Test script to debug date comparison logic
console.log('=== TESTING DATE COMPARISON LOGIC ===\n');

// Test dates from Julie's classes
const testDates = [
  '2025-08-08T10:00:00.000Z',  // 8/8/2025 - First class
  '2025-08-16T10:00:00.000Z',  // 8/16/2025 - Mat Pilates
  '2025-08-24T10:00:00.000Z',  // 8/24/2025 - Mat Pilates
  '2025-08-30T10:00:00.000Z',  // 8/30/2025 - Mat Pilates
  '2025-09-05T10:00:00.000Z',  // 9/5/2025 - Mat Pilates
  '2025-09-20T09:45:00.000Z'   // 9/20/2025 - Mat Pilates
];

const now = new Date();
console.log(`Current date/time: ${now.toISOString()}`);
console.log(`Current date: ${now.toDateString()}\n`);

testDates.forEach((dateStr, index) => {
  const classDate = new Date(dateStr);
  const isPast = classDate < now;
  const isPastDateOnly = classDate.toDateString() < now.toDateString();
  
  console.log(`Class ${index + 1}: ${dateStr}`);
  console.log(`  Class date: ${classDate.toDateString()}`);
  console.log(`  Is past (with time): ${isPast}`);
  console.log(`  Is past (date only): ${isPastDateOnly}`);
  console.log('');
});

// Test the exact logic used in the dashboard
console.log('=== DASHBOARD LOGIC TEST ===\n');

testDates.forEach((dateStr, index) => {
  const classDate = new Date(dateStr);
  const now = new Date();
  
  // Dashboard logic: new Date(booking.class.date) < new Date()
  const dashboardLogic = classDate < now;
  
  // Alternative: compare just the dates without time
  const classDateOnly = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateOnlyLogic = classDateOnly < nowDateOnly;
  
  console.log(`Class ${index + 1}: ${dateStr}`);
  console.log(`  Dashboard logic (${classDate.toISOString()} < ${now.toISOString()}): ${dashboardLogic}`);
  console.log(`  Date-only logic (${classDateOnly.toDateString()} < ${nowDateOnly.toDateString()}): ${dateOnlyLogic}`);
  console.log('');
}); 