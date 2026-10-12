# Agent rules
- User data lives in one JSON row per user (`app_state`), mirrored to localStorage; keeps the existing reducer intact while syncing across devices.
- Google Calendar calls go through the single `gcal` edge function (actions: start/complete/list/upsert/delete/disconnect); connection keys are stored encrypted, server-only.
- The whole app is behind sign-in (Gate in App.tsx); the OAuth return page is the only route rendered without the app shell.
