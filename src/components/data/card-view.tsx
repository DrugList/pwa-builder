'use client';

import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataItem } from '@/lib/stores/app-store';
import { cn } from '@/lib/utils';

interface CardViewProps {
  data: DataItem[];
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onItemClick?: (item: DataItem) => void;
}

export function CardView({ data, onToggleFavorite, onDelete, isFavorite, onItemClick }: CardViewProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => {
        const itemData = item.data as Record<string, unknown>;
        const title = itemData.name || itemData.title || itemData.Name || itemData.Title || 'Untitled';
        const description = itemData.description || itemData.Description || itemData.notes || itemData.Notes || '';
        const image = itemData.image || itemData.Image || itemData.photo || itemData.Photo || null;

        return (
          <Card
            key={item.id}
            className={cn(
              'group relative overflow-hidden transition-all hover:shadow-lg cursor-pointer',
              isFavorite(item.id) && 'ring-2 ring-red-500/50'
            )}
            onClick={() => onItemClick?.(item)}
          >
            {/* Image */}
            {image && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={String(image)}
                  alt={String(title)}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{String(title)}</CardTitle>
                  {description && (
                    <CardDescription className="line-clamp-2">
                      {String(description)}
                    </CardDescription>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isFavorite(item.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-muted-foreground hover:text-red-500'
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Display key fields */}
              <div className="space-y-1">
                {Object.entries(itemData)
                  .filter(([key]) => 
                    !['name', 'title', 'Name', 'Title', 'description', 'Description', 'image', 'Image', 'photo', 'Photo'].includes(key)
                  )
                  .slice(0, 3)
                  .map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium truncate max-w-[60%]">
                        {typeof value === 'object' ? JSON.stringify(value).slice(0, 20) : String(value).slice(0, 30)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Date */}
              <p className="mt-3 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </CardContent>

            {/* Favorite badge */}
            {isFavorite(item.id) && (
              <div className="absolute top-2 left-2">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white fill-white" />
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {data.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm">Add some data or adjust your filters</p>
        </div>
      )}
    </div>
  );
}
