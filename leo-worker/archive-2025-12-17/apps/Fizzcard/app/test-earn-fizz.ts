/**
 * Test script to earn FIZZ tokens
 *
 * This script:
 * 1. Creates a second test user
 * 2. Initiates a contact exchange from user 1 to user 2
 * 3. User 2 accepts the exchange
 * 4. Both users earn 25 FIZZ
 */

import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load environment from parent directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { storage } from './server/lib/storage/factory';
import { fizzCoinService } from './server/services/fizzcoin.service';

async function main() {
  console.log('\n🎮 FizzCard - Earn FIZZ Test\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Get or create test users
    console.log('\n1️⃣  Setting up test users...');

    // Check if labhesh@gmail.com exists
    const users = await storage.getUsers();
    let user1 = users.find(u => u.email === 'labhesh@gmail.com');

    if (!user1) {
      console.log('   Creating labhesh@gmail.com...');
      user1 = await storage.createUser({
        name: 'Labhesh Patel',
        email: 'labhesh@gmail.com',
        bio: 'Test user 1',
        role: 'user'
      });
    }
    console.log(`   ✅ User 1: ${user1.name} (ID: ${user1.id})`);

    // Check if test user 2 exists
    let user2 = users.find(u => u.email === 'test2@example.com');

    if (!user2) {
      console.log('   Creating test2@example.com...');
      user2 = await storage.createUser({
        name: 'Test User 2',
        email: 'test2@example.com',
        bio: 'Test user 2 for contact exchange',
        role: 'user'
      });
    }
    console.log(`   ✅ User 2: ${user2.name} (ID: ${user2.id})`);

    // Step 2: Check current balances
    console.log('\n2️⃣  Current FIZZ Balances:');
    const wallet1 = await storage.getWalletByUserId(user1.id);
    const wallet2 = await storage.getWalletByUserId(user2.id);
    console.log(`   User 1: ${wallet1?.balance || 0} FIZZ`);
    console.log(`   User 2: ${wallet2?.balance || 0} FIZZ`);

    // Step 3: Create contact exchange
    console.log('\n3️⃣  Creating contact exchange...');
    const exchange = await storage.createContactExchange({
      senderId: user1.id,
      receiverId: user2.id,
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: 'San Francisco, CA',
    });
    console.log(`   ✅ Exchange created (ID: ${exchange.id})`);
    console.log(`   Status: ${exchange.status}`);

    // Step 4: Accept the exchange
    console.log('\n4️⃣  Accepting contact exchange...');
    await storage.updateContactExchange(exchange.id, {
      status: 'accepted',
    });

    // Create bidirectional connections
    await storage.createConnection({
      userId: user1.id,
      connectedUserId: user2.id,
      exchangeId: exchange.id,
      tags: [],
      strengthScore: 50,
    });

    await storage.createConnection({
      userId: user2.id,
      connectedUserId: user1.id,
      exchangeId: exchange.id,
      tags: [],
      strengthScore: 50,
    });
    console.log(`   ✅ Connections created`);

    // Step 5: Award FizzCoins
    console.log('\n5️⃣  Awarding FIZZ rewards...');
    const fizzcoinsEarned = await fizzCoinService.awardExchangeReward(
      user1.id,
      user2.id
    );
    console.log(`   ✅ Each user earned: ${fizzcoinsEarned} FIZZ`);

    // Step 6: Check new balances
    console.log('\n6️⃣  Updated FIZZ Balances:');
    const newWallet1 = await storage.getWalletByUserId(user1.id);
    const newWallet2 = await storage.getWalletByUserId(user2.id);
    console.log(`   User 1: ${newWallet1?.balance || 0} FIZZ (+${fizzcoinsEarned})`);
    console.log(`   User 2: ${newWallet2?.balance || 0} FIZZ (+${fizzcoinsEarned})`);

    // Step 7: Check recent transactions
    console.log('\n7️⃣  Recent Transactions:');
    const transactions1 = await storage.getTransactionsByUserId(user1.id, { limit: 5 });
    const latestTransaction = transactions1[0];
    if (latestTransaction) {
      console.log(`   Latest: ${latestTransaction.amount} FIZZ (${latestTransaction.transactionType})`);
      console.log(`   Created: ${new Date(latestTransaction.createdAt).toLocaleString()}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ SUCCESS! You earned 25 FIZZ!');
    console.log('\n📝 Next Steps:');
    console.log('1. Login to FizzCard: http://localhost:5014');
    console.log('2. Go to Wallet page to see your balance');
    console.log('3. Connect your Privy wallet (if not already done)');
    console.log('4. Click "Claim Rewards" to send FIZZ to blockchain');
    console.log('5. Verify transaction on BaseScan!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
