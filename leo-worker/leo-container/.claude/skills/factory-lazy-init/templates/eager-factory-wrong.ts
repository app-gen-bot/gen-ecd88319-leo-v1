/**
 * ❌ WRONG: Eager Factory Pattern (Anti-Pattern)
 *
 * This template shows what NOT to do. This pattern causes the factory to
 * execute immediately when the module loads, BEFORE dotenv has loaded
 * environment variables.
 *
 * DO NOT USE THIS PATTERN!
 */

import type { IStorage } from './types';
import { createMemoryStorage } from './mem-storage';
import { createDatabaseStorage } from './database-storage';

function createStorage(): IStorage {
  // ❌ BAD: Reads process.env when createStorage() is called
  const mode = process.env.STORAGE_MODE || 'memory';

  console.log(`[Storage Factory] Initializing in ${mode} mode`);

  switch (mode) {
    case 'database':
      return createDatabaseStorage();
    case 'memory':
    default:
      return createMemoryStorage();
  }
}

// ❌ EAGER INITIALIZATION: Executes createStorage() immediately!
export const storage = createStorage();

/**
 * What goes wrong:
 *
 * 1. server/index.ts imports this module:
 *    import { storage } from './lib/storage/factory';
 *    import 'dotenv/config';
 *
 * 2. Due to module hoisting, imports are reordered:
 *    import 'dotenv/config';           // You think this runs first
 *    import { storage } from '...';    // But this actually runs first!
 *
 * 3. When storage module loads:
 *    - createStorage() executes IMMEDIATELY
 *    - process.env.STORAGE_MODE is undefined (dotenv hasn't run yet)
 *    - mode = 'memory' (default)
 *    - Returns MemoryStorage
 *
 * 4. Then dotenv/config loads:
 *    - process.env.STORAGE_MODE = 'database'
 *    - TOO LATE! Factory already initialized with MemoryStorage
 *
 * Result: Always uses memory storage, ignores .env file!
 */

// ========================================
// Other Anti-Patterns to Avoid
// ========================================

// ❌ Anti-Pattern 2: Top-level ternary
export const storage2 =
  process.env.STORAGE_MODE === 'database'
    ? createDatabaseStorage()  // Reads env NOW
    : createMemoryStorage();

// ❌ Anti-Pattern 3: IIFE (Immediately Invoked Function Expression)
export const storage3 = (() => {
  const mode = process.env.STORAGE_MODE;  // Reads env NOW
  return mode === 'database'
    ? createDatabaseStorage()
    : createMemoryStorage();
})();  // Function executes immediately!

// ❌ Anti-Pattern 4: Class with static initialization
class StorageFactory {
  private static instance = new StorageFactory();  // Constructs NOW

  private storage: IStorage;

  private constructor() {
    // Reads env NOW (before dotenv)
    this.storage = createStorage();
  }

  static getInstance() {
    return this.instance.storage;
  }
}
export const storage4 = StorageFactory.getInstance();

// ❌ Anti-Pattern 5: Module-level environment variable read
const MODE = process.env.STORAGE_MODE || 'memory';  // Reads NOW

function createStorageWithCachedMode(): IStorage {
  // Uses cached MODE (wrong value, read before dotenv)
  return MODE === 'database'
    ? createDatabaseStorage()
    : createMemoryStorage();
}
export const storage5 = createStorageWithCachedMode();

/**
 * FIX FOR ALL OF THESE:
 * Use the lazy Proxy pattern shown in lazy-factory-correct.ts
 */
