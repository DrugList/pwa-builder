'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/pwa/theme-toggle';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { CardView } from '@/components/data/card-view';
import { EmbedApp } from '@/components/embed/embed-app';
import { useFavorites } from '@/hooks/use-favorites';
import { toast } from 'sonner';

interface SharedApp {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  iconType: string;
  appType: string;
  config: string;
  shareCode: string;
  dataItems: Array<{
    id: string;
    data: string;
    isFavorite: boolean;
    displayOrder: number;
    createdAt: string;
  }>;
  forms: Array<{
    id: string;
    name: string;
    description: string | null;
    fields: string;
    submitText: string;
    successMsg: string;
  }>;
}

export default function SharedAppPage() {
  const params = useParams();
  const shareCode = params.shareCode as string;

  const [app, setApp] = useState<SharedApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataItems = app?.dataItems.map(item => ({
    ...item,
    data: JSON.parse(item.data),
    appId: app.id,
    updatedAt: item.createdAt,
  })) || [];

  const { items, toggleFavorite, isFavorite } = useFavorites(app?.id);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await fetch(`/api/apps/share/${shareCode}`);
        if (!response.ok) throw new Error('App not found');
        const data = await response.json();
        setApp(data.app);
      } catch (err) {
        setError('This app is not available or has been unpublished.');
      } finally {
        setIsLoading(false);
      }
    };
    if (shareCode) fetchApp();
  }, [shareCode]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: app?.name || 'Shared App', url: window.location.href });
      } catch { }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (error || !app) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">App Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.href = '/'}><ArrowLeft className="h-4 w-4 mr-2" />Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      {app.appType !== 'embed' && (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                {app.iconType === 'emoji' ? <span className="text-xl">{app.icon}</span> : <img src={app.icon} alt={app.name} className="h-full w-full object-cover" />}
              </div>
              <h1 className="font-semibold">{app.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleShare}><Share2 className="h-4 w-4 mr-2" />Share</Button>
            </div>
          </div>
        </header>
      )}
      <main className={app.appType === 'embed' ? 'h-screen' : 'container px-4 py-6'}>
        {app.appType === 'embed' ? (
          <EmbedApp appId={app.id} appName={app.name} isEditing={false} />
        ) : app.appType === 'form' && app.forms.length > 0 ? (
          <FormView forms={app.forms} />
        ) : app.appType === 'website' ? (
          <WebsiteView app={app} />
        ) : (
          <DataView items={dataItems} onToggleFavorite={toggleFavorite} isFavorite={isFavorite} />
        )}
      </main>
    </div>
  );
}

function DataView({ items, onToggleFavorite, isFavorite }: { items: any[]; onToggleFavorite: (id: string) => void; isFavorite: (id: string) => boolean; }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Data</h2><Badge variant="outline">{items.length} items</Badge></div>
      <CardView data={items} onToggleFavorite={onToggleFavorite} onDelete={() => { }} isFavorite={isFavorite} />
    </div>
  );
}

function FormView({ forms }: { forms: any[] }) {
  const [submitted, setSubmitted] = useState(false);
  const form = forms[0];
  if (!form) return <p>No form available</p>;
  const fields = JSON.parse(form.fields);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement));
    await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formId: form.id, data }) });
    setSubmitted(true);
  };
  if (submitted) return <Card className="max-w-lg mx-auto mt-8"><CardContent className="pt-6 text-center"><div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4"><Heart className="h-6 w-6 text-green-500" /></div><h2 className="text-xl font-semibold mb-2">Thank You!</h2><p className="text-muted-foreground">{form.successMsg}</p></CardContent></Card>;
  return (
    <Card className="max-w-lg mx-auto mt-8">
      <CardHeader><CardTitle>{form.name}</CardTitle>{form.description && <CardDescription>{form.description}</CardDescription>}</CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field: any) => (<div key={field.id} className="space-y-2"><label className="text-sm font-medium">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label><input name={field.name} type={field.type === 'select' ? 'text' : field.type} required={field.required} placeholder={field.placeholder} className="w-full px-3 py-2 border rounded-lg bg-background" /></div>))}
          <Button type="submit" className="w-full">{form.submitText || 'Submit'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WebsiteView({ app }: { app: any }) {
  const config = JSON.parse(app.config || '{}');
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4 overflow-hidden">
          {app.iconType === 'emoji' ? <span className="text-4xl">{app.icon}</span> : <img src={app.icon} alt={app.name} className="h-full w-full object-cover" />}
        </div>
        <h1 className="text-3xl font-bold mb-2">{app.name}</h1>
        {app.description && <p className="text-muted-foreground max-w-md mx-auto">{app.description}</p>}
      </div>
      {config.sections?.map((section: any, index: number) => (<Card key={index}><CardHeader><CardTitle className="text-lg">{section.title}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{section.content}</p></CardContent></Card>))}
    </div>
  );
}