#!/usr/bin/env node
/**
 * Fully Automated Wallet Funding
 * Uses Alchemy API to request testnet ETH programmatically
 */

import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const MIN_BALANCE = parseEther('0.01');
const RPC_URL = 'https://sepolia.base.org';

// Colors
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkBalance(publicClient) {
  const balance = await publicClient.getBalance({ address: REWARD_WALLET });
  return balance;
}

async function requestFromAlchemyFaucet(apiKey) {
  log('\n💧 Requesting ETH from Alchemy faucet...', 'cyan');
  log(`Address: ${REWARD_WALLET}`, 'blue');

  try {
    // Alchemy Faucet API endpoint
    const response = await fetch('https://base-sepolia.g.alchemy.com/v2/' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_requestFaucetFunds',
        params: [REWARD_WALLET],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    }

    if (data.result) {
      log(`\n${colors.green}✅ Faucet request accepted!${colors.reset}`);
      if (data.result.txHash) {
        log(`Transaction: ${data.result.txHash}`, 'green');
        log(`View: https://sepolia.basescan.org/tx/${data.result.txHash}`, 'green');
      }
      return true;
    }

    return false;
  } catch (error) {
    log(`\n❌ Alchemy faucet error: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  AUTOMATED WALLET FUNDING WITH ALCHEMY', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  // Step 1: Check current balance
  log('📊 Checking current balance...', 'cyan');
  const currentBalance = await checkBalance(publicClient);
  log(`Current Balance: ${formatEther(currentBalance)} ETH\n`, 'blue');

  if (currentBalance >= MIN_BALANCE) {
    log('✅ Wallet already has sufficient funds!', 'green');
    log(`   Balance: ${formatEther(currentBalance)} ETH`, 'green');
    log(`   Minimum: ${formatEther(MIN_BALANCE)} ETH\n`, 'green');
    log('🎉 Ready to test blockchain integration!', 'green');
    log('   Run: npm run dev', 'green');
    log('   Run: npm run test:blockchain\n', 'green');
    process.exit(0);
  }

  log('⚠️  Insufficient balance. Attempting automated funding...', 'yellow');
  log(`   Current: ${formatEther(currentBalance)} ETH`, 'yellow');
  log(`   Needed: ${formatEther(MIN_BALANCE)} ETH\n`, 'yellow');

  // Step 2: Check for Alchemy API key
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    log('❌ ALCHEMY_API_KEY not found in .env', 'red');
    log('\nPlease add to .env file:', 'yellow');
    log('  ALCHEMY_API_KEY=your-key-here\n', 'yellow');
    log('Get free API key: https://www.alchemy.com/\n', 'yellow');
    process.exit(1);
  }

  log('✅ Alchemy API key found', 'green');
  log(`   Key: ${alchemyApiKey.substring(0, 10)}...${alchemyApiKey.substring(alchemyApiKey.length - 4)}\n`, 'blue');

  // Step 3: Request funds from Alchemy
  const success = await requestFromAlchemyFaucet(alchemyApiKey);

  if (!success) {
    log('\n❌ Automated funding failed', 'red');
    log('\nPossible reasons:', 'yellow');
    log('  - Rate limit (1 request per 24 hours)', 'yellow');
    log('  - Invalid API key', 'yellow');
    log('  - Network issues\n', 'yellow');
    log('Fallback: Use web faucet', 'cyan');
    log('  https://www.alchemy.com/faucets/base-sepolia\n', 'cyan');
    process.exit(1);
  }

  // Step 4: Wait for transaction
  log(`\n${colors.yellow}⏳ Waiting for transaction to confirm (30 seconds)...${colors.reset}`);
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Step 5: Verify new balance
  log('\n📊 Checking new balance...', 'cyan');
  const newBalance = await checkBalance(publicClient);
  log(`New Balance: ${formatEther(newBalance)} ETH\n`, 'blue');

  if (newBalance >= MIN_BALANCE) {
    log('✅ SUCCESS! Wallet funded automatically!', 'green');
    log(`   Previous: ${formatEther(currentBalance)} ETH`, 'green');
    log(`   Current: ${formatEther(newBalance)} ETH`, 'green');
    log(`   Added: ${formatEther(newBalance - currentBalance)} ETH\n`, 'green');
    log('🎉 Ready to test blockchain integration!', 'green');
    log('   Run: npm run dev', 'green');
    log('   Run: npm run test:blockchain\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Balance increased but still below minimum', 'yellow');
    log(`   Current: ${formatEther(newBalance)} ETH`, 'yellow');
    log(`   Needed: ${formatEther(MIN_BALANCE)} ETH\n`, 'yellow');
    log('💡 Transaction may still be pending. Wait 1-2 minutes and check:', 'cyan');
    log('   npm run check:balance\n', 'cyan');
    process.exit(0);
  }
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
