/* Loops page: open-ended admin tasks with threads, a timeline log and next actions */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Repeat, Plus, Trash2, Check, Clock, Hourglass, CalendarPlus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '@/lib/AppContext';
import { generateId } from '@/lib/storage';
import { Loop, LoopStatus, LoopThread } from '@/lib/loops';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import elfVillageBg from '@/assets/elf-village-bg.webp';

const STATUS: { id: LoopStatus; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'resolved', label: 'Closed' },
];

const newThread = (name = 'Main thread'): LoopThread => ({ id: generateId(), name, status: 'active', timeline: [], nextActions: [] });
const newLoop = (title: string, linkedTaskId?: string): Loop => ({
  id: generateId(), title, status: 'active', linkedTaskId, threads: [newThread()], createdAt: Date.now(), updatedAt: Date.now(),
});

function StatusPills({ value, onChange }: { value: LoopStatus; onChange: (s: LoopStatus) => void }) {
  return (
    <div className="flex gap-1">
      {STATUS.map(s => (
        <button key={s.id} onClick={() => onChange(s.id)}
          className={cn('px-2.5 py-1 rounded-md text-xs transition-colors',
            value === s.id ? 'bg-primary/30 text-foreground' : 'text-muted-foreground hover:bg-secondary/50')}>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export default function Loops() {
  const { state, dispatch } = useApp();
  const loops = state.loops ?? [];
  const save = (next: Loop[]) => dispatch({ type: 'SET_LOOPS', payload: next });
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'open' | LoopStatus>('open');
  const [newTitle, setNewTitle] = useState('');

  // Opened from a task: find its loop or create one
  useEffect(() => {
    const taskId = params.get('task');
    if (!taskId) return;
    const found = loops.find(l => l.linkedTaskId === taskId);
    if (found) setSelectedId(found.id);
    else {
      const l = newLoop(params.get('title') || 'New loop', taskId);
      save([l, ...loops]);
      setSelectedId(l.id);
    }
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const visible = useMemo(() => loops
    .filter(l => filter === 'open' ? l.status !== 'resolved' : l.status === filter)
    .sort((a, b) => b.updatedAt - a.updatedAt), [loops, filter]);
  const selected = loops.find(l => l.id === selectedId) ?? visible[0] ?? null;

  const update = (id: string, fn: (l: Loop) => Loop) =>
    save(loops.map(l => (l.id === id ? { ...fn(l), updatedAt: Date.now() } : l)));

  const create = () => {
    if (!newTitle.trim()) return;
    const l = newLoop(newTitle.trim());
    save([l, ...loops]);
    setSelectedId(l.id);
    setNewTitle('');
    setFilter('open');
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundImage: `url(${elfVillageBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', imageRendering: 'pixelated' }}>
      <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1500px] mx-auto flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"><ArrowLeft className="w-5 h-5" /></Link>
          <Repeat className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Loops</h1>
          <span className="text-sm text-muted-foreground hidden md:inline">For the long, messy admin with no clear end</span>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          {/* Sidebar */}
          <aside className="mystical-card p-4 space-y-3 h-fit">
            <form onSubmit={e => { e.preventDefault(); create(); }} className="flex gap-2">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Open a new loop…" />
              <Button type="submit" size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
            </form>
            <div className="flex gap-1 flex-wrap">
              {(['open', 'waiting', 'resolved'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn('px-2.5 py-1 rounded-md text-xs', filter === f ? 'bg-primary/30 text-foreground' : 'text-muted-foreground hover:bg-secondary/50')}>
                  {f === 'open' ? 'Open' : f === 'waiting' ? 'Waiting' : 'Closed'}
                </button>
              ))}
            </div>
            <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
              {visible.length === 0 && <li className="text-sm text-muted-foreground py-4 text-center">No loops here.</li>}
              {visible.map(l => {
                const open = l.threads.flatMap(t => t.nextActions).filter(a => !a.completed).length;
                const waiting = l.threads.find(t => t.status === 'waiting' && t.waitingOn);
                return (
                  <li key={l.id}>
                    <button onClick={() => setSelectedId(l.id)}
                      className={cn('w-full text-left rounded-lg px-3 py-2 transition-colors',
                        selected?.id === l.id ? 'bg-primary/20' : 'hover:bg-secondary/40')}>
                      <div className="text-sm font-medium truncate">{l.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {open} next step{open === 1 ? '' : 's'} · {l.threads.length} thread{l.threads.length === 1 ? '' : 's'}
                        {waiting && <> · waiting on {waiting.waitingOn}</>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Workspace */}
          {selected ? <LoopWorkspace key={selected.id} loop={selected}
            onChange={fn => update(selected.id, fn)}
            onDelete={() => { save(loops.filter(l => l.id !== selected.id)); setSelectedId(null); }} />
            : <div className="mystical-card p-10 text-center text-muted-foreground">Open a loop to start tracking a messy task. Add steps and threads as they crop up.</div>}
        </div>
      </main>
    </div>
  );
}

function LoopWorkspace({ loop, onChange, onDelete }: { loop: Loop; onChange: (fn: (l: Loop) => Loop) => void; onDelete: () => void }) {
  const [threadId, setThreadId] = useState(loop.threads[0]?.id);
  const [newThreadName, setNewThreadName] = useState('');
  const [addingThread, setAddingThread] = useState(false);
  const thread = loop.threads.find(t => t.id === threadId) ?? loop.threads[0];

  const updThread = (fn: (t: LoopThread) => LoopThread) =>
    onChange(l => ({ ...l, threads: l.threads.map(t => (t.id === thread.id ? fn(t) : t)) }));

  const addThread = () => {
    if (!newThreadName.trim()) return;
    const t = newThread(newThreadName.trim());
    onChange(l => ({ ...l, threads: [...l.threads, t] }));
    setThreadId(t.id);
    setNewThreadName('');
    setAddingThread(false);
  };

  return (
    <section className="mystical-card p-5 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={loop.title} onChange={e => onChange(l => ({ ...l, title: e.target.value }))}
          className="font-display text-xl bg-transparent border-transparent hover:border-border focus:border-border flex-1 min-w-[200px]" />
        <StatusPills value={loop.status} onChange={s => onChange(l => ({ ...l, status: s }))} />
        <Button variant="ghost" size="icon" onClick={() => { if (confirm('Delete this loop?')) onDelete(); }} title="Delete loop">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <Textarea value={loop.notes ?? ''} onChange={e => onChange(l => ({ ...l, notes: e.target.value }))}
        placeholder="Overall notes — account numbers, who's involved, what 'done' looks like…" className="min-h-[60px]" />

      {/* Threads */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/30 pb-2">
        {loop.threads.map(t => (
          <button key={t.id} onClick={() => setThreadId(t.id)}
            className={cn('px-3 py-1.5 rounded-t-md text-sm flex items-center gap-1.5',
              t.id === thread?.id ? 'bg-primary/25 text-foreground' : 'text-muted-foreground hover:bg-secondary/40')}>
            {t.status === 'waiting' && <Hourglass className="w-3 h-3" />}
            {t.status === 'resolved' && <Check className="w-3 h-3" />}
            <span className={cn(t.status === 'resolved' && 'line-through opacity-70')}>{t.name}</span>
          </button>
        ))}
        {addingThread ? (
          <form onSubmit={e => { e.preventDefault(); addThread(); }} className="flex gap-1">
            <Input autoFocus value={newThreadName} onChange={e => setNewThreadName(e.target.value)} placeholder="Thread name" className="h-8 w-40" />
            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => setAddingThread(false)}><X className="w-3.5 h-3.5" /></Button>
          </form>
        ) : (
          <button onClick={() => setAddingThread(true)} className="px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thread
          </button>
        )}
      </div>

      {thread && <ThreadView thread={thread} canDelete={loop.threads.length > 1} onChange={updThread}
        onDelete={() => { onChange(l => ({ ...l, threads: l.threads.filter(t => t.id !== thread.id) })); setThreadId(undefined); }} />}
    </section>
  );
}

function ThreadView({ thread, canDelete, onChange, onDelete }: {
  thread: LoopThread; canDelete: boolean; onChange: (fn: (t: LoopThread) => LoopThread) => void; onDelete: () => void;
}) {
  const [note, setNote] = useState('');
  const [action, setAction] = useState('');
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  const log = () => {
    if (!note.trim()) return;
    onChange(t => ({ ...t, timeline: [{ id: generateId(), timestamp: Date.now(), note: note.trim() }, ...t.timeline] }));
    setNote('');
  };
  const addAction = () => {
    if (!action.trim()) return;
    onChange(t => ({ ...t, nextActions: [...t.nextActions, { id: generateId(), text: action.trim(), completed: false }] }));
    setAction('');
  };
  const updAction = (id: string, patch: Partial<LoopThread['nextActions'][number]>) =>
    onChange(t => ({ ...t, nextActions: t.nextActions.map(a => (a.id === id ? { ...a, ...patch } : a)) }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={thread.name} onChange={e => onChange(t => ({ ...t, name: e.target.value }))} className="h-8 w-56" />
        <StatusPills value={thread.status} onChange={s => onChange(t => ({ ...t, status: s }))} />
        {canDelete && <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 mr-1" />Remove thread</Button>}
      </div>

      {thread.status === 'waiting' && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 flex flex-wrap items-center gap-2">
          <Hourglass className="w-4 h-4 text-accent" />
          <span className="text-sm">Waiting on</span>
          <Input value={thread.waitingOn ?? ''} onChange={e => onChange(t => ({ ...t, waitingOn: e.target.value }))}
            placeholder="e.g. callback from the bank" className="h-8 flex-1 min-w-[180px]" />
          <span className="text-sm">chase on</span>
          <Input type="date" value={thread.waitingUntil ?? ''} onChange={e => onChange(t => ({ ...t, waitingUntil: e.target.value || undefined }))} className="h-8 w-40" />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Next actions */}
        <div className="space-y-2">
          <h3 className="font-display text-sm tracking-wide text-muted-foreground">Next steps</h3>
          <form onSubmit={e => { e.preventDefault(); addAction(); }} className="flex gap-2">
            <Input value={action} onChange={e => setAction(e.target.value)} placeholder="Add a step as it crops up…" />
            <Button type="submit" size="icon" variant="secondary"><Plus className="w-4 h-4" /></Button>
          </form>
          <ul className="space-y-1">
            {thread.nextActions.length === 0 && <li className="text-sm text-muted-foreground py-2">No steps yet.</li>}
            {thread.nextActions.map(a => (
              <li key={a.id} className="group rounded-lg px-2 py-1.5 hover:bg-secondary/30">
                <div className="flex items-center gap-2">
                  <button onClick={() => updAction(a.id, { completed: !a.completed })}
                    className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      a.completed ? 'bg-primary border-primary' : 'border-muted-foreground/50')}>
                    {a.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <span className={cn('flex-1 text-sm', a.completed && 'line-through text-muted-foreground')}>{a.text}</span>
                  {a.scheduledDate && (
                    <span className="text-xs text-accent flex items-center gap-1"><Clock className="w-3 h-3" />
                      {format(new Date(`${a.scheduledDate}T${a.scheduledTime || '09:00'}`), 'EEE d MMM HH:mm')}
                    </span>
                  )}
                  <button onClick={() => setSchedulingId(schedulingId === a.id ? null : a.id)} title="Put in diary"
                    className="p-1 rounded text-muted-foreground hover:text-accent opacity-0 group-hover:opacity-100"><CalendarPlus className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onChange(t => ({ ...t, nextActions: t.nextActions.filter(x => x.id !== a.id) }))} title="Delete"
                    className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {schedulingId === a.id && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pl-6">
                    <Input type="date" value={a.scheduledDate ?? ''} onChange={e => updAction(a.id, { scheduledDate: e.target.value || undefined })} className="h-8 w-40" />
                    <Input type="time" value={a.scheduledTime ?? '09:00'} onChange={e => updAction(a.id, { scheduledTime: e.target.value })} className="h-8 w-28" />
                    <Input type="number" min={5} step={5} value={a.duration ?? 30} onChange={e => updAction(a.id, { duration: Number(e.target.value) || 30 })} className="h-8 w-20" />
                    <span className="text-xs text-muted-foreground">min</span>
                    {a.scheduledDate && <Button size="sm" variant="ghost" onClick={() => updAction(a.id, { scheduledDate: undefined })}>Remove from diary</Button>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h3 className="font-display text-sm tracking-wide text-muted-foreground">Timeline</h3>
          <form onSubmit={e => { e.preventDefault(); log(); }} className="space-y-2">
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What happened? Calls, emails, reference numbers…"
              className="min-h-[60px]" onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); log(); } }} />
            <Button type="submit" size="sm" variant="secondary" disabled={!note.trim()}>Log it</Button>
          </form>
          <ol className="relative border-l border-border/40 ml-2 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {thread.timeline.length === 0 && <li className="text-sm text-muted-foreground pl-4">Nothing logged yet.</li>}
            {thread.timeline.map(e => (
              <li key={e.id} className="group pl-4 relative">
                <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent" />
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  {format(e.timestamp, 'EEE d MMM yyyy, HH:mm')}
                  <button onClick={() => onChange(t => ({ ...t, timeline: t.timeline.filter(x => x.id !== e.id) }))}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{e.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
