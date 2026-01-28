/**
 * Test script to earn FIZZ tokens via API
 *
 * This script:
 * 1. Logs in as labhesh@gmail.com
 * 2. Creates a second test user
 * 3. Logs in as second user
 * 4. Creates contact exchange from user 1 to user 2
 * 5. User 2 accepts the exchange
 * 6. Both users earn 25 FIZZ
 */

const API_URL = 'http://localhost:5013';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  token: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
}

interface ContactExchange {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
}

async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Login failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, bio: 'Test user' }),
  });

  if (!response.ok) {
    // If user already exists, try logging in
    if (response.status === 400 || response.status === 409) {
      console.log(`   User ${email} already exists, logging in...`);
      return login(email, password);
    }
    const text = await response.text();
    throw new Error(`Signup failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function createContactExchange(
  token: string,
  receiverId: number
): Promise<ContactExchange> {
  const response = await fetch(`${API_URL}/api/contact-exchanges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
    const text = await response.text();
    throw new Error(`Create exchange failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function acceptContactExchange(token: string, exchangeId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/contact-exchanges/${exchangeId}/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Accept exchange failed: ${response.status} ${text}`);
  }
}

async function getWallet(token: string): Promise<{ balance: number }> {
  const response = await fetch(`${API_URL}/api/wallet`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Get wallet failed: ${response.status} ${text}`);
  }

  return response.json();
}

async function main() {
  console.log('\n🎮 FizzCard - Earn FIZZ via API Test\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Login as user 1
    console.log('\n1️⃣  Logging in as labhesh@gmail.com...');
    const user1Auth = await login('labhesh@gmail.com', '12345678');
    console.log(`   ✅ Logged in: ${user1Auth.user.name} (ID: ${user1Auth.user.id})`);

    // Step 2: Create/login user 2
    console.log('\n2️⃣  Setting up test user 2...');
    const user2Auth = await signup('test2@example.com', 'password123', 'Test User 2');
    console.log(`   ✅ User 2 ready: ${user2Auth.user.name} (ID: ${user2Auth.user.id})`);

    // Step 3: Check initial balances
    console.log('\n3️⃣  Current FIZZ Balances:');
    const wallet1Before = await getWallet(user1Auth.token);
    const wallet2Before = await getWallet(user2Auth.token);
    console.log(`   User 1: ${wallet1Before.balance} FIZZ`);
    console.log(`   User 2: ${wallet2Before.balance} FIZZ`);

    // Step 4: Create contact exchange from user 1 to user 2
    console.log('\n4️⃣  Creating contact exchange...');
    const exchange = await createContactExchange(user1Auth.token, user2Auth.user.id);
    console.log(`   ✅ Exchange created (ID: ${exchange.id})`);
    console.log(`   Sender: User ${exchange.senderId} → Receiver: User ${exchange.receiverId}`);

    // Step 5: User 2 accepts the exchange
    console.log('\n5️⃣  Accepting contact exchange as user 2...');
    await acceptContactExchange(user2Auth.token, exchange.id);
    console.log(`   ✅ Exchange accepted!`);

    // Step 6: Check updated balances
    console.log('\n6️⃣  Updated FIZZ Balances:');
    const wallet1After = await getWallet(user1Auth.token);
    const wallet2After = await getWallet(user2Auth.token);
    const user1Earned = wallet1After.balance - wallet1Before.balance;
    const user2Earned = wallet2After.balance - wallet2Before.balance;
    console.log(`   User 1: ${wallet1After.balance} FIZZ (+${user1Earned})`);
    console.log(`   User 2: ${wallet2After.balance} FIZZ (+${user2Earned})`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ SUCCESS! You earned FIZZ!');
    console.log('\n📝 Next Steps:');
    console.log('1. Refresh FizzCard wallet page: http://localhost:5014/wallet');
    console.log('2. You should see your updated balance');
    console.log('3. Connect your Privy wallet (if not already done)');
    console.log('4. Click "Claim Rewards" to send FIZZ to blockchain');
    console.log('5. Verify transaction on BaseScan!');
    console.log('   https://sepolia.basescan.org/address/YOUR_WALLET_ADDRESS');
    console.log('='.repeat(50) + '\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
