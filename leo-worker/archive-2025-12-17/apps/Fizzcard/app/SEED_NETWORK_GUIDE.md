# FizzCard Network Seeding Guide

This guide explains how to use the `seed-network.js` script to populate your FizzCard demo with a rich network graph.

## Overview

The seeding script creates a realistic social network by:

1. Logging in all demo users (IDs 63-77)
2. Creating contact exchanges between users
3. Automatically accepting those exchanges to establish bidirectional connections
4. Building a hub-and-spoke network pattern with clusters

## Prerequisites

- Node.js 18+ (native fetch support)
- Access to the production API at `https://fizzcard.fly.dev`
- Demo users already created (IDs 63-77)

## Network Architecture

The script creates the following network structure:

### Hub 1: Alice (User 63)
Connected to 10 people:
- Bob, Charlie, Diana, Eve (main contacts)
- User1-6 (extended network)

### Hub 2: Bob (User 64)
Connected to 8 people:
- Charlie, Diana, Eve (overlap with Alice)
- User7-10 (his own network)

### Connector: Charlie (User 65)
Bridges different groups:
- Connected to both Alice and Bob's networks
- Links User1, User7, and User8

### Cluster 1: Diana's Group (User 66)
Small tight-knit group:
- Diana, User2, User3

### Cluster 2: Eve's Group (User 67)
Another small cluster:
- Eve, User4, User5, User9

### Cross-Cluster Connections
Additional connections that create network richness:
- User1 ↔ User7
- User2 ↔ User8
- User3 ↔ User4
- User5 ↔ User6
- User7 ↔ User9
- User8 ↔ User10

## Usage

### Basic Usage

```bash
node seed-network.js
```

### Expected Output

```
🌱 Seeding FizzCard Network...

🔐 Logging in users...
  ✓ Alice (alice@fizzcard.com)
  ✓ Bob (bob@fizzcard.com)
  ✓ Charlie (charlie@fizzcard.com)
  ... (and 12 more)

✅ Logged in 15/15 users

📊 Creating network pattern...

Hub 1: Alice (connected to 10 people)
  ✓ Alice ↔ Bob (at TechCrunch Disrupt)
  ✓ Alice ↔ Charlie (at Y Combinator Demo Day)
  ... (and 8 more)

Hub 2: Bob (connected to 8 people)
  ✓ Bob ↔ Charlie (at Starbucks)
  ... (and 7 more)

... (more connections)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Network seeding completed!

📊 Statistics:
   - Total exchanges created: 45
   - Total connections established: 90 (bidirectional)
   - Users participating: 15

🎉 Your FizzCard network is ready for demo!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Features

### Realistic Metadata
- Random meetup locations in San Francisco (TechCrunch Disrupt, Y Combinator, cafes, offices)
- Random exchange methods (QR code, NFC, direct share)
- Random meeting times within the past 90 days
- GPS coordinates for each location

### Network Characteristics
- Hub nodes (Alice and Bob with many connections)
- Bridge nodes (Charlie connecting different groups)
- Tight clusters (Diana's and Eve's groups)
- Cross-cluster connections for richness
- Total of ~45 unique connections creating 90 bidirectional links

### Error Handling
- Graceful handling of login failures
- Retry logic for rate limiting
- Detailed error reporting
- Continues even if some connections fail

## Troubleshooting

### Login Failures

If users fail to login, verify:
1. User accounts exist in the database (IDs 63-77)
2. Passwords are set to "password123"
3. API is accessible at https://fizzcard.fly.dev

### Rate Limiting

The script includes 200ms delays between requests to avoid rate limiting. If you still encounter issues:
- Increase the delay in the `setTimeout` calls
- Run the script in smaller batches

### Duplicate Connections

If the script is run multiple times, some connections may already exist. The API should handle this gracefully, but you may see errors for duplicate exchanges.

## Customization

### Adding More Locations

Edit the `LOCATIONS` array to add more meetup spots:

```javascript
const LOCATIONS = [
  { name: 'Your Location', lat: 37.7749, lng: -122.4194 },
  // Add more...
];
```

### Changing Network Pattern

Modify the connection arrays to create different network structures:

```javascript
const aliceConnections = [64, 65, 66, ...]; // Add/remove user IDs
```

### Adjusting Time Range

Change the `randomPastDate()` function to use a different time range:

```javascript
const daysAgo = Math.floor(Math.random() * 30); // Last 30 days instead of 90
```

## What Happens When You Run It

1. **Authentication**: Script logs in all 15 users and stores their JWT tokens
2. **Exchange Creation**: For each connection, the script:
   - User A creates a contact exchange to User B
   - User B accepts the exchange
   - API creates bidirectional connections
   - Both users receive FizzCoins
   - Badges are updated if thresholds are met
3. **Network Graph**: The result is a rich social graph perfect for demos

## Database Impact

This script will:
- Create ~45 contact exchanges
- Create ~90 connections (bidirectional)
- Award FizzCoins to all participating users
- Potentially award Super Connector badges to hub users
- NOT create any new users (uses existing users only)

## Cleanup

To reset the network and start over:

1. Delete all contact exchanges for these users
2. Delete all connections for these users
3. Reset FizzCoin balances if desired
4. Run the script again

## Integration with FizzCard

After running this script, you can:
- View the network graph in the Network page
- See connection lists for each user
- View FizzCoin balances and transactions
- Check Super Connector badges for Alice and Bob
- Test the leaderboard rankings

## Support

For issues or questions about the seeding script:
1. Check the error messages in the output
2. Verify API accessibility
3. Ensure all users exist in the database
4. Check server logs for detailed error information
