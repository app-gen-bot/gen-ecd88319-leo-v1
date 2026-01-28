/**
 * ConsolePage Component - Renaissance Design
 *
 * Leo Console interface with clean, elegant layout:
 * - Top: Navigation with Renaissance aesthetic
 * - Middle: Terminal output (dark for contrast)
 * - Bottom: Redesigned input form with clear button placement
 * - Right: Browser preview / Screenshots panel
 *
 * Uses WSI Protocol v2.1 - browser speaks directly to container
 */

import { useState, useEffect, useMemo } from 'react';
import { useRoute } from 'wouter';
import {
  Terminal as TerminalIcon,
  XCircle,
  MessageSquare,
  MessageSquarePlus,
  Sparkles,
  LayoutGrid,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  Settings,
  Send,
} from 'lucide-react';
import { Link } from 'wouter';
import { UserMenu } from '../components/auth/UserMenu';
import { useWsi } from '../hooks/useWsi';
import { useAuth } from '../contexts/AuthContext';
import { useMultiGeneration } from '../hooks/useMultiGeneration';
import REPLTerminal from '../components/terminal/REPLTerminal';
import ConversationsTerminal from '../components/terminal/ConversationsTerminal';
import { GenerationTabs } from '../components/console/GenerationTabs';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ResizableDivider, useResizablePanel } from '../components/ui/resizable-divider';
import { VoiceInput } from '../components/ui/voice-input';
import { FeedbackModal } from '../components/FeedbackModal';
import { CredentialRequestModal } from '../components/CredentialRequestModal';
import { ScreenshotPreview } from '../components/console/ScreenshotPreview';
import { LeoLogo, LeoLogoMark } from '../components/ui/LeoLogo';
import { apiClient } from '../lib/api-client';
import { getAuthToken } from '../lib/auth-helpers';
import { ATTACHMENT_LIMITS } from '../../../shared/schema.zod';
import type { AttachmentInfo } from '../lib/wsi-client';

type GenerationMode = 'autonomous' | 'confirm_first';
type StartType = 'new' | 'resume';

// File attachment for local state (before upload)
interface PendingFile {
  file: File;
  id: string;
}

// User app summary from API
interface UserApp {
  id: number;
  appUuid: string;
  appName: string;
  githubUrl: string | null;
  deploymentUrl: string | null;
  updatedAt: string;
  generationCount?: number;
  lastStatus?: string;
}

/**
 * ConsolePage Component
 */
export default function ConsolePage() {
  // Get app ID from URL if present (for Resume from /apps page)
  const [, params] = useRoute('/console/:id');
  const urlAppId = params?.id ? parseInt(params.id, 10) : null;

  // Auth hook
  const { user, profile } = useAuth();

  // Multi-generation state
  const {
    activeGenerations,
    activeTabId,
    setActiveTabId,
    concurrencyInfo,
    refreshActiveGenerations,
  } = useMultiGeneration();

  // WSI hook
  const {
    isConnected,
    containerConnected,
    isGenerating,
    isCancelling,
    messages,
    conversationLogs,
    screenshots,
    currentPrompt,
    progress,
    completionInfo,
    globalAuthError,
    clearGlobalAuthError,
    startGeneration,
    sendResponse,
    requestStop,
    clearMessages,
    currentCredentialRequest,
    sendCredentialResponse,
  } = useWsi(activeTabId);

  // Compute timeout warning for credential request from messages
  const credentialTimeoutWarning = useMemo(() => {
    if (!currentCredentialRequest) return null;
    // Find the most recent timeout warning for this credential request
    const timeoutMsg = [...messages].reverse().find(
      (m) => m.type === 'credential_timeout_warning' && m.id === currentCredentialRequest.id
    );
    if (timeoutMsg && 'elapsed_seconds' in timeoutMsg && 'remaining_seconds' in timeoutMsg) {
      return {
        elapsed_seconds: timeoutMsg.elapsed_seconds as number,
        remaining_seconds: timeoutMsg.remaining_seconds as number,
      };
    }
    return null;
  }, [messages, currentCredentialRequest]);

  // Track whether we're showing the "new" tab
  const [showNewTab, setShowNewTab] = useState(true);

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string>('about:blank');

  // Form state
  const [startType, setStartType] = useState<StartType>('new');
  const [mode, setMode] = useState<GenerationMode>('autonomous');

  // New app fields
  const [prompt, setPrompt] = useState<string>('');
  const [appName, setAppName] = useState<string>('');

  // Resume fields
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string>('');

  // Common settings - DEFAULT: 10 for new, 3 for resume (set in useEffect)
  const [maxIterations, setMaxIterations] = useState<number>(10);
  // Subagents always enabled (no UI toggle)
  const enableSubagents = true;

  // File attachments
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<boolean>(false);

  // User's apps for Resume dropdown
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [appsLoading, setAppsLoading] = useState<boolean>(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch user's apps
  const fetchApps = async () => {
    setAppsLoading(true);
    try {
      const response = await apiClient.apps.list();
      if (response.status === 200) {
        setUserApps(response.body);
      }
    } catch (error) {
      console.error('[ConsolePage] Failed to fetch apps:', error);
    } finally {
      setAppsLoading(false);
    }
  };

  // Fetch apps on mount
  useEffect(() => {
    fetchApps();
  }, []);

  // Auto-select app from URL parameter
  useEffect(() => {
    if (urlAppId && userApps.length > 0 && selectedAppId === null) {
      const appExists = userApps.some(app => app.id === urlAppId);
      if (appExists) {
        setSelectedAppId(urlAppId);
        setStartType('resume');
      }
    }
  }, [urlAppId, userApps, selectedAppId]);

  // Update maxIterations when startType changes
  useEffect(() => {
    if (startType === 'resume') {
      setMaxIterations(3);
    } else {
      setMaxIterations(10);
    }
  }, [startType]);

  // Show global auth errors from WebSocket
  useEffect(() => {
    if (globalAuthError) {
      setSubmitError(globalAuthError);
      clearGlobalAuthError();
    }
  }, [globalAuthError, clearGlobalAuthError]);

  // Tab state for Console, Conversations (removed History)
  const [activeTab, setActiveTab] = useState<'console' | 'conversations'>('console');

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Settings panel collapse state - expanded by default when not generating
  const [settingsExpanded, setSettingsExpanded] = useState(true);

  // Auto-collapse settings when generation starts to maximize console space
  useEffect(() => {
    if (isGenerating && !showNewTab) {
      setSettingsExpanded(false);
    }
  }, [isGenerating, showNewTab]);

  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useResizablePanel('leo-console-panel-width', 50);

  // Determine if preview panel should be visible
  // Show when there are screenshots OR when there's a deployment URL
  const showPreviewPanel = screenshots.length > 0 || (completionInfo?.download_url && completionInfo.download_url !== 'about:blank');

  // Decision prompt response
  const [promptResponse, setPromptResponse] = useState<string>('');

  // Current iteration from progress
  const currentIteration = progress?.iteration || 0;
  const totalIterations = progress?.total_iterations || maxIterations;

  // File attachment helpers
  const totalFileSize = pendingFiles.reduce((sum, pf) => sum + pf.file.size, 0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: PendingFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.includes(ext as any)) {
        errors.push(`${file.name}: File type not allowed`);
        continue;
      }

      if (file.size > ATTACHMENT_LIMITS.MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max ${ATTACHMENT_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB)`);
        continue;
      }

      if (pendingFiles.length + newFiles.length >= ATTACHMENT_LIMITS.MAX_FILES) {
        errors.push(`Maximum ${ATTACHMENT_LIMITS.MAX_FILES} files allowed`);
        break;
      }

      const newTotalSize = totalFileSize + newFiles.reduce((s, f) => s + f.file.size, 0) + file.size;
      if (newTotalSize > ATTACHMENT_LIMITS.MAX_TOTAL_SIZE) {
        errors.push(`Total size would exceed ${ATTACHMENT_LIMITS.MAX_TOTAL_SIZE / 1024 / 1024}MB`);
        break;
      }

      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      });
    }

    if (errors.length > 0) {
      setSubmitError(errors.join(', '));
    }

    if (newFiles.length > 0) {
      setPendingFiles(prev => [...prev, ...newFiles]);
    }

    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setPendingFiles(prev => prev.filter(pf => pf.id !== id));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-3 h-3" />;
    }
    return <FileText className="w-3 h-3" />;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || (isGenerating && !showNewTab) || isSubmitting || !isConnected) {
      return;
    }

    const userId = user?.id;
    if (!userId) {
      setSubmitError('You must be logged in to generate apps');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const effectiveAppName = startType === 'new'
        ? (appName.trim() || prompt.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30))
        : (userApps.find(app => app.id === selectedAppId)?.appName || 'unknown-app');

      const selectedApp = startType === 'resume' ? userApps.find(app => app.id === selectedAppId) : null;
      if (startType === 'resume' && !selectedApp) {
        setSubmitError('Please select an app to resume');
        setIsSubmitting(false);
        return;
      }

      let generationRequest: any;
      let uploadedAttachments: AttachmentInfo[] = [];

      if (pendingFiles.length > 0) {
        setUploadProgress(true);

        const formData = new FormData();
        formData.append('data', JSON.stringify({
          appName: effectiveAppName,
          prompt: prompt.trim(),
          mode,
          maxIterations,
          ...(startType === 'resume' && selectedApp ? {
            generationType: 'resume' as const,
            appId: selectedApp.appUuid,
          } : {
            generationType: 'new' as const,
          }),
        }));

        for (const pf of pendingFiles) {
          formData.append('files', pf.file);
        }

        const accessToken = getAuthToken();

        const uploadResponse = await fetch('/api/generations/with-attachments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        setUploadProgress(false);

        if (!uploadResponse.ok) {
          if (uploadResponse.status === 401 || uploadResponse.status === 403) {
            throw new Error('Your session has expired. Please log in again.');
          }
          const errorBody = await uploadResponse.json();
          throw new Error(errorBody.error || 'Failed to upload files');
        }

        generationRequest = await uploadResponse.json();
        uploadedAttachments = generationRequest.attachments || [];
      } else {
        const response = await apiClient.generations.create({
          body: {
            appName: effectiveAppName,
            prompt: prompt.trim(),
            mode,
            maxIterations,
            ...(startType === 'resume' && selectedApp ? {
              generationType: 'resume' as const,
              appId: selectedApp.appUuid,
              githubUrl: selectedApp.githubUrl || undefined,
              deploymentUrl: selectedApp.deploymentUrl || undefined,
            } : {
              generationType: 'new' as const,
            }),
          },
        });

        if (response.status !== 201) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Your session has expired. Please log in again.');
          }
          const errorBody = response.body as { error: string };
          throw new Error(errorBody.error || 'Failed to create generation request');
        }

        generationRequest = response.body;
      }

      if (startType === 'new') {
        startGeneration({
          requestId: generationRequest.id,
          prompt: prompt.trim(),
          mode,
          appName: effectiveAppName,
          userId,
          appId: generationRequest.appUuid,
          maxIterations,
          enableSubagents,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        });
      } else {
        startGeneration({
          requestId: generationRequest.id,
          prompt: prompt.trim(),
          mode,
          appName: selectedApp!.appName,
          userId,
          appId: generationRequest.appUuid,
          maxIterations,
          enableSubagents,
          githubUrl: selectedApp!.githubUrl || undefined,
          resumeSessionId: resumeSessionId || undefined,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        });
      }

      setPrompt('');
      setPendingFiles([]);
      setShowNewTab(false);
      refreshActiveGenerations();
    } catch (error) {
      console.error('[ConsolePage] Failed to create generation:', error);
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          setSubmitError('Your session has expired. Please log in again.');
        } else if (status === 429) {
          const body = (error as any).body;
          setSubmitError(body?.error || 'Concurrency limit reached. Please wait for a generation to complete.');
        } else {
          setSubmitError(error instanceof Error ? error.message : 'Failed to start generation');
        }
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Failed to start generation');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handlePromptResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt || !promptResponse.trim()) return;

    sendResponse(currentPrompt.id, promptResponse.trim());
    setPromptResponse('');
  };

  const handleCancel = () => {
    if (confirm('Cancel generation?\n\nYour work will be saved to GitHub before stopping. You can resume later from the saved state.')) {
      requestStop();
    }
  };

  // Update preview URL when completion has download_url
  if (completionInfo?.download_url && previewUrl === 'about:blank') {
    setPreviewUrl(completionInfo.download_url);
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      {/* Skip to main content - accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Subtle background pattern */}
      <div className="fixed inset-0 leo-dots-pattern opacity-20 pointer-events-none" aria-hidden="true" />

      {/* Header - Renaissance aesthetic */}
      <header className="relative z-10 border-b border-border bg-background/95 backdrop-blur-md" role="banner">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="group">
              <div className="hidden sm:block">
                <LeoLogo size="md" />
              </div>
              <div className="sm:hidden">
                <LeoLogoMark size={36} />
              </div>
            </Link>

            {/* Navigation Links + Status */}
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className="hidden md:flex items-center gap-2 mr-4 text-xs text-muted-foreground">
                {!isConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    Connecting...
                  </span>
                ) : !containerConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Server connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-leo-verdigris rounded-full" />
                    Container ready
                  </span>
                )}
              </div>

              {/* Generation Status Badges */}
              {isCancelling && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse">
                  Cancelling...
                </Badge>
              )}
              {isGenerating && !isCancelling && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/30 animate-pulse">
                  Generating...
                </Badge>
              )}
              {completionInfo && (
                <Badge variant="secondary" className="bg-leo-verdigris/10 text-leo-verdigris border-leo-verdigris/30">
                  Complete
                </Badge>
              )}

              {/* Nav Links - 44px touch targets */}
              <Link href="/apps">
                <button className="flex items-center gap-2 px-4 min-h-11 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200">
                  <LayoutGrid className="h-5 w-5" />
                  <span className="hidden sm:inline">My Apps</span>
                </button>
              </Link>
              <button className="flex items-center gap-2 px-4 min-h-11 text-sm font-medium text-primary bg-primary/10 rounded-xl">
                <TerminalIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Console</span>
              </button>

              {/* Feedback Button */}
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="flex items-center gap-2 px-4 min-h-11 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors btn-press focus-ring"
                title="Send Feedback"
                aria-label="Send Feedback"
              >
                <MessageSquarePlus className="w-5 h-5" />
                <span className="hidden sm:inline">Feedback</span>
              </button>

              {/* User Menu */}
              <div className="ml-2 pl-2 border-l border-border">
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Developer Token Warning Banner */}
      {profile && (profile.role === 'dev' || profile.role === 'admin') && !profile.hasClaudeToken && (
        <div className="relative z-10 bg-yellow-50 border-b border-yellow-200 px-4 py-2.5">
          <div className="max-w-full flex items-center justify-center gap-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
            <span className="text-yellow-800">
              <strong className="font-semibold">Developer token required.</strong>{' '}
              Configure your Claude API token to run app generations.
            </span>
            <Link href="/settings">
              <button className="flex items-center gap-1.5 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md transition-colors text-xs font-medium">
                <Settings className="h-3.5 w-3.5" />
                Go to Settings
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Generation Tabs */}
      {(activeGenerations.length > 0 || showNewTab) && (
        <GenerationTabs
          activeGenerations={activeGenerations}
          activeTabId={showNewTab ? null : activeTabId}
          onTabChange={(id) => {
            setActiveTabId(id);
            setShowNewTab(false);
          }}
          onNewTab={() => setShowNewTab(true)}
          concurrencyInfo={concurrencyInfo}
        />
      )}

      {/* Main Content - Resizable Split */}
      <main id="main-content" className="flex flex-1 overflow-hidden" role="main">
        {/* Left Panel - Console + Form */}
        <div
          className="flex flex-col bg-card transition-all duration-300"
          style={{ width: showPreviewPanel ? `${leftPanelWidth}%` : '100%' }}
        >
          {/* Tab Navigation - Console & Conversations only (removed History) */}
          <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'console' | 'conversations')}>
              <TabsList className="h-11 bg-transparent">
                <TabsTrigger value="console" className="flex items-center gap-2 min-h-9 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                  <TerminalIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Console</span>
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center gap-2 min-h-9 px-4 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Conversations</span>
                  {conversationLogs.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs bg-primary/20 text-primary">
                      {conversationLogs.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab !== 'console' ? 'hidden' : ''}`}>
            {/* Terminal Display - Keep dark for contrast */}
            <div className="flex-1 overflow-hidden bg-[#0a0a0f] relative">
              {/* Welcome State - Hide when connected (terminal shows status) or has messages or is generating */}
              {messages.length === 0 && !isGenerating && !isConnected && showNewTab && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0a0a0f]/98 animate-fade-in-up">
                  <div className="text-center max-w-lg px-6">
                    <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-leo-sienna/20 to-leo-gold/20 flex items-center justify-center shadow-warm">
                      <Sparkles className="w-10 h-10 text-leo-sienna" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-4">
                      Welcome to Leo Console
                    </h2>
                    <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                      Describe your app idea below and watch it come to life. Leo will generate a production-ready application with authentication, database, and deployment.
                    </p>
                    <div className="space-y-3 text-left bg-white/5 rounded-xl p-5 border border-white/10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Try something like:</p>
                      <p className="text-sm text-gray-300">"A project management app for remote teams"</p>
                      <p className="text-sm text-gray-300">"An invoice generator for freelancers"</p>
                      <p className="text-sm text-gray-300">"A recipe sharing platform with AI suggestions"</p>
                    </div>
                  </div>
                </div>
              )}
              <REPLTerminal
                messages={messages}
                isConnected={isConnected}
                containerConnected={containerConnected}
              />
            </div>

            {/* Decision Prompt UI */}
            {currentPrompt && (
              <div className="flex-shrink-0 border-t border-border bg-card p-4">
                <div className="mb-3">
                  <span className="text-sm font-medium text-foreground">
                    {currentPrompt.prompt}
                  </span>
                </div>

                {currentPrompt.options && currentPrompt.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {currentPrompt.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => sendResponse(currentPrompt.id, option as string)}
                        className="px-4 py-2 text-sm bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors min-h-11"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {currentPrompt.allow_editor && (
                  <form onSubmit={handlePromptResponse} className="flex gap-2">
                    <input
                      type="text"
                      value={promptResponse}
                      onChange={(e) => setPromptResponse(e.target.value)}
                      placeholder="Custom response..."
                      className="flex-1 px-4 py-2 text-sm bg-input border border-border rounded-lg text-foreground"
                    />
                    <button
                      type="submit"
                      className="leo-btn-primary px-4 py-2 text-sm rounded-lg"
                    >
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Progress Display */}
            {isGenerating && progress && (
              <div className="flex-shrink-0 border-t border-border bg-card p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {progress.stage || 'Generating'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Iteration</span>
                    <span className="text-sm font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md">
                      {currentIteration}/{totalIterations}
                    </span>
                  </div>
                </div>

                {progress.step && (
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {progress.step}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2.5 mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-leo-sienna via-leo-gold to-leo-verdigris transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(5, (currentIteration / totalIterations) * 100)}%` }}
                  />
                </div>

                {/* Cancel Button */}
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex items-center justify-center gap-2 min-h-11 px-4 text-sm bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive rounded-xl transition-all duration-200 disabled:opacity-50 btn-press focus-ring"
                  aria-label="Cancel current generation"
                >
                  {isCancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Cancel Generation</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Input Form Panel - Compact layout for maximum console space */}
            <div className="flex-shrink-0 border-t border-border bg-card">
              <form onSubmit={handleSubmit} className="p-3 space-y-2">
                {/* Hidden File Input */}
                <input
                  type="file"
                  id="file-attachment-input"
                  multiple
                  accept={ATTACHMENT_LIMITS.ALLOWED_EXTENSIONS.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Collapsible Settings Panel - Expanded by default, collapses during generation */}
                {settingsExpanded && (
                  <div className="p-2 bg-muted/30 border border-border rounded-xl animate-fade-in-up">
                    {/* All controls on one row - compact and space-efficient */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* New/Resume Toggle */}
                      <div className="flex rounded-md border border-border overflow-hidden bg-background">
                        <button
                          type="button"
                          onClick={() => setStartType('new')}
                          disabled={isGenerating && !showNewTab}
                          className={`px-2 py-1 text-xs font-medium transition-all ${
                            startType === 'new'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          New
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStartType('resume');
                            fetchApps();
                          }}
                          disabled={isGenerating && !showNewTab}
                          className={`px-2 py-1 text-xs font-medium transition-all ${
                            startType === 'resume'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          Resume
                        </button>
                      </div>

                      {/* App Name or App Selection - compact */}
                      {startType === 'new' ? (
                        <input
                          type="text"
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          placeholder="App name"
                          disabled={isGenerating && !showNewTab}
                          className="leo-input text-xs py-1 px-2 w-24"
                        />
                      ) : (
                        <>
                          <select
                            value={selectedAppId ?? ''}
                            onChange={(e) => setSelectedAppId(e.target.value ? parseInt(e.target.value) : null)}
                            disabled={(isGenerating && !showNewTab) || appsLoading || userApps.length === 0}
                            className="leo-input text-xs py-1 px-2 w-28"
                          >
                            <option value="">
                              {appsLoading ? 'Loading...' : userApps.length === 0 ? 'No apps' : 'Select app'}
                            </option>
                            {userApps.map((app) => (
                              <option key={app.id} value={app.id}>
                                {app.appName}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={resumeSessionId}
                            onChange={(e) => setResumeSessionId(e.target.value)}
                            placeholder="Session"
                            disabled={isGenerating && !showNewTab}
                            className="leo-input text-xs py-1 px-2 w-20"
                          />
                        </>
                      )}

                      {/* Mode Toggle */}
                      <div className="flex rounded-md border border-border overflow-hidden bg-background">
                        <button
                          type="button"
                          onClick={() => setMode('autonomous')}
                          disabled={isGenerating && !showNewTab}
                          className={`px-2 py-1 text-xs font-medium transition-all ${
                            mode === 'autonomous'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                          title="Run iterations automatically"
                        >
                          Auto
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode('confirm_first')}
                          disabled={isGenerating && !showNewTab}
                          className={`px-2 py-1 text-xs font-medium transition-all ${
                            mode === 'confirm_first'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                          title="Confirm each iteration"
                        >
                          Confirm
                        </button>
                      </div>

                      {/* Iterations - compact */}
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-background border border-border rounded-md">
                        <span className="text-xs text-muted-foreground">Iterations:</span>
                        <input
                          type="range"
                          value={maxIterations}
                          onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                          disabled={isGenerating && !showNewTab}
                          min={1}
                          max={20}
                          className="w-12 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <span className="text-xs text-foreground font-semibold w-4">{maxIterations}</span>
                      </div>

                      {completionInfo && (
                        <button
                          type="button"
                          onClick={clearMessages}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Collapsed Settings - show summary of current settings */}
                {!settingsExpanded && (
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-muted/20 rounded-lg">
                    <span className="text-xs text-muted-foreground">
                      {startType === 'new' ? 'New' : 'Resume'} • {mode === 'autonomous' ? 'Auto' : 'Confirm'} • {maxIterations} iterations
                    </span>
                    {completionInfo && (
                      <button
                        type="button"
                        onClick={clearMessages}
                        className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Attached Files Display */}
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pendingFiles.map((pf) => (
                      <div key={pf.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-muted border border-border rounded-md text-xs">
                        {getFileIcon(pf.file.name)}
                        <span className="max-w-[80px] truncate text-foreground">{pf.file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(pf.id)}
                          className="p-0.5 hover:bg-destructive/20 rounded transition-colors"
                          title="Remove file"
                          aria-label={`Remove ${pf.file.name}`}
                        >
                          <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {submitError && (
                  <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Compact Input Row: Actions + Textarea + Generate all inline */}
                <div className="flex items-end gap-2">
                  {/* Left action buttons - compact */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {/* Settings Toggle - icon only */}
                    <button
                      type="button"
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 border ${
                        settingsExpanded
                          ? 'bg-primary/10 border-primary/50 text-primary'
                          : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-muted/80'
                      }`}
                      aria-label={settingsExpanded ? 'Hide settings' : 'Show settings'}
                      aria-expanded={settingsExpanded}
                      title={settingsExpanded ? 'Hide settings' : 'Show settings'}
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Attach Files Button */}
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-attachment-input')?.click()}
                      disabled={(isGenerating && !showNewTab) || isSubmitting || !isConnected || pendingFiles.length >= ATTACHMENT_LIMITS.MAX_FILES}
                      className="w-9 h-9 flex items-center justify-center bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 border border-border"
                      title={`Attach files (${pendingFiles.length}/${ATTACHMENT_LIMITS.MAX_FILES})`}
                      aria-label="Attach files"
                    >
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {/* Voice Input Button */}
                    <div className="w-9 h-9 flex items-center justify-center">
                      <VoiceInput
                        onTranscription={(text) => {
                          setPrompt((prev) => prev ? `${prev} ${text}` : text);
                        }}
                        onError={(error) => {
                          console.error('[ConsolePage] Voice input error:', error);
                        }}
                        disabled={(isGenerating && !showNewTab) || isSubmitting || !isConnected}
                      />
                    </div>
                  </div>

                  {/* Textarea - Takes remaining space, taller for more input room */}
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      startType === 'new'
                        ? 'Describe your app idea...'
                        : 'What changes would you like?'
                    }
                    disabled={(isGenerating && !showNewTab) || isSubmitting || !isConnected || (startType === 'resume' && selectedAppId === null && userApps.length > 0)}
                    rows={4}
                    className="flex-1 px-3 py-2 bg-input border-2 border-border rounded-xl text-foreground text-sm leading-relaxed placeholder:text-muted-foreground/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none disabled:opacity-50 min-h-[88px]"
                  />

                  {/* Generate Button - Compact, right side, matches textarea height */}
                  <button
                    type="submit"
                    disabled={!prompt.trim() || (isGenerating && !showNewTab) || isSubmitting || uploadProgress || !isConnected || (startType === 'resume' && selectedAppId === null && userApps.length > 0)}
                    className="leo-btn-primary h-[88px] px-4 text-sm rounded-xl flex flex-col items-center justify-center gap-0.5 focus-ring whitespace-nowrap flex-shrink-0"
                    aria-label="Generate app"
                  >
                    {uploadProgress || isSubmitting || (isGenerating && !showNewTab) ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs">Working</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="text-xs">Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Conversations Tab */}
          <div className={`flex-1 overflow-hidden bg-[#0a0a0f] ${activeTab !== 'conversations' ? 'hidden' : ''}`}>
            <ConversationsTerminal conversationLogs={conversationLogs} />
          </div>
        </div>

        {/* Resizable Divider */}
        {showPreviewPanel && (
          <ResizableDivider
            position={leftPanelWidth}
            onPositionChange={setLeftPanelWidth}
            minPosition={25}
            maxPosition={75}
          />
        )}

        {/* Right Panel - Browser Preview / Screenshots */}
        {showPreviewPanel && (
          <div
            className="flex flex-col bg-card animate-fade-in-up border-l border-border"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground">
                {previewUrl && previewUrl !== 'about:blank'
                  ? 'Browser Preview'
                  : 'Live Screenshots'}
              </h2>
              <div className="flex items-center gap-3">
                {screenshots.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}
                  </span>
                )}
                {previewUrl && previewUrl !== 'about:blank' && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Open in new tab
                  </a>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {previewUrl && previewUrl !== 'about:blank' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="Browser Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <ScreenshotPreview screenshots={screenshots} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        sourcePage="console"
      />

      {/* Credential Request Modal (Dynamic Secrets) */}
      <CredentialRequestModal
        credentialRequest={currentCredentialRequest}
        onSubmit={sendCredentialResponse}
        timeoutWarning={credentialTimeoutWarning}
      />
    </div>
  );
}
