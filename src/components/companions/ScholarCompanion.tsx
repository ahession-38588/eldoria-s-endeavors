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
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: 'url(#watercolor-scholar)' }}
    >
      <defs>
        <filter id="watercolor-scholar" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        
        <radialGradient id="skinTone" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="hsl(25, 60%, 85%)" />
          <stop offset="100%" stopColor="hsl(25, 50%, 75%)" />
        </radialGradient>
        
        <linearGradient id="dressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 55%, 65%)" />
          <stop offset="100%" stopColor="hsl(200, 60%, 50%)" />
        </linearGradient>
        
        <radialGradient id="bookGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(45, 80%, 92%)" />
          <stop offset="100%" stopColor="hsl(40, 60%, 80%)" />
        </radialGradient>
      </defs>
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <g className="sparkles">
          <circle cx="18" cy="20" r="3" fill="hsl(45, 90%, 70%)" className="sparkle-1" opacity="0.8" />
          <circle cx="82" cy="25" r="2.5" fill="hsl(340, 60%, 80%)" className="sparkle-2" opacity="0.8" />
          <circle cx="25" cy="45" r="2" fill="hsl(145, 50%, 70%)" className="sparkle-3" opacity="0.7" />
          <circle cx="78" cy="55" r="2" fill="hsl(200, 60%, 75%)" className="sparkle-4" opacity="0.7" />
        </g>
      )}
      
      {/* Book/desk - open book */}
      <ellipse cx="50" cy="80" rx="30" ry="8" fill="hsl(25, 40%, 45%)" opacity="0.8" />
      <path d="M 25 75 Q 50 70 75 75 L 75 82 Q 50 78 25 82 Z" fill="url(#bookGlow)" />
      <path d="M 50 70 L 50 80" stroke="hsl(25, 30%, 50%)" strokeWidth="0.5" opacity="0.5" />
      {/* Book lines */}
      <g stroke="hsl(25, 30%, 60%)" strokeWidth="0.5" opacity="0.4">
        <line x1="30" y1="74" x2="45" y2="73" />
        <line x1="30" y1="76" x2="45" y2="75" />
        <line x1="55" y1="73" x2="70" y2="74" />
        <line x1="55" y1="75" x2="70" y2="76" />
      </g>
      
      {/* Body - soft dress */}
      <path d="M 35 50 Q 30 65 32 78 L 68 78 Q 70 65 65 50 Q 50 48 35 50" fill="url(#dressGradient)" />
      
      {/* Arms */}
      {isCelebrating ? (
        <>
          <path d="M 35 52 Q 25 45 20 35" stroke="url(#skinTone)" strokeWidth="8" fill="none" strokeLinecap="round" className="arm-wave-left" />
          <path d="M 65 52 Q 75 45 80 35" stroke="url(#skinTone)" strokeWidth="8" fill="none" strokeLinecap="round" className="arm-wave-right" />
        </>
      ) : (
        <>
          <path d="M 35 55 Q 30 65 35 72" stroke="hsl(25, 55%, 80%)" strokeWidth="7" fill="none" strokeLinecap="round" className={cn(isTyping && "animate-typing-left")} />
          <path d="M 65 55 Q 70 65 65 72" stroke="hsl(25, 55%, 80%)" strokeWidth="7" fill="none" strokeLinecap="round" className={cn(isTyping && "animate-typing-right")} />
        </>
      )}
      
      {/* Head */}
      <ellipse cx="50" cy="32" rx="16" ry="17" fill="url(#skinTone)" />
      
      {/* Hair - soft flowing */}
      <path d="M 34 30 Q 32 18 42 15 Q 50 12 58 15 Q 68 18 66 30 Q 68 35 65 40 L 66 55 Q 60 50 50 50 Q 40 50 34 55 L 35 40 Q 32 35 34 30" fill="hsl(25, 50%, 35%)" />
      <path d="M 36 28 Q 35 20 43 17 Q 50 15 57 17 Q 65 20 64 28" fill="hsl(25, 45%, 42%)" opacity="0.6" />
      
      {/* Face */}
      {/* Eyes */}
      {isSleepy ? (
        <>
          <path d="M 42 32 Q 45 34 48 32" stroke="hsl(25, 40%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 52 32 Q 55 34 58 32" stroke="hsl(25, 40%, 35%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <ellipse cx="44" cy="32" rx="4" ry="4.5" fill="hsl(25, 60%, 25%)" />
          <circle cx="45" cy="31" r="1.5" fill="white" opacity="0.8" />
          <ellipse cx="56" cy="32" rx="4" ry="4.5" fill="hsl(25, 60%, 25%)" />
          <circle cx="57" cy="31" r="1.5" fill="white" opacity="0.8" />
        </>
      ) : (
        <>
          <ellipse cx="44" cy="32" rx="3.5" ry="4" fill="hsl(25, 60%, 25%)" className="character-blink" />
          <circle cx="45" cy="31" r="1.2" fill="white" opacity="0.7" />
          <ellipse cx="56" cy="32" rx="3.5" ry="4" fill="hsl(25, 60%, 25%)" className="character-blink" />
          <circle cx="57" cy="31" r="1.2" fill="white" opacity="0.7" />
        </>
      )}
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <ellipse cx="38" cy="38" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
          <ellipse cx="62" cy="38" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
        </>
      )}
      
      {/* Mouth */}
      {isCelebrating || isExcited ? (
        <path d="M 47 40 Q 50 44 53 40" stroke="hsl(350, 50%, 55%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M 48 40 Q 50 42 52 40" stroke="hsl(350, 40%, 55%)" strokeWidth="1" fill="none" strokeLinecap="round" />
      )}
      
      {/* Tea cup */}
      <ellipse cx="82" cy="72" rx="6" ry="4" fill="hsl(40, 70%, 90%)" />
      <path d="M 76 68 Q 76 72 76 76 Q 78 78 82 78 Q 86 78 88 76 Q 88 72 88 68" fill="hsl(40, 60%, 85%)" />
      <ellipse cx="82" cy="68" rx="6" ry="3" fill="hsl(120, 30%, 65%)" opacity="0.7" />
      {isTyping && (
        <g opacity="0.5">
          <path d="M 80 64 Q 78 60 80 56" stroke="hsl(0, 0%, 80%)" strokeWidth="1" fill="none" className="animate-steam-1" />
          <path d="M 84 64 Q 86 58 84 54" stroke="hsl(0, 0%, 80%)" strokeWidth="1" fill="none" className="animate-steam-2" />
        </g>
      )}
      
      {/* Small plant */}
      <ellipse cx="18" cy="78" rx="5" ry="3" fill="hsl(25, 50%, 60%)" />
      <path d="M 18 75 Q 15 68 18 65" stroke="hsl(145, 45%, 50%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="66" rx="4" ry="3" fill="hsl(145, 50%, 55%)" />
      <ellipse cx="20" cy="68" rx="3" ry="2.5" fill="hsl(145, 45%, 60%)" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <g className="zzz" fill="hsl(200, 40%, 60%)" opacity="0.6">
          <text x="65" y="20" fontSize="8" fontFamily="Fredoka" className="zzz-1">z</text>
          <text x="72" y="14" fontSize="6" fontFamily="Fredoka" className="zzz-2">z</text>
          <text x="77" y="10" fontSize="5" fontFamily="Fredoka" className="zzz-3">z</text>
        </g>
      )}
    </svg>
  );
}
