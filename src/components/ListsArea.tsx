import { Plus, ScrollText } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { TodoListCard } from './TodoListCard';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ListsArea() {
  const { state, dispatch } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newListName, setNewListName] = useState('');

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {state.lists.map((list) => (
              <TodoListCard key={list.id} list={list} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
