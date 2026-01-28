import { useEffect, useState, useCallback } from 'react';
import {
  wsiClient,
  type WSIMessage,
  type LogMessage,
  type ProgressMessage,
  type ReadyMessage,
  type AllWorkCompleteMessage,
  type ErrorMessage,
  type DecisionPromptMessage,
  type ConnectionStatusMessage,
  type StartGenerationConfig,
  type ShutdownInitiatedMessage,
  type ShutdownReadyMessage,
  type GenerationStoppedMessage,
  type ConversationLogMessage,
  type ProcessMonitorMessage,
} from '../lib/wsi-client';

/**
 * useWsi Hook - React integration for WSI Client
 *
 * Provides:
 * - Connection state
 * - Message history
 * - Generation controls
 * - Decision prompt handling
 *
 * Usage:
 *   const {
 *     isConnected,
 *     containerConnected,
 *     messages,
 *     currentPrompt,
 *     startGeneration,
 *     sendResponse,
 *     sendControl,
 *   } = useWsi();
 */

export interface WSIState {
  isConnected: boolean;
  containerConnected: boolean;
  isGenerating: boolean;
  isCancelling: boolean;
  currentPrompt: DecisionPromptMessage | null;
  progress: ProgressMessage | null;
  lastError: ErrorMessage | null;
  completionInfo: AllWorkCompleteMessage | null;
}

export interface UseWsiReturn extends WSIState {
  messages: WSIMessage[];
  conversationLogs: ConversationLogMessage[];
  processMonitorUpdates: ProcessMonitorMessage[];
  startGeneration: (config: StartGenerationConfig) => void;
  sendResponse: (promptId: string, response: string) => void;
  sendControl: (command: 'pause' | 'resume' | 'cancel') => void;
  requestStop: () => void;
  clearMessages: () => void;
}

export function useWsi(): UseWsiReturn {
  const [state, setState] = useState<WSIState>({
    isConnected: false,
    containerConnected: false,
    isGenerating: false,
    isCancelling: false,
    currentPrompt: null,
    progress: null,
    lastError: null,
    completionInfo: null,
  });

  // Initialize messages from sessionStorage (via wsiClient)
  const [messages, setMessages] = useState<WSIMessage[]>(() => wsiClient.messages);

  // Separate state for conversation logs (agent reasoning, tool use, etc.)
  const [conversationLogs, setConversationLogs] = useState<ConversationLogMessage[]>([]);

  // Process monitor updates (trajectory analysis from Haiku)
  const [processMonitorUpdates, setProcessMonitorUpdates] = useState<ProcessMonitorMessage[]>([]);

  // Connect on mount (idempotent - wsiClient is singleton with connection guard)
  useEffect(() => {
    // Connect immediately (singleton handles dedup)
    wsiClient.connect();

    // Sync messages from storage in case they were updated before mount
    if (wsiClient.messages.length > 0 && messages.length === 0) {
      setMessages(wsiClient.messages);
    }

    // Connection events
    const unsubConnected = wsiClient.on('connected', () => {
      setState((s) => ({ ...s, isConnected: true }));
    });

    const unsubDisconnected = wsiClient.on('disconnected', () => {
      setState((s) => ({
        ...s,
        isConnected: false,
        containerConnected: false,
      }));
    });

    // Connection status from server
    const unsubConnectionStatus = wsiClient.on<ConnectionStatusMessage>(
      'connection_status',
      (msg) => {
        setState((s) => ({
          ...s,
          containerConnected: msg.container_connected,
        }));
      }
    );

    // Container ready - set default progress so Cancel button shows
    // Only set isGenerating/progress if we're actually waiting for a generation
    // (not if this is a stale message after completion)
    const unsubReady = wsiClient.on<ReadyMessage>('ready', (msg) => {
      setState((s) => {
        // Don't reset to generating state if we already completed
        if (s.completionInfo) {
          return { ...s, containerConnected: true };
        }
        return {
          ...s,
          containerConnected: true,
          isGenerating: true,
          progress: { type: 'progress', stage: 'Generating', iteration: 1, total_iterations: 10 },
        };
      });
      setMessages((m) => [...m, msg]);
    });

    // Log messages
    const unsubLog = wsiClient.on<LogMessage>('log', (msg) => {
      setMessages((m) => [...m, msg]);
    });

    // Progress updates
    const unsubProgress = wsiClient.on<ProgressMessage>('progress', (msg) => {
      setState((s) => ({ ...s, progress: msg }));
      setMessages((m) => [...m, msg]);
    });

    // Decision prompts
    const unsubDecision = wsiClient.on<DecisionPromptMessage>(
      'decision_prompt',
      (msg) => {
        setState((s) => ({ ...s, currentPrompt: msg }));
        setMessages((m) => [...m, msg]);
      }
    );

    // Errors
    const unsubError = wsiClient.on<ErrorMessage>('error', (msg) => {
      setState((s) => ({
        ...s,
        lastError: msg,
        isGenerating: msg.fatal ? false : s.isGenerating,
      }));
      setMessages((m) => [...m, msg]);
    });

    // Completion
    const unsubComplete = wsiClient.on<AllWorkCompleteMessage>(
      'all_work_complete',
      (msg) => {
        setState((s) => ({
          ...s,
          isGenerating: false,
          isCancelling: false,
          progress: null,
          completionInfo: msg,
          currentPrompt: null,
        }));
        setMessages((m) => [...m, msg]);
      }
    );

    // Iteration complete
    const unsubIteration = wsiClient.on('iteration_complete', (msg) => {
      setMessages((m) => [...m, msg]);
    });

    // Conversation logs (agent reasoning, tool use, etc.)
    const unsubConversation = wsiClient.on<ConversationLogMessage>(
      'conversation_log',
      (msg) => {
        setConversationLogs((logs) => [...logs, msg]);
      }
    );

    // Process monitor updates (trajectory analysis from Haiku)
    const unsubProcessMonitor = wsiClient.on<ProcessMonitorMessage>(
      'process_monitor',
      (msg) => {
        setProcessMonitorUpdates((updates) => [...updates, msg]);
      }
    );

    // Shutdown initiated - cancellation in progress
    const unsubShutdownInit = wsiClient.on<ShutdownInitiatedMessage>(
      'shutdown_initiated',
      (msg) => {
        setState((s) => ({ ...s, isCancelling: true }));
        setMessages((m) => [...m, { type: 'log', line: `⏳ ${msg.message}`, level: 'info' } as WSIMessage]);
      }
    );

    // Shutdown ready - work saved
    const unsubShutdownReady = wsiClient.on<ShutdownReadyMessage>(
      'shutdown_ready',
      (msg) => {
        const saveMsg = msg.pushed
          ? `✅ ${msg.message} (commit: ${msg.commit_hash}, pushed to GitHub)`
          : `✅ ${msg.message}${msg.commit_hash ? ` (commit: ${msg.commit_hash})` : ''}`;
        setMessages((m) => [...m, { type: 'log', line: saveMsg, level: 'info' } as WSIMessage]);
      }
    );

    // Shutdown failed
    const unsubShutdownFailed = wsiClient.on('shutdown_failed', (msg) => {
      setMessages((m) => [...m, { type: 'log', line: `⚠️ Save failed: ${(msg as any).reason}`, level: 'warn' } as WSIMessage]);
    });

    // Shutdown timeout
    const unsubShutdownTimeout = wsiClient.on('shutdown_timeout', (msg) => {
      setMessages((m) => [...m, { type: 'log', line: `⚠️ ${(msg as any).message}`, level: 'warn' } as WSIMessage]);
    });

    // Generation stopped - final cleanup
    const unsubStopped = wsiClient.on<GenerationStoppedMessage>(
      'generation_stopped',
      (msg) => {
        setState((s) => ({
          ...s,
          isGenerating: false,
          isCancelling: false,
          progress: null,
          currentPrompt: null,
        }));
        setMessages((m) => [...m, { type: 'log', line: `🛑 ${msg.message}`, level: 'info' } as WSIMessage]);
      }
    );

    // Cleanup
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubConnectionStatus();
      unsubReady();
      unsubLog();
      unsubProgress();
      unsubDecision();
      unsubError();
      unsubComplete();
      unsubIteration();
      unsubConversation();
      unsubProcessMonitor();
      unsubShutdownInit();
      unsubShutdownReady();
      unsubShutdownFailed();
      unsubShutdownTimeout();
      unsubStopped();
    };
  }, []);

  // Actions
  const startGeneration = useCallback((config: StartGenerationConfig) => {
    setState((s) => ({
      ...s,
      isGenerating: true,
      currentPrompt: null,
      progress: null,
      lastError: null,
      completionInfo: null,
    }));
    setMessages([]); // Clear previous messages
    setConversationLogs([]); // Clear previous conversation logs
    setProcessMonitorUpdates([]); // Clear previous process monitor updates
    wsiClient.startGeneration(config);
  }, []);

  const sendResponse = useCallback((promptId: string, response: string) => {
    setState((s) => ({ ...s, currentPrompt: null }));
    wsiClient.sendDecisionResponse(promptId, response);
  }, []);

  const sendControl = useCallback((command: 'pause' | 'resume' | 'cancel') => {
    wsiClient.sendControlCommand(command);
  }, []);

  const requestStop = useCallback(() => {
    wsiClient.requestStop();
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    wsiClient.clearMessages();
  }, []);

  return {
    ...state,
    messages,
    conversationLogs,
    processMonitorUpdates,
    startGeneration,
    sendResponse,
    sendControl,
    requestStop,
    clearMessages,
  };
}
