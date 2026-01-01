import { useState, useMemo } from 'react';
import { Plus, ScrollText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TodoListCard } from './TodoListCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task } from '@/lib/types';

export function ListsArea() {
  const { state, dispatch } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [activeTask, setActiveTask] = useState<{ task: Task; listId: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleAddList = () => {
    if (newListName.trim()) {
      dispatch({ type: 'ADD_LIST', payload: { name: newListName.trim() } });
      setNewListName('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddList();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewListName('');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    
    if (activeData?.type === 'task') {
      setActiveTask({
        task: activeData.task,
        listId: activeData.listId,
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== 'task') return;

    const activeListId = activeData.listId;
    let overListId: string | null = null;

    // Determine the target list
    if (overData?.type === 'list') {
      overListId = overData.listId;
    } else if (overData?.type === 'task') {
      overListId = overData.listId;
    }

    if (!overListId || activeListId === overListId) return;

    // Find the target list
    const overList = state.lists.find(l => l.id === overListId);
    if (!overList) return;

    // Calculate new index
    let newIndex = overList.tasks.length;
    if (overData?.type === 'task') {
      const overTaskIndex = overList.tasks.findIndex(t => t.id === over.id);
      if (overTaskIndex !== -1) {
        newIndex = overTaskIndex;
      }
    }

    // Move task between lists
    dispatch({
      type: 'MOVE_TASK_BETWEEN_LISTS',
      payload: {
        fromListId: activeListId,
        toListId: overListId,
        taskId: active.id as string,
        newIndex,
      },
    });

    // Update active task's listId
    setActiveTask(prev => prev ? { ...prev, listId: overListId! } : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== 'task') return;

    // Same list reordering
    if (overData?.type === 'task' && activeData.listId === overData.listId) {
      const listId = activeData.listId;
      const list = state.lists.find(l => l.id === listId);
      if (!list) return;

      const oldIndex = list.tasks.findIndex(t => t.id === active.id);
      const newIndex = list.tasks.findIndex(t => t.id === over.id);

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        dispatch({
          type: 'REORDER_TASK',
          payload: { listId, oldIndex, newIndex },
        });
      }
    }
  };

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-ethereal/20">
            <ScrollText className="w-5 h-5 text-ethereal" />
          </div>
          <h2 className="font-display text-xl text-foreground glow-text">Quest Scrolls</h2>
        </div>

        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            New List
          </Button>
        )}
      </div>

      {/* New list input */}
      {isAdding && (
        <div className="flex gap-2 mb-4 animate-fade-in">
          <Input
            autoFocus
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter list name..."
            className="flex-1 bg-input/50 border-border/50 focus:border-primary/50"
          />
          <Button onClick={handleAddList} size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary">
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewListName('');
            }}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Lists container */}
      <div className="flex-1 overflow-y-auto">
        {state.lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <ScrollText className="w-12 h-12 text-ethereal/40 mb-4" />
            <p className="text-muted-foreground mb-2">
              No quest scrolls yet
            </p>
            <p className="text-muted-foreground/60 text-sm mb-4">
              Create your first list to begin your journey
            </p>
            {!isAdding && (
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First List
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {state.lists.map((list) => (
                <TodoListCard key={list.id} list={list} />
              ))}
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="p-2 rounded-md bg-card border border-primary/50 shadow-glow text-sm text-foreground">
                  {activeTask.task.text}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
