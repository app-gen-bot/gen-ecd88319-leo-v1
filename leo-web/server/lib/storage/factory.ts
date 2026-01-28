import {
  GenerationRequest,
  InsertGenerationRequest,
  UpdateGenerationRequest,
  App,
  InsertApp,
  UpdateApp,
  UserAppSummary,
  UserFeedback,
  CreateFeedback,
} from '../../../shared/schema.zod';
import { databaseStorage } from './database-storage';

// Extended generation request with app info (for API responses that need denormalized data)
export interface GenerationRequestWithApp extends GenerationRequest {
  // Joined from apps table
  userId: string;
  appName: string;
  appUuid: string;
  githubUrl: string | null;
  deploymentUrl: string | null;
}

export interface IStorage {
  // App operations (stable app identity)
  getAppById(id: number): Promise<App | null>;
  getAppByUuid(appUuid: string): Promise<App | null>;
  getAppByUserAndName(userId: string, appName: string): Promise<App | null>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: number, updates: UpdateApp): Promise<App | null>;
  deleteApp(id: number): Promise<boolean>;

  // User apps operations (for Resume dropdown - queries apps table)
  getUserApps(userId: string): Promise<UserAppSummary[]>;

  // Generation request operations
  // Note: getGenerationRequests and getGenerationRequestById return GenerationRequestWithApp
  // which includes denormalized fields from apps table for API compatibility
  getGenerationRequests(userId: string): Promise<GenerationRequestWithApp[]>;
  getGenerationRequestById(id: number): Promise<GenerationRequestWithApp | null>;
  getGenerationsByAppId(appId: number): Promise<GenerationRequestWithApp[]>;
  createGenerationRequest(request: InsertGenerationRequest): Promise<GenerationRequest>;
  updateGenerationRequest(id: number, updates: UpdateGenerationRequest): Promise<GenerationRequest | null>;

  // Multi-generation support
  getActiveGenerations(userId: string): Promise<GenerationRequestWithApp[]>;
  countActiveGenerations(userId: string): Promise<number>;

  // Note: Iteration snapshot operations removed - table dropped

  // Feedback operations
  createFeedback(userId: string, feedback: CreateFeedback): Promise<UserFeedback>;
  getUserFeedback(userId: string): Promise<UserFeedback[]>;
}

export function createStorage(): IStorage {
  console.log('💾 Storage Mode: DATABASE');
  return databaseStorage;
}

export const storage = createStorage();
