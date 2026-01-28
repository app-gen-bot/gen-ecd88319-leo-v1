/**
 * Seed Data Generator
 *
 * Reusable function to seed the database with test data.
 * Can be called from CLI script or API endpoint.
 */

import * as bcrypt from 'bcryptjs';
import { storage } from './storage/factory';

export interface SeedSummary {
  users: number;
  fizzCards: number;
  socialLinks: number;
  wallets: number;
  contactExchanges: number;
  connections: number;
  transactions: number;
  introductions: number;
  events: number;
  eventAttendees: number;
  badges: number;
}

export async function seedDatabase(): Promise<SeedSummary> {
  console.log('🌱 Starting database seeding...\n');

  const summary: SeedSummary = {
    users: 0,
    fizzCards: 0,
    socialLinks: 0,
    wallets: 0,
    contactExchanges: 0,
    connections: 0,
    transactions: 0,
    introductions: 0,
    events: 0,
    eventAttendees: 0,
    badges: 0,
  };

  // Create test users with pre-hashed password
  const passwordHash = await bcrypt.hash('password123', 10);

  const userIds: number[] = [];

  // Create 5 test users for simplicity
  const testUsers = [
    {
      email: 'alex.chen@google.com',
      name: 'Alex Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      role: 'verified' as const,
      isVerified: true,
    },
    {
      email: 'sarah.johnson@meta.com',
      name: 'Sarah Johnson',
      title: 'Product Manager',
      company: 'Meta',
      role: 'user' as const,
      isVerified: false,
    },
    {
      email: 'michael.rodriguez@stripe.com',
      name: 'Michael Rodriguez',
      title: 'Engineering Manager',
      company: 'Stripe',
      role: 'user' as const,
      isVerified: false,
    },
    {
      email: 'admin@fizzcard.app',
      name: 'Admin User',
      title: 'Administrator',
      company: 'FizzCard',
      role: 'admin' as const,
      isVerified: true,
    },
    {
      email: 'test@example.com',
      name: 'Test User',
      title: 'Tester',
      company: 'Testing Inc',
      role: 'user' as const,
      isVerified: false,
    },
  ];

  for (const userData of testUsers) {
    const user = await storage.createUser({
      email: userData.email,
      passwordHash,
      name: userData.name,
      role: userData.role,
      isVerified: userData.isVerified,
    });
    userIds.push(user.id);
    summary.users++;

    // Create FizzCard
    const fizzCard = await storage.createFizzCard({
      userId: user.id,
      displayName: userData.name,
      title: userData.title,
      company: userData.company,
      phone: null,
      email: userData.email,
      website: null,
      address: null,
      bio: `${userData.title} at ${userData.company}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      themeColor: '#00D9FF',
      isActive: true,
    });
    summary.fizzCards++;

    // Create wallet
    await storage.createWallet({
      userId: user.id,
      balance: user.id === 1 ? 1000 : 100,
      totalEarned: user.id === 1 ? 1000 : 100,
      totalSpent: 0,
    });
    summary.wallets++;

    // Create social links
    const linkedinName = userData.name.toLowerCase().replace(/ /g, '-');
    await storage.createSocialLink({
      fizzcardId: fizzCard.id,
      platform: 'linkedin',
      url: `https://linkedin.com/in/${linkedinName}`,
    });
    summary.socialLinks++;
  }

  console.log(`✅ Created ${summary.users} users, ${summary.fizzCards} FizzCards, ${summary.wallets} wallets\n`);

  // Create some connections (user 1 connected to users 2, 3, 4)
  for (let i = 1; i < 4; i++) {
    const exchange = await storage.createContactExchange({
      senderId: userIds[0],
      receiverId: userIds[i],
      method: 'qr_code',
      latitude: 37.7749,
      longitude: -122.4194,
      locationName: 'San Francisco, CA',
      metAt: new Date().toISOString(),
      status: 'accepted',
    });
    summary.contactExchanges++;

    const connection1 = await storage.createConnection({
      userId: userIds[0],
      connectedUserId: userIds[i],
      exchangeId: exchange.id,
      relationshipNote: null,
      tags: [],
      strengthScore: 75,
    });

    const connection2 = await storage.createConnection({
      userId: userIds[i],
      connectedUserId: userIds[0],
      exchangeId: exchange.id,
      relationshipNote: null,
      tags: [],
      strengthScore: 75,
    });
    summary.connections += 2;
  }

  console.log(`✅ Created ${summary.contactExchanges} exchanges, ${summary.connections} connections\n`);

  // Create an event
  const event = await storage.createEvent({
    name: 'Tech Networking Mixer',
    description: 'Connect with fellow tech professionals',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
    isExclusive: false,
    minFizzcoinRequired: 0,
    createdBy: userIds[0],
  });
  summary.events++;

  // Add attendees
  for (let i = 0; i < 3; i++) {
    await storage.createEventAttendee({
      eventId: event.id,
      userId: userIds[i],
      checkInAt: null,
    });
    summary.eventAttendees++;
  }

  console.log(`✅ Created ${summary.events} events, ${summary.eventAttendees} attendees\n`);

  // Create badges
  await storage.createBadge({
    userId: userIds[0],
    badgeType: 'early_adopter',
    earnedAt: new Date().toISOString(),
  });

  await storage.createBadge({
    userId: userIds[0],
    badgeType: 'verified',
    earnedAt: new Date().toISOString(),
  });

  await storage.createBadge({
    userId: userIds[3],
    badgeType: 'verified',
    earnedAt: new Date().toISOString(),
  });
  summary.badges += 3;

  console.log(`✅ Created ${summary.badges} badges\n`);
  console.log('✅ Database seeding completed!\n');
  console.log('💡 Test credentials:');
  console.log('   - alex.chen@google.com / password123');
  console.log('   - admin@fizzcard.app / password123');
  console.log('   - test@example.com / password123\n');

  return summary;
}
