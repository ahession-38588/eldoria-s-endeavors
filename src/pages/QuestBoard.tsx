/* QuestBoard page */
import { useState, useCallback } from 'react';
import { useApp } from '@/lib/AppContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scroll, RotateCcw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import elfVillageBg from '@/assets/elf-village-bg.webp';
import AdBanner from '@/components/AdBanner';
import DiceRoller from '@/components/quest-board/DiceRoller';
import BoardSquare from '@/components/quest-board/BoardSquare';
import AddQuestDialog from '@/components/quest-board/AddQuestDialog';

export default function QuestBoard() {
  const { state, dispatch } = useApp();
  const quests = state.quests;
  const position = state.questBoardPosition;
  const [landedIndex, setLandedIndex] = useState<number | null>(null);

  const handleRoll = useCallback((diceValue: number) => {
    if (quests.length === 0) return;

    const newPos = (position + diceValue) % quests.length;
    dispatch({ type: 'SET_QUEST_BOARD_POSITION', payload: { position: newPos } });
    setLandedIndex(newPos);

    const landedQuest = quests[newPos];
    if (landedQuest && !landedQuest.isComplete) {
      // Auto-complete the quest you land on
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_QUEST', payload: { questId: landedQuest.id } });
        toast.success(`Quest complete: "${landedQuest.title}" 🎉`);
      }, 600);
    } else if (landedQuest?.isComplete) {
      toast('Already completed! Roll again or reset it.', { icon: '🔄' });
    }

    // Clear landed highlight after animation
    setTimeout(() => setLandedIndex(null), 2000);
  }, [quests, position, dispatch]);

  const totalCompleted = quests.reduce((sum, q) => sum + q.completionCount, 0);

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundImage: `url(${elfVillageBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        imageRendering: 'pixelated',
      }}
    >
      {/* Header */}
      <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Scroll className="w-6 h-6 text-accent" />
          <h1 className="font-display text-2xl text-gradient">Quest Board</h1>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full ml-1">
            {quests.length} square{quests.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      <main className="p-4 md:p-6 pb-24">
        <div className="max-w-[1000px] mx-auto">
          {/* Dice + Stats area */}
          <div className="mystical-card rounded-xl p-6 glow-border mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground italic mb-2">
                🎲 Roll the dice to move across the board. Land on a quest to complete it!
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Total completions: <strong className="text-foreground">{totalCompleted}</strong>
                </span>
                {quests.length > 0 && (
                  <span>
                    Position: <strong className="text-foreground">{position + 1}</strong> / {quests.length}
                  </span>
                )}
              </div>
            </div>
            <DiceRoller onRoll={handleRoll} disabled={quests.length === 0} />
          </div>

          {/* Board path */}
          {quests.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {quests.map((quest, i) => (
                <BoardSquare
                  key={quest.id}
                  index={i}
                  quest={quest}
                  hasPlayer={position === i}
                  isLanded={landedIndex === i}
                  onDelete={() => {
                    dispatch({ type: 'DELETE_QUEST', payload: { questId: quest.id } });
                    // Adjust position if needed
                    if (quests.length > 1 && position >= quests.length - 1) {
                      dispatch({ type: 'SET_QUEST_BOARD_POSITION', payload: { position: 0 } });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mystical-card rounded-xl p-10 glow-border flex flex-col items-center text-center">
              <Scroll className="w-12 h-12 text-primary/40 mb-4 float-animation" />
              <p className="text-muted-foreground">The board is empty. Add quest squares to start your adventure!</p>
            </div>
          )}

          {/* Reset completed + Add quest */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <AddQuestDialog />
            {quests.some(q => q.isComplete) && (
              <button
                onClick={() => {
                  quests.filter(q => q.isComplete).forEach(q =>
                    dispatch({ type: 'RESET_QUEST', payload: { questId: q.id } })
                  );
                  toast.success('All quests reset for a new round!');
                }}
                className="mystical-card rounded-xl px-4 py-3 glow-border flex items-center justify-center gap-2 hover:shadow-glow transition-all h-12 text-sm text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Completed
              </button>
            )}
          </div>
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
