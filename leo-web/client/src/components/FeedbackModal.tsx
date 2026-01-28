/**
 * FeedbackModal Component
 *
 * A modal for submitting user feedback (feature requests and bug reports).
 * Includes text input with voice-to-text support via the VoiceInput component.
 * Supports up to 3 image attachments (png, jpg, gif, webp) up to 2MB each.
 */

import { useState, useCallback, useRef } from 'react';
import { MessageSquarePlus, Bug, Lightbulb, Loader2, Send, ImagePlus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { VoiceInput } from './ui/voice-input';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** The page where feedback was initiated (for tracking) */
  sourcePage: 'apps' | 'console';
}

type FeedbackType = 'feature_request' | 'bug_report';

interface FeedbackAttachment {
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

// Image upload limits
const MAX_FILES = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

export function FeedbackModal({ isOpen, onClose, sourcePage }: FeedbackModalProps) {
  const { session } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature_request');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle voice transcription
  const handleTranscription = useCallback((text: string) => {
    setContent((prev) => prev ? `${prev} ${text}` : text);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check if we can add more files
    if (attachments.length >= MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    const file = files[0];

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PNG, JPG, GIF, and WebP images are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/feedback/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const attachment: FeedbackAttachment = await response.json();
      setAttachments((prev) => [...prev, attachment]);
    } catch (err) {
      console.error('[FeedbackModal] Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [attachments.length, session?.access_token]);

  // Handle removing an attachment
  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!content.trim() || content.trim().length < 10) {
      setError('Please enter at least 10 characters of feedback.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          type: feedbackType,
          content: content.trim(),
          sourcePage,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setContent('');
      setAttachments([]);

      // Close modal after showing success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[FeedbackModal] Submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, feedbackType, sourcePage, attachments, session, onClose]);

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setContent('');
      setAttachments([]);
      setError(null);
      setSuccess(false);
      setFeedbackType('feature_request');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-leo-primary" />
            Send Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve Leo by sharing your thoughts. We read every submission.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
              <Send className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-leo-text font-medium">Thank you for your feedback!</p>
            <p className="text-leo-text-secondary text-sm mt-1">We appreciate you taking the time.</p>
          </div>
        ) : (
          <>
            {/* Feedback Type Selection */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType('feature_request')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  feedbackType === 'feature_request'
                    ? 'border-leo-primary bg-leo-primary/10 text-leo-primary'
                    : 'border-leo-border bg-leo-bg-tertiary text-leo-text-secondary hover:border-leo-primary/50'
                }`}
              >
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium">Feature Request</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('bug_report')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  feedbackType === 'bug_report'
                    ? 'border-red-500 bg-red-500/10 text-red-500'
                    : 'border-leo-border bg-leo-bg-tertiary text-leo-text-secondary hover:border-red-500/50'
                }`}
              >
                <Bug className="h-4 w-4" />
                <span className="font-medium">Bug Report</span>
              </button>
            </div>

            {/* Content Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  feedbackType === 'feature_request'
                    ? 'Describe the feature you would like to see...'
                    : 'Describe the bug you encountered...'
                }
                className="w-full h-32 px-4 py-3 pr-24 rounded-lg border border-leo-border bg-leo-bg-tertiary text-leo-text placeholder:text-leo-text-tertiary focus:outline-none focus:ring-2 focus:ring-leo-primary focus:border-transparent resize-none"
                disabled={isSubmitting}
              />
              {/* Action Buttons (Voice + Image) */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                {/* Image Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isSubmitting || isUploading || attachments.length >= MAX_FILES}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting || isUploading || attachments.length >= MAX_FILES}
                  className="p-2 rounded-lg hover:bg-leo-bg-secondary text-leo-text-secondary hover:text-leo-text disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title={attachments.length >= MAX_FILES ? `Max ${MAX_FILES} images` : 'Attach image'}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                </button>
                <VoiceInput
                  onTranscription={handleTranscription}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Attachment Previews */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative group w-20 h-20 rounded-lg border border-leo-border overflow-hidden"
                  >
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 truncate">
                      {attachment.name}
                    </div>
                  </div>
                ))}
                {attachments.length < MAX_FILES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-20 h-20 rounded-lg border border-dashed border-leo-border hover:border-leo-primary flex items-center justify-center text-leo-text-tertiary hover:text-leo-primary transition-colors disabled:opacity-50"
                  >
                    <ImagePlus className="h-6 w-6" />
                  </button>
                )}
              </div>
            )}

            {/* Character Count and Attachment Count */}
            <div className="flex justify-between items-center text-xs text-leo-text-tertiary">
              <span>
                {content.length} / 5000 characters
                {attachments.length > 0 && ` • ${attachments.length}/${MAX_FILES} images`}
              </span>
              <span className={content.length < 10 ? 'text-red-500' : ''}>
                {content.length < 10 ? `${10 - content.length} more needed` : 'Ready to submit'}
              </span>
            </div>

            {/* Error Display */}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || content.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
