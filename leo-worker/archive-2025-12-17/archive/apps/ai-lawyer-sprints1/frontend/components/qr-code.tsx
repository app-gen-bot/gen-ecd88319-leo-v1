"use client"

import { useEffect, useRef } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 200, className }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    // Simple QR code generation for TOTP URIs
    // In production, you'd use a library like qrcode.js
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // For now, we'll create a placeholder pattern
    // In real implementation, use a QR library
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Draw a pattern to indicate QR code
    const moduleSize = size / 25; // QR codes are typically 25x25 modules
    
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Create a deterministic pattern based on the value
        const hash = value.charCodeAt((row * 25 + col) % value.length);
        if (hash % 2 === 0) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    // Add positioning squares (QR code feature)
    ctx.fillStyle = '#000000';
    // Top-left
    ctx.fillRect(0, 0, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(moduleSize, moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    
    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(18 * moduleSize, 0, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(19 * moduleSize, moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(20 * moduleSize, 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    
    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 18 * moduleSize, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(moduleSize, 19 * moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2 * moduleSize, 20 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    
  }, [value, size]);

  if (!value) return null;

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}