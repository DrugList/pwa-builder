'use client';

import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Trash2, Menu, X, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Link { id: string; appId: string; title: string; url: string; icon: string; displayOrder: number; }
interface EmbedAppProps { appId: string; appName: string; isEditing?: boolean; }

const defaultIcons = ['🔗', '🌐', '📄', '📁', '🎬', '🎵', '📸', '🛒', '📧', '📱', '💼', '📚', '🎮', '🏥', '🏠', '🍕'];

export function EmbedApp({ appId, appName, isEditing = false }: EmbedAppProps) {
    const [links, setLinks] = useState<Link[]>([]);
    const [selectedLink, setSelectedLink] = useState<Link | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [icon, setIcon] = useState('🔗');

    useEffect(() => { fetchLinks(); }, [appId]);

    const fetchLinks = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/links?appId=${appId}`);
            const data = await response.json();
            setLinks(data.links || []);
            if (data.links?.length > 0 && !selectedLink) setSelectedLink(data.links[0]);
        } catch (error) {
            console.error('Error fetching links:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLink = async () => {
        if (!title.trim() || !url.trim()) { toast.error('Please fill in title and URL'); return; }
        try {
            const response = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, title, url, icon }),
            });
            const data = await response.json();
            if (data.link) {
                setLinks([...links, data.link]);
                setSelectedLink(data.link);
                toast.success('Link added!');
                setTitle(''); setUrl(''); setIcon('🔗');
                setAddDialogOpen(false);
            }
        } catch (error) { toast.error('Failed to add link'); }
    };

    const handleDeleteLink = async (linkId: string) => {
        try {
            await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
            setLinks(links.filter(l => l.id !== linkId));
            if (selectedLink?.id === linkId) setSelectedLink(links.find(l => l.id !== linkId) || null);
            toast.success('Link deleted');
        } catch (error) { toast.error('Failed to delete link'); }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-3 border-b bg-background/95">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                    <h2 className="font-semibold truncate">{selectedLink ? selectedLink.title : appName}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Link</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Link</DialogTitle><DialogDescription>Add a link to embed</DialogDescription></DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2"><Label>Title</Label><Input placeholder="Menu Name" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>URL</Label><Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
                                    <div className="space-y-2"><Label>Icon</Label><div className="flex flex-wrap gap-2">{defaultIcons.map((emoji) => (<button key={emoji} type="button" className={cn('h-10 w-10 rounded-lg text-xl hover:bg-muted', icon === emoji && 'bg-primary/20 ring-2 ring-primary')} onClick={() => setIcon(emoji)}>{emoji}</button>))}</div></div>
                                </div>
                                <DialogFooter><Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button><Button onClick={handleAddLink}>Add Link</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    {selectedLink && <Button variant="outline" size="sm" onClick={() => window.open(selectedLink.url, '_blank')}><ExternalLink className="h-4 w-4 mr-1" />Open</Button>}
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 border-r bg-muted/30 flex-shrink-0 overflow-y-auto hidden lg:block">
                    <div className="p-2 space-y-1">
                        {links.length === 0 ? (<div className="p-4 text-center text-muted-foreground"><Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No links yet</p></div>) : (links.map((link) => (<div key={link.id} className={cn('group flex items-center gap-3 p-3 rounded-lg cursor-pointer', selectedLink?.id === link.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => { setSelectedLink(link); setMenuOpen(false); }}><span className="text-xl">{link.icon}</span><span className="flex-1 truncate font-medium">{link.title}</span>{isEditing && (<Button variant="ghost" size="icon" className={cn('h-7 w-7 opacity-0 group-hover:opacity-100', selectedLink?.id === link.id && 'hover:bg-primary-foreground/20')} onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }}><Trash2 className="h-4 w-4" /></Button>)}</div>)))}
                    </div>
                </div>
                {menuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMenuOpen(false)}><div className="w-64 h-full bg-background border-r overflow-y-auto" onClick={(e) => e.stopPropagation()}><div className="p-2 space-y-1">{links.map((link) => (<div key={link.id} className={cn('flex items-center gap-3 p-3 rounded-lg cursor-pointer', selectedLink?.id === link.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')} onClick={() => { setSelectedLink(link); setMenuOpen(false); }}><span className="text-xl">{link.icon}</span><span className="flex-1 truncate font-medium">{link.title}</span></div>))}</div></div></div>}
                <div className="flex-1 overflow-hidden">{selectedLink ? (<iframe src={selectedLink.url} className="w-full h-full border-0" title={selectedLink.title} sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />) : (<div className="flex flex-col items-center justify-center h-full text-muted-foreground"><Link2 className="h-16 w-16 mb-4 opacity-30" /><p className="text-lg font-medium">Select a link from the menu</p><p className="text-sm">or add a new link</p></div>)}</div>
            </div>
        </div>
    );
}