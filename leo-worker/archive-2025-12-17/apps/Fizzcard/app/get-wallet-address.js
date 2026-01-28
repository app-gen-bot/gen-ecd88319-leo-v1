#!/usr/bin/env node
/**
 * Extract wallet address from private key
 *
 * Usage: node get-wallet-address.js
 */

import { privateKeyToAccount } from 'viem/accounts';

const PRIVATE_KEY = '0x8ac116179511e004cab201cf70efba6832daef961b235ba4ec73ea2077efd35c';

const account = privateKeyToAccount(PRIVATE_KEY);

console.log('\n========================================');
console.log('  REWARD WALLET ADDRESS');
console.log('========================================\n');
console.log('Address:', account.address);
console.log('\n========================================\n');
