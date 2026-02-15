'use client';

import { MoreVertical, ExternalLink, Trash2, Edit, Share2, Copy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { App } from '@/lib/stores/app-store';

interface AppCardProps {
  app: App;
  onEdit: (app: App) => void;
  onDelete: (id: string) => void;
  onShare: (app: App) => void;
  onOpen: (app: App) => void;
}

const typeColors: Record<string, string> = {
  data: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  form: 'bg-green-500/10 text-green-500 border-green-500/20',
  website: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  embed: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const typeLabels: Record<string, string> = {
  data: 'Data App',
  form: 'Form',
  website: 'Website',
  embed: 'Embed',
};

export function AppCard({ app, onEdit, onDelete, onShare, onOpen }: AppCardProps) {
  const copyShareLink = () => {
    const link = `${window.location.origin}/${app.shareCode}`;
    navigator.clipboard.writeText(link);
  };

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* App Icon */}
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
              {app.iconType === 'emoji' ? (
                <span className="text-2xl">{app.icon}</span>
              ) : (
                <img src={app.icon} alt={app.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{app.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                {app.description || 'No description'}
              </CardDescription>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOpen(app)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(app)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(app)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyShareLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(app.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={typeColors[app.appType] || typeColors.data}>
            {typeLabels[app.appType] || app.appType}
          </Badge>
          {app.isPublished && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              Published
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <span>
          Updated {new Date(app.updatedAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}
