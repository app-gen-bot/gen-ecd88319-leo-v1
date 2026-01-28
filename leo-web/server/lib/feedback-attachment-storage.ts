/**
 * Feedback Attachment Storage Service
 *
 * Handles image uploads to Supabase Storage for feedback attachments.
 * Files are stored in the "feedback-attachments" bucket.
 *
 * Storage Path: feedback-attachments/{user_id}/{timestamp}-{filename}
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FEEDBACK_ATTACHMENT_LIMITS, FeedbackAttachment } from '../../shared/schema.zod';
import path from 'path';

const BUCKET_NAME = 'feedback-attachments';

// Lazy-initialize Supabase client
let storageClient: SupabaseClient | null = null;

/**
 * Reset the storage client to force re-initialization with current env vars
 * Call this after dotenv/config loading to ensure the correct keys are used
 */
export function resetStorageClient(): void {
  storageClient = null;
}

function getStorageClient(): SupabaseClient {
  if (!storageClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing Supabase credentials for feedback attachment storage. ' +
        'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    console.log(`📎 Feedback Attachment Storage: Using key ending with: ...${serviceRoleKey.slice(-20)}`);
    storageClient = createClient(supabaseUrl, serviceRoleKey);
    console.log('📎 Feedback Attachment Storage: Supabase client initialized');
  }
  return storageClient;
}

/**
 * Validates file type is an allowed image type
 */
export function isAllowedImageType(mimeType: string): boolean {
  return FEEDBACK_ATTACHMENT_LIMITS.ALLOWED_TYPES.includes(mimeType as any);
}

/**
 * Validates file extension is an allowed image extension
 */
export function isAllowedImageExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return FEEDBACK_ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.includes(ext as any);
}

/**
 * Get MIME type from file extension
 */
export function getImageMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Validates feedback attachment constraints
 */
export function validateFeedbackAttachment(
  file: { originalname: string; size: number; mimetype: string },
  existingCount: number = 0
): { valid: boolean; error?: string } {
  // Check file extension
  if (!isAllowedImageExtension(file.originalname)) {
    return {
      valid: false,
      error: `File type not allowed: ${path.extname(file.originalname)}. Allowed: ${FEEDBACK_ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check MIME type
  if (!isAllowedImageType(file.mimetype)) {
    return {
      valid: false,
      error: `MIME type not allowed: ${file.mimetype}. Allowed: ${FEEDBACK_ATTACHMENT_LIMITS.ALLOWED_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > FEEDBACK_ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${FEEDBACK_ATTACHMENT_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check total files count
  if (existingCount >= FEEDBACK_ATTACHMENT_LIMITS.MAX_FILES) {
    return {
      valid: false,
      error: `Too many files. Max: ${FEEDBACK_ATTACHMENT_LIMITS.MAX_FILES}`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a feedback attachment image to Supabase Storage
 * Returns the public URL for the uploaded image
 */
export async function uploadFeedbackAttachment(
  userId: string,
  file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }
): Promise<FeedbackAttachment> {
  const client = getStorageClient();

  // Sanitize filename (keep only alphanumeric, dots, dashes, underscores)
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${userId}/${timestamp}-${sanitizedName}`;

  console.log(`[Feedback Attachment Storage] Uploading: ${storagePath} (${file.size} bytes)`);

  // Upload to Supabase Storage
  const { error } = await client.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || getImageMimeType(file.originalname),
      upsert: false, // Don't overwrite - use unique timestamp
    });

  if (error) {
    console.error(`[Feedback Attachment Storage] Upload failed:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = client.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  console.log(`[Feedback Attachment Storage] Uploaded: ${storagePath}`);

  return {
    name: file.originalname,
    url: urlData.publicUrl,
    size: file.size,
    mimeType: file.mimetype || getImageMimeType(file.originalname),
  };
}

/**
 * Ensures the feedback-attachments bucket exists with public access
 */
export async function ensureFeedbackBucketExists(): Promise<void> {
  const client = getStorageClient();

  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`[Feedback Attachment Storage] Creating bucket: ${BUCKET_NAME}`);
    const { error } = await client.storage.createBucket(BUCKET_NAME, {
      public: true, // Public bucket for easy image access
      fileSizeLimit: FEEDBACK_ATTACHMENT_LIMITS.MAX_FILE_SIZE,
      allowedMimeTypes: [...FEEDBACK_ATTACHMENT_LIMITS.ALLOWED_TYPES],
    });

    if (error && !error.message.includes('already exists')) {
      console.error(`[Feedback Attachment Storage] Failed to create bucket:`, error);
      throw error;
    }
  }

  console.log(`[Feedback Attachment Storage] Bucket ready: ${BUCKET_NAME}`);
}
