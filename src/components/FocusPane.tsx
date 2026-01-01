import { Target, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { FocusedTaskItem } from './FocusedTaskItem';

export function FocusPane() {
  const { getFocusedTasks, dispatch } = useApp();
  const focusedTasks = getFocusedTasks();

  const handleComplete = (taskId: string) => {
    dispatch({ type: 'COMPLETE_FOCUSED_TASK', payload: { taskId } });
  };

  const handleRemove = (taskId: string) => {
    dispatch({ type: 'REMOVE_FROM_FOCUS', payload: { taskId } });
  };

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-display text-xl text-foreground glow-text">Focus Pane</h2>
      </div>

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
          focusedTasks.map(({ task, listId }) => (
            <FocusedTaskItem
              key={task.id}
              task={task}
              listId={listId}
              onComplete={() => handleComplete(task.id)}
              onRemove={() => handleRemove(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
