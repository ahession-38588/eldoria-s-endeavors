import { useState, useRef } from 'react';
import { Image, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import JSZip from 'jszip';

interface StoryEditorProps {
  initialContent: string;
  initialImageUrl?: string;
  onSave: (content: string, imageUrl?: string) => void;
  onClose: () => void;
}

export function StoryEditor({ initialContent, initialImageUrl, onSave, onClose }: StoryEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [isParsingEpub, setIsParsingEpub] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), imageUrl.trim() || undefined);
    }
  };

  const parseEpub = async (file: File) => {
    setIsParsingEpub(true);
    try {
      const zip = await JSZip.loadAsync(file);
      
      // Find the content.opf to get reading order
      let opfPath = '';
      const containerXml = zip.file('META-INF/container.xml');
      if (containerXml) {
        const containerText = await containerXml.async('text');
        const match = containerText.match(/full-path="([^"]+\.opf)"/);
        if (match) opfPath = match[1];
      }

      // Get spine order from OPF
      const orderedFiles: string[] = [];
      if (opfPath) {
        const opfFile = zip.file(opfPath);
        if (opfFile) {
          const opfText = await opfFile.async('text');
          const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
          
          // Parse manifest items
          const manifest: Record<string, string> = {};
          const itemRegex = /<item\s[^>]*id="([^"]*)"[^>]*href="([^"]*)"[^>]*media-type="application\/xhtml\+xml"[^>]*\/?>/g;
          const itemRegex2 = /<item\s[^>]*href="([^"]*)"[^>]*id="([^"]*)"[^>]*media-type="application\/xhtml\+xml"[^>]*\/?>/g;
          let m;
          while ((m = itemRegex.exec(opfText)) !== null) manifest[m[1]] = opfDir + m[2];
          while ((m = itemRegex2.exec(opfText)) !== null) manifest[m[2]] = opfDir + m[1];
          
          // Parse spine order
          const spineRegex = /<itemref\s[^>]*idref="([^"]*)"/g;
          while ((m = spineRegex.exec(opfText)) !== null) {
            if (manifest[m[1]]) orderedFiles.push(manifest[m[1]]);
          }
        }
      }

      // Fallback: grab all xhtml/html files
      if (orderedFiles.length === 0) {
        zip.forEach((path) => {
          if (/\.(xhtml|html|htm)$/i.test(path) && !path.includes('nav') && !path.includes('toc')) {
            orderedFiles.push(path);
          }
        });
        orderedFiles.sort();
      }

      // Extract text from each file
      const textParts: string[] = [];
      for (const filePath of orderedFiles) {
        const f = zip.file(filePath);
        if (f) {
          const html = await f.async('text');
          // Strip HTML tags, decode entities, clean whitespace
          const div = document.createElement('div');
          div.innerHTML = html.replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, '');
          const text = div.textContent || '';
          const cleaned = text.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
          if (cleaned) textParts.push(cleaned);
        }
      }

      const fullText = textParts.join('\n\n');
      if (fullText.trim()) {
        setContent(fullText);
      } else {
        throw new Error('No text content found');
      }
    } catch (err) {
      console.error('EPUB parse error:', err);
      alert('Could not parse EPUB file. Please try pasting text instead.');
    } finally {
      setIsParsingEpub(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
              Paste text or import an EPUB file. Each line is revealed gradually as you complete tasks (3 lines per completion).
            </p>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsingEpub}
                className="border-border/50 text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isParsingEpub ? 'Parsing…' : 'Import EPUB'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".epub"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) parseEpub(file);
                }}
              />
            </div>
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
