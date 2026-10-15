# Agent rules
- User data lives in one JSON row per user (`app_state`), mirrored to localStorage; keeps the existing reducer intact while syncing across devices.
- Google Calendar calls go through the single `gcal` edge function (actions: start/complete/list/upsert/delete/disconnect); connection keys are stored encrypted, server-only.
- The whole app is behind sign-in (Gate in App.tsx); the OAuth return page is the only route rendered without the app shell.
- Training programmes live in app_state.training; the reducer regenerates the 'Training' todo list from them (stable task ids), so workouts reach the diary as normal dated tasks with exercise subtasks.
- Loops (admin tasks) live in app_state.loops; the reducer regenerates the 'Loops' todo list from scheduled next actions (ids loop:<loopId>:<actionId>), and ticking one in the diary mirrors back to the loop.
- Loop steps have a kind (action|waiting|milestone); only actions sync to the diary. Threads may fork from another thread's step (parentThreadId/forkActionId), which drives the LoopGraph layout.
