/**
 * ConsolePage Component
 *
 * Leo Console interface with ChatGPT-style layout:
 * - Top: xterm.js terminal streaming WSI messages
 * - Bottom: Input form with prompt textarea, mode selector, max-iterations
 * - Right: Browser preview iframe (50/50 split)
 *
 * Uses WSI Protocol v2.1 - browser speaks directly to container
 * No message translation - same protocol as Leo Remote CLI
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Terminal as TerminalIcon,
  ArrowUp,
  XCircle,
  History,
  MessageSquare,
  Activity,
} from 'lucide-react';
import { useWsi } from '../hooks/useWsi';
import { useAuth } from '../contexts/AuthContext';
import REPLTerminal from '../components/terminal/REPLTerminal';
import ConversationsTerminal from '../components/terminal/ConversationsTerminal';
import ProcessMonitorTab from '../components/ProcessMonitorTab';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { apiClient } from '../lib/api-client';

type GenerationMode = 'autonomous' | 'confirm_first';
type StartType = 'new' | 'resume';

// User app summary from API
// Contains all fields needed for resume generation request
interface UserApp {
  id: number;
  appId: string;
  appName: string;
  githubUrl: string | null;
  deploymentUrl: string | null;  // Fly.io URL for resume
  lastSessionId: string | null;
  updatedAt: string;
  status: string;
}

/**
 * ConsolePage Component
 */
export default function ConsolePage() {
  const [, setLocation] = useLocation();

  // Auth hook - get current user
  const { user } = useAuth();

  // WSI hook - handles all WebSocket communication
  const {
    isConnected,
    containerConnected,
    isGenerating,
    isCancelling,
    messages,
    conversationLogs,
    processMonitorUpdates,
    currentPrompt,
    progress,
    completionInfo,
    startGeneration,
    sendResponse,
    // sendControl, // Pause not yet implemented in container
    requestStop,
    clearMessages,
  } = useWsi();

  // Preview state
  const [previewUrl, setPreviewUrl] = useState<string>('about:blank');

  // Form state - Start Type and Mode
  const [startType, setStartType] = useState<StartType>('new');
  const [mode, setMode] = useState<GenerationMode>('autonomous');

  // New app fields
  const [prompt, setPrompt] = useState<string>('');
  const [appName, setAppName] = useState<string>('');

  // Resume fields
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [resumeSessionId, setResumeSessionId] = useState<string>('');

  // Common settings
  const [maxIterations, setMaxIterations] = useState<number>(10);
  const [enableSubagents, setEnableSubagents] = useState<boolean>(true);

  // User's apps for Resume dropdown
  const [userApps, setUserApps] = useState<UserApp[]>([]);
  const [appsLoading, setAppsLoading] = useState<boolean>(false);

  // Submission state (REST API call before WebSocket)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch user's apps - extracted so it can be called on mount and when switching to Resume tab
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

  // Tab state for Console, Conversations, Monitor, History
  const [activeTab, setActiveTab] = useState<'console' | 'conversations' | 'monitor' | 'history'>('console');

  // Decision prompt response
  const [promptResponse, setPromptResponse] = useState<string>('');

  // Current iteration from progress
  const currentIteration = progress?.iteration || 0;
  const totalIterations = progress?.total_iterations || maxIterations;

  /**
   * Handle form submission - REST API first, then WebSocket
   *
   * Flow:
   * 1. POST /api/generations - Create database record (returns id, appId)
   * 2. wsi.startGeneration() - Start generation via WebSocket with requestId
   *
   * This separation keeps REST for CRUD and WebSocket for real-time streaming.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || isGenerating || isSubmitting || !isConnected) {
      return;
    }

    // Get userId from auth context (Supabase UUID)
    const userId = user?.id;
    if (!userId) {
      setSubmitError('You must be logged in to generate apps');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Determine app name
      const effectiveAppName = startType === 'new'
        ? (appName.trim() || prompt.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30))
        : (userApps.find(app => app.id === selectedAppId)?.appName || 'unknown-app');

      // For resume, validate app selection
      const selectedApp = startType === 'resume' ? userApps.find(app => app.id === selectedAppId) : null;
      if (startType === 'resume' && !selectedApp) {
        setSubmitError('Please select an app to resume');
        setIsSubmitting(false);
        return;
      }

      // Step 1: Create generation record via REST API
      // For resume: pass appId, githubUrl, deploymentUrl from original app
      console.log('[ConsolePage] Creating generation request via REST API...');
      const response = await apiClient.generations.create({
        body: {
          appName: effectiveAppName,
          prompt: prompt.trim(),
          mode,
          maxIterations,
          // Resume fields - copied from original app
          ...(startType === 'resume' && selectedApp ? {
            generationType: 'resume' as const,
            appId: selectedApp.appId,
            githubUrl: selectedApp.githubUrl || undefined,
            deploymentUrl: selectedApp.deploymentUrl || undefined,
          } : {
            generationType: 'new' as const,
          }),
        },
      });

      if (response.status !== 201) {
        const errorBody = response.body as { error: string };
        throw new Error(errorBody.error || 'Failed to create generation request');
      }

      const generationRequest = response.body;
      console.log('[ConsolePage] Generation request created:', generationRequest.id, 'appId:', generationRequest.appId);

      // Step 2: Start generation via WebSocket with requestId
      console.log('[ConsolePage] Starting generation via WebSocket with requestId:', generationRequest.id);

      if (startType === 'new') {
        startGeneration({
          requestId: generationRequest.id,
          prompt: prompt.trim(),
          mode,
          appName: effectiveAppName,
          userId,
          appId: generationRequest.appId,
          maxIterations,
          enableSubagents,
        });
      } else {
        // Resume existing app
        startGeneration({
          requestId: generationRequest.id,
          prompt: prompt.trim(),
          mode,
          appName: selectedApp!.appName,
          userId,
          appId: generationRequest.appId,
          maxIterations,
          enableSubagents,
          // Resume fields - clone from GitHub
          githubUrl: selectedApp!.githubUrl || undefined,
          resumeSessionId: resumeSessionId || selectedApp!.lastSessionId || undefined,
        });
      }

      // Clear prompt for next input
      setPrompt('');
    } catch (error) {
      console.error('[ConsolePage] Failed to create generation:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to start generation');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle textarea keyboard shortcuts (Cmd/Ctrl+Enter to submit)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  /**
   * Handle decision prompt response
   */
  const handlePromptResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPrompt || !promptResponse.trim()) return;

    sendResponse(currentPrompt.prompt_id, promptResponse.trim());
    setPromptResponse('');
  };

  /**
   * Handle control commands - Cancel (Pause not yet implemented in container)
   */
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
    <div className="flex flex-col h-screen bg-leo-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-leo-bg-secondary border-b border-leo-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation('/apps')}
            className="p-2 hover:bg-leo-bg-hover rounded-lg transition-colors"
            title="Back to Apps"
          >
            <ArrowLeft className="w-5 h-5 text-leo-text-secondary" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-leo-primary to-purple-500 flex items-center justify-center shadow-glow-sm">
              <TerminalIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-leo-text">Leo Console</h1>
              <p className="text-xs text-leo-text-secondary">
                {!isConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
                    Connecting to server...
                  </span>
                ) : !containerConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Server connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Container ready
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCancelling && (
            <Badge variant="secondary" className="bg-yellow-600 animate-pulse">
              Cancelling...
            </Badge>
          )}
          {isGenerating && !isCancelling && (
            <Badge variant="secondary" className="animate-pulse">
              Generating...
            </Badge>
          )}
          {completionInfo && (
            <Badge variant="default" className="bg-green-600">
              Complete
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content - 50/50 Split */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Console + Form */}
        <div className="w-1/2 flex flex-col bg-leo-bg border-r border-leo-border">
          {/* Tab Navigation */}
          <div className="flex-shrink-0 border-b border-leo-border bg-leo-bg-secondary px-4 py-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'console' | 'conversations' | 'monitor' | 'history')}>
              <TabsList>
                <TabsTrigger value="console" className="flex items-center gap-2">
                  <TerminalIcon className="w-4 h-4" />
                  Console
                </TabsTrigger>
                <TabsTrigger value="conversations" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Conversations
                  {conversationLogs.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {conversationLogs.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="monitor" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Monitor
                  {processMonitorUpdates.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {processMonitorUpdates.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  History
                  {currentIteration > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {currentIteration}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content - use CSS hiding to preserve terminal state */}
          <div className={`flex-1 flex flex-col overflow-hidden ${activeTab !== 'console' ? 'hidden' : ''}`}>
            {/* Terminal Display */}
            <div className="flex-1 overflow-hidden bg-[#09090b]">
              <REPLTerminal
                messages={messages}
                isConnected={isConnected}
                containerConnected={containerConnected}
              />
            </div>

              {/* Decision Prompt UI */}
              {currentPrompt && (
                <div className="flex-shrink-0 border-t border-leo-border bg-leo-bg-secondary p-3">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-leo-text">
                      {currentPrompt.question}
                    </span>
                  </div>

                  {currentPrompt.options && currentPrompt.options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {currentPrompt.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => sendResponse(currentPrompt.prompt_id, option)}
                          className="px-3 py-1.5 text-sm bg-leo-bg-tertiary hover:bg-leo-bg-hover border border-leo-border rounded-lg transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {currentPrompt.allow_custom && (
                    <form onSubmit={handlePromptResponse} className="flex gap-2">
                      <input
                        type="text"
                        value={promptResponse}
                        onChange={(e) => setPromptResponse(e.target.value)}
                        placeholder="Custom response..."
                        className="flex-1 px-3 py-1.5 text-sm bg-leo-bg-tertiary border border-leo-border rounded-lg text-leo-text"
                      />
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-sm bg-leo-primary hover:bg-leo-primary-dark text-white rounded-lg"
                      >
                        Send
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Progress Display */}
              {isGenerating && progress && (
                <div className="flex-shrink-0 border-t border-leo-border bg-leo-bg-secondary p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-leo-text">
                      {progress.stage || 'Generating'}
                      {progress.step && ` - ${progress.step}`}
                    </span>
                    <span className="text-sm text-leo-text-secondary">
                      {currentIteration}/{totalIterations}
                    </span>
                  </div>
                  <div className="w-full bg-leo-bg-tertiary rounded-full h-2 mb-3">
                    <div
                      className="bg-leo-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentIteration / totalIterations) * 100}%` }}
                    />
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-2">
                    {/* Pause button hidden - not implemented in container yet */}
                    <button
                      onClick={handleCancel}
                      disabled={isCancelling}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCancelling ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Input Form Panel - New Layout */}
              <div className="flex-shrink-0 border-t border-leo-border bg-leo-bg-secondary">
                <form onSubmit={handleSubmit} className="p-3 space-y-3">
                  {/* Row 1: New/Resume Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-leo-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setStartType('new')}
                        disabled={isGenerating}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          startType === 'new'
                            ? 'bg-leo-primary text-white'
                            : 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover'
                        }`}
                      >
                        New App
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setStartType('resume');
                          fetchApps(); // Refresh apps list when switching to Resume
                        }}
                        disabled={isGenerating}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          startType === 'resume'
                            ? 'bg-leo-primary text-white'
                            : 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover'
                        }`}
                      >
                        Resume
                      </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex rounded-lg border border-leo-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setMode('autonomous')}
                        disabled={isGenerating}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          mode === 'autonomous'
                            ? 'bg-amber-600 text-white'
                            : 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover'
                        }`}
                        title="Run iterations automatically without stopping"
                      >
                        Autonomous
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('confirm_first')}
                        disabled={isGenerating}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                          mode === 'confirm_first'
                            ? 'bg-amber-600 text-white'
                            : 'bg-leo-bg-tertiary text-leo-text-secondary hover:bg-leo-bg-hover'
                        }`}
                        title="Ask for approval before each iteration"
                      >
                        Confirm First
                      </button>
                    </div>

                    {completionInfo && (
                      <button
                        type="button"
                        onClick={clearMessages}
                        className="ml-auto text-xs text-leo-text-tertiary hover:text-leo-text-secondary"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Row 2: Conditional Fields - App Name or App Selection */}
                  {startType === 'new' ? (
                    <input
                      type="text"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="App name (optional - will auto-generate from prompt)"
                      disabled={isGenerating}
                      className="w-full px-3 py-1.5 text-xs bg-leo-bg-tertiary border border-leo-border rounded-lg text-leo-text placeholder-leo-text-tertiary"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={selectedAppId ?? ''}
                        onChange={(e) => setSelectedAppId(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={isGenerating || appsLoading || userApps.length === 0}
                        className="flex-1 px-3 py-1.5 text-xs bg-leo-bg-tertiary border border-leo-border rounded-lg text-leo-text"
                      >
                        <option value="">
                          {appsLoading ? 'Loading apps...' : userApps.length === 0 ? 'No apps yet - create one first' : 'Select an app to resume...'}
                        </option>
                        {userApps.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.appName} (updated {new Date(app.updatedAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={resumeSessionId}
                        onChange={(e) => setResumeSessionId(e.target.value)}
                        placeholder="Session ID (optional)"
                        disabled={isGenerating}
                        className="w-32 px-2 py-1.5 text-xs bg-leo-bg-tertiary border border-leo-border rounded-lg text-leo-text placeholder-leo-text-tertiary"
                      />
                    </div>
                  )}

                  {/* Row 3: Settings - Always Visible */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-leo-text-secondary whitespace-nowrap">
                        Iterations:
                      </label>
                      <input
                        type="range"
                        value={maxIterations}
                        onChange={(e) => setMaxIterations(parseInt(e.target.value))}
                        disabled={isGenerating}
                        min={1}
                        max={20}
                        className="w-20 h-1.5 bg-leo-bg-tertiary rounded-lg appearance-none cursor-pointer accent-leo-primary"
                      />
                      <span className="text-xs text-leo-text font-medium w-4">{maxIterations}</span>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={enableSubagents}
                        onChange={(e) => setEnableSubagents(e.target.checked)}
                        disabled={isGenerating}
                        className="w-3.5 h-3.5 rounded border-leo-border bg-leo-bg-tertiary text-leo-primary"
                      />
                      <span className="text-xs text-leo-text-secondary group-hover:text-leo-text transition-colors">
                        Subagents
                      </span>
                    </label>
                  </div>

                  {/* Error Message */}
                  {submitError && (
                    <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                      {submitError}
                    </div>
                  )}

                  {/* Row 4: Prompt Input */}
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={
                        startType === 'new'
                          ? 'Describe the app you want to create... (Cmd/Ctrl+Enter to submit)'
                          : 'Describe what changes or features to add... (Cmd/Ctrl+Enter to submit)'
                      }
                      disabled={isGenerating || isSubmitting || !isConnected || (startType === 'resume' && selectedAppId === null && userApps.length > 0)}
                      rows={2}
                      className="w-full px-3 py-2 pr-12 text-sm bg-leo-bg-tertiary border border-leo-border rounded-lg text-leo-text placeholder-leo-text-tertiary focus:outline-none focus:ring-2 focus:ring-leo-primary resize-none overflow-y-auto"
                      style={{ maxHeight: '120px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                      }}
                    />

                    <button
                      type="submit"
                      disabled={!prompt.trim() || isGenerating || isSubmitting || !isConnected || (startType === 'resume' && selectedAppId === null && userApps.length > 0)}
                      className="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center bg-leo-primary hover:bg-leo-primary-dark disabled:bg-leo-bg-tertiary disabled:cursor-not-allowed rounded-lg transition-colors shadow-glow-sm"
                      title={isSubmitting ? 'Creating...' : isGenerating ? 'Generating...' : 'Send prompt'}
                    >
                      {isSubmitting || isGenerating ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
          </div>

          {/* Conversations Tab - agent reasoning, tool use, etc. */}
          <div className={`flex-1 overflow-hidden bg-[#09090b] ${activeTab !== 'conversations' ? 'hidden' : ''}`}>
            <ConversationsTerminal conversationLogs={conversationLogs} />
          </div>

          {/* Monitor Tab - trajectory analysis */}
          <div className={`flex-1 overflow-hidden bg-leo-bg ${activeTab !== 'monitor' ? 'hidden' : ''}`}>
            <ProcessMonitorTab updates={processMonitorUpdates} />
          </div>

          {/* History Tab - placeholder for now */}
          <div className={`flex-1 flex items-center justify-center ${activeTab !== 'history' ? 'hidden' : ''}`}>
            <div className="text-center">
              <History className="w-12 h-12 text-leo-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-leo-text-secondary">
                Iteration history coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Browser Preview */}
        <div className="w-1/2 flex flex-col bg-leo-bg-secondary">
          <div className="flex items-center justify-between px-4 py-3 border-b border-leo-border">
            <h2 className="text-sm font-medium text-leo-text">Browser Preview</h2>
            {previewUrl && previewUrl !== 'about:blank' && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-leo-primary hover:underline"
              >
                Open in new tab
              </a>
            )}
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
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-leo-bg-tertiary flex items-center justify-center shadow-glow-sm">
                    <TerminalIcon className="w-8 h-8 text-leo-text-tertiary" />
                  </div>
                  <p className="text-leo-text-secondary text-sm mb-2">
                    No preview available
                  </p>
                  <p className="text-leo-text-tertiary text-xs max-w-md">
                    Start a generation to see the live preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
