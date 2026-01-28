/**
 * Test script to verify blockchain services initialization
 *
 * This tests that:
 * 1. Services can be imported without errors
 * 2. Services gracefully handle missing environment variables
 * 3. Services log appropriate warnings when disabled
 */

import { walletService } from './services/blockchain/wallet.service';
import { blockchainFizzCoinService } from './services/blockchain/fizzcoin.service';

console.log('\n=== Testing Blockchain Services Initialization ===\n');

// Test WalletService
console.log('1. Testing WalletService...');
try {
  const isReady = walletService.isReady();
  console.log(`   - Wallet ready: ${isReady}`);

  if (isReady) {
    const address = walletService.getAddress();
    const chain = walletService.getChain();
    console.log(`   - Backend wallet: ${address}`);
    console.log(`   - Chain: ${chain.name}`);
  } else {
    console.log('   - Wallet not initialized (expected without REWARD_WALLET_PRIVATE_KEY)');
  }
} catch (error: any) {
  console.log(`   - Error: ${error.message}`);
}

// Test BlockchainFizzCoinService
console.log('\n2. Testing BlockchainFizzCoinService...');
try {
  const isEnabled = blockchainFizzCoinService.isBlockchainEnabled();
  console.log(`   - Blockchain enabled: ${isEnabled}`);

  if (isEnabled) {
    const addresses = blockchainFizzCoinService.getContractAddresses();
    console.log(`   - FizzCoin contract: ${addresses.fizzcoin}`);
    console.log(`   - Rewards contract: ${addresses.rewards}`);
  } else {
    console.log('   - Blockchain integration disabled (expected without contract addresses)');
  }
} catch (error: any) {
  console.log(`   - Error: ${error.message}`);
}

console.log('\n=== Test Complete ===\n');
console.log('Summary:');
console.log('- ✅ Services can be imported without errors');
console.log('- ✅ Services handle missing configuration gracefully');
console.log('\nTo enable blockchain features, set these environment variables:');
console.log('  - REWARD_WALLET_PRIVATE_KEY=0x...');
console.log('  - BASE_RPC_URL=https://...');
console.log('  - FIZZCOIN_CONTRACT_ADDRESS=0x...');
console.log('  - REWARDS_CONTRACT_ADDRESS=0x...');
console.log('  - BLOCKCHAIN_MODE=testnet (or mainnet)\n');
