import { cn } from '@/lib/utils';
import { CompanionMood } from '../LofiCompanion';

interface RobotCompanionProps {
  mood: CompanionMood;
}

export function RobotCompanion({ mood }: RobotCompanionProps) {
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
      {/* Platform/base */}
      <rect x="6" y="20" width="12" height="2" className="fill-muted" />
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <>
          <rect x="4" y="3" width="1" height="1" className="fill-glow-gold sparkle-1" />
          <rect x="19" y="4" width="1" height="1" className="fill-glow-gold sparkle-2" />
          <rect x="6" y="6" width="1" height="1" className="fill-accent sparkle-3" />
          <rect x="17" y="2" width="1" height="1" className="fill-accent sparkle-4" />
        </>
      )}
      
      {/* Robot body */}
      <rect x="8" y="12" width="8" height="8" className="fill-primary/80" />
      <rect x="7" y="13" width="1" height="6" className="fill-primary/60" />
      <rect x="16" y="13" width="1" height="6" className="fill-primary/60" />
      
      {/* Body screen/panel */}
      <rect x="10" y="14" width="4" height="3" className={cn(
        "animate-screen-glow",
        isCelebrating ? "fill-glow-gold/80" : "fill-accent/60"
      )} />
      
      {/* Body buttons */}
      <rect x="10" y="18" width="1" height="1" className="fill-green-500/80" />
      <rect x="13" y="18" width="1" height="1" className="fill-accent/80" />
      
      {/* Robot head */}
      <rect x="8" y="4" width="8" height="7" className="fill-primary" />
      <rect x="7" y="5" width="1" height="5" className="fill-primary/80" />
      <rect x="16" y="5" width="1" height="5" className="fill-primary/80" />
      
      {/* Antenna */}
      <rect x="11" y="1" width="2" height="3" className="fill-muted-foreground/60" />
      <rect x="10" y="1" width="4" height="1" className={cn(
        "fill-accent",
        (isCelebrating || isExcited) && "antenna-blink"
      )} />
      
      {/* Eyes */}
      {isSleepy ? (
        <>
          <rect x="9" y="7" width="2" height="1" className="fill-accent/40" />
          <rect x="13" y="7" width="2" height="1" className="fill-accent/40" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <rect x="9" y="6" width="2" height="2" className="fill-glow-gold" />
          <rect x="13" y="6" width="2" height="2" className="fill-glow-gold" />
        </>
      ) : (
        <>
          <rect x="9" y="6" width="2" height="2" className="fill-accent character-blink" />
          <rect x="13" y="6" width="2" height="2" className="fill-accent character-blink" />
        </>
      )}
      
      {/* Mouth */}
      <rect x="10" y="9" width="4" height="1" className={cn(
        "fill-muted-foreground/60",
        (isCelebrating || isExcited) && "fill-glow-gold/60"
      )} />
      
      {/* Arms */}
      {isCelebrating ? (
        <>
          <rect x="5" y="12" width="2" height="3" className="fill-primary/70 arm-wave-left" />
          <rect x="4" y="11" width="2" height="2" className="fill-primary/60 arm-wave-left" />
          <rect x="17" y="12" width="2" height="3" className="fill-primary/70 arm-wave-right" />
          <rect x="18" y="11" width="2" height="2" className="fill-primary/60 arm-wave-right" />
        </>
      ) : (
        <>
          <rect x="5" y="13" width="2" height="4" className={cn("fill-primary/70", isTyping && "robot-arm-left")} />
          <rect x="4" y="16" width="2" height="2" className={cn("fill-primary/60", isTyping && "robot-arm-left")} />
          <rect x="17" y="13" width="2" height="4" className={cn("fill-primary/70", isTyping && "robot-arm-right")} />
          <rect x="18" y="16" width="2" height="2" className={cn("fill-primary/60", isTyping && "robot-arm-right")} />
        </>
      )}
      
      {/* Feet */}
      <rect x="9" y="20" width="2" height="1" className="fill-primary/60" />
      <rect x="13" y="20" width="2" height="1" className="fill-primary/60" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <>
          <text x="17" y="5" className="fill-muted-foreground/50 text-[3px] font-bold zzz-1">z</text>
          <text x="19" y="3" className="fill-muted-foreground/40 text-[2px] font-bold zzz-2">z</text>
        </>
      )}

      <style>{`
        .antenna-blink {
          animation: antenna-blink 0.5s ease-in-out infinite;
        }
        
        @keyframes antenna-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .robot-arm-left {
          animation: robot-arm 0.6s ease-in-out infinite;
        }
        
        .robot-arm-right {
          animation: robot-arm 0.6s ease-in-out infinite 0.3s;
        }
        
        @keyframes robot-arm {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `}</style>
    </svg>
  );
}
