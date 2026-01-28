import express, { Request, Response } from 'express';
import multer from 'multer';
import { storage } from '../lib/storage/factory';
import { authMiddleware } from '../middleware/auth';
import { createFeedbackSchema, FEEDBACK_ATTACHMENT_LIMITS } from '../../shared/schema.zod';
import {
  uploadFeedbackAttachment,
  validateFeedbackAttachment,
} from '../lib/feedback-attachment-storage';

const router = express.Router();

// Configure multer for in-memory file storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FEEDBACK_ATTACHMENT_LIMITS.MAX_FILE_SIZE,
    files: FEEDBACK_ATTACHMENT_LIMITS.MAX_FILES,
  },
});

// Note: Don't call ensureFeedbackBucketExists() here at module load time
// because ES modules are evaluated before dotenv.config() runs in index.ts
// The bucket initialization is handled in server/index.ts after config loads

// ============================================================================
// POST /api/feedback - Submit user feedback
// ============================================================================
router.post(
  '/api/feedback',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      console.log('[Feedback Route] Create feedback for user:', req.user?.id);

      // Validate request body with Zod schema
      const validated = createFeedbackSchema.parse(req.body);
      const userId = req.user!.id;

      const feedback = await storage.createFeedback(userId, validated);

      console.log(`[Feedback Route] Feedback created: ID ${feedback.id}, type: ${feedback.type}`);

      return res.status(201).json(feedback);
    } catch (error: any) {
      console.error('[Feedback Route] Error creating feedback:', error);

      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }

      return res.status(500).json({
        error: 'Failed to submit feedback',
      });
    }
  }
);

// ============================================================================
// GET /api/feedback - List user's feedback
// ============================================================================
router.get(
  '/api/feedback',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const feedback = await storage.getUserFeedback(userId);

      return res.json(feedback);
    } catch (error) {
      console.error('[Feedback Route] Error fetching feedback:', error);
      return res.status(500).json({
        error: 'Failed to fetch feedback',
      });
    }
  }
);

// ============================================================================
// POST /api/feedback/upload - Upload a feedback image attachment
// ============================================================================
router.post(
  '/api/feedback/upload',
  authMiddleware,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'No file provided',
        });
      }

      console.log(`[Feedback Route] Upload attachment for user: ${userId}, file: ${file.originalname}`);

      // Validate file
      const validation = validateFeedbackAttachment({
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      });

      if (!validation.valid) {
        return res.status(400).json({
          error: validation.error,
        });
      }

      // Upload to storage
      const attachment = await uploadFeedbackAttachment(userId, {
        originalname: file.originalname,
        buffer: file.buffer,
        mimetype: file.mimetype,
        size: file.size,
      });

      console.log(`[Feedback Route] Attachment uploaded: ${attachment.url}`);

      return res.status(201).json(attachment);
    } catch (error: any) {
      console.error('[Feedback Route] Error uploading attachment:', error);
      return res.status(500).json({
        error: error.message || 'Failed to upload attachment',
      });
    }
  }
);

export default router;
