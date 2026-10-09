# Turn the app into your full diary (schedule + calendar)

## What you'll get
- **Accounts**: sign in (email or Google) so your diary, tasks, lists, story progress and companion follow you to any device.
- **Diary views**: Day (current timeline), Week and Month, with arrows to move into the past or future and a "Today" button.
- **Plan any date**: give tasks a date and time, drag them onto any day in Week view, see past days with what you finished.
- **Two-way Google Calendar**: connect your own Google account; your events appear in all views, and you can create, move, edit and delete events from the app — changes show in Google Calendar too.
- Existing link-based (.ics) feeds stay as read-only extras (e.g. Outlook/iCloud).
- Your current saved data on this computer is copied into your account the first time you sign in.

## Steps
1. Enable Lovable Cloud; add sign-in page and account menu.
2. Move saved data from this device into your account (tasks, lists, story, settings), keeping it working offline-first.
3. Add a date to tasks and a Day / Week / Month switcher with date navigation in the Focus area.
4. Connect Google Calendar per user (each person links their own account), list calendars, show events.
5. Create/edit/move/delete Google events from the timeline and week/month grid.
6. Polish in the existing mystical teal style; keep collapsible sections, no drag-to-resize.

## Technical details
- Lovable Cloud: auth + tables `profiles`, `app_state` (JSON per user, RLS owner-only) to start, so the existing Context/reducer stays intact; localStorage remains a cache.
- Task type gains `scheduledDate` (YYYY-MM-DD); migration defaults existing scheduled tasks to today.
- Google Calendar via App User Connector `google_calendar` (scope `calendar.events` + `calendar.readonly`), edge functions: oauth-start, oauth-complete, list-events (range), upsert-event, delete-event, disconnect. Encrypted `app_user_connections` table, service-role only.
- Requires a workspace Google OAuth client configured for App User Connectors (you'll get a setup card).
- New views: `WeekView`, `MonthView` components; FocusPane gets a view switcher and selected-date state.
