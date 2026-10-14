import { Task, TodoList } from './types';

export type LoopStatus = 'active' | 'waiting' | 'resolved';

export interface LoopLogEntry { id: string; timestamp: number; note: string }
export interface LoopAction {
  id: string;
  text: string;
  completed: boolean;
  scheduledDate?: string; // yyyy-MM-dd
  scheduledTime?: string; // HH:mm
  duration?: number;
}
export interface LoopThread {
  id: string;
  name: string;
  status: LoopStatus;
  waitingOn?: string;
  waitingUntil?: string; // yyyy-MM-dd
  timeline: LoopLogEntry[];
  nextActions: LoopAction[];
}
export interface Loop {
  id: string;
  title: string;
  status: LoopStatus;
  notes?: string;
  linkedTaskId?: string;
  threads: LoopThread[];
  createdAt: number;
  updatedAt: number;
}

export const LOOPS_LIST_ID = 'loops-list';
const PREFIX = 'loop:';

export const loopActionTaskId = (loopId: string, actionId: string) => `${PREFIX}${loopId}:${actionId}`;

export function parseLoopTaskId(id: string): { loopId: string; actionId: string } | null {
  if (!id.startsWith(PREFIX)) return null;
  const [loopId, actionId] = id.slice(PREFIX.length).split(':');
  return loopId && actionId ? { loopId, actionId } : null;
}

/** Scheduled next actions become dated tasks in a 'Loops' list so they show in the diary. */
export function syncLoopsList(lists: TodoList[], loops: Loop[]): TodoList[] {
  const existing = lists.find(l => l.id === LOOPS_LIST_ID);
  const old = new Map((existing?.tasks ?? []).map(t => [t.id, t]));
  const tasks: Task[] = [];
  for (const loop of loops) {
    for (const th of loop.threads) {
      for (const a of th.nextActions) {
        if (!a.scheduledDate) continue;
        const id = loopActionTaskId(loop.id, a.id);
        const prev = old.get(id);
        const [y, m, d] = a.scheduledDate.split('-').map(Number);
        const [hh, mm] = (a.scheduledTime || '09:00').split(':').map(Number);
        tasks.push({
          id,
          text: `🔁 ${loop.title}: ${a.text}`,
          completed: a.completed,
          createdAt: prev?.createdAt ?? Date.now(),
          duration: a.duration ?? 30,
          scheduledTime: new Date(y, m - 1, d, hh, mm).toISOString(),
        });
      }
    }
  }
  for (const t of existing?.tasks ?? []) if (!t.id.startsWith(PREFIX)) tasks.push(t);
  tasks.sort((a, b) => (a.scheduledTime ?? '').localeCompare(b.scheduledTime ?? ''));
  if (!existing && tasks.length === 0) return lists;
  const list: TodoList = existing
    ? { ...existing, tasks }
    : { id: LOOPS_LIST_ID, name: 'Loops', tasks, isCollapsed: true, createdAt: Date.now() };
  return existing ? lists.map(l => (l.id === LOOPS_LIST_ID ? list : l)) : [...lists, list];
}

/** Mirror a diary tick back onto the loop's action. */
export function setLoopActionCompleted(loops: Loop[], taskId: string, completed: boolean): Loop[] {
  const p = parseLoopTaskId(taskId);
  if (!p) return loops;
  return loops.map(l => l.id !== p.loopId ? l : {
    ...l,
    updatedAt: Date.now(),
    threads: l.threads.map(t => ({
      ...t,
      nextActions: t.nextActions.map(a => (a.id === p.actionId ? { ...a, completed } : a)),
    })),
  });
}
