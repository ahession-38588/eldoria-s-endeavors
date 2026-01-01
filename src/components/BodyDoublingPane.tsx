import { Heart, Sparkles, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { PixelCompanion } from './PixelCompanion';

export function BodyDoublingPane() {
  const { state } = useApp();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  // Get all tasks with revealed story content
  const tasksWithStories = useMemo(() => {
    const stories: { taskText: string; story: string; revealedLines: number; totalLines: number; imageUrl?: string }[] = [];
    
    state.lists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.story && task.storyRevealedLines > 0) {
          stories.push({
            taskText: task.text,
            story: task.story.content,
            revealedLines: task.storyRevealedLines,
            totalLines: task.story.totalLines,
            imageUrl: task.story.imageUrl,
          });
        }
      });
    });
    
    return stories;
  }, [state.lists]);

  const currentStory = tasksWithStories[currentStoryIndex];
  const hasStories = tasksWithStories.length > 0;

  const getVisibleLines = (content: string, revealedCount: number) => {
    return content.split('\n').filter(line => line.trim()).slice(0, revealedCount);
  };

  const handlePrev = () => {
    setCurrentStoryIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentStoryIndex(prev => Math.min(tasksWithStories.length - 1, prev + 1));
  };

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border starfield overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Heart className="w-5 h-5 text-accent" />
        </div>
        <h2 className="font-display text-xl text-foreground glow-text">Companion</h2>
        {hasStories && (
          <div className="ml-auto flex items-center gap-1">
            <BookOpen className="w-4 h-4 text-glow-gold" />
            <span className="text-xs text-muted-foreground">
              {currentStoryIndex + 1}/{tasksWithStories.length}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Pixel Art Companion */}
        <div className="flex justify-center mb-4">
          <PixelCompanion hasStory={hasStories} />
        </div>

        {hasStories && currentStory ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Story image */}
            {currentStory.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-glow-gold/30 mb-3 flex-shrink-0">
                <img
                  src={currentStory.imageUrl}
                  alt="Story illustration"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}

            {/* Task reference */}
            <p className="text-xs text-muted-foreground mb-2 truncate flex-shrink-0">
              <Sparkles className="w-3 h-3 inline mr-1 text-glow-gold" />
              From: {currentStory.taskText}
            </p>

            {/* Story content */}
            <div className="flex-1 overflow-y-auto bg-void/30 rounded-lg p-3 border border-border/30 min-h-0">
              <div className="space-y-2">
                {getVisibleLines(currentStory.story, currentStory.revealedLines).map((line, idx) => (
                  <p
                    key={idx}
                    className="text-sm text-foreground/90 leading-relaxed story-reveal"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {currentStory.revealedLines < currentStory.totalLines && (
                <div className="mt-4 pt-3 border-t border-border/30 text-center">
                  <p className="text-muted-foreground/60 text-xs">
                    {currentStory.totalLines - currentStory.revealedLines} more lines to unlock...
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            {tasksWithStories.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-3 flex-shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={currentStoryIndex === 0}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    currentStoryIndex === 0
                      ? "text-muted-foreground/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/20"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {tasksWithStories.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentStoryIndex(idx)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        idx === currentStoryIndex
                          ? "bg-glow-gold"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNext}
                  disabled={currentStoryIndex === tasksWithStories.length - 1}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    currentStoryIndex === tasksWithStories.length - 1
                      ? "text-muted-foreground/30"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/20"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <p className="text-lg font-display text-foreground/90 mb-2">
              You are not alone
            </p>
            <p className="text-sm text-muted-foreground max-w-[200px] mb-3">
              A gentle presence accompanies you on your journey
            </p>
            <p className="text-xs text-muted-foreground/60 max-w-[180px]">
              Complete tasks with stories to unlock magical tales here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
