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
      viewBox="0 0 100 100"
      className="w-full h-full"
      style={{ filter: 'url(#watercolor-robot)' }}
    >
      <defs>
        <filter id="watercolor-robot" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
        
        <linearGradient id="robotBody" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(200, 35%, 75%)" />
          <stop offset="100%" stopColor="hsl(200, 40%, 60%)" />
        </linearGradient>
        
        <radialGradient id="robotGlow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="hsl(180, 50%, 80%)" />
          <stop offset="100%" stopColor="hsl(200, 40%, 65%)" />
        </radialGradient>
        
        <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(145, 60%, 75%)" />
          <stop offset="100%" stopColor="hsl(145, 50%, 55%)" />
        </radialGradient>
      </defs>
      
      {/* Celebration sparkles */}
      {isCelebrating && (
        <g className="sparkles">
          <circle cx="15" cy="18" r="3" fill="hsl(45, 90%, 70%)" className="sparkle-1" opacity="0.8" />
          <circle cx="85" cy="22" r="2.5" fill="hsl(340, 60%, 80%)" className="sparkle-2" opacity="0.8" />
          <circle cx="20" cy="50" r="2" fill="hsl(180, 60%, 70%)" className="sparkle-3" opacity="0.7" />
          <circle cx="80" cy="55" r="2" fill="hsl(145, 50%, 70%)" className="sparkle-4" opacity="0.7" />
        </g>
      )}
      
      {/* Platform - grassy mound */}
      <ellipse cx="50" cy="88" rx="35" ry="8" fill="hsl(145, 40%, 50%)" opacity="0.8" />
      <ellipse cx="50" cy="86" rx="32" ry="6" fill="hsl(145, 45%, 60%)" opacity="0.9" />
      
      {/* Robot body - rounded and cute */}
      <ellipse cx="50" cy="60" rx="20" ry="22" fill="url(#robotBody)" />
      
      {/* Belly screen */}
      <ellipse cx="50" cy="60" rx="12" ry="10" fill="url(#screenGlow)" className={cn(
        (isCelebrating || isExcited) && "animate-screen-glow"
      )} />
      <ellipse cx="50" cy="58" rx="8" ry="6" fill="hsl(145, 70%, 85%)" opacity="0.5" />
      
      {/* Heart on screen */}
      {(isCelebrating || isExcited) && (
        <path d="M 50 56 Q 47 53 44 56 Q 44 60 50 65 Q 56 60 56 56 Q 53 53 50 56" fill="hsl(350, 65%, 70%)" opacity="0.8" />
      )}
      
      {/* Head - rounded */}
      <ellipse cx="50" cy="28" rx="18" ry="16" fill="url(#robotGlow)" />
      
      {/* Antenna */}
      <line x1="50" y1="12" x2="50" y2="6" stroke="hsl(200, 30%, 55%)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="5" r="4" fill={isCelebrating || isExcited ? "hsl(45, 80%, 65%)" : "hsl(180, 50%, 65%)"} className={cn(
        (isCelebrating || isExcited) && "antenna-blink"
      )} />
      
      {/* Ears/sensors */}
      <ellipse cx="30" cy="28" rx="5" ry="8" fill="hsl(200, 35%, 70%)" />
      <ellipse cx="70" cy="28" rx="5" ry="8" fill="hsl(200, 35%, 70%)" />
      
      {/* Eyes */}
      {isSleepy ? (
        <>
          <path d="M 40 28 Q 44 30 48 28" stroke="hsl(200, 50%, 40%)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 52 28 Q 56 30 60 28" stroke="hsl(200, 50%, 40%)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : isCelebrating || isExcited ? (
        <>
          <ellipse cx="42" cy="26" rx="6" ry="7" fill="hsl(40, 30%, 95%)" />
          <ellipse cx="42" cy="26" rx="4" ry="5" fill="hsl(200, 60%, 45%)" />
          <circle cx="43" cy="25" r="2" fill="white" opacity="0.8" />
          <ellipse cx="58" cy="26" rx="6" ry="7" fill="hsl(40, 30%, 95%)" />
          <ellipse cx="58" cy="26" rx="4" ry="5" fill="hsl(200, 60%, 45%)" />
          <circle cx="59" cy="25" r="2" fill="white" opacity="0.8" />
        </>
      ) : (
        <>
          <ellipse cx="42" cy="26" rx="5" ry="6" fill="hsl(40, 30%, 95%)" />
          <ellipse cx="42" cy="26" rx="3" ry="4" fill="hsl(200, 60%, 45%)" className="character-blink" />
          <circle cx="43" cy="25" r="1.5" fill="white" opacity="0.7" />
          <ellipse cx="58" cy="26" rx="5" ry="6" fill="hsl(40, 30%, 95%)" />
          <ellipse cx="58" cy="26" rx="3" ry="4" fill="hsl(200, 60%, 45%)" className="character-blink" />
          <circle cx="59" cy="25" r="1.5" fill="white" opacity="0.7" />
        </>
      )}
      
      {/* Blush */}
      {(isCelebrating || isExcited) && (
        <>
          <ellipse cx="35" cy="32" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
          <ellipse cx="65" cy="32" rx="4" ry="2.5" fill="hsl(350, 70%, 80%)" opacity="0.5" />
        </>
      )}
      
      {/* Mouth */}
      {isCelebrating || isExcited ? (
        <path d="M 44 36 Q 50 42 56 36" stroke="hsl(200, 40%, 45%)" strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <ellipse cx="50" cy="36" rx="4" ry="2" fill="hsl(200, 40%, 50%)" opacity="0.6" />
      )}
      
      {/* Arms */}
      {isCelebrating ? (
        <>
          <path d="M 30 55 Q 20 45 15 35" stroke="hsl(200, 35%, 65%)" strokeWidth="8" fill="none" strokeLinecap="round" className="arm-wave-left" />
          <circle cx="15" cy="35" r="5" fill="hsl(200, 40%, 70%)" className="arm-wave-left" />
          <path d="M 70 55 Q 80 45 85 35" stroke="hsl(200, 35%, 65%)" strokeWidth="8" fill="none" strokeLinecap="round" className="arm-wave-right" />
          <circle cx="85" cy="35" r="5" fill="hsl(200, 40%, 70%)" className="arm-wave-right" />
        </>
      ) : (
        <>
          <path d="M 30 50 Q 22 60 25 72" stroke="hsl(200, 35%, 65%)" strokeWidth="7" fill="none" strokeLinecap="round" className={cn(isTyping && "robot-arm-left")} />
          <circle cx="25" cy="72" r="4" fill="hsl(200, 40%, 70%)" className={cn(isTyping && "robot-arm-left")} />
          <path d="M 70 50 Q 78 60 75 72" stroke="hsl(200, 35%, 65%)" strokeWidth="7" fill="none" strokeLinecap="round" className={cn(isTyping && "robot-arm-right")} />
          <circle cx="75" cy="72" r="4" fill="hsl(200, 40%, 70%)" className={cn(isTyping && "robot-arm-right")} />
        </>
      )}
      
      {/* Feet */}
      <ellipse cx="40" cy="82" rx="8" ry="5" fill="hsl(200, 35%, 60%)" />
      <ellipse cx="60" cy="82" rx="8" ry="5" fill="hsl(200, 35%, 60%)" />
      
      {/* ZZZ for sleepy */}
      {isSleepy && (
        <g className="zzz" fill="hsl(200, 40%, 60%)" opacity="0.6">
          <text x="68" y="18" fontSize="8" fontFamily="Fredoka" className="zzz-1">z</text>
          <text x="75" y="12" fontSize="6" fontFamily="Fredoka" className="zzz-2">z</text>
          <text x="80" y="8" fontSize="5" fontFamily="Fredoka" className="zzz-3">z</text>
        </g>
      )}

      <style>{`
        .antenna-blink {
          animation: antenna-blink 0.6s ease-in-out infinite;
        }
        
        @keyframes antenna-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        
        .robot-arm-left {
          animation: robot-arm 0.6s ease-in-out infinite;
        }
        
        .robot-arm-right {
          animation: robot-arm 0.6s ease-in-out infinite 0.3s;
        }
        
        @keyframes robot-arm {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      `}</style>
    </svg>
  );
}
