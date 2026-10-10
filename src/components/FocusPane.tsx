import { Target, Sparkles, Clock, X, Check, GripHorizontal, ChevronLeft, ChevronRight, Pencil, Trash2, CalendarDays } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { format, parse, addDays, addWeeks, addMonths, isSameDay, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Task } from '@/lib/types';
import { toast } from 'sonner';
import { CalendarSyncDialog } from './CalendarSyncDialog';
import { WeekView, MonthView, DiaryItem, monthGridDays, weekDays } from './DiaryViews';
import { useGoogleCalendar } from '@/lib/useGoogleCalendar';

const SLOT_HEIGHT = 48; // Height in pixels for 15 minutes
const MINUTES_PER_SLOT = 15;
const MIN_DURATION = 15;
const MAX_DURATION = 240;

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

interface ResizeState {
  taskId: string;
  startY: number;
  startHeight: number;
  startDuration: number;
}

export function FocusPane() {
  const { state, getFocusedTasks, dispatch } = useApp();
  const focusedTasks = getFocusedTasks();
  const scheduleSettings = state.scheduleSettings || { startTime: '09:00', endTime: '17:00' };
  
  const [startTime, setStartTime] = useState(scheduleSettings.startTime);
  const [endTime, setEndTime] = useState(scheduleSettings.endTime);
  const [draggingTask, setDraggingTask] = useState<{ task: Task; listId: string } | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [previewDuration, setPreviewDuration] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const timelineRef = useRef<HTMLDivElement>(null);

  // Fetch range: the whole visible month grid around the selected date
  const [rangeStart, rangeEnd] = useMemo(() => {
    const days = monthGridDays(selectedDate);
    return [startOfDay(days[0]), addDays(startOfDay(days[days.length - 1]), 1)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format(selectedDate, 'yyyy-MM')]);
  const gcal = useGoogleCalendar(rangeStart, rangeEnd);

  const shift = (dir: number) => {
    setSelectedDate(d => view === 'day' ? addDays(d, dir) : view === 'week' ? addWeeks(d, dir) : addMonths(d, dir));
  };
  const dateLabel = view === 'day'
    ? format(selectedDate, 'EEEE, d MMM yyyy')
    : view === 'week'
      ? `Week of ${format(weekDays(selectedDate)[0], 'd MMM yyyy')}`
      : format(selectedDate, 'MMMM yyyy');
  const openDay = (d: Date) => { setSelectedDate(d); setView('day'); };

  // Every task with a date, from all lists (the diary shows them whether or not they're focused)
  const datedTasks = useMemo(() => {
    const out: { task: Task; listId: string }[] = [];
    for (const list of state.lists) for (const task of list.tasks) if (task.scheduledTime) out.push({ task, listId: list.id });
    return out;
  }, [state.lists]);
  const dayTasks = useMemo(
    () => datedTasks.filter(({ task }) => isSameDay(new Date(task.scheduledTime!), selectedDate)),
    [datedTasks, selectedDate]
  );

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
    
    return dayTasks
      .map(({ task, listId }) => {
        const taskTime = new Date(task.scheduledTime!);
        const taskMinutes = taskTime.getHours() * 60 + taskTime.getMinutes();
        const duration = task.duration || 30;
        const offsetMinutes = taskMinutes - startMinutes;
        const top = (offsetMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT;
        const height = (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT;
        return { task, listId, top, height };
      })
      .filter(item => {
        const taskMinutes = timeToMinutes(format(new Date(item.task.scheduledTime!), 'HH:mm'));
        return taskMinutes >= startMinutes && taskMinutes < endMinutes;
      });
  }, [dayTasks, startTime, endTime]);

  // Check if scheduling a task would overlap with existing tasks on the selected day
  const checkOverlap = useCallback((
    newStartMinutes: number,
    newDuration: number,
    excludeTaskId?: string
  ): boolean => {
    const newEndMinutes = newStartMinutes + newDuration;
    for (const { task } of dayTasks) {
      if (task.id === excludeTaskId) continue;
      const taskTime = new Date(task.scheduledTime!);
      const taskStart = taskTime.getHours() * 60 + taskTime.getMinutes();
      const taskEnd = taskStart + (task.duration || 30);
      if (newStartMinutes < taskEnd && newEndMinutes > taskStart) return true;
    }
    return false;
  }, [dayTasks]);

  const isSlotOccupied = useCallback((slotMinutes: number, excludeTaskId?: string): boolean => {
    for (const { task } of dayTasks) {
      if (task.id === excludeTaskId) continue;
      const taskTime = new Date(task.scheduledTime!);
      const taskStart = taskTime.getHours() * 60 + taskTime.getMinutes();
      const taskEnd = taskStart + (task.duration || 30);
      if (slotMinutes >= taskStart && slotMinutes < taskEnd) return true;
    }
    return false;
  }, [dayTasks]);

  // All calendar events (linked feeds + Google), normalised
  const allEvents = useMemo(() => {
    const enabledFeeds = new Set((state.calendarFeeds || []).filter(f => f.enabled).map(f => f.id));
    const feedEvents = (state.calendarEvents || [])
      .filter(ev => enabledFeeds.has(ev.feedId))
      .map(ev => ({ id: ev.id, title: ev.title, start: new Date(ev.start), durationMinutes: ev.durationMinutes, allDay: ev.allDay, location: ev.location, google: false }));
    const googleEvents = gcal.events.map(ev => {
      const start = ev.allDay ? parse(ev.start, 'yyyy-MM-dd', new Date()) : new Date(ev.start);
      const end = ev.end ? (ev.allDay ? parse(ev.end, 'yyyy-MM-dd', new Date()) : new Date(ev.end)) : start;
      return { id: ev.id, title: ev.title, start, durationMinutes: Math.max(15, Math.round((+end - +start) / 60000)), allDay: ev.allDay, location: ev.location, google: true };
    });
    return [...feedEvents, ...googleEvents];
  }, [state.calendarEvents, state.calendarFeeds, gcal.events]);

  const calendarBlocks = useMemo(() => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    return allEvents
      .filter(ev => isSameDay(ev.start, selectedDate))
      .map(ev => {
        const evStart = ev.allDay ? startMinutes : ev.start.getHours() * 60 + ev.start.getMinutes();
        const duration = ev.allDay ? Math.min(30, Math.max(15, endMinutes - startMinutes)) : ev.durationMinutes;
        return {
          event: { ...ev, start: ev.start.toISOString() },
          google: ev.google,
          top: ((evStart - startMinutes) / MINUTES_PER_SLOT) * SLOT_HEIGHT,
          height: (duration / MINUTES_PER_SLOT) * SLOT_HEIGHT,
          visible: evStart + duration > startMinutes && evStart < endMinutes,
        };
      })
      .filter(b => b.visible);
  }, [allEvents, selectedDate, startTime, endTime]);

  const diaryItems: DiaryItem[] = useMemo(() => [
    ...datedTasks.map(({ task }) => ({ id: task.id, kind: 'task' as const, title: task.text, date: new Date(task.scheduledTime!), completed: task.completed })),
    ...allEvents.map(ev => ({ id: ev.id, kind: 'event' as const, title: ev.title, date: ev.start, allDay: ev.allDay })),
  ], [datedTasks, allEvents]);

  const moveTaskToDay = (taskId: string, day: Date) => {
    const found = datedTasks.find(t => t.task.id === taskId);
    if (!found) return;
    const old = new Date(found.task.scheduledTime!);
    const next = new Date(day);
    next.setHours(old.getHours(), old.getMinutes(), 0, 0);
    dispatch({ type: 'SCHEDULE_TASK', payload: { taskId, scheduledTime: next.toISOString(), duration: found.task.duration || 30 } });
  };

  const createGoogleEventAt = (time: string) => {
    if (gcal.status !== 'connected') return;
    const title = window.prompt('New Google Calendar event');
    if (!title?.trim()) return;
    const [h, m] = time.split(':').map(Number);
    const start = new Date(selectedDate);
    start.setHours(h, m, 0, 0);
    gcal.upsert({ title: title.trim(), start: start.toISOString(), end: new Date(+start + 30 * 60000).toISOString() });
  };

  const renameGoogleEvent = (id: string) => {
    const ev = gcal.events.find(e => e.id === id);
    if (!ev) return;
    const title = window.prompt('Rename event', ev.title);
    if (!title?.trim() || title === ev.title) return;
    gcal.upsert({ id, title: title.trim(), start: ev.start, end: ev.end ?? ev.start, allDay: ev.allDay });
  };

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
    const [hours, mins] = slotTime.split(':').map(Number);
    const slotMinutes = hours * 60 + mins;
    const duration = draggingTask.task.duration || 30;
    
    // Check for overlap before scheduling
    if (checkOverlap(slotMinutes, duration, draggingTask.task.id)) {
      toast.error('Cannot schedule here - overlaps with another task');
      setDraggingTask(null);
      setDragOverSlot(null);
      return;
    }
    
    const today = new Date();
    today.setHours(hours, mins, 0, 0);
    
    dispatch({
      type: 'SCHEDULE_TASK',
      payload: {
        taskId: draggingTask.task.id,
        scheduledTime: today.toISOString(),
        duration: duration,
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

  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizing({
      taskId: task.id,
      startY: e.clientY,
      startHeight: ((task.duration || 30) / MINUTES_PER_SLOT) * SLOT_HEIGHT,
      startDuration: task.duration || 30,
    });
    setPreviewDuration(task.duration || 30);
  }, []);

  // Attach global mouse events for resize
  useEffect(() => {
    if (!resizing) return;
    
    // Find the task being resized to get its start time
    const resizingTask = focusedTasks.find(({ task }) => task.id === resizing.taskId);
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - resizing.startY;
      const deltaDuration = Math.round(deltaY / SLOT_HEIGHT) * MINUTES_PER_SLOT;
      const newDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, resizing.startDuration + deltaDuration));
      
      // Check overlap before updating preview
      if (resizingTask?.task.scheduledTime) {
        const taskTime = new Date(resizingTask.task.scheduledTime);
        const taskStart = taskTime.getHours() * 60 + taskTime.getMinutes();
        
        if (!checkOverlap(taskStart, newDuration, resizing.taskId)) {
          setPreviewDuration(newDuration);
        }
      } else {
        setPreviewDuration(newDuration);
      }
    };
    
    const handleMouseUp = () => {
      if (previewDuration !== null) {
        dispatch({
          type: 'UPDATE_TASK_DURATION',
          payload: { taskId: resizing.taskId, duration: previewDuration },
        });
      }
      setResizing(null);
      setPreviewDuration(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, previewDuration, dispatch, focusedTasks, checkOverlap]);

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-xl text-foreground glow-text">Diary</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={gcal.status === 'connected' ? () => { if (confirm('Disconnect Google Calendar?')) gcal.disconnect(); } : gcal.connect}
            className={cn(
              "text-xs px-2 py-1 rounded-md border transition-colors",
              gcal.status === 'connected' ? "border-primary/40 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground"
            )}
            title={gcal.status === 'connected' ? 'Google Calendar connected — click to disconnect' : 'Connect Google Calendar'}
          >
            {gcal.status === 'connected' ? 'Google ✓' : gcal.status === 'reconnect' ? 'Reconnect Google' : 'Connect Google'}
          </button>
          <CalendarSyncDialog />
        </div>
      </div>

      {/* Date navigation + view switcher */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button onClick={() => shift(-1)} className="p-1 rounded hover:bg-secondary/50" aria-label="Previous"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => setSelectedDate(new Date())} className="text-xs px-2 py-1 rounded-md border border-border/50 hover:border-primary/40">Today</button>
        <button onClick={() => shift(1)} className="p-1 rounded hover:bg-secondary/50" aria-label="Next"><ChevronRight className="w-4 h-4" /></button>
        <span className="font-display text-sm text-foreground ml-1">{dateLabel}</span>
        <div className="ml-auto flex rounded-md border border-border/50 overflow-hidden">
          {(['day', 'week', 'month'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn("text-xs px-2.5 py-1 capitalize", view === v ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {v}
            </button>
          ))}
        </div>
      </div>


      {/* Time Range Selector */}
      <div className={cn("flex items-center gap-3 mb-4 p-3 rounded-lg bg-secondary/30 border border-border/30", view !== 'day' && "hidden")}>
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

      {view !== 'day' ? (
        <div className="flex-1 overflow-y-auto">
          {view === 'week' ? (
            <WeekView items={diaryItems} selectedDate={selectedDate} onSelectDay={openDay} onDropTask={moveTaskToDay} />
          ) : (
            <MonthView items={diaryItems} selectedDate={selectedDate} onSelectDay={openDay} onDropTask={moveTaskToDay} />
          )}
        </div>
      ) : (
      /* Timeline */
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
              const slotMinutes = timeToMinutes(time);
              const isOccupied = draggingTask ? isSlotOccupied(slotMinutes, draggingTask.task.id) : false;
              
              return (
                <div
                  key={time}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDoubleClick={() => createGoogleEventAt(time)}
                  title={gcal.status === 'connected' ? 'Double-click to add a Google Calendar event' : undefined}
                  className={cn(
                    "relative flex items-start border-t transition-colors",
                    isHour ? "border-border/60" : "border-border/20",
                    dragOverSlot === index && !isOccupied && "bg-primary/10",
                    dragOverSlot === index && isOccupied && "bg-destructive/10"
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

            {/* Calendar events layer (behind tasks) */}
            <div className="absolute inset-0 left-16 pointer-events-none">
              {calendarBlocks.map(({ event, top, height, google }) => (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-1 right-1 rounded-lg px-2 py-1 border border-dashed border-accent/50 bg-accent/10 group",
                    google && "pointer-events-auto"
                  )}
                  style={{ top: `${top}px`, height: `${Math.max(height - 4, 24)}px` }}
                  title={event.location ? `${event.title} — ${event.location}` : event.title}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <CalendarDays className="w-3 h-3 text-accent-foreground/70 shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1">{event.title}</span>
                    {google && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => renameGoogleEvent(event.id)} className="p-0.5 text-muted-foreground hover:text-foreground" title="Rename">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => gcal.remove(event.id)} className="p-0.5 text-muted-foreground hover:text-destructive" title="Delete from Google Calendar">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {height > 40 && !event.allDay && (
                    <p className="text-[10px] text-muted-foreground/80">
                      {format(new Date(event.start), 'h:mm a')}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Scheduled tasks overlay */}
            <div className="absolute inset-0 left-16 pointer-events-none">
              {scheduledTasks.map(({ task, listId, top, height }) => {
                const isResizing = resizing?.taskId === task.id;
                const displayDuration = isResizing && previewDuration !== null 
                  ? previewDuration 
                  : (task.duration || 30);
                const displayHeight = isResizing && previewDuration !== null
                  ? (previewDuration / MINUTES_PER_SLOT) * SLOT_HEIGHT
                  : height;
                
                return (
                  <div
                    key={task.id}
                    draggable={!isResizing}
                    onDragStart={() => handleDragStart(task, listId)}
                    onDragEnd={() => { setDraggingTask(null); setDragOverSlot(null); }}
                    className={cn(
                      "absolute left-1 right-1 rounded-lg p-2 pointer-events-auto",
                      "bg-primary/20 border border-primary/40 hover:border-primary/60",
                      "cursor-grab active:cursor-grabbing group",
                      isResizing && "border-primary ring-2 ring-primary/30",
                      task.completed && "opacity-50 line-through"
                    )}
                    style={{ 
                      top: `${top}px`, 
                      height: `${Math.max(displayHeight - 4, 32)}px`,
                      minHeight: '32px',
                      transition: isResizing ? 'none' : 'all 0.2s'
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 h-full">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.text}
                        </p>
                        {displayHeight > 40 && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(task.scheduledTime!), 'h:mm a')} • {formatDuration(displayDuration)}
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
                    
                    {/* Resize handle */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, task)}
                      className={cn(
                        "absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize",
                        "flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        "hover:bg-primary/20 rounded-b-lg"
                      )}
                    >
                      <GripHorizontal className="w-4 h-3 text-primary/60" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Empty state */}
      {view === 'day' && focusedTasks.length === 0 && scheduledTasks.length === 0 && (
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
