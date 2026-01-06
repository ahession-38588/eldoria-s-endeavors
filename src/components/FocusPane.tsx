import { Target, Sparkles, Clock, X, Check } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { useMemo, useState, useRef } from 'react';
import { format, parse, addMinutes, isBefore, isAfter, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Task } from '@/lib/types';

const SLOT_HEIGHT = 48; // Height in pixels for 15 minutes
const MINUTES_PER_SLOT = 15;

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

interface ScheduledTask {
  task: Task;
  listId: string;
  top: number;
  height: number;
}

export function FocusPane() {
  const { state, getFocusedTasks, dispatch } = useApp();
  const focusedTasks = getFocusedTasks();
  const scheduleSettings = state.scheduleSettings || { startTime: '09:00', endTime: '17:00' };
  
  const [startTime, setStartTime] = useState(scheduleSettings.startTime);
  const [endTime, setEndTime] = useState(scheduleSettings.endTime);
  const [draggingTask, setDraggingTask] = useState<{ task: Task; listId: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate time slots
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    for (let mins = startMinutes; mins < endMinutes; mins += MINUTES_PER_SLOT) {
      slots.push(minutesToTime(mins));
    }
    return slots;
  }, [startTime, endTime]);

  // Calculate scheduled task positions
  const scheduledTasks: ScheduledTask[] = useMemo(() => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return focusedTasks
      .filter(({ task }) => task.scheduledTime)
      .map(({ task, listId }) => {
        const taskTime = new Date(task.scheduledTime!);
        const taskMinutes = taskTime.getHours() * 60 + taskTime.getMinutes();
        const duration = task.duration || 30;
        
        // Calculate position relative to start
        const offsetMinutes = taskMinutes - startMinutes;
        const top = (offsetMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT;
        const height = (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT;
        
        return { task, listId, top, height };
      })
      .filter(item => {
        const taskMinutes = timeToMinutes(format(new Date(item.task.scheduledTime!), 'HH:mm'));
        return taskMinutes >= startMinutes && taskMinutes < endMinutes;
      });
  }, [focusedTasks, startTime, endTime]);

  // Unscheduled focused tasks
  const unscheduledTasks = focusedTasks.filter(({ task }) => !task.scheduledTime);

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
    dispatch({
      type: 'UPDATE_SCHEDULE_SETTINGS',
      payload: {
        startTime: type === 'start' ? value : startTime,
        endTime: type === 'end' ? value : endTime,
      },
    });
  };

  const handleDragStart = (task: Task, listId: string) => {
    setDraggingTask({ task, listId });
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(slotIndex);
  };

  const handleDrop = (slotIndex: number) => {
    if (!draggingTask) return;
    
    const slotTime = timeSlots[slotIndex];
    const today = new Date();
    const [hours, mins] = slotTime.split(':').map(Number);
    today.setHours(hours, mins, 0, 0);
    
    dispatch({
      type: 'SCHEDULE_TASK',
      payload: {
        taskId: draggingTask.task.id,
        scheduledTime: today.toISOString(),
        duration: draggingTask.task.duration || 30,
      },
    });
    
    setDraggingTask(null);
    setDragOverSlot(null);
  };

  const handleUnschedule = (taskId: string) => {
    dispatch({ type: 'UNSCHEDULE_TASK', payload: { taskId } });
  };

  const handleComplete = (taskId: string) => {
    dispatch({ type: 'COMPLETE_FOCUSED_TASK', payload: { taskId } });
  };

  const handleRemove = (taskId: string) => {
    dispatch({ type: 'REMOVE_FROM_FOCUS', payload: { taskId } });
  };

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-xl text-foreground glow-text">Focus Pane</h2>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/30 border border-border/30">
        <Clock className="w-4 h-4 text-primary" />
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={startTime}
            onChange={(e) => handleTimeChange('start', e.target.value)}
            className="w-28 h-8 text-sm"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => handleTimeChange('end', e.target.value)}
            className="w-28 h-8 text-sm"
          />
        </div>
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Drag tasks to schedule:</p>
          <div className="flex flex-wrap gap-2">
            {unscheduledTasks.map(({ task, listId }) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task, listId)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing",
                  "bg-secondary/70 border border-border/50 hover:border-primary/30",
                  "text-sm transition-all hover:shadow-glow"
                )}
              >
                <span className="truncate max-w-[150px]">{task.text}</span>
                {task.duration && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {formatDuration(task.duration)}
                  </span>
                )}
                <button
                  onClick={() => handleRemove(task.id)}
                  className="p-0.5 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto" ref={timelineRef}>
        {timeSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Sparkles className="w-10 h-10 text-primary/40 mb-3 float-animation" />
            <p className="text-muted-foreground text-sm">
              Set your time range above
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Time grid */}
            {timeSlots.map((time, index) => {
              const isHour = time.endsWith(':00');
              const isHalfHour = time.endsWith(':30');
              
              return (
                <div
                  key={time}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  className={cn(
                    "relative flex items-start border-t transition-colors",
                    isHour ? "border-border/60" : "border-border/20",
                    dragOverSlot === index && "bg-primary/10"
                  )}
                  style={{ height: SLOT_HEIGHT }}
                >
                  {/* Time label */}
                  <div className={cn(
                    "w-16 flex-shrink-0 text-xs pr-2 pt-1 text-right",
                    isHour ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {(isHour || isHalfHour) && format(parse(time, 'HH:mm', new Date()), 'h:mm a')}
                  </div>
                  
                  {/* Drop zone indicator */}
                  <div className="flex-1 h-full" />
                </div>
              );
            })}

            {/* Scheduled tasks overlay */}
            <div className="absolute inset-0 left-16 pointer-events-none">
              {scheduledTasks.map(({ task, listId, top, height }) => (
                <div
                  key={task.id}
                  className={cn(
                    "absolute left-1 right-1 rounded-lg p-2 pointer-events-auto",
                    "bg-primary/20 border border-primary/40 hover:border-primary/60",
                    "transition-all cursor-pointer group",
                    task.completed && "opacity-50 line-through"
                  )}
                  style={{ 
                    top: `${top}px`, 
                    height: `${Math.max(height - 4, 32)}px`,
                    minHeight: '32px'
                  }}
                >
                  <div className="flex items-start justify-between gap-1 h-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {task.text}
                      </p>
                      {height > 40 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(task.scheduledTime!), 'h:mm a')} • {formatDuration(task.duration || 30)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleComplete(task.id)}
                        className="p-1 rounded bg-primary/20 hover:bg-primary/40 text-primary"
                        title="Complete"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleUnschedule(task.id)}
                        className="p-1 rounded bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive"
                        title="Unschedule"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty state */}
      {focusedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="w-10 h-10 text-primary/40 mb-3 float-animation" />
          <p className="text-muted-foreground text-sm">
            Move tasks here to focus on them
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Click the focus icon on any task
          </p>
        </div>
      )}
    </div>
  );
}
