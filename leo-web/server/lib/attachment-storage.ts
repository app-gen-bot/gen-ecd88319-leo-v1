/**
 * Attachment Storage Service
 *
 * Handles file uploads to Supabase Storage for generation attachments.
 * Files are stored in Leo SaaS's Supabase Storage bucket "attachments".
 *
 * Storage Path: attachments/{generation_id}/{filename}
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ATTACHMENT_LIMITS, AttachmentMetadata } from '../../shared/schema.zod';
import path from 'path';

const BUCKET_NAME = 'attachments';

// Lazy-initialize Supabase client using Leo SaaS credentials
let storageClient: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient {
  if (!storageClient) {
    // Use Leo SaaS Supabase for attachment storage
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing Supabase credentials for attachment storage. ' +
        'Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    storageClient = createClient(supabaseUrl, serviceRoleKey);
    console.log('📎 Attachment Storage: Supabase client initialized');
  }
  return storageClient;
}

/**
 * Validates file extension against allowed types
 */
export function isAllowedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.includes(ext as any);
}

/**
 * Get MIME type from file extension
 */
export function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.js': 'application/javascript',
    '.jsx': 'application/javascript',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.py': 'text/x-python',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Validates file constraints
 */
export function validateFile(
  file: { originalname: string; size: number },
  existingFiles: AttachmentMetadata[] = []
): { valid: boolean; error?: string } {
  // Check file extension
  if (!isAllowedFileType(file.originalname)) {
    return {
      valid: false,
      error: `File type not allowed: ${path.extname(file.originalname)}. Allowed: ${ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // Check individual file size
  if (file.size > ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max: ${ATTACHMENT_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check total files count
  if (existingFiles.length >= ATTACHMENT_LIMITS.MAX_FILES) {
    return {
      valid: false,
      error: `Too many files. Max: ${ATTACHMENT_LIMITS.MAX_FILES}`,
    };
  }

  // Check total size
  const existingSize = existingFiles.reduce((sum, f) => sum + f.size, 0);
  if (existingSize + file.size > ATTACHMENT_LIMITS.MAX_TOTAL_SIZE) {
    return {
      valid: false,
      error: `Total size would exceed limit. Max: ${ATTACHMENT_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadAttachment(
  generationId: number,
  file: {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
    size: number;
  }
): Promise<AttachmentMetadata> {
  const client = getStorageClient();

  // Sanitize filename (keep only alphanumeric, dots, dashes, underscores)
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const storagePath = `${generationId}/${sanitizedName}`;

  console.log(`[Attachment Storage] Uploading: ${storagePath} (${file.size} bytes)`);

  // Upload to Supabase Storage
  const { error } = await client.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || getMimeType(file.originalname),
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error(`[Attachment Storage] Upload failed:`, error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  console.log(`[Attachment Storage] Uploaded: ${storagePath}`);

  return {
    name: file.originalname,
    storagePath,
    size: file.size,
    mimeType: file.mimetype || getMimeType(file.originalname),
  };
}

/**
 * Deletes all attachments for a generation
 */
export async function deleteGenerationAttachments(generationId: number): Promise<void> {
  const client = getStorageClient();
  const folderPath = `${generationId}/`;

  console.log(`[Attachment Storage] Deleting all files in: ${folderPath}`);

  // List files in the generation folder
  const { data: files, error: listError } = await client.storage
    .from(BUCKET_NAME)
    .list(String(generationId));

  if (listError) {
    console.error(`[Attachment Storage] Failed to list files:`, listError);
    return;
  }

  if (!files || files.length === 0) {
    console.log(`[Attachment Storage] No files to delete`);
    return;
  }

  // Delete all files
  const filePaths = files.map(f => `${generationId}/${f.name}`);
  const { error: deleteError } = await client.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (deleteError) {
    console.error(`[Attachment Storage] Failed to delete files:`, deleteError);
  } else {
    console.log(`[Attachment Storage] Deleted ${filePaths.length} files`);
  }
}

/**
 * Gets a signed URL for downloading an attachment (valid for 1 hour)
 */
export async function getAttachmentUrl(storagePath: string): Promise<string | null> {
  const client = getStorageClient();

  const { data, error } = await client.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) {
    console.error(`[Attachment Storage] Failed to create signed URL:`, error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Ensures the attachments bucket exists
 */
export async function ensureBucketExists(): Promise<void> {
  const client = getStorageClient();

  const { data: buckets } = await client.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`[Attachment Storage] Creating bucket: ${BUCKET_NAME}`);
    const { error } = await client.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: ATTACHMENT_LIMITS.MAX_FILE_SIZE,
    });

    if (error && !error.message.includes('already exists')) {
      console.error(`[Attachment Storage] Failed to create bucket:`, error);
      throw error;
    }
  }

  console.log(`[Attachment Storage] Bucket ready: ${BUCKET_NAME}`);
}
