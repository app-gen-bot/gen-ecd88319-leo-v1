/**
 * VoiceInput Component
 *
 * A microphone button for voice-to-text input using OpenAI Whisper API.
 * Provides visual feedback for recording, processing, and error states.
 *
 * Features:
 * - Toggle recording on click
 * - Visual states: idle, recording (with pulse + timer), processing
 * - Auto-stop at 60 seconds (Whisper limit)
 * - Error handling for permissions and API failures
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface VoiceInputProps {
  /** Called when transcription is complete */
  onTranscription: (text: string) => void;
  /** Called when an error occurs */
  onError?: (error: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Optional className */
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'processing';

// Max recording duration in seconds (Whisper has 25MB limit, ~60s is safe)
const MAX_RECORDING_SECONDS = 60;

export function VoiceInput({
  onTranscription,
  onError,
  disabled = false,
  className = '',
}: VoiceInputProps) {
  const { session } = useAuth();
  const [state, setState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for recording management
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setRecordingDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Start recording
  const startRecording = useCallback(async () => {
    setError(null);

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      // Create MediaRecorder with webm format (good compression, widely supported)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Transcribe if we have audio
        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }

        cleanup();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setState('recording');

      // Start timer
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          // Auto-stop at max duration
          if (newDuration >= MAX_RECORDING_SECONDS) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (err) {
      console.error('[VoiceInput] Failed to start recording:', err);

      let errorMessage = 'Failed to access microphone';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone.';
        }
      }

      setError(errorMessage);
      onError?.(errorMessage);
      cleanup();
      setState('idle');
    }
  }, [cleanup, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }
  }, []);

  // Transcribe audio via API
  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    setState('processing');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Transcription failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.text && data.text.trim()) {
        onTranscription(data.text.trim());
      } else {
        setError('No speech detected. Please try again.');
        onError?.('No speech detected');
      }

    } catch (err) {
      console.error('[VoiceInput] Transcription error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transcription failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setState('idle');
    }
  }, [session, onTranscription, onError]);

  // Toggle recording
  const handleClick = useCallback(() => {
    if (disabled) return;

    if (state === 'idle') {
      startRecording();
    } else if (state === 'recording') {
      stopRecording();
    }
    // Don't allow clicks during processing
  }, [state, disabled, startRecording, stopRecording]);

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine button styling based on state
  const getButtonClasses = (): string => {
    const baseClasses = 'w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200';

    if (disabled) {
      return `${baseClasses} bg-leo-bg-tertiary cursor-not-allowed opacity-50`;
    }

    switch (state) {
      case 'recording':
        return `${baseClasses} bg-red-500 hover:bg-red-600 animate-pulse cursor-pointer`;
      case 'processing':
        return `${baseClasses} bg-leo-bg-tertiary cursor-wait`;
      default:
        return `${baseClasses} bg-leo-bg-tertiary hover:bg-leo-bg-hover cursor-pointer`;
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Recording duration badge */}
      {state === 'recording' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full whitespace-nowrap">
          {formatDuration(recordingDuration)}
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || state === 'processing'}
        className={getButtonClasses()}
        title={
          state === 'recording'
            ? 'Click to stop recording'
            : state === 'processing'
              ? 'Transcribing...'
              : 'Click to start voice input'
        }
        aria-label={
          state === 'recording'
            ? `Recording: ${formatDuration(recordingDuration)}. Click to stop.`
            : state === 'processing'
              ? 'Processing audio...'
              : 'Start voice input'
        }
      >
        {state === 'processing' ? (
          <Loader2 className="w-4 h-4 text-leo-text-secondary animate-spin" />
        ) : (
          <Mic
            className={`w-4 h-4 ${
              state === 'recording' ? 'text-white' : 'text-leo-text-secondary'
            }`}
          />
        )}
      </button>

      {/* Error tooltip */}
      {error && state === 'idle' && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-red-500/90 text-white text-xs rounded whitespace-nowrap max-w-48 truncate">
          {error}
        </div>
      )}
    </div>
  );
}
