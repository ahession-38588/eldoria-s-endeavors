import { useApp } from '@/lib/AppContext';
import { useMemo } from 'react';
import { BarChart3, CheckCircle2, ListTodo, Target, Clock, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import pixelSkyBg from '@/assets/pixel-sky-bg.png';
import AdBanner from '@/components/AdBanner';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function StatCard({ icon: Icon, label, value, sub, className }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "mystical-card rounded-xl p-5 glow-border flex flex-col gap-2",
      className
    )}>
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="w-4 h-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="text-3xl font-display glow-text">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function Stats() {
  const { state } = useApp();

  const stats = useMemo(() => {
    const allTasks = state.lists.flatMap(l => l.tasks);
    const completed = allTasks.filter(t => t.completed);
    const pending = allTasks.filter(t => !t.completed);
    const focused = state.focusedTaskIds.length;
    const scheduled = allTasks.filter(t => t.scheduledTime).length;
    const totalDuration = allTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    const completedDuration = completed.reduce((sum, t) => sum + (t.duration || 0), 0);
    const completionRate = allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0;

    const listsBreakdown = state.lists.map(list => {
      const done = list.tasks.filter(t => t.completed).length;
      const total = list.tasks.length;
      return { name: list.name, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
    });

    return {
      total: allTasks.length,
      completed: completed.length,
      pending: pending.length,
      focused,
      scheduled,
      totalDuration,
      completedDuration,
      completionRate,
      listsBreakdown,
      listCount: state.lists.length,
    };
  }, [state]);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${pixelSkyBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        imageRendering: 'pixelated',
      }}
    >
      {/* Header */}
      <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <BarChart3 className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Quest Stats</h1>
        </div>
      </header>

      <main className="p-4 md:p-6 pb-24">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={ListTodo} label="Total Tasks" value={stats.total} />
            <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub={`${stats.completionRate}% done`} />
            <StatCard icon={Target} label="In Focus" value={stats.focused} />
            <StatCard icon={Clock} label="Time Planned" value={stats.totalDuration > 0 ? formatDuration(stats.totalDuration) : '—'} sub={stats.completedDuration > 0 ? `${formatDuration(stats.completedDuration)} completed` : undefined} />
          </div>

          {/* Completion bar */}
          {stats.total > 0 && (
            <div className="mystical-card rounded-xl p-5 glow-border">
              <p className="text-sm text-muted-foreground mb-3">Overall Completion</p>
              <div className="h-4 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{stats.completed} completed</span>
                <span>{stats.pending} remaining</span>
              </div>
            </div>
          )}

          {/* Per-list breakdown */}
          {stats.listsBreakdown.length > 0 && (
            <div className="mystical-card rounded-xl p-5 glow-border">
              <p className="text-sm text-muted-foreground mb-4">Lists Breakdown</p>
              <div className="space-y-4">
                {stats.listsBreakdown.map((list) => (
                  <div key={list.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium truncate">{list.name}</span>
                      <span className="text-muted-foreground flex-shrink-0 ml-2">{list.done}/{list.total}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-secondary/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${list.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {stats.total === 0 && (
            <div className="mystical-card rounded-xl p-10 glow-border flex flex-col items-center text-center">
              <Sparkles className="w-12 h-12 text-primary/40 mb-4 float-animation" />
              <p className="text-muted-foreground">No quests yet. Start adding tasks to see your stats!</p>
            </div>
          )}
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
