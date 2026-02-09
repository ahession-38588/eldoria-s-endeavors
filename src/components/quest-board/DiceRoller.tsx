import { useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled?: boolean;
}

export default function DiceRoller({ onRoll, disabled }: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);
  const [currentFace, setCurrentFace] = useState(0); // 0-5
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const roll = () => {
    if (rolling || disabled) return;
    setRolling(true);
    setLastRoll(null);

    // Animate through faces
    let ticks = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 6));
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        const result = Math.floor(Math.random() * 6) + 1;
        setCurrentFace(result - 1);
        setLastRoll(result);
        setRolling(false);
        onRoll(result);
      }
    }, 80);
  };

  const DiceIcon = DICE_ICONS[currentFace];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={roll}
        disabled={rolling || disabled}
        className={cn(
          "relative w-20 h-20 rounded-xl bg-card/80 backdrop-blur-sm border-2 border-primary/40 flex items-center justify-center transition-all hover:shadow-glow",
          rolling && "animate-bounce border-accent",
          disabled && "opacity-40 cursor-not-allowed",
          !rolling && !disabled && "hover:border-primary hover:scale-105 cursor-pointer"
        )}
      >
        <DiceIcon className={cn(
          "w-10 h-10 text-primary transition-transform",
          rolling && "animate-spin"
        )} />
      </button>
      <span className="text-xs text-muted-foreground font-medium">
        {rolling ? 'Rolling...' : disabled ? 'Add quests first!' : lastRoll ? `You rolled a ${lastRoll}!` : 'Roll the dice!'}
      </span>
    </div>
  );
}
