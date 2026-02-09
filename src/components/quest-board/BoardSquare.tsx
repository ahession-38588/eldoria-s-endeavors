import { cn } from '@/lib/utils';
import { Quest, QuestCategory } from '@/lib/types';
import { Dumbbell, SprayCan, BookOpen, Swords, Users, HelpCircle, Star, Trash2 } from 'lucide-react';

const CATEGORY_CONFIG: Record<QuestCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  fitness: { label: 'Fitness', icon: Dumbbell, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  cleaning: { label: 'Cleaning', icon: SprayCan, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  study: { label: 'Study', icon: BookOpen, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
  craft: { label: 'Craft', icon: Swords, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
  social: { label: 'Social', icon: Users, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  other: { label: 'Other', icon: HelpCircle, color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/30' },
};

interface BoardSquareProps {
  index: number;
  quest: Quest;
  hasPlayer: boolean;
  isLanded: boolean; // just landed here via dice
  onDelete: () => void;
}

export default function BoardSquare({ index, quest, hasPlayer, isLanded, onDelete }: BoardSquareProps) {
  const config = CATEGORY_CONFIG[quest.category];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 p-3 transition-all duration-500 group min-h-[100px] flex flex-col",
        config.bg,
        hasPlayer && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-glow",
        isLanded && "animate-scale-in",
        quest.isComplete && "opacity-50"
      )}
    >
      {/* Square number */}
      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-card border border-border text-[10px] font-bold flex items-center justify-center text-muted-foreground">
        {index + 1}
      </span>

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-card border border-border text-[10px] flex items-center justify-center text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
        title="Remove quest"
      >
        <Trash2 className="w-3 h-3" />
      </button>

      {/* Player token */}
      {hasPlayer && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="w-7 h-7 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center animate-bounce">
            <Star className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={cn("flex items-center gap-1.5 mb-1", config.color)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[10px] font-medium">{config.label}</span>
      </div>
      <h4 className={cn(
        "text-xs font-semibold text-foreground leading-tight mb-auto",
        quest.isComplete && "line-through"
      )}>
        {quest.title}
      </h4>
      <div className="mt-2 text-[10px] text-muted-foreground">
        ×{quest.completionCount}
      </div>
    </div>
  );
}
