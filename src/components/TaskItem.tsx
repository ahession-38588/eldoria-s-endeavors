import { useState } from 'react';
import { Check, Target, BookOpen, Trash2, Edit2, Sparkles } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import { StoryEditor } from './StoryEditor';
import { StoryReveal } from './StoryReveal';
import { Input } from '@/components/ui/input';

interface TaskItemProps {
  task: Task;
  listId: string;
}

export function TaskItem({ task, listId }: TaskItemProps) {
  const { dispatch } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [showStoryReveal, setShowStoryReveal] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const hasUnrevealedStory = task.story && task.storyRevealedLines < task.story.totalLines;
  const hasRevealedStory = task.story && task.storyRevealedLines > 0;

  const handleToggle = () => {
    if (!task.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1000);
      
      if (task.story && task.storyRevealedLines < task.story.totalLines) {
        setTimeout(() => setShowStoryReveal(true), 500);
      }
    }
    dispatch({ type: 'TOGGLE_TASK', payload: { listId, taskId: task.id } });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: { listId, taskId: task.id } });
  };

  const handleMoveToFocus = () => {
    dispatch({ type: 'MOVE_TO_FOCUS', payload: { taskId: task.id } });
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== task.text) {
      dispatch({ type: 'UPDATE_TASK_TEXT', payload: { listId, taskId: task.id, text: editText.trim() } });
    }
    setIsEditing(false);
  };

  const handleSaveStory = (content: string, imageUrl?: string) => {
    dispatch({ type: 'ADD_STORY_TO_TASK', payload: { listId, taskId: task.id, content, imageUrl } });
    setShowStoryEditor(false);
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex items-center gap-2 p-2 rounded-md transition-all duration-300",
          "hover:bg-muted/30",
          task.completed && "opacity-60",
          justCompleted && "task-complete-glow",
          hasUnrevealedStory && !task.completed && "ring-1 ring-glow-gold/20"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            "flex-shrink-0 w-5 h-5 rounded border transition-all duration-300",
            "flex items-center justify-center",
            task.completed
              ? "bg-primary/30 border-primary/50"
              : "border-border hover:border-primary/50 hover:bg-primary/10"
          )}
        >
          {task.completed && <Check className="w-3 h-3 text-primary" />}
        </button>

        {/* Task text */}
        {isEditing ? (
          <Input
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') {
                setEditText(task.text);
                setIsEditing(false);
              }
            }}
            className="flex-1 h-6 text-sm bg-input/50 border-primary/30"
          />
        ) : (
          <span
            className={cn(
              "flex-1 text-sm cursor-pointer transition-colors",
              task.completed ? "line-through text-muted-foreground" : "text-foreground"
            )}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}

        {/* Story indicator */}
        {hasUnrevealedStory && !task.completed && (
          <Sparkles className="w-3 h-3 text-glow-gold animate-glow" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!task.completed && (
            <button
              onClick={handleMoveToFocus}
              className="p-1 rounded text-muted-foreground hover:text-accent hover:bg-accent/20 transition-all"
              title="Move to focus"
            >
              <Target className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => task.story && hasRevealedStory ? setShowStoryReveal(true) : setShowStoryEditor(true)}
            className={cn(
              "p-1 rounded transition-all",
              task.story
                ? "text-glow-gold hover:bg-glow-gold/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title={task.story ? "View/edit story" : "Add story"}
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Story Editor Modal */}
      {showStoryEditor && (
        <StoryEditor
          initialContent={task.story?.content || ''}
          initialImageUrl={task.story?.imageUrl}
          onSave={handleSaveStory}
          onClose={() => setShowStoryEditor(false)}
        />
      )}

      {/* Story Reveal Modal */}
      {showStoryReveal && task.story && hasRevealedStory && (
        <StoryReveal
          story={task.story}
          revealedLines={task.storyRevealedLines}
          onClose={() => setShowStoryReveal(false)}
        />
      )}
    </>
  );
}
