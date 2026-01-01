import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Plus, MoreHorizontal, Edit2 } from 'lucide-react';
import { TodoList } from '@/lib/types';
import { useApp } from '@/lib/AppContext';
import { TaskItem } from './TaskItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TodoListCardProps {
  list: TodoList;
}

export function TodoListCard({ list }: TodoListCardProps) {
  const { dispatch } = useApp();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const handleToggleCollapse = () => {
    dispatch({ type: 'TOGGLE_LIST_COLLAPSE', payload: { listId: list.id } });
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      dispatch({ type: 'ADD_TASK', payload: { listId: list.id, text: newTaskText.trim() } });
      setNewTaskText('');
      setIsAddingTask(false);
    }
  };

  const handleDeleteList = () => {
    dispatch({ type: 'DELETE_LIST', payload: { listId: list.id } });
  };

  const handleRename = () => {
    if (editName.trim() && editName !== list.name) {
      dispatch({ type: 'RENAME_LIST', payload: { listId: list.id, name: editName.trim() } });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskText('');
    }
  };

  const completedCount = list.tasks.filter(t => t.completed).length;
  const totalCount = list.tasks.length;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all duration-300",
        "bg-card/50 border-border/50",
        "hover:border-ethereal/30 hover:shadow-glow",
        list.isCollapsed && "opacity-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/30">
        <button
          onClick={handleToggleCollapse}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
        >
          {list.isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {isEditing ? (
          <Input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setEditName(list.name);
                setIsEditing(false);
              }
            }}
            className="flex-1 h-7 text-sm bg-input/50 border-primary/30"
          />
        ) : (
          <h3
            className="flex-1 font-display text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {list.name}
          </h3>
        )}

        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteList} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {!list.isCollapsed && (
        <div className="p-3 space-y-2 animate-accordion-down">
          {list.tasks.map((task) => (
            <TaskItem key={task.id} task={task} listId={list.id} />
          ))}

          {isAddingTask ? (
            <div className="flex gap-2 animate-fade-in">
              <Input
                autoFocus
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter task..."
                className="flex-1 h-8 text-sm bg-input/50 border-border/50"
              />
              <Button onClick={handleAddTask} size="sm" className="h-8 bg-primary/20 hover:bg-primary/30 text-primary">
                Add
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 w-full p-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
