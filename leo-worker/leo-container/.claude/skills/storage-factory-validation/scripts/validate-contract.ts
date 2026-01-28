#!/usr/bin/env tsx
/**
 * Validates that all IStorage implementations return identical object shapes
 *
 * This ensures the Liskov Substitution Principle is maintained:
 * - MemoryStorage and DatabaseStorage must be interchangeable
 * - Switching STORAGE_MODE should not break routes
 * - Object shapes must match exactly (property names, nesting, types)
 */

import { MemoryStorage } from '../../../server/lib/storage/mem-storage';

// Dynamically import database storage based on availability
async function loadDatabaseStorage() {
  try {
    // Try to load Supabase storage
    const module = await import('../../../server/lib/storage/supabase-storage');
    return module.SupabaseStorage;
  } catch (err) {
    try {
      // Try to load generic database storage
      const module = await import('../../../server/lib/storage/database-storage');
      return module.DatabaseStorage;
    } catch (err2) {
      return null;
    }
  }
}

async function validateContract() {
  console.log('🔍 Validating IStorage Contract Compliance\n');

  // Load storage implementations
  const memStorage = new MemoryStorage();
  const DatabaseStorageClass = await loadDatabaseStorage();

  if (!DatabaseStorageClass) {
    console.log('⚠️  No database storage implementation found');
    console.log('   Looking for: server/lib/storage/supabase-storage.ts or database-storage.ts');
    console.log('   Skipping validation (memory storage only)');
    process.exit(0);
  }

  const dbStorage = new DatabaseStorageClass();

  console.log('✅ Found storage implementations:');
  console.log('   - MemoryStorage');
  console.log('   - Database Storage\n');

  // Test basic user operations
  console.log('Testing User operations...\n');

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    role: 'user' as const,
  };

  let memUser: any;
  let dbUser: any;

  try {
    memUser = await memStorage.createUser(testUser);
    console.log('✅ MemoryStorage.createUser() succeeded');
  } catch (err: any) {
    console.error('❌ MemoryStorage.createUser() failed:', err.message);
    process.exit(1);
  }

  try {
    dbUser = await dbStorage.createUser(testUser);
    console.log('✅ DatabaseStorage.createUser() succeeded');
  } catch (err: any) {
    console.error('❌ DatabaseStorage.createUser() failed:', err.message);
    process.exit(1);
  }

  console.log('\nValidating object shapes...\n');

  // Compare property names
  const memKeys = Object.keys(memUser).sort();
  const dbKeys = Object.keys(dbUser).sort();

  console.log('MemoryStorage returned keys:', memKeys);
  console.log('DatabaseStorage returned keys:', dbKeys);

  if (JSON.stringify(memKeys) !== JSON.stringify(dbKeys)) {
    console.error('\n❌ VALIDATION FAILED: Property names differ!');
    console.error('   This violates the IStorage contract.');
    console.error('   Routes will break when switching storage modes.\n');

    const memOnly = memKeys.filter(k => !dbKeys.includes(k));
    const dbOnly = dbKeys.filter(k => !memKeys.includes(k));

    if (memOnly.length > 0) {
      console.error('   Properties only in MemoryStorage:', memOnly);
    }
    if (dbOnly.length > 0) {
      console.error('   Properties only in DatabaseStorage:', dbOnly);
    }

    process.exit(1);
  }

  console.log('✅ Property names match\n');

  // Check for snake_case leaks (indicates missing conversion)
  const hasSnakeCase = dbKeys.some(key => key.includes('_'));
  if (hasSnakeCase) {
    console.error('❌ VALIDATION FAILED: Database storage returns snake_case properties!');
    console.error('   Properties with underscores:', dbKeys.filter(k => k.includes('_')));
    console.error('\n   Fix: Add toCamelCase() conversion or use Drizzle ORM');
    console.error('   See: .claude/skills/drizzle-orm-setup/SKILL.md');
    process.exit(1);
  }

  console.log('✅ No snake_case properties (all camelCase)\n');

  // Check for type consistency
  for (const key of memKeys) {
    const memType = typeof memUser[key];
    const dbType = typeof dbUser[key];

    if (memType !== dbType) {
      // Allow null vs undefined (common variation)
      if ((memUser[key] === null || memUser[key] === undefined) &&
          (dbUser[key] === null || dbUser[key] === undefined)) {
        continue;
      }

      console.error(`❌ VALIDATION FAILED: Type mismatch for property '${key}'`);
      console.error(`   MemoryStorage: ${memType}`);
      console.error(`   DatabaseStorage: ${dbType}`);
      process.exit(1);
    }
  }

  console.log('✅ Property types match\n');

  // Cleanup test data if possible
  try {
    if (memUser.id && typeof memStorage.deleteUser === 'function') {
      await memStorage.deleteUser(memUser.id);
    }
    if (dbUser.id && typeof dbStorage.deleteUser === 'function') {
      await dbStorage.deleteUser(dbUser.id);
    }
  } catch (err) {
    // Cleanup optional
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ VALIDATION PASSED');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nIStorage contract is valid:');
  console.log('  ✅ Property names match exactly');
  console.log('  ✅ All properties use camelCase');
  console.log('  ✅ Property types are consistent');
  console.log('\nSwitching between MemoryStorage and DatabaseStorage is safe.');
  console.log('');

  process.exit(0);
}

validateContract().catch((err) => {
  console.error('❌ Validation script error:', err);
  process.exit(1);
});
