/**
 * Enhanced Seed Data Generator for Network Graph Visualization
 *
 * Creates 20 users with realistic network patterns:
 * - Hub nodes (super-connectors)
 * - Company clusters (Google, Meta, VC firms)
 * - Bridge connections between clusters
 * - Varied connection strengths
 * - Rich introduction network
 */

import * as bcrypt from 'bcryptjs';
import { storage } from './storage/factory';

export interface EnhancedSeedSummary {
  users: number;
  fizzCards: number;
  wallets: number;
  connections: number;
  introductions: number;
  badges: number;
  hubNodes: number;
  clusters: number;
}

interface UserData {
  email: string;
  name: string;
  title: string;
  company: string;
  role: 'user' | 'verified' | 'admin';
  isVerified: boolean;
  bio: string;
  initialBalance: number;
}

export async function seedEnhancedDatabase(): Promise<EnhancedSeedSummary> {
  console.log('🌱 Starting enhanced database seeding for network visualization...\n');

  const summary: EnhancedSeedSummary = {
    users: 0,
    fizzCards: 0,
    wallets: 0,
    connections: 0,
    introductions: 0,
    badges: 0,
    hubNodes: 0,
    clusters: 3, // Google, Meta, VC clusters
  };

  // Pre-hashed password for all test users
  const passwordHash = await bcrypt.hash('password123', 10);

  // ========================================
  // Define 20 diverse users across tech ecosystem
  // ========================================
  const users: UserData[] = [
    // HUB NODE 1: Alex Chen - Super-connector, ex-Google, now Angel Investor
    {
      email: 'alex.chen@gmail.com',
      name: 'Alex Chen',
      title: 'Angel Investor & Advisor',
      company: 'Independent',
      role: 'verified',
      isVerified: true,
      bio: 'Former Google Tech Lead. Angel investor in 15+ startups. Connecting brilliant minds across SV.',
      initialBalance: 1850,
    },

    // GOOGLE CLUSTER (4 people)
    {
      email: 'sarah.johnson@google.com',
      name: 'Sarah Johnson',
      title: 'Staff Software Engineer',
      company: 'Google',
      role: 'verified',
      isVerified: true,
      bio: 'Building distributed systems at Google Cloud. Previously at Meta.',
      initialBalance: 1200,
    },
    {
      email: 'david.park@google.com',
      name: 'David Park',
      title: 'Senior Product Manager',
      company: 'Google',
      role: 'user',
      isVerified: false,
      bio: 'PM for Google Workspace. Stanford MBA. Love building products that scale.',
      initialBalance: 950,
    },
    {
      email: 'emily.washington@google.com',
      name: 'Emily Washington',
      title: 'UX Design Lead',
      company: 'Google',
      role: 'user',
      isVerified: false,
      bio: 'Leading design for Google Assistant. RISD alum. Obsessed with user delight.',
      initialBalance: 780,
    },
    {
      email: 'raj.patel@google.com',
      name: 'Raj Patel',
      title: 'Engineering Manager',
      company: 'Google',
      role: 'user',
      isVerified: false,
      bio: 'Managing 20-person team on Search Quality. IIT Bombay grad.',
      initialBalance: 1100,
    },

    // META CLUSTER (4 people)
    {
      email: 'michael.rodriguez@meta.com',
      name: 'Michael Rodriguez',
      title: 'Director of Engineering',
      company: 'Meta',
      role: 'verified',
      isVerified: true,
      bio: 'Building the metaverse at Meta. 12 years in tech. MIT CSAIL alum.',
      initialBalance: 1650,
    },
    {
      email: 'jessica.liu@meta.com',
      name: 'Jessica Liu',
      title: 'Senior Data Scientist',
      company: 'Meta',
      role: 'user',
      isVerified: false,
      bio: 'ML infrastructure for Instagram Reels. Carnegie Mellon PhD.',
      initialBalance: 890,
    },
    {
      email: 'carlos.santos@meta.com',
      name: 'Carlos Santos',
      title: 'Product Marketing Manager',
      company: 'Meta',
      role: 'user',
      isVerified: false,
      bio: 'Go-to-market for Meta Business Suite. Ex-McKinsey consultant.',
      initialBalance: 720,
    },
    {
      email: 'amanda.foster@meta.com',
      name: 'Amanda Foster',
      title: 'Research Scientist',
      company: 'Meta',
      role: 'user',
      isVerified: false,
      bio: 'AI Research at FAIR. Published at NeurIPS, ICML. Berkeley PhD.',
      initialBalance: 1050,
    },

    // HUB NODE 2: Priya Sharma - VC Partner, connects startups and talent
    {
      email: 'priya.sharma@sequoia.com',
      name: 'Priya Sharma',
      title: 'Partner',
      company: 'Sequoia Capital',
      role: 'verified',
      isVerified: true,
      bio: 'Leading early-stage investments at Sequoia. Stanford GSB. Board member at 8 startups.',
      initialBalance: 2000,
    },

    // VC/STARTUP CLUSTER (4 people)
    {
      email: 'thomas.anderson@a16z.com',
      name: 'Thomas Anderson',
      title: 'General Partner',
      company: 'Andreessen Horowitz',
      role: 'verified',
      isVerified: true,
      bio: 'Investing in crypto and AI. Formerly founded and sold 2 companies.',
      initialBalance: 1900,
    },
    {
      email: 'nina.gupta@ycombinator.com',
      name: 'Nina Gupta',
      title: 'Partner',
      company: 'Y Combinator',
      role: 'verified',
      isVerified: true,
      bio: 'Working with YC founders from W23 batch. Ex-founder (acquired by Airbnb).',
      initialBalance: 1750,
    },
    {
      email: 'james.kim@openai.com',
      name: 'James Kim',
      title: 'Applied AI Engineer',
      company: 'OpenAI',
      role: 'user',
      isVerified: false,
      bio: 'Building GPT-4 applications. Previously ML at Google Brain.',
      initialBalance: 1400,
    },
    {
      email: 'olivia.martinez@anthropic.com',
      name: 'Olivia Martinez',
      title: 'Research Engineer',
      company: 'Anthropic',
      role: 'user',
      isVerified: false,
      bio: 'Working on AI safety and alignment. OpenAI alum.',
      initialBalance: 1300,
    },

    // STARTUP FOUNDERS (3 people)
    {
      email: 'marcus.zhang@stripe.com',
      name: 'Marcus Zhang',
      title: 'Head of Platform',
      company: 'Stripe',
      role: 'verified',
      isVerified: true,
      bio: 'Leading developer platform at Stripe. Ex-Amazon Principal Engineer.',
      initialBalance: 1550,
    },
    {
      email: 'lisa.thompson@startup.io',
      name: 'Lisa Thompson',
      title: 'Founder & CEO',
      company: 'DataFlow AI',
      role: 'user',
      isVerified: false,
      bio: 'Building ML infrastructure for enterprises. Raised $8M Series A from Sequoia.',
      initialBalance: 600,
    },
    {
      email: 'daniel.brooks@startup.io',
      name: 'Daniel Brooks',
      title: 'Co-Founder & CTO',
      company: 'CloudSync',
      role: 'user',
      isVerified: false,
      bio: 'Building next-gen cloud infrastructure. YC S22. Ex-Google SRE.',
      initialBalance: 550,
    },

    // HUB NODE 3: Bridge between tech and academia
    {
      email: 'sophia.williams@stanford.edu',
      name: 'Sophia Williams',
      title: 'Assistant Professor',
      company: 'Stanford University',
      role: 'verified',
      isVerified: true,
      bio: 'Teaching CS and ML at Stanford. Advising 5 PhD students. Google Research alum.',
      initialBalance: 1150,
    },

    // FREELANCERS/CONSULTANTS (2 people)
    {
      email: 'kevin.o-neill@consultant.com',
      name: "Kevin O'Neill",
      title: 'Senior Design Consultant',
      company: 'Independent',
      role: 'user',
      isVerified: false,
      bio: 'Design systems consultant for Fortune 500s. Previously led design at Uber.',
      initialBalance: 840,
    },
    {
      email: 'rachel.green@freelance.dev',
      name: 'Rachel Green',
      title: 'Full-Stack Developer',
      company: 'Independent',
      role: 'user',
      isVerified: false,
      bio: 'Building MVPs for early-stage startups. React/Node specialist. 50+ projects shipped.',
      initialBalance: 680,
    },
  ];

  // ========================================
  // Create all users with FizzCards and Wallets
  // ========================================
  const userIdMap = new Map<string, number>();

  for (const userData of users) {
    // Create user
    const user = await storage.createUser({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      isVerified: userData.isVerified,
    });
    userIdMap.set(userData.email, user.id);
    summary.users++;

    // Create FizzCard
    await storage.createFizzCard({
      userId: user.id,
      displayName: userData.name,
      title: userData.title,
      company: userData.company,
      email: userData.email,
      bio: userData.bio,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      themeColor: userData.isVerified ? '#FFD700' : '#00D9FF',
      isActive: true,
      phone: null,
      website: null,
      address: null,
    });
    summary.fizzCards++;

    // Create wallet with varied balances
    await storage.createWallet({
      userId: user.id,
      balance: userData.initialBalance,
      totalEarned: userData.initialBalance,
      totalSpent: 0,
    });
    summary.wallets++;

    // Create LinkedIn social link
    const linkedinName = userData.name.toLowerCase().replace(/ /g, '-').replace("'", '');
    const fizzCards = await storage.getFizzCardsByUserId(user.id);
    if (fizzCards.length > 0) {
      await storage.createSocialLink({
        fizzcardId: fizzCards[0].id,
        platform: 'linkedin',
        url: `https://linkedin.com/in/${linkedinName}`,
      });
    }

    // Award badges
    if (userData.isVerified) {
      await storage.createBadge({
        userId: user.id,
        badgeType: 'verified',
        earnedAt: new Date().toISOString(),
      });
      summary.badges++;
    }

    // Early adopters get special badge
    if (['alex.chen@gmail.com', 'priya.sharma@sequoia.com', 'sarah.johnson@google.com'].includes(userData.email)) {
      await storage.createBadge({
        userId: user.id,
        badgeType: 'early_adopter',
        earnedAt: new Date().toISOString(),
      });
      summary.badges++;
    }
  }

  console.log(`✅ Created ${summary.users} users with FizzCards and wallets\n`);

  // ========================================
  // Create Connection Network with Patterns
  // ========================================

  interface ConnectionData {
    from: string;
    to: string;
    strength: number;
    note: string;
    location: string;
  }

  const connections: ConnectionData[] = [
    // ========================================
    // HUB 1: Alex Chen - 11 connections (super-connector)
    // ========================================
    { from: 'alex.chen@gmail.com', to: 'sarah.johnson@google.com', strength: 5, note: 'Former teammate at Google (2018-2020)', location: 'Mountain View, CA' },
    { from: 'alex.chen@gmail.com', to: 'michael.rodriguez@meta.com', strength: 4, note: 'Met at TechCrunch Disrupt 2022', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'priya.sharma@sequoia.com', strength: 5, note: 'Co-invested in 3 startups together', location: 'Menlo Park, CA' },
    { from: 'alex.chen@gmail.com', to: 'thomas.anderson@a16z.com', strength: 4, note: 'VC circle, meet monthly for coffee', location: 'Palo Alto, CA' },
    { from: 'alex.chen@gmail.com', to: 'marcus.zhang@stripe.com', strength: 3, note: 'Advisor to Stripe Platform team', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'lisa.thompson@startup.io', strength: 4, note: 'Angel investor in DataFlow AI', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'daniel.brooks@startup.io', strength: 3, note: 'Mentored through YC', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'sophia.williams@stanford.edu', strength: 5, note: 'Stanford study group (2012-2016)', location: 'Stanford, CA' },
    { from: 'alex.chen@gmail.com', to: 'nina.gupta@ycombinator.com', strength: 4, note: 'Guest speaker at YC startup school', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'james.kim@openai.com', strength: 3, note: 'Met at OpenAI demo day', location: 'San Francisco, CA' },
    { from: 'alex.chen@gmail.com', to: 'raj.patel@google.com', strength: 2, note: 'Connected through Sarah at Google event', location: 'Mountain View, CA' },

    // ========================================
    // GOOGLE CLUSTER - Internal connections
    // ========================================
    { from: 'sarah.johnson@google.com', to: 'david.park@google.com', strength: 5, note: 'Work together on Cloud products', location: 'Mountain View, CA' },
    { from: 'sarah.johnson@google.com', to: 'emily.washington@google.com', strength: 4, note: 'Collaborated on Assistant UX redesign', location: 'Mountain View, CA' },
    { from: 'sarah.johnson@google.com', to: 'raj.patel@google.com', strength: 4, note: 'Same office building, lunch buddies', location: 'Mountain View, CA' },
    { from: 'david.park@google.com', to: 'raj.patel@google.com', strength: 3, note: 'Cross-functional project team', location: 'Mountain View, CA' },
    { from: 'emily.washington@google.com', to: 'raj.patel@google.com', strength: 2, note: 'Met at Google design sprint', location: 'Mountain View, CA' },

    // ========================================
    // META CLUSTER - Internal connections
    // ========================================
    { from: 'michael.rodriguez@meta.com', to: 'jessica.liu@meta.com', strength: 5, note: 'Direct report, working together 3 years', location: 'Menlo Park, CA' },
    { from: 'michael.rodriguez@meta.com', to: 'carlos.santos@meta.com', strength: 4, note: 'Partner on Instagram product launches', location: 'Menlo Park, CA' },
    { from: 'michael.rodriguez@meta.com', to: 'amanda.foster@meta.com', strength: 3, note: 'Research collaboration on ML infra', location: 'Menlo Park, CA' },
    { from: 'jessica.liu@meta.com', to: 'amanda.foster@meta.com', strength: 5, note: 'Co-authors on ML paper, close friends', location: 'Menlo Park, CA' },
    { from: 'carlos.santos@meta.com', to: 'amanda.foster@meta.com', strength: 2, note: 'Connected at Meta all-hands', location: 'Menlo Park, CA' },

    // ========================================
    // HUB 2: Priya Sharma (VC) - 10 connections
    // ========================================
    { from: 'priya.sharma@sequoia.com', to: 'thomas.anderson@a16z.com', strength: 5, note: 'Co-investors, close friends for 8 years', location: 'Menlo Park, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'nina.gupta@ycombinator.com', strength: 4, note: 'Source deals together, monthly dinners', location: 'Palo Alto, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'lisa.thompson@startup.io', strength: 5, note: 'Led Series A for DataFlow AI', location: 'San Francisco, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'marcus.zhang@stripe.com', strength: 3, note: 'Met through portfolio company', location: 'San Francisco, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'sophia.williams@stanford.edu', strength: 4, note: 'Stanford GSB classmates (2014-2016)', location: 'Stanford, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'michael.rodriguez@meta.com', strength: 3, note: 'Recruiting engineers for portfolio', location: 'Menlo Park, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'james.kim@openai.com', strength: 2, note: 'Met at AI summit, interested in OpenAI', location: 'San Francisco, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'daniel.brooks@startup.io', strength: 4, note: 'Considering investment in CloudSync', location: 'San Francisco, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'sarah.johnson@google.com', strength: 2, note: 'Introduced by Alex, recruiting for startups', location: 'Palo Alto, CA' },
    { from: 'priya.sharma@sequoia.com', to: 'olivia.martinez@anthropic.com', strength: 3, note: 'Exploring AI safety investments', location: 'San Francisco, CA' },

    // ========================================
    // VC/AI CLUSTER - Interconnections
    // ========================================
    { from: 'thomas.anderson@a16z.com', to: 'nina.gupta@ycombinator.com', strength: 4, note: 'Co-hosting crypto meetups', location: 'San Francisco, CA' },
    { from: 'thomas.anderson@a16z.com', to: 'daniel.brooks@startup.io', strength: 3, note: 'Invested in CloudSync seed round', location: 'San Francisco, CA' },
    { from: 'thomas.anderson@a16z.com', to: 'james.kim@openai.com', strength: 4, note: 'Discussing GPT-4 enterprise applications', location: 'San Francisco, CA' },
    { from: 'nina.gupta@ycombinator.com', to: 'daniel.brooks@startup.io', strength: 5, note: 'YC mentor for CloudSync (S22 batch)', location: 'Mountain View, CA' },
    { from: 'nina.gupta@ycombinator.com', to: 'lisa.thompson@startup.io', strength: 3, note: 'Met at YC networking event', location: 'Mountain View, CA' },
    { from: 'james.kim@openai.com', to: 'olivia.martinez@anthropic.com', strength: 5, note: 'Former colleagues at OpenAI, close friends', location: 'San Francisco, CA' },
    { from: 'james.kim@openai.com', to: 'amanda.foster@meta.com', strength: 3, note: 'AI research community, NeurIPS conference', location: 'San Francisco, CA' },

    // ========================================
    // HUB 3: Sophia Williams (Academia-Industry Bridge) - 9 connections
    // ========================================
    { from: 'sophia.williams@stanford.edu', to: 'sarah.johnson@google.com', strength: 4, note: 'Collaborated on Google Research project', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'james.kim@openai.com', strength: 5, note: 'PhD advisor (2018-2023)', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'olivia.martinez@anthropic.com', strength: 4, note: 'Guest lecturer, research collaboration', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'amanda.foster@meta.com', strength: 3, note: 'Co-published paper at ICML', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'david.park@google.com', strength: 3, note: 'Stanford MBA alumni connection', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'emily.washington@google.com', strength: 2, note: 'Met at Stanford design thinking workshop', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'thomas.anderson@a16z.com', strength: 3, note: 'Advising on AI investments', location: 'Palo Alto, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'lisa.thompson@startup.io', strength: 4, note: 'Technical advisor for DataFlow AI', location: 'Stanford, CA' },
    { from: 'sophia.williams@stanford.edu', to: 'rachel.green@freelance.dev', strength: 2, note: 'Met at Stanford alumni mixer', location: 'Stanford, CA' },

    // ========================================
    // BRIDGE CONNECTIONS - Cross-cluster ties
    // ========================================
    { from: 'sarah.johnson@google.com', to: 'michael.rodriguez@meta.com', strength: 4, note: 'Former colleagues at Google (2017-2019)', location: 'San Francisco, CA' },
    { from: 'marcus.zhang@stripe.com', to: 'david.park@google.com', strength: 3, note: 'Discussing API integration partnerships', location: 'San Francisco, CA' },
    { from: 'marcus.zhang@stripe.com', to: 'lisa.thompson@startup.io', strength: 4, note: 'DataFlow AI is Stripe customer', location: 'San Francisco, CA' },
    { from: 'marcus.zhang@stripe.com', to: 'daniel.brooks@startup.io', strength: 3, note: 'CloudSync using Stripe for payments', location: 'San Francisco, CA' },

    // ========================================
    // FREELANCER/CONSULTANT CONNECTIONS
    // ========================================
    { from: 'kevin.o-neill@consultant.com', to: 'emily.washington@google.com', strength: 3, note: 'Design community, met at Adobe MAX', location: 'San Francisco, CA' },
    { from: 'kevin.o-neill@consultant.com', to: 'lisa.thompson@startup.io', strength: 4, note: 'Consulting on DataFlow AI design system', location: 'San Francisco, CA' },
    { from: 'rachel.green@freelance.dev', to: 'daniel.brooks@startup.io', strength: 5, note: 'Contract developer for CloudSync MVP', location: 'San Francisco, CA' },
    { from: 'rachel.green@freelance.dev', to: 'kevin.o-neill@consultant.com', strength: 3, note: 'Co-working space buddies', location: 'San Francisco, CA' },

    // ========================================
    // WEAK TIES - Recent connections (strength 1-2)
    // ========================================
    { from: 'carlos.santos@meta.com', to: 'marcus.zhang@stripe.com', strength: 1, note: 'Just met at Marketing conference last week', location: 'San Francisco, CA' },
    { from: 'raj.patel@google.com', to: 'james.kim@openai.com', strength: 1, note: 'Connected on LinkedIn, havent met in person', location: 'Virtual' },
    { from: 'jessica.liu@meta.com', to: 'olivia.martinez@anthropic.com', strength: 2, note: 'Met briefly at NeurIPS poster session', location: 'New Orleans, LA' },
  ];

  // Create bidirectional connections
  for (const conn of connections) {
    const fromId = userIdMap.get(conn.from);
    const toId = userIdMap.get(conn.to);

    if (!fromId || !toId) {
      console.warn(`⚠️  Skipping connection: ${conn.from} -> ${conn.to} (user not found)`);
      continue;
    }

    // Create contact exchange
    const metAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Random date within last year
    const exchange = await storage.createContactExchange({
      senderId: fromId,
      receiverId: toId,
      method: 'qr_code',
      latitude: null,
      longitude: null,
      locationName: conn.location,
      metAt: metAt.toISOString(),
      status: 'accepted',
    });

    // Create connection from A to B
    await storage.createConnection({
      userId: fromId,
      connectedUserId: toId,
      exchangeId: exchange.id,
      relationshipNote: conn.note,
      tags: [],
      strengthScore: conn.strength * 20, // Convert 1-5 to 20-100 scale
    });

    // Create connection from B to A (bidirectional)
    await storage.createConnection({
      userId: toId,
      connectedUserId: fromId,
      exchangeId: exchange.id,
      relationshipNote: conn.note,
      tags: [],
      strengthScore: conn.strength * 20,
    });

    summary.connections += 2;
  }

  // Count hub nodes (users with 8+ connections)
  const connectionCounts = new Map<number, number>();
  for (const conn of connections) {
    const fromId = userIdMap.get(conn.from);
    const toId = userIdMap.get(conn.to);
    if (fromId) connectionCounts.set(fromId, (connectionCounts.get(fromId) || 0) + 1);
    if (toId) connectionCounts.set(toId, (connectionCounts.get(toId) || 0) + 1);
  }
  summary.hubNodes = Array.from(connectionCounts.values()).filter(count => count >= 8).length;

  console.log(`✅ Created ${summary.connections} connections (${connections.length} unique edges, bidirectional)`);
  console.log(`✅ Network has ${summary.hubNodes} hub nodes with 8+ connections\n`);

  // ========================================
  // Create Introduction Network
  // ========================================

  interface IntroductionData {
    introducer: string;
    personA: string;
    personB: string;
    context: string;
    status: 'pending' | 'completed' | 'declined';
    reward: number;
  }

  const introductions: IntroductionData[] = [
    // Alex Chen making introductions (hub behavior)
    {
      introducer: 'alex.chen@gmail.com',
      personA: 'sarah.johnson@google.com',
      personB: 'priya.sharma@sequoia.com',
      context: 'Sarah is looking to join a startup, Priya has portfolio companies hiring senior engineers.',
      status: 'completed',
      reward: 50,
    },
    {
      introducer: 'alex.chen@gmail.com',
      personA: 'lisa.thompson@startup.io',
      personB: 'marcus.zhang@stripe.com',
      context: 'DataFlow AI needs payment infrastructure, Marcus can help architect it.',
      status: 'completed',
      reward: 25,
    },
    {
      introducer: 'alex.chen@gmail.com',
      personA: 'daniel.brooks@startup.io',
      personB: 'nina.gupta@ycombinator.com',
      context: 'Daniel is applying to YC, Nina can provide guidance.',
      status: 'completed',
      reward: 50,
    },

    // Priya Sharma making VC introductions
    {
      introducer: 'priya.sharma@sequoia.com',
      personA: 'lisa.thompson@startup.io',
      personB: 'sophia.williams@stanford.edu',
      context: 'Lisa needs ML advisor, Sophia is perfect fit with academic background.',
      status: 'completed',
      reward: 50,
    },
    {
      introducer: 'priya.sharma@sequoia.com',
      personA: 'daniel.brooks@startup.io',
      personB: 'thomas.anderson@a16z.com',
      context: 'CloudSync raising Series A, Thomas invests in infrastructure.',
      status: 'pending',
      reward: 0,
    },
    {
      introducer: 'priya.sharma@sequoia.com',
      personA: 'michael.rodriguez@meta.com',
      personB: 'lisa.thompson@startup.io',
      context: 'Lisa is hiring, Michael knows great Meta engineers looking to join startups.',
      status: 'completed',
      reward: 25,
    },

    // Sophia Williams making academic-industry bridges
    {
      introducer: 'sophia.williams@stanford.edu',
      personA: 'james.kim@openai.com',
      personB: 'thomas.anderson@a16z.com',
      context: 'James can advise on AI investments, Thomas is exploring the space.',
      status: 'completed',
      reward: 50,
    },
    {
      introducer: 'sophia.williams@stanford.edu',
      personA: 'amanda.foster@meta.com',
      personB: 'olivia.martinez@anthropic.com',
      context: 'Both working on AI safety, should collaborate on research.',
      status: 'completed',
      reward: 50,
    },

    // Sarah Johnson (Google) making intros
    {
      introducer: 'sarah.johnson@google.com',
      personA: 'raj.patel@google.com',
      personB: 'alex.chen@gmail.com',
      context: 'Raj is interested in angel investing, Alex can mentor him.',
      status: 'completed',
      reward: 25,
    },
    {
      introducer: 'sarah.johnson@google.com',
      personA: 'emily.washington@google.com',
      personB: 'kevin.o-neill@consultant.com',
      context: 'Emily needs design systems consultant, Kevin is the best.',
      status: 'completed',
      reward: 50,
    },

    // Michael Rodriguez (Meta) making intros
    {
      introducer: 'michael.rodriguez@meta.com',
      personA: 'jessica.liu@meta.com',
      personB: 'sophia.williams@stanford.edu',
      context: 'Jessica wants to transition to academia, Sophia can advise.',
      status: 'pending',
      reward: 0,
    },

    // Nina Gupta (YC) helping founders connect
    {
      introducer: 'nina.gupta@ycombinator.com',
      personA: 'daniel.brooks@startup.io',
      personB: 'rachel.green@freelance.dev',
      context: 'CloudSync needs full-stack dev for MVP, Rachel is available.',
      status: 'completed',
      reward: 50,
    },
    {
      introducer: 'nina.gupta@ycombinator.com',
      personA: 'lisa.thompson@startup.io',
      personB: 'marcus.zhang@stripe.com',
      context: 'DataFlow needs payment partner, Stripe has enterprise program.',
      status: 'completed',
      reward: 50,
    },

    // Marcus Zhang (Stripe) making business intros
    {
      introducer: 'marcus.zhang@stripe.com',
      personA: 'david.park@google.com',
      personB: 'daniel.brooks@startup.io',
      context: 'David is exploring startup opportunities, Daniel is hiring PMs.',
      status: 'pending',
      reward: 0,
    },

    // Kevin O'Neill making design community intros
    {
      introducer: 'kevin.o-neill@consultant.com',
      personA: 'emily.washington@google.com',
      personB: 'lisa.thompson@startup.io',
      context: 'Lisa needs design lead, Emily might know someone at Google.',
      status: 'completed',
      reward: 25,
    },
  ];

  for (const intro of introductions) {
    const introducerId = userIdMap.get(intro.introducer);
    const personAId = userIdMap.get(intro.personA);
    const personBId = userIdMap.get(intro.personB);

    if (!introducerId || !personAId || !personBId) {
      console.warn(`⚠️  Skipping introduction: ${intro.introducer} introducing ${intro.personA} to ${intro.personB}`);
      continue;
    }

    await storage.createIntroduction({
      introducerId,
      personAId,
      personBId,
      context: intro.context,
      status: intro.status,
      fizzcoinReward: intro.reward,
    });

    summary.introductions++;

    // Award FizzCoins for completed introductions
    if (intro.status === 'completed' && intro.reward > 0) {
      const introducerWallet = await storage.getWalletByUserId(introducerId);
      if (introducerWallet) {
        await storage.updateWallet(introducerWallet.id, {
          balance: introducerWallet.balance + intro.reward,
          totalEarned: introducerWallet.totalEarned + intro.reward,
        });

        await storage.createTransaction({
          userId: introducerId,
          amount: intro.reward,
          transactionType: 'introduction',
          metadata: {
            personAId,
            personBId,
            context: intro.context,
          },
        });
      }
    }
  }

  console.log(`✅ Created ${summary.introductions} introductions showing network effects\n`);
  console.log(`✅ Created ${summary.badges} badges for verified users and early adopters\n`);

  // ========================================
  // Final Summary
  // ========================================
  console.log('========================================');
  console.log('✅ ENHANCED DATABASE SEEDING COMPLETED!');
  console.log('========================================\n');
  console.log('📊 Summary Statistics:');
  console.log(`   • Users: ${summary.users}`);
  console.log(`   • FizzCards: ${summary.fizzCards}`);
  console.log(`   • Wallets: ${summary.wallets}`);
  console.log(`   • Connections: ${summary.connections} (${connections.length} unique edges)`);
  console.log(`   • Hub Nodes: ${summary.hubNodes} (users with 8+ connections)`);
  console.log(`   • Company Clusters: ${summary.clusters} (Google, Meta, VC/Startup)`);
  console.log(`   • Introductions: ${summary.introductions}`);
  console.log(`   • Badges: ${summary.badges}\n`);

  console.log('🎯 Network Graph Features:');
  console.log('   • Alex Chen: 11 connections (super-connector, angel investor)');
  console.log('   • Priya Sharma: 10 connections (VC hub, connects startups)');
  console.log('   • Sophia Williams: 9 connections (academia-industry bridge)');
  console.log('   • Google cluster: 4 tightly connected employees');
  console.log('   • Meta cluster: 4 tightly connected employees');
  console.log('   • VC/Startup cluster: 6 investors and founders');
  console.log('   • Bridge connections: Sarah (Google→Meta), Marcus (Stripe→Startups)\n');

  console.log('🔑 Test Credentials (password: password123):');
  console.log('   • alex.chen@gmail.com (Angel Investor, Hub Node)');
  console.log('   • priya.sharma@sequoia.com (VC Partner, Hub Node)');
  console.log('   • sarah.johnson@google.com (Google Engineer, Bridge Node)');
  console.log('   • michael.rodriguez@meta.com (Meta Director)');
  console.log('   • lisa.thompson@startup.io (Startup Founder)\n');

  return summary;
}
