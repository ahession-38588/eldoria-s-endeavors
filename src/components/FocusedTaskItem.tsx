import { Check, X, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/AppContext';

interface FocusedTaskItemProps {
  task: Task;
  listId: string;
  onComplete: () => void;
  onRemove: () => void;
  isActive?: boolean;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function FocusedTaskItem({ task, onComplete, onRemove, isActive }: FocusedTaskItemProps) {
  const { dispatch } = useApp();

  const cycleDuration = (direction: 'up' | 'down') => {
    const currentIndex = task.duration 
      ? DURATION_OPTIONS.indexOf(task.duration) 
      : -1;
    
    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentIndex < DURATION_OPTIONS.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : DURATION_OPTIONS.length - 1;
    }
    
    dispatch({ 
      type: 'UPDATE_TASK_DURATION', 
      payload: { taskId: task.id, duration: DURATION_OPTIONS[newIndex] } 
    });
  };

  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg transition-all duration-300",
          "bg-secondary/50 border border-border/50",
          "hover:border-primary/30 hover:shadow-glow",
          isActive && "border-primary/50 bg-primary/10 shadow-glow ring-2 ring-primary/20"
        )}
      >
        <button
          onClick={onComplete}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300",
            "border-primary/50 hover:border-primary hover:bg-primary/20",
            "flex items-center justify-center"
          )}
        >
          <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <span className="flex-1 text-foreground text-sm">{task.text}</span>

        {/* Duration controls */}
        <div className="flex items-center gap-1">
          <div className="flex flex-col">
            <button
              onClick={() => cycleDuration('up')}
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
              title="Increase duration"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => cycleDuration('down')}
              className="p-0.5 text-muted-foreground hover:text-primary transition-colors"
              title="Decrease duration"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <div 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
              task.duration 
                ? "bg-primary/20 text-primary" 
                : "bg-muted text-muted-foreground"
            )}
          >
            <Clock className="w-3 h-3" />
            {task.duration ? formatDuration(task.duration) : '--'}
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all"
          title="Remove from focus"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
