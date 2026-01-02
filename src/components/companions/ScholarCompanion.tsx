import { cn } from '@/lib/utils';
import { CompanionMood } from '../LofiCompanion';

interface ScholarCompanionProps {
  mood: CompanionMood;
}

export function ScholarCompanion({ mood }: ScholarCompanionProps) {
  const isTyping = mood === 'working';
  const isCelebrating = mood === 'celebrating';
  const isExcited = mood === 'excited';
  const isSleepy = mood === 'sleepy';

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full pixel-art"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Desk */}
      <rect x="2" y="18" width="20" height="2" className="fill-muted" />
      <rect x="3" y="20" width="2" height="3" className="fill-muted-foreground/50" />
      <rect x="19" y="20" width="2" height="3" className="fill-muted-foreground/50" />
      
      {/* Laptop base */}
      <rect x="7" y="16" width="10" height="2" className="fill-primary/80" />
      
      {/* Laptop screen */}
      <rect x="8" y="12" width="8" height="4" className="fill-primary" />
      <rect 
        x="9" y="13" width="6" height="2" 
        className={cn(
          "animate-screen-glow",
          isCelebrating ? "fill-glow-gold/80" : 
          isExcited ? "fill-accent/80" : 
          "fill-accent/60"
        )} 
      />
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <>
          <rect x="5" y="3" width="1" height="1" className="fill-glow-gold sparkle-1" />
          <rect x="18" y="4" width="1" height="1" className="fill-glow-gold sparkle-2" />
          <rect x="7" y="6" width="1" height="1" className="fill-starlight sparkle-3" />
          <rect x="16" y="2" width="1" height="1" className="fill-starlight sparkle-4" />
        </>
      )}
      
      {/* Character body */}
      <rect x="11" y="10" width="3" height="6" className="fill-secondary" />
      
      {/* Character head */}
      <rect x="10" y="5" width="5" height="5" className="fill-[hsl(var(--starlight))]" />
      
      {/* Hair */}
      <rect x="9" y="4" width="7" height="2" className="fill-primary" />
      <rect x="9" y="5" width="1" height="4" className="fill-primary" />
      <rect x="15" y="5" width="1" height="3" className="fill-primary" />
      
      {/* Eyes */}
      {isSleepy ? (
        <>
          <rect x="11" y="7" width="1" height="1" className="fill-accent/60" />
          <rect x="13" y="7" width="1" height="1" className="fill-accent/60" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <rect x="11" y="7" width="1" height="1" className="fill-accent" />
          <rect x="11" y="6" width="1" height="1" className="fill-accent/50" />
          <rect x="13" y="7" width="1" height="1" className="fill-accent" />
          <rect x="13" y="6" width="1" height="1" className="fill-accent/50" />
        </>
      ) : (
        <>
          <rect x="11" y="7" width="1" height="1" className="fill-accent character-blink" />
          <rect x="13" y="7" width="1" height="1" className="fill-accent character-blink" />
        </>
      )}
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <rect x="10" y="8" width="1" height="1" className="fill-glow-gold/40" />
          <rect x="14" y="8" width="1" height="1" className="fill-glow-gold/40" />
        </>
      )}
      
      {/* Arms */}
      {isCelebrating ? (
        <>
          <rect x="8" y="10" width="2" height="2" className="fill-[hsl(var(--starlight))] arm-wave-left" />
          <rect x="15" y="10" width="2" height="2" className="fill-[hsl(var(--starlight))] arm-wave-right" />
        </>
      ) : (
        <>
          <rect x="9" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isTyping && "animate-typing-left")} />
          <rect x="14" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isTyping && "animate-typing-right")} />
        </>
      )}
      
      {/* Drink/mug */}
      <rect x="18" y="15" width="2" height="3" className="fill-glow-gold/70" />
      <rect x="20" y="16" width="1" height="1" className="fill-glow-gold/50" />
      <rect x="18" y="13" width="1" height="1" className={cn("fill-muted-foreground/30", isTyping && "animate-steam-1")} />
      <rect x="19" y="12" width="1" height="1" className={cn("fill-muted-foreground/20", isTyping && "animate-steam-2")} />
      
      {/* Plant */}
      <rect x="3" y="15" width="2" height="3" className="fill-glow-gold/40" />
      <rect x="3" y="13" width="2" height="2" className="fill-green-600/80" />
      <rect x="2" y="12" width="1" height="2" className="fill-green-600/60" />
      <rect x="5" y="12" width="1" height="2" className="fill-green-600/60" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <>
          <text x="16" y="5" className="fill-muted-foreground/50 text-[3px] font-bold zzz-1">z</text>
          <text x="18" y="4" className="fill-muted-foreground/40 text-[2px] font-bold zzz-2">z</text>
        </>
      )}
    </svg>
  );
}
