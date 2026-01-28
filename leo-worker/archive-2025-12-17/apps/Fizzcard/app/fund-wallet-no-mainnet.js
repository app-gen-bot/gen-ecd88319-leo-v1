#!/usr/bin/env node
/**
 * Wallet Funding - No Mainnet ETH Required
 *
 * Alternative faucets that DON'T require mainnet ETH balance
 */

import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const MIN_BALANCE = parseEther('0.01');
const RPC_URL = 'https://sepolia.base.org';

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function tryQuickNodeFaucet() {
  log('\n🔄 Attempting QuickNode faucet (no mainnet ETH required)...', 'cyan');

  try {
    const response = await fetch('https://faucet.quicknode.com/drip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet_address: REWARD_WALLET,
        network: 'base-sepolia',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      log('✅ QuickNode faucet request successful!', 'green');
      if (data.txHash) {
        log(`Transaction: ${data.txHash}`, 'green');
        log(`View: https://sepolia.basescan.org/tx/${data.txHash}`, 'green');
      }
      return true;
    } else {
      const error = await response.text();
      log(`⚠️  QuickNode: ${error}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`⚠️  QuickNode error: ${error.message}`, 'yellow');
    return false;
  }
}

async function tryBwareLabsFaucet() {
  log('\n🔄 Attempting Bware Labs faucet (no mainnet ETH required)...', 'cyan');

  try {
    const response = await fetch('https://faucet.bwarelabs.com/api/v1/faucet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: REWARD_WALLET,
        chainId: 84532, // Base Sepolia
      }),
    });

    if (response.ok) {
      const data = await response.json();
      log('✅ Bware Labs faucet request successful!', 'green');
      if (data.transactionHash) {
        log(`Transaction: ${data.transactionHash}`, 'green');
        log(`View: https://sepolia.basescan.org/tx/${data.transactionHash}`, 'green');
      }
      return true;
    } else {
      const error = await response.text();
      log(`⚠️  Bware Labs: ${error}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`⚠️  Bware Labs error: ${error.message}`, 'yellow');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  WALLET FUNDING - NO MAINNET ETH REQUIRED', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  // Check current balance
  log('📊 Checking wallet balance...', 'cyan');
  const balance = await publicClient.getBalance({ address: REWARD_WALLET });
  log(`Current Balance: ${formatEther(balance)} ETH\n`, 'blue');

  if (balance >= MIN_BALANCE) {
    log('✅ Wallet already funded!', 'green');
    log(`   Balance: ${formatEther(balance)} ETH\n`, 'green');
    log('🎉 Ready to test!', 'magenta');
    log('\nNext steps:', 'cyan');
    log('  npm run dev', 'blue');
    log('  npm run test:blockchain\n', 'blue');
    return;
  }

  log('⚠️  Wallet needs funding', 'yellow');
  log(`   Current: ${formatEther(balance)} ETH`, 'yellow');
  log(`   Needed:  ${formatEther(MIN_BALANCE)} ETH\n`, 'yellow');

  log('🤖 Trying automated faucets (no mainnet ETH required)...\n', 'cyan');

  // Try automated faucets
  const faucets = [
    { name: 'QuickNode', fn: tryQuickNodeFaucet },
    { name: 'Bware Labs', fn: tryBwareLabsFaucet },
  ];

  for (const faucet of faucets) {
    const success = await faucet.fn();
    if (success) {
      log(`\n⏳ Waiting for transaction to confirm (30 seconds)...`, 'yellow');
      await new Promise(resolve => setTimeout(resolve, 30000));

      const newBalance = await publicClient.getBalance({ address: REWARD_WALLET });
      log(`\n📊 New Balance: ${formatEther(newBalance)} ETH\n`, 'blue');

      if (newBalance >= MIN_BALANCE) {
        log('✅ SUCCESS! Wallet funded!', 'green');
        log(`   Method: ${faucet.name}`, 'green');
        log(`   Balance: ${formatEther(newBalance)} ETH\n`, 'green');
        log('🎉 Ready to test!', 'magenta');
        log('  npm run dev', 'blue');
        log('  npm run test:blockchain\n', 'blue');
        return;
      }
    }
  }

  // All automated methods failed - show manual options
  log('\n' + '='.repeat(60), 'yellow');
  log('  AUTOMATED FAUCETS UNAVAILABLE', 'yellow');
  log('='.repeat(60) + '\n', 'yellow');

  log('📋 EASIEST MANUAL OPTION (No Mainnet ETH Required):\n', 'magenta');

  log('Option 1: LearnWeb3 Faucet (Recommended)', 'cyan');
  log('  1. Visit: https://learnweb3.io/faucets/base_sepolia', 'blue');
  log(`  2. Paste: ${REWARD_WALLET}`, 'blue');
  log('  3. Complete simple CAPTCHA', 'blue');
  log('  4. Get 0.05 ETH instantly\n', 'blue');

  log('Option 2: Sepolia PoW Faucet (No signup)', 'cyan');
  log('  1. Visit: https://sepolia-faucet.pk910.de/', 'blue');
  log(`  2. Enter: ${REWARD_WALLET}`, 'blue');
  log('  3. Start mining (runs in browser, 5-10 min)', 'blue');
  log('  4. Get Sepolia ETH', 'blue');
  log('  5. Bridge to Base: https://bridge.base.org/\n', 'blue');

  log('Option 3: Coinbase Wallet Method', 'cyan');
  log('  1. Install Coinbase Wallet extension', 'blue');
  log('  2. Get Sepolia ETH from: https://www.coinbase.com/faucets', 'blue');
  log('  3. Bridge to Base Sepolia: https://bridge.base.org/', 'blue');
  log('  4. Send to reward wallet\n', 'blue');

  log('Copy-paste commands:', 'cyan');
  log('', 'reset');
  log(`  # Open LearnWeb3 faucet`, 'green');
  log(`  open "https://learnweb3.io/faucets/base_sepolia"`, 'green');
  log('', 'reset');
  log(`  # Your wallet address (copy this):`, 'green');
  log(`  ${REWARD_WALLET}`, 'bold');
  log('', 'reset');

  log('\nAfter funding:', 'cyan');
  log('  npm run check:balance\n', 'blue');

  // Try to open browser
  try {
    const { exec } = await import('child_process');
    log('🌐 Opening LearnWeb3 faucet in browser...\n', 'cyan');

    const platform = process.platform;
    const command = platform === 'darwin' ? 'open' :
                   platform === 'win32' ? 'start' :
                   'xdg-open';

    exec(`${command} "https://learnweb3.io/faucets/base_sepolia"`, (error) => {
      if (!error) {
        log('✅ Browser opened! Paste your address there.\n', 'green');
      }
    });
  } catch (error) {
    // Ignore browser open errors
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
