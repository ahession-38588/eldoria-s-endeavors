/* Minimal ICS (iCalendar) parsing + fetching for calendar sync.
   Works with Google Calendar, Outlook and iCloud "secret / public ICS" links. */
import { CalendarEvent } from './types';
import { generateId } from './storage';

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('webcal://')) return `https://${trimmed.slice('webcal://'.length)}`;
  return trimmed;
}

/** Fetch an ICS feed, falling back to public CORS proxies when the calendar host blocks browsers. */
export async function fetchIcsText(rawUrl: string): Promise<string> {
  const url = normalizeUrl(rawUrl);
  const attempts = [() => url, ...CORS_PROXIES.map((p) => () => p(url))];

  let lastError: unknown = null;
  for (const build of attempts) {
    try {
      const res = await fetch(build());
      if (!res.ok) {
        lastError = new Error(`Calendar responded with ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (text.includes('BEGIN:VCALENDAR')) return text;
      lastError = new Error('That link did not return calendar data');
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Could not reach that calendar link');
}

/** Unfold folded ICS lines (continuation lines start with a space or tab). */
function unfold(text: string): string[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  for (const line of lines) {
    if ((line.startsWith(' ') || line.startsWith('\t')) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else {
      out.push(line);
    }
  }
  return out;
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/** Parse an ICS date/date-time value into a Date (local time for floating values). */
function parseIcsDate(value: string, params: Record<string, string>): { date: Date; allDay: boolean } | null {
  const raw = value.trim();
  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(raw);
  if (dateOnly) {
    const [, y, m, d] = dateOnly;
    return { date: new Date(Number(y), Number(m) - 1, Number(d)), allDay: true };
  }
  const dt = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(raw);
  if (!dt) return null;
  const [, y, m, d, hh, mm, ss, z] = dt;
  if (z || params.TZID === 'UTC') {
    return {
      date: new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss))),
      allDay: false,
    };
  }
  // Floating or TZID-qualified times: treat as local. (Full VTIMEZONE support is out of scope.)
  return {
    date: new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)),
    allDay: false,
  };
}

function parseDurationToMinutes(value: string): number | null {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value.trim());
  if (!m) return null;
  const [, d, h, min] = m;
  return (Number(d || 0) * 1440) + (Number(h || 0) * 60) + Number(min || 0);
}

interface RawEvent {
  summary?: string;
  start?: { date: Date; allDay: boolean };
  end?: Date;
  durationMinutes?: number;
  location?: string;
  rrule?: string;
}

/**
 * Parse ICS text into calendar events between `rangeStart` and `rangeEnd`.
 * Simple daily/weekly recurrence (FREQ=DAILY/WEEKLY with optional BYDAY/INTERVAL) is expanded.
 */
export function parseIcs(
  text: string,
  feedId: string,
  rangeStart: Date,
  rangeEnd: Date,
): CalendarEvent[] {
  const lines = unfold(text);
  const events: CalendarEvent[] = [];
  let current: RawEvent | null = null;

  const push = (raw: RawEvent) => {
    if (!raw.start) return;
    const startBase = raw.start.date;
    const duration = raw.end
      ? Math.max(5, Math.round((raw.end.getTime() - startBase.getTime()) / 60000))
      : raw.durationMinutes ?? (raw.start.allDay ? 1440 : 60);

    const starts: Date[] = [];
    if (raw.rrule) {
      starts.push(...expandRecurrence(startBase, raw.rrule, rangeStart, rangeEnd));
    } else {
      starts.push(startBase);
    }

    for (const start of starts) {
      const end = new Date(start.getTime() + duration * 60000);
      if (end <= rangeStart || start >= rangeEnd) continue;
      events.push({
        id: `${feedId}-${start.getTime()}-${generateId()}`,
        feedId,
        title: raw.summary || 'Untitled event',
        start: start.toISOString(),
        durationMinutes: duration,
        allDay: raw.start.allDay,
        location: raw.location,
      });
    }
  };

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {};
      continue;
    }
    if (line.startsWith('END:VEVENT')) {
      if (current) push(current);
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const rawKey = line.slice(0, colon);
    const value = line.slice(colon + 1);
    const [key, ...paramParts] = rawKey.split(';');
    const params: Record<string, string> = {};
    for (const part of paramParts) {
      const eq = part.indexOf('=');
      if (eq > -1) params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
    }

    switch (key.toUpperCase()) {
      case 'SUMMARY':
        current.summary = unescapeText(value);
        break;
      case 'LOCATION':
        current.location = unescapeText(value);
        break;
      case 'DTSTART':
        current.start = parseIcsDate(value, params) ?? undefined;
        break;
      case 'DTEND': {
        const parsed = parseIcsDate(value, params);
        if (parsed) current.end = parsed.date;
        break;
      }
      case 'DURATION': {
        const mins = parseDurationToMinutes(value);
        if (mins) current.durationMinutes = mins;
        break;
      }
      case 'RRULE':
        current.rrule = value;
        break;
      default:
        break;
    }
  }

  return events.sort((a, b) => a.start.localeCompare(b.start));
}

const DAY_CODES = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

function expandRecurrence(start: Date, rrule: string, rangeStart: Date, rangeEnd: Date): Date[] {
  const rules: Record<string, string> = {};
  for (const part of rrule.split(';')) {
    const eq = part.indexOf('=');
    if (eq > -1) rules[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
  }
  const freq = (rules.FREQ || '').toUpperCase();
  const interval = Math.max(1, Number(rules.INTERVAL || 1));
  const untilParsed = rules.UNTIL ? parseIcsDate(rules.UNTIL, {}) : null;
  const until = untilParsed ? untilParsed.date : null;
  const count = rules.COUNT ? Number(rules.COUNT) : null;

  if (freq !== 'DAILY' && freq !== 'WEEKLY') {
    // Unsupported frequency: keep only the original occurrence.
    return [start];
  }

  const byDay = rules.BYDAY
    ? rules.BYDAY.split(',').map((d) => DAY_CODES.indexOf(d.trim().slice(-2).toUpperCase())).filter((i) => i >= 0)
    : [start.getDay()];

  const results: Date[] = [];
  const cursor = new Date(start);
  let emitted = 0;
  const hardLimit = 500;

  for (let i = 0; i < hardLimit; i++) {
    if (until && cursor > until) break;
    if (cursor > rangeEnd) break;
    if (count && emitted >= count) break;

    if (freq === 'DAILY' || byDay.includes(cursor.getDay())) {
      emitted++;
      if (cursor >= rangeStart) results.push(new Date(cursor));
    }

    if (freq === 'DAILY') {
      cursor.setDate(cursor.getDate() + interval);
    } else {
      // Walk day by day; skip whole weeks per interval at the week boundary.
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getDay() === start.getDay() && interval > 1) {
        cursor.setDate(cursor.getDate() + 7 * (interval - 1));
      }
    }
  }

  return results;
}
