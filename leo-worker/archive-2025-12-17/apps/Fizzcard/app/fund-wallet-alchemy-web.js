#!/usr/bin/env node
/**
 * Automated Wallet Funding via Alchemy Web Faucet API
 *
 * Note: Alchemy's faucet requires web browser interaction for anti-bot verification.
 * This script checks balance and provides clear next steps.
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
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('  SMART WALLET FUNDING ASSISTANT', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  // Check current balance
  log('📊 Checking wallet balance...', 'cyan');
  const balance = await publicClient.getBalance({ address: REWARD_WALLET });
  log(`Current Balance: ${formatEther(balance)} ETH\n`, 'blue');

  // Check if already funded
  if (balance >= MIN_BALANCE) {
    log('✅ Wallet is already funded!', 'green');
    log(`   Balance: ${formatEther(balance)} ETH`, 'green');
    log(`   Minimum needed: ${formatEther(MIN_BALANCE)} ETH\n`, 'green');

    log('🎉 Ready to start testing!', 'magenta');
    log('\nNext steps:', 'cyan');
    log('  1. Start dev server:  npm run dev', 'blue');
    log('  2. Run test:          npm run test:blockchain\n', 'blue');

    return;
  }

  // Need funding
  log('⚠️  Wallet needs funding', 'yellow');
  log(`   Current: ${formatEther(balance)} ETH`, 'yellow');
  log(`   Needed:  ${formatEther(MIN_BALANCE)} ETH`, 'yellow');
  log(`   Missing: ${formatEther(MIN_BALANCE - balance)} ETH\n`, 'yellow');

  // Show funding options
  log('🚀 EASIEST OPTION: Copy-Paste Command', 'magenta');
  log('=' .repeat(60) + '\n', 'cyan');

  log('Run this ONE command:', 'cyan');
  log('', 'reset');
  log(`  open "https://www.alchemy.com/faucets/base-sepolia?address=${REWARD_WALLET}"`, 'green');
  log('', 'reset');

  log('Then:', 'cyan');
  log('  1. Browser will open Alchemy faucet', 'blue');
  log(`  2. Your address (${REWARD_WALLET}) is pre-filled`, 'blue');
  log('  3. Click "Send Me ETH" button', 'blue');
  log('  4. Wait 30 seconds for confirmation\n', 'blue');

  log('OR Manual steps:', 'cyan');
  log('  1. Visit: https://www.alchemy.com/faucets/base-sepolia', 'blue');
  log(`  2. Paste: ${REWARD_WALLET}`, 'blue');
  log('  3. Click "Send Me ETH"', 'blue');
  log('  4. Receive 0.1 ETH\n', 'blue');

  log('After funding, verify:', 'cyan');
  log('  npm run check:balance\n', 'blue');

  log('═'.repeat(60), 'yellow');
  log('💡 TIP: 0.1 ETH = 2000+ test transactions (lasts months!)', 'yellow');
  log('═'.repeat(60) + '\n', 'yellow');

  // Try to open browser automatically
  try {
    const { exec } = await import('child_process');
    const url = `https://www.alchemy.com/faucets/base-sepolia?address=${REWARD_WALLET}`;

    log('🌐 Opening faucet in browser...', 'cyan');

    // Detect platform and open browser
    const platform = process.platform;
    const command = platform === 'darwin' ? 'open' :
                   platform === 'win32' ? 'start' :
                   'xdg-open';

    exec(`${command} "${url}"`, (error) => {
      if (error) {
        log('⚠️  Could not auto-open browser. Please visit URL above manually.\n', 'yellow');
      } else {
        log('✅ Browser opened! Complete the faucet request there.\n', 'green');
      }
    });
  } catch (error) {
    // Auto-open failed, user can use manual method
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
