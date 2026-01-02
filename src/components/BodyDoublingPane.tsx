import { useState, useEffect } from 'react';
import { Heart, Sparkles, Edit2, Trash2, BookOpen, ArrowLeft } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { cn } from '@/lib/utils';
import { LofiCompanion } from './LofiCompanion';
import { StoryEditor } from './StoryEditor';
import { Button } from '@/components/ui/button';

type ViewMode = 'animation' | 'story';

export function BodyDoublingPane() {
  const { state, dispatch } = useApp();
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('animation');

  const story = state.companionStory;
  const hasStory = story !== null;
  const hasUnreadContent = story && story.revealedLines > story.lastReadLine;
  const hasRevealedContent = story && story.revealedLines > 0;

  // Auto-switch to story view when new content is unlocked
  useEffect(() => {
    if (hasUnreadContent && viewMode === 'animation') {
      setViewMode('story');
    }
  }, [hasUnreadContent, story?.revealedLines]);

  const getVisibleLines = () => {
    if (!story) return [];
    return story.content.split('\n').filter(line => line.trim()).slice(0, story.revealedLines);
  };

  const handleSaveStory = (content: string, imageUrl?: string) => {
    dispatch({ type: 'SET_COMPANION_STORY', payload: { content, imageUrl } });
    setShowStoryEditor(false);
  };

  const handleClearStory = () => {
    dispatch({ type: 'CLEAR_COMPANION_STORY' });
    setViewMode('animation');
  };

  const handleMarkAsRead = () => {
    dispatch({ type: 'MARK_STORY_READ' });
    setViewMode('animation');
  };

  const visibleLines = getVisibleLines();
  const remainingLines = story ? story.totalLines - story.revealedLines : 0;
  const unreadLines = story ? story.revealedLines - story.lastReadLine : 0;

  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border starfield overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Heart className="w-5 h-5 text-accent" />
        </div>
        <h2 className="font-display text-xl text-foreground glow-text">Companion</h2>
        
        <div className="ml-auto flex items-center gap-1">
          {hasStory && viewMode === 'animation' && hasRevealedContent && (
            <button
              onClick={() => setViewMode('story')}
              className={cn(
                "p-1.5 rounded-md transition-all flex items-center gap-1",
                hasUnreadContent
                  ? "text-glow-gold bg-glow-gold/20 animate-pulse"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/20"
              )}
              title={hasUnreadContent ? `${unreadLines} new lines!` : "View story"}
            >
              <BookOpen className="w-4 h-4" />
              {hasUnreadContent && (
                <span className="text-xs font-medium">{unreadLines}</span>
              )}
            </button>
          )}
          {hasStory && (
            <>
              <button
                onClick={() => setShowStoryEditor(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all"
                title="Edit story"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearStory}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all"
                title="Remove story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {viewMode === 'animation' ? (
          // Animation View
          <div className="flex-1 flex flex-col items-center justify-center">
            <LofiCompanion isWorking={true} />
            
            {!hasStory ? (
              <div className="mt-6 text-center px-4">
                <p className="text-lg font-display text-foreground/90 mb-2">
                  You are not alone
                </p>
                <p className="text-sm text-muted-foreground max-w-[200px] mb-4">
                  A gentle presence accompanies you on your journey
                </p>
                <Button
                  onClick={() => setShowStoryEditor(true)}
                  variant="outline"
                  size="sm"
                  className="border-glow-gold/30 text-glow-gold hover:bg-glow-gold/10"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Add Your Story
                </Button>
                <p className="text-xs text-muted-foreground/60 mt-3 max-w-[180px]">
                  Write a tale that unlocks as you complete tasks
                </p>
              </div>
            ) : !hasRevealedContent ? (
              <div className="mt-6 text-center px-4">
                <Sparkles className="w-6 h-6 text-glow-gold/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Story awaits...
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Complete tasks to unlock {story.totalLines} lines
                </p>
              </div>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground/60">
                  {remainingLines > 0 
                    ? `${story.revealedLines} / ${story.totalLines} lines unlocked`
                    : '✨ Story complete!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          // Story View
          <div className="flex-1 flex flex-col min-h-0">
            {/* Back button */}
            <button
              onClick={handleMarkAsRead}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to companion
            </button>

            {/* Story image */}
            {story?.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-glow-gold/30 mb-3 flex-shrink-0">
                <img
                  src={story.imageUrl}
                  alt="Story illustration"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}

            {/* Story content */}
            <div className="flex-1 overflow-y-auto bg-void/30 rounded-lg p-3 border border-border/30 min-h-0">
              <div className="space-y-2">
                {visibleLines.map((line, idx) => (
                  <p
                    key={idx}
                    className={cn(
                      "text-sm leading-relaxed story-reveal",
                      idx >= (story?.lastReadLine || 0)
                        ? "text-foreground"
                        : "text-foreground/70"
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              {remainingLines > 0 && (
                <div className="mt-4 pt-3 border-t border-border/30 text-center">
                  <p className="text-muted-foreground/60 text-xs flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-glow-gold" />
                    {remainingLines} more {remainingLines === 1 ? 'line' : 'lines'} to unlock
                  </p>
                  <p className="text-muted-foreground/40 text-xs mt-1">
                    Complete tasks to reveal more
                  </p>
                </div>
              )}

              {remainingLines === 0 && (
                <div className="mt-4 pt-3 border-t border-glow-gold/30 text-center">
                  <p className="text-glow-gold text-sm font-display">
                    ✨ Story Complete ✨
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Story Editor Modal */}
      {showStoryEditor && (
        <StoryEditor
          initialContent={story?.content || ''}
          initialImageUrl={story?.imageUrl}
          onSave={handleSaveStory}
          onClose={() => setShowStoryEditor(false)}
        />
      )}
    </div>
  );
}
