import { Target, Sparkles, Clock, Play } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { FocusedTaskItem } from './FocusedTaskItem';
import { useMemo, useState } from 'react';
import { format, addMinutes } from 'date-fns';
import { cn } from '@/lib/utils';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function FocusPane() {
  const { getFocusedTasks, dispatch } = useApp();
  const focusedTasks = getFocusedTasks();
  const [isScheduleActive, setIsScheduleActive] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);

  const handleComplete = (taskId: string) => {
    dispatch({ type: 'COMPLETE_FOCUSED_TASK', payload: { taskId } });
    // Move to next task if in schedule mode
    if (isScheduleActive && activeTaskIndex < focusedTasks.length - 1) {
      setActiveTaskIndex(prev => prev + 1);
    }
  };

  const handleRemove = (taskId: string) => {
    dispatch({ type: 'REMOVE_FROM_FOCUS', payload: { taskId } });
  };

  // Calculate schedule times
  const schedule = useMemo(() => {
    if (!isScheduleActive) return null;
    
    let currentTime = new Date();
    return focusedTasks.map(({ task }) => {
      const startTime = new Date(currentTime);
      const duration = task.duration || 30; // Default 30 min if not set
      const endTime = addMinutes(startTime, duration);
      currentTime = endTime;
      return {
        startTime,
        endTime,
        duration,
      };
    });
  }, [focusedTasks, isScheduleActive]);

  const totalDuration = useMemo(() => {
    return focusedTasks.reduce((acc, { task }) => acc + (task.duration || 30), 0);
  }, [focusedTasks]);

  const tasksWithDuration = focusedTasks.filter(({ task }) => task.duration);

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-xl text-foreground glow-text">Focus Pane</h2>
        </div>
        
        {focusedTasks.length > 0 && (
          <button
            onClick={() => {
              setIsScheduleActive(!isScheduleActive);
              setActiveTaskIndex(0);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              isScheduleActive 
                ? "bg-primary text-primary-foreground shadow-glow" 
                : "bg-secondary hover:bg-primary/20 text-foreground"
            )}
          >
            <Play className="w-4 h-4" />
            {isScheduleActive ? 'Stop' : 'Start Schedule'}
          </button>
        )}
      </div>

      {/* Schedule summary */}
      {focusedTasks.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-secondary/30 border border-border/30">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium text-foreground">{formatDuration(totalDuration)}</span>
          </div>
          {isScheduleActive && schedule && (
            <div className="text-sm text-muted-foreground">
              Ends at: <span className="text-foreground font-medium">
                {format(schedule[schedule.length - 1]?.endTime || new Date(), 'h:mm a')}
              </span>
            </div>
          )}
          {tasksWithDuration.length < focusedTasks.length && (
            <div className="text-xs text-amber-500">
              {focusedTasks.length - tasksWithDuration.length} task(s) using default 30m
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {focusedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Sparkles className="w-10 h-10 text-primary/40 mb-3 float-animation" />
            <p className="text-muted-foreground text-sm">
              Move tasks here to focus on them
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Click the focus icon on any task
            </p>
          </div>
        ) : (
          focusedTasks.map(({ task, listId }, index) => (
            <div key={task.id} className="relative">
              {/* Time indicator when schedule is active */}
              {isScheduleActive && schedule && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-2">
                  <div className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    index === activeTaskIndex ? "text-primary" : "text-muted-foreground"
                  )}>
                    {format(schedule[index].startTime, 'h:mm a')}
                  </div>
                </div>
              )}
              <FocusedTaskItem
                task={task}
                listId={listId}
                onComplete={() => handleComplete(task.id)}
                onRemove={() => handleRemove(task.id)}
                isActive={isScheduleActive && index === activeTaskIndex}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
