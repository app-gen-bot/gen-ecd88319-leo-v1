/**
 * Test script to verify user ID auto-increment bug fix
 */

import { storage } from './server/lib/storage/factory';

async function testUserIdIncrement() {
  console.log('\n=== Testing User ID Auto-Increment ===\n');

  const testUsers = [
    { email: 'test1@fizzcard.com', name: 'Test User 1', password: 'pass123' },
    { email: 'test2@fizzcard.com', name: 'Test User 2', password: 'pass123' },
    { email: 'test3@fizzcard.com', name: 'Test User 3', password: 'pass123' },
    { email: 'test4@fizzcard.com', name: 'Test User 4', password: 'pass123' },
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    const user = await storage.createUser({
      ...userData,
      isVerified: false,
    });

    createdUsers.push(user);
    console.log(`Created user: ${user.email} with ID: ${user.id}`);
  }

  console.log('\n=== Verification ===\n');

  // Check if IDs are sequential
  const ids = createdUsers.map(u => u.id);
  const expectedIds = [1, 2, 3, 4];
  const allCorrect = ids.every((id, index) => id === expectedIds[index]);

  if (allCorrect) {
    console.log('✅ SUCCESS: All users have correct sequential IDs:', ids);
  } else {
    console.log('❌ FAILURE: IDs are not sequential!');
    console.log('   Expected:', expectedIds);
    console.log('   Actual:  ', ids);
  }

  // Verify users can be retrieved by ID
  console.log('\n=== Retrieving Users by ID ===\n');
  for (const user of createdUsers) {
    const retrieved = await storage.getUserById(user.id);
    if (retrieved) {
      console.log(`✅ Retrieved user ${retrieved.email} by ID ${retrieved.id}`);
    } else {
      console.log(`❌ Failed to retrieve user with ID ${user.id}`);
    }
  }

  return allCorrect;
}

// Run the test
testUserIdIncrement()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
