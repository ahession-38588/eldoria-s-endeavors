import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { QuestCategory } from '@/lib/types';
import { Plus, Dumbbell, SprayCan, BookOpen, Swords, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CATEGORY_CONFIG: Record<QuestCategory, { label: string; icon: React.ElementType }> = {
  fitness: { label: 'Fitness', icon: Dumbbell },
  cleaning: { label: 'Cleaning', icon: SprayCan },
  study: { label: 'Study', icon: BookOpen },
  craft: { label: 'Craft', icon: Swords },
  social: { label: 'Social', icon: Users },
  other: { label: 'Other', icon: HelpCircle },
};

export default function AddQuestDialog() {
  const { dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<QuestCategory>('other');

  const handleSubmit = () => {
    if (!title.trim()) return;
    dispatch({ type: 'ADD_QUEST', payload: { title: title.trim(), description: description.trim() || undefined, category } });
    setTitle('');
    setDescription('');
    setCategory('other');
    setOpen(false);
    toast.success('New quest added to the board!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mystical-card rounded-xl p-4 glow-border flex items-center justify-center gap-2 hover:shadow-glow transition-all border-2 border-dashed border-border/50 hover:border-primary/40 h-12">
          <Plus className="w-5 h-5 text-primary/60" />
          <span className="text-sm text-muted-foreground">Add Quest Square</span>
        </button>
      </DialogTrigger>
      <DialogContent className="mystical-card glow-border border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-gradient">Add Quest to Board</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input
            placeholder="Quest title (e.g. Clean the kitchen)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(CATEGORY_CONFIG) as [QuestCategory, typeof CATEGORY_CONFIG[QuestCategory]][]).map(([key, cfg]) => {
                const CatIcon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all",
                      category === key
                        ? "border-primary bg-primary/20 text-foreground"
                        : "border-border/40 text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <CatIcon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium text-sm disabled:opacity-40 transition-colors"
          >
            Add to Board
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
