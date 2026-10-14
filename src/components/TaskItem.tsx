import { useState } from 'react';
import { Check, Target, Trash2, Edit2, GripVertical, Plus, ListPlus, X, Repeat } from 'lucide-react';
import { Task } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';

interface TaskItemProps {
  task: Task;
  listId: string;
}

export function TaskItem({ task, listId }: TaskItemProps) {
  const { dispatch, state } = useApp();
  const navigate = useNavigate();
  const linkedLoop = (state.loops ?? []).find(l => l.linkedTaskId === task.id);
  const openLoop = () => navigate(`/loops?task=${encodeURIComponent(task.id)}&title=${encodeURIComponent(task.text)}`);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [justCompleted, setJustCompleted] = useState(false);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [subtaskEditText, setSubtaskEditText] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      listId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = () => {
    if (!task.completed) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1000);
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

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      dispatch({ type: 'ADD_SUBTASK', payload: { listId, taskId: task.id, text: newSubtaskText.trim() } });
      setNewSubtaskText('');
    }
  };

  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const subDone = subtasks.filter(s => s.completed).length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-md transition-all duration-300",
        task.completed && "opacity-60",
        justCompleted && "task-complete-glow",
        isDragging && "opacity-50 shadow-glow z-50 bg-card"
      )}
    >
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-0.5 rounded text-muted-foreground/50 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

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
            {linkedLoop && (
              <button onClick={openLoop} className="ml-2 inline-flex items-center gap-1 text-xs text-accent hover:underline" title="Open loop">
                <Repeat className="w-3 h-3" />{linkedLoop.status === 'resolved' ? 'closed' : linkedLoop.status}
              </button>
            )}
            {hasSubtasks && (
              <span className="ml-2 text-xs text-muted-foreground/70">
                {subDone}/{subtasks.length}
              </span>
            )}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsAddingSubtask(true)}
            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"
            title="Add subtask"
          >
            <ListPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openLoop}
            className="p-1 rounded text-muted-foreground hover:text-accent hover:bg-accent/20 transition-all"
            title={linkedLoop ? 'Open loop' : 'Open as loop'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
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

      {/* Subtasks */}
      {(hasSubtasks || isAddingSubtask) && (
        <div className="ml-8 mr-2 mb-1 space-y-1 border-l border-border/40 pl-2">
          {subtasks.map((s) => (
            <div key={s.id} className="group/sub flex items-center gap-2 py-0.5">
              <button
                onClick={() =>
                  dispatch({ type: 'TOGGLE_SUBTASK', payload: { listId, taskId: task.id, subtaskId: s.id } })
                }
                className={cn(
                  "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all",
                  s.completed
                    ? "bg-primary/30 border-primary/50"
                    : "border-border hover:border-primary/50"
                )}
              >
                {s.completed && <Check className="w-2.5 h-2.5 text-primary" />}
              </button>
              {editingSubtaskId === s.id ? (
                <Input
                  autoFocus
                  value={subtaskEditText}
                  onChange={(e) => setSubtaskEditText(e.target.value)}
                  onBlur={() => {
                    if (subtaskEditText.trim() && subtaskEditText !== s.text) {
                      dispatch({
                        type: 'UPDATE_SUBTASK_TEXT',
                        payload: { listId, taskId: task.id, subtaskId: s.id, text: subtaskEditText.trim() },
                      });
                    }
                    setEditingSubtaskId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setEditingSubtaskId(null);
                  }}
                  className="flex-1 h-5 text-xs bg-input/50 border-primary/30"
                />
              ) : (
                <span
                  onClick={() => {
                    setEditingSubtaskId(s.id);
                    setSubtaskEditText(s.text);
                  }}
                  className={cn(
                    "flex-1 text-xs cursor-pointer",
                    s.completed ? "line-through text-muted-foreground" : "text-foreground/90"
                  )}
                >
                  {s.text}
                </span>
              )}
              <button
                onClick={() =>
                  dispatch({ type: 'DELETE_SUBTASK', payload: { listId, taskId: task.id, subtaskId: s.id } })
                }
                className="opacity-0 group-hover/sub:opacity-100 p-0.5 rounded text-muted-foreground hover:text-destructive transition-all"
                title="Delete subtask"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {isAddingSubtask && (
            <div className="flex gap-1 py-0.5">
              <Input
                autoFocus
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') {
                    setIsAddingSubtask(false);
                    setNewSubtaskText('');
                  }
                }}
                onBlur={() => {
                  handleAddSubtask();
                  setIsAddingSubtask(false);
                }}
                placeholder="Subtask..."
                className="flex-1 h-6 text-xs bg-input/50 border-border/50"
              />
            </div>
          )}
          {!isAddingSubtask && (
            <button
              onClick={() => setIsAddingSubtask(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-foreground transition-colors py-0.5"
            >
              <Plus className="w-3 h-3" />
              Add subtask
            </button>
          )}
        </div>
      )}
    </div>
  );
}

