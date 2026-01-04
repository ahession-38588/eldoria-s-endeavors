import { cn } from '@/lib/utils';
import { CompanionType } from '@/lib/types';
import { ScholarCompanion } from './companions/ScholarCompanion';
import { CatCompanion } from './companions/CatCompanion';
import { RobotCompanion } from './companions/RobotCompanion';
import { SpiritCompanion } from './companions/SpiritCompanion';

export type CompanionMood = 'idle' | 'working' | 'excited' | 'celebrating' | 'sleepy';

interface LofiCompanionProps {
  mood?: CompanionMood;
  progress?: number;
  companionType?: CompanionType;
}

export function LofiCompanion({ mood = 'working', progress = 0, companionType = 'scholar' }: LofiCompanionProps) {
  const isCelebrating = mood === 'celebrating';

  // Dynamic glow based on progress
  const glowIntensity = Math.min(0.2 + (progress / 100) * 0.3, 0.5);

  const renderCompanion = () => {
    switch (companionType) {
      case 'cat':
        return <CatCompanion mood={mood} />;
      case 'robot':
        return <RobotCompanion mood={mood} />;
      case 'spirit':
        return <SpiritCompanion mood={mood} />;
      case 'scholar':
      default:
        return <ScholarCompanion mood={mood} />;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[180px]">
      {/* Pixel art cottage background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 400 100" className="w-full h-full" style={{ imageRendering: 'pixelated' }} preserveAspectRatio="xMidYMax slice">
          {/* Sky gradient behind cottage */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(200, 70%, 88%)" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(145, 40%, 85%)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="400" height="100" fill="url(#skyGradient)" />
          
          {/* Distant hills */}
          <ellipse cx="80" cy="95" rx="100" ry="25" fill="hsl(145, 35%, 70%)" opacity="0.4" />
          <ellipse cx="320" cy="95" rx="120" ry="30" fill="hsl(145, 40%, 65%)" opacity="0.4" />
          
          {/* Ground/grass */}
          <rect x="0" y="80" width="400" height="20" fill="hsl(145, 45%, 55%)" />
          <ellipse cx="200" cy="82" rx="220" ry="8" fill="hsl(145, 50%, 60%)" />
          
          {/* Left cottage */}
          {/* Walls */}
          <rect x="20" y="50" width="50" height="35" fill="hsl(35, 55%, 85%)" />
          <rect x="20" y="50" width="50" height="4" fill="hsl(35, 45%, 75%)" />
          {/* Roof */}
          <polygon points="15,50 45,28 75,50" fill="hsl(15, 50%, 55%)" />
          <polygon points="17,50 45,30 73,50" fill="hsl(15, 55%, 60%)" />
          {/* Door */}
          <rect x="38" y="62" width="14" height="23" fill="hsl(25, 50%, 45%)" rx="2" />
          <circle cx="49" cy="74" r="1.5" fill="hsl(45, 70%, 65%)" />
          {/* Window */}
          <rect x="25" y="58" width="10" height="10" fill="hsl(200, 60%, 80%)" rx="1" />
          <line x1="30" y1="58" x2="30" y2="68" stroke="hsl(35, 40%, 70%)" strokeWidth="1" />
          <line x1="25" y1="63" x2="35" y2="63" stroke="hsl(35, 40%, 70%)" strokeWidth="1" />
          {/* Chimney */}
          <rect x="55" y="32" width="8" height="18" fill="hsl(15, 45%, 50%)" />
          <rect x="54" y="30" width="10" height="4" fill="hsl(15, 40%, 55%)" />
          {/* Smoke */}
          <circle cx="59" cy="24" r="3" fill="hsl(0, 0%, 90%)" opacity="0.5" className="smoke-1" />
          <circle cx="62" cy="18" r="2.5" fill="hsl(0, 0%, 90%)" opacity="0.4" className="smoke-2" />
          <circle cx="58" cy="12" r="2" fill="hsl(0, 0%, 90%)" opacity="0.3" className="smoke-3" />
          
          {/* Right cottage */}
          <rect x="300" y="55" width="45" height="30" fill="hsl(40, 50%, 88%)" />
          <rect x="300" y="55" width="45" height="3" fill="hsl(40, 40%, 78%)" />
          <polygon points="295,55 322,35 350,55" fill="hsl(120, 25%, 50%)" />
          <polygon points="297,55 322,37 348,55" fill="hsl(120, 30%, 55%)" />
          {/* Door */}
          <rect x="315" y="65" width="12" height="20" fill="hsl(30, 45%, 42%)" rx="1" />
          <circle cx="324" cy="76" r="1.2" fill="hsl(45, 65%, 60%)" />
          {/* Window */}
          <rect x="332" y="62" width="8" height="8" fill="hsl(200, 55%, 82%)" rx="1" />
          <line x1="336" y1="62" x2="336" y2="70" stroke="hsl(40, 35%, 72%)" strokeWidth="0.8" />
          
          {/* Trees */}
          {/* Left tree */}
          <rect x="90" y="55" width="6" height="30" fill="hsl(25, 45%, 40%)" />
          <ellipse cx="93" cy="45" rx="18" ry="22" fill="hsl(145, 45%, 50%)" />
          <ellipse cx="93" cy="42" rx="14" ry="16" fill="hsl(145, 50%, 58%)" opacity="0.8" />
          
          {/* Middle tree */}
          <rect x="180" y="50" width="8" height="35" fill="hsl(25, 50%, 38%)" />
          <ellipse cx="184" cy="38" rx="22" ry="26" fill="hsl(145, 40%, 48%)" />
          <ellipse cx="184" cy="35" rx="17" ry="18" fill="hsl(145, 45%, 55%)" opacity="0.8" />
          
          {/* Right tree */}
          <rect x="260" y="58" width="5" height="27" fill="hsl(25, 42%, 42%)" />
          <ellipse cx="262" cy="48" rx="15" ry="20" fill="hsl(145, 48%, 52%)" />
          <ellipse cx="262" cy="46" rx="11" ry="14" fill="hsl(145, 52%, 58%)" opacity="0.8" />
          
          {/* Flowers/bushes */}
          <ellipse cx="110" cy="82" rx="8" ry="5" fill="hsl(145, 40%, 52%)" />
          <circle cx="108" cy="79" r="2" fill="hsl(350, 60%, 75%)" />
          <circle cx="112" cy="80" r="1.5" fill="hsl(45, 70%, 75%)" />
          
          <ellipse cx="280" cy="83" rx="10" ry="6" fill="hsl(145, 42%, 50%)" />
          <circle cx="277" cy="80" r="2" fill="hsl(280, 50%, 75%)" />
          <circle cx="283" cy="79" r="1.8" fill="hsl(200, 55%, 75%)" />
          
          {/* Fence posts */}
          <rect x="130" y="72" width="3" height="13" fill="hsl(35, 40%, 55%)" />
          <rect x="140" y="72" width="3" height="13" fill="hsl(35, 40%, 55%)" />
          <rect x="150" y="72" width="3" height="13" fill="hsl(35, 40%, 55%)" />
          <rect x="128" y="75" width="28" height="2" fill="hsl(35, 35%, 50%)" />
          <rect x="128" y="80" width="28" height="2" fill="hsl(35, 35%, 50%)" />
          
          {/* Stepping stones */}
          <ellipse cx="45" cy="88" rx="5" ry="2.5" fill="hsl(35, 30%, 65%)" />
          <ellipse cx="55" cy="90" rx="4" ry="2" fill="hsl(35, 28%, 62%)" />
          <ellipse cx="65" cy="87" rx="4.5" ry="2.2" fill="hsl(35, 32%, 68%)" />
        </svg>
      </div>
      
      <div className={cn(
        "lofi-scene w-44 h-44 z-10",
        isCelebrating && "celebrating",
        mood === 'excited' && "excited",
        mood === 'sleepy' && "sleepy"
      )}>
        {renderCompanion()}
        
        {/* Ambient particles - now like dandelion seeds or fireflies */}
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
      
      {/* Soft glow behind character */}
      <div 
        className={cn(
          "absolute w-48 h-48 rounded-full blur-3xl -z-10 transition-all duration-1000",
          isCelebrating ? "bg-amber-200/30" : "bg-emerald-200/20"
        )}
        style={{ opacity: glowIntensity }}
      />

      <style>{`
        .lofi-scene {
          position: relative;
          animation: gentle-bob 5s ease-in-out infinite;
        }
        
        .lofi-scene.celebrating {
          animation: celebrate-bounce 0.6s ease-in-out infinite;
        }
        
        .lofi-scene.excited {
          animation: excited-bob 2.5s ease-in-out infinite;
        }
        
        .lofi-scene.sleepy {
          animation: sleepy-sway 7s ease-in-out infinite;
        }
        
        @keyframes gentle-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes celebrate-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.03); }
        }
        
        @keyframes excited-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-4px) rotate(-2deg); }
          75% { transform: translateY(-4px) rotate(2deg); }
        }
        
        @keyframes sleepy-sway {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(3px) rotate(-1deg); }
          75% { transform: translateY(3px) rotate(1deg); }
        }
        
        @keyframes typing-left {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
        }
        
        @keyframes typing-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        .animate-typing-left {
          animation: typing-left 0.5s ease-in-out infinite;
        }
        
        .animate-typing-right {
          animation: typing-right 0.5s ease-in-out infinite 0.15s;
        }
        
        .arm-wave-left, .arm-wave-right {
          animation: arm-wave 0.5s ease-in-out infinite;
          transform-origin: center;
        }
        
        .arm-wave-right {
          animation-delay: 0.25s;
        }
        
        @keyframes arm-wave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-5deg); }
        }
        
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; transform: scaleY(1); }
          95% { opacity: 0.8; transform: scaleY(0.1); }
        }
        
        .character-blink {
          animation: blink 4.5s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes steam {
          0%, 100% { opacity: 0.2; transform: translateY(0) scale(1); }
          50% { opacity: 0.5; transform: translateY(-5px) scale(1.3); }
        }
        
        .animate-steam-1 {
          animation: steam 3s ease-in-out infinite;
        }
        
        .animate-steam-2 {
          animation: steam 3s ease-in-out infinite 0.6s;
        }
        
        @keyframes screen-glow {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        .animate-screen-glow {
          animation: screen-glow 2.5s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        .sparkle-1 { animation: sparkle 1.2s ease-in-out infinite; }
        .sparkle-2 { animation: sparkle 1.2s ease-in-out infinite 0.2s; }
        .sparkle-3 { animation: sparkle 1.2s ease-in-out infinite 0.4s; }
        .sparkle-4 { animation: sparkle 1.2s ease-in-out infinite 0.6s; }
        
        @keyframes zzz {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 0.7; transform: translateY(-4px); }
        }
        
        .zzz-1 { animation: zzz 2.5s ease-in-out infinite; }
        .zzz-2 { animation: zzz 2.5s ease-in-out infinite 0.4s; }
        .zzz-3 { animation: zzz 2.5s ease-in-out infinite 0.8s; }
        
        @keyframes smoke {
          0%, 100% { opacity: 0.3; transform: translateY(0) translateX(0); }
          50% { opacity: 0.5; transform: translateY(-5px) translateX(3px); }
        }
        
        .smoke-1 { animation: smoke 4s ease-in-out infinite; }
        .smoke-2 { animation: smoke 4s ease-in-out infinite 0.5s; }
        .smoke-3 { animation: smoke 4s ease-in-out infinite 1s; }
        
        .ambient-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(45, 70%, 90%) 0%, hsl(45, 60%, 80%) 100%);
          box-shadow: 0 0 4px hsl(45, 60%, 85%);
        }
        
        .celebrating-particle {
          background: radial-gradient(circle, hsl(45, 90%, 85%) 0%, hsl(35, 80%, 70%) 100%);
          box-shadow: 0 0 8px hsl(45, 80%, 75%);
          width: 8px;
          height: 8px;
        }
        
        .particle-a {
          top: 10%;
          left: 8%;
          animation: float-particle 7s ease-in-out infinite;
        }
        
        .particle-b {
          top: 30%;
          right: 5%;
          animation: float-particle 6s ease-in-out infinite 1.2s;
        }
        
        .particle-c {
          bottom: 35%;
          left: 15%;
          animation: float-particle 8s ease-in-out infinite 2.4s;
        }
        
        .particle-d {
          top: 15%;
          right: 18%;
          animation: float-particle 5s ease-in-out infinite 0.6s;
        }
        
        .particle-e {
          bottom: 45%;
          right: 12%;
          animation: float-particle 6.5s ease-in-out infinite 1.8s;
        }
        
        @keyframes float-particle {
          0%, 100% { opacity: 0.3; transform: translateY(0) translateX(0) scale(0.8); }
          50% { opacity: 0.9; transform: translateY(-15px) translateX(5px) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
