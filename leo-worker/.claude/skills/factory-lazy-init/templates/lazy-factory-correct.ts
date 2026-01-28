/**
 * ✅ CORRECT: Lazy Factory Pattern
 *
 * This template shows the correct way to implement a factory that reads
 * environment variables. The factory only initializes when first accessed,
 * ensuring dotenv has loaded by that time.
 */

import type { IStorage } from './types';
import { createMemoryStorage } from './mem-storage';
import { createDatabaseStorage } from './database-storage';

// Step 1: Nullable instance variable (caches result after first access)
let instance: IStorage | null = null;

// Step 2: Private factory function (reads process.env inside function)
function createStorage(): IStorage {
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

// Step 3: Export lazy Proxy (delays createStorage() until first property access)
export const storage: IStorage = new Proxy({} as IStorage, {
  get(target, prop) {
    // Initialize on first access
    if (!instance) {
      instance = createStorage();
    }
    // Return property from real instance
    return instance[prop as keyof IStorage];
  }
}) as IStorage;

/**
 * How this works:
 *
 * 1. Module loads:
 *    - instance = null
 *    - Proxy object created (lightweight, no env vars read)
 *    - export storage = Proxy
 *
 * 2. dotenv/config loads:
 *    - process.env.STORAGE_MODE = 'database'
 *
 * 3. First HTTP request calls storage.getUser():
 *    - Proxy intercepts .getUser property access
 *    - instance is null, so call createStorage()
 *    - createStorage() reads process.env.STORAGE_MODE = 'database'
 *    - Returns DatabaseStorage instance
 *    - instance = DatabaseStorage (cached)
 *    - Return instance.getUser (the real method)
 *
 * 4. Subsequent calls:
 *    - Proxy intercepts property access
 *    - instance already exists (DatabaseStorage)
 *    - Return instance.method (no re-initialization)
 */
