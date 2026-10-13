/* Training page: races, programmes and workout sessions with a calendar */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Flag, Plus, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { addMonths, differenceInCalendarDays, format, isSameDay, isSameMonth, parseISO, addWeeks } from 'date-fns';
import { useApp } from '@/lib/AppContext';
import { generateId } from '@/lib/storage';
import { emptyTraining, exerciseLabel, sessionOccurrences, Programme, Race, TrainingData, WorkoutSession } from '@/lib/training';
import { monthGridDays } from '@/components/DiaryViews';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import elfVillageBg from '@/assets/elf-village-bg.webp';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const iso = (d: Date) => format(d, 'yyyy-MM-dd');
const ex = (name: string, sets?: number, reps?: string, weight?: string) => ({ id: generateId(), name, sets, reps, weight });

function starter(kind: 'blank' | 'strength' | 'run'): Programme {
  const start = new Date();
  const base = { id: generateId(), startDate: iso(start) };
  if (kind === 'strength') return {
    ...base, title: 'Push / Pull / Legs', endDate: iso(addWeeks(start, 8)), sessions: [
      { id: generateId(), title: 'Push', dayOfWeek: 1, time: '07:00', duration: 60, exercises: [ex('Bench press', 4, '8'), ex('Overhead press', 3, '10'), ex('Tricep dips', 3, '12')] },
      { id: generateId(), title: 'Pull', dayOfWeek: 3, time: '07:00', duration: 60, exercises: [ex('Deadlift', 3, '5'), ex('Pull-ups', 4, '8'), ex('Barbell row', 3, '10')] },
      { id: generateId(), title: 'Legs', dayOfWeek: 5, time: '07:00', duration: 60, exercises: [ex('Back squat', 4, '8'), ex('Romanian deadlift', 3, '10'), ex('Lunges', 3, '12')] },
    ] };
  if (kind === 'run') return {
    ...base, title: 'Half marathon prep', endDate: iso(addWeeks(start, 12)), sessions: [
      { id: generateId(), title: 'Intervals', dayOfWeek: 2, time: '18:00', duration: 45, exercises: [ex('Warm-up jog', undefined, '10 min'), ex('800m repeats', 6, '800m', '5k pace'), ex('Cool-down', undefined, '10 min')] },
      { id: generateId(), title: 'Easy run', dayOfWeek: 4, time: '18:00', duration: 40, exercises: [ex('Easy run', undefined, '6 km', 'Zone 2')] },
      { id: generateId(), title: 'Long run', dayOfWeek: 0, time: '09:00', duration: 90, exercises: [ex('Long run', undefined, '14 km', 'Conversational')] },
    ] };
  return { ...base, title: 'New programme', endDate: iso(addWeeks(start, 4)), sessions: [] };
}

export default function Training() {
  const { state, dispatch } = useApp();
  const training = state.training ?? emptyTraining;
  const save = (t: TrainingData) => dispatch({ type: 'SET_TRAINING', payload: t });
  const [month, setMonth] = useState(new Date());
  const [openId, setOpenId] = useState<string | null>(null);
  const [raceName, setRaceName] = useState('');
  const [raceDate, setRaceDate] = useState('');

  const updateProg = (id: string, fn: (p: Programme) => Programme) =>
    save({ ...training, programmes: training.programmes.map(p => (p.id === id ? fn(p) : p)) });
  const updateSession = (pid: string, sid: string, fn: (s: WorkoutSession) => WorkoutSession) =>
    updateProg(pid, p => ({ ...p, sessions: p.sessions.map(s => (s.id === sid ? fn(s) : s)) }));

  const addProgramme = (kind: 'blank' | 'strength' | 'run') => {
    const p = starter(kind);
    save({ ...training, programmes: [...training.programmes, p] });
    setOpenId(p.id);
  };
  const addRace = () => {
    if (!raceName.trim() || !raceDate) return;
    const r: Race = { id: generateId(), name: raceName.trim(), date: raceDate };
    save({ ...training, races: [...training.races, r] });
    setRaceName(''); setRaceDate('');
  };

  const occurrences = useMemo(
    () => training.programmes.flatMap(p => sessionOccurrences(p).map(o => ({ ...o, programme: p }))),
    [training.programmes]
  );
  const upcomingRaces = [...training.races]
    .filter(r => differenceInCalendarDays(parseISO(r.date), new Date()) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const days = monthGridDays(month);

  return (
    <div className="min-h-screen w-full" style={{ backgroundImage: `url(${elfVillageBg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed', imageRendering: 'pixelated' }}>
      <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"><ArrowLeft className="w-5 h-5" /></Link>
          <Dumbbell className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Training Grounds</h1>
          <span className="ml-auto text-xs text-muted-foreground hidden md:block">Workouts appear in your Diary and the "Training" list on the days they're due.</span>
        </div>
      </header>

      <main className="p-4 md:p-6 max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-6 pb-24">
        {/* Left: races + programmes */}
        <div className="space-y-6">
          <section className="mystical-card rounded-xl p-4 bg-card/60 backdrop-blur-md border border-border/40">
            <h2 className="font-display text-lg mb-3 flex items-center gap-2"><Flag className="w-4 h-4 text-accent" />Races & events</h2>
            <div className="space-y-2 mb-3">
              {upcomingRaces.length === 0 && <p className="text-sm text-muted-foreground">No upcoming races yet.</p>}
              {upcomingRaces.map(r => {
                const d = differenceInCalendarDays(parseISO(r.date), new Date());
                return (
                  <div key={r.id} className="group flex items-center gap-3 p-2 rounded-lg bg-secondary/40">
                    <div className="text-center w-14"><div className="font-display text-xl text-primary">{d}</div><div className="text-[10px] text-muted-foreground">days</div></div>
                    <div className="flex-1"><div className="text-sm">{r.name}</div><div className="text-xs text-muted-foreground">{format(parseISO(r.date), 'EEE d MMM yyyy')}</div></div>
                    <button onClick={() => save({ ...training, races: training.races.filter(x => x.id !== r.id) })} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Race name" value={raceName} onChange={e => setRaceName(e.target.value)} />
              <Input type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)} className="w-40" />
              <Button size="sm" onClick={addRace}><Plus className="w-4 h-4" /></Button>
            </div>
          </section>

          <section className="rounded-xl p-4 bg-card/60 backdrop-blur-md border border-border/40">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <h2 className="font-display text-lg flex items-center gap-2"><Dumbbell className="w-4 h-4 text-accent" />Programmes</h2>
              <div className="ml-auto flex gap-1">
                <Button size="sm" variant="secondary" onClick={() => addProgramme('blank')}>Blank</Button>
                <Button size="sm" variant="secondary" onClick={() => addProgramme('strength')}>Strength template</Button>
                <Button size="sm" variant="secondary" onClick={() => addProgramme('run')}>Running template</Button>
              </div>
            </div>
            {training.programmes.length === 0 && <p className="text-sm text-muted-foreground">Start a programme from a template or from scratch.</p>}
            <div className="space-y-3">
              {training.programmes.map(p => {
                const open = openId === p.id;
                return (
                  <div key={p.id} className="rounded-lg border border-border/40 bg-secondary/30">
                    <div className="flex items-center gap-2 p-3">
                      <button onClick={() => setOpenId(open ? null : p.id)} className="text-muted-foreground">{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                      <Input value={p.title} onChange={e => updateProg(p.id, x => ({ ...x, title: e.target.value }))} className="h-8 font-display" />
                      <Input type="date" value={p.startDate} onChange={e => updateProg(p.id, x => ({ ...x, startDate: e.target.value }))} className="h-8 w-36" />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input type="date" value={p.endDate} onChange={e => updateProg(p.id, x => ({ ...x, endDate: e.target.value }))} className="h-8 w-36" />
                      <button onClick={() => save({ ...training, programmes: training.programmes.filter(x => x.id !== p.id) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {!open && <div className="px-3 pb-3 text-xs text-muted-foreground">{p.sessions.map(s => `${DAYS[s.dayOfWeek]} · ${s.title}`).join('  ·  ') || 'No sessions'}</div>}
                    {open && (
                      <div className="px-3 pb-3 space-y-3">
                        {p.sessions.map(s => (
                          <div key={s.id} className="rounded-md bg-card/50 p-2 space-y-2">
                            <div className="flex gap-2 items-center">
                              <Input value={s.title} onChange={e => updateSession(p.id, s.id, x => ({ ...x, title: e.target.value }))} className="h-8" />
                              <select value={s.dayOfWeek} onChange={e => updateSession(p.id, s.id, x => ({ ...x, dayOfWeek: Number(e.target.value) }))} className="h-8 rounded-md bg-input border border-border px-2 text-sm">
                                {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                              </select>
                              <Input type="time" value={s.time} onChange={e => updateSession(p.id, s.id, x => ({ ...x, time: e.target.value }))} className="h-8 w-28" />
                              <Input type="number" min={5} step={5} value={s.duration} onChange={e => updateSession(p.id, s.id, x => ({ ...x, duration: Number(e.target.value) || 30 }))} className="h-8 w-20" title="Minutes" />
                              <span className="text-xs text-muted-foreground">min</span>
                              <button onClick={() => updateProg(p.id, x => ({ ...x, sessions: x.sessions.filter(y => y.id !== s.id) }))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            {s.exercises.map(e => (
                              <div key={e.id} className="flex gap-1 items-center pl-4">
                                <Input placeholder="Exercise" value={e.name} onChange={v => updateSession(p.id, s.id, x => ({ ...x, exercises: x.exercises.map(y => y.id === e.id ? { ...y, name: v.target.value } : y) }))} className="h-7 text-xs" />
                                <Input placeholder="Sets" type="number" value={e.sets ?? ''} onChange={v => updateSession(p.id, s.id, x => ({ ...x, exercises: x.exercises.map(y => y.id === e.id ? { ...y, sets: v.target.value ? Number(v.target.value) : undefined } : y) }))} className="h-7 w-16 text-xs" />
                                <Input placeholder="Reps / distance" value={e.reps ?? ''} onChange={v => updateSession(p.id, s.id, x => ({ ...x, exercises: x.exercises.map(y => y.id === e.id ? { ...y, reps: v.target.value } : y) }))} className="h-7 w-28 text-xs" />
                                <Input placeholder="Weight / pace" value={e.weight ?? ''} onChange={v => updateSession(p.id, s.id, x => ({ ...x, exercises: x.exercises.map(y => y.id === e.id ? { ...y, weight: v.target.value } : y) }))} className="h-7 w-28 text-xs" />
                                <button onClick={() => updateSession(p.id, s.id, x => ({ ...x, exercises: x.exercises.filter(y => y.id !== e.id) }))} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <button onClick={() => updateSession(p.id, s.id, x => ({ ...x, exercises: [...x.exercises, ex('')] }))} className="pl-4 text-xs text-primary hover:underline">+ Add exercise</button>
                          </div>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => updateProg(p.id, x => ({ ...x, sessions: [...x.sessions, { id: generateId(), title: 'Workout', dayOfWeek: 1, time: '07:00', duration: 45, exercises: [] }] }))}>
                          <Plus className="w-4 h-4 mr-1" />Add workout day
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: calendar */}
        <section className="rounded-xl p-4 bg-card/60 backdrop-blur-md border border-border/40 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setMonth(m => addMonths(m, -1))} className="p-1 rounded hover:bg-secondary/50"><ChevronLeft className="w-4 h-4" /></button>
            <h2 className="font-display text-lg w-44 text-center">{format(month, 'MMMM yyyy')}</h2>
            <button onClick={() => setMonth(m => addMonths(m, 1))} className="p-1 rounded hover:bg-secondary/50"><ChevronRight className="w-4 h-4" /></button>
            <Button size="sm" variant="ghost" onClick={() => setMonth(new Date())}>Today</Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-foreground mb-1">
            {days.slice(0, 7).map(d => <div key={d.toISOString()} className="text-center">{format(d, 'EEE')}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map(d => {
              const dayKey = iso(d);
              const blocks = training.programmes.filter(p => p.startDate <= dayKey && dayKey <= p.endDate);
              const sess = occurrences.filter(o => isSameDay(o.date, d));
              const races = training.races.filter(r => r.date === dayKey);
              return (
                <div key={dayKey} className={cn('min-h-[86px] rounded-md p-1 border border-border/30 bg-secondary/20', !isSameMonth(d, month) && 'opacity-40', isSameDay(d, new Date()) && 'ring-1 ring-primary')}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{format(d, 'd')}</span>
                    {blocks.length > 0 && <span className="h-1 flex-1 ml-1 rounded bg-primary/30" title={blocks.map(b => b.title).join(', ')} />}
                  </div>
                  {races.map(r => <div key={r.id} className="mt-0.5 text-[10px] rounded px-1 bg-accent/30 text-accent-foreground truncate">🏁 {r.name}</div>)}
                  {sess.map(o => (
                    <div key={o.session.id} className="mt-0.5 text-[10px] rounded px-1 bg-primary/20 truncate" title={o.session.exercises.map(exerciseLabel).join('\n')}>
                      {o.session.time} {o.session.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
