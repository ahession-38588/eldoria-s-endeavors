import { cn } from '@/lib/utils';

interface LofiCompanionProps {
  isWorking?: boolean;
}

export function LofiCompanion({ isWorking = true }: LofiCompanionProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Lofi character - pixel art style */}
      <div className="lofi-scene">
        <svg
          width="96"
          height="96"
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
          
          {/* Laptop screen */}
          <rect x="8" y="12" width="8" height="4" className="fill-primary" />
          <rect x="9" y="13" width="6" height="2" className="fill-accent/60 animate-screen-glow" />
          
          {/* Character body */}
          <rect x="11" y="10" width="3" height="6" className="fill-secondary" />
          
          {/* Character head */}
          <rect x="10" y="5" width="5" height="5" className="fill-[hsl(var(--starlight))]" />
          
          {/* Hair */}
          <rect x="9" y="4" width="7" height="2" className="fill-primary" />
          <rect x="9" y="5" width="1" height="4" className="fill-primary" />
          <rect x="15" y="5" width="1" height="3" className="fill-primary" />
          
          {/* Eyes - blink animation */}
          <rect x="11" y="7" width="1" height="1" className="fill-accent character-blink" />
          <rect x="13" y="7" width="1" height="1" className="fill-accent character-blink" />
          
          {/* Arms on desk - typing animation */}
          <rect x="9" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isWorking && "animate-typing-left")} />
          <rect x="14" y="14" width="2" height="2" className={cn("fill-[hsl(var(--starlight))]", isWorking && "animate-typing-right")} />
          
          {/* Drink/mug */}
          <rect x="18" y="15" width="2" height="3" className="fill-glow-gold/70" />
          <rect x="20" y="16" width="1" height="1" className="fill-glow-gold/50" />
          
          {/* Steam from drink */}
          <rect x="18" y="13" width="1" height="1" className="fill-muted-foreground/30 animate-steam-1" />
          <rect x="19" y="12" width="1" height="1" className="fill-muted-foreground/20 animate-steam-2" />
          
          {/* Plant */}
          <rect x="3" y="15" width="2" height="3" className="fill-glow-gold/40" />
          <rect x="3" y="13" width="2" height="2" className="fill-green-600/80" />
          <rect x="2" y="12" width="1" height="2" className="fill-green-600/60" />
          <rect x="5" y="12" width="1" height="2" className="fill-green-600/60" />
        </svg>
        
        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="ambient-particle particle-a" />
          <div className="ambient-particle particle-b" />
          <div className="ambient-particle particle-c" />
        </div>
      </div>
      
      {/* Subtle glow behind character */}
      <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl -z-10" />

      <style>{`
        .lofi-scene {
          position: relative;
          animation: gentle-bob 4s ease-in-out infinite;
        }
        
        .pixel-art {
          filter: drop-shadow(0 0 12px hsl(var(--primary) / 0.3));
        }
        
        @keyframes gentle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
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
          50% { opacity: 0.9; }
        }
        
        .animate-screen-glow {
          animation: screen-glow 3s ease-in-out infinite;
        }
        
        .ambient-particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: hsl(var(--starlight) / 0.5);
        }
        
        .particle-a {
          top: 20%;
          left: 15%;
          animation: float-particle 6s ease-in-out infinite;
        }
        
        .particle-b {
          top: 40%;
          right: 10%;
          animation: float-particle 5s ease-in-out infinite 1s;
        }
        
        .particle-c {
          bottom: 30%;
          left: 25%;
          animation: float-particle 7s ease-in-out infinite 2s;
        }
        
        @keyframes float-particle {
          0%, 100% { opacity: 0.2; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.7; transform: translateY(-10px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
