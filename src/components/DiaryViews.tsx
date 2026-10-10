import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarDays, Check } from 'lucide-react';
import { useState } from 'react';

export interface DiaryItem {
  id: string;
  kind: 'task' | 'event';
  title: string;
  date: Date;
  allDay?: boolean;
  completed?: boolean;
}

/** Returns the visible grid days for the month containing `date` (Mon-start weeks). */
export function monthGridDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
  return days;
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

interface Props {
  items: DiaryItem[];
  selectedDate: Date;
  onSelectDay: (d: Date) => void;
  onDropTask: (taskId: string, day: Date) => void;
}

function ItemChip({ item }: { item: DiaryItem }) {
  return (
    <div
      draggable={item.kind === 'task'}
      onDragStart={e => e.dataTransfer.setData('text/task-id', item.id)}
      className={cn(
        'flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded truncate',
        item.kind === 'task'
          ? 'bg-primary/20 border border-primary/30 cursor-grab'
          : 'bg-accent/10 border border-dashed border-accent/40 text-muted-foreground',
        item.completed && 'opacity-50 line-through',
      )}
      title={item.title}
    >
      {item.kind === 'event' ? <CalendarDays className="w-3 h-3 shrink-0" /> : item.completed ? <Check className="w-3 h-3 shrink-0" /> : null}
      {!item.allDay && <span className="text-muted-foreground shrink-0">{format(item.date, 'HH:mm')}</span>}
      <span className="truncate">{item.title}</span>
    </div>
  );
}

function DayCell({ day, items, selectedDate, onSelectDay, onDropTask, muted, tall, max }: Props & { day: Date; muted?: boolean; tall?: boolean; max: number }) {
  const [over, setOver] = useState(false);
  const dayItems = items.filter(i => isSameDay(i.date, day)).sort((a, b) => +a.date - +b.date);
  const isToday = isSameDay(day, new Date());
  return (
    <div
      onClick={() => onSelectDay(day)}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => {
        setOver(false);
        const id = e.dataTransfer.getData('text/task-id');
        if (id) onDropTask(id, day);
      }}
      className={cn(
        'rounded-lg border border-border/30 p-1.5 cursor-pointer hover:border-primary/40 transition-colors flex flex-col gap-1 min-w-0',
        tall ? 'min-h-[220px]' : 'min-h-[84px]',
        muted && 'opacity-50',
        isSameDay(day, selectedDate) && 'border-primary/60',
        over && 'bg-primary/10',
      )}
    >
      <div className={cn('text-xs font-medium', isToday ? 'text-primary' : 'text-foreground')}>
        {tall ? format(day, 'EEE d') : format(day, 'd')}
      </div>
      {dayItems.slice(0, max).map(i => <ItemChip key={`${i.kind}-${i.id}`} item={i} />)}
      {dayItems.length > max && <span className="text-[10px] text-muted-foreground">+{dayItems.length - max} more</span>}
    </div>
  );
}

export function WeekView(props: Props) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {weekDays(props.selectedDate).map(d => (
        <DayCell key={d.toISOString()} {...props} day={d} tall max={12} />
      ))}
    </div>
  );
}

export function MonthView(props: Props) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="text-[11px] text-muted-foreground text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {monthGridDays(props.selectedDate).map(d => (
          <DayCell key={d.toISOString()} {...props} day={d} muted={!isSameMonth(d, props.selectedDate)} max={3} />
        ))}
      </div>
    </div>
  );
}
