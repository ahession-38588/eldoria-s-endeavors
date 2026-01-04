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
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: 'url(#watercolor-spirit)' }}
    >
      <defs>
        <filter id="watercolor-spirit" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        
        <radialGradient id="spiritGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(180, 60%, 95%)" />
          <stop offset="50%" stopColor="hsl(200, 50%, 85%)" />
          <stop offset="100%" stopColor="hsl(220, 40%, 75%)" />
        </radialGradient>
        
        <radialGradient id="spiritInner" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="hsl(180, 70%, 98%)" />
          <stop offset="100%" stopColor="hsl(200, 50%, 90%)" />
        </radialGradient>
        
        <linearGradient id="spiritFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 50%, 85%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(200, 40%, 80%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <g className="sparkles">
          <circle cx="15" cy="25" r="3" fill="hsl(45, 90%, 70%)" className="sparkle-1" opacity="0.8" />
          <circle cx="85" cy="20" r="2.5" fill="hsl(340, 60%, 80%)" className="sparkle-2" opacity="0.8" />
          <circle cx="20" cy="55" r="2" fill="hsl(180, 60%, 75%)" className="sparkle-3" opacity="0.7" />
          <circle cx="82" cy="50" r="2" fill="hsl(145, 50%, 70%)" className="sparkle-4" opacity="0.7" />
        </g>
      )}
      
      {/* Floating orbs around spirit */}
      <circle cx="18" cy="40" r="5" fill="hsl(180, 50%, 80%)" opacity="0.5" className={cn(isCelebrating ? "orb-fast" : "orb-float-1")} />
      <circle cx="82" cy="35" r="4" fill="hsl(220, 45%, 80%)" opacity="0.5" className={cn(isCelebrating ? "orb-fast" : "orb-float-2")} />
      <circle cx="25" cy="70" r="3" fill="hsl(45, 60%, 80%)" opacity="0.4" className={cn(isCelebrating ? "orb-fast" : "orb-float-3")} />
      <circle cx="78" cy="65" r="3.5" fill="hsl(340, 45%, 85%)" opacity="0.4" className={cn(isCelebrating ? "orb-fast" : "orb-float-4")} />
      
      {/* Spirit body - ethereal blob shape */}
      <path 
        d="M 50 15 
           Q 75 20 78 45 
           Q 80 60 70 75 
           Q 60 85 50 88 
           Q 40 85 30 75 
           Q 20 60 22 45 
           Q 25 20 50 15" 
        fill="url(#spiritGlow)" 
      />
      
      {/* Inner glow */}
      <ellipse cx="50" cy="40" rx="20" ry="22" fill="url(#spiritInner)" opacity="0.7" />
      
      {/* Wispy tail */}
      <path 
        d="M 50 75 Q 48 82 45 88 Q 43 92 40 94" 
        stroke="url(#spiritFade)" 
        strokeWidth="8" 
        fill="none" 
        strokeLinecap="round"
        opacity="0.6"
      />
      <path 
        d="M 50 75 Q 52 82 55 88 Q 57 92 60 94" 
        stroke="url(#spiritFade)" 
        strokeWidth="6" 
        fill="none" 
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Little arms */}
      {isCelebrating ? (
        <>
          <ellipse cx="25" cy="45" rx="8" ry="5" fill="hsl(200, 50%, 88%)" opacity="0.8" className="arm-wave-left" />
          <ellipse cx="75" cy="45" rx="8" ry="5" fill="hsl(200, 50%, 88%)" opacity="0.8" className="arm-wave-right" />
        </>
      ) : (
        <>
          <ellipse cx="28" cy="50" rx="6" ry="4" fill="hsl(200, 50%, 88%)" opacity="0.7" />
          <ellipse cx="72" cy="50" rx="6" ry="4" fill="hsl(200, 50%, 88%)" opacity="0.7" />
        </>
      )}
      
      {/* Face */}
      {/* Eyes */}
      {isSleepy ? (
        <>
          <path d="M 40 40 Q 44 42 48 40" stroke="hsl(220, 40%, 45%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 52 40 Q 56 42 60 40" stroke="hsl(220, 40%, 45%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <ellipse cx="42" cy="38" rx="6" ry="7" fill="hsl(220, 50%, 30%)" />
          <circle cx="44" cy="36" r="2.5" fill="white" opacity="0.9" />
          <circle cx="40" cy="40" r="1.5" fill="hsl(180, 60%, 80%)" opacity="0.6" />
          <ellipse cx="58" cy="38" rx="6" ry="7" fill="hsl(220, 50%, 30%)" />
          <circle cx="60" cy="36" r="2.5" fill="white" opacity="0.9" />
          <circle cx="56" cy="40" r="1.5" fill="hsl(180, 60%, 80%)" opacity="0.6" />
        </>
      ) : (
        <>
          <ellipse cx="42" cy="38" rx="5" ry="6" fill="hsl(220, 50%, 30%)" className="character-blink" />
          <circle cx="43" cy="36" r="2" fill="white" opacity="0.8" />
          <ellipse cx="58" cy="38" rx="5" ry="6" fill="hsl(220, 50%, 30%)" className="character-blink" />
          <circle cx="59" cy="36" r="2" fill="white" opacity="0.8" />
        </>
      )}
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <ellipse cx="34" cy="48" rx="5" ry="3" fill="hsl(350, 70%, 85%)" opacity="0.5" />
          <ellipse cx="66" cy="48" rx="5" ry="3" fill="hsl(350, 70%, 85%)" opacity="0.5" />
        </>
      )}
      
      {/* Mouth */}
      {isCelebrating || isExcited ? (
        <ellipse cx="50" cy="55" rx="5" ry="4" fill="hsl(350, 50%, 65%)" opacity="0.7" />
      ) : (
        <ellipse cx="50" cy="54" rx="3" ry="2" fill="hsl(350, 40%, 60%)" opacity="0.5" />
      )}
      
      {/* Rosy cheek marks */}
      <path d="M 32 45 L 28 47" stroke="hsl(350, 60%, 80%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <path d="M 68 45 L 72 47" stroke="hsl(350, 60%, 80%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <g className="zzz" fill="hsl(220, 40%, 60%)" opacity="0.6">
          <text x="65" y="25" fontSize="8" fontFamily="Fredoka" className="zzz-1">z</text>
          <text x="72" y="18" fontSize="6" fontFamily="Fredoka" className="zzz-2">z</text>
          <text x="77" y="13" fontSize="5" fontFamily="Fredoka" className="zzz-3">z</text>
        </g>
      )}

      <style>{`
        .orb-float-1 {
          animation: orb-float 5s ease-in-out infinite;
        }
        
        .orb-float-2 {
          animation: orb-float 6s ease-in-out infinite 1s;
        }
        
        .orb-float-3 {
          animation: orb-float 4.5s ease-in-out infinite 0.5s;
        }
        
        .orb-float-4 {
          animation: orb-float 5.5s ease-in-out infinite 1.5s;
        }
        
        .orb-fast {
          animation: orb-fast 1.2s ease-in-out infinite;
        }
        
        @keyframes orb-float {
          0%, 100% { 
            opacity: 0.3;
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: translateY(-8px) scale(1.15);
          }
        }
        
        @keyframes orb-fast {
          0%, 100% { 
            opacity: 0.5;
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 1;
            transform: translateY(-10px) scale(1.3);
          }
        }
      `}</style>
    </svg>
  );
}
