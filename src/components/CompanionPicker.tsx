import { CompanionType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CompanionPickerProps {
  selected: CompanionType;
  onSelect: (type: CompanionType) => void;
  onClose: () => void;
}

const companions: { type: CompanionType; name: string; description: string }[] = [
  { type: 'scholar', name: 'Scholar', description: 'A studious companion at their desk' },
  { type: 'cat', name: 'Cat', description: 'A cozy feline friend' },
  { type: 'robot', name: 'Robot', description: 'A helpful mechanical buddy' },
  { type: 'spirit', name: 'Spirit', description: 'A mystical floating wisp' },
];

export function CompanionPicker({ selected, onSelect, onClose }: CompanionPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <h3 className="font-display text-lg text-foreground mb-4 text-center">
          Choose Your Companion
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {companions.map(({ type, name, description }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className={cn(
                "p-4 rounded-lg border-2 transition-all text-left",
                selected === type
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <div className="flex items-center justify-center mb-2">
                <CompanionPreview type={type} />
              </div>
              <p className="font-medium text-sm text-foreground text-center">{name}</p>
              <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>
            </button>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function CompanionPreview({ type }: { type: CompanionType }) {
  return (
    <div className="w-12 h-12">
      <svg
        viewBox="0 0 24 24"
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      >
        {type === 'scholar' && (
          <>
            <rect x="10" y="5" width="5" height="5" className="fill-[hsl(var(--starlight))]" />
            <rect x="9" y="4" width="7" height="2" className="fill-primary" />
            <rect x="11" y="7" width="1" height="1" className="fill-accent" />
            <rect x="13" y="7" width="1" height="1" className="fill-accent" />
            <rect x="11" y="10" width="3" height="5" className="fill-secondary" />
          </>
        )}
        {type === 'cat' && (
          <>
            <rect x="9" y="8" width="6" height="5" className="fill-glow-gold/90" />
            <rect x="9" y="6" width="2" height="2" className="fill-glow-gold/90" />
            <rect x="13" y="6" width="2" height="2" className="fill-glow-gold/90" />
            <rect x="10" y="10" width="1" height="1" className="fill-primary" />
            <rect x="13" y="10" width="1" height="1" className="fill-primary" />
            <rect x="12" y="11" width="1" height="1" className="fill-accent/70" />
          </>
        )}
        {type === 'robot' && (
          <>
            <rect x="8" y="6" width="8" height="6" className="fill-primary" />
            <rect x="8" y="12" width="8" height="6" className="fill-primary/80" />
            <rect x="11" y="3" width="2" height="3" className="fill-muted-foreground/60" />
            <rect x="10" y="3" width="4" height="1" className="fill-accent" />
            <rect x="9" y="8" width="2" height="2" className="fill-accent" />
            <rect x="13" y="8" width="2" height="2" className="fill-accent" />
          </>
        )}
        {type === 'spirit' && (
          <>
            <rect x="9" y="4" width="6" height="1" className="fill-starlight/80" />
            <rect x="8" y="5" width="8" height="1" className="fill-starlight" />
            <rect x="7" y="6" width="10" height="4" className="fill-primary" />
            <rect x="8" y="10" width="8" height="2" className="fill-primary/70" />
            <rect x="10" y="12" width="4" height="2" className="fill-primary/40" />
            <rect x="9" y="8" width="2" height="2" className="fill-accent" />
            <rect x="13" y="8" width="2" height="2" className="fill-accent" />
          </>
        )}
      </svg>
    </div>
  );
}
