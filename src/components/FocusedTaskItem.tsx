import { Check, X, BookOpen } from 'lucide-react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { StoryReveal } from './StoryReveal';

interface FocusedTaskItemProps {
  task: Task;
  listId: string;
  onComplete: () => void;
  onRemove: () => void;
}

export function FocusedTaskItem({ task, onComplete, onRemove }: FocusedTaskItemProps) {
  const [showStory, setShowStory] = useState(false);
  const hasUnrevealedStory = task.story && task.storyRevealedLines < task.story.totalLines;
  const hasRevealedStory = task.story && task.storyRevealedLines > 0;

  return (
    <div className="group relative">
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg transition-all duration-300",
          "bg-secondary/50 border border-border/50",
          "hover:border-primary/30 hover:shadow-glow",
          hasUnrevealedStory && "ring-1 ring-glow-gold/30"
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

        <div className="flex items-center gap-2">
          {task.story && (
            <button
              onClick={() => setShowStory(!showStory)}
              className={cn(
                "p-1.5 rounded-md transition-all",
                hasRevealedStory
                  ? "text-glow-gold hover:bg-glow-gold/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={hasRevealedStory ? "View revealed story" : "Story attached"}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all"
            title="Remove from focus"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showStory && task.story && hasRevealedStory && (
        <StoryReveal
          story={task.story}
          revealedLines={task.storyRevealedLines}
          onClose={() => setShowStory(false)}
        />
      )}
    </div>
  );
}
