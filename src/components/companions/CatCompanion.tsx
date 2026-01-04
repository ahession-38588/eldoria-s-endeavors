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
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: 'url(#watercolor)' }}
    >
      <defs>
        {/* Watercolor effect filter */}
        <filter id="watercolor" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
        
        {/* Soft gradient for fur */}
        <radialGradient id="catFur" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(35, 70%, 75%)" />
          <stop offset="100%" stopColor="hsl(30, 55%, 60%)" />
        </radialGradient>
        
        <radialGradient id="catBelly" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(40, 60%, 92%)" />
          <stop offset="100%" stopColor="hsl(35, 50%, 82%)" />
        </radialGradient>
      </defs>
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <g className="sparkles">
          <circle cx="20" cy="25" r="3" fill="hsl(45, 90%, 70%)" className="sparkle-1" opacity="0.8" />
          <circle cx="80" cy="20" r="2.5" fill="hsl(200, 70%, 80%)" className="sparkle-2" opacity="0.8" />
          <circle cx="15" cy="50" r="2" fill="hsl(340, 60%, 80%)" className="sparkle-3" opacity="0.7" />
          <circle cx="85" cy="45" r="2" fill="hsl(145, 50%, 70%)" className="sparkle-4" opacity="0.7" />
        </g>
      )}
      
      {/* Cushion - soft and round */}
      <ellipse cx="50" cy="82" rx="35" ry="12" fill="hsl(340, 45%, 75%)" opacity="0.8" />
      <ellipse cx="50" cy="80" rx="32" ry="10" fill="hsl(340, 50%, 82%)" opacity="0.9" />
      
      {/* Cat body - soft rounded shape */}
      <ellipse cx="50" cy="62" rx="22" ry="18" fill="url(#catFur)" />
      <ellipse cx="50" cy="68" rx="16" ry="10" fill="url(#catBelly)" opacity="0.9" />
      
      {/* Tail - curvy and soft */}
      <path 
        d="M 72 60 Q 82 55 85 45 Q 88 38 82 35" 
        stroke="hsl(30, 55%, 60%)" 
        strokeWidth="6" 
        strokeLinecap="round"
        fill="none"
        className={cn((isCelebrating || isExcited) && "tail-wag")}
      />
      
      {/* Head - round and soft */}
      <ellipse cx="50" cy="38" rx="20" ry="18" fill="url(#catFur)" />
      
      {/* Ears */}
      <path d="M 32 28 Q 35 15 42 22" fill="hsl(35, 65%, 70%)" />
      <path d="M 35 25 Q 37 18 41 23" fill="hsl(340, 50%, 80%)" opacity="0.6" />
      <path d="M 68 28 Q 65 15 58 22" fill="hsl(35, 65%, 70%)" />
      <path d="M 65 25 Q 63 18 59 23" fill="hsl(340, 50%, 80%)" opacity="0.6" />
      
      {/* Face details */}
      {/* Eyes */}
      {isSleepy ? (
        <>
          <path d="M 42 38 Q 45 40 48 38" stroke="hsl(25, 40%, 35%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 52 38 Q 55 40 58 38" stroke="hsl(25, 40%, 35%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <ellipse cx="43" cy="36" rx="5" ry="6" fill="hsl(145, 50%, 35%)" />
          <circle cx="44" cy="35" r="2" fill="white" opacity="0.8" />
          <ellipse cx="57" cy="36" rx="5" ry="6" fill="hsl(145, 50%, 35%)" />
          <circle cx="58" cy="35" r="2" fill="white" opacity="0.8" />
        </>
      ) : (
        <>
          <ellipse cx="43" cy="36" rx="4" ry="5" fill="hsl(145, 50%, 35%)" className="character-blink" />
          <circle cx="44" cy="35" r="1.5" fill="white" opacity="0.7" />
          <ellipse cx="57" cy="36" rx="4" ry="5" fill="hsl(145, 50%, 35%)" className="character-blink" />
          <circle cx="58" cy="35" r="1.5" fill="white" opacity="0.7" />
        </>
      )}
      
      {/* Nose */}
      <ellipse cx="50" cy="44" rx="3" ry="2" fill="hsl(350, 60%, 70%)" />
      
      {/* Mouth */}
      <path d="M 50 46 Q 50 48 47 48" stroke="hsl(25, 40%, 40%)" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M 50 46 Q 50 48 53 48" stroke="hsl(25, 40%, 40%)" strokeWidth="1" fill="none" strokeLinecap="round" />
      
      {/* Whiskers */}
      <g stroke="hsl(25, 30%, 50%)" strokeWidth="0.8" opacity="0.6">
        <line x1="32" y1="42" x2="22" y2="40" />
        <line x1="32" y1="45" x2="22" y2="46" />
        <line x1="68" y1="42" x2="78" y2="40" />
        <line x1="68" y1="45" x2="78" y2="46" />
      </g>
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <ellipse cx="35" cy="43" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
          <ellipse cx="65" cy="43" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
        </>
      )}
      
      {/* Paws */}
      <ellipse cx="38" cy="75" rx="6" ry="4" fill="hsl(35, 50%, 65%)" className={cn(isTyping && "paw-knead-left")} />
      <ellipse cx="62" cy="75" rx="6" ry="4" fill="hsl(35, 50%, 65%)" className={cn(isTyping && "paw-knead-right")} />
      
      {/* Yarn ball */}
      <circle cx="22" cy="78" r="6" fill="hsl(200, 60%, 70%)" opacity="0.8" />
      <path d="M 18 76 Q 22 80 26 76" stroke="hsl(200, 50%, 55%)" strokeWidth="1" fill="none" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <g className="zzz" fill="hsl(200, 40%, 60%)" opacity="0.6">
          <text x="68" y="28" fontSize="8" fontFamily="Fredoka" className="zzz-1">z</text>
          <text x="75" y="20" fontSize="6" fontFamily="Fredoka" className="zzz-2">z</text>
          <text x="80" y="14" fontSize="5" fontFamily="Fredoka" className="zzz-3">z</text>
        </g>
      )}

      <style>{`
        .tail-wag {
          animation: tail-wag 0.4s ease-in-out infinite;
          transform-origin: 72px 60px;
        }
        
        @keyframes tail-wag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(15deg); }
        }
        
        .paw-knead-left {
          animation: paw-knead 1s ease-in-out infinite;
        }
        
        .paw-knead-right {
          animation: paw-knead 1s ease-in-out infinite 0.5s;
        }
        
        @keyframes paw-knead {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(0.9); }
        }
      `}</style>
    </svg>
  );
}
