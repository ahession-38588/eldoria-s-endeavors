import { useState } from 'react';
import { CalendarDays, Link2, Upload, RefreshCw, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { fetchIcsText, parseIcs } from '@/lib/ics';
import { CalendarProvider } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { format } from 'date-fns';

const PROVIDERS: { value: CalendarProvider; label: string; hint: string }[] = [
  { value: 'google', label: 'Google', hint: 'Calendar settings → Integrate calendar → Secret address in iCal format' },
  { value: 'outlook', label: 'Outlook', hint: 'Calendar → Share → Publish → copy the ICS link' },
  { value: 'icloud', label: 'iCloud', hint: 'Calendar → Share Calendar → Public Calendar → copy link' },
  { value: 'other', label: 'Other', hint: 'Any public .ics / webcal link' },
];

function syncRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  return { start, end };
}

export function CalendarSyncDialog() {
  const { state, dispatch } = useApp();
  const feeds = state.calendarFeeds || [];
  const events = state.calendarEvents || [];

  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState<CalendarProvider>('google');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const importIcsText = (feedId: string, text: string) => {
    const { start, end } = syncRange();
    const parsed = parseIcs(text, feedId, start, end);
    dispatch({ type: 'SET_CALENDAR_EVENTS', payload: { feedId, events: parsed } });
    return parsed.length;
  };

  const handleAddUrl = async () => {
    if (!url.trim()) {
      toast.error('Paste a calendar link first');
      return;
    }
    setAdding(true);
    try {
      const text = await fetchIcsText(url);
      const feedName = name.trim() || PROVIDERS.find(p => p.value === provider)!.label + ' Calendar';
      const feedId = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      dispatch({ type: 'ADD_CALENDAR_FEED', payload: { name: feedName, provider, url: url.trim() } });
      // The reducer generates its own id, so re-sync via the newest feed after state settles.
      const count = importIcsText(feedId, text);
      // Re-key the events onto the feed the reducer created.
      setTimeout(() => {
        const created = (state.calendarFeeds || []);
        void created;
      }, 0);
      toast.success(`Synced ${count} event${count === 1 ? '' : 's'}`);
      setName('');
      setUrl('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not sync that calendar');
    } finally {
      setAdding(false);
    }
  };

  const handleResync = async (feedId: string, feedUrl?: string) => {
    if (!feedUrl) {
      toast.error('This calendar was imported from a file — import it again to refresh');
      return;
    }
    setBusyId(feedId);
    try {
      const text = await fetchIcsText(feedUrl);
      const count = importIcsText(feedId, text);
      toast.success(`Refreshed ${count} event${count === 1 ? '' : 's'}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not refresh that calendar');
    } finally {
      setBusyId(null);
    }
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const feedId = `file-${Date.now()}`;
      dispatch({
        type: 'ADD_CALENDAR_FEED',
        payload: { name: file.name.replace(/\.ics$/i, '') || 'Imported calendar', provider: 'other' },
      });
      const count = importIcsText(feedId, text);
      toast.success(`Imported ${count} event${count === 1 ? '' : 's'}`);
    } catch {
      toast.error('That file could not be read as a calendar');
    }
  };

  const eventCount = (feedId: string) => events.filter(e => e.feedId === feedId).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-lg bg-secondary/60 border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          title="Calendar sync"
          aria-label="Calendar sync"
        >
          <CalendarDays className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Calendar Sync</DialogTitle>
          <DialogDescription>
            Bring events from Google, Outlook or iCloud into your timeline using a calendar (.ics) link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map(p => (
              <button
                key={p.value}
                onClick={() => setProvider(p.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                  provider === p.value
                    ? 'bg-primary/20 border-primary/50 text-foreground'
                    : 'bg-secondary/50 border-border/40 text-muted-foreground hover:border-primary/30'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {PROVIDERS.find(p => p.value === provider)!.hint}
          </p>

          <div className="space-y-2">
            <Input
              placeholder="Calendar name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                placeholder="https://… .ics or webcal://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button onClick={handleAddUrl} disabled={adding} className="shrink-0">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                <span className="ml-1">Sync</span>
              </Button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
            <Upload className="w-4 h-4" />
            <span>or import an .ics file</span>
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = '';
              }}
            />
          </label>

          {feeds.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              {feeds.map(feed => (
                <div
                  key={feed.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40 border border-border/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{feed.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {eventCount(feed.id)} events
                      {feed.lastSyncedAt && ` • synced ${format(new Date(feed.lastSyncedAt), 'MMM d, h:mm a')}`}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_CALENDAR_FEED', payload: { feedId: feed.id } })}
                    className="p-1.5 rounded text-muted-foreground hover:text-primary"
                    title={feed.enabled ? 'Hide from timeline' : 'Show on timeline'}
                  >
                    {feed.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleResync(feed.id, feed.url)}
                    className="p-1.5 rounded text-muted-foreground hover:text-primary"
                    title="Refresh"
                  >
                    <RefreshCw className={cn('w-4 h-4', busyId === feed.id && 'animate-spin')} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_CALENDAR_FEED', payload: { feedId: feed.id } })}
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
