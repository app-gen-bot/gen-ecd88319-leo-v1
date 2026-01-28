/**
 * Supabase Pool Manager for Leo SaaS
 *
 * Supports two modes configured via .env:
 *
 * POOLED MODE (for cost-effective development):
 *   - Pre-created Supabase projects reused across generations
 *   - DatabaseResetManager cleans between uses
 *   - Credentials passed directly to container
 *
 * PER-APP MODE (for isolated development):
 *   - Agent creates new Supabase project per generation
 *   - Uses SUPABASE_ACCESS_TOKEN with Supabase MCP tool
 *   - Projects persist after generation
 */

export interface SupabasePoolProject {
  index: number;
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  databaseUrl: string;
}

export interface SupabaseCredentials {
  // For pooled mode - direct credentials
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  databaseUrl?: string;

  // For per-app mode - access token for agent to create project
  supabaseAccessToken?: string;
}

export type SupabaseMode = 'pooled' | 'per-app';

export class SupabasePoolManager {
  private mode: SupabaseMode;
  private pool: SupabasePoolProject[] = [];
  private leases: Map<string, number> = new Map(); // generationId -> poolIndex
  private accessToken?: string;

  constructor() {
    // Determine mode from environment
    const modeEnv = process.env.SUPABASE_MODE?.toLowerCase();

    if (modeEnv === 'per-app') {
      this.mode = 'per-app';
      this.accessToken = process.env.SUPABASE_ACCESS_TOKEN;

      if (!this.accessToken) {
        console.warn('⚠️  SUPABASE_MODE=per-app but SUPABASE_ACCESS_TOKEN not set');
      } else {
        console.log('🗄️  Supabase mode: per-app (agent creates projects)');
      }
    } else {
      // Default to pooled mode
      this.mode = 'pooled';
      this.loadPool();
    }
  }

  /**
   * Load pool projects from environment variables
   */
  private loadPool(): void {
    const poolSize = parseInt(process.env.SUPABASE_POOL_SIZE || '0', 10);

    if (poolSize === 0) {
      // Try to detect pool projects from env vars
      let index = 1;
      while (process.env[`SUPABASE_POOL_${index}_URL`]) {
        this.loadPoolProject(index);
        index++;
      }
    } else {
      // Load specified number of pool projects
      for (let i = 1; i <= poolSize; i++) {
        this.loadPoolProject(i);
      }
    }

    if (this.pool.length === 0) {
      console.warn('⚠️  No Supabase pool projects configured');
      console.warn('   Set SUPABASE_POOL_1_URL, SUPABASE_POOL_1_ANON_KEY, etc. in .env');
    } else {
      console.log(`🗄️  Supabase mode: pooled (${this.pool.length} projects available)`);
      this.pool.forEach((p, i) => {
        console.log(`   Pool ${i + 1}: ${p.url}`);
      });
    }
  }

  /**
   * Load a single pool project from environment
   */
  private loadPoolProject(index: number): void {
    const prefix = `SUPABASE_POOL_${index}_`;
    const url = process.env[`${prefix}URL`];
    const anonKey = process.env[`${prefix}ANON_KEY`];
    const serviceRoleKey = process.env[`${prefix}SERVICE_ROLE_KEY`];
    const databaseUrl = process.env[`${prefix}DATABASE_URL`];

    if (url && anonKey && serviceRoleKey && databaseUrl) {
      this.pool.push({
        index,
        url,
        anonKey,
        serviceRoleKey,
        databaseUrl,
      });
    } else {
      const missing = [];
      if (!url) missing.push('URL');
      if (!anonKey) missing.push('ANON_KEY');
      if (!serviceRoleKey) missing.push('SERVICE_ROLE_KEY');
      if (!databaseUrl) missing.push('DATABASE_URL');
      console.warn(`⚠️  Pool project ${index} incomplete, missing: ${missing.join(', ')}`);
    }
  }

  /**
   * Get current mode
   */
  getMode(): SupabaseMode {
    return this.mode;
  }

  /**
   * Get pool size (0 for per-app mode)
   */
  getPoolSize(): number {
    return this.pool.length;
  }

  /**
   * Get number of available (unleased) pool projects
   */
  getAvailableCount(): number {
    return this.pool.length - this.leases.size;
  }

  /**
   * Acquire credentials for a generation
   *
   * In pooled mode: Returns credentials from an available pool project
   * In per-app mode: Returns access token for agent to create project
   *
   * @param generationId Unique generation identifier
   * @returns Credentials to pass to container
   * @throws Error if no pool projects available (pooled mode only)
   */
  acquire(generationId: string): SupabaseCredentials {
    if (this.mode === 'per-app') {
      // Per-app mode: agent creates project, just pass token
      console.log(`🗄️  Per-app mode: generation ${generationId.substring(0, 8)} will create its own project`);
      return {
        supabaseAccessToken: this.accessToken,
      };
    }

    // Pooled mode: allocate from pool
    const availableIndex = this.findAvailableProject();

    if (availableIndex === -1) {
      const inUse = Array.from(this.leases.entries())
        .map(([genId, idx]) => `pool-${idx + 1}→${genId.substring(0, 8)}`)
        .join(', ');
      throw new Error(
        `No Supabase pool projects available. ` +
        `All ${this.pool.length} projects in use: ${inUse}. ` +
        `Add more SUPABASE_POOL_N_* entries to .env or wait for a generation to complete.`
      );
    }

    const project = this.pool[availableIndex];
    this.leases.set(generationId, availableIndex);

    console.log(`🗄️  Allocated pool project ${availableIndex + 1} to generation ${generationId.substring(0, 8)}`);
    console.log(`   URL: ${project.url}`);
    console.log(`   Available: ${this.getAvailableCount()}/${this.pool.length}`);

    return {
      supabaseUrl: project.url,
      supabaseAnonKey: project.anonKey,
      supabaseServiceRoleKey: project.serviceRoleKey,
      databaseUrl: project.databaseUrl,
    };
  }

  /**
   * Release a pool project back to the pool
   *
   * @param generationId Generation identifier
   */
  release(generationId: string): void {
    if (this.mode === 'per-app') {
      // Nothing to release in per-app mode
      return;
    }

    const poolIndex = this.leases.get(generationId);
    if (poolIndex !== undefined) {
      this.leases.delete(generationId);
      console.log(`🗄️  Released pool project ${poolIndex + 1} from generation ${generationId.substring(0, 8)}`);
      console.log(`   Available: ${this.getAvailableCount()}/${this.pool.length}`);
    }
  }

  /**
   * Find an available (unleased) pool project
   */
  private findAvailableProject(): number {
    const leasedIndices = new Set(this.leases.values());

    for (let i = 0; i < this.pool.length; i++) {
      if (!leasedIndices.has(i)) {
        return i;
      }
    }

    return -1; // No available projects
  }

  /**
   * Check if a generation has an active lease
   */
  hasLease(generationId: string): boolean {
    return this.leases.has(generationId);
  }

  /**
   * Get lease info for a generation
   */
  getLeaseInfo(generationId: string): SupabasePoolProject | null {
    const poolIndex = this.leases.get(generationId);
    if (poolIndex === undefined) return null;
    return this.pool[poolIndex];
  }
}

// Singleton instance
let instance: SupabasePoolManager | null = null;

export function getSupabasePoolManager(): SupabasePoolManager {
  if (!instance) {
    instance = new SupabasePoolManager();
  }
  return instance;
}
