import { Heart, Flame } from 'lucide-react';

export function BodyDoublingPane() {
  return (
    <div className="h-full flex flex-col mystical-card rounded-xl p-5 glow-border starfield">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Heart className="w-5 h-5 text-accent" />
        </div>
        <h2 className="font-display text-xl text-foreground glow-text">Companion</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        {/* Mystical orb */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 float-animation pulse-glow flex items-center justify-center">
            <Flame className="w-10 h-10 text-primary/80" />
          </div>
          {/* Ambient glow rings */}
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
          <div className="absolute -inset-2 rounded-full border border-accent/10 animate-pulse" />
        </div>

        <p className="text-lg font-display text-foreground/90 mb-2">
          You are not alone
        </p>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          A gentle presence accompanies you on your journey
        </p>
      </div>
    </div>
  );
}
