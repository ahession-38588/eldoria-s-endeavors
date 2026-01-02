import { cn } from '@/lib/utils';

export type CompanionMood = 'idle' | 'working' | 'excited' | 'celebrating' | 'sleepy';

interface LofiCompanionProps {
  mood?: CompanionMood;
  progress?: number; // 0-100
}

export function LofiCompanion({ mood = 'working', progress = 0 }: LofiCompanionProps) {
  const isTyping = mood === 'working';
  const isCelebrating = mood === 'celebrating';
  const isExcited = mood === 'excited';
  const isSleepy = mood === 'sleepy';

  // Dynamic glow based on progress
  const glowIntensity = Math.min(0.3 + (progress / 100) * 0.4, 0.7);

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[180px]">
      {/* Lofi character - pixel art style */}
      <div className={cn(
        "lofi-scene",
        isCelebrating && "celebrating",
        isExcited && "excited",
        isSleepy && "sleepy"
      )}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 24 24"
          className="pixel-art"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Desk */}
          <rect x="2" y="18" width="20" height="2" className="fill-muted" />
          <rect x="3" y="20" width="2" height="3" className="fill-muted-foreground/50" />
          <rect x="19" y="20" width="2" height="3" className="fill-muted-foreground/50" />
          
          {/* Laptop base */}
          <rect x="7" y="16" width="10" height="2" className="fill-primary/80" />
          
          {/* Laptop screen - different colors based on mood */}
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
              <rect x="3" y="8" width="1" height="1" className="fill-accent sparkle-5" />
              <rect x="20" y="7" width="1" height="1" className="fill-accent sparkle-6" />
            </>
          )}
          
          {/* Character body */}
          <rect x="11" y="10" width="3" height="6" className="fill-secondary" />
          
          {/* Character head */}
          <rect 
            x="10" y="5" width="5" height="5" 
            className={cn(
              "fill-[hsl(var(--starlight))]",
              isCelebrating && "head-bounce"
            )} 
          />
          
          {/* Hair */}
          <rect x="9" y="4" width="7" height="2" className="fill-primary" />
          <rect x="9" y="5" width="1" height="4" className="fill-primary" />
          <rect x="15" y="5" width="1" height="3" className="fill-primary" />
          
          {/* Eyes - different states */}
          {isSleepy ? (
            // Sleepy eyes (closed lines)
            <>
              <rect x="11" y="7" width="1" height="1" className="fill-accent/60" />
              <rect x="13" y="7" width="1" height="1" className="fill-accent/60" />
            </>
          ) : isCelebrating || isExcited ? (
            // Happy eyes (^ ^)
            <>
              <rect x="11" y="7" width="1" height="1" className="fill-accent" />
              <rect x="11" y="6" width="1" height="1" className="fill-accent/50" />
              <rect x="13" y="7" width="1" height="1" className="fill-accent" />
              <rect x="13" y="6" width="1" height="1" className="fill-accent/50" />
            </>
          ) : (
            // Normal blinking eyes
            <>
              <rect x="11" y="7" width="1" height="1" className="fill-accent character-blink" />
              <rect x="13" y="7" width="1" height="1" className="fill-accent character-blink" />
            </>
          )}
          
          {/* Blush when celebrating */}
          {(isCelebrating || isExcited) && (
            <>
              <rect x="10" y="8" width="1" height="1" className="fill-glow-gold/40" />
              <rect x="14" y="8" width="1" height="1" className="fill-glow-gold/40" />
            </>
          )}
          
          {/* Arms on desk - typing animation or raised for celebration */}
          {isCelebrating ? (
            // Arms raised in celebration
            <>
              <rect x="8" y="10" width="2" height="2" className="fill-[hsl(var(--starlight))] arm-wave-left" />
              <rect x="15" y="10" width="2" height="2" className="fill-[hsl(var(--starlight))] arm-wave-right" />
            </>
          ) : (
            // Normal typing arms
            <>
              <rect x="9" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isTyping && "animate-typing-left")} />
              <rect x="14" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isTyping && "animate-typing-right")} />
            </>
          )}
          
          {/* Drink/mug */}
          <rect x="18" y="15" width="2" height="3" className="fill-glow-gold/70" />
          <rect x="20" y="16" width="1" height="1" className="fill-glow-gold/50" />
          
          {/* Steam from drink - more active when working */}
          <rect x="18" y="13" width="1" height="1" className={cn("fill-muted-foreground/30", isTyping ? "animate-steam-1" : "opacity-20")} />
          <rect x="19" y="12" width="1" height="1" className={cn("fill-muted-foreground/20", isTyping ? "animate-steam-2" : "opacity-10")} />
          
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
              <text x="19" y="2" className="fill-muted-foreground/30 text-[2px] font-bold zzz-3">z</text>
            </>
          )}
        </svg>
        
        {/* Ambient particles - more when celebrating */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={cn("ambient-particle particle-a", isCelebrating && "celebrating-particle")} />
          <div className={cn("ambient-particle particle-b", isCelebrating && "celebrating-particle")} />
          <div className={cn("ambient-particle particle-c", isCelebrating && "celebrating-particle")} />
          {isCelebrating && (
            <>
              <div className="ambient-particle particle-d celebrating-particle" />
              <div className="ambient-particle particle-e celebrating-particle" />
            </>
          )}
        </div>
      </div>
      
      {/* Dynamic glow behind character */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-2xl -z-10 transition-all duration-1000",
          isCelebrating ? "bg-glow-gold/30" : "bg-primary/20"
        )}
        style={{ opacity: glowIntensity }}
      />

      <style>{`
        .lofi-scene {
          position: relative;
          animation: gentle-bob 4s ease-in-out infinite;
        }
        
        .lofi-scene.celebrating {
          animation: celebrate-bounce 0.5s ease-in-out infinite;
        }
        
        .lofi-scene.excited {
          animation: excited-bob 2s ease-in-out infinite;
        }
        
        .lofi-scene.sleepy {
          animation: sleepy-sway 6s ease-in-out infinite;
        }
        
        .pixel-art {
          filter: drop-shadow(0 0 16px hsl(var(--primary) / 0.4));
        }
        
        @keyframes gentle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes celebrate-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        
        @keyframes excited-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-3px) rotate(-2deg); }
          75% { transform: translateY(-3px) rotate(2deg); }
        }
        
        @keyframes sleepy-sway {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(2px) rotate(-1deg); }
          75% { transform: translateY(2px) rotate(1deg); }
        }
        
        @keyframes typing-left {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-1px); }
          50% { transform: translateY(0); }
        }
        
        @keyframes typing-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
          75% { transform: translateY(0); }
        }
        
        .animate-typing-left {
          animation: typing-left 0.4s ease-in-out infinite;
        }
        
        .animate-typing-right {
          animation: typing-right 0.4s ease-in-out infinite 0.1s;
        }
        
        @keyframes arm-wave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(-10deg); }
        }
        
        .arm-wave-left {
          animation: arm-wave 0.4s ease-in-out infinite;
          transform-origin: bottom right;
        }
        
        .arm-wave-right {
          animation: arm-wave 0.4s ease-in-out infinite 0.2s;
          transform-origin: bottom left;
        }
        
        .head-bounce {
          animation: head-bounce 0.5s ease-in-out infinite;
        }
        
        @keyframes head-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        
        .character-blink {
          animation: blink 4s ease-in-out infinite;
        }
        
        @keyframes steam {
          0%, 100% { opacity: 0.3; transform: translateY(0) scale(1); }
          50% { opacity: 0.6; transform: translateY(-3px) scale(1.2); }
        }
        
        .animate-steam-1 {
          animation: steam 2.5s ease-in-out infinite;
        }
        
        .animate-steam-2 {
          animation: steam 2.5s ease-in-out infinite 0.5s;
        }
        
        @keyframes screen-glow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.95; }
        }
        
        .animate-screen-glow {
          animation: screen-glow 3s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        .sparkle-1 { animation: sparkle 1s ease-in-out infinite; }
        .sparkle-2 { animation: sparkle 1s ease-in-out infinite 0.15s; }
        .sparkle-3 { animation: sparkle 1s ease-in-out infinite 0.3s; }
        .sparkle-4 { animation: sparkle 1s ease-in-out infinite 0.45s; }
        .sparkle-5 { animation: sparkle 1s ease-in-out infinite 0.6s; }
        .sparkle-6 { animation: sparkle 1s ease-in-out infinite 0.75s; }
        
        @keyframes zzz {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-2px); }
        }
        
        .zzz-1 { animation: zzz 2s ease-in-out infinite; }
        .zzz-2 { animation: zzz 2s ease-in-out infinite 0.3s; }
        .zzz-3 { animation: zzz 2s ease-in-out infinite 0.6s; }
        
        .ambient-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: hsl(var(--starlight) / 0.5);
        }
        
        .celebrating-particle {
          background: hsl(var(--glow-gold) / 0.7);
          width: 5px;
          height: 5px;
        }
        
        .particle-a {
          top: 15%;
          left: 10%;
          animation: float-particle 6s ease-in-out infinite;
        }
        
        .particle-b {
          top: 35%;
          right: 5%;
          animation: float-particle 5s ease-in-out infinite 1s;
        }
        
        .particle-c {
          bottom: 25%;
          left: 20%;
          animation: float-particle 7s ease-in-out infinite 2s;
        }
        
        .particle-d {
          top: 10%;
          right: 20%;
          animation: float-particle 4s ease-in-out infinite 0.5s;
        }
        
        .particle-e {
          bottom: 40%;
          right: 15%;
          animation: float-particle 5.5s ease-in-out infinite 1.5s;
        }
        
        @keyframes float-particle {
          0%, 100% { opacity: 0.2; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.8; transform: translateY(-12px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
