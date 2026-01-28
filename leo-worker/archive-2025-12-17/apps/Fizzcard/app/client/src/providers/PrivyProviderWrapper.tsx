/**
 * Privy Provider Wrapper
 *
 * Wraps the app with Privy authentication and wallet management.
 * Gracefully degrades if Privy is not configured.
 */

import { ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';

interface PrivyProviderWrapperProps {
  children: ReactNode;
}

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID;
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Privy Provider Wrapper
 *
 * If VITE_PRIVY_APP_ID is not set, this will render children without Privy.
 * This allows the app to work in development without blockchain features.
 */
export function PrivyProviderWrapper({ children }: PrivyProviderWrapperProps) {
  // If Privy is not configured, render children without wallet functionality
  if (!PRIVY_APP_ID) {
    console.warn(
      '[Privy] VITE_PRIVY_APP_ID not configured - wallet features disabled. ' +
      'Set VITE_PRIVY_APP_ID in .env to enable blockchain wallets.'
    );
    return <>{children}</>;
  }

  // Configure Privy for embedded wallets
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        // Appearance
        appearance: {
          theme: 'dark',
          accentColor: '#6366f1', // Indigo accent to match FizzCard
          logo: '/logo.svg',
        },
        // Wallet configuration
        embeddedWallets: {
          createOnLogin: 'users-without-wallets', // Auto-create for new users
          requireUserPasswordOnCreate: false, // Seamless experience
        },
        // Login methods
        loginMethods: ['email', 'wallet'], // Email for new users, wallet for crypto-native
        // Default chain
        defaultChain: IS_PRODUCTION ? base : baseSepolia,
        // Supported chains
        supportedChains: IS_PRODUCTION ? [base] : [baseSepolia, base],
        // Legal consent
        legal: {
          termsAndConditionsUrl: '/terms',
          privacyPolicyUrl: '/privacy',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
