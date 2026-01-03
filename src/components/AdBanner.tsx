const AdBanner = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-center gap-4">
        <div className="flex-1 flex items-center justify-center min-h-[60px] bg-muted/50 rounded border border-border/50">
          <span className="text-muted-foreground text-sm">Your Ad Here • 728x90 Banner Space</span>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
