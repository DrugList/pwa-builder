'use client';

import { useState } from 'react';
import { Download, Share, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePWA } from '@/hooks/use-pwa';

export function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  // Detect iOS
  if (typeof window !== 'undefined') {
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isApple && !isIOS) setIsIOS(true);
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsOpen(false);
    }
  };

  // Don't show if already installed
  if (isInstalled) return null;

  return (
    <>
      {/* Floating install button */}
      {isInstallable && !isIOS && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-50 h-12 w-12"
          size="icon"
        >
          <Download className="h-5 w-5" />
        </Button>
      )}

      {/* iOS instructions */}
      {isIOS && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-50 h-12 w-12"
          size="icon"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install App</DialogTitle>
            <DialogDescription>
              Add this app to your home screen for the best experience.
            </DialogDescription>
          </DialogHeader>

          {!isIOS ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Install this app on your device for quick access, offline support, and a native app experience.
              </p>
              <div className="flex gap-2">
                <Button onClick={handleInstall} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Install Now
                </Button>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Later
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To install on iOS:
              </p>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    1
                  </span>
                  <span className="flex items-center gap-1">
                    Tap the
                    <Share className="h-4 w-4 inline mx-1" />
                    Share button
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    2
                  </span>
                  <span>Scroll down and tap &quot;Add to Home Screen&quot;</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    3
                  </span>
                  <span>Tap &quot;Add&quot; in the top right corner</span>
                </li>
              </ol>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
