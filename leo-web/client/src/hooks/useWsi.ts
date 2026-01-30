import { useEffect, useState, useCallback, useMemo } from 'react';
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
  type ScreenshotMessage,
  type FriendlyLogMessage,  // v2.5: User-friendly status updates
  // Credential request/response (v2.2)
  type CredentialRequestMessage,
  type CredentialTimeoutWarningMessage,
  type CredentialValueEntry,
} from '../lib/wsi-client';
import { UserRole } from '../../../shared/schema.zod';

/**
 * useWsi Hook - React integration for WSI Client
 *
 * Multi-generation support:
 * - Messages are stored per-generation using request_id
 * - activeGenerationId determines which messages to display
 * - State (progress, prompts, etc.) is also per-generation
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
 *   } = useWsi(activeGenerationId);
 */

// Per-generation state
export interface GenerationState {
  containerConnected: boolean;
  isGenerating: boolean;
  isCancelling: boolean;
  currentPrompt: DecisionPromptMessage | null;
  currentCredentialRequest: CredentialRequestMessage | null;  // v2.2
  progress: ProgressMessage | null;
  lastError: ErrorMessage | null;
  completionInfo: AllWorkCompleteMessage | null;
}

export interface WSIState {
  isConnected: boolean;
  containerConnected: boolean;
  isGenerating: boolean;
  isCancelling: boolean;
  currentPrompt: DecisionPromptMessage | null;
  currentCredentialRequest: CredentialRequestMessage | null;  // v2.2
  progress: ProgressMessage | null;
  lastError: ErrorMessage | null;
  completionInfo: AllWorkCompleteMessage | null;
}

export interface UseWsiReturn extends WSIState {
  messages: WSIMessage[];
  conversationLogs: ConversationLogMessage[];
  screenshots: ScreenshotMessage[];
  friendlyLogs: FriendlyLogMessage[];  // v2.5: User-friendly status updates
  globalAuthError: string | null;
  clearGlobalAuthError: () => void;
  startGeneration: (config: StartGenerationConfig) => void;
  sendResponse: (id: string, choice: string) => void;
  sendCredentialResponse: (credentialRequestId: string, credentials: CredentialValueEntry[], cancelled: boolean) => void;  // v2.2
  sendControl: (command: 'pause' | 'resume' | 'cancel') => void;
  requestStop: () => void;
  clearMessages: () => void;
}

// Default state for a new generation
const defaultGenerationState: GenerationState = {
  containerConnected: false,
  isGenerating: false,
  isCancelling: false,
  currentPrompt: null,
  currentCredentialRequest: null,  // v2.2
  progress: null,
  lastError: null,
  completionInfo: null,
};

/**
 * useWsi Hook with multi-generation support
 * @param activeGenerationId - The generation ID to show messages for (null = new tab)
 */
export function useWsi(activeGenerationId?: number | null): UseWsiReturn {
  // Connection state (global - one WebSocket connection)
  const [isConnected, setIsConnected] = useState<boolean>(wsiClient.isConnected);

  // Global auth error (for connection-level auth failures)
  const [globalAuthError, setGlobalAuthError] = useState<string | null>(null);

  // Per-generation message storage: Map<request_id, messages[]>
  const [messagesByGeneration, setMessagesByGeneration] = useState<Map<number, WSIMessage[]>>(new Map());

  // Per-generation conversation logs: Map<request_id, logs[]>
  const [conversationLogsByGeneration, setConversationLogsByGeneration] = useState<Map<number, ConversationLogMessage[]>>(new Map());

  // Per-generation screenshots: Map<request_id, screenshots[]>
  const [screenshotsByGeneration, setScreenshotsByGeneration] = useState<Map<number, ScreenshotMessage[]>>(new Map());

  // Per-generation friendly logs: Map<request_id, friendlyLogs[]> (v2.5)
  const [friendlyLogsByGeneration, setFriendlyLogsByGeneration] = useState<Map<number, FriendlyLogMessage[]>>(new Map());

  // Per-generation state: Map<request_id, GenerationState>
  const [stateByGeneration, setStateByGeneration] = useState<Map<number, GenerationState>>(new Map());

  // Helper to get or create generation state
  const getGenerationState = useCallback((requestId: number): GenerationState => {
    return stateByGeneration.get(requestId) || defaultGenerationState;
  }, [stateByGeneration]);

  // Helper to update generation state
  const updateGenerationState = useCallback((requestId: number, update: Partial<GenerationState>) => {
    setStateByGeneration((prev) => {
      const newMap = new Map(prev);
      const existing = prev.get(requestId) || defaultGenerationState;
      newMap.set(requestId, { ...existing, ...update });
      return newMap;
    });
  }, []);

  // Helper to add message to a generation
  const addMessage = useCallback((requestId: number, msg: WSIMessage) => {
    setMessagesByGeneration((prev) => {
      const newMap = new Map(prev);
      const existing = prev.get(requestId) || [];
      newMap.set(requestId, [...existing, msg]);
      return newMap;
    });
  }, []);

  // Helper to add conversation log to a generation
  const addConversationLog = useCallback((requestId: number, log: ConversationLogMessage) => {
    setConversationLogsByGeneration((prev) => {
      const newMap = new Map(prev);
      const existing = prev.get(requestId) || [];
      newMap.set(requestId, [...existing, log]);
      return newMap;
    });
  }, []);

  // Helper to add screenshot to a generation
  const addScreenshot = useCallback((requestId: number, screenshot: ScreenshotMessage) => {
    setScreenshotsByGeneration((prev) => {
      const newMap = new Map(prev);
      const existing = prev.get(requestId) || [];
      newMap.set(requestId, [...existing, screenshot]);
      return newMap;
    });
  }, []);

  // Helper to add friendly log to a generation (v2.5)
  const addFriendlyLog = useCallback((requestId: number, log: FriendlyLogMessage) => {
    setFriendlyLogsByGeneration((prev) => {
      const newMap = new Map(prev);
      const existing = prev.get(requestId) || [];
      newMap.set(requestId, [...existing, log]);
      return newMap;
    });
  }, []);

  // Connect on mount (idempotent - wsiClient is singleton with connection guard)
  useEffect(() => {
    // Connect immediately (singleton handles dedup)
    wsiClient.connect();

    // Connection events
    const unsubConnected = wsiClient.on('connected', () => {
      setIsConnected(true);
    });

    const unsubDisconnected = wsiClient.on('disconnected', () => {
      setIsConnected(false);
      // Mark all generations as disconnected
      setStateByGeneration((prev) => {
        const newMap = new Map(prev);
        for (const [id, state] of prev) {
          newMap.set(id, { ...state, containerConnected: false });
        }
        return newMap;
      });
    });

    // Connection status from server (with request_id for multi-session)
    const unsubConnectionStatus = wsiClient.on<ConnectionStatusMessage>(
      'connection_status',
      (msg) => {
        const requestId = (msg as any).request_id as number | undefined;
        if (requestId !== undefined) {
          updateGenerationState(requestId, { containerConnected: msg.container_connected });
        }
      }
    );

    // Container ready - set default progress so Cancel button shows
    const unsubReady = wsiClient.on<ReadyMessage>('ready', (msg) => {
      const requestId = msg.request_id;
      if (requestId !== undefined) {
        const state = getGenerationState(requestId);
        // Don't reset to generating state if we already completed
        if (!state.completionInfo) {
          updateGenerationState(requestId, {
            containerConnected: true,
            isGenerating: true,
            progress: { type: 'progress', stage: 'Generating', iteration: 1, total_iterations: 10 },
          });
        } else {
          updateGenerationState(requestId, { containerConnected: true });
        }
        addMessage(requestId, msg);
      }
    });

    // Log messages
    const unsubLog = wsiClient.on<LogMessage>('log', (msg) => {
      const requestId = msg.request_id;
      if (requestId !== undefined) {
        addMessage(requestId, msg);
      }
    });

    // Progress updates
    const unsubProgress = wsiClient.on<ProgressMessage>('progress', (msg) => {
      const requestId = msg.request_id;
      if (requestId !== undefined) {
        updateGenerationState(requestId, { progress: msg });
        addMessage(requestId, msg);
      }
    });

    // Decision prompts
    const unsubDecision = wsiClient.on<DecisionPromptMessage>(
      'decision_prompt',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          updateGenerationState(requestId, { currentPrompt: msg });
          addMessage(requestId, msg);
        }
      }
    );

    // Credential requests (v2.2)
    const unsubCredentialRequest = wsiClient.on<CredentialRequestMessage>(
      'credential_request',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          updateGenerationState(requestId, { currentCredentialRequest: msg });
          addMessage(requestId, msg);
        }
      }
    );

    // Credential timeout warnings (v2.2)
    const unsubCredentialTimeout = wsiClient.on<CredentialTimeoutWarningMessage>(
      'credential_timeout_warning',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          // Just add to messages - UI can show warning
          addMessage(requestId, msg);
        }
      }
    );

    // Errors
    const unsubError = wsiClient.on<ErrorMessage>('error', (msg) => {
      const requestId = msg.request_id;
      // Handle global auth errors (no request_id, AUTH_FAILED code)
      if (msg.error_code === 'AUTH_FAILED') {
        setGlobalAuthError(msg.message);
        return;
      }
      if (requestId !== undefined) {
        const state = getGenerationState(requestId);
        updateGenerationState(requestId, {
          lastError: msg,
          isGenerating: msg.fatal ? false : state.isGenerating,
        });
        addMessage(requestId, msg);
      }
    });

    // Completion
    const unsubComplete = wsiClient.on<AllWorkCompleteMessage>(
      'all_work_complete',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          updateGenerationState(requestId, {
            isGenerating: false,
            isCancelling: false,
            progress: null,
            completionInfo: msg,
            currentPrompt: null,
          });
          addMessage(requestId, msg);
        }
      }
    );

    // Iteration complete
    const unsubIteration = wsiClient.on('iteration_complete', (msg) => {
      const requestId = (msg as WSIMessage).request_id;
      if (requestId !== undefined) {
        addMessage(requestId, msg as WSIMessage);
      }
    });

    // Conversation logs (agent reasoning, tool use, etc.)
    const unsubConversation = wsiClient.on<ConversationLogMessage>(
      'conversation_log',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          addConversationLog(requestId, msg);
        }
      }
    );

    // Screenshots (from quality assurance testing)
    const unsubScreenshot = wsiClient.on<ScreenshotMessage>(
      'screenshot',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          addScreenshot(requestId, msg);
        }
      }
    );

    // Friendly logs (v2.5: user-friendly status updates for non-dev users)
    const unsubFriendlyLog = wsiClient.on<FriendlyLogMessage>(
      'friendly_log',
      (msg) => {
        const requestId = msg.request_id;
        if (requestId !== undefined) {
          addFriendlyLog(requestId, msg);
        }
      }
    );

    // Shutdown initiated - cancellation in progress
    const unsubShutdownInit = wsiClient.on<ShutdownInitiatedMessage>(
      'shutdown_initiated',
      (msg) => {
        const requestId = (msg as any).request_id as number | undefined;
        if (requestId !== undefined) {
          updateGenerationState(requestId, { isCancelling: true });
          addMessage(requestId, { type: 'log', line: `⏳ ${msg.message}`, level: 'info', request_id: requestId } as WSIMessage);
        }
      }
    );

    // Shutdown ready - work saved, generation complete
    const unsubShutdownReady = wsiClient.on<ShutdownReadyMessage>(
      'shutdown_ready',
      (msg) => {
        const requestId = (msg as any).request_id as number | undefined;
        if (requestId !== undefined) {
          updateGenerationState(requestId, {
            isGenerating: false,
            isCancelling: false,
            progress: null,
            currentPrompt: null,
          });
          const saveMsg = msg.pushed
            ? `✅ ${msg.message} (commit: ${msg.commit_hash}, pushed to GitHub)`
            : `✅ ${msg.message}${msg.commit_hash ? ` (commit: ${msg.commit_hash})` : ''}`;
          addMessage(requestId, { type: 'log', line: saveMsg, level: 'info', request_id: requestId } as WSIMessage);
        }
      }
    );

    // Shutdown failed
    const unsubShutdownFailed = wsiClient.on('shutdown_failed', (msg) => {
      const requestId = (msg as any).request_id as number | undefined;
      if (requestId !== undefined) {
        addMessage(requestId, { type: 'log', line: `⚠️ Save failed: ${(msg as any).reason}`, level: 'warn', request_id: requestId } as WSIMessage);
      }
    });

    // Shutdown timeout - force stopped, generation complete
    const unsubShutdownTimeout = wsiClient.on('shutdown_timeout', (msg) => {
      const requestId = (msg as any).request_id as number | undefined;
      if (requestId !== undefined) {
        updateGenerationState(requestId, {
          isGenerating: false,
          isCancelling: false,
          progress: null,
          currentPrompt: null,
        });
        addMessage(requestId, { type: 'log', line: `⚠️ ${(msg as any).message}`, level: 'warn', request_id: requestId } as WSIMessage);
      }
    });

    // Generation stopped - final cleanup
    const unsubStopped = wsiClient.on<GenerationStoppedMessage>(
      'generation_stopped',
      (msg) => {
        const requestId = (msg as any).request_id as number | undefined;
        if (requestId !== undefined) {
          updateGenerationState(requestId, {
            isGenerating: false,
            isCancelling: false,
            progress: null,
            currentPrompt: null,
          });
          addMessage(requestId, { type: 'log', line: `🛑 ${msg.message}`, level: 'info', request_id: requestId } as WSIMessage);
        }
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
      unsubCredentialRequest();
      unsubCredentialTimeout();
      unsubError();
      unsubComplete();
      unsubIteration();
      unsubConversation();
      unsubScreenshot();
      unsubFriendlyLog();  // v2.5
      unsubShutdownInit();
      unsubShutdownReady();
      unsubShutdownFailed();
      unsubShutdownTimeout();
      unsubStopped();
    };
  }, [updateGenerationState, getGenerationState, addMessage, addConversationLog, addScreenshot, addFriendlyLog]);

  // Actions
  const startGeneration = useCallback((config: StartGenerationConfig) => {
    const requestId = config.requestId;
    // Initialize state for this generation
    updateGenerationState(requestId, {
      isGenerating: true,
      currentPrompt: null,
      progress: null,
      lastError: null,
      completionInfo: null,
    });
    // Clear previous messages for this generation
    setMessagesByGeneration((prev) => {
      const newMap = new Map(prev);
      newMap.set(requestId, []);
      return newMap;
    });
    setConversationLogsByGeneration((prev) => {
      const newMap = new Map(prev);
      newMap.set(requestId, []);
      return newMap;
    });
    setScreenshotsByGeneration((prev) => {
      const newMap = new Map(prev);
      newMap.set(requestId, []);
      return newMap;
    });
    setFriendlyLogsByGeneration((prev) => {
      const newMap = new Map(prev);
      newMap.set(requestId, []);
      return newMap;
    });
    wsiClient.startGeneration(config);
  }, [updateGenerationState]);

  const sendResponse = useCallback((id: string, choice: string) => {
    if (activeGenerationId !== undefined && activeGenerationId !== null) {
      updateGenerationState(activeGenerationId, { currentPrompt: null });
      // Include request_id so server can route to correct container
      wsiClient.sendDecisionResponse(id, choice, activeGenerationId);
    } else {
      // Fallback without request_id (legacy)
      wsiClient.sendDecisionResponse(id, choice);
    }
  }, [activeGenerationId, updateGenerationState]);

  // Send credential response (v2.2)
  const sendCredentialResponse = useCallback((
    credentialRequestId: string,
    credentials: CredentialValueEntry[],
    cancelled: boolean
  ) => {
    if (activeGenerationId !== undefined && activeGenerationId !== null) {
      updateGenerationState(activeGenerationId, { currentCredentialRequest: null });
      wsiClient.sendCredentialResponse(credentialRequestId, credentials, cancelled, activeGenerationId);
    }
  }, [activeGenerationId, updateGenerationState]);

  const sendControl = useCallback((command: 'pause' | 'resume' | 'cancel') => {
    wsiClient.sendControlCommand(command);
  }, []);

  const requestStop = useCallback(() => {
    if (activeGenerationId !== undefined && activeGenerationId !== null) {
      wsiClient.requestStop(activeGenerationId);
    }
  }, [activeGenerationId]);

  const clearMessages = useCallback(() => {
    if (activeGenerationId !== undefined && activeGenerationId !== null) {
      setMessagesByGeneration((prev) => {
        const newMap = new Map(prev);
        newMap.set(activeGenerationId, []);
        return newMap;
      });
      setConversationLogsByGeneration((prev) => {
        const newMap = new Map(prev);
        newMap.set(activeGenerationId, []);
        return newMap;
      });
      setScreenshotsByGeneration((prev) => {
        const newMap = new Map(prev);
        newMap.set(activeGenerationId, []);
        return newMap;
      });
      setFriendlyLogsByGeneration((prev) => {
        const newMap = new Map(prev);
        newMap.set(activeGenerationId, []);
        return newMap;
      });
    }
  }, [activeGenerationId]);

  // Get messages and state for active generation
  const messages = useMemo(() => {
    if (activeGenerationId === undefined || activeGenerationId === null) {
      return [];
    }
    return messagesByGeneration.get(activeGenerationId) || [];
  }, [activeGenerationId, messagesByGeneration]);

  const conversationLogs = useMemo(() => {
    if (activeGenerationId === undefined || activeGenerationId === null) {
      return [];
    }
    return conversationLogsByGeneration.get(activeGenerationId) || [];
  }, [activeGenerationId, conversationLogsByGeneration]);

  const screenshots = useMemo(() => {
    if (activeGenerationId === undefined || activeGenerationId === null) {
      return [];
    }
    return screenshotsByGeneration.get(activeGenerationId) || [];
  }, [activeGenerationId, screenshotsByGeneration]);

  // Friendly logs for non-dev users (v2.5)
  const friendlyLogs = useMemo(() => {
    if (activeGenerationId === undefined || activeGenerationId === null) {
      return [];
    }
    return friendlyLogsByGeneration.get(activeGenerationId) || [];
  }, [activeGenerationId, friendlyLogsByGeneration]);

  const activeState = useMemo(() => {
    if (activeGenerationId === undefined || activeGenerationId === null) {
      return defaultGenerationState;
    }
    return stateByGeneration.get(activeGenerationId) || defaultGenerationState;
  }, [activeGenerationId, stateByGeneration]);

  const clearGlobalAuthError = useCallback(() => {
    setGlobalAuthError(null);
  }, []);

  return {
    isConnected,
    containerConnected: activeState.containerConnected,
    isGenerating: activeState.isGenerating,
    isCancelling: activeState.isCancelling,
    currentPrompt: activeState.currentPrompt,
    currentCredentialRequest: activeState.currentCredentialRequest,  // v2.2
    progress: activeState.progress,
    lastError: activeState.lastError,
    completionInfo: activeState.completionInfo,
    messages,
    conversationLogs,
    screenshots,
    friendlyLogs,  // v2.5: User-friendly status updates
    globalAuthError,
    clearGlobalAuthError,
    startGeneration,
    sendResponse,
    sendCredentialResponse,  // v2.2
    sendControl,
    requestStop,
    clearMessages,
  };
}

/**
 * Helper function to filter messages based on user role
 * - 'dev' and 'admin': See all messages (full terminal output)
 * - 'user' and 'user_plus': See only friendly_log messages (simple status updates)
 */
export function filterMessagesByRole(
  messages: WSIMessage[],
  friendlyLogs: FriendlyLogMessage[],
  userRole: UserRole
): WSIMessage[] {
  // Dev and admin see full terminal output
  if (userRole === 'dev' || userRole === 'admin') {
    return messages;
  }

  // User and user_plus see only friendly logs converted to log messages
  // Plus essential messages (ready, all_work_complete, error, iteration_complete)
  const essentialTypes = ['ready', 'all_work_complete', 'error', 'iteration_complete', 'progress'];
  const essentialMessages = messages.filter(m => essentialTypes.includes(m.type));

  // Convert friendly logs to log messages for display
  const friendlyAsLog: WSIMessage[] = friendlyLogs.map(fl => ({
    type: 'log' as const,
    line: `✨ ${fl.message}`,
    level: 'info',
    request_id: fl.request_id,
  }));

  return [...friendlyAsLog, ...essentialMessages];
}
