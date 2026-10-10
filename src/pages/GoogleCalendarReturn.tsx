import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const CONNECTOR = 'google_calendar';

export default function GoogleCalendarReturn() {
  const [message, setMessage] = useState('Finishing connection…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (type: 'appUserConnectorOAuthComplete' | 'appUserConnectorOAuthFailed', reason?: string) => {
      window.opener?.postMessage({ type, connectorId: CONNECTOR, reason }, window.location.origin);
    };
    if (params.get('success') !== 'true') {
      setMessage(params.get('error') ?? 'Connection did not complete.');
      notify('appUserConnectorOAuthFailed');
      window.close();
      return;
    }
    const code = params.get('code');
    if (!code) {
      const reason = params.get('offline_access_allowed') === 'false'
        ? 'A workspace admin must enable offline access on the Google Calendar client.'
        : 'Connection completed without a code.';
      setMessage(reason);
      notify('appUserConnectorOAuthFailed', reason);
      return;
    }
    supabase.functions
      .invoke('gcal', { body: { action: 'complete', code } })
      .then(({ error }) => {
        if (error) throw error;
        notify('appUserConnectorOAuthComplete');
        window.close();
      })
      .catch(() => {
        setMessage('Could not finish the connection.');
        notify('appUserConnectorOAuthFailed');
        window.close();
      });
  }, []);

  return <p className="p-6 text-foreground">{message}</p>;
}
