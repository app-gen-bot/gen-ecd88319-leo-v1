/**
 * Test Script: Verify Supabase IPv4 Pooler Connection with Drizzle ORM
 *
 * This script proves that the updated supabase-project-setup skill works correctly
 * by testing the actual connection string format and Drizzle ORM integration.
 *
 * Usage:
 *   1. Get connection details from a Supabase project (naijadomot)
 *   2. Run: npx tsx test-pooler-connection.ts
 *   3. Verify successful connection and query
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Test with naijadomot project (already exists)
const PROJECT_REF = 'ieprzpxcfewpcospuwzg';
const DB_PASSWORD = 'NaijaDomot2025_Secure!';
const REGION = 'us-east-1';

// Test both connection formats
const directConnection = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@db.${PROJECT_REF}.supabase.co:5432/postgres`;

const poolerConnection = `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(DB_PASSWORD)}@aws-0-${REGION}.pooler.supabase.com:6543/postgres?pgbouncer=true`;

// Define a simple schema for testing
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
});

async function testConnection(connectionString: string, label: string): Promise<boolean> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${label}`);
  console.log(`${'='.repeat(80)}`);

  try {
    // Create client with proper configuration
    const isPrepare = !connectionString.includes('6543');
    const client = postgres(connectionString, {
      ssl: 'require',
      prepare: isPrepare ? undefined : false,  // false for pooler, undefined for direct
      connection: {
        application_name: 'pooler-connection-test',
      },
      max: 1,  // Single connection for testing
      idle_timeout: 10,
      connect_timeout: 30,
    });

    // Create Drizzle instance
    const db = drizzle(client, { schema: { users } });

    console.log('✅ Client created successfully');

    // Try a simple query
    console.log('🔍 Testing database connection with SELECT query...');
    const result = await db.select().from(users).limit(1);

    console.log(`✅ Query successful! Found ${result.length} user(s)`);

    // Try connection info
    const info = await client`SELECT version(), current_database()`;
    console.log(`\n📊 Database Info:`);
    console.log(`   Version: ${info[0].version.split(' ')[0]} ${info[0].version.split(' ')[1]}`);
    console.log(`   Database: ${info[0].current_database}`);

    // Cleanup
    await client.end();
    console.log('\n✅ Connection closed successfully');

    return true;
  } catch (error: any) {
    console.error(`\n❌ Connection failed:`);
    console.error(`   Error: ${error.message}`);
    if (error.code) console.error(`   Code: ${error.code}`);
    if (error.cause) console.error(`   Cause: ${error.cause.message}`);
    return false;
  }
}

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('Supabase Pooler Connection Test');
  console.log('Testing IPv4 Pooler vs Direct IPv6 Connection');
  console.log('='.repeat(80));

  console.log(`\n📝 Test Configuration:`);
  console.log(`   Project: ${PROJECT_REF}`);
  console.log(`   Region: ${REGION}`);
  console.log(`   Drizzle ORM: postgres-js driver`);

  // Test 1: IPv4 Pooler (RECOMMENDED)
  const poolerSuccess = await testConnection(poolerConnection, '🚀 IPv4 Transaction Pooler (RECOMMENDED)');

  // Test 2: Direct Connection (for comparison)
  const directSuccess = await testConnection(directConnection, '⚠️  Direct IPv6 Connection (NOT RECOMMENDED)');

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✅ IPv4 Pooler (port 6543): ${poolerSuccess ? 'SUCCESS' : 'FAILED'}`);
  console.log(`${directSuccess ? '✅' : '❌'} Direct IPv6 (port 5432): ${directSuccess ? 'SUCCESS' : 'FAILED'}`);

  if (poolerSuccess) {
    console.log(`\n🎉 PROOF: IPv4 Pooler Connection Works!`);
    console.log(`\n📋 Recommended Connection String:`);
    console.log(`   DATABASE_URL=${poolerConnection}`);
    console.log(`\n📋 Required db.ts Configuration:`);
    console.log(`   prepare: false  // CRITICAL for transaction pooler`);
  } else {
    console.log(`\n❌ Pooler connection failed - check credentials and network`);
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

main().catch(console.error);
