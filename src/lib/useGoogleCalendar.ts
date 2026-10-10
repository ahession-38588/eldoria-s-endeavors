import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GoogleEvent {
  id: string;
  title: string;
  start: string; // ISO dateTime or YYYY-MM-DD for all-day
  end?: string;
  allDay: boolean;
  location?: string;
}

type Status = 'loading' | 'connected' | 'disconnected' | 'reconnect';
const CONNECTOR = 'google_calendar';

async function invoke<T = any>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('gcal', { body });
  if (error) throw error;
  return data as T;
}

function waitForPopup(popup: Window) {
  return new Promise<void>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener('message', onMsg);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMsg = (e: MessageEvent) => {
      const t = e.data?.type;
      if (e.origin !== window.location.origin || e.source !== popup || e.data?.connectorId !== CONNECTOR) return;
      if (t !== 'appUserConnectorOAuthComplete' && t !== 'appUserConnectorOAuthFailed') return;
      cleanup();
      if (t === 'appUserConnectorOAuthComplete') resolve();
      else { popup.close(); reject(new Error(e.data?.reason ?? 'Connection failed.')); }
    };
    window.addEventListener('message', onMsg);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error('Window closed before finishing.'));
    }, 500);
  });
}

export function useGoogleCalendar(rangeStart: Date, rangeEnd: Date) {
  const [status, setStatus] = useState<Status>('loading');
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const startKey = rangeStart.toISOString();
  const endKey = rangeEnd.toISOString();

  const refresh = useCallback(async () => {
    try {
      const data = await invoke<{ connected: boolean; reconnectRequired?: boolean; events?: GoogleEvent[] }>({
        action: 'list', timeMin: startKey, timeMax: endKey,
      });
      if (data.reconnectRequired) setStatus('reconnect');
      else if (!data.connected) setStatus('disconnected');
      else { setStatus('connected'); setEvents(data.events ?? []); }
    } catch (e) {
      console.error('Google Calendar load failed', e);
      setStatus(s => (s === 'loading' ? 'disconnected' : s));
    }
  }, [startKey, endKey]);

  useEffect(() => { refresh(); }, [refresh]);

  const connect = async () => {
    const popup = window.open('', 'gcal-oauth', 'width=600,height=720');
    if (!popup) { toast.error('Popup blocked. Allow popups and try again.'); return; }
    try {
      const { authorizationUrl } = await invoke<{ authorizationUrl: string }>({ action: 'start', origin: window.location.origin });
      const done = waitForPopup(popup);
      popup.location.href = authorizationUrl;
      await done;
      toast.success(status === 'reconnect' ? 'Reconnected to Google Calendar' : 'Connected to Google Calendar');
      await refresh();
    } catch (e) {
      popup.close();
      toast.error(e instanceof Error ? e.message : 'Could not connect');
    }
  };

  const disconnect = async () => {
    await invoke({ action: 'disconnect' });
    setEvents([]);
    setStatus('disconnected');
    toast.success('Google Calendar disconnected');
  };

  const upsert = async (ev: Partial<GoogleEvent> & { title: string; start: string; end: string; allDay?: boolean }) => {
    try {
      const data = await invoke<{ event?: GoogleEvent; reconnectRequired?: boolean }>({ action: 'upsert', event: ev });
      if (data.reconnectRequired) { setStatus('reconnect'); return; }
      if (data.event) {
        setEvents(prev => [...prev.filter(e => e.id !== data.event!.id), data.event!]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not save to Google Calendar');
    }
  };

  const remove = async (id: string) => {
    const prev = events;
    setEvents(p => p.filter(e => e.id !== id));
    try {
      await invoke({ action: 'delete', id });
    } catch {
      setEvents(prev);
      toast.error('Could not delete the event');
    }
  };

  return { status, events, refresh, connect, disconnect, upsert, remove };
}
