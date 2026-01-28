/**
 * Comprehensive test for all entity ID auto-increment
 */

import { storage } from './server/lib/storage/factory';

async function testAllEntityIds() {
  console.log('\n=== COMPREHENSIVE ID AUTO-INCREMENT TEST ===\n');

  let allPassed = true;

  // Test Users
  console.log('1. Testing User IDs:');
  const users = [];
  for (let i = 1; i <= 3; i++) {
    const user = await storage.createUser({
      email: `user${i}@test.com`,
      name: `User ${i}`,
      password: 'pass123',
      isVerified: false,
    });
    users.push(user);
    console.log(`   Created user ${user.email} with ID: ${user.id}`);
  }
  if (users[0].id === 1 && users[1].id === 2 && users[2].id === 3) {
    console.log('    User IDs are incrementing correctly\n');
  } else {
    console.log(`   L User IDs failed: ${users.map(u => u.id).join(', ')}\n`);
    allPassed = false;
  }

  // Test FizzCards
  console.log('2. Testing FizzCard IDs:');
  const fizzCards = [];
  for (let i = 0; i < 3; i++) {
    const fizzCard = await storage.createFizzCard({
      userId: users[i].id,
      displayName: users[i].name,
      title: `Title ${i + 1}`,
      company: `Company ${i + 1}`,
      bio: `Bio ${i + 1}`,
      isActive: true,
    });
    fizzCards.push(fizzCard);
    console.log(`   Created FizzCard for user ${users[i].id} with ID: ${fizzCard.id}`);
  }
  if (fizzCards[0].id === 1 && fizzCards[1].id === 2 && fizzCards[2].id === 3) {
    console.log('    FizzCard IDs are incrementing correctly\n');
  } else {
    console.log(`   L FizzCard IDs failed: ${fizzCards.map(fc => fc.id).join(', ')}\n`);
    allPassed = false;
  }

  // Test Connections
  console.log('3. Testing Connection IDs:');
  const connections = [];
  const connectionData = [
    { userId: users[0].id, connectedUserId: users[1].id },
    { userId: users[0].id, connectedUserId: users[2].id },
    { userId: users[1].id, connectedUserId: users[2].id },
  ];
  for (const data of connectionData) {
    const connection = await storage.createConnection({
      ...data,
      strengthScore: 80,
      tags: ['test'],
    });
    connections.push(connection);
    console.log(`   Created connection ${data.userId} <-> ${data.connectedUserId} with ID: ${connection.id}`);
  }
  if (connections[0].id === 1 && connections[1].id === 2 && connections[2].id === 3) {
    console.log('    Connection IDs are incrementing correctly\n');
  } else {
    console.log(`   L Connection IDs failed: ${connections.map(c => c.id).join(', ')}\n`);
    allPassed = false;
  }

  // Test Wallets
  console.log('4. Testing Wallet IDs:');
  const wallets = [];
  for (const user of users) {
    const wallet = await storage.createWallet({
      userId: user.id,
      balance: 100,
      totalEarned: 100,
      totalSpent: 0,
    });
    wallets.push(wallet);
    console.log(`   Created wallet for user ${user.id} with ID: ${wallet.id}`);
  }
  if (wallets[0].id === 1 && wallets[1].id === 2 && wallets[2].id === 3) {
    console.log('    Wallet IDs are incrementing correctly\n');
  } else {
    console.log(`   L Wallet IDs failed: ${wallets.map(w => w.id).join(', ')}\n`);
    allPassed = false;
  }

  // Test Contact Exchanges
  console.log('5. Testing Contact Exchange IDs:');
  const exchanges = [];
  for (let i = 0; i < 2; i++) {
    const exchange = await storage.createContactExchange({
      senderId: users[i].id,
      receiverId: users[i + 1].id,
      senderFizzcardId: fizzCards[i].id,
      receiverFizzcardId: fizzCards[i + 1].id,
      status: 'pending',
    });
    exchanges.push(exchange);
    console.log(`   Created exchange from user ${users[i].id} to user ${users[i + 1].id} with ID: ${exchange.id}`);
  }
  if (exchanges[0].id === 1 && exchanges[1].id === 2) {
    console.log('    Contact Exchange IDs are incrementing correctly\n');
  } else {
    console.log(`   L Contact Exchange IDs failed: ${exchanges.map(e => e.id).join(', ')}\n`);
    allPassed = false;
  }

  // Summary
  console.log('=== TEST SUMMARY ===');
  if (allPassed) {
    console.log(' ALL TESTS PASSED - All entity IDs are auto-incrementing correctly!');
  } else {
    console.log('L SOME TESTS FAILED - Check the output above for details.');
  }

  return allPassed;
}

// Run the test
testAllEntityIds()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });