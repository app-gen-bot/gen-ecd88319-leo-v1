/**
 * FizzCard Database Seeding Script
 *
 * Creates realistic test data for all entities:
 * - Users with varied profiles
 * - FizzCards with social links
 * - Contact exchanges and connections
 * - FizzCoin wallets and transactions
 * - Introductions, events, attendees, and badges
 *
 * Usage: npm run seed
 */

// IMPORTANT: Load environment variables FIRST before any other imports
import * as dotenv from 'dotenv';
const envResult = dotenv.config();
console.log('[Seed] Loaded environment:', {
  storageMode: process.env.STORAGE_MODE,
  hasDatabaseUrl: !!process.env.DATABASE_URL,
  envResult: envResult.error ? envResult.error.message : 'success'
});

import * as bcrypt from 'bcryptjs';
import { createStorage } from './lib/storage/factory';

// Create storage AFTER environment is loaded
const storage = createStorage();
import type {
  User,
  FizzCard,
  SocialLink,
  ContactExchange,
  Connection,
  FizzCoinWallet,
  Introduction,
  Event,
  Badge,
} from '../shared/schema.zod';

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

interface UserSeedData {
  email: string;
  password: string;
  name: string;
  title: string;
  company: string;
  phone: string;
  website: string;
  bio: string;
  avatarUrl: string;
  role: 'user' | 'admin' | 'verified';
  isVerified: boolean;
  location: string;
  industry: string;
}

const SEED_USERS: UserSeedData[] = [
  {
    email: 'alex.chen@google.com',
    password: 'password123',
    name: 'Alex Chen',
    title: 'Senior Software Engineer',
    company: 'Google',
    phone: '+1-415-555-0101',
    website: 'https://alexchen.dev',
    bio: 'Building the future of cloud infrastructure at Google. Previously at AWS. Passionate about distributed systems and open source.',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Technology',
  },
  {
    email: 'sarah.johnson@meta.com',
    password: 'password123',
    name: 'Sarah Johnson',
    title: 'Product Manager',
    company: 'Meta',
    phone: '+1-415-555-0102',
    website: 'https://sarahjohnson.io',
    bio: 'Leading AI-powered social features at Meta. Ex-Google PM. Love connecting people through technology.',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Technology',
  },
  {
    email: 'michael.rodriguez@stripe.com',
    password: 'password123',
    name: 'Michael Rodriguez',
    title: 'Engineering Manager',
    company: 'Stripe',
    phone: '+1-415-555-0103',
    website: 'https://mrodriguez.com',
    bio: 'Managing payments infrastructure at Stripe. Building teams that ship fast and scale.',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Fintech',
  },
  {
    email: 'emily.watson@airbnb.com',
    password: 'password123',
    name: 'Emily Watson',
    title: 'Senior Designer',
    company: 'Airbnb',
    phone: '+1-415-555-0104',
    website: 'https://emilywatson.design',
    bio: 'Crafting delightful experiences at Airbnb. Award-winning designer with a focus on accessibility.',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    role: 'user',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Technology',
  },
  {
    email: 'david.kim@ycombinator.com',
    password: 'password123',
    name: 'David Kim',
    title: 'Venture Partner',
    company: 'Y Combinator',
    phone: '+1-415-555-0105',
    website: 'https://davidkim.vc',
    bio: 'Helping founders build the next big thing. Former startup founder (acquired). Angel investor.',
    avatarUrl: 'https://i.pravatar.cc/150?img=15',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Venture Capital',
  },
  {
    email: 'jessica.martinez@techcrunch.com',
    password: 'password123',
    name: 'Jessica Martinez',
    title: 'Senior Reporter',
    company: 'TechCrunch',
    phone: '+1-415-555-0106',
    website: 'https://jessicamartinez.com',
    bio: 'Covering startups and tech innovation. Always looking for the next big story.',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    role: 'user',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Media',
  },
  {
    email: 'james.lee@coinbase.com',
    password: 'password123',
    name: 'James Lee',
    title: 'Head of Engineering',
    company: 'Coinbase',
    phone: '+1-415-555-0107',
    website: 'https://jameslee.tech',
    bio: 'Building the crypto economy at Coinbase. Blockchain enthusiast and technical leader.',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Cryptocurrency',
  },
  {
    email: 'lisa.anderson@shopify.com',
    password: 'password123',
    name: 'Lisa Anderson',
    title: 'VP of Product',
    company: 'Shopify',
    phone: '+1-415-555-0108',
    website: 'https://lisaanderson.co',
    bio: 'Empowering entrepreneurs through commerce. Building products that millions use daily.',
    avatarUrl: 'https://i.pravatar.cc/150?img=23',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'E-commerce',
  },
  {
    email: 'robert.brown@netflix.com',
    password: 'password123',
    name: 'Robert Brown',
    title: 'Data Scientist',
    company: 'Netflix',
    phone: '+1-415-555-0109',
    website: 'https://robertbrown.ai',
    bio: 'Using ML to personalize entertainment. PhD in Machine Learning from Stanford.',
    avatarUrl: 'https://i.pravatar.cc/150?img=52',
    role: 'user',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Entertainment',
  },
  {
    email: 'amanda.taylor@salesforce.com',
    password: 'password123',
    name: 'Amanda Taylor',
    title: 'Enterprise Account Executive',
    company: 'Salesforce',
    phone: '+1-415-555-0110',
    website: 'https://amandataylor.biz',
    bio: 'Helping companies transform with cloud CRM. Top performer 5 years running.',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    role: 'user',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Enterprise Software',
  },
  {
    email: 'kevin.wilson@uber.com',
    password: 'password123',
    name: 'Kevin Wilson',
    title: 'Operations Lead',
    company: 'Uber',
    phone: '+1-212-555-0201',
    website: 'https://kevinwilson.net',
    bio: 'Optimizing mobility operations at Uber. Making cities work better for everyone.',
    avatarUrl: 'https://i.pravatar.cc/150?img=60',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Transportation',
  },
  {
    email: 'michelle.garcia@jpmorgan.com',
    password: 'password123',
    name: 'Michelle Garcia',
    title: 'Investment Banker',
    company: 'JPMorgan Chase',
    phone: '+1-212-555-0202',
    website: 'https://michellegarcia.finance',
    bio: 'Advising tech companies on M&A and capital raises. MBA from Wharton.',
    avatarUrl: 'https://i.pravatar.cc/150?img=24',
    role: 'verified',
    isVerified: true,
    location: 'New York',
    industry: 'Finance',
  },
  {
    email: 'daniel.moore@goldman.com',
    password: 'password123',
    name: 'Daniel Moore',
    title: 'Quantitative Analyst',
    company: 'Goldman Sachs',
    phone: '+1-212-555-0203',
    website: 'https://danielmoore.quant',
    bio: 'Building trading algorithms and risk models. Former physicist turned quant.',
    avatarUrl: 'https://i.pravatar.cc/150?img=68',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Finance',
  },
  {
    email: 'jennifer.thomas@vogue.com',
    password: 'password123',
    name: 'Jennifer Thomas',
    title: 'Fashion Editor',
    company: 'Vogue',
    phone: '+1-212-555-0204',
    website: 'https://jenniferthomas.style',
    bio: 'Curating the latest in fashion and culture. Paris Fashion Week regular.',
    avatarUrl: 'https://i.pravatar.cc/150?img=31',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Fashion',
  },
  {
    email: 'chris.jackson@spotify.com',
    password: 'password123',
    name: 'Chris Jackson',
    title: 'Music Product Manager',
    company: 'Spotify',
    phone: '+1-212-555-0205',
    website: 'https://chrisjackson.music',
    bio: 'Building features that artists and fans love. Former musician turned PM.',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Music',
  },
  {
    email: 'maria.hernandez@miamitech.co',
    password: 'password123',
    name: 'Maria Hernandez',
    title: 'Founder & CEO',
    company: 'MiamiTech Ventures',
    phone: '+1-305-555-0301',
    website: 'https://mariahernandez.ventures',
    bio: 'Building the Miami tech scene. Serial entrepreneur and startup advisor.',
    avatarUrl: 'https://i.pravatar.cc/150?img=29',
    role: 'verified',
    isVerified: true,
    location: 'Miami',
    industry: 'Startups',
  },
  {
    email: 'ryan.white@realestate.miami',
    password: 'password123',
    name: 'Ryan White',
    title: 'Commercial Real Estate Broker',
    company: 'Miami Properties Group',
    phone: '+1-305-555-0302',
    website: 'https://ryanwhite.properties',
    bio: 'Connecting businesses with prime Miami real estate. 15+ years experience.',
    avatarUrl: 'https://i.pravatar.cc/150?img=56',
    role: 'user',
    isVerified: true,
    location: 'Miami',
    industry: 'Real Estate',
  },
  {
    email: 'sophia.lopez@artbasel.com',
    password: 'password123',
    name: 'Sophia Lopez',
    title: 'Art Curator',
    company: 'Art Basel Miami',
    phone: '+1-305-555-0303',
    website: 'https://sophialopez.art',
    bio: 'Curating contemporary art experiences. Connecting artists with collectors.',
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
    role: 'user',
    isVerified: true,
    location: 'Miami',
    industry: 'Art',
  },
  {
    email: 'tyler.davis@techstartup.io',
    password: 'password123',
    name: 'Tyler Davis',
    title: 'Full Stack Engineer',
    company: 'Startup XYZ',
    phone: '+1-415-555-0111',
    website: 'https://tylerdavis.codes',
    bio: 'Early engineer at fast-growing startup. Love React, Node.js, and coffee.',
    avatarUrl: 'https://i.pravatar.cc/150?img=70',
    role: 'user',
    isVerified: false,
    location: 'San Francisco',
    industry: 'Startups',
  },
  {
    email: 'olivia.martin@freelance.design',
    password: 'password123',
    name: 'Olivia Martin',
    title: 'Freelance Brand Designer',
    company: 'Self-Employed',
    phone: '+1-415-555-0112',
    website: 'https://oliviamartin.design',
    bio: 'Creating memorable brands for startups and scale-ups. Available for projects.',
    avatarUrl: 'https://i.pravatar.cc/150?img=48',
    role: 'user',
    isVerified: false,
    location: 'San Francisco',
    industry: 'Design',
  },
  {
    email: 'jason.clark@consultant.com',
    password: 'password123',
    name: 'Jason Clark',
    title: 'Strategy Consultant',
    company: 'McKinsey & Company',
    phone: '+1-212-555-0206',
    website: 'https://jasonclark.consulting',
    bio: 'Advising Fortune 500 companies on digital transformation. MBA from Harvard.',
    avatarUrl: 'https://i.pravatar.cc/150?img=51',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Consulting',
  },
  {
    email: 'natalie.hill@healthtech.io',
    password: 'password123',
    name: 'Natalie Hill',
    title: 'Chief Medical Officer',
    company: 'HealthTech Innovations',
    phone: '+1-415-555-0113',
    website: 'https://nataliehill.health',
    bio: 'MD turned entrepreneur. Building AI-powered healthcare solutions.',
    avatarUrl: 'https://i.pravatar.cc/150?img=38',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Healthcare',
  },
  {
    email: 'brandon.scott@edtech.edu',
    password: 'password123',
    name: 'Brandon Scott',
    title: 'Director of Product',
    company: 'EdTech Academy',
    phone: '+1-212-555-0207',
    website: 'https://brandonscott.edu',
    bio: 'Making education accessible through technology. Former teacher and ed advocate.',
    avatarUrl: 'https://i.pravatar.cc/150?img=59',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Education',
  },
  {
    email: 'rachel.green@sustainable.earth',
    password: 'password123',
    name: 'Rachel Green',
    title: 'Sustainability Director',
    company: 'Green Future Inc',
    phone: '+1-415-555-0114',
    website: 'https://rachelgreen.earth',
    bio: 'Fighting climate change through sustainable business practices. TEDx speaker.',
    avatarUrl: 'https://i.pravatar.cc/150?img=43',
    role: 'user',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Sustainability',
  },
  {
    email: 'marcus.thompson@fitness.app',
    password: 'password123',
    name: 'Marcus Thompson',
    title: 'Founder & Head Coach',
    company: 'FitLife App',
    phone: '+1-305-555-0304',
    website: 'https://marcusthompson.fit',
    bio: 'Personal trainer and fitness tech entrepreneur. Helping people live healthier.',
    avatarUrl: 'https://i.pravatar.cc/150?img=64',
    role: 'user',
    isVerified: false,
    location: 'Miami',
    industry: 'Fitness',
  },
  {
    email: 'elena.rodriguez@legaltech.law',
    password: 'password123',
    name: 'Elena Rodriguez',
    title: 'Legal Tech Product Lead',
    company: 'LegalTech Solutions',
    phone: '+1-212-555-0208',
    website: 'https://elenarodriguez.law',
    bio: 'Lawyer turned product manager. Modernizing legal services with technology.',
    avatarUrl: 'https://i.pravatar.cc/150?img=26',
    role: 'user',
    isVerified: true,
    location: 'New York',
    industry: 'Legal Tech',
  },
  {
    email: 'tony.parker@gaming.gg',
    password: 'password123',
    name: 'Tony Parker',
    title: 'Game Developer',
    company: 'Indie Game Studio',
    phone: '+1-415-555-0115',
    website: 'https://tonyparker.games',
    bio: 'Creating immersive gaming experiences. Published 3 indie games on Steam.',
    avatarUrl: 'https://i.pravatar.cc/150?img=67',
    role: 'user',
    isVerified: false,
    location: 'San Francisco',
    industry: 'Gaming',
  },
  {
    email: 'carol.white@food.delivery',
    password: 'password123',
    name: 'Carol White',
    title: 'Regional Manager',
    company: 'DoorDash',
    phone: '+1-305-555-0305',
    website: 'https://carolwhite.food',
    bio: 'Managing food delivery operations across South Florida. Food lover and logistics expert.',
    avatarUrl: 'https://i.pravatar.cc/150?img=35',
    role: 'user',
    isVerified: true,
    location: 'Miami',
    industry: 'Food Tech',
  },
  {
    email: 'derek.zhang@robotics.ai',
    password: 'password123',
    name: 'Derek Zhang',
    title: 'Robotics Engineer',
    company: 'Boston Dynamics',
    phone: '+1-415-555-0116',
    website: 'https://derekzhang.robotics',
    bio: 'Building the future of robotics and automation. PhD in Robotics from MIT.',
    avatarUrl: 'https://i.pravatar.cc/150?img=72',
    role: 'verified',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Robotics',
  },
  {
    email: 'admin@fizzcard.app',
    password: 'admin123',
    name: 'FizzCard Admin',
    title: 'Platform Administrator',
    company: 'FizzCard',
    phone: '+1-415-555-0000',
    website: 'https://fizzcard.app',
    bio: 'Managing the FizzCard platform. Here to help users connect and grow.',
    avatarUrl: 'https://i.pravatar.cc/150?img=99',
    role: 'admin',
    isVerified: true,
    location: 'San Francisco',
    industry: 'Technology',
  },
];

// GPS coordinates for realistic locations
const LOCATIONS = {
  'San Francisco': { latitude: 37.7749, longitude: -122.4194, name: 'San Francisco, CA' },
  'New York': { latitude: 40.7128, longitude: -74.0060, name: 'New York, NY' },
  'Miami': { latitude: 25.7617, longitude: -80.1918, name: 'Miami, FL' },
};

// Social platforms for seed data
const SOCIAL_PLATFORMS = ['linkedin', 'twitter', 'instagram', 'github'] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Get random item from array
 */
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get random number between min and max
 */
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random date in the past X days
 */
function randomPastDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - randomNumber(0, daysAgo));
  return date;
}

/**
 * Get random future date in next X days
 */
function randomFutureDate(daysAhead: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + randomNumber(1, daysAhead));
  return date;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

/**
 * Seed users
 */
async function seedUsers(): Promise<User[]> {
  console.log('\n📝 Seeding users...');
  const users: User[] = [];

  for (const userData of SEED_USERS) {
    const passwordHash = await hashPassword(userData.password);
    const user = await storage.createUser({
      email: userData.email,
      passwordHash,
      name: userData.name,
      title: userData.title,
      company: userData.company,
      phone: userData.phone,
      website: userData.website,
      bio: userData.bio,
      avatarUrl: userData.avatarUrl,
      address: userData.location,
      role: userData.role,
      isVerified: userData.isVerified,
    });
    users.push(user);
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
}

/**
 * Seed FizzCards for all users
 */
async function seedFizzCards(users: User[]): Promise<FizzCard[]> {
  console.log('\n💳 Seeding FizzCards...');
  const fizzCards: FizzCard[] = [];

  for (const user of users) {
    const userData = SEED_USERS.find(u => u.email === user.email)!;

    const fizzCard = await storage.createFizzCard({
      userId: user.id,
      displayName: user.name,
      title: user.title || null,
      company: user.company || null,
      phone: user.phone || null,
      email: user.email,
      website: user.website || null,
      address: userData.location,
      bio: user.bio || null,
      avatarUrl: user.avatarUrl || null,
      themeColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      isActive: true,
    });
    fizzCards.push(fizzCard);
  }

  console.log(`✅ Created ${fizzCards.length} FizzCards`);
  return fizzCards;
}

/**
 * Seed social links for FizzCards
 */
async function seedSocialLinks(fizzCards: FizzCard[]): Promise<SocialLink[]> {
  console.log('\n🔗 Seeding social links...');
  const socialLinks: SocialLink[] = [];

  for (const fizzCard of fizzCards) {
    const numLinks = randomNumber(2, 4);
    const platforms = shuffle([...SOCIAL_PLATFORMS]).slice(0, numLinks);

    for (const platform of platforms) {
      let url = '';
      const username = fizzCard.displayName.toLowerCase().replace(/\s+/g, '');

      switch (platform) {
        case 'linkedin':
          url = `https://linkedin.com/in/${username}`;
          break;
        case 'twitter':
          url = `https://twitter.com/${username}`;
          break;
        case 'instagram':
          url = `https://instagram.com/${username}`;
          break;
        case 'github':
          url = `https://github.com/${username}`;
          break;
      }

      const socialLink = await storage.createSocialLink({
        fizzcardId: fizzCard.id,
        platform,
        url,
      });
      socialLinks.push(socialLink);
    }
  }

  console.log(`✅ Created ${socialLinks.length} social links`);
  return socialLinks;
}

/**
 * Seed FizzCoin wallets for all users
 */
async function seedWallets(users: User[]): Promise<FizzCoinWallet[]> {
  console.log('\n💰 Seeding FizzCoin wallets...');
  const wallets: FizzCoinWallet[] = [];

  for (const user of users) {
    const totalEarned = randomNumber(100, 5000);
    const totalSpent = randomNumber(0, totalEarned / 2);
    const balance = totalEarned - totalSpent;

    const wallet = await storage.createWallet({
      userId: user.id,
      balance,
      totalEarned,
      totalSpent,
      lastTransactionAt: randomPastDate(30).toISOString(),
    });
    wallets.push(wallet);
  }

  console.log(`✅ Created ${wallets.length} wallets`);
  return wallets;
}

/**
 * Seed contact exchanges between users
 */
async function seedContactExchanges(users: User[]): Promise<ContactExchange[]> {
  console.log('\n🤝 Seeding contact exchanges...');
  const exchanges: ContactExchange[] = [];
  const methods: Array<'qr_code' | 'nfc' | 'direct_share'> = ['qr_code', 'nfc', 'direct_share'];
  const statuses: Array<'pending' | 'accepted' | 'rejected'> = ['pending', 'accepted', 'rejected'];

  // Create exchanges between users in same locations
  const usersByLocation: Record<string, User[]> = {};

  for (const user of users) {
    const userData = SEED_USERS.find(u => u.email === user.email)!;
    const location = userData.location;
    if (!usersByLocation[location]) {
      usersByLocation[location] = [];
    }
    usersByLocation[location].push(user);
  }

  // Create exchanges within each location
  for (const [location, locationUsers] of Object.entries(usersByLocation)) {
    const locationData = LOCATIONS[location as keyof typeof LOCATIONS];

    for (let i = 0; i < locationUsers.length; i++) {
      const sender = locationUsers[i];

      // Each user exchanges with 3-8 other users in their location
      const numExchanges = randomNumber(3, 8);
      const potentialReceivers = locationUsers.filter(u => u.id !== sender.id);
      const receivers = shuffle(potentialReceivers).slice(0, Math.min(numExchanges, potentialReceivers.length));

      for (const receiver of receivers) {
        const exchange = await storage.createContactExchange({
          senderId: sender.id,
          receiverId: receiver.id,
          method: randomItem(methods),
          latitude: locationData.latitude + (Math.random() - 0.5) * 0.1, // Small variation
          longitude: locationData.longitude + (Math.random() - 0.5) * 0.1,
          locationName: locationData.name,
          metAt: randomPastDate(90).toISOString(),
          status: Math.random() > 0.2 ? 'accepted' : randomItem(statuses), // 80% accepted
        });
        exchanges.push(exchange);
      }
    }
  }

  console.log(`✅ Created ${exchanges.length} contact exchanges`);
  return exchanges;
}

/**
 * Seed connections from accepted exchanges
 */
async function seedConnections(exchanges: ContactExchange[]): Promise<Connection[]> {
  console.log('\n👥 Seeding connections...');
  const connections: Connection[] = [];
  const tags = ['colleague', 'friend', 'client', 'mentor', 'investor', 'partner'];

  const acceptedExchanges = exchanges.filter(e => e.status === 'accepted');

  for (const exchange of acceptedExchanges) {
    // Create bidirectional connections
    const numTags = randomNumber(0, 2);
    const selectedTags = shuffle(tags).slice(0, numTags);
    const strengthScore = randomNumber(40, 100);

    // Connection from sender to receiver
    const connection1 = await storage.createConnection({
      userId: exchange.senderId,
      connectedUserId: exchange.receiverId,
      exchangeId: exchange.id,
      relationshipNote: Math.random() > 0.5 ? 'Great conversation!' : null,
      tags: selectedTags,
      strengthScore,
    });
    connections.push(connection1);

    // Connection from receiver to sender
    const connection2 = await storage.createConnection({
      userId: exchange.receiverId,
      connectedUserId: exchange.senderId,
      exchangeId: exchange.id,
      relationshipNote: Math.random() > 0.5 ? 'Looking forward to working together!' : null,
      tags: selectedTags,
      strengthScore,
    });
    connections.push(connection2);
  }

  console.log(`✅ Created ${connections.length} connections`);
  return connections;
}

/**
 * Seed FizzCoin transactions
 */
async function seedTransactions(users: User[], exchanges: ContactExchange[]): Promise<void> {
  console.log('\n💸 Seeding FizzCoin transactions...');
  let transactionCount = 0;

  for (const user of users) {
    // Welcome bonus
    await storage.createTransaction({
      userId: user.id,
      amount: 100,
      transactionType: 'bonus',
      metadata: { reason: 'welcome_bonus' },
    });
    transactionCount++;

    // Exchange rewards
    const userExchanges = exchanges.filter(
      e => (e.senderId === user.id || e.receiverId === user.id) && e.status === 'accepted'
    );

    for (const exchange of userExchanges.slice(0, randomNumber(3, 10))) {
      await storage.createTransaction({
        userId: user.id,
        amount: 50,
        transactionType: 'exchange',
        metadata: { exchangeId: exchange.id },
      });
      transactionCount++;
    }

    // Random referral bonuses
    if (Math.random() > 0.7) {
      await storage.createTransaction({
        userId: user.id,
        amount: 200,
        transactionType: 'referral',
        metadata: { referredEmail: 'friend@example.com' },
      });
      transactionCount++;
    }
  }

  console.log(`✅ Created ${transactionCount} transactions`);
}

/**
 * Seed introductions
 */
async function seedIntroductions(users: User[]): Promise<Introduction[]> {
  console.log('\n🎯 Seeding introductions...');
  const introductions: Introduction[] = [];
  const statuses: Array<'pending' | 'completed' | 'declined'> = ['pending', 'completed', 'declined'];

  // Super connectors (users with many connections) make introductions
  const superConnectors = shuffle(users).slice(0, 10);

  for (const introducer of superConnectors) {
    const numIntros = randomNumber(1, 3);

    for (let i = 0; i < numIntros; i++) {
      const potentialPeople = users.filter(u => u.id !== introducer.id);
      const [personA, personB] = shuffle(potentialPeople).slice(0, 2);

      const status = randomItem(statuses) as 'pending' | 'completed' | 'declined';
      const intro = await storage.createIntroduction({
        introducerId: introducer.id,
        personAId: personA.id,
        personBId: personB.id,
        context: `I think you two should connect - you're both working on similar things!`,
        status,
        fizzcoinReward: status === 'completed' ? 150 : 0,
      });
      introductions.push(intro);

      // Award FizzCoins if completed
      if (status === 'completed') {
        await storage.createTransaction({
          userId: introducer.id,
          amount: 150,
          transactionType: 'introduction',
          metadata: { introductionId: intro.id },
        });
      }
    }
  }

  console.log(`✅ Created ${introductions.length} introductions`);
  return introductions;
}

/**
 * Seed events
 */
async function seedEvents(users: User[]): Promise<Event[]> {
  console.log('\n📅 Seeding events...');
  const events: Event[] = [];

  const eventData = [
    {
      name: 'SF Tech Networking Mixer',
      description: 'Monthly networking event for tech professionals in San Francisco. Connect with engineers, designers, PMs, and founders.',
      location: 'WeWork SoMa, San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      isExclusive: false,
      minFizzcoinRequired: 0,
      creatorEmail: 'alex.chen@google.com',
    },
    {
      name: 'Crypto Summit 2025',
      description: 'Annual cryptocurrency and blockchain conference. Featuring talks from industry leaders and networking opportunities.',
      location: 'Moscone Center, San Francisco',
      latitude: 37.7840,
      longitude: -122.4015,
      isExclusive: true,
      minFizzcoinRequired: 500,
      creatorEmail: 'james.lee@coinbase.com',
    },
    {
      name: 'Product Manager Roundtable',
      description: 'Intimate discussion on product strategy and best practices. Limited to 20 attendees.',
      location: 'Meta HQ, Menlo Park',
      latitude: 37.4848,
      longitude: -122.1488,
      isExclusive: true,
      minFizzcoinRequired: 300,
      creatorEmail: 'sarah.johnson@meta.com',
    },
    {
      name: 'NYC Startup Pitch Night',
      description: 'Watch early-stage startups pitch to investors. Network with founders and VCs.',
      location: 'WeWork Bryant Park, New York',
      latitude: 40.7549,
      longitude: -73.9840,
      isExclusive: false,
      minFizzcoinRequired: 0,
      creatorEmail: 'david.kim@ycombinator.com',
    },
    {
      name: 'Miami Art & Tech Fusion',
      description: 'Where art meets technology. Featuring NFT artists and tech innovators.',
      location: 'Wynwood Walls, Miami',
      latitude: 25.8010,
      longitude: -80.1995,
      isExclusive: true,
      minFizzcoinRequired: 400,
      creatorEmail: 'sophia.lopez@artbasel.com',
    },
  ];

  for (const data of eventData) {
    const creator = users.find(u => u.email === data.creatorEmail)!;
    const startDate = randomFutureDate(60);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + randomNumber(2, 6));

    const event = await storage.createEvent({
      name: data.name,
      description: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isExclusive: data.isExclusive,
      minFizzcoinRequired: data.minFizzcoinRequired,
      createdBy: creator.id,
    });
    events.push(event);
  }

  console.log(`✅ Created ${events.length} events`);
  return events;
}

/**
 * Seed event attendees
 */
async function seedEventAttendees(events: Event[], users: User[], wallets: FizzCoinWallet[]): Promise<void> {
  console.log('\n🎟️  Seeding event attendees...');
  let attendeeCount = 0;

  for (const event of events) {
    // Filter users who have enough FizzCoins and are in the same location
    const eligibleUsers = users.filter(user => {
      const wallet = wallets.find(w => w.userId === user.id);
      const hasEnoughCoins = !event.isExclusive || (wallet && wallet.balance >= event.minFizzcoinRequired);

      // Simple location check - same city
      const userData = SEED_USERS.find(u => u.email === user.email);
      const eventLocation = event.location?.toLowerCase() || '';
      const userLocation = userData?.location.toLowerCase() || '';
      const isSameLocation = eventLocation.includes(userLocation) || !event.isExclusive;

      return hasEnoughCoins && isSameLocation;
    });

    // Each event has 5-15 attendees
    const numAttendees = Math.min(randomNumber(5, 15), eligibleUsers.length);
    const attendees = shuffle(eligibleUsers).slice(0, numAttendees);

    for (const user of attendees) {
      const checkInAt = Math.random() > 0.3 ? randomPastDate(7).toISOString() : null;

      await storage.createEventAttendee({
        eventId: event.id,
        userId: user.id,
        checkInAt,
      });
      attendeeCount++;
    }
  }

  console.log(`✅ Created ${attendeeCount} event attendees`);
}

/**
 * Seed badges
 */
async function seedBadges(users: User[], connections: Connection[]): Promise<Badge[]> {
  console.log('\n🏆 Seeding badges...');
  const badges: Badge[] = [];

  // Early adopters (first 10 users)
  for (const user of users.slice(0, 10)) {
    const badge = await storage.createBadge({
      userId: user.id,
      badgeType: 'early_adopter',
      earnedAt: randomPastDate(120).toISOString(),
    });
    badges.push(badge);
  }

  // Super connectors (users with 10+ connections)
  const connectionCounts: Record<number, number> = {};
  for (const connection of connections) {
    connectionCounts[connection.userId] = (connectionCounts[connection.userId] || 0) + 1;
  }

  for (const [userIdStr, count] of Object.entries(connectionCounts)) {
    const userId = parseInt(userIdStr);
    if (count >= 10) {
      const badge = await storage.createBadge({
        userId,
        badgeType: 'super_connector',
        earnedAt: randomPastDate(60).toISOString(),
      });
      badges.push(badge);
    }
  }

  // Top earners (users with verified status)
  const verifiedUsers = users.filter(u => u.role === 'verified');
  for (const user of shuffle(verifiedUsers).slice(0, 5)) {
    const badge = await storage.createBadge({
      userId: user.id,
      badgeType: 'top_earner',
      earnedAt: randomPastDate(30).toISOString(),
    });
    badges.push(badge);
  }

  // Verified badge for verified users
  for (const user of verifiedUsers) {
    const badge = await storage.createBadge({
      userId: user.id,
      badgeType: 'verified',
      earnedAt: randomPastDate(90).toISOString(),
    });
    badges.push(badge);
  }

  console.log(`✅ Created ${badges.length} badges`);
  return badges;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seed() {
  console.log('🌱 Starting FizzCard database seeding...\n');
  console.log('================================================');

  try {
    // Seed in order of dependencies
    const users = await seedUsers();
    const fizzCards = await seedFizzCards(users);
    await seedSocialLinks(fizzCards);
    const wallets = await seedWallets(users);
    const exchanges = await seedContactExchanges(users);
    const connections = await seedConnections(exchanges);
    await seedTransactions(users, exchanges);
    await seedIntroductions(users);
    const events = await seedEvents(users);
    await seedEventAttendees(events, users, wallets);
    await seedBadges(users, connections);

    console.log('\n================================================');
    console.log('✅ Database seeding completed successfully!\n');
    console.log('Summary:');
    console.log(`  - ${users.length} users`);
    console.log(`  - ${fizzCards.length} FizzCards`);
    console.log(`  - ${wallets.length} wallets`);
    console.log(`  - ${exchanges.length} contact exchanges`);
    console.log(`  - ${connections.length} connections`);
    console.log(`  - ${events.length} events`);
    console.log('\n💡 You can now log in with any seeded user:');
    console.log('   Email: alex.chen@google.com');
    console.log('   Password: password123');
    console.log('\n   Or use admin account:');
    console.log('   Email: admin@fizzcard.app');
    console.log('   Password: admin123\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the seed function
seed();
