'use client';

import { useState, useRef } from 'react';
import { Upload, Smile, Image, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const defaultIcons = [
  '/icons/default-app.svg',
];

const emojiIcons = [
  '📝', '📊', '📈', '💰', '🎯', '✨', '🚀', '💡',
  '📱', '💻', '🎨', '🎬', '🎵', '📚', '🏠', '🛒',
  '📅', '⏰', '🔔', '❤️', '⭐', '🔥', '✅', '📧',
];

interface IconSelectorProps {
  value: string;
  onChange: (icon: string, iconType: 'default' | 'uploaded' | 'emoji') => void;
}

export function IconSelector({ value, onChange }: IconSelectorProps) {
  const [activeTab, setActiveTab] = useState<'default' | 'emoji' | 'upload'>('default');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string, 'uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 h-8',
            activeTab === 'default' && 'bg-background shadow-sm'
          )}
          onClick={() => setActiveTab('default')}
        >
          <Image className="h-4 w-4 mr-1" />
          Default
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 h-8',
            activeTab === 'emoji' && 'bg-background shadow-sm'
          )}
          onClick={() => setActiveTab('emoji')}
        >
          <Smile className="h-4 w-4 mr-1" />
          Emoji
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'flex-1 h-8',
            activeTab === 'upload' && 'bg-background shadow-sm'
          )}
          onClick={() => setActiveTab('upload')}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-[120px]">
        {activeTab === 'default' && (
          <div className="grid grid-cols-4 gap-2">
            {defaultIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={cn(
                  'relative h-14 w-14 rounded-lg border-2 transition-all overflow-hidden',
                  value === icon
                    ? 'border-primary bg-primary/10'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                onClick={() => onChange(icon, 'default')}
              >
                <img src={icon} alt="App icon" className="h-full w-full object-cover" />
                {value === icon && (
                  <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'emoji' && (
          <div className="grid grid-cols-8 gap-1">
            {emojiIcons.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={cn(
                  'h-10 w-10 rounded-lg text-xl transition-all hover:bg-muted',
                  value === emoji && 'bg-primary/20 ring-2 ring-primary'
                )}
                onClick={() => onChange(emoji, 'emoji')}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            {value && value.startsWith('data:') ? (
              <div className="relative">
                <img
                  src={value}
                  alt="Uploaded icon"
                  className="h-20 w-20 rounded-lg object-cover border-2 border-primary"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute -bottom-2 -right-2 h-7"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-20 w-20 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Click to upload an image<br />
              PNG, JPG, SVG up to 2MB
            </p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <span className="text-sm text-muted-foreground">Preview:</span>
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
          {value.startsWith('data:') || value.startsWith('/') ? (
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">{value}</span>
          )}
        </div>
        <span className="font-medium">My App</span>
      </div>
    </div>
  );
}
