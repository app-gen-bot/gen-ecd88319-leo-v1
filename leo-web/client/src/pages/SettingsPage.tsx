import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
  Settings,
  Key,
  Check,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Settings Page - User settings management
 *
 * Features:
 * - Claude API Token configuration (for dev/admin roles only)
 * - Token validation before saving
 * - Masked display of saved tokens
 */

interface TokenStatus {
  configured: boolean;
  masked: string | null;
  canConfigure: boolean;
  role: string;
}

export default function SettingsPage() {
  const { session, profile, refreshProfile } = useAuth();
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch token status
  useEffect(() => {
    const fetchTokenStatus = async () => {
      if (!session?.access_token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/settings/claude-token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setTokenStatus(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch token status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenStatus();
  }, [session]);

  const handleSaveToken = async () => {
    if (!session?.access_token || !tokenInput.trim()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/claude-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setTokenStatus({
          ...tokenStatus!,
          configured: true,
          masked: data.data.masked,
        });
        setTokenInput('');
        setSuccess('Token saved successfully!');
        refreshProfile(); // Refresh profile to update hasClaudeToken
      } else {
        setError(data.error || 'Failed to save token');
      }
    } catch (err) {
      setError('Failed to save token - network error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveToken = async () => {
    if (!session?.access_token) return;

    setIsRemoving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/settings/claude-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token: null }),
      });

      const data = await response.json();

      if (data.success) {
        setTokenStatus({
          ...tokenStatus!,
          configured: false,
          masked: null,
        });
        setSuccess('Token removed');
        refreshProfile();
      } else {
        setError(data.error || 'Failed to remove token');
      }
    } catch (err) {
      setError('Failed to remove token - network error');
    } finally {
      setIsRemoving(false);
    }
  };

  const canConfigureToken = tokenStatus?.canConfigure || profile?.role === 'dev' || profile?.role === 'admin';

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-leo-primary" />
            <h1 className="text-3xl font-bold text-leo-text">Settings</h1>
          </div>
          <p className="text-leo-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-leo-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Claude Token Section - Only for dev/admin */}
            {canConfigureToken && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Key className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-leo-text mb-1">
                      Claude Token
                    </h2>
                    <p className="text-leo-text-secondary text-sm">
                      Required for developers to run app generations. Use your OAuth token
                      from Claude Pro/Max (run <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">claude config get oauthToken</code>)
                      or an API key from{' '}
                      <a
                        href="https://console.anthropic.com/settings/keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-leo-primary hover:underline inline-flex items-center gap-1"
                      >
                        console.anthropic.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mb-6">
                  {tokenStatus?.configured ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="h-5 w-5" />
                      <span className="font-medium">Token configured</span>
                      <span className="text-leo-text-tertiary ml-2">
                        ({tokenStatus.masked})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">
                        Token required to run generations
                      </span>
                    </div>
                  )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Token Input */}
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="sk-ant-..."
                      className={cn(
                        'w-full px-4 py-3 pr-12 rounded-xl',
                        'bg-white/5 border border-white/10',
                        'text-leo-text placeholder:text-leo-text-tertiary',
                        'focus:outline-none focus:ring-2 focus:ring-leo-primary/50 focus:border-leo-primary/50',
                        'font-mono text-sm'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-leo-text-tertiary hover:text-leo-text-secondary"
                    >
                      {showToken ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {/* Token type indicator */}
                  {tokenInput && tokenInput.startsWith('sk-ant-') && (
                    <div className={cn(
                      'p-3 rounded-lg text-sm flex items-start gap-2',
                      tokenInput.startsWith('sk-ant-api03-')
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : tokenInput.startsWith('sk-ant-oat01-')
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 border border-white/10 text-leo-text-tertiary'
                    )}>
                      {tokenInput.startsWith('sk-ant-api03-') ? (
                        <>
                          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>API Key detected</strong> — You will be charged per token used.
                            Consider using an OAuth token from Claude Pro/Max for flat-rate billing.
                          </div>
                        </>
                      ) : tokenInput.startsWith('sk-ant-oat01-') ? (
                        <>
                          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong>OAuth token detected</strong> — Uses your Claude Pro/Max subscription (flat-rate).
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSaveToken}
                      disabled={isSaving || !tokenInput.trim()}
                      className="leo-btn-primary"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Validating...
                        </>
                      ) : (
                        'Save Token'
                      )}
                    </Button>

                    {tokenStatus?.configured && (
                      <Button
                        onClick={handleRemoveToken}
                        disabled={isRemoving}
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        {isRemoving ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Remove Token
                      </Button>
                    )}
                  </div>
                </div>

                {/* Help text */}
                <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-sm text-leo-text-tertiary">
                    <strong className="text-leo-text-secondary">How it works:</strong>{' '}
                    As a developer, you must provide your own Claude token (OAuth token or API key)
                    to run app generations. Your token is stored securely and used only for
                    your generation requests. OAuth tokens from Claude Pro/Max are recommended
                    for flat-rate billing.
                  </p>
                </div>
              </div>
            )}

            {/* Regular users see a different message */}
            {!canConfigureToken && (
              <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Check className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-leo-text">
                      Account Settings
                    </h2>
                    <p className="text-sm text-leo-text-secondary">
                      Your account is ready to use
                    </p>
                  </div>
                </div>
                <p className="text-leo-text-secondary">
                  No additional configuration is required. Your generations use
                  the shared Leo platform resources.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
