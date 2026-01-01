import { FocusPane } from '@/components/FocusPane';
import { BodyDoublingPane } from '@/components/BodyDoublingPane';
import { ListsArea } from '@/components/ListsArea';
import { AppProvider } from '@/lib/AppContext';
import { Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <AppProvider>
      <div className="min-h-screen w-full starfield">
        {/* Header */}
        <header className="py-4 px-6 border-b border-border/30">
          <div className="max-w-[1800px] mx-auto flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl text-gradient">Fantasy Quest Log</h1>
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
            <div className="min-h-[400px] lg:min-h-[500px]">
              <ListsArea />
            </div>
          </div>
        </main>
      </div>
    </AppProvider>
  );
};

export default Index;
