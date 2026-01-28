/**
 * Upload Routes
 *
 * Handles file uploads for FizzCard avatars
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit (increased for better UX, will be compressed)
  },
  fileFilter: (req, file, cb) => {
    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // More user-friendly error message
      cb(new Error(`Please upload a valid image file (JPEG, PNG, WebP, or GIF)`));
    }
  },
});

/**
 * POST /upload/avatar (mounted at /api in routes/index.ts)
 *
 * Upload and process avatar image
 * - Validates file type and size
 * - Resizes to optimal dimensions
 * - Converts to base64 data URI
 * - Returns data URI for storage in database
 */
router.post('/upload/avatar', authMiddleware(), upload.single('avatar'), async (req: Request, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please provide an image file in the "avatar" field.' });
    }

    const file = req.file;
    console.log(`[Upload] Processing avatar upload for user ${req.user?.id}: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);

    // Process image with sharp
    let imageBuffer: Buffer;
    let metadata: sharp.Metadata;
    let outputMimeType: string;

    try {
      // Get original image metadata
      const image = sharp(file.buffer);
      metadata = await image.metadata();

      console.log(`[Upload] Original dimensions: ${metadata.width}x${metadata.height}, orientation: ${metadata.orientation || 'undefined'}`);

      // Build the processing pipeline
      let pipeline = image
        // CRITICAL: Auto-rotate based on EXIF orientation to fix rotation issues
        .rotate()
        // Resize to fit within 400x400 (maintains aspect ratio)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true,
        });

      // Convert to JPEG with optimized compression for smaller file size
      // This significantly reduces database storage requirements
      if (file.mimetype === 'image/png') {
        // PNG to JPEG conversion (much smaller)
        console.log('[Upload] Converting PNG to JPEG for smaller size');
        imageBuffer = await pipeline
          .jpeg({
            quality: 85, // High quality but compressed
            progressive: true, // Progressive JPEG for faster loading
            mozjpeg: true, // Use mozjpeg for better compression
          })
          .toBuffer();
        outputMimeType = 'image/jpeg';
      } else if (file.mimetype === 'image/webp') {
        // WebP optimization
        imageBuffer = await pipeline
          .webp({
            quality: 85,
          })
          .toBuffer();
        outputMimeType = 'image/webp';
      } else {
        // JPEG and GIF optimization
        imageBuffer = await pipeline
          .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
        outputMimeType = 'image/jpeg';
      }

      // Get final metadata after all processing
      const finalImage = sharp(imageBuffer);
      metadata = await finalImage.metadata();

      // Calculate compression ratio
      const originalSize = file.buffer.length;
      const finalSize = imageBuffer.length;
      const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(1);

      console.log(`[Upload] Processed: ${metadata.width}x${metadata.height}, size: ${originalSize}B → ${finalSize}B (${compressionRatio}% reduction)`);
    } catch (error) {
      console.error('[Upload] Error processing image:', error);
      return res.status(400).json({ error: 'Invalid or corrupted image file' });
    }

    // Convert to base64 data URI
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:${outputMimeType};base64,${base64Image}`;

    console.log(`[Upload] Final data URI length: ${dataUri.length} chars (${(dataUri.length / 1024).toFixed(1)}KB)`);

    // Return data URI and metadata
    return res.status(200).json({
      avatarUrl: dataUri,
      size: imageBuffer.length,
      dimensions: {
        width: metadata.width || 0,
        height: metadata.height || 0,
      },
      mimeType: outputMimeType,
      originalSize: file.buffer.length,
      compressionRatio: ((1 - imageBuffer.length / file.buffer.length) * 100).toFixed(1) + '%',
    });
  } catch (error) {
    console.error('[Upload] Error uploading avatar:', error);

    // Handle multer errors
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 5MB. Please choose a smaller image.' });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Invalid field name. Please upload the file in the "avatar" field.' });
      }
      return res.status(400).json({ error: `Upload error: ${error.message}` });
    }

    // Handle other errors
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router;
