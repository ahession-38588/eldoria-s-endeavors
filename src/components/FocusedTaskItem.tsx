import { Check, X } from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FocusedTaskItemProps {
  task: Task;
  listId: string;
  onComplete: () => void;
  onRemove: () => void;
}

export function FocusedTaskItem({ task, onComplete, onRemove }: FocusedTaskItemProps) {
  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg transition-all duration-300",
          "bg-secondary/50 border border-border/50",
          "hover:border-primary/30 hover:shadow-glow"
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
