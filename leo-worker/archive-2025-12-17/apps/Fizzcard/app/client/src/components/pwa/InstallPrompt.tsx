import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '../ui/Button';

/**
 * BeforeInstallPromptEvent interface
 * TypeScript definition for the beforeinstallprompt event
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA Install Prompt Component
 * Shows a prompt to install the app when beforeinstallprompt event fires
 */
export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[Install] User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-lg border border-cyan-500/20 rounded-lg p-4 shadow-lg">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          aria-label="Close install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <Download className="h-5 w-5 text-cyan-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">Install FizzCard</h3>
            <p className="text-sm text-gray-300 mb-3">
              Add to your home screen for quick access and offline use.
            </p>
            <Button onClick={handleInstall} size="sm" className="w-full">
              Install App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
