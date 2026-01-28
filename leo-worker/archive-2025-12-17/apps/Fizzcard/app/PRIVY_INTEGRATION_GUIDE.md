# Research Report: Privy Embedded Wallet Integration for FizzCard

## Executive Summary
Privy provides a production-ready embedded wallet solution for Base and Base Sepolia networks with React 18 support. The integration requires @privy-io/react-auth (v3.0.1) and @privy-io/wagmi for wallet management, with automatic wallet creation on signup and secure key management through Shamir's Secret Sharing.

## Core Technologies Required
- **@privy-io/react-auth**: 3.0.1 - Core SDK for authentication and wallet creation
- **@privy-io/wagmi**: 1.0.6 - Wagmi v2 bindings for Privy wallets
- **viem**: latest - Ethereum interface library with Base chain definitions
- **wagmi**: 2.x - React hooks for Ethereum interactions
- **@tanstack/react-query**: latest - Required dependency for wagmi v2

## Architecture Recommendations

### Backend
- **Wallet Address Storage**: Store wallet addresses in PostgreSQL users table
- **Network Detection**: Use environment variables to switch between Base mainnet/testnet
- **API Pattern**: Create `/api/users/wallet` endpoint for wallet address updates
```typescript
// src/server/routes/users.ts
router.post('/users/:userId/wallet', async (req, res) => {
  const { walletAddress } = req.body;
  await db.update(users)
    .set({ walletAddress, walletCreatedAt: new Date() })
    .where(eq(users.id, req.params.userId));
});
```

### Frontend
- **Provider Wrapper**: Create PrivyProviderWrapper component at app root
- **Automatic Creation**: Configure embedded wallets with `createOnLogin: 'users-without-wallets'`
- **Network Switching**: Implement environment-based network selection
- **Hook Pattern**: Use usePrivy() and useWallets() for wallet interactions

### Data Storage
- **Schema Update**: Add wallet fields to users table
```sql
ALTER TABLE users ADD COLUMN wallet_address VARCHAR(42);
ALTER TABLE users ADD COLUMN wallet_created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN wallet_network VARCHAR(20) DEFAULT 'base-sepolia';
```

## Implementation Challenges

1. **Challenge**: Network switching between development (Base Sepolia) and production (Base mainnet)
   **Solution**: Use environment variables and conditional chain configuration
   ```typescript
   const defaultChain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
   ```

2. **Challenge**: Synchronizing wallet creation with database storage
   **Solution**: Use useCreateWallet hook with success callback
   ```typescript
   const {createWallet} = useCreateWallet({
     onSuccess: async ({wallet}) => {
       await updateUserWallet(wallet.address);
     }
   });
   ```

3. **Challenge**: Handling wallet initialization during SSR
   **Solution**: Use ready state indicator before accessing wallet
   ```typescript
   const { ready } = usePrivy();
   if (!ready) return <LoadingSpinner />;
   ```

## Code Patterns

### 1. Package Installation
```bash
npm install @privy-io/react-auth@3.0.1 @privy-io/wagmi@1.0.6 wagmi viem @tanstack/react-query
```

### 2. PrivyProvider Configuration
```typescript
// src/client/providers/PrivyProviderWrapper.tsx
'use client';
import { PrivyProvider } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig } from '@privy-io/wagmi';

const queryClient = new QueryClient();

// Determine network based on environment
const defaultChain = process.env.NODE_ENV === 'production' ? base : baseSepolia;
const supportedChains = process.env.NODE_ENV === 'production'
  ? [base]
  : [baseSepolia, base];

export default function PrivyProviderWrapper({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <PrivyProvider
      appId={process.env.VITE_PRIVY_APP_ID || "cmh5cmdf800b6l50cstq0lgz3"}
      config={{
        loginMethods: ['email', 'wallet'],
        defaultChain: defaultChain,
        supportedChains: supportedChains,
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          noPromptOnSignature: false,
          // Require confirmation for first transaction
          requireUserPasswordOnCreate: false
        },
        appearance: {
          theme: 'light',
          accentColor: '#6366F1',
          logo: 'https://fizzcard.app/logo.png'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
```

### 3. Wallet Creation Flow
```typescript
// src/client/components/WalletManager.tsx
import { usePrivy, useWallets, useCreateWallet } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function WalletManager({ userId }: { userId: string }) {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Find embedded wallet
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy'
  );

  // Mutation to save wallet address to database
  const saveWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch(`/api/users/${userId}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      if (!response.ok) throw new Error('Failed to save wallet');
      return response.json();
    }
  });

  // Create wallet if user doesn't have one
  const { createWallet } = useCreateWallet({
    onSuccess: async ({ wallet }) => {
      console.log('Created wallet:', wallet.address);
      setWalletAddress(wallet.address);
      await saveWalletMutation.mutateAsync(wallet.address);
    },
    onError: (error) => {
      console.error('Failed to create wallet:', error);
    }
  });

  useEffect(() => {
    if (ready && authenticated && embeddedWallet) {
      setWalletAddress(embeddedWallet.address);
      // Save to database if not already saved
      if (!user?.wallet?.address) {
        saveWalletMutation.mutate(embeddedWallet.address);
      }
    } else if (ready && authenticated && !embeddedWallet) {
      // Create wallet if user doesn't have one
      createWallet();
    }
  }, [ready, authenticated, embeddedWallet]);

  if (!ready) return <div>Loading wallet...</div>;
  if (!authenticated) return <div>Please log in</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Your Wallet</h3>
      {walletAddress ? (
        <div>
          <p className="text-sm text-gray-600">Address:</p>
          <p className="font-mono text-xs">{walletAddress}</p>
        </div>
      ) : (
        <p>Creating wallet...</p>
      )}
    </div>
  );
}
```

### 4. Network Switching Logic
```typescript
// src/client/hooks/useNetworkSwitch.ts
import { useWallets } from '@privy-io/react-auth';
import { base, baseSepolia } from 'viem/chains';

export function useNetworkSwitch() {
  const { wallets } = useWallets();

  const switchToProduction = async () => {
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
    if (embeddedWallet) {
      await embeddedWallet.switchChain(base.id); // 8453
    }
  };

  const switchToTestnet = async () => {
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
    if (embeddedWallet) {
      await embeddedWallet.switchChain(baseSepolia.id); // 84532
    }
  };

  return { switchToProduction, switchToTestnet };
}
```

### 5. Transaction Signing Example
```typescript
// src/client/hooks/useTransaction.ts
import { useWallets } from '@privy-io/react-auth';
import { parseEther } from 'viem';

export function useTransaction() {
  const { wallets } = useWallets();

  const sendTransaction = async (to: string, amount: string) => {
    const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
    if (!embeddedWallet) throw new Error('No wallet found');

    // Get provider
    const provider = await embeddedWallet.getEthereumProvider();

    // Send transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [{
        from: embeddedWallet.address,
        to: to,
        value: parseEther(amount).toString(),
        gas: '0x76c0', // 30400
      }],
    });

    return txHash;
  };

  return { sendTransaction };
}
```

## External APIs/Services

- **Privy Dashboard**: https://dashboard.privy.io - Configure app settings
- **Base Documentation**: https://docs.base.org - Network specifications
- **Base Sepolia Faucet**: https://www.alchemy.com/faucets/base-sepolia - Test ETH
- **Basescan**: https://basescan.org (mainnet) / https://sepolia.basescan.org (testnet)
- **Viem Chains**: https://viem.sh/docs/chains - Chain configurations

## Network Configuration Details

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Currency**: ETH
- **Block Explorer**: https://basescan.org

### Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Currency**: Sepolia ETH
- **Block Explorer**: https://sepolia.basescan.org

## Timeline Estimate
- **Stage 1 (Plan)**: Complexity rating 2/5 - Configuration and setup (2 hours)
- **Stage 2 (Build)**: Complexity rating 3/5 - Integration and testing (4-6 hours)

## Risk Assessment

### High Risk
- **Wallet Recovery**: Users losing access without proper recovery setup
- **Network Mismatch**: Transactions on wrong network (mainnet vs testnet)
- **Key Management**: Ensure proper encryption and never expose private keys

### Medium Risk
- **Rate Limiting**: Default RPC providers may hit limits at scale
- **User Education**: Users unfamiliar with wallet concepts
- **Transaction Errors**: Failed transactions due to insufficient gas

## Integration Checklist

### Setup Phase
- [ ] Install npm packages: `@privy-io/react-auth`, `@privy-io/wagmi`, `wagmi`, `viem`, `@tanstack/react-query`
- [ ] Verify Privy App ID in `.env`: `VITE_PRIVY_APP_ID=cmh5cmdf800b6l50cstq0lgz3`
- [ ] Update database schema with wallet fields
- [ ] Create API endpoint for wallet address storage

### Implementation Phase
- [ ] Create PrivyProviderWrapper component
- [ ] Wrap app root with PrivyProvider
- [ ] Implement WalletManager component
- [ ] Add wallet creation on signup flow
- [ ] Test wallet creation with new user
- [ ] Implement network switching logic

### Testing Phase
- [ ] Test on Base Sepolia testnet first
- [ ] Verify wallet addresses stored in database
- [ ] Test transaction signing
- [ ] Test wallet recovery flow
- [ ] Verify error handling

### Production Phase
- [ ] Configure production RPC providers (Alchemy/Infura)
- [ ] Set up monitoring for API rate limits
- [ ] Enable Base mainnet in configuration
- [ ] Implement user wallet recovery options
- [ ] Add transaction confirmation UI

## Security Best Practices

1. **Never Store Private Keys**: Privy handles all key management
2. **Validate Addresses**: Always validate Ethereum addresses server-side
3. **Environment Variables**: Keep Privy App ID in environment variables
4. **HTTPS Only**: Ensure all API calls use HTTPS
5. **Transaction Confirmation**: Always show transaction details before signing
6. **Recovery Methods**: Encourage users to set up recovery (password or cloud backup)

## Testing Configuration

### Development Testing
```typescript
// Use test App ID for initial development
const TEST_APP_ID = 'clpispdty00ycl80fpueukbhl'; // Privy's public test ID
```

### Mock Wallet for Tests
```typescript
// src/client/test/mockPrivy.ts
export const mockPrivyContext = {
  ready: true,
  authenticated: true,
  user: { email: 'test@example.com' },
  login: jest.fn(),
  logout: jest.fn(),
};

export const mockWallet = {
  address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
  walletClientType: 'privy',
  switchChain: jest.fn(),
  getEthereumProvider: jest.fn(),
};
```

## Common Issues & Solutions

1. **Issue**: "PrivyProvider not found" error
   **Solution**: Ensure component is wrapped in PrivyProvider

2. **Issue**: Wallet not created on signup
   **Solution**: Check `embeddedWallets.createOnLogin` configuration

3. **Issue**: Network switching fails
   **Solution**: Verify chain is in `supportedChains` array

4. **Issue**: Rate limit errors (429)
   **Solution**: Configure custom RPC providers for production

5. **Issue**: Wallet address not saved
   **Solution**: Implement retry logic in database save operation

## Performance Considerations

- **Lazy Load Privy**: Only load Privy SDK when user needs wallet features
- **Cache Wallet Data**: Store wallet address locally to reduce API calls
- **Batch Transactions**: Group multiple operations when possible
- **Optimize RPC Calls**: Use custom providers with higher rate limits
- **Minimize Re-renders**: Use React.memo for wallet components

## Estimated Implementation Time

**Total: 6-8 hours**
- Initial setup and configuration: 1 hour
- Provider wrapper implementation: 1 hour
- Wallet creation flow: 2 hours
- Database integration: 1 hour
- Network switching: 1 hour
- Testing and debugging: 1-2 hours
- Production configuration: 1 hour

This implementation guide provides a complete roadmap for integrating Privy embedded wallets into FizzCard with Base network support, aligned with the existing tech stack and Phase 2 blockchain requirements.