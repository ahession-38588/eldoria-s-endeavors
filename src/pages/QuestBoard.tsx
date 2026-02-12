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

    // Count steps, skipping completed quests
    let remaining = diceValue;
    let cur = position;
    while (remaining > 0) {
      cur = (cur + 1) % quests.length;
      if (!quests[cur].isComplete) {
        remaining--;
      }
      // Safety: if all quests are complete, break to avoid infinite loop
      if (remaining > 0 && quests.every(q => q.isComplete)) break;
    }

    dispatch({ type: 'SET_QUEST_BOARD_POSITION', payload: { position: cur } });
    setLandedIndex(cur);

    const landedQuest = quests[cur];
    if (landedQuest && !landedQuest.isComplete) {
      setTimeout(() => {
        dispatch({ type: 'COMPLETE_QUEST', payload: { questId: landedQuest.id } });
        toast.success(`Quest complete: "${landedQuest.title}" 🎉`);
      }, 600);
    } else if (quests.every(q => q.isComplete)) {
      toast('All quests completed! Reset to play again.', { icon: '🏆' });
    }

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

          {/* Snake-shaped board path */}
          {quests.length > 0 ? (
            <div className="overflow-x-auto pb-2">
              <div
                className="grid gap-4 min-w-[600px]"
                style={{
                  gridTemplateColumns: 'repeat(5, 1fr)',
                }}
              >
                {quests.map((quest, i) => {
                  const cols = 5;
                  const row = Math.floor(i / cols);
                  const colInRow = i % cols;
                  const isReversed = row % 2 === 1;
                  const gridCol = isReversed ? cols - colInRow : colInRow + 1;
                  const gridRow = row + 1;

                  // Determine connector direction
                  const isLastInRow = colInRow === cols - 1;
                  const isFirstInRow = colInRow === 0;
                  const showDownConnector = (isLastInRow && !isReversed && i + 1 < quests.length) ||
                                            (isFirstInRow && isReversed && i + 1 < quests.length);
                  const showRightConnector = !isLastInRow && !isReversed && i + 1 < quests.length;
                  const showLeftConnector = !isFirstInRow && isReversed && i + 1 < quests.length;

                  return (
                    <div
                      key={quest.id}
                      className="relative"
                      style={{
                        gridColumn: gridCol,
                        gridRow: gridRow,
                      }}
                    >
                      <BoardSquare
                        index={i}
                        quest={quest}
                        hasPlayer={position === i}
                        isLanded={landedIndex === i}
                        onDelete={() => {
                          dispatch({ type: 'DELETE_QUEST', payload: { questId: quest.id } });
                          if (quests.length > 1 && position >= quests.length - 1) {
                            dispatch({ type: 'SET_QUEST_BOARD_POSITION', payload: { position: 0 } });
                          }
                        }}
                      />
                      {/* Right connector (even rows) */}
                      {showRightConnector && (
                        <div className="absolute top-1/2 -right-4 w-4 h-0.5 bg-border" />
                      )}
                      {/* Left connector (odd rows) */}
                      {showLeftConnector && (
                        <div className="absolute top-1/2 -left-4 w-4 h-0.5 bg-border" />
                      )}
                      {/* Down connector (end of row) */}
                      {showDownConnector && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
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
