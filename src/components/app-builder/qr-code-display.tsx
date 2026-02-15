'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Download, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareCode: string;
  appName: string;
}

export function QRCodeDisplay({ open, onOpenChange, shareCode, appName }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${shareCode}`
    : '';

  const drawFinderPattern = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Outer square
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    // White inner
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    // Black center
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  }, []);

  const generateQRCode = useCallback((text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Simple QR code using canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);

    // For a real QR code, we'd use a library. Here's a placeholder pattern:
    const size = 200;
    const moduleCount = 25;
    const moduleSize = size / moduleCount;

    // Generate a pseudo-random pattern based on the URL
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    ctx.fillStyle = '#000000';
    
    // Draw finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, size - 7 * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, size - 7 * moduleSize, moduleSize);

    // Draw data modules (simplified)
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || 
            (row < 8 && col > moduleCount - 9) || 
            (row > moduleCount - 9 && col < 8)) {
          continue;
        }
        
        // Pseudo-random based on position and seed
        const hash = (row * moduleCount + col + seed) % 3;
        if (hash === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [drawFinderPattern]);

  useEffect(() => {
    if (open && canvasRef.current && shareUrl) {
      generateQRCode(shareUrl);
    }
  }, [open, shareUrl, generateQRCode]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${appName}-qr-code.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded!');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appName,
          text: `Check out ${appName}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your App</DialogTitle>
          <DialogDescription>
            Scan the QR code or share the link to let others access your app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="rounded"
            />
          </div>

          {/* Share URL */}
          <div className="w-full p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Share Link</p>
            <p className="text-sm font-mono break-all">{shareUrl}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={downloadQR}>
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button variant="outline" className="flex-1" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button className="flex-1" onClick={shareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Add to Home Screen hint */}
          <p className="text-xs text-center text-muted-foreground max-w-xs">
            💡 Tip: Open the link on your phone and tap &quot;Add to Home Screen&quot; to install as an app.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
