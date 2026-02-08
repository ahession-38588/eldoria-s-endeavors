import { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scroll, Plus, RotateCcw, Check, Trash2, Swords, Dumbbell, SprayCan, BookOpen, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuestCategory, Quest } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import pixelSkyBg from '@/assets/pixel-sky-bg.png';
import AdBanner from '@/components/AdBanner';

const CATEGORY_CONFIG: Record<QuestCategory, { label: string; icon: React.ElementType; color: string }> = {
  fitness: { label: 'Fitness', icon: Dumbbell, color: 'text-red-400' },
  cleaning: { label: 'Cleaning', icon: SprayCan, color: 'text-blue-400' },
  study: { label: 'Study', icon: BookOpen, color: 'text-amber-400' },
  craft: { label: 'Craft', icon: Swords, color: 'text-purple-400' },
  social: { label: 'Social', icon: Users, color: 'text-green-400' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-muted-foreground' },
};

function QuestCard({ quest }: { quest: Quest }) {
  const { dispatch } = useApp();
  const config = CATEGORY_CONFIG[quest.category];
  const Icon = config.icon;

  return (
    <div className={cn(
      "mystical-card rounded-xl p-4 glow-border transition-all group relative",
      quest.isComplete && "opacity-60"
    )}>
      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={cn("flex items-center gap-1.5 text-xs font-medium", config.color)}>
          <Icon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'DELETE_QUEST', payload: { questId: quest.id } })}
          className="p-1 rounded opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
          title="Remove quest"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Title & description */}
      <h3 className={cn(
        "font-display text-base text-foreground mb-1",
        quest.isComplete && "line-through"
      )}>
        {quest.title}
      </h3>
      {quest.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{quest.description}</p>
      )}

      {/* Completion count */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
        <span className="text-xs text-muted-foreground">
          Completed <strong className="text-foreground">{quest.completionCount}</strong> time{quest.completionCount !== 1 ? 's' : ''}
        </span>

        {quest.isComplete ? (
          <button
            onClick={() => dispatch({ type: 'RESET_QUEST', payload: { questId: quest.id } })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary/70 hover:bg-secondary text-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        ) : (
          <button
            onClick={() => {
              dispatch({ type: 'COMPLETE_QUEST', payload: { questId: quest.id } });
              toast.success('Quest complete! 🎉');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/20 hover:bg-primary/40 text-primary transition-colors"
          >
            <Check className="w-3 h-3" />
            Turn In
          </button>
        )}
      </div>
    </div>
  );
}

function AddQuestDialog() {
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
    toast.success('New quest posted!');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mystical-card rounded-xl p-4 glow-border flex flex-col items-center justify-center gap-2 min-h-[160px] hover:shadow-glow transition-all border-2 border-dashed border-border/50 hover:border-primary/40">
          <Plus className="w-8 h-8 text-primary/60" />
          <span className="text-sm text-muted-foreground">Post New Quest</span>
        </button>
      </DialogTrigger>
      <DialogContent className="mystical-card glow-border border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-gradient">Post a Quest</DialogTitle>
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
            Post Quest
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function QuestBoard() {
  const { state } = useApp();
  const quests = state.quests;
  const activeQuests = quests.filter(q => !q.isComplete);
  const completedQuests = quests.filter(q => q.isComplete);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${pixelSkyBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        imageRendering: 'pixelated',
      }}
    >
      <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Scroll className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Quest Board</h1>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full ml-1">
            {quests.length} quest{quests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className="p-4 md:p-6 pb-24">
        <div className="max-w-[1200px] mx-auto">
          {/* Tavern board heading */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground italic">
              ⚔️ Repeatable quests await, adventurer. Complete them and turn them in for story rewards.
            </p>
          </div>

          {/* Active quests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
            {completedQuests.map(quest => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
            <AddQuestDialog />
          </div>

          {quests.length === 0 && (
            <div className="mystical-card rounded-xl p-10 glow-border flex flex-col items-center text-center mt-4">
              <Scroll className="w-12 h-12 text-primary/40 mb-4 float-animation" />
              <p className="text-muted-foreground">The quest board is empty. Post your first repeatable quest!</p>
            </div>
          )}
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
