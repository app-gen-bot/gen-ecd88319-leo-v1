/**
 * Transcribe Route - Voice-to-text using OpenAI Whisper API
 *
 * POST /api/transcribe
 * Accepts audio file (webm, mp3, wav, etc.) and returns transcribed text
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import OpenAI, { toFile } from 'openai';

const router = express.Router();

// Configure multer for memory storage (files stored in buffer, not disk)
// Max file size: 25MB (Whisper API limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept common audio formats
    const allowedMimes = [
      'audio/webm',
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  },
});

// Initialize OpenAI client lazily
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ============================================================================
// POST /api/transcribe - Transcribe audio to text using Whisper
// ============================================================================
router.post(
  '/api/transcribe',
  authMiddleware,
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      console.log('[Transcribe Route] Request from user:', req.user?.id);

      // Check for audio file
      if (!req.file) {
        return res.status(400).json({
          error: 'No audio file provided',
          code: 'MISSING_AUDIO',
        });
      }

      console.log('[Transcribe Route] Audio file:', {
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
      });

      // Get OpenAI client
      let openai: OpenAI;
      try {
        openai = getOpenAIClient();
      } catch (error) {
        console.error('[Transcribe Route] OpenAI client error:', error);
        return res.status(503).json({
          error: 'Voice transcription service unavailable',
          code: 'SERVICE_UNAVAILABLE',
        });
      }

      // Call Whisper API with the buffer
      // Use OpenAI's toFile helper to properly convert the buffer
      console.log('[Transcribe Route] Calling Whisper API...');
      const startTime = Date.now();

      // Convert buffer to File using OpenAI's toFile helper
      const audioFile = await toFile(
        req.file.buffer,
        req.file.originalname || 'audio.webm',
        { type: req.file.mimetype }
      );

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // Optimize for English
        response_format: 'text',
      });

      const duration = Date.now() - startTime;
      console.log('[Transcribe Route] Transcription completed in', duration, 'ms');
      console.log('[Transcribe Route] Text length:', transcription.length, 'chars');

      // Return transcribed text
      res.json({
        text: transcription,
        duration_ms: duration,
      });

    } catch (error) {
      console.error('[Transcribe Route] Error:', error);

      // Handle OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        const statusCode = error.status || 500;
        return res.status(statusCode).json({
          error: error.message || 'Transcription failed',
          code: 'TRANSCRIPTION_ERROR',
        });
      }

      // Handle multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: 'Audio file too large (max 25MB)',
            code: 'FILE_TOO_LARGE',
          });
        }
        return res.status(400).json({
          error: error.message,
          code: 'UPLOAD_ERROR',
        });
      }

      // Generic error
      res.status(500).json({
        error: 'Failed to transcribe audio',
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

export default router;
