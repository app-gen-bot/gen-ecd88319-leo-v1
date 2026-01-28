#!/usr/bin/env node
/**
 * Verify reward wallet balance on Base Sepolia
 *
 * Usage: node verify-wallet-balance.js
 */

import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const REWARD_WALLET = '0x9c679c53e7a4D97079357E4aDd4ABa9300Cb68d9';
const RPC_URL = 'https://sepolia.base.org';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

async function checkBalance() {
  try {
    console.log('\n========================================');
    console.log('  REWARD WALLET BALANCE CHECK');
    console.log('========================================\n');
    console.log('Network:  Base Sepolia (Testnet)');
    console.log('Wallet:   ', REWARD_WALLET);
    console.log('Explorer: https://sepolia.basescan.org/address/' + REWARD_WALLET);
    console.log('\nChecking balance...\n');

    const balance = await publicClient.getBalance({
      address: REWARD_WALLET,
    });

    const ethBalance = formatEther(balance);
    const balanceNum = parseFloat(ethBalance);

    console.log('Balance:  ', ethBalance, 'ETH');
    console.log('Wei:      ', balance.toString());

    console.log('\n========================================');
    console.log('  STATUS');
    console.log('========================================\n');

    if (balanceNum === 0) {
      console.log('❌ WALLET NOT FUNDED');
      console.log('\nThe wallet has no ETH. Follow these steps:');
      console.log('1. Visit: https://faucet.quicknode.com/base/sepolia');
      console.log('2. Enter address:', REWARD_WALLET);
      console.log('3. Request 0.05 ETH');
      console.log('\nOr see WALLET_FUNDING_GUIDE.md for detailed instructions.');
      process.exit(1);
    } else if (balanceNum < 0.01) {
      console.log('⚠️  LOW BALANCE');
      console.log('\nWallet is funded but balance is low.');
      console.log('Current:', ethBalance, 'ETH');
      console.log('Recommended: 0.05 ETH or more');
      console.log('\nYou can test with current balance, but consider adding more ETH.');
    } else {
      console.log('✅ WALLET FUNDED');
      console.log('\nBalance is sufficient for testing!');
      console.log('Estimated transactions:', Math.floor(balanceNum / 0.0001));
      console.log('\nReady to test blockchain integration:');
      console.log('  npm run dev');
      console.log('  ./test-blockchain-connection.sh');
    }

    console.log('\n========================================\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nPossible issues:');
    console.error('- RPC endpoint not responding');
    console.error('- Network connectivity problem');
    console.error('- Invalid wallet address');
    process.exit(1);
  }
}

checkBalance();
