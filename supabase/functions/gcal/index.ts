import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  authorizeAppUserOAuth,
  exchangeAppUserOAuthCode,
  callAsAppUser,
  appUserReconnectRequired,
  disconnectAppUser,
} from "../_shared/appUserConnector.ts";
import {
  getConnectionKeyForUser,
  saveConnectionKeyForUser,
  deleteConnectionForUser,
} from "../_shared/appUserConnections.ts";

const GATEWAY = "https://connector-gateway.lovable.dev";
const CONNECTOR = "google_calendar";
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

interface GEvent {
  id: string;
  summary?: string;
  location?: string;
  description?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

function project(ev: GEvent, calendarId: string) {
  const allDay = !!ev.start?.date;
  return {
    id: ev.id,
    calendarId,
    title: ev.summary ?? "(no title)",
    location: ev.location,
    description: ev.description,
    allDay,
    start: allDay ? ev.start!.date! : ev.start?.dateTime,
    end: allDay ? ev.end?.date : ev.end?.dateTime,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Sign in required" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    if (action === "start") {
      const clientAPIKey = Deno.env.get("GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY");
      if (!clientAPIKey) return json({ error: "Calendar client not configured" }, 500);
      const origin = String(body.origin ?? "");
      if (!/^https?:\/\//.test(origin)) return json({ error: "Invalid origin" }, 400);
      const existing = await getConnectionKeyForUser(user.id, CONNECTOR);
      const { authorizationUrl } = await authorizeAppUserOAuth({
        gatewayBaseUrl: GATEWAY,
        connectorId: CONNECTOR,
        appUserId: user.id,
        clientAPIKey,
        returnUrl: new URL("/oauth/google-calendar/return", origin).toString(),
        connectionAPIKey: existing ?? undefined,
        credentialsConfiguration: { scopes: SCOPES },
      });
      return json({ authorizationUrl });
    }

    if (action === "complete") {
      const code = String(body.code ?? "");
      if (!code) return json({ error: "Missing code" }, 400);
      const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(GATEWAY, code);
      if (connectorId !== CONNECTOR) return json({ error: "Wrong connector" }, 400);
      await saveConnectionKeyForUser(user.id, connectorId, connectionAPIKey);
      return json({ ok: true });
    }

    const key = await getConnectionKeyForUser(user.id, CONNECTOR);
    if (!key) return json({ connected: false });

    const call = (path: string, init?: RequestInit) =>
      callAsAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: key, connectorId: CONNECTOR, path, init, requiredScopes: SCOPES });

    if (action === "disconnect") {
      await disconnectAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: key, connectorId: CONNECTOR }).catch((e) =>
        console.error(e)
      );
      await deleteConnectionForUser(user.id, CONNECTOR);
      return json({ connected: false });
    }

    if (action === "list") {
      const timeMin = new Date(String(body.timeMin)).toISOString();
      const timeMax = new Date(String(body.timeMax)).toISOString();
      const q = new URLSearchParams({ timeMin, timeMax, singleEvents: "true", orderBy: "startTime", maxResults: "500" });
      const res = await call(`/calendar/v3/calendars/primary/events?${q}`);
      if (await appUserReconnectRequired(res)) return json({ connected: false, reconnectRequired: true });
      if (!res.ok) {
        const t = await res.text();
        console.error("list failed", res.status, t);
        return json({ error: "Calendar request failed", status: res.status, details: t }, 502);
      }
      const data = await res.json();
      return json({ connected: true, events: (data.items ?? []).map((e: GEvent) => project(e, "primary")) });
    }

    if (action === "upsert") {
      const ev = body.event ?? {};
      const title = String(ev.title ?? "").slice(0, 500);
      if (!title) return json({ error: "Title required" }, 400);
      const payload: Record<string, unknown> = { summary: title, location: ev.location, description: ev.description };
      if (ev.allDay) {
        payload.start = { date: String(ev.start).slice(0, 10) };
        payload.end = { date: String(ev.end ?? ev.start).slice(0, 10) };
      } else {
        payload.start = { dateTime: new Date(ev.start).toISOString() };
        payload.end = { dateTime: new Date(ev.end).toISOString() };
      }
      const id = ev.id ? encodeURIComponent(String(ev.id)) : null;
      const res = await call(id ? `/calendar/v3/calendars/primary/events/${id}` : `/calendar/v3/calendars/primary/events`, {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (await appUserReconnectRequired(res)) return json({ connected: false, reconnectRequired: true });
      if (!res.ok) {
        const t = await res.text();
        console.error("upsert failed", res.status, t);
        return json({ error: "Calendar request failed", status: res.status, details: t }, 502);
      }
      return json({ connected: true, event: project(await res.json(), "primary") });
    }

    if (action === "delete") {
      const id = encodeURIComponent(String(body.id ?? ""));
      const res = await call(`/calendar/v3/calendars/primary/events/${id}`, { method: "DELETE" });
      if (await appUserReconnectRequired(res)) return json({ connected: false, reconnectRequired: true });
      if (!res.ok && res.status !== 410) {
        const t = await res.text();
        return json({ error: "Calendar request failed", status: res.status, details: t }, 502);
      }
      return json({ connected: true, ok: true });
    }

    if (action === "status") return json({ connected: true });
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
