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
  const glowIntensity = Math.min(0.3 + (progress / 100) * 0.4, 0.7);

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
      <div className={cn(
        "lofi-scene w-40 h-40",
        isCelebrating && "celebrating",
        mood === 'excited' && "excited",
        mood === 'sleepy' && "sleepy"
      )}>
        {renderCompanion()}
        
        {/* Ambient particles */}
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
        }
        
        @keyframes typing-right {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1px); }
        }
        
        .animate-typing-left {
          animation: typing-left 0.4s ease-in-out infinite;
        }
        
        .animate-typing-right {
          animation: typing-right 0.4s ease-in-out infinite 0.1s;
        }
        
        .arm-wave-left, .arm-wave-right {
          animation: arm-wave 0.4s ease-in-out infinite;
        }
        
        .arm-wave-right {
          animation-delay: 0.2s;
        }
        
        @keyframes arm-wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
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
        
        @keyframes zzz {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 0.6; transform: translateY(-2px); }
        }
        
        .zzz-1 { animation: zzz 2s ease-in-out infinite; }
        .zzz-2 { animation: zzz 2s ease-in-out infinite 0.3s; }
        
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
