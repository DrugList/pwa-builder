'use client';

import { Heart, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface FavoritesFilterProps {
  showFavorites: boolean;
  onToggleFavorites: (show: boolean) => void;
  favoritesCount: number;
  viewMode: 'table' | 'card';
  onViewModeChange: (mode: 'table' | 'card') => void;
}

export function FavoritesFilter({
  showFavorites,
  onToggleFavorites,
  favoritesCount,
  viewMode,
  onViewModeChange,
}: FavoritesFilterProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Favorites Toggle */}
      <Button
        variant={showFavorites ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggleFavorites(!showFavorites)}
        className="gap-2"
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-colors',
            showFavorites && 'fill-current'
          )}
        />
        Favorites
        {favoritesCount > 0 && (
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {favoritesCount}
          </Badge>
        )}
      </Button>

      {/* View Mode Toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewModeChange(value as 'table' | 'card')}
        className="border rounded-lg"
      >
        <ToggleGroupItem value="table" aria-label="Table view" className="px-3">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="card" aria-label="Card view" className="px-3">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
