#!/usr/bin/env node

/**
 * FizzCard Network Seeding Script
 *
 * This script creates a realistic network graph for demo purposes by:
 * 1. Logging in all users (IDs 63-77)
 * 2. Creating contact exchanges between users
 * 3. Accepting those exchanges to create bidirectional connections
 * 4. Building hub-and-spoke network patterns with clusters
 *
 * Usage: node seed-network.js
 */

const API_BASE_URL = 'https://fizzcard.fly.dev';

// User database with credentials
const USERS = [
  { id: 63, email: 'alice@fizzcard.com', password: 'password123', name: 'Alice' },
  { id: 64, email: 'bob@fizzcard.com', password: 'password123', name: 'Bob' },
  { id: 65, email: 'charlie@fizzcard.com', password: 'password123', name: 'Charlie' },
  { id: 66, email: 'diana@fizzcard.com', password: 'password123', name: 'Diana' },
  { id: 67, email: 'eve@fizzcard.com', password: 'password123', name: 'Eve' },
  { id: 68, email: 'user1@demo.com', password: 'password123', name: 'User 1' },
  { id: 69, email: 'user2@demo.com', password: 'password123', name: 'User 2' },
  { id: 70, email: 'user3@demo.com', password: 'password123', name: 'User 3' },
  { id: 71, email: 'user4@demo.com', password: 'password123', name: 'User 4' },
  { id: 72, email: 'user5@demo.com', password: 'password123', name: 'User 5' },
  { id: 73, email: 'user6@demo.com', password: 'password123', name: 'User 6' },
  { id: 74, email: 'user7@demo.com', password: 'password123', name: 'User 7' },
  { id: 75, email: 'user8@demo.com', password: 'password123', name: 'User 8' },
  { id: 76, email: 'user9@demo.com', password: 'password123', name: 'User 9' },
  { id: 77, email: 'user10@demo.com', password: 'password123', name: 'User 10' },
];

// Popular meetup locations in San Francisco
const LOCATIONS = [
  { name: 'TechCrunch Disrupt, Moscone Center, SF', lat: 37.7842, lng: -122.4016 },
  { name: 'Y Combinator Demo Day, SF', lat: 37.7749, lng: -122.4194 },
  { name: 'Starbucks, Market St, SF', lat: 37.7858, lng: -122.4064 },
  { name: 'Google SF Office', lat: 37.7900, lng: -122.3889 },
  { name: 'Salesforce Park, SF', lat: 37.7897, lng: -122.3969 },
  { name: 'GitHub Office, SF', lat: 37.7815, lng: -122.3924 },
  { name: 'Blue Bottle Coffee, Hayes Valley', lat: 37.7749, lng: -122.4267 },
  { name: 'SF Startup Week, Fort Mason', lat: 37.8057, lng: -122.4323 },
  { name: 'Caltrain Station, SF', lat: 37.7765, lng: -122.3947 },
  { name: 'Ferry Building, SF', lat: 37.7956, lng: -122.3935 },
];

// Exchange methods for variety
const EXCHANGE_METHODS = ['qr_code', 'nfc', 'direct_share'];

/**
 * Generate a random past datetime within the last 90 days
 */
function randomPastDate() {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 90);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);

  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);

  return date.toISOString();
}

/**
 * Get a random location
 */
function randomLocation() {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

/**
 * Get a random exchange method
 */
function randomMethod() {
  return EXCHANGE_METHODS[Math.floor(Math.random() * EXCHANGE_METHODS.length)];
}

/**
 * Login a user and return their token
 */
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed for ${email}: ${error}`);
  }

  const data = await response.json();
  return data.token;
}

/**
 * Create a contact exchange (sender initiates to receiver)
 */
async function createExchange(senderToken, receiverId) {
  const location = randomLocation();

  const response = await fetch(`${API_BASE_URL}/api/contact-exchanges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${senderToken}`,
    },
    body: JSON.stringify({
      receiverId,
      method: randomMethod(),
      latitude: location.lat,
      longitude: location.lng,
      locationName: location.name,
      metAt: randomPastDate(),
      status: 'pending',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Accept a contact exchange (receiver accepts)
 */
async function acceptExchange(receiverToken, exchangeId) {
  const response = await fetch(`${API_BASE_URL}/api/contact-exchanges/${exchangeId}/accept`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${receiverToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Accept exchange failed: ${error}`);
  }

  return await response.json();
}

/**
 * Create a connection between two users (bidirectional)
 */
async function createConnection(senderUser, receiverUser, userTokens) {
  const senderToken = userTokens.get(senderUser.id);
  const receiverToken = userTokens.get(receiverUser.id);

  // Sender initiates exchange to receiver
  const exchange = await createExchange(senderToken, receiverUser.id);

  // Small delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 100));

  // Receiver accepts the exchange
  await acceptExchange(receiverToken, exchange.id);

  console.log(`  ✓ ${senderUser.name} ↔ ${receiverUser.name} (at ${exchange.locationName?.split(',')[0] || 'Unknown'})`);
}

/**
 * Main seeding function
 */
async function seedNetwork() {
  console.log('🌱 Seeding FizzCard Network...\n');

  // Step 1: Login all users
  console.log('🔐 Logging in users...');
  const userTokens = new Map();

  for (const user of USERS) {
    try {
      const token = await loginUser(user.email, user.password);
      userTokens.set(user.id, token);
      console.log(`  ✓ ${user.name} (${user.email})`);
    } catch (error) {
      console.error(`  ✗ Failed to login ${user.email}:`, error.message);
    }
  }

  console.log(`\n✅ Logged in ${userTokens.size}/${USERS.length} users\n`);

  if (userTokens.size === 0) {
    console.error('❌ No users logged in. Exiting.');
    process.exit(1);
  }

  // Step 2: Create network pattern
  console.log('📊 Creating network pattern...\n');

  let exchangesCreated = 0;
  const errors = [];

  // Helper to find user by ID
  const getUserById = (id) => USERS.find(u => u.id === id);

  try {
    // Alice (63) as primary hub - connected to 10 people
    console.log('Hub 1: Alice (connected to 10 people)');
    const alice = getUserById(63);
    const aliceConnections = [64, 65, 66, 67, 68, 69, 70, 71, 72, 73];

    for (const connId of aliceConnections) {
      if (userTokens.has(connId)) {
        try {
          await createConnection(alice, getUserById(connId), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`Alice → ${getUserById(connId).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Bob (64) as secondary hub - connected to 8 people (overlap with Alice)
    console.log('Hub 2: Bob (connected to 8 people)');
    const bob = getUserById(64);
    const bobConnections = [65, 66, 67, 74, 75, 76, 77]; // Note: 65, 66, 67 overlap with Alice

    for (const connId of bobConnections) {
      if (userTokens.has(connId)) {
        try {
          await createConnection(bob, getUserById(connId), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`Bob → ${getUserById(connId).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Charlie (65) as connector - bridges groups
    console.log('Connector: Charlie (bridges groups)');
    const charlie = getUserById(65);
    const charlieConnections = [68, 74, 75];

    for (const connId of charlieConnections) {
      if (userTokens.has(connId)) {
        try {
          await createConnection(charlie, getUserById(connId), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`Charlie → ${getUserById(connId).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Diana (66) cluster - small tight group
    console.log('Cluster 1: Diana\'s group');
    const diana = getUserById(66);
    const dianaConnections = [69, 70];

    for (const connId of dianaConnections) {
      if (userTokens.has(connId)) {
        try {
          await createConnection(diana, getUserById(connId), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`Diana → ${getUserById(connId).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Eve (67) cluster - another small group
    console.log('Cluster 2: Eve\'s group');
    const eve = getUserById(67);
    const eveConnections = [71, 72, 76];

    for (const connId of eveConnections) {
      if (userTokens.has(connId)) {
        try {
          await createConnection(eve, getUserById(connId), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`Eve → ${getUserById(connId).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

    // Cross-cluster connections for richness
    console.log('Cross-cluster connections');
    const crossConnections = [
      [68, 74], // User1 ↔ User7
      [69, 75], // User2 ↔ User8
      [70, 71], // User3 ↔ User4
      [72, 73], // User5 ↔ User6
      [74, 76], // User7 ↔ User9
      [75, 77], // User8 ↔ User10
    ];

    for (const [id1, id2] of crossConnections) {
      if (userTokens.has(id1) && userTokens.has(id2)) {
        try {
          await createConnection(getUserById(id1), getUserById(id2), userTokens);
          exchangesCreated++;
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          errors.push(`${getUserById(id1).name} → ${getUserById(id2).name}: ${error.message}`);
          console.error(`  ✗ Error: ${error.message}`);
        }
      }
    }
    console.log('');

  } catch (error) {
    console.error('❌ Fatal error during network creation:', error);
  }

  // Step 3: Summary
  console.log('━'.repeat(60));
  console.log('✅ Network seeding completed!\n');
  console.log(`📊 Statistics:`);
  console.log(`   - Total exchanges created: ${exchangesCreated}`);
  console.log(`   - Total connections established: ${exchangesCreated * 2} (bidirectional)`);
  console.log(`   - Users participating: ${userTokens.size}`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${errors.length}`);
    console.log('   (Some connections may have failed due to rate limiting or duplicates)');
  }

  console.log('\n🎉 Your FizzCard network is ready for demo!');
  console.log('━'.repeat(60));
}

// Run the script
seedNetwork().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
