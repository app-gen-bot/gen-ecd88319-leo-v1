#!/usr/bin/env node
/**
 * Simple Automated Wallet Funding
 *
 * Transfers ETH from deployer wallet to reward wallet if deployer has funds
 * No external APIs or signups required!
 */

import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';

dotenv.config();

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const RPC_URL = 'https://sepolia.base.org';

async function main() {
  console.log('\n🔄 Automated Wallet Funding\n');

  // Setup clients
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  // Check reward wallet balance
  console.log('📊 Checking reward wallet balance...');
  const rewardBalance = await publicClient.getBalance({ address: REWARD_WALLET });
  console.log(`Reward Wallet: ${formatEther(rewardBalance)} ETH\n`);

  if (rewardBalance >= parseEther('0.01')) {
    console.log('✅ Wallet already has sufficient funds!');
    console.log('Ready to test:\n');
    console.log('  npm run dev');
    console.log('  ./test-blockchain-connection.sh\n');
    return;
  }

  // Check deployer wallet
  const deployerKey = process.env.REWARD_WALLET_PRIVATE_KEY;
  if (!deployerKey) {
    console.log('❌ REWARD_WALLET_PRIVATE_KEY not found in .env');
    console.log('\nManual funding required:');
    console.log('See: EASY_FUNDING_FIX.md\n');
    return;
  }

  const deployerAccount = privateKeyToAccount(deployerKey);
  const deployerBalance = await publicClient.getBalance({ address: deployerAccount.address });

  console.log('💰 Deployer wallet:');
  console.log(`  Address: ${deployerAccount.address}`);
  console.log(`  Balance: ${formatEther(deployerBalance)} ETH\n`);

  // Check if we can self-fund (deployer and reward are same)
  if (deployerAccount.address.toLowerCase() === REWARD_WALLET.toLowerCase()) {
    if (deployerBalance >= parseEther('0.01')) {
      console.log('✅ Reward wallet IS the deployer wallet and already has funds!');
      console.log('Ready to test!\n');
      return;
    } else {
      console.log('⚠️  Reward wallet = Deployer wallet but needs more ETH');
      console.log(`Current: ${formatEther(deployerBalance)} ETH`);
      console.log('Needed: 0.01 ETH\n');
      console.log('Fund this address:');
      console.log(`  ${REWARD_WALLET}\n`);
      console.log('See: EASY_FUNDING_FIX.md\n');
      return;
    }
  }

  // Different wallets - try to transfer
  if (deployerBalance < parseEther('0.06')) {
    console.log('⚠️  Deployer wallet has insufficient funds for transfer');
    console.log(`Need: 0.06 ETH (0.05 to send + 0.01 for gas)`);
    console.log(`Have: ${formatEther(deployerBalance)} ETH\n`);
    console.log('Options:');
    console.log('1. Fund deployer wallet first, then run this script again');
    console.log('2. Or fund reward wallet directly\n');
    console.log('See: EASY_FUNDING_FIX.md\n');
    return;
  }

  // Transfer funds
  console.log('💸 Transferring 0.05 ETH from deployer to reward wallet...\n');

  const walletClient = createWalletClient({
    account: deployerAccount,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });

  try {
    const hash = await walletClient.sendTransaction({
      to: REWARD_WALLET,
      value: parseEther('0.05'),
    });

    console.log('✅ Transaction sent!');
    console.log(`TX: ${hash}`);
    console.log(`View: https://sepolia.basescan.org/tx/${hash}\n`);

    console.log('⏳ Waiting for confirmation...\n');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === 'success') {
      console.log('✅ Transfer successful!\n');

      const newBalance = await publicClient.getBalance({ address: REWARD_WALLET });
      console.log(`New Balance: ${formatEther(newBalance)} ETH\n`);

      console.log('🎉 Ready to test blockchain integration!');
      console.log('  npm run dev');
      console.log('  ./test-blockchain-connection.sh\n');
    } else {
      console.log('❌ Transaction failed\n');
    }
  } catch (error) {
    console.log(`❌ Transfer error: ${error.message}\n`);
    console.log('Manual funding required:');
    console.log('See: EASY_FUNDING_FIX.md\n');
  }
}

main().catch(console.error);
