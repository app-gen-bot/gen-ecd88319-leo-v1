import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuration schema
const ConfigSchema = z.object({
  supabase: z.object({
    accessToken: z.string().min(1, 'SUPABASE_ACCESS_TOKEN is required'),
    organizationId: z.string().optional(),
    apiUrl: z.string().default('https://api.supabase.com'),
  }),
  railway: z.object({
    apiToken: z.string().min(1, 'RAILWAY_API_TOKEN is required'),
    apiUrl: z.string().default('https://backboard.railway.com/graphql/v2'),
  }),
  deployment: z.object({
    region: z.string().default('us-east-1'),
    plan: z.string().default('free'),
    instanceSize: z.string().default('micro'),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

// Load and validate configuration
export function loadConfig(): Config {
  try {
    const config = ConfigSchema.parse({
      supabase: {
        accessToken: process.env.SUPABASE_ACCESS_TOKEN || '',
        organizationId: process.env.SUPABASE_ORG_ID,
        apiUrl: process.env.SUPABASE_API_URL,
      },
      railway: {
        apiToken: process.env.RAILWAY_API_TOKEN || '',
        apiUrl: process.env.RAILWAY_API_URL,
      },
      deployment: {
        region: process.env.DEPLOYMENT_REGION,
        plan: process.env.DEPLOYMENT_PLAN,
        instanceSize: process.env.DEPLOYMENT_INSTANCE_SIZE,
      },
    });

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n📝 Please ensure the following environment variables are set in the root .env file:');
      console.error('   - SUPABASE_ACCESS_TOKEN: Get from https://supabase.com/dashboard/account/tokens');
      console.error('   - RAILWAY_API_TOKEN: Get from https://railway.app/account/tokens');
      process.exit(1);
    }
    throw error;
  }
}

// Generate a secure password
export function generatePassword(length = 24): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let password = '';
  
  // Simple but secure fallback using Math.random
  for (let i = 0; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  return password;
}

// Project naming utilities
export function generateProjectName(baseName: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  return `${baseName}-${timestamp}`;
}

export function sanitizeProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}