import { FocusPane } from '@/components/FocusPane';
import { BodyDoublingPane } from '@/components/BodyDoublingPane';
import { ListsArea } from '@/components/ListsArea';

import { Sparkles, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdBanner from '@/components/AdBanner';
import pixelSkyBg from '@/assets/pixel-sky-bg.png';

const Index = () => {
  return (
    <div 
        className="min-h-screen w-full"
        style={{
          backgroundImage: `url(${pixelSkyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          imageRendering: 'pixelated'
        }}
      >
        {/* Header */}
        <header className="py-4 px-6 border-b border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="max-w-[1800px] mx-auto flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-accent" />
            <h1 className="font-display text-2xl text-gradient">Fantasy Quest Log</h1>
            <div className="ml-auto">
              <Link
                to="/stats"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 md:p-6">
          <div className="max-w-[1800px] mx-auto space-y-4 md:space-y-6">
            {/* Top row - Focus and Body Doubling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="min-h-[300px] lg:min-h-[350px]">
                <FocusPane />
              </div>
              <div className="min-h-[300px] lg:min-h-[350px]">
                <BodyDoublingPane />
              </div>
            </div>

            {/* Bottom row - Lists */}
            <div className="min-h-[400px] lg:min-h-[500px] pb-20">
              <ListsArea />
            </div>
          </div>
        </main>
        
        <AdBanner />
      </div>
  );
};

export default Index;
