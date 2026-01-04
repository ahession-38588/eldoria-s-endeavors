import { cn } from '@/lib/utils';
import { CompanionMood } from '../LofiCompanion';

interface SpiritCompanionProps {
  mood: CompanionMood;
}

export function SpiritCompanion({ mood }: SpiritCompanionProps) {
  const isCelebrating = mood === 'celebrating';
  const isExcited = mood === 'excited';
  const isSleepy = mood === 'sleepy';

  return (
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full pixel-art"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Celebration sparkles */}
      {isCelebrating && (
        <>
          <rect x="3" y="4" width="1" height="1" className="fill-glow-gold sparkle-1" />
          <rect x="20" y="5" width="1" height="1" className="fill-glow-gold sparkle-2" />
          <rect x="5" y="8" width="1" height="1" className="fill-starlight sparkle-3" />
          <rect x="18" y="3" width="1" height="1" className="fill-starlight sparkle-4" />
        </>
      )}
      
      {/* Spirit body - glowing wisp */}
      <rect x="9" y="3" width="6" height="1" className="fill-starlight/80" />
      <rect x="8" y="4" width="8" height="1" className="fill-starlight/90" />
      <rect x="7" y="5" width="10" height="1" className="fill-starlight" />
      <rect x="7" y="6" width="10" height="1" className="fill-primary" />
      <rect x="7" y="7" width="10" height="1" className="fill-primary" />
      <rect x="7" y="8" width="10" height="1" className="fill-primary/95" />
      <rect x="7" y="9" width="10" height="1" className="fill-primary/90" />
      <rect x="8" y="10" width="8" height="1" className="fill-primary/80" />
      <rect x="8" y="11" width="8" height="1" className="fill-primary/70" />
      <rect x="9" y="12" width="6" height="1" className="fill-primary/60" />
      <rect x="9" y="13" width="6" height="1" className="fill-primary/50" />
      <rect x="10" y="14" width="4" height="1" className="fill-primary/40" />
      <rect x="10" y="15" width="4" height="1" className="fill-primary/30" />
      <rect x="11" y="16" width="2" height="1" className="fill-primary/20" />
      <rect x="11" y="17" width="2" height="1" className="fill-primary/15" />
      <rect x="11" y="18" width="2" height="1" className="fill-primary/10" />
      
      {/* Eyes */}
      {isSleepy ? (
        <>
          <rect x="9" y="7" width="2" height="1" className="fill-accent/50" />
          <rect x="13" y="7" width="2" height="1" className="fill-accent/50" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <rect x="9" y="7" width="2" height="2" className="fill-glow-gold" />
          <rect x="9" y="7" width="1" height="1" className="fill-starlight" />
          <rect x="13" y="7" width="2" height="2" className="fill-glow-gold" />
          <rect x="13" y="7" width="1" height="1" className="fill-starlight" />
        </>
      ) : (
        <>
          <rect x="9" y="7" width="2" height="2" className="fill-accent character-blink" />
          <rect x="9" y="7" width="1" height="1" className="fill-starlight animate-pulse" />
          <rect x="13" y="7" width="2" height="2" className="fill-accent character-blink" />
          <rect x="13" y="7" width="1" height="1" className="fill-starlight animate-pulse" />
        </>
      )}
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <rect x="8" y="9" width="1" height="1" className="fill-glow-gold/50" />
          <rect x="15" y="9" width="1" height="1" className="fill-glow-gold/50" />
        </>
      )}
      
      {/* Floating orbs around spirit */}
      <rect x="4" y="8" width="2" height="2" className={cn("fill-accent/40", isCelebrating ? "orb-fast" : "orb-float-1")} />
      <rect x="18" y="6" width="2" height="2" className={cn("fill-primary/50", isCelebrating ? "orb-fast" : "orb-float-2")} />
      <rect x="5" y="14" width="1" height="1" className={cn("fill-glow-gold/40", isCelebrating ? "orb-fast" : "orb-float-3")} />
      <rect x="18" y="12" width="1" height="1" className={cn("fill-starlight/50", isCelebrating ? "orb-fast" : "orb-float-4")} />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <>
          <text x="16" y="5" className="fill-muted-foreground/50 text-[3px] font-bold zzz-1">z</text>
          <text x="18" y="3" className="fill-muted-foreground/40 text-[2px] font-bold zzz-2">z</text>
        </>
      )}

      <style>{`
        .orb-float-1 {
          animation: orb-float 4s ease-in-out infinite;
        }
        
        .orb-float-2 {
          animation: orb-float 5s ease-in-out infinite 1s;
        }
        
        .orb-float-3 {
          animation: orb-float 3.5s ease-in-out infinite 0.5s;
        }
        
        .orb-float-4 {
          animation: orb-float 4.5s ease-in-out infinite 1.5s;
        }
        
        .orb-fast {
          animation: orb-fast 1s ease-in-out infinite;
        }
        
        @keyframes orb-float {
          0%, 100% { 
            opacity: 0.3;
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: translateY(-4px) scale(1.2);
          }
        }
        
        @keyframes orb-fast {
          0%, 100% { 
            opacity: 0.5;
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-6px) scale(1.4);
          }
        }
      `}</style>
    </svg>
  );
}
