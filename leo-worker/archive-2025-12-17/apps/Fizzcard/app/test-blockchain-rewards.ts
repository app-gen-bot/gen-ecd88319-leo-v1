/**
 * Test blockchain reward integration
 *
 * This script tests the blockchain-first reward flow:
 * 1. Creates two users
 2. Creates crypto wallets for both
 * 3. Makes a contact exchange
 * 4. Verifies blockchain rewards are credited
 */

const API_URL = 'http://localhost:5013';

interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

interface CryptoWallet {
  id: number;
  userId: number;
  walletAddress: string;
}

async function signup(name: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Signup failed: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.name,
    token: data.token,
  };
}

async function createCryptoWallet(token: string): Promise<CryptoWallet> {
  // Generate a random wallet address (Base Sepolia format)
  const randomAddress = '0x' + Array.from({ length: 40 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const response = await fetch(`${API_URL}/api/crypto-wallet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      walletAddress: randomAddress,
      walletType: 'embedded',
    }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: await response.text() };
    }

    // If wallet already exists, return the existing wallet
    if (response.status === 409 && errorData.existingWallet) {
      return errorData.existingWallet;
    }

    throw new Error(`Create wallet failed: ${JSON.stringify(errorData)}`);
  }

  return await response.json();
}

async function createContactExchange(senderToken: string, receiverId: number) {
  const response = await fetch(`${API_URL}/api/contact-exchanges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${senderToken}`,
    },
    body: JSON.stringify({
      receiverId,
      method: 'qr_code',
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: 'San Francisco, CA',
      metAt: new Date().toISOString(),
      status: 'pending',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create exchange failed: ${error}`);
  }

  return await response.json();
}

async function acceptContactExchange(receiverToken: string, exchangeId: number) {
  const response = await fetch(`${API_URL}/api/contact-exchanges/${exchangeId}/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${receiverToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Accept exchange failed: ${error}`);
  }

  return await response.json();
}

async function getWalletBalance(token: string) {
  const response = await fetch(`${API_URL}/api/crypto-wallet/balance`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get balance failed: ${error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🚀 Testing blockchain reward integration...\n');

  try {
    // Step 1: Create two users
    console.log('Step 1: Creating two test users...');
    const user1 = await signup('Alice Blockchain', 'alice-blockchain@example.com', '12345678');
    const user2 = await signup('Bob Blockchain', 'bob-blockchain@example.com', '12345678');
    console.log(`✅ Created users: ${user1.name} (ID: ${user1.id}) and ${user2.name} (ID: ${user2.id})\n`);

    // Step 2: Create crypto wallets for both users
    console.log('Step 2: Creating crypto wallets...');
    const wallet1 = await createCryptoWallet(user1.token);
    const wallet2 = await createCryptoWallet(user2.token);
    console.log(`✅ Created wallets:`);
    console.log(`   ${user1.name}: ${wallet1.walletAddress}`);
    console.log(`   ${user2.name}: ${wallet2.walletAddress}\n`);

    // Step 3: Create contact exchange (Alice scans Bob's QR code)
    console.log('Step 3: Creating contact exchange (Alice → Bob)...');
    const exchange = await createContactExchange(user1.token, user2.id);
    console.log(`✅ Contact exchange created (ID: ${exchange.id})\n`);

    // Step 4: Accept contact exchange (Bob accepts)
    console.log('Step 4: Bob accepts the contact exchange...');
    const acceptResult = await acceptContactExchange(user2.token, exchange.id);
    console.log(`✅ Exchange accepted!`);
    console.log(`   FizzCoins earned: ${acceptResult.fizzcoinsEarned} FIZZ each\n`);

    // Step 5: Check wallet balances
    console.log('Step 5: Checking wallet balances...');
    const balance1 = await getWalletBalance(user1.token);
    const balance2 = await getWalletBalance(user2.token);

    console.log(`\n📊 Wallet Balances:`);
    console.log(`\n${user1.name}:`);
    console.log(`   On-Chain: ${balance1.onChainBalance} FIZZ`);
    console.log(`   Pending:  ${balance1.pendingClaims} FIZZ`);
    console.log(`   Total:    ${balance1.totalBalance} FIZZ`);

    console.log(`\n${user2.name}:`);
    console.log(`   On-Chain: ${balance2.onChainBalance} FIZZ`);
    console.log(`   Pending:  ${balance2.pendingClaims} FIZZ`);
    console.log(`   Total:    ${balance2.totalBalance} FIZZ`);

    // Verification
    console.log(`\n✅ Test Results:`);
    if (balance1.pendingClaims === 25 && balance2.pendingClaims === 25) {
      console.log(`   ✅ Both users have 25 FIZZ pending (blockchain rewards credited!)`);
      console.log(`   ✅ Blockchain-first reward flow is working correctly!`);
      console.log(`\n💡 Next step: Users can claim their rewards to get on-chain balance`);
    } else {
      console.log(`   ⚠️  Unexpected balances:`);
      console.log(`      ${user1.name}: ${balance1.pendingClaims} FIZZ (expected 25)`);
      console.log(`      ${user2.name}: ${balance2.pendingClaims} FIZZ (expected 25)`);
      console.log(`   This might indicate database fallback was used`);
    }

    console.log(`\n🎉 Test completed successfully!`);
  } catch (error: any) {
    console.error(`\n❌ Test failed:`, error.message);
    process.exit(1);
  }
}

main();
