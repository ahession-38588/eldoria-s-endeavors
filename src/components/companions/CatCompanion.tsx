import { cn } from '@/lib/utils';
import { CompanionMood } from '../LofiCompanion';

interface CatCompanionProps {
  mood: CompanionMood;
}

export function CatCompanion({ mood }: CatCompanionProps) {
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
      {/* Cushion/bed */}
      <rect x="4" y="16" width="16" height="4" className="fill-secondary" />
      <rect x="5" y="15" width="14" height="1" className="fill-secondary/80" />
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <>
          <rect x="3" y="5" width="1" height="1" className="fill-glow-gold sparkle-1" />
          <rect x="20" y="4" width="1" height="1" className="fill-glow-gold sparkle-2" />
          <rect x="6" y="3" width="1" height="1" className="fill-starlight sparkle-3" />
          <rect x="17" y="6" width="1" height="1" className="fill-starlight sparkle-4" />
        </>
      )}
      
      {/* Cat body */}
      <rect x="7" y="12" width="10" height="4" className="fill-glow-gold/80" />
      <rect x="6" y="13" width="1" height="2" className="fill-glow-gold/70" />
      <rect x="17" y="13" width="1" height="2" className="fill-glow-gold/70" />
      
      {/* Cat head */}
      <rect x="9" y="7" width="6" height="5" className="fill-glow-gold/90" />
      <rect x="8" y="8" width="1" height="3" className="fill-glow-gold/80" />
      <rect x="15" y="8" width="1" height="3" className="fill-glow-gold/80" />
      
      {/* Ears */}
      <rect x="9" y="5" width="2" height="2" className="fill-glow-gold/90" />
      <rect x="9" y="6" width="1" height="1" className="fill-accent/30" />
      <rect x="13" y="5" width="2" height="2" className="fill-glow-gold/90" />
      <rect x="14" y="6" width="1" height="1" className="fill-accent/30" />
      
      {/* Eyes */}
      {isSleepy ? (
        <>
          <rect x="10" y="9" width="2" height="1" className="fill-primary/60" />
          <rect x="13" y="9" width="2" height="1" className="fill-primary/60" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <rect x="10" y="9" width="1" height="1" className="fill-primary" />
          <rect x="11" y="8" width="1" height="1" className="fill-primary/50" />
          <rect x="13" y="9" width="1" height="1" className="fill-primary" />
          <rect x="13" y="8" width="1" height="1" className="fill-primary/50" />
        </>
      ) : (
        <>
          <rect x="10" y="8" width="1" height="2" className="fill-primary character-blink" />
          <rect x="13" y="8" width="1" height="2" className="fill-primary character-blink" />
        </>
      )}
      
      {/* Nose */}
      <rect x="12" y="10" width="1" height="1" className="fill-accent/70" />
      
      {/* Whiskers */}
      <rect x="7" y="10" width="2" height="1" className="fill-muted-foreground/40" />
      <rect x="15" y="10" width="2" height="1" className="fill-muted-foreground/40" />
      
      {/* Tail */}
      <rect 
        x="17" y="11" width="3" height="2" 
        className={cn("fill-glow-gold/80", (isCelebrating || isExcited) && "tail-wag")} 
      />
      <rect 
        x="19" y="9" width="2" height="2" 
        className={cn("fill-glow-gold/70", (isCelebrating || isExcited) && "tail-wag")} 
      />
      
      {/* Paws */}
      <rect x="8" y="15" width="2" height="1" className={cn("fill-[hsl(var(--starlight))]", isTyping && "paw-knead-left")} />
      <rect x="14" y="15" width="2" height="1" className={cn("fill-[hsl(var(--starlight))]", isTyping && "paw-knead-right")} />
      
      {/* Ball of yarn */}
      <rect x="3" y="17" width="2" height="2" className="fill-accent/60" />
      <rect x="2" y="18" width="1" height="1" className="fill-accent/40" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <>
          <text x="17" y="6" className="fill-muted-foreground/50 text-[3px] font-bold zzz-1">z</text>
          <text x="19" y="4" className="fill-muted-foreground/40 text-[2px] font-bold zzz-2">z</text>
        </>
      )}

      <style>{`
        .tail-wag {
          animation: tail-wag 0.3s ease-in-out infinite;
          transform-origin: left center;
        }
        
        @keyframes tail-wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        
        .paw-knead-left {
          animation: paw-knead 0.8s ease-in-out infinite;
        }
        
        .paw-knead-right {
          animation: paw-knead 0.8s ease-in-out infinite 0.4s;
        }
        
        @keyframes paw-knead {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
      `}</style>
    </svg>
  );
}
