/* Training: races, programmes (blocks), weekly workout sessions → diary tasks */
import { addDays, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import type { Task, TodoList } from './types';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: string; // "8", "8-10", "5 min"
  weight?: string; // "100kg", "RPE 8", "Zone 2"
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  dayOfWeek: number; // 0 = Sunday … 6 = Saturday
  time: string; // HH:mm
  duration: number; // minutes
  exercises: Exercise[];
}

export interface Programme {
  id: string;
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  raceId?: string;
  sessions: WorkoutSession[];
}

export interface Race {
  id: string;
  name: string;
  date: string; // yyyy-MM-dd
  time?: string; // HH:mm
  notes?: string;
}

export interface TrainingData {
  races: Race[];
  programmes: Programme[];
}

export const emptyTraining: TrainingData = { races: [], programmes: [] };
export const TRAINING_LIST_ID = 'training-list';
const GEN_PREFIX = 'wk:';
const RACE_PREFIX = 'race:';

export function exerciseLabel(e: Exercise): string {
  const parts = [e.name];
  if (e.sets && e.reps) parts.push(`${e.sets}×${e.reps}`);
  else if (e.reps) parts.push(e.reps);
  else if (e.sets) parts.push(`${e.sets} sets`);
  if (e.weight) parts.push(`@ ${e.weight}`);
  return parts.join(' ');
}

/** Every dated occurrence of every session in a programme. */
export function sessionOccurrences(p: Programme): { session: WorkoutSession; date: Date }[] {
  const out: { session: WorkoutSession; date: Date }[] = [];
  const start = startOfDay(parseISO(p.startDate));
  const end = startOfDay(parseISO(p.endDate));
  if (isAfter(start, end)) return out;
  for (let d = start; !isAfter(d, end); d = addDays(d, 1)) {
    for (const s of p.sessions) if (s.dayOfWeek === d.getDay()) out.push({ session: s, date: d });
  }
  return out;
}

function at(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

/**
 * Rebuild the "Training" list from the programmes. Completed or past workout
 * tasks are kept as history; upcoming ones are regenerated (keeping progress
 * and any time the user moved them to).
 */
export function syncTrainingList(lists: TodoList[], training: TrainingData, now = new Date()): TodoList[] {
  const today = startOfDay(now);
  const existing = lists.find(l => l.id === TRAINING_LIST_ID);
  const old = new Map((existing?.tasks ?? []).map(t => [t.id, t]));
  const kept: Task[] = [];
  const generated = new Set<string>();

  for (const p of training.programmes) {
    for (const { session, date } of sessionOccurrences(p)) {
      const id = `${GEN_PREFIX}${p.id}:${session.id}:${format(date, 'yyyy-MM-dd')}`;
      generated.add(id);
      const prev = old.get(id);
      if (prev && (prev.completed || isBefore(date, today))) { kept.push(prev); continue; }
      const prevSubs = new Map((prev?.subtasks ?? []).map(s => [s.id, s]));
      kept.push({
        id,
        text: `🏋 ${session.title}`,
        completed: false,
        createdAt: prev?.createdAt ?? Date.now(),
        duration: prev?.duration ?? session.duration,
        scheduledTime: prev?.scheduledTime ?? at(date, session.time),
        subtasks: session.exercises.map(e => ({
          id: e.id,
          text: exerciseLabel(e),
          completed: prevSubs.get(e.id)?.completed ?? false,
          createdAt: prevSubs.get(e.id)?.createdAt ?? Date.now(),
        })),
      });
    }
  }
  for (const r of training.races) {
    const id = `${RACE_PREFIX}${r.id}`;
    generated.add(id);
    const prev = old.get(id);
    kept.push({
      id,
      text: `🏁 ${r.name}`,
      completed: prev?.completed ?? false,
      createdAt: prev?.createdAt ?? Date.now(),
      duration: prev?.duration ?? 60,
      scheduledTime: at(parseISO(r.date), r.time || '09:00'),
    });
  }
  // Keep finished/past generated tasks whose session was removed, and any manual tasks
  for (const t of existing?.tasks ?? []) {
    if (generated.has(t.id)) continue;
    const isGen = t.id.startsWith(GEN_PREFIX) || t.id.startsWith(RACE_PREFIX);
    if (!isGen) { kept.push(t); continue; }
    if (t.id.startsWith(GEN_PREFIX) && (t.completed || (t.scheduledTime && isBefore(new Date(t.scheduledTime), today)))) kept.push(t);
  }
  kept.sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''));

  if (!existing && kept.length === 0) return lists;
  const list: TodoList = existing
    ? { ...existing, tasks: kept }
    : { id: TRAINING_LIST_ID, name: 'Training', tasks: kept, isCollapsed: true, createdAt: Date.now() };
  return existing ? lists.map(l => (l.id === TRAINING_LIST_ID ? list : l)) : [...lists, list];
}
