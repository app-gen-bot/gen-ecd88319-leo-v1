/**
 * Create Test User Script
 *
 * Creates a user in Supabase Auth and their profile in the database.
 * Usage: npx tsx scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL_POOLING || process.env.DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !DATABASE_URL) {
  console.error('Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL');
  process.exit(1);
}

// Test user credentials
const TEST_EMAIL = 'jake@leo.dev';
const TEST_PASSWORD = 'Demo2026_';
const TEST_NAME = 'Jake';

async function createTestUser() {
  console.log('Creating test user...');
  console.log(`Email: ${TEST_EMAIL}`);
  console.log(`Password: ${TEST_PASSWORD}`);

  // Create Supabase admin client
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Create database connection
  const client = postgres(DATABASE_URL!, {
    ssl: 'require',
    prepare: false,
  });
  const db = drizzle(client, { schema });

  try {
    // Step 1: Check if user already exists in Supabase Auth
    console.log('\n1. Checking if user exists in Supabase Auth...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === TEST_EMAIL);

    let userId: string;

    if (existingUser) {
      console.log(`   User already exists in Auth: ${existingUser.id}`);
      userId = existingUser.id;

      // Update the password to ensure it matches
      console.log('   Updating password...');
      await supabase.auth.admin.updateUserById(userId, {
        password: TEST_PASSWORD,
      });
    } else {
      // Step 2: Create user in Supabase Auth
      console.log('   Creating user in Supabase Auth...');
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        console.error('Failed to create auth user:', authError.message);
        process.exit(1);
      }

      userId = authUser.user.id;
      console.log(`   Created Auth user: ${userId}`);
    }

    // Step 3: Check if profile exists
    console.log('\n2. Checking profile in database...');
    const existingProfile = await db.query.profiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.id, userId),
    });

    if (existingProfile) {
      console.log('   Profile already exists, updating...');
      await db.update(schema.profiles)
        .set({
          email: TEST_EMAIL,
          name: TEST_NAME,
          status: 'approved',
          role: 'admin', // Give admin access for testing
          creditsRemaining: 100,
          updatedAt: new Date(),
        })
        .where((builder: any) => builder.id.equals(userId));
      console.log('   Profile updated');
    } else {
      // Step 4: Create profile in database
      console.log('   Creating profile in database...');
      await db.insert(schema.profiles).values({
        id: userId,
        email: TEST_EMAIL,
        name: TEST_NAME,
        role: 'admin', // Give admin access for testing
        status: 'approved', // Pre-approve for testing
        creditsRemaining: 100, // Give some credits for testing
        creditsUsed: 0,
      });
      console.log('   Profile created');
    }

    console.log('\n✅ Test user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   User ID:  ${userId}`);
    console.log(`   Role:     admin`);
    console.log(`   Status:   approved`);
    console.log(`   Credits:  100`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();
