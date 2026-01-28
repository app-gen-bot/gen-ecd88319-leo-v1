#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('Checking Vercel environment variables...\n');

try {
  // List all environment variables
  const envList = execSync('vercel env ls', { encoding: 'utf-8' });
  console.log('Current environment variables:');
  console.log(envList);
  
  // Check if Clerk variables are present
  const clerkVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
    'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL',
    'NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL',
    'NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL'
  ];
  
  console.log('\nChecking Clerk-specific variables:');
  clerkVars.forEach(varName => {
    if (envList.includes(varName)) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is NOT set`);
    }
  });
  
} catch (error) {
  console.error('Error checking environment variables:', error.message);
}