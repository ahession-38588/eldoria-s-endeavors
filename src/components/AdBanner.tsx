import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-2 flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
          data-ad-client="ca-pub-4839522560085615"
          data-ad-slot="YOUR_AD_SLOT_ID"
        />
      </div>
    </div>
  );
};

export default AdBanner;
