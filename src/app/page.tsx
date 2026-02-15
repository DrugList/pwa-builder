'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Smartphone, Database, FileText, Globe, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/pwa/theme-toggle';
import { OfflineIndicator } from '@/components/pwa/offline-indicator';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { PullToRefresh } from '@/components/pwa/pull-to-refresh';
import { AppCard } from '@/components/app-builder/app-card';
import { CreateAppDialog } from '@/components/app-builder/create-app-dialog';
import { QRCodeDisplay } from '@/components/app-builder/qr-code-display';
import { DataTable } from '@/components/data/data-table';
import { CardView } from '@/components/data/card-view';
import { FavoritesFilter } from '@/components/data/favorites-filter';
import { FreshnessIndicator } from '@/components/data/freshness-indicator';
import { FormBuilder } from '@/components/forms/form-builder';
import { EmbedApp } from '@/components/embed/embed-app';
import { useAppStore, App as AppType, DataItem } from '@/lib/stores/app-store';
import { useOffline } from '@/hooks/use-offline';
import { useFavorites } from '@/hooks/use-favorites';
import { toast } from 'sonner';

export default function Home() {
  const {
    apps,
    currentApp,
    dataItems,
    forms,
    setApps,
    setCurrentApp,
    setViewMode,
    viewMode,
    createAppOpen,
    setCreateAppOpen,
    shareAppOpen,
    setShareAppOpen,
    lastRefresh,
    setLastRefresh,
    setDataItems,
    toggleFavorite,
    deleteDataItem,
  } = useAppStore();

  const { isOffline, refreshData } = useOffline();
  const { items: filteredItems, favoritesCount, showFavorites, setShowFavorites } = useFavorites(currentApp?.id);

  const [activeTab, setActiveTab] = useState('apps');
  const [editingApp, setEditingApp] = useState<AppType | null>(null);
  const [sharingApp, setSharingApp] = useState<AppType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/apps');
      const data = await response.json();
      setApps(data.apps || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch apps:', error);
      loadDemoData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    const demoApps: AppType[] = [
      {
        id: 'demo-1',
        name: 'Product Catalog',
        description: 'Browse and manage product inventory',
        icon: '🛒',
        iconType: 'emoji',
        appType: 'data',
        config: {},
        isPublished: true,
        shareCode: 'catalog123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        name: 'Contact Form',
        description: 'Collect contact requests from visitors',
        icon: '📧',
        iconType: 'emoji',
        appType: 'form',
        config: {},
        isPublished: true,
        shareCode: 'contact456',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'demo-3',
        name: 'Company Website',
        description: 'Public company information page',
        icon: '🌐',
        iconType: 'emoji',
        appType: 'website',
        config: {},
        isPublished: true,
        shareCode: 'website789',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setApps(demoApps);

    const demoItems: DataItem[] = [
      {
        id: 'item-1',
        data: { name: 'Product A', price: 29.99, category: 'Electronics', stock: 150 },
        isFavorite: true,
        displayOrder: 0,
        appId: 'demo-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-2',
        data: { name: 'Product B', price: 49.99, category: 'Clothing', stock: 75 },
        isFavorite: false,
        displayOrder: 1,
        appId: 'demo-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'item-3',
        data: { name: 'Product C', price: 19.99, category: 'Books', stock: 200 },
        isFavorite: true,
        displayOrder: 2,
        appId: 'demo-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setDataItems(demoItems);
    setLastRefresh(new Date());
  };

  const handleCreateApp = async (data: {
    name: string;
    description?: string;
    appType: string;
    icon: string;
    iconType: string;
  }) => {
    try {
      const response = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.app) {
        setApps([...apps, result.app]);
        toast.success('App created successfully!');
      }
    } catch (error) {
      const newApp: AppType = {
        id: `app-${Date.now()}`,
        name: data.name,
        description: data.description || null,
        icon: data.icon,
        iconType: data.iconType,
        appType: data.appType,
        config: {},
        isPublished: true,
        shareCode: Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setApps([...apps, newApp]);
      toast.success('App created successfully!');
    }
  };

  const handleUpdateApp = async (data: {
    name: string;
    description?: string;
    appType: string;
    icon: string;
    iconType: string;
  }) => {
    if (!editingApp) return;

    try {
      const response = await fetch(`/api/apps/${editingApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.app) {
        setApps(apps.map(a => a.id === editingApp.id ? result.app : a));
        toast.success('App updated successfully!');
      }
    } catch (error) {
      const updatedApp = { ...editingApp, ...data, updatedAt: new Date().toISOString() };
      setApps(apps.map(a => a.id === editingApp.id ? updatedApp : a));
      toast.success('App updated successfully!');
    }

    setEditingApp(null);
  };

  const handleDeleteApp = async (id: string) => {
    try {
      await fetch(`/api/apps/${id}`, { method: 'DELETE' });
      setApps(apps.filter(a => a.id !== id));
      toast.success('App deleted successfully!');
    } catch (error) {
      setApps(apps.filter(a => a.id !== id));
      toast.success('App deleted successfully!');
    }
  };

  const handleOpenApp = (app: AppType) => {
    setCurrentApp(app);
    setActiveTab('data');
  };

  const handleEditApp = (app: AppType) => {
    setEditingApp(app);
    setCreateAppOpen(true);
  };

  const handleShareApp = (app: AppType) => {
    setSharingApp(app);
    setShareAppOpen(true);
  };

  const handlePullRefresh = async () => {
    await fetchApps();
    toast.success('Data refreshed!');
  };

  const handleToggleFavorite = useCallback(async (id: string) => {
    toggleFavorite(id);
    try {
      const item = dataItems.find(i => i.id === id);
      if (item) {
        await fetch(`/api/data-items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFavorite: !item.isFavorite }),
        });
      }
    } catch (error) {
      // Demo mode - already updated locally
    }
  }, [toggleFavorite, dataItems]);

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/data-items/${id}`, { method: 'DELETE' });
      deleteDataItem(id);
      toast.success('Item deleted!');
    } catch (error) {
      deleteDataItem(id);
      toast.success('Item deleted!');
    }
  };

  const isFavorite = useCallback((id: string) => {
    return dataItems.find(i => i.id === id)?.isFavorite ?? false;
  }, [dataItems]);

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
      <div className="min-h-screen bg-background">
        <OfflineIndicator />

        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">PWA Builder</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Create apps like Glide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FreshnessIndicator
                lastRefresh={lastRefresh}
                onRefresh={handlePullRefresh}
                isOffline={isOffline}
              />
              <ThemeToggle />
              <Button onClick={() => { setEditingApp(null); setCreateAppOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New App
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="apps" className="gap-2">
                <Smartphone className="h-4 w-4" />
                My Apps
              </TabsTrigger>
              {currentApp && (
                <TabsTrigger value="data" className="gap-2">
                  <Database className="h-4 w-4" />
                  {currentApp.name}
                </TabsTrigger>
              )}
              <TabsTrigger value="forms" className="gap-2">
                <FileText className="h-4 w-4" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Globe className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Apps Tab */}
            <TabsContent value="apps">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Plus className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No apps yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-sm">
                    Create your first app to get started. You can build data apps, forms, websites, and more.
                  </p>
                  <Button onClick={() => setCreateAppOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First App
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {apps.map(app => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onEdit={handleEditApp}
                      onDelete={handleDeleteApp}
                      onShare={handleShareApp}
                      onOpen={handleOpenApp}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Data Tab */}
            <TabsContent value="data">
              {currentApp ? (
                currentApp.appType === 'embed' ? (
                  <div className="h-[calc(100vh-200px)] border rounded-lg overflow-hidden">
                    <EmbedApp
                      appId={currentApp.id}
                      appName={currentApp.name}
                      isEditing={true}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{currentApp.name}</h2>
                        <p className="text-muted-foreground">{currentApp.description || ''}</p>
                      </div>
                      <Button variant="outline" onClick={() => setCurrentApp(null)}>
                        Back to Apps
                      </Button>
                    </div>
                    <FavoritesFilter
                      showFavorites={showFavorites}
                      onToggleFavorites={setShowFavorites}
                      favoritesCount={favoritesCount}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                    />
                    {viewMode === 'table' ? (
                      <DataTable data={filteredItems} onToggleFavorite={handleToggleFavorite} onDelete={handleDeleteItem} isFavorite={isFavorite} />
                    ) : (
                      <CardView data={filteredItems} onToggleFavorite={handleToggleFavorite} onDelete={handleDeleteItem} isFavorite={isFavorite} />
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-muted-foreground">Select an app to view its data</p>
                </div>
              )}
            </TabsContent>

            {/* Forms Tab */}
            <TabsContent value="forms">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">Form Builder</h2>
                <FormBuilder
                  fields={[
                    { id: '1', name: 'name', label: 'Full Name', type: 'text', required: true },
                    { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true },
                    { id: '3', name: 'message', label: 'Message', type: 'textarea', required: false },
                  ]}
                  onChange={() => { }}
                />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-4">PWA Settings</h2>
                  <p className="text-muted-foreground">
                    Configure your progressive web app settings here.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">App Installation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Install this app on your device for quick access and offline support.
                    </p>
                    <InstallPrompt />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Offline Support</h3>
                    <p className="text-sm text-muted-foreground">
                      This app works offline with cached data. Changes will sync when you&apos;re back online.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-sm">{isOffline ? 'Offline' : 'Online'}</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Data Sources</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Connect to Google Sheets, APIs, or enter data manually.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Database className="h-4 w-4 mr-2" />
                        Google Sheets
                      </Button>
                      <Button variant="outline" size="sm">
                        <Link2 className="h-4 w-4 mr-2" />
                        API
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="border-t py-6 mt-8">
          <div className="container px-4 text-center text-sm text-muted-foreground">
            <p>PWA Builder - Open Source No-Code Platform</p>
            <p className="mt-1">
              Works offline • Install on any device • Share with anyone
            </p>
          </div>
        </footer>

        {/* Dialogs */}
        <CreateAppDialog
          open={createAppOpen}
          onOpenChange={(open) => {
            setCreateAppOpen(open);
            if (!open) setEditingApp(null);
          }}
          onSubmit={editingApp ? handleUpdateApp : handleCreateApp}
          editData={editingApp ? {
            name: editingApp.name,
            description: editingApp.description || '',
            appType: editingApp.appType as 'data' | 'form' | 'website' | 'embed',
            icon: editingApp.icon,
            iconType: editingApp.iconType as 'default' | 'uploaded' | 'emoji',
          } : null}
        />

        {sharingApp && (
          <QRCodeDisplay
            open={shareAppOpen}
            onOpenChange={setShareAppOpen}
            shareCode={sharingApp.shareCode}
            appName={sharingApp.name}
          />
        )}

        <InstallPrompt />
      </div>
    </PullToRefresh>
  );
}