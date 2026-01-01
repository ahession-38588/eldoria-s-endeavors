import { X, Sparkles } from 'lucide-react';
import { StoryContent } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StoryRevealProps {
  story: StoryContent;
  revealedLines: number;
  onClose: () => void;
}

export function StoryReveal({ story, revealedLines, onClose }: StoryRevealProps) {
  const lines = story.content.split('\n').filter(line => line.trim());
  const visibleLines = lines.slice(0, revealedLines);
  const hiddenCount = lines.length - revealedLines;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-2xl starfield">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground glow-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-glow-gold" />
            Story Revealed
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Story image */}
          {story.imageUrl && (
            <div className="rounded-lg overflow-hidden border border-glow-gold/30 shadow-glow-gold">
              <img
                src={story.imageUrl}
                alt="Story illustration"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Revealed story content */}
          <div className="p-6 rounded-lg bg-void/50 border border-border/50">
            <div className="space-y-3">
              {visibleLines.map((line, index) => (
                <p
                  key={index}
                  className="text-foreground/90 leading-relaxed story-reveal"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {line}
                </p>
              ))}
            </div>

            {hiddenCount > 0 && (
              <div className="mt-6 pt-4 border-t border-border/30 text-center">
                <p className="text-muted-foreground text-sm">
                  <Sparkles className="w-4 h-4 inline mr-2 text-glow-gold" />
                  {hiddenCount} more {hiddenCount === 1 ? 'line' : 'lines'} to unlock...
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1">
                  Complete more tasks to reveal the rest of the story
                </p>
              </div>
            )}

            {hiddenCount === 0 && (
              <div className="mt-6 pt-4 border-t border-glow-gold/30 text-center">
                <p className="text-glow-gold text-sm font-display">
                  ✨ Story Complete ✨
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-primary/20 hover:bg-primary/30 text-primary">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
