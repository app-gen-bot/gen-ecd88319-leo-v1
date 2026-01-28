import { Share2, Copy } from 'lucide-react';
import QRCodeSVG from 'react-qr-code';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  value: string;
  size?: 'sm' | 'md' | 'lg';
  onShare?: () => void;
  onCopy?: () => void;
  className?: string;
}

/**
 * QRCodeDisplay component
 * Generate and display QR code from FizzCard ID
 */
export function QRCodeDisplay({
  value,
  size = 'md',
  onShare,
  onCopy,
  className,
}: QRCodeDisplayProps) {
  const sizeMap = {
    sm: 200,
    md: 280,
    lg: 320,
  };

  const qrSize = sizeMap[size];

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* QR Code Container */}
      <div
        className="relative inline-flex items-center justify-center p-8 bg-background-secondary rounded-3xl border-4 border-primary-500 animate-glowPulse"
        style={{
          boxShadow:
            '0 0 40px rgba(0, 217, 255, 0.4), 0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* QR Code */}
        <div className="bg-white rounded-2xl p-4">
          <QRCodeSVG
            value={value}
            size={qrSize}
            level="H"
            fgColor="#00D9FF"
            bgColor="#FFFFFF"
          />
        </div>

        {/* Center logo glow */}
        <div
          className="absolute w-12 h-12 rounded-full bg-primary-500 pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(0, 217, 255, 0.6)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Action Buttons */}
      {(onShare || onCopy) && (
        <div className="flex items-center gap-3">
          {onShare && (
            <Button
              variant="primary"
              size="md"
              onClick={onShare}
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          )}
          {onCopy && (
            <Button
              variant="secondary"
              size="md"
              onClick={onCopy}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
