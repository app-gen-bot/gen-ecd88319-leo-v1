#!/usr/bin/env tsx
/**
 * Automated Wallet Funding Script
 *
 * Attempts multiple methods to programmatically fund the reward wallet:
 * 1. Alchemy API faucet
 * 2. QuickNode API (if available)
 * 3. Direct contract interaction (if deployer has funds)
 * 4. Fallback to manual instructions
 */

import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const REWARD_WALLET_ADDRESS = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const RPC_URL = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
const MIN_BALANCE = parseEther('0.01'); // Minimum 0.01 ETH needed

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

/**
 * Method 1: Alchemy API Faucet
 */
async function tryAlchemyFaucet(): Promise<boolean> {
  log('\n🔄 Attempting Alchemy API faucet...', 'cyan');

  const alchemyApiKey = process.env.ALCHEMY_API_KEY;

  if (!alchemyApiKey) {
    log('⚠️  ALCHEMY_API_KEY not set in .env', 'yellow');
    log('💡 Get free API key: https://www.alchemy.com/', 'yellow');
    return false;
  }

  try {
    const response = await fetch(
      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}/faucet`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: REWARD_WALLET_ADDRESS,
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      log('✅ Alchemy faucet request successful!', 'green');
      log(`Transaction: ${data.txHash}`, 'green');
      return true;
    } else {
      const error = await response.text();
      log(`❌ Alchemy faucet failed: ${error}`, 'red');
      return false;
    }
  } catch (error: any) {
    log(`❌ Alchemy faucet error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Method 2: Transfer from deployer wallet if it has funds
 */
async function tryDeployerTransfer(): Promise<boolean> {
  log('\n🔄 Checking deployer wallet for funds...', 'cyan');

  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!deployerKey) {
    log('⚠️  DEPLOYER_PRIVATE_KEY not found', 'yellow');
    return false;
  }

  try {
    const deployerAccount = privateKeyToAccount(deployerKey as `0x${string}`);
    const deployerBalance = await publicClient.getBalance({
      address: deployerAccount.address,
    });

    log(`Deployer wallet: ${deployerAccount.address}`, 'blue');
    log(`Deployer balance: ${formatEther(deployerBalance)} ETH`, 'blue');

    // Check if deployer has at least 0.06 ETH (0.05 to send + 0.01 for gas)
    const minRequired = parseEther('0.06');
    if (deployerBalance < minRequired) {
      log('⚠️  Deployer wallet has insufficient funds', 'yellow');
      log(`   Need: ${formatEther(minRequired)} ETH`, 'yellow');
      log(`   Have: ${formatEther(deployerBalance)} ETH`, 'yellow');
      return false;
    }

    // Create wallet client
    const walletClient = createWalletClient({
      account: deployerAccount,
      chain: baseSepolia,
      transport: http(RPC_URL),
    });

    // Send 0.05 ETH to reward wallet
    const amountToSend = parseEther('0.05');
    log(`\n💸 Sending ${formatEther(amountToSend)} ETH to reward wallet...`, 'cyan');

    const hash = await walletClient.sendTransaction({
      to: REWARD_WALLET_ADDRESS,
      value: amountToSend,
    });

    log(`✅ Transaction sent: ${hash}`, 'green');
    log('⏳ Waiting for confirmation...', 'yellow');

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      log('✅ Transfer successful!', 'green');
      log(`   View on BaseScan: https://sepolia.basescan.org/tx/${hash}`, 'green');
      return true;
    } else {
      log('❌ Transaction failed', 'red');
      return false;
    }
  } catch (error: any) {
    log(`❌ Transfer error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Method 3: Use Tenderly Virtual TestNet (Programmatic)
 */
async function tryTenderlyVirtualTestnet(): Promise<boolean> {
  log('\n🔄 Attempting Tenderly Virtual TestNet...', 'cyan');

  const tenderlyApiKey = process.env.TENDERLY_API_KEY;
  const tenderlyProject = process.env.TENDERLY_PROJECT;

  if (!tenderlyApiKey || !tenderlyProject) {
    log('⚠️  Tenderly credentials not set', 'yellow');
    log('💡 Get free account: https://tenderly.co/', 'yellow');
    return false;
  }

  try {
    // Create virtual testnet
    const response = await fetch(
      `https://api.tenderly.co/api/v1/account/${tenderlyProject}/vnets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': tenderlyApiKey,
        },
        body: JSON.stringify({
          slug: 'base-sepolia-fizzcard',
          display_name: 'FizzCard Base Sepolia',
          fork_config: {
            network_id: '84532', // Base Sepolia
          },
          virtual_network_config: {
            chain_config: {
              chain_id: '84532',
            },
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      log('✅ Virtual testnet created!', 'green');
      log(`💡 Update BASE_RPC_URL in .env to: ${data.rpcs[0].url}`, 'yellow');
      log('   Restart server after updating', 'yellow');
      return true;
    } else {
      const error = await response.text();
      log(`❌ Tenderly failed: ${error}`, 'red');
      return false;
    }
  } catch (error: any) {
    log(`❌ Tenderly error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Check current balance
 */
async function checkBalance(): Promise<bigint> {
  const balance = await publicClient.getBalance({
    address: REWARD_WALLET_ADDRESS,
  });
  return balance;
}

/**
 * Main execution
 */
async function main() {
  log('\n========================================', 'cyan');
  log('  AUTOMATED WALLET FUNDING', 'cyan');
  log('========================================\n', 'cyan');

  log(`Reward Wallet: ${REWARD_WALLET_ADDRESS}`, 'blue');
  log(`Network: Base Sepolia`, 'blue');
  log(`RPC: ${RPC_URL}`, 'blue');

  // Check current balance
  log('\n📊 Checking current balance...', 'cyan');
  const currentBalance = await checkBalance();
  log(`Current Balance: ${formatEther(currentBalance)} ETH`, 'blue');

  if (currentBalance >= MIN_BALANCE) {
    log('\n✅ Wallet already has sufficient funds!', 'green');
    log(`   Balance: ${formatEther(currentBalance)} ETH`, 'green');
    log(`   Minimum: ${formatEther(MIN_BALANCE)} ETH`, 'green');
    log('\n🎉 Ready to test blockchain integration!', 'green');
    log('   Run: npm run dev', 'green');
    log('   Run: ./test-blockchain-connection.sh', 'green');
    process.exit(0);
  }

  log('\n⚠️  Insufficient balance. Attempting automated funding...', 'yellow');
  log(`   Current: ${formatEther(currentBalance)} ETH`, 'yellow');
  log(`   Needed: ${formatEther(MIN_BALANCE)} ETH`, 'yellow');

  // Try different funding methods
  const methods = [
    { name: 'Deployer Transfer', fn: tryDeployerTransfer },
    { name: 'Alchemy API', fn: tryAlchemyFaucet },
    { name: 'Tenderly Virtual TestNet', fn: tryTenderlyVirtualTestnet },
  ];

  for (const method of methods) {
    const success = await method.fn();
    if (success) {
      log('\n⏳ Waiting for funds to arrive...', 'yellow');

      // Wait and check balance
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const newBalance = await checkBalance();
      log(`\n📊 New Balance: ${formatEther(newBalance)} ETH`, 'blue');

      if (newBalance >= MIN_BALANCE) {
        log('\n✅ SUCCESS! Wallet funded successfully!', 'green');
        log(`   Method: ${method.name}`, 'green');
        log(`   Balance: ${formatEther(newBalance)} ETH`, 'green');
        log('\n🎉 Ready to test blockchain integration!', 'green');
        log('   Run: npm run dev', 'green');
        log('   Run: ./test-blockchain-connection.sh', 'green');
        process.exit(0);
      }
    }
  }

  // All automated methods failed
  log('\n❌ All automated funding methods failed', 'red');
  log('\n📋 MANUAL FUNDING REQUIRED', 'yellow');
  log('========================================\n', 'yellow');

  log('Option 1: Alchemy Faucet (Recommended)', 'cyan');
  log('  1. Visit: https://www.alchemy.com/faucets/base-sepolia', 'blue');
  log(`  2. Enter: ${REWARD_WALLET_ADDRESS}`, 'blue');
  log('  3. Request 0.1 ETH', 'blue');
  log('  See: EASY_FUNDING_FIX.md for details\n', 'blue');

  log('Option 2: Add API Keys for Automated Funding', 'cyan');
  log('  Add to .env file:', 'blue');
  log('    ALCHEMY_API_KEY=your-key-here', 'blue');
  log('    # Get from: https://www.alchemy.com/', 'blue');
  log('  Then run this script again\n', 'blue');

  log('Option 3: Fund Deployer Wallet First', 'cyan');
  log('  1. Get deployer address:', 'blue');
  log('     node get-wallet-address.js', 'blue');
  log('  2. Fund deployer wallet with 0.1 ETH', 'blue');
  log('  3. Run this script again\n', 'blue');

  log('========================================\n', 'yellow');
  process.exit(1);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

export { main as fundWallet, checkBalance };
