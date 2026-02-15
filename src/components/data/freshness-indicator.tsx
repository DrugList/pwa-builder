'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FreshnessIndicatorProps {
  lastRefresh: Date | null;
  onRefresh: () => Promise<void>;
  isOffline?: boolean;
}

export function FreshnessIndicator({
  lastRefresh,
  onRefresh,
  isOffline = false,
}: FreshnessIndicatorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeAgo, setTimeAgo] = useState<string>('Never');

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastRefresh) {
        setTimeAgo('Never');
        return;
      }

      const now = new Date();
      const diff = now.getTime() - lastRefresh.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo('Just now');
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else if (hours < 24) {
        setTimeAgo(`${hours}h ago`);
      } else {
        setTimeAgo(lastRefresh.toLocaleDateString());
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [lastRefresh]);

  const handleRefresh = async () => {
    if (isRefreshing || isOffline) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {timeAgo}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {lastRefresh
                ? `Last refreshed: ${lastRefresh.toLocaleString()}`
                : 'Data has not been refreshed yet'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleRefresh}
        disabled={isRefreshing || isOffline}
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </Button>
    </div>
  );
}
