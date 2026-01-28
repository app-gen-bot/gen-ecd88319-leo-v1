import { AppLayout } from '@/components/layout/AppLayout';

/**
 * FizzCoin Whitepaper Page
 *
 * The soul of the FizzCoin protocol - explaining our mission,
 * technology, and vision for restoring authentic human connections
 * through blockchain-based incentives.
 */
export function WhitepaperPage() {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Cover Section */}
        <section className="relative py-24 px-8 text-center overflow-hidden rounded-2xl mb-12 bg-gradient-to-br from-bg-primary to-bg-secondary">
          {/* Network Visualization Background */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 1000 1000">
            <defs>
              <radialGradient id="nodeGrad">
                <stop offset="0%" style={{ stopColor: '#00D9FF', stopOpacity: 0.8 }} />
                <stop offset="100%" style={{ stopColor: '#B744FF', stopOpacity: 0.3 }} />
              </radialGradient>
            </defs>
            <circle cx="500" cy="500" r="120" fill="url(#nodeGrad)" opacity="0.6"/>
            <circle cx="300" cy="400" r="80" fill="url(#nodeGrad)" opacity="0.5"/>
            <circle cx="700" cy="400" r="80" fill="url(#nodeGrad)" opacity="0.5"/>
            <circle cx="400" cy="600" r="60" fill="url(#nodeGrad)" opacity="0.4"/>
            <circle cx="600" cy="600" r="60" fill="url(#nodeGrad)" opacity="0.4"/>
            <line x1="500" y1="500" x2="300" y2="400" stroke="#00D9FF" strokeWidth="2" opacity="0.3"/>
            <line x1="500" y1="500" x2="700" y2="400" stroke="#00D9FF" strokeWidth="2" opacity="0.3"/>
            <line x1="500" y1="500" x2="400" y2="600" stroke="#00D9FF" strokeWidth="2" opacity="0.3"/>
            <line x1="500" y1="500" x2="600" y2="600" stroke="#00D9FF" strokeWidth="2" opacity="0.3"/>
          </svg>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold mb-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6L8 0Z"/>
              </svg>
              <span>Share Contacts, Earn Crypto</span>
            </div>

            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FizzCoin
            </h1>

            <p className="text-xl text-text-secondary mb-4 max-w-3xl mx-auto">
              A Blockchain Protocol for Incentivizing Authentic Human Connections
            </p>

            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Building Social Capital Through Cryptographic Rewards on Base L2
            </p>

            <p className="text-sm text-primary font-mono mt-12">Version 1.0 • January 2025</p>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-primary border-b-2 border-primary pb-4">
            Executive Summary
          </h2>

          <p className="text-text-secondary mb-6">
            Imagine walking into a conference with 500 professionals. Three days of networking. Countless business cards exchanged. Six months later, you struggle to remember a single meaningful conversation. This scenario plays out millions of times each year across industries, cultures, and continents.
          </p>

          <p className="text-text-secondary mb-6">
            Despite living in the most technologically connected era in human history, we face an unprecedented crisis of authentic human connection. Studies show that <strong className="text-text-primary">73% of adults report feeling lonely</strong>, and professional networking has become a superficial transaction focused on quantity over quality. The average person maintains 150 social connections but considers only 5 to be close friends.
          </p>

          <div className="bg-bg-secondary border-l-4 border-accent p-8 rounded-xl my-10">
            <h3 className="text-2xl font-bold text-accent mb-4">The FizzCoin Solution</h3>
            <p className="text-text-secondary">
              <strong className="text-text-primary">FizzCoin</strong> is a blockchain-based protocol that creates economic incentives for genuine human connections. By rewarding users with cryptographic tokens for verified, meaningful interactions, we align economic value with social value—transforming networking from a transactional obligation into a mutually beneficial experience.
            </p>
          </div>

          <h3 className="text-3xl font-bold mb-6 mt-12">How It Works</h3>
          <p className="text-text-secondary mb-4">Built on Base L2, FizzCoin enables users to:</p>
          <ul className="space-y-3 text-text-secondary ml-8">
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span><strong className="text-text-primary">Earn Rewards</strong> for real-world connections verified through QR code exchanges</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span><strong className="text-text-primary">Receive Bonuses</strong> for successful introductions between contacts</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span><strong className="text-text-primary">Build Social Capital</strong> that translates into measurable economic value</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span><strong className="text-text-primary">Access Exclusive Events</strong> and opportunities based on connection quality</span>
            </li>
          </ul>

          <h3 className="text-3xl font-bold mb-6 mt-12">Technical Foundation</h3>
          <p className="text-text-secondary mb-4">
            FizzCoin leverages cutting-edge blockchain technology to create a seamless user experience.
            <strong className="text-text-primary"> Our infrastructure is live and operational on Base Sepolia testnet:</strong>
          </p>
          <ul className="space-y-3 text-text-secondary ml-8">
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>
                <strong className="text-text-primary">Base L2 Architecture</strong>:
                Fast, cheap transactions (&lt;$0.01 per reward) -
                <a href="https://sepolia.basescan.org/address/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7"
                   className="text-primary underline hover:text-accent ml-1"
                   target="_blank"
                   rel="noopener noreferrer">
                  View Live Contract
                </a>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>
                <strong className="text-text-primary">Gasless Transactions</strong>:
                Users pay zero fees through Paymaster sponsorship -
                <span className="text-green-500 ml-1">Currently Active</span>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>
                <strong className="text-text-primary">Embedded Wallets</strong>:
                Automatic wallet creation via Privy for non-crypto users -
                <span className="text-green-500 ml-1">Fully Integrated</span>
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>
                <strong className="text-text-primary">ERC-20 Standard</strong>:
                Full interoperability with existing crypto infrastructure -
                <span className="text-green-500 ml-1">100M FIZZ Deployed</span>
              </span>
            </li>
          </ul>
        </section>

        {/* Live Blockchain Status Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/30 p-8">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-green-500">LIVE ON BASE SEPOLIA</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 text-primary">
              🔗 Blockchain Implementation Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-accent mb-3">Smart Contracts Deployed</h3>
                <p className="text-text-secondary mb-4">
                  FizzCoin is not just a whitepaper concept—it's a <strong className="text-text-primary">fully deployed and operational blockchain protocol</strong> on Base Sepolia testnet.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-text-secondary">100M FIZZ tokens minted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-text-secondary">50M FIZZ in rewards pool</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-text-secondary">Smart contracts verified on BaseScan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    <span className="text-text-secondary">Reward distribution system active</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-accent mb-3">Verify On-Chain</h3>
                <p className="text-text-secondary mb-4">
                  All contracts are <strong className="text-text-primary">publicly verifiable</strong> on the blockchain. View the source code and transactions:
                </p>
                <div className="space-y-3">
                  <a
                    href="https://sepolia.basescan.org/token/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
                  >
                    <span>→</span>
                    <span className="underline">FizzCoin Token Contract</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <a
                    href="https://sepolia.basescan.org/address/0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
                  >
                    <span>→</span>
                    <span className="underline">Rewards Manager Contract</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-bg-secondary/50 rounded-xl border border-border">
              <p className="text-sm text-text-secondary text-center">
                <strong className="text-primary">Contract Addresses:</strong> FizzCoin:
                <code className="mx-2 px-2 py-1 bg-bg-primary rounded text-xs font-mono">0x8C6E...4Ca7</code>
                | Rewards:
                <code className="mx-2 px-2 py-1 bg-bg-primary rounded text-xs font-mono">0x9c83...21a</code>
              </p>
            </div>
          </div>
        </section>

        {/* The Connection Crisis */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-primary border-b-2 border-primary pb-4">
            The Connection Crisis
          </h2>

          <blockquote className="text-2xl italic text-primary border-l-4 border-primary pl-8 my-10">
            "I have 837 LinkedIn connections, 1,200 Facebook friends, and 450 people in my phone. Yet when I needed help last month, I couldn't think of anyone to call."
          </blockquote>

          <p className="text-text-secondary mb-6">
            This sentiment resonates across demographics and industries. Modern networking has optimized for breadth at the expense of depth, creating vast networks of superficial connections that provide minimal social or economic value.
          </p>

          <h3 className="text-3xl font-bold mb-8 mt-12">The Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-2xl p-10 text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                73%
              </div>
              <div className="text-lg text-text-secondary">of adults report feeling lonely</div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-2xl p-10 text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                14%
              </div>
              <div className="text-lg text-text-secondary">networking follow-through rate</div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-border rounded-2xl p-10 text-center">
              <div className="text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                5
              </div>
              <div className="text-lg text-text-secondary">average number of close friends</div>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-6 mt-12">Root Causes</h3>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">1. Misaligned Incentives</h4>
          <p className="text-text-secondary mb-6">
            Traditional networking rewards <em>quantity</em> over quality. More business cards collected, more LinkedIn connections added, more events attended—these metrics drive behavior despite having minimal correlation with meaningful outcomes.
          </p>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">2. Unmeasured Value</h4>
          <p className="text-text-secondary mb-6">
            The value of authentic relationships remains invisible to existing systems. A thoughtful introduction that leads to a successful partnership generates enormous value, yet the introducer receives no tangible reward.
          </p>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">3. High Friction</h4>
          <p className="text-text-secondary mb-6">
            Building relationships requires time, energy, and emotional investment with uncertain returns. Without clear incentives, people default to superficial interactions that require less effort.
          </p>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">4. Platform Extraction</h4>
          <p className="text-text-secondary mb-6">
            Social media platforms monetize your connections for their profit while providing you with "likes" and "engagement" that have no economic value. The value you create flows to the platform, not to you.
          </p>
        </section>

        {/* The FizzCoin Solution Details */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-primary border-b-2 border-primary pb-4">
            The FizzCoin Solution
          </h2>

          <h3 className="text-3xl font-bold mb-6">Core Concept</h3>
          <p className="text-text-secondary mb-6">
            FizzCoin creates a cryptographic reward system for authentic human connections. When two people meet and choose to connect, they both earn FizzCoin tokens through a blockchain-verified exchange. These tokens have real economic value and can be used within the ecosystem for exclusive opportunities, event access, and future platform features.
          </p>

          <h3 className="text-3xl font-bold mb-6 mt-12">How It Works</h3>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">Level 1: The Simple Explanation</h4>
          <p className="text-text-secondary mb-6">
            Think of FizzCoin like a loyalty program for human connections. When you meet someone new and exchange contact information, you both earn reward tokens automatically.
          </p>

          <h4 className="text-xl font-semibold text-accent mb-4 mt-8">Level 2: The Mechanism</h4>
          <p className="text-text-secondary mb-6">
            Users create digital business cards (FizzCards) with their contact information and professional details. When meeting someone, both parties scan each other's QR codes. This triggers a smart contract that verifies the mutual exchange and distributes FizzCoin tokens to both participants.
          </p>

          {/* Connection Flow Diagram */}
          <div className="bg-bg-secondary border border-border rounded-xl p-10 my-10">
            <h4 className="text-xl font-semibold text-primary text-center mb-8">Connection Flow</h4>
            <div className="flex justify-around items-center flex-wrap gap-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4"></div>
                <div className="text-text-secondary text-sm">User A<br/>Scans QR</div>
              </div>
              <div className="text-primary text-3xl">→</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-lg bg-bg-secondary border-2 border-primary flex items-center justify-center mx-auto mb-4">
                  <span className="font-mono text-xs text-center">Smart<br/>Contract</span>
                </div>
                <div className="text-text-secondary text-sm">Verifies<br/>Exchange</div>
              </div>
              <div className="text-primary text-3xl">→</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary mx-auto mb-4"></div>
                <div className="text-text-secondary text-sm">User B<br/>Receives</div>
              </div>
              <div className="text-primary text-3xl">→</div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary flex items-center justify-center mx-auto mb-4 text-4xl">
                  🪙
                </div>
                <div className="text-text-secondary text-sm">Both Earn<br/>+25 FIZZ</div>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-6 mt-12">Reward Mechanisms</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse my-8">
              <thead>
                <tr className="bg-bg-secondary border-b-2 border-primary">
                  <th className="p-4 text-left font-semibold text-primary">Action</th>
                  <th className="p-4 text-left font-semibold text-primary">Reward</th>
                  <th className="p-4 text-left font-semibold text-primary">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 text-text-primary font-semibold">Connection Exchange</td>
                  <td className="p-4 text-fizzCoin font-bold">25 FIZZ</td>
                  <td className="p-4 text-text-secondary">Both parties earn when QR codes are mutually exchanged</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-text-primary font-semibold">Successful Introduction</td>
                  <td className="p-4 text-fizzCoin font-bold">50 FIZZ</td>
                  <td className="p-4 text-text-secondary">Introducer earns when two contacts connect through them</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-text-primary font-semibold">Referral Signup</td>
                  <td className="p-4 text-fizzCoin font-bold">100 FIZZ</td>
                  <td className="p-4 text-text-secondary">Earned when someone joins through your referral</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-text-primary font-semibold">Event Check-in</td>
                  <td className="p-4 text-fizzCoin font-bold">20 FIZZ</td>
                  <td className="p-4 text-text-secondary">Participation reward for attending networking events</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-text-primary font-semibold">Super-Connector Bonus</td>
                  <td className="p-4 text-fizzCoin font-bold">2x Multiplier</td>
                  <td className="p-4 text-text-secondary">Top networkers earn double rewards on all actions</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Blockchain Contract Details */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-primary border-b-2 border-primary pb-4">
            Blockchain Contract Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h3 className="text-2xl font-bold text-primary mb-4">FizzCoin Token (FIZZ)</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Contract:</span>
                  <code className="text-xs bg-bg-primary px-2 py-1 rounded text-primary font-mono">0x8C6E...4Ca7</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Standard:</span>
                  <span className="text-text-primary font-semibold">ERC-20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Supply:</span>
                  <span className="text-fizzCoin font-bold">100,000,000 FIZZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Decimals:</span>
                  <span className="text-text-primary">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Network:</span>
                  <span className="text-text-primary">Base Sepolia</span>
                </div>
                <a
                  href="https://sepolia.basescan.org/token/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 border border-primary rounded-lg text-primary hover:bg-primary/20 transition-colors w-full justify-center"
                >
                  <span>View on BaseScan</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <h3 className="text-2xl font-bold text-primary mb-4">Rewards Manager</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Contract:</span>
                  <code className="text-xs bg-bg-primary px-2 py-1 rounded text-primary font-mono">0x9c83...21a</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pool Balance:</span>
                  <span className="text-fizzCoin font-bold">50,000,000 FIZZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Security:</span>
                  <span className="text-green-500 font-semibold">✓ Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Reentrancy:</span>
                  <span className="text-green-500 font-semibold">✓ Protected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Deployment:</span>
                  <span className="text-text-primary">Oct 25, 2025</span>
                </div>
                <a
                  href="https://sepolia.basescan.org/address/0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 border border-primary rounded-lg text-primary hover:bg-primary/20 transition-colors w-full justify-center"
                >
                  <span>View on BaseScan</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/30 rounded-xl p-6">
            <h4 className="text-xl font-bold text-primary mb-3">How to Verify Our Contracts</h4>
            <ol className="space-y-2 text-text-secondary">
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">1.</span>
                <span>Click any BaseScan link above to view the contract</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">2.</span>
                <span>Look for the green checkmark showing "Contract Source Code Verified"</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">3.</span>
                <span>Click "Contract" tab to view the actual smart contract code</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">4.</span>
                <span>Check "Read Contract" to query live blockchain data</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2 font-bold">5.</span>
                <span>View "Holders" to see the 50M FIZZ in the rewards pool</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-primary border-b-2 border-primary pb-4">
            Conclusion: Restoring Authentic Connection
          </h2>

          <blockquote className="text-2xl italic text-primary border-l-4 border-primary pl-8 my-10">
            "The quality of our relationships determines the quality of our lives."
          </blockquote>

          <p className="text-text-secondary mb-6">
            We stand at an inflection point in human history. Despite unprecedented technological connectivity, loneliness and social isolation have reached epidemic levels. Traditional networking has become a superficial transaction, social media monetizes our connections for platform profit, and the value of authentic human relationships remains unmeasured and unrewarded.
          </p>

          <p className="text-text-secondary mb-6">
            FizzCoin represents a fundamentally different approach—one that uses blockchain technology not to replace human connection, but to restore it. By creating economic incentives for genuine interactions, verifying relationships through cryptographic proof, and rewarding quality over quantity, we can begin to rebuild the social fabric that modern technology has frayed.
          </p>

          <h3 className="text-3xl font-bold mb-8 mt-12">What Makes FizzCoin Different</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="bg-bg-secondary border border-border rounded-xl p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Technology Serving Humanity</h4>
              <p className="text-text-secondary">
                Blockchain enables transparent, verifiable rewards for genuine human interactions—something impossible with traditional technology.
              </p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Shared Value Creation</h4>
              <p className="text-text-secondary">
                Unlike platforms that extract value from your connections, FizzCoin creates value for all participants.
              </p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Measurable Impact</h4>
              <p className="text-text-secondary">
                Social capital becomes quantifiable and tradeable, creating clear incentives for community building.
              </p>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-8">
              <h4 className="text-xl font-semibold text-primary mb-4">Zero-Friction Access</h4>
              <p className="text-text-secondary">
                Gasless transactions and embedded wallets mean anyone can participate without cryptocurrency knowledge.
              </p>
            </div>
          </div>

          <h3 className="text-3xl font-bold mb-6 mt-12">The Vision Forward</h3>
          <p className="text-text-secondary mb-4">Imagine a world where:</p>
          <ul className="space-y-3 text-text-secondary ml-8 mb-8">
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>Every genuine connection you make contributes to both your social and economic wealth</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>Successful introductions are properly recognized and rewarded</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>Community builders have sustainable economic models for their work</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>Professional networking focuses on depth rather than breadth</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-3">•</span>
              <span>Cross-cultural exchanges are incentivized and celebrated</span>
            </li>
          </ul>

          <p className="text-text-secondary mb-8">
            This is the world FizzCoin is building—not through revolutionary claims or idealistic promises, but through thoughtful protocol design, proven technology, and alignment of economic incentives with human values.
          </p>

          <div className="bg-bg-secondary border-l-4 border-accent p-8 rounded-xl my-10">
            <h3 className="text-2xl font-bold text-accent mb-4">Contact & Resources</h3>
            <div className="space-y-2 text-text-secondary">
              <p><strong className="text-text-primary">Website:</strong> fizzcard.com</p>
              <p><strong className="text-text-primary">Live App:</strong> <a href="https://fizzcard.fly.dev" className="text-primary underline hover:text-accent" target="_blank" rel="noopener noreferrer">fizzcard.fly.dev</a></p>
              <p><strong className="text-text-primary">FizzCoin Contract:</strong>{' '}
                <a href="https://sepolia.basescan.org/token/0x8C6E04f93BB1c639ca1CBacF145D624e7BDF4Ca7"
                   className="text-primary underline hover:text-accent"
                   target="_blank"
                   rel="noopener noreferrer">
                  View on BaseScan
                </a>
              </p>
              <p><strong className="text-text-primary">Rewards Contract:</strong>{' '}
                <a href="https://sepolia.basescan.org/address/0x9c8376CA2ffdCfBA55AB46dBe168b8c1d09dA21a"
                   className="text-primary underline hover:text-accent"
                   target="_blank"
                   rel="noopener noreferrer">
                  View on BaseScan
                </a>
              </p>
              <p><strong className="text-text-primary">Network:</strong> Base Sepolia (Testnet)</p>
              <p><strong className="text-text-primary">Twitter:</strong> @FizzCoinHQ</p>
              <p><strong className="text-text-primary">Discord:</strong> discord.gg/fizzcoin</p>
              <p><strong className="text-text-primary">GitHub:</strong> github.com/fizzcoin</p>
              <p><strong className="text-text-primary">Email:</strong> hello@fizzcard.com</p>
            </div>
          </div>

          <p className="text-center text-lg text-primary font-semibold mt-12">
            Building a more connected world, one authentic interaction at a time.
          </p>

          <div className="text-center mt-12 pt-8 border-t border-border">
            <p className="text-text-secondary text-sm">FizzCoin Whitepaper v1.0 • January 2025</p>
            <p className="text-text-secondary text-sm mt-2">© 2025 FizzCoin. All rights reserved.</p>
            <p className="text-text-tertiary text-xs mt-4">
              This document is subject to updates as the protocol evolves. Check fizzcard.com for the latest version.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
