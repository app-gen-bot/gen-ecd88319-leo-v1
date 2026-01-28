import { GenerationRequest, InsertGenerationRequest, UpdateGenerationRequest, IterationSnapshot, InsertIterationSnapshot } from '../../../shared/schema.zod';
import { databaseStorage } from './database-storage';

// User app summary for Resume dropdown
// Only includes completed generations with github_url (required for resume)
// Contains all fields needed to populate a resume generation request
export interface UserAppSummary {
  id: number;
  appId: string;
  appName: string;
  githubUrl: string;  // Guaranteed non-null (only resumable apps returned)
  deploymentUrl: string | null;  // Fly.io URL for resume
  lastSessionId: string | null;
  updatedAt: string;
  status: string;
}

export interface IStorage {
  // Generation request operations
  getGenerationRequests(userId: string): Promise<GenerationRequest[]>; // UUID from Supabase Auth
  getGenerationRequestById(id: number): Promise<GenerationRequest | null>;
  createGenerationRequest(request: InsertGenerationRequest): Promise<GenerationRequest>;
  updateGenerationRequest(id: number, updates: UpdateGenerationRequest): Promise<GenerationRequest | null>;

  // User apps operations (for Resume)
  getUserApps(userId: string): Promise<UserAppSummary[]>;

  // Iteration snapshot operations
  getIterationSnapshots(generationRequestId: number): Promise<IterationSnapshot[]>;
  getIterationSnapshot(id: number): Promise<IterationSnapshot | null>;
  createIterationSnapshot(snapshot: InsertIterationSnapshot): Promise<IterationSnapshot>;
  deleteIterationSnapshot(id: number): Promise<boolean>;
}

export function createStorage(): IStorage {
  console.log('💾 Storage Mode: DATABASE');
  return databaseStorage;
}

export const storage = createStorage();
