import { useState } from 'react';
import { X, Image, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StoryEditorProps {
  initialContent: string;
  initialImageUrl?: string;
  onSave: (content: string, imageUrl?: string) => void;
  onClose: () => void;
}

export function StoryEditor({ initialContent, initialImageUrl, onSave, onClose }: StoryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), imageUrl.trim() || undefined);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground glow-text flex items-center gap-2">
            <span className="text-2xl">📜</span>
            Story Editor
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Story Content
            </label>
            <p className="text-xs text-muted-foreground/60 mb-2">
              Write your story here. Each line will be revealed gradually as you complete tasks (3 lines per completion).
            </p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Once upon a time, in a realm where tasks held magical power..."
              className="min-h-[200px] bg-input/50 border-border/50 focus:border-primary/50 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image URL (optional)
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-input/50 border-border/50 focus:border-primary/50"
            />
          </div>

          {imageUrl && (
            <div className="rounded-lg overflow-hidden border border-border/50">
              <img
                src={imageUrl}
                alt="Story preview"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim()}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Story
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
