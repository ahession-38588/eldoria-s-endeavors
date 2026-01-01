import { cn } from '@/lib/utils';

interface PixelCompanionProps {
  hasStory?: boolean;
}

export function PixelCompanion({ hasStory }: PixelCompanionProps) {
  return (
    <div className="relative">
      {/* Pixel art spirit/wisp companion */}
      <div className="pixel-companion">
        <svg
          width="64"
          height="64"
          viewBox="0 0 16 16"
          className="pixel-art"
          style={{ imageRendering: 'pixelated' }}
        >
          {/* Body - glowing spirit */}
          <rect x="6" y="2" width="4" height="1" className="fill-starlight/80" />
          <rect x="5" y="3" width="6" height="1" className="fill-starlight/90" />
          <rect x="4" y="4" width="8" height="1" className="fill-starlight" />
          <rect x="4" y="5" width="8" height="1" className="fill-primary" />
          <rect x="4" y="6" width="8" height="1" className="fill-primary" />
          <rect x="4" y="7" width="8" height="1" className="fill-primary/90" />
          <rect x="5" y="8" width="6" height="1" className="fill-primary/80" />
          <rect x="5" y="9" width="6" height="1" className="fill-primary/70" />
          <rect x="6" y="10" width="4" height="1" className="fill-primary/60" />
          <rect x="6" y="11" width="4" height="1" className="fill-primary/40" />
          <rect x="7" y="12" width="2" height="1" className="fill-primary/30" />
          <rect x="7" y="13" width="2" height="1" className="fill-primary/20" />
          
          {/* Eyes */}
          <rect x="6" y="5" width="1" height="2" className="fill-accent" />
          <rect x="9" y="5" width="1" height="2" className="fill-accent" />
          
          {/* Eye sparkle */}
          <rect x="6" y="5" width="1" height="1" className="fill-starlight animate-pulse" />
          <rect x="9" y="5" width="1" height="1" className="fill-starlight animate-pulse" />
          
          {/* Blush when has story */}
          {hasStory && (
            <>
              <rect x="5" y="7" width="1" height="1" className="fill-glow-gold/50" />
              <rect x="10" y="7" width="1" height="1" className="fill-glow-gold/50" />
            </>
          )}
        </svg>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="pixel-particle particle-1" />
          <div className="pixel-particle particle-2" />
          <div className="pixel-particle particle-3" />
        </div>
      </div>
      
      {/* Glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full blur-xl -z-10 transition-all duration-1000",
          hasStory 
            ? "bg-glow-gold/30 animate-pulse" 
            : "bg-primary/20"
        )} 
      />

      <style>{`
        .pixel-companion {
          position: relative;
          animation: float-companion 3s ease-in-out infinite;
        }
        
        .pixel-art {
          filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.5));
        }
        
        @keyframes float-companion {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
          }
          50% { 
            transform: translateY(-6px) scale(1.02); 
          }
        }
        
        .pixel-particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: hsl(var(--starlight));
          image-rendering: pixelated;
        }
        
        .particle-1 {
          top: 10%;
          left: 20%;
          animation: particle-float 2.5s ease-in-out infinite;
        }
        
        .particle-2 {
          top: 30%;
          right: 15%;
          animation: particle-float 3s ease-in-out infinite 0.5s;
        }
        
        .particle-3 {
          bottom: 25%;
          left: 10%;
          animation: particle-float 2.8s ease-in-out infinite 1s;
        }
        
        @keyframes particle-float {
          0%, 100% { 
            opacity: 0.3;
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-8px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
}
