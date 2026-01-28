#!/usr/bin/env node
/**
 * Programmatic Wallet Funding using Alchemy SDK
 *
 * This script uses Alchemy's SDK to automatically request testnet ETH
 * for the reward wallet. No manual steps required!
 */

import { Alchemy, Network } from 'alchemy-sdk';
import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const MIN_BALANCE = parseEther('0.01');

// Colors
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

async function main() {
  console.log(`\n${cyan}========================================`);
  console.log('  AUTOMATED ALCHEMY FUNDING');
  console.log(`========================================${reset}\n`);

  // Check if Alchemy API key exists
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    console.log(`${yellow}⚠️  ALCHEMY_API_KEY not found in .env${reset}\n`);
    console.log('To enable automated funding:');
    console.log('1. Visit: https://www.alchemy.com/');
    console.log('2. Sign up for free account');
    console.log('3. Create a new app (Base Sepolia)');
    console.log('4. Copy API key');
    console.log('5. Add to .env:');
    console.log('   ALCHEMY_API_KEY=your-key-here\n');
    console.log('Then run this script again.\n');
    console.log(`${cyan}For now, use manual method:${reset}`);
    console.log('See: EASY_FUNDING_FIX.md\n');
    process.exit(1);
  }

  // Initialize Alchemy SDK
  const alchemy = new Alchemy({
    apiKey: alchemyApiKey,
    network: Network.BASE_SEPOLIA,
  });

  // Check current balance
  console.log(`${cyan}📊 Checking current balance...${reset}`);
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  const balance = await publicClient.getBalance({ address: REWARD_WALLET });
  console.log(`Current Balance: ${formatEther(balance)} ETH\n`);

  if (balance >= MIN_BALANCE) {
    console.log(`${green}✅ Wallet already funded!${reset}`);
    console.log(`Balance: ${formatEther(balance)} ETH`);
    console.log(`Minimum: ${formatEther(MIN_BALANCE)} ETH\n`);
    console.log(`${green}🎉 Ready to test!${reset}`);
    console.log('Run: npm run dev');
    console.log('Run: ./test-blockchain-connection.sh\n');
    process.exit(0);
  }

  // Request funds from Alchemy faucet
  console.log(`${cyan}💧 Requesting ETH from Alchemy faucet...${reset}`);
  console.log(`Address: ${REWARD_WALLET}`);

  try {
    // Note: Alchemy SDK doesn't have direct faucet method in latest version
    // We'll use direct API call
    const response = await fetch(
      'https://api.g.alchemy.com/v1/faucet',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${alchemyApiKey}`,
        },
        body: JSON.stringify({
          address: REWARD_WALLET,
          network: 'base-sepolia',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Faucet request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.txHash) {
      console.log(`\n${green}✅ Faucet request successful!${reset}`);
      console.log(`Transaction: ${data.txHash}`);
      console.log(`View: https://sepolia.basescan.org/tx/${data.txHash}\n`);

      console.log(`${yellow}⏳ Waiting for transaction to confirm (30 seconds)...${reset}`);
      await new Promise(resolve => setTimeout(resolve, 30000));

      // Check new balance
      const newBalance = await publicClient.getBalance({ address: REWARD_WALLET });
      console.log(`\n${cyan}📊 New Balance: ${formatEther(newBalance)} ETH${reset}\n`);

      if (newBalance >= MIN_BALANCE) {
        console.log(`${green}✅ SUCCESS! Wallet funded!${reset}`);
        console.log(`Balance: ${formatEther(newBalance)} ETH\n`);
        console.log(`${green}🎉 Ready to test blockchain integration!${reset}`);
        console.log('Run: npm run dev');
        console.log('Run: ./test-blockchain-connection.sh\n');
        process.exit(0);
      } else {
        console.log(`${yellow}⚠️  Balance still low, may need to wait longer${reset}`);
        console.log(`Current: ${formatEther(newBalance)} ETH`);
        console.log(`Needed: ${formatEther(MIN_BALANCE)} ETH\n`);
        console.log('Check balance again in 1 minute:');
        console.log('  node verify-wallet-balance.js\n');
      }
    } else {
      throw new Error('No transaction hash returned');
    }
  } catch (error) {
    console.log(`\n${red}❌ Automated funding failed: ${error.message}${reset}\n`);
    console.log(`${yellow}FALLBACK: Use manual method${reset}`);
    console.log('1. Visit: https://www.alchemy.com/faucets/base-sepolia');
    console.log(`2. Enter: ${REWARD_WALLET}`);
    console.log('3. Request 0.1 ETH\n');
    console.log('See: EASY_FUNDING_FIX.md for detailed steps\n');
    process.exit(1);
  }
}

main().catch(console.error);
