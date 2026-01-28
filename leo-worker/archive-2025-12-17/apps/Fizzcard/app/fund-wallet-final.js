#!/usr/bin/env node
/**
 * Smart Wallet Funding Assistant
 *
 * No mainnet ETH required!
 * Opens the easiest faucet directly in your browser
 */

import { createPublicClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const MIN_BALANCE = parseEther('0.01');

const c = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  reset: '\x1b[0m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('  💰 SMART WALLET FUNDING ASSISTANT', 'cyan');
  log('='.repeat(70) + '\n', 'cyan');

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  // Check balance
  log('📊 Checking wallet balance...', 'cyan');
  const balance = await client.getBalance({ address: REWARD_WALLET });
  log(`Balance: ${formatEther(balance)} ETH\n`, 'blue');

  if (balance >= MIN_BALANCE) {
    log('✅ WALLET ALREADY FUNDED!', 'green');
    log(`   Balance: ${formatEther(balance)} ETH`, 'green');
    log(`   Minimum: ${formatEther(MIN_BALANCE)} ETH\n`, 'green');
    log('🎉 Ready to test blockchain integration!', 'magenta');
    log('\nNext steps:', 'cyan');
    log('  npm run dev           # Start dev server', 'blue');
    log('  npm run test:blockchain   # Run blockchain test\n', 'blue');
    return;
  }

  log('⚠️  Needs Funding', 'yellow');
  log(`   Current: ${formatEther(balance)} ETH`, 'yellow');
  log(`   Needed:  ${formatEther(MIN_BALANCE)} ETH`, 'yellow');
  log(`   Missing: ${formatEther(MIN_BALANCE - balance)} ETH\n`, 'yellow');

  // Show best option
  log('═'.repeat(70), 'magenta');
  log('  🚀 OPENING FAUCET (NO MAINNET ETH REQUIRED)', 'magenta');
  log('═'.repeat(70) + '\n', 'magenta');

  log('Best option: Coinbase Faucet', 'cyan');
  log('  • No mainnet ETH required', 'green');
  log('  • No signup needed', 'green');
  log('  • Get 0.1 ETH instantly', 'green');
  log('  • Most reliable\n', 'green');

  log('Your wallet address (already copied to instructions below):', 'cyan');
  log(`  ${c.bold}${REWARD_WALLET}${c.reset}\n`);

  log('What will happen:', 'cyan');
  log('  1. Browser will open to Coinbase faucet', 'blue');
  log('  2. Paste your wallet address (shown above)', 'blue');
  log('  3. Click "Send me ETH"', 'blue');
  log('  4. Wait 30 seconds for transaction\n', 'blue');

  log('After funding, verify:', 'cyan');
  log('  npm run check:balance\n', 'blue');

  log('═'.repeat(70) + '\n', 'yellow');

  // Open browser
  try {
    const { exec } = await import('child_process');
    log('🌐 Opening Coinbase faucet...', 'cyan');

    // Coinbase faucet for Base Sepolia
    const url = 'https://portal.cdp.coinbase.com/products/faucet';

    const platform = process.platform;
    const cmd = platform === 'darwin' ? 'open' :
               platform === 'win32' ? 'start' :
               'xdg-open';

    exec(`${cmd} "${url}"`, (error) => {
      if (error) {
        log('\n⚠️  Could not auto-open browser.', 'yellow');
        log('Please visit manually:', 'yellow');
        log(`  ${url}\n`, 'blue');
      } else {
        log('✅ Browser opened!\n', 'green');
        log('In the browser:', 'cyan');
        log(`  1. Select "Base Sepolia" network`, 'blue');
        log(`  2. Paste: ${REWARD_WALLET}`, 'blue');
        log(`  3. Click "Send me ETH"`, 'blue');
        log(`  4. Wait 30 seconds\n`, 'blue');
        log('Then verify:', 'cyan');
        log('  npm run check:balance\n', 'blue');
      }
    });
  } catch (error) {
    log('\nManual Steps:', 'yellow');
    log('  1. Visit: https://portal.cdp.coinbase.com/products/faucet', 'blue');
    log('  2. Select "Base Sepolia"', 'blue');
    log(`  3. Paste: ${REWARD_WALLET}`, 'blue');
    log('  4. Click "Send me ETH"\n', 'blue');
  }
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, 'red');
  process.exit(1);
});
